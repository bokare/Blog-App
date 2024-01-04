// in this controllers are seperately written then use

const userRouter = require("../controllers/blogController.js");
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/auth.js")

router.get("/register",userRouter.getRegister);
router.get("/login", userRouter.getLogin);
router.post("/register", userRouter.postRegister);
router.post("/login", userRouter.postLogin);
router.get('/user/blogs',verifyJWT,userRouter.userBlog)
router.get('/user/logout',verifyJWT,userRouter.userLogout)
router.get("/user/blogs/:id", userRouter.myBlogDetails);



module.exports = router;



