const Blog = require("../models/blog.model.js");
const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    res.send("Something went wrong while generating referesh and access token");
  }
};

const blog_index = (req, res) => {
  console.log("req.isLogedIn = ",req.cookies.isLogedIn);
  
  Blog.find()
    .sort({ createdAt: -1 })
    .then((data) => res.render("index", { title: "All Blogs", blogs: data ,isLogedIn :req.cookies.isLogedIn}))
    .catch((err) => console.log("database save error", err));
};

const blog_details = (req, res) => {
  const blog = new Blog({
    title: req.body.title,
    snippet: req.body.snippet,
    body: req.body.body,
    owner: req.user._id,
  });
  // const blog = new Blog(req.body)
  blog
    .save()
    .then((data) => res.redirect("/blogs"))
    .catch((err) => console.log("database save error", err));
};

const blog_create_get = (req, res) => {
  res.render("create", { title: "Create a new blog",isLogedIn :req.cookies.isLogedIn });
};

const blog_create_post = (req, res) => {
  const id = req.params.id;
  console.log(id);
  Blog.findById(id)
    .then((data) =>
      res.render("details", { title: `Blog | ${id}`, blog: data ,isLogedIn :req.cookies.isLogedIn})
    )
    .catch((err) => console.log(err));
};

const blog_delete = (req, res) => {
  const id = req.params.id;

  Blog.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/blogs" }); //   cannot redirect on server . need to redirect from frontend
    })
    .catch((err) => {
      res.status(404).render("404", { title: "404" ,isLogedIn :req.cookies.isLogedIn});
    });
};

const getRegister = (req, res) => {
  res.render("register", { title: "Registar",isLogedIn :req.cookies.isLogedIn });
};

const getLogin = (req, res) => {
  res.render("login", { title: "Login",isLogedIn :req.cookies.isLogedIn });
};

const postRegister = async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("email: ", email);
  // check if user already exists: username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { fullname }],
  });

  if (existedUser) {
    res.send("User with username or email already existed");
    return;
  }

  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    res.send("Something went wrong while registering the user");
    return;
  }
  res.redirect("/login");
};

const postLogin = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(password, email);

  if (!username && !email) {
    res.send("Username or email is required !");
    return;
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  console.log("user ", user);

  if (!user) {
    res.send("User does not exist !");
    return;
  }
  const ispasswordValid = await user.isPasswordCorrect(password);

  if (!ispasswordValid) {
    res.send("Password is incorrect");
    return;
  }

  const { refreshToken, accessToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // select all fields except -givenFields  ;

  const options = {
    httpOnly: true, // cookies only modified by server not accesible by front end
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("isLogedIn", true, options)
    .redirect("/blogs");
};

const userBlog = async (req, res) => {
  console.log(req.user._id);
  Blog.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .then((data) =>
      res.render("myBlog", {
        title: "All Blogs",
        blogs: data,
        user: req.user.username,
        isLogedIn :req.cookies.isLogedIn
      })
    )
    .catch((err) => console.log("database save error", err));
};
const userLogout = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .clearCookie("isLogedIn", options)
    .redirect("/blogs");
};
const myBlogDetails = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  Blog.findById(id)
    .then((data) =>
      res.render("myBlogDetails", { title: `Blog | ${id}`, blog: data ,isLogedIn :req.cookies.isLogedIn})
    )
    .catch((err) => console.log(err));
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete,
  getRegister,
  getLogin,
  postRegister,
  postLogin,
  userBlog,
  userLogout,
  myBlogDetails,
};
