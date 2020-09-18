const router = require("express").Router();
const Users = require("../model/Users");
const InvalidTokens = require("../model/Tokens");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  //Check if user already Exists
  const userExists = await Users.findOne({ email: req.body.email });
  if (userExists) return res.status(400).render("login", { message: "Email already Exists! Try Log in!" });

  //Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //Creating new user
  const user = new Users({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.render("login", { message: "Registration Complete! Please Login" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  //Check if user is in DataBase
  const user = await Users.findOne({ email: req.body.email });
  if (!user) return res.status(400).render("login", { message: "Error: Invalid Email!" });

  //Check for valid password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).render("login", { message: "Error: Invalid Password!" });

  //If everything is valid Create and assign a token. Token Expires in 12 hours
  const accessToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "43200s",
  });

  //Save accessToken to Client's Browser Cookie and Redirect to Dashboard
  res.cookie("accessToken", accessToken).redirect("/dashboard");
  //res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict" }).status(200).redirect("/dashboard");
});

router.post("/logout", async (req, res) => {
  //Saving user token to DataBase as Invalid token logout
  const token = req.cookies.accessToken;
  if (!token) return res.redirect("/");

  const invalidTokens = new InvalidTokens({ invalidToken: token });

  try {
    await invalidTokens.save();
    res.render("login", { message: "You are now Logged Out!" });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
