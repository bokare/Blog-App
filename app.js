//  using routes
const express = require("express");
const morgan = require("morgan"); // third party middleware to print path , method, ip add of client
const app = express();
require("dotenv").config({ path: "./.env" });
let mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const blogRoute = require("./routes/blogRoute.js"); //   2 second routes where controllers used
const userRoute = require("./routes/userRoute.js"); 
// register view engine
app.set("view engine", "ejs");

const port = 3000;
const database_string = process.env.MONGO_URI;
mongoose
  .connect(database_string)
  .then((result) => {
    console.log("Databse Connected !!");
    app.listen(port, () => {
      console.log("Server is listening on port ", port);
    });
  })
  .catch((err) => {
    console.log("database connection Error :: ", err);
  });

// third party middleware to print path , method, ip add of client
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true })); // for fetching form data in req.body
app.use(express.static("public")); // for accesss files in public folder like css
app.use(cors());
app.use(cookieParser());


// API ENDPOINTS
app.get("/", (req, res) => {
  res.status(200).redirect("/blogs");
});

app.get("/about", (req, res) => {
  res.status(200).render("about", { title: "About",isLogedIn:req.cookies.isLogedIn });
});


//  /blog router used here
app.use(blogRoute);
app.use(userRoute);

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});