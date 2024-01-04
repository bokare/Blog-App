// in this controllers are seperately written then use

const blogRouter = require("../controllers/blogController.js");
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/auth.js")

router.get("/blogs",blogRouter.blog_index);
router.post("/blogs",verifyJWT, blogRouter.blog_details);

router.get("/blogs/create", verifyJWT,blogRouter.blog_create_get);
router.get("/blogs/:id", blogRouter.blog_create_post);
router.delete("/blogs/:id", blogRouter.blog_delete);



module.exports = router;
