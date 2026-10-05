const Feedback = require("../models/Feedback");

// =====================================================
// SUBMIT FEEDBACK & RATING (Public / Logged-in)
// =====================================================
const submitFeedback = async (req, res) => {
  try {
    const { rating, category, message, device } = req.body;
    let { name, email } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "કૃપા કરીને ૧ થી ૫ વચ્ચે સ્ટાર રેટિંગ પસંદ કરો.",
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "કૃપા કરીને તમારું સૂચન કે પ્રતિસાદ લખો.",
      });
    }

    if (req.user) {
      if (!name || name.trim().length === 0) {
        name = req.user.name || "ભક્ત";
      }
      if (!email) {
        email = req.user.email || "";
      }
    } else {
      if (!name || name.trim().length === 0) {
        name = "અનામી સાધક";
      }
    }

    const validCategories = ["suggestion", "feedback", "bug", "appreciation"];
    const finalCategory = validCategories.includes(category)
      ? category
      : "feedback";

    const feedback = await Feedback.create({
      userId: req.userId || null,
      name: name.trim(),
      email: email ? email.trim() : "",
      rating: Number(rating),
      category: finalCategory,
      message: message.trim(),
      device: device || "",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "તમારો પ્રતિસાદ અને રેટિંગ સફળતાપૂર્વક સબમિટ થયો છે. ધન્યવાદ!",
      feedback: {
        _id: feedback._id,
        name: feedback.name,
        rating: feedback.rating,
        category: feedback.category,
        message: feedback.message,
        createdAt: feedback.createdAt,
      },
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
    const feedbacks = await Feedback.find({ status: "active" })
      .sort({ createdAt: -1 })
      .select("name rating category message createdAt")
      .limit(20)
      .lean();

    const allRatings = await Feedback.find(
      { status: "active" },
      "rating category"
    ).lean();

    const totalCount = allRatings.length;
    let sum = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const categoryCounts = {
      suggestion: 0,
      feedback: 0,
      bug: 0,
      appreciation: 0,
    };

    allRatings.forEach((item) => {
      const r = item.rating;
      sum += r;
      if (distribution[r] !== undefined) {
        distribution[r] += 1;
      }
      if (categoryCounts[item.category] !== undefined) {
        categoryCounts[item.category] += 1;
      }
    });

    const averageRating = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : 5.0;

    return res.status(200).json({
      success: true,
      stats: {
        totalCount,
        averageRating,
        distribution,
        categoryCounts,
        recentReviews: feedbacks,
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
    const limit = parseInt(req.query.limit) || 20;
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

    const [feedbacks, totalCount, allActive] = await Promise.all([
      Feedback.find(filter)
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments(filter),
      Feedback.find({}, "rating category").lean(),
    ]);

    // Calculate overall stats for summary cards
    let sum = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const categoryCounts = {
      suggestion: 0,
      feedback: 0,
      bug: 0,
      appreciation: 0,
    };

    allActive.forEach((item) => {
      sum += item.rating || 0;
      if (distribution[item.rating] !== undefined) {
        distribution[item.rating] += 1;
      }
      if (categoryCounts[item.category] !== undefined) {
        categoryCounts[item.category] += 1;
      }
    });

    const averageRating =
      allActive.length > 0 ? Number((sum / allActive.length).toFixed(1)) : 5.0;

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
          totalFeedbacks: allActive.length,
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
  submitFeedback,
  getFeedbackStats,
  getAdminFeedbacks,
  deleteFeedback,
};
