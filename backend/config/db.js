const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    let mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
    if (!mongoUri) {
      throw new Error(
        "Neither MONGO_URI nor MONGODB_URI is set in environment variables"
      );
    }

    // Auto-fix typo in database name (bhagaDvad_gita -> bhagavad_gita)
    if (mongoUri.includes("bhagaDvad_gita")) {
      mongoUri = mongoUri.replace("bhagaDvad_gita", "bhagavad_gita");
    }

    // Auto-fix common malformed query param typos (e.g. ?appName-Cluster0 -> ?appName=Cluster0)
    if (mongoUri.includes("?appName-") || mongoUri.includes("&appName-")) {
      mongoUri = mongoUri.replace("?appName-", "?appName=").replace("&appName-", "&appName=");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB Connected Successfully ✅");
  } catch (error) {
    console.error("MongoDB Connection Failed ❌");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;