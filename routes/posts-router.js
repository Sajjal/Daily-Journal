const express = require("express");
const router = express.Router();

const verify = require("../modules/verifyToken");
const Post = require("../model/Posts");

const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const slugify = require("slugify");

const dompurify = createDomPurify(new JSDOM().window);

router.get("/", verify, async function (req, res) {
  const resPerPage = 6; // results per page
  const page = req.query.page || 1; // Page
  const postCount = await Post.countDocuments();
  const user = req.user._id;

  const posts = await Post.find({ user: user })
    .limit(resPerPage)
    .skip(resPerPage * page - resPerPage)
    .sort({ createdAt: "desc" });

  res.render("index", {
    posts: posts,
    currentPage: page,
    pages: Math.ceil(postCount / resPerPage),
  });
});

router.get("/new", verify, (req, res) => {
  res.render("new", { post: new Post() });
});

router.get("/edit/:id", verify, async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render("edit", { post: post });
});

router.get("/display/:slug", verify, async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug });
  if (post === null) res.redirect("/");
  res.render("display", { post: post });
});

router.post("/search", verify, async (req, res) => {
  const resPerPage = 6; // results per page
  const page = req.query.page || 1; // Page
  const user = req.user._id;

  const posts = await Post.find({
    user: user,
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
});

router.post("/", verify, async (req, res, next) => {
  req.post = new Post();
  next();
},
  savePostandRedirect("new")
);

router.put("/:id", verify, async (req, res, next) => {
  req.post = await Post.findById(req.params.id);
  next();
},
  savePostandRedirect("edit")
);

router.delete("/:id", verify, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

function savePostandRedirect(path) {
  return (verify, async (req, res) => {
    let sanitizedPost = dompurify.sanitize(req.body.main_post);
    let titleSlug = slugify(req.body.title, { lower: true, strict: true });
    user = req.user._id;

    let post = req.post;
    post.user = user;
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
  }
  );
}
module.exports = router;
