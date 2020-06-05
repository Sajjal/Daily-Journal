const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");

const postRouter = require("../routes/posts-router");
const Post = require("./dbConfig");

const app = express();

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/journal", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

let port = process.env.PORT || 3500;

app.use("/", postRouter);

module.exports = {
    renderHTML: function() {
        app.get("*", async function(req, res) {
            const resPerPage = 6; // results per page
            const page = req.query.page || 1; // Page
            const postCount = await Post.countDocuments();

            const posts = await Post.find()
                .limit(resPerPage)
                .skip(resPerPage * page - resPerPage)
                .sort({ createdAt: "desc" });

            res.render("index", {
                posts: posts,
                currentPage: page,
                pages: Math.ceil(postCount / resPerPage),
            });
        });

        app.listen(port, function() {
            return console.log(`Listening on localhost:${port}`);
        });
    },
};