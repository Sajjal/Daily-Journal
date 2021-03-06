const jwt = require("jsonwebtoken");
const InvalidTokens = require("../model/Tokens");

module.exports = async function (req, res, next) {
  const token = req.cookies.accessToken;
  //New login:
  //if (!token) return res.status(400).render("newLogin", { message: "Enter Access Code" });
  //Old Login:
  if (!token) return res.status(400).render("login", { message: "Please Login or Register" });

  //Check if the token is in InvalidToken DataBase
  checkInvalidToken = await InvalidTokens.find({ invalidToken: token });
  if (checkInvalidToken.length > 0) {
    invalidToken = checkInvalidToken[0].invalidToken;
    if (invalidToken === token) return res.status(400).render("login", { message: "Please Login or Register" });
  }

  //Verify token and Allow access if Everything is good
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch {
    //New login:
    //res.status(400).render("newLogin", { message: "Enter Access Code" });
    //Old Login
    res.status(400).render("login", { message: "Please Login or Register" });
  }
};
