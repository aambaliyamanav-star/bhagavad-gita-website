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

    const userRatingDoc = await Rating.findOne({ userId: req.userId }).lean();

    if (!userRatingDoc) {
      return res.status(200).json({
        success: true,
        hasRated: false,
        rating: 0,
        isLocked: false,
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

    // 1. Text message is COMPULSORY for every submission (first time or updating)
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "કૃપા કરીને આપનો પ્રતિસાદ અથવા સૂચન અવશ્ય લખો (લખાણ ફરજિયાત છે).",
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
    let previousRating = null;
    let isUpdatedRating = false;

    // Handle Star Rating logic (Strictly 1 per account, lockable at 5)
    if (req.userId && finalRatingNum >= 1 && finalRatingNum <= 5) {
      let existingRating = await Rating.findOne({ userId: req.userId });

      if (existingRating) {
        previousRating = existingRating.rating;
        if (existingRating.isLocked || existingRating.rating === 5) {
          // Already locked at 5 stars! Cannot be changed.
          isRatingLocked = true;
          finalRatingNum = 5;
        } else {
          // Update existing rating with old vs new tracking
          if (previousRating !== finalRatingNum) {
            isUpdatedRating = true;
          }
          existingRating.previousRating = previousRating;
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
          previousRating: null,
          isLocked: lockNow,
        });
        isRatingLocked = lockNow;
        ratingUpdated = true;
      }
    } else if (req.userId) {
      const existingRating = await Rating.findOne({ userId: req.userId });
      if (existingRating) {
        finalRatingNum = existingRating.rating;
        previousRating = existingRating.previousRating || null;
        isRatingLocked = existingRating.isLocked;
      }
    }

    const validCategories = ["suggestion", "feedback", "bug", "appreciation"];
    const finalCategory = validCategories.includes(category)
      ? category
      : "suggestion";

    const savedFeedback = await Feedback.create({
      userId: req.userId || null,
      name,
      email,
      rating: finalRatingNum > 0 ? finalRatingNum : 5,
      previousRating: isUpdatedRating ? previousRating : null,
      isUpdatedRating: isUpdatedRating,
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
// GET PUBLIC STATS & RECENT REVIEWS
// =====================================================
const getFeedbackStats = async (req, res) => {
  try {
    // 1. Calculate ratings from Rating collection (Unique 1 per user)
    const allRatings = await Rating.find({}, "rating").lean();
    let totalRatings = allRatings.length;
    let sum = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    allRatings.forEach((item) => {
      const r = item.rating;
      sum += r;
      if (distribution[r] !== undefined) {
        distribution[r] += 1;
      }
    });

    // Fallback: If Rating collection has few entries, also aggregate distinct ratings from Feedbacks
    if (totalRatings === 0) {
      const feedbacks = await Feedback.find({ status: "active" }, "rating").lean();
      totalRatings = feedbacks.length;
      feedbacks.forEach((item) => {
        sum += item.rating;
        if (distribution[item.rating] !== undefined) {
          distribution[item.rating] += 1;
        }
      });
    }

    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 5.0;

    // 2. Calculate category counts from Feedbacks (Suggestions, bugs, etc.)
    const categoryCounts = {
      suggestion: await Feedback.countDocuments({ category: "suggestion" }),
      feedback: await Feedback.countDocuments({ category: "feedback" }),
      bug: await Feedback.countDocuments({ category: "bug" }),
      appreciation: await Feedback.countDocuments({ category: "appreciation" }),
    };

    const totalFeedbacks = await Feedback.countDocuments({ status: "active" });

    // 3. Latest reviews for public showcase
    const recentReviews = await Feedback.find({ status: "active" })
      .sort({ createdAt: -1 })
      .select("name rating category message createdAt")
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      stats: {
        totalCount: totalRatings,
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

    // Mark whether each feedback is the user's latest feedback
    const seenUsers = new Set();
    const feedbacks = rawFeedbacks.map((fb) => {
      const userKey = fb.userId?._id
        ? String(fb.userId._id)
        : (fb.email ? `email:${fb.email.toLowerCase()}` : `fb:${fb._id}`);
      let isLatest = false;
      if (!seenUsers.has(userKey)) {
        seenUsers.add(userKey);
        isLatest = true;
      }
      return {
        ...fb,
        isLatestUserFeedback: isLatest,
      };
    });

    // Calculate rating metrics from unique Ratings collection
    const allRatings = await Rating.find({}, "rating").lean();
    let totalRatings = allRatings.length;
    let sum = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    allRatings.forEach((item) => {
      sum += item.rating;
      if (distribution[item.rating] !== undefined) {
        distribution[item.rating] += 1;
      }
    });

    if (totalRatings === 0) {
      // Fallback to feedback entries if no Rating docs yet
      const allFbs = await Feedback.find({}, "rating").lean();
      totalRatings = allFbs.length;
      allFbs.forEach((item) => {
        sum += item.rating;
        if (distribution[item.rating] !== undefined) {
          distribution[item.rating] += 1;
        }
      });
    }

    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 5.0;

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
          totalRatings,
          totalFeedbacks: await Feedback.countDocuments({}),
          averageRating,
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
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "ફીડબેક મળ્યો નથી.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "પ્રતિસાદ સફળતાપૂર્વક ડિલીટ થયો.",
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
