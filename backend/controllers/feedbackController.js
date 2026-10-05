const Feedback = require("../models/Feedback");
const Rating = require("../models/Rating");

// =====================================================
// GET CURRENT USER RATING & LOCK STATUS
// =====================================================
const getMyRating = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(200).json({
        success: true,
        hasRated: false,
        rating: 0,
        isLocked: false,
      });
    }

    // Check if user has an active feedback
    const activeFeedback = await Feedback.findOne({
      userId: req.userId,
      status: "active",
    });

    if (!activeFeedback) {
      // If user has no active feedback in the system, clean up any orphaned Rating document!
      await Rating.deleteMany({ userId: req.userId });
      return res.status(200).json({
        success: true,
        hasRated: false,
        rating: 0,
        isLocked: false,
      });
    }

    const userRatingDoc = await Rating.findOne({ userId: req.userId }).lean();

    if (!userRatingDoc) {
      return res.status(200).json({
        success: true,
        hasRated: true,
        rating: activeFeedback.rating,
        isLocked: activeFeedback.rating === 5,
      });
    }

    return res.status(200).json({
      success: true,
      hasRated: true,
      rating: userRatingDoc.rating,
      isLocked: Boolean(userRatingDoc.isLocked || userRatingDoc.rating === 5),
    });
  } catch (error) {
    console.error("Get My Rating Error:", error);
    return res.status(500).json({
      success: false,
      message: "રેટિંગ માહિતી મેળવવામાં સમસ્યા આવી.",
    });
  }
};

// =====================================================
// SUBMIT FEEDBACK / SUGGESTION / RATING
// =====================================================
const submitFeedback = async (req, res) => {
  try {
    const { category, message, device } = req.body;
    let { rating, name, email } = req.body;

    // 1. Enforce compulsory message/text
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "કૃપા કરીને તમારું સૂચન કે પ્રતિસાદ લખો (લખાણ લખવું ફરજિયાત છે).",
      });
    }

    // Handle user identification
    if (req.user) {
      name = name && name.trim().length > 0 ? name.trim() : (req.user.name || "ભક્ત");
      email = req.user.email || email || "";
    } else {
      name = name && name.trim().length > 0 ? name.trim() : "અનામી સાધક";
      email = email ? email.trim() : "";
    }

    let finalRatingNum = rating !== undefined && rating !== null ? Number(rating) : 0;
    let isRatingLocked = false;
    let ratingUpdated = false;

    // Handle Star Rating logic (Strictly 1 per account, lockable at 5)
    if (req.userId && finalRatingNum >= 1 && finalRatingNum <= 5) {
      let existingRating = await Rating.findOne({ userId: req.userId });

      if (existingRating) {
        if (existingRating.isLocked || existingRating.rating === 5) {
          // Already locked at 5 stars! Cannot be changed.
          isRatingLocked = true;
          finalRatingNum = 5;
        } else {
          // Update existing rating without creating a duplicate count!
          const oldRatingVal = existingRating.rating;
          existingRating.previousRating = oldRatingVal;
          existingRating.rating = finalRatingNum;
          existingRating.userName = name;
          existingRating.userEmail = email;
          if (finalRatingNum === 5) {
            existingRating.isLocked = true;
            isRatingLocked = true;
          }
          await existingRating.save();
          ratingUpdated = true;
        }
      } else {
        // First-time rating for this user account
        const lockNow = finalRatingNum === 5;
        await Rating.create({
          userId: req.userId,
          userName: name,
          userEmail: email,
          rating: finalRatingNum,
          isLocked: lockNow,
        });
        isRatingLocked = lockNow;
        ratingUpdated = true;
      }
    } else if (req.userId) {
      // If user didn't specify rating in this submission, fetch their current rating if exists
      const existingRating = await Rating.findOne({ userId: req.userId });
      if (existingRating) {
        finalRatingNum = existingRating.rating;
        isRatingLocked = existingRating.isLocked;
      }
    }

    // Handle Suggestion / Message submission (Always saved in Feedback collection!)
    const validCategories = ["suggestion", "feedback", "bug", "appreciation"];
    const finalCategory = validCategories.includes(category)
      ? category
      : "suggestion";

    // If user is updating, find their earlier feedback to populate previousMessage & previousRating
    let prevFeedbackMessage = "";
    let prevFeedbackRating = null;

    const userCriteria = [];
    if (req.userId) userCriteria.push({ userId: req.userId });
    if (email && email.trim().length > 0) userCriteria.push({ email: email.toLowerCase().trim() });

    if (userCriteria.length > 0) {
      const lastFb = await Feedback.findOne({
        $or: userCriteria,
        status: "active",
      }).sort({ createdAt: -1 });

      if (lastFb) {
        prevFeedbackMessage = lastFb.message || "";
        prevFeedbackRating = lastFb.rating || null;
      }
    }

    const savedFeedback = await Feedback.create({
      userId: req.userId || null,
      name,
      email,
      rating: finalRatingNum > 0 ? finalRatingNum : 5,
      previousRating: prevFeedbackRating,
      previousMessage: prevFeedbackMessage,
      isUpdatedRating: ratingUpdated || Boolean(prevFeedbackRating),
      category: finalCategory,
      message: message.trim(),
      device: device || "",
      status: "active",
    });

    let responseMessage = "આપનો પ્રતિસાદ સફળતાપૂર્વક સબમિટ થયો છે. ધન્યવાદ!";
    if (ratingUpdated && isRatingLocked) {
      responseMessage = "૫-સ્ટાર રેટિંગ અને પ્રતિસાદ સફળતાપૂર્વક સબમિટ થયો. આપનું ૫-સ્ટાર રેટિંગ હવે લૉક થઈ ગયું છે. ખૂબ ખૂબ ધન્યવાદ!";
    } else if (ratingUpdated) {
      responseMessage = "તમારું રેટિંગ સફળતાપૂર્વક અપડેટ થયું છે.";
    }

    return res.status(201).json({
      success: true,
      message: responseMessage,
      isLocked: isRatingLocked,
      currentRating: finalRatingNum,
      feedback: savedFeedback,
    });
  } catch (error) {
    console.error("Submit Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "પ્રતિસાદ સબમિટ કરવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.",
    });
  }
};

// =====================================================
// HELPER: CALCULATE UNIQUE LATEST RATINGS PER USER
// Guarantees each user is counted EXACTLY ONCE with their NEWEST rating!
// No matter how many times a user updates their rating,
// ONLY the latest rating is included in the average and total rating count.
// =====================================================
const calculateUniqueLatestRatings = async () => {
  const userRatingsMap = new Map();
  const seenUserIds = new Set();
  const seenEmails = new Set();

  // 1. Gather all active feedbacks sorted newest first (createdAt: -1)
  const allFeedbacks = await Feedback.find({
    status: "active",
    rating: { $gte: 1, $lte: 5 },
  })
    .sort({ createdAt: -1 })
    .lean();

  allFeedbacks.forEach((fb) => {
    const uid = fb.userId ? String(fb.userId) : null;
    const email = fb.email && fb.email.trim() ? fb.email.toLowerCase().trim() : null;

    const alreadySeen = (uid && seenUserIds.has(uid)) || (email && seenEmails.has(email));

    if (!alreadySeen) {
      if (uid) seenUserIds.add(uid);
      if (email) seenEmails.add(email);

      const uniqueKey = uid || (email ? `email:${email}` : `fb:${fb._id}`);
      userRatingsMap.set(uniqueKey, fb.rating);
    }
  });

  // If no active feedbacks remain, ensure Rating collection is also completely purged
  if (allFeedbacks.length === 0) {
    await Rating.deleteMany({});
  }

  const ratings = Array.from(userRatingsMap.values());
  const totalCount = ratings.length;
  let sum = 0;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  ratings.forEach((r) => {
    sum += r;
    if (distribution[r] !== undefined) {
      distribution[r] += 1;
    }
  });

  const averageRating = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : 0;

  return {
    totalRatings: totalCount,
    averageRating,
    distribution,
  };
};

// =====================================================
// GET PUBLIC STATS & RECENT REVIEWS
// =====================================================
const getFeedbackStats = async (req, res) => {
  try {
    const { totalRatings, averageRating, distribution } = await calculateUniqueLatestRatings();

    const categoryCounts = {
      suggestion: await Feedback.countDocuments({ category: "suggestion" }),
      feedback: await Feedback.countDocuments({ category: "feedback" }),
      bug: await Feedback.countDocuments({ category: "bug" }),
      appreciation: await Feedback.countDocuments({ category: "appreciation" }),
    };

    const totalFeedbacks = await Feedback.countDocuments({ status: "active" });

    const recentReviews = await Feedback.find({ status: "active" })
      .sort({ createdAt: -1 })
      .select("name rating category message createdAt")
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      stats: {
        totalCount: totalRatings, // Only unique users' latest ratings counted!
        totalFeedbacks,
        averageRating,
        distribution,
        categoryCounts,
        recentReviews,
      },
    });
  } catch (error) {
    console.error("Get Feedback Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "રેટિંગ માહિતી મેળવવામાં સમસ્યા આવી.",
    });
  }
};

// =====================================================
// GET ADMIN FEEDBACK LIST (Admin Only)
// =====================================================
const getAdminFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const { category, rating, search } = req.query;
    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (rating && rating !== "all") {
      filter.rating = Number(rating);
    }

    if (search && search.trim().length > 0) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { message: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [rawFeedbacks, totalCount] = await Promise.all([
      Feedback.find(filter)
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments(filter),
    ]);

    // Mark whether each feedback is the user's latest feedback and ensure previousRating and previousMessage are populated
    const seenUsers = new Set();
    const feedbacks = await Promise.all(
      rawFeedbacks.map(async (fb) => {
        const userKey = fb.userId?._id
          ? String(fb.userId._id)
          : (fb.email ? `email:${fb.email.toLowerCase()}` : `fb:${fb._id}`);
        let isLatest = false;
        if (!seenUsers.has(userKey)) {
          seenUsers.add(userKey);
          isLatest = true;
        }

        let prevMsg = fb.previousMessage || "";
        let prevRating = fb.previousRating || null;

        // If either previousMessage or previousRating is empty, search for earlier feedback from same user
        if (!prevMsg && (fb.userId?._id || fb.email)) {
          const userFilter = fb.userId?._id
            ? { userId: fb.userId._id }
            : { email: fb.email.toLowerCase() };

          const olderFeedback = await Feedback.findOne({
            ...userFilter,
            _id: { $ne: fb._id },
            createdAt: { $lt: fb.createdAt },
          })
            .sort({ createdAt: -1 })
            .lean();

          if (olderFeedback) {
            prevMsg = olderFeedback.message || "";
            if (!prevRating && olderFeedback.rating) {
              prevRating = olderFeedback.rating;
            }
          }
        }

        return {
          ...fb,
          previousMessage: prevMsg,
          previousRating: prevRating,
          isLatestUserFeedback: isLatest,
        };
      })
    );

    // Calculate rating metrics from unique latest ratings
    const { totalRatings, averageRating, distribution } = await calculateUniqueLatestRatings();

    const categoryCounts = {
      suggestion: await Feedback.countDocuments({ category: "suggestion" }),
      feedback: await Feedback.countDocuments({ category: "feedback" }),
      bug: await Feedback.countDocuments({ category: "bug" }),
      appreciation: await Feedback.countDocuments({ category: "appreciation" }),
    };

    return res.status(200).json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit) || 1,
          totalCount,
          limit,
        },
        summary: {
          totalRatings, // UNIQUE USERS WITH ONLY LATEST RATINGS COUNTED
          totalFeedbacks: await Feedback.countDocuments({}),
          averageRating, // AVERAGE OF ONLY LATEST RATINGS
          distribution,
          categoryCounts,
        },
      },
    });
  } catch (error) {
    console.error("Get Admin Feedbacks Error:", error);
    return res.status(500).json({
      success: false,
      message: "ફીડબેક લિસ્ટ મેળવવામાં સમસ્યા આવી.",
    });
  }
};

// =====================================================
// DELETE FEEDBACK (Admin Only)
// =====================================================
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "ફીડબેક મળ્યો નથી.",
      });
    }

    const userId = feedback.userId ? String(feedback.userId) : null;
    const userEmail = feedback.email && feedback.email.trim() ? feedback.email.toLowerCase().trim() : null;

    // 1. Delete all feedbacks from this user so no stale entries remain
    const userFilter = [];
    if (userId) userFilter.push({ userId });
    if (userEmail) userFilter.push({ email: userEmail });

    if (userFilter.length > 0) {
      await Feedback.deleteMany({ $or: userFilter });
    } else {
      await Feedback.findByIdAndDelete(id);
    }

    // 2. Delete user's rating record completely so they can give a fresh rating again!
    if (userId) {
      await Rating.deleteMany({ userId });
    }
    if (userEmail) {
      await Rating.deleteMany({ userEmail });
    }

    // 3. Recalculate unique latest rating stats immediately
    const { totalRatings, averageRating, distribution } = await calculateUniqueLatestRatings();

    const categoryCounts = {
      suggestion: await Feedback.countDocuments({ category: "suggestion" }),
      feedback: await Feedback.countDocuments({ category: "feedback" }),
      bug: await Feedback.countDocuments({ category: "bug" }),
      appreciation: await Feedback.countDocuments({ category: "appreciation" }),
    };

    const totalFeedbacks = await Feedback.countDocuments({});

    return res.status(200).json({
      success: true,
      message: "પ્રતિસાદ સફળતાપૂર્વક ડિલીટ થયો અને યુઝર ફરીથી રેટિંગ આપી શકશે.",
      deletedId: id,
      deletedUserId: userId,
      deletedUserEmail: userEmail,
      summary: {
        totalRatings,
        totalFeedbacks,
        averageRating,
        distribution,
        categoryCounts,
      },
    });
  } catch (error) {
    console.error("Delete Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "પ્રતિસાદ ડિલીટ કરવામાં સમસ્યા આવી.",
    });
  }
};

module.exports = {
  getMyRating,
  submitFeedback,
  getFeedbackStats,
  getAdminFeedbacks,
  deleteFeedback,
};
