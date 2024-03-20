const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // console.log("errrrgffgnfjgfj");
    console.log(req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    console.log("knhkjbkbk");
    if (!token) {
      return res.status(401).send({
        message: "Auth failed 1",
        success: false,
      });
    }
 
    const decodedToken = jwt.verify(token, process.env.jwt_secret);
    
    req.params.userId = decodedToken.userId;
    next();
  } catch (error) {
    res.status(401).send({
      message: "Auth failed 2",
      success: false,
    });
  }
};
