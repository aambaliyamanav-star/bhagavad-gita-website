const QuizQuestion = require("../models/QuizQuestion");
const QuizResult = require("../models/QuizResult");

// =====================================================
// SHUFFLE ARRAY
// Fisher-Yates Shuffle
// =====================================================

const shuffleQuestions = (items) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
};


// =====================================================
// GET QUIZ QUESTIONS
// =====================================================

const getQuizQuestions = async (req, res) => {
  try {
    const {
      category,
      chapter,
      limit,
    } = req.query;

    // =================================================
    // BASE QUERY
    // =================================================

    const query = {
      isActive: true,
    };

    // =================================================
    // CHAPTER FILTER
    // =================================================

    if (
      chapter &&
      chapter !== "all"
    ) {
      const chapterNumber =
        Number(chapter);

      if (
        Number.isInteger(chapterNumber) &&
        chapterNumber >= 1 &&
        chapterNumber <= 18
      ) {
        query.chapterNumber =
          chapterNumber;
      }
    }

    // =================================================
    // CATEGORY FILTER
    // =================================================

    if (
      category &&
      category !== "all"
    ) {
      query.category =
        category;
    }

    // =================================================
    // FETCH QUESTIONS
    // =================================================

    let questions =
      await QuizQuestion.find(query);

    // =================================================
    // RANDOMIZE QUESTIONS
    // =================================================
    //
    // દરેક Quiz attempt વખતે questions
    // અલગ random orderમાં આવશે.
    //
    // Fisher-Yates shuffle વાપરવામાં આવ્યો છે.
    //
    // એક જ fetch થયેલા questionsમાં
    // duplicate question નહીં આવે.
    //
    // =================================================

    questions =
      shuffleQuestions(
        questions
      );

    // =================================================
    // LIMIT
    // =================================================

    const questionLimit =
      Number(limit) || 10;

    questions =
      questions.slice(
        0,
        questionLimit
      );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      count:
        questions.length,

      questions,
    });

  } catch (error) {
    console.error(
      "❌ Get Quiz Questions Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Quiz questions load કરવામાં error આવ્યો.",
    });
  }
};


// =====================================================
// GET SINGLE QUIZ QUESTION
// =====================================================

const getQuizQuestionById = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const question =
      await QuizQuestion.findOne({
        _id: id,
        isActive: true,
      });

    if (!question) {
      return res.status(404).json({
        success: false,

        message:
          "Quiz question મળ્યો નથી.",
      });
    }

    return res.status(200).json({
      success: true,

      question,
    });

  } catch (error) {
    console.error(
      "❌ Get Quiz Question Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Quiz question load કરવામાં error આવ્યો.",
    });
  }
};


// =====================================================
// SUBMIT QUIZ
// =====================================================

const submitQuiz = async (
  req,
  res
) => {
  try {
    // =================================================
    // USER
    // =================================================

    const userId =
      req.user._id;

    // =================================================
    // REQUEST DATA
    // =================================================

    const {
      category,
      chapter,
      answers,
      timeTaken,
    } = req.body;

    // =================================================
    // VALIDATE ANSWERS
    // =================================================

    if (
      !Array.isArray(answers)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Quiz answers યોગ્ય નથી.",
      });
    }

    if (
      answers.length === 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "કોઈ answer submit કરવામાં આવ્યો નથી.",
      });
    }

    // =================================================
    // QUESTION IDS
    // =================================================

    const questionIds =
      answers
        .map(
          (item) =>
            item.questionId
        )
        .filter(Boolean);

    if (
      questionIds.length === 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Valid question IDs મળ્યા નથી.",
      });
    }

    // =================================================
    // GET QUESTIONS FROM DATABASE
    // =================================================

    const questions =
      await QuizQuestion.find({
        _id: {
          $in: questionIds,
        },
      });

    // =================================================
    // SCORE VARIABLES
    // =================================================

    let correctAnswers = 0;

    let wrongAnswers = 0;

    let skippedQuestions = 0;

    // =================================================
    // CHECK EVERY ANSWER
    // =================================================

    const checkedAnswers =
      answers.map(
        (userAnswer) => {

          // -------------------------------------------
          // FIND QUESTION
          // -------------------------------------------

          const question =
            questions.find(
              (item) =>
                String(item._id) ===
                String(
                  userAnswer.questionId
                )
            );

          // -------------------------------------------
          // QUESTION NOT FOUND
          // -------------------------------------------

          if (!question) {
            return {
              questionId:
                userAnswer.questionId,

              selectedAnswer:
                userAnswer.selectedAnswer ||
                "",

              correctAnswer: "",

              isCorrect: false,
            };
          }

          // -------------------------------------------
          // SELECTED ANSWER
          // -------------------------------------------

          const selectedAnswer =
            String(
              userAnswer.selectedAnswer ||
                ""
            ).trim();

          // -------------------------------------------
          // CORRECT ANSWER
          // -------------------------------------------

          const correctAnswer =
            String(
              question.correctAnswer ||
                ""
            ).trim();

          // -------------------------------------------
          // SKIPPED
          // -------------------------------------------

          if (!selectedAnswer) {
            skippedQuestions++;

            return {
              questionId:
                question._id,

              selectedAnswer: "",

              correctAnswer,

              isCorrect: false,
            };
          }

          // -------------------------------------------
          // ANSWER CHECK
          // -------------------------------------------

          const isCorrect =
            selectedAnswer
              .toLowerCase() ===
            correctAnswer
              .toLowerCase();

          // -------------------------------------------
          // SCORE
          // -------------------------------------------

          if (isCorrect) {
            correctAnswers++;
          } else {
            wrongAnswers++;
          }

          // -------------------------------------------
          // RETURN
          // -------------------------------------------

          return {
            questionId:
              question._id,

            selectedAnswer,

            correctAnswer,

            isCorrect,
          };
        }
      );

    // =================================================
    // TOTAL QUESTIONS
    // =================================================

    const totalQuestions =
      answers.length;

    // =================================================
    // SCORE
    // =================================================

    const score =
      correctAnswers;

    // =================================================
    // PERCENTAGE
    // =================================================

    const percentage =
      totalQuestions > 0
        ? Math.round(
            (
              correctAnswers /
              totalQuestions
            ) * 100
          )
        : 0;

    // =================================================
    // CHAPTER NUMBER
    // =================================================

    let finalChapterNumber =
      null;

    if (
      chapter &&
      chapter !== "all"
    ) {
      const parsedChapter =
        Number(chapter);

      if (
        Number.isInteger(
          parsedChapter
        ) &&
        parsedChapter >= 1 &&
        parsedChapter <= 18
      ) {
        finalChapterNumber =
          parsedChapter;
      }
    }

    // =================================================
    // FINAL CATEGORY
    // =================================================

    const finalCategory =
      category || "all";

    // =================================================
    // SAVE NEW QUIZ ATTEMPT
    // =================================================

    const result =
      await QuizResult.create({
        user: userId,

        category:
          finalCategory,

        chapterNumber:
          finalChapterNumber,

        totalQuestions,

        correctAnswers,

        wrongAnswers,

        skippedQuestions,

        score,

        percentage,

        timeTaken:
          Number(timeTaken) || 0,

        answers:
          checkedAnswers,

        completed: true,
      });

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Quiz successfully submit થયો. 🎉",

      result: {
        id: result._id,

        _id: result._id,

        category:
          result.category,

        chapterNumber:
          result.chapterNumber,

        totalQuestions:
          result.totalQuestions,

        correctAnswers:
          result.correctAnswers,

        wrongAnswers:
          result.wrongAnswers,

        skippedQuestions:
          result.skippedQuestions,

        score:
          result.score,

        percentage:
          result.percentage,

        timeTaken:
          result.timeTaken,

        createdAt:
          result.createdAt,
      },
    });

  } catch (error) {
    console.error(
      "❌ Submit Quiz Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Quiz submit કરવામાં error આવ્યો.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};


// =====================================================
// GET MY QUIZ RESULTS
// =====================================================

const getMyQuizResults = async (
  req,
  res
) => {
  try {
    const userId =
      req.user._id;

    const results =
      await QuizResult.find({
        user: userId,
      })
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count:
        results.length,

      results,
    });

  } catch (error) {
    console.error(
      "❌ Get Quiz Results Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Quiz results load કરવામાં error આવ્યો.",
    });
  }
};


// =====================================================
// GET SINGLE RESULT
// =====================================================

const getQuizResultById = async (
  req,
  res
) => {
  try {
    const userId =
      req.user._id;

    const { id } =
      req.params;

    const result =
      await QuizResult.findOne({
        _id: id,
        user: userId,
      });

    if (!result) {
      return res.status(404).json({
        success: false,

        message:
          "Quiz result મળ્યું નથી.",
      });
    }

    return res.status(200).json({
      success: true,

      result,
    });

  } catch (error) {
    console.error(
      "❌ Get Quiz Result Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Quiz result load કરવામાં error આવ્યો.",
    });
  }
};


// =====================================================
// ADMIN - GET ALL QUESTIONS
// =====================================================

const getAllQuizQuestionsAdmin =
  async (req, res) => {
    try {
      const {
        category,
        chapter,
      } = req.query;

      const query = {};

      // =================================================
      // CATEGORY
      // =================================================

      if (
        category &&
        category !== "all"
      ) {
        query.category =
          category;
      }

      // =================================================
      // CHAPTER
      // =================================================

      if (
        chapter &&
        chapter !== "all"
      ) {
        const chapterNumber =
          Number(chapter);

        if (
          Number.isInteger(
            chapterNumber
          ) &&
          chapterNumber >= 1 &&
          chapterNumber <= 18
        ) {
          query.chapterNumber =
            chapterNumber;
        }
      }

      // =================================================
      // FETCH
      // =================================================

      const questions =
        await QuizQuestion.find(
          query
        ).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,

        count:
          questions.length,

        questions,
      });

    } catch (error) {
      console.error(
        "❌ Admin Get Quiz Questions Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Admin quiz questions load કરવામાં error આવ્યો.",
      });
    }
  };


// =====================================================
// ADMIN - ADD QUESTION
// =====================================================

const addQuizQuestion = async (
  req,
  res
) => {
  try {
    const {
      category,
      chapterNumber,
      question,
      options,
      correctAnswer,
      explanation,
    } = req.body;

    // =================================================
    // CATEGORY
    // =================================================

    if (!category) {
      return res.status(400).json({
        success: false,

        message:
          "Category જરૂરી છે.",
      });
    }

    // =================================================
    // CHAPTER
    // =================================================

    let finalChapterNumber =
      null;

    if (
      chapterNumber !== undefined &&
      chapterNumber !== null &&
      chapterNumber !== "" &&
      chapterNumber !== "all"
    ) {
      const parsedChapter =
        Number(chapterNumber);

      if (
        !Number.isInteger(
          parsedChapter
        ) ||
        parsedChapter < 1 ||
        parsedChapter > 18
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Chapter number 1 થી 18 વચ્ચે હોવો જોઈએ.",
        });
      }

      finalChapterNumber =
        parsedChapter;
    }

    // =================================================
    // AUTO CHAPTER FROM CATEGORY
    // =================================================

    if (
      category.startsWith(
        "chapter-"
      )
    ) {
      const categoryChapter =
        Number(
          category.replace(
            "chapter-",
            ""
          )
        );

      if (
        categoryChapter >= 1 &&
        categoryChapter <= 18
      ) {
        if (
          finalChapterNumber === null
        ) {
          finalChapterNumber =
            categoryChapter;
        } else if (
          finalChapterNumber !==
          categoryChapter
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Category અને Chapter number match હોવા જોઈએ.",
          });
        }
      }
    }

    // =================================================
    // QUESTION
    // =================================================

    if (
      !question ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Question જરૂરી છે.",
      });
    }

    // =================================================
    // OPTIONS
    // =================================================

    if (
      !Array.isArray(options) ||
      options.length !== 4
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Exactly 4 options જરૂરી છે.",
      });
    }

    const cleanOptions =
      options.map(
        (option) =>
          String(option).trim()
      );

    if (
      cleanOptions.some(
        (option) => !option
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "ચારેય options ભરવા જરૂરી છે.",
      });
    }

    // =================================================
    // CORRECT ANSWER
    // =================================================

    if (
      !correctAnswer ||
      !String(correctAnswer).trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Correct answer જરૂરી છે.",
      });
    }

    const cleanCorrectAnswer =
      String(
        correctAnswer
      ).trim();

    // =================================================
    // VERIFY CORRECT ANSWER
    // =================================================

    const answerExists =
      cleanOptions.some(
        (option) =>
          option.toLowerCase() ===
          cleanCorrectAnswer.toLowerCase()
      );

    if (!answerExists) {
      return res.status(400).json({
        success: false,

        message:
          "Correct answer options માંથી જ હોવો જોઈએ.",
      });
    }

    // =================================================
    // CREATE
    // =================================================

    const newQuestion =
      await QuizQuestion.create({
        category,

        chapterNumber:
          finalChapterNumber,

        question:
          question.trim(),

        options:
          cleanOptions,

        correctAnswer:
          cleanCorrectAnswer,

        explanation:
          explanation
            ? String(
                explanation
              ).trim()
            : "",

        isActive: true,
      });

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Quiz question successfully add થયો. ✅",

      question:
        newQuestion,
    });

  } catch (error) {
    console.error(
      "❌ Admin Add Quiz Question Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Quiz question add કરવામાં error આવ્યો.",
    });
  }
};


// =====================================================
// ADMIN - UPDATE QUESTION
// =====================================================

const updateQuizQuestion =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        category,
        chapterNumber,
        question,
        options,
        correctAnswer,
        explanation,
      } = req.body;

      // =================================================
      // FIND
      // =================================================

      const existingQuestion =
        await QuizQuestion.findById(
          id
        );

      if (!existingQuestion) {
        return res.status(404).json({
          success: false,

          message:
            "Quiz question મળ્યો નથી.",
        });
      }

      // =================================================
      // CATEGORY
      // =================================================

      if (!category) {
        return res.status(400).json({
          success: false,

          message:
            "Category જરૂરી છે.",
        });
      }

      // =================================================
      // CHAPTER
      // =================================================

      let finalChapterNumber =
        null;

      if (
        chapterNumber !== undefined &&
        chapterNumber !== null &&
        chapterNumber !== "" &&
        chapterNumber !== "all"
      ) {
        const parsedChapter =
          Number(chapterNumber);

        if (
          !Number.isInteger(
            parsedChapter
          ) ||
          parsedChapter < 1 ||
          parsedChapter > 18
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Chapter number 1 થી 18 વચ્ચે હોવો જોઈએ.",
          });
        }

        finalChapterNumber =
          parsedChapter;
      }

      // =================================================
      // AUTO CHAPTER
      // =================================================

      if (
        category.startsWith(
          "chapter-"
        )
      ) {
        const categoryChapter =
          Number(
            category.replace(
              "chapter-",
              ""
            )
          );

        if (
          categoryChapter >= 1 &&
          categoryChapter <= 18
        ) {
          if (
            finalChapterNumber === null
          ) {
            finalChapterNumber =
              categoryChapter;
          } else if (
            finalChapterNumber !==
            categoryChapter
          ) {
            return res.status(400).json({
              success: false,

              message:
                "Category અને Chapter number match હોવા જોઈએ.",
            });
          }
        }
      }

      // =================================================
      // QUESTION
      // =================================================

      if (
        !question ||
        !question.trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Question જરૂરી છે.",
        });
      }

      // =================================================
      // OPTIONS
      // =================================================

      if (
        !Array.isArray(options) ||
        options.length !== 4
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Exactly 4 options જરૂરી છે.",
        });
      }

      const cleanOptions =
        options.map(
          (option) =>
            String(option).trim()
        );

      if (
        cleanOptions.some(
          (option) => !option
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "ચારેય options ભરવા જરૂરી છે.",
        });
      }

      // =================================================
      // CORRECT ANSWER
      // =================================================

      if (
        !correctAnswer ||
        !String(correctAnswer).trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Correct answer જરૂરી છે.",
        });
      }

      const cleanCorrectAnswer =
        String(
          correctAnswer
        ).trim();

      // =================================================
      // VERIFY ANSWER
      // =================================================

      const answerExists =
        cleanOptions.some(
          (option) =>
            option.toLowerCase() ===
            cleanCorrectAnswer.toLowerCase()
        );

      if (!answerExists) {
        return res.status(400).json({
          success: false,

          message:
            "Correct answer options માંથી જ હોવો જોઈએ.",
        });
      }

      // =================================================
      // UPDATE
      // =================================================

      existingQuestion.category =
        category;

      existingQuestion.chapterNumber =
        finalChapterNumber;

      existingQuestion.question =
        question.trim();

      existingQuestion.options =
        cleanOptions;

      existingQuestion.correctAnswer =
        cleanCorrectAnswer;

      existingQuestion.explanation =
        explanation
          ? String(
              explanation
            ).trim()
          : "";

      await existingQuestion.save();

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        success: true,

        message:
          "Quiz question successfully update થયો. ✅",

        question:
          existingQuestion,
      });

    } catch (error) {
      console.error(
        "❌ Admin Update Quiz Question Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Quiz question update કરવામાં error આવ્યો.",
      });
    }
  };


// =====================================================
// ADMIN - DELETE QUESTION
// =====================================================

const deleteQuizQuestion =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const question =
        await QuizQuestion.findById(
          id
        );

      if (!question) {
        return res.status(404).json({
          success: false,

          message:
            "Quiz question મળ્યો નથી.",
        });
      }

      await QuizQuestion.findByIdAndDelete(
        id
      );

      return res.status(200).json({
        success: true,

        message:
          "Quiz question successfully delete થયો. 🗑️",
      });

    } catch (error) {
      console.error(
        "❌ Admin Delete Quiz Question Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Quiz question delete કરવામાં error આવ્યો.",
      });
    }
  };


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getQuizQuestions,

  getQuizQuestionById,

  submitQuiz,

  getMyQuizResults,

  getQuizResultById,

  // Admin
  getAllQuizQuestionsAdmin,

  addQuizQuestion,

  updateQuizQuestion,

  deleteQuizQuestion,
};