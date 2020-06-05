const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    snippet: {
        type: String,
    },
    main_post: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
});

postSchema.index({ "$**": "text" });

module.exports = mongoose.model("Post", postSchema);