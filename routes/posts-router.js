const express = require("express");
const router = express.Router();
const Post = require("../modules/dbConfig");

const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const slugify = require("slugify");

const dompurify = createDomPurify(new JSDOM().window);

router
    .get("/new", (req, res) => {
        res.render("new", { post: new Post() });
    })
    .get("/edit/:id", async(req, res) => {
        const post = await Post.findById(req.params.id);
        res.render("edit", { post: post });
    })
    .get("/display/:slug", async(req, res) => {
        const post = await Post.findOne({ slug: req.params.slug });
        if (post === null) res.redirect("/");
        res.render("display", { post: post });
    })
    .post("/search", async(req, res) => {
        const resPerPage = 6; // results per page
        const page = req.query.page || 1; // Page
        const posts = await Post.find({
                $text: { $search: req.body.search },
            })
            .limit(resPerPage)
            .skip(resPerPage * page - resPerPage)
            .sort({ createdAt: "desc" });

        const postCount = posts.length;

        if (posts.length < 1) res.redirect("/");
        else
            res.render("index", {
                posts: posts,
                currentPage: page,
                pages: Math.ceil(postCount / resPerPage),
            });
    })
    .post(
        "/",
        async(req, res, next) => {
            req.post = new Post();
            next();
        },
        savePostandRedirect("new")
    )
    .put(
        "/:id",
        async(req, res, next) => {
            req.post = await Post.findById(req.params.id);
            next();
        },
        savePostandRedirect("edit")
    )
    .delete("/:id", async(req, res) => {
        await Post.findByIdAndDelete(req.params.id);
        res.redirect("/");
    });

function savePostandRedirect(path) {
    return async(req, res) => {
        let sanitizedPost = dompurify.sanitize(req.body.main_post);
        let titleSlug = slugify(req.body.title, { lower: true, strict: true });

        let post = req.post;
        post.title = req.body.title;
        post.slug = titleSlug;
        post.snippet = req.body.snippet;
        post.main_post = sanitizedPost;

        try {
            post = await post.save();
            res.redirect(`/display/${post.slug}`);
        } catch (error) {
            res.render(`new/${path}`, { post: post });
        }
    };
}
module.exports = router;