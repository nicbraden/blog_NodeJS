let methodOverride = require("method-override");
let sanitizer = require("express-sanitizer");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
let express = require("express");
let app = express();


//App Config
mongoose.connect('mongodb://localhost:27017/restful_blog_app', { useNewUrlParser: true, useUnifiedTopology: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sanitizer());
app.use(methodOverride("_method"));

//Mongoose Schema & model config
let blogSchema = new mongoose.Schema({
    title: String, 
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});
let blog = mongoose.model("Blog", blogSchema);

//Restful routes 
app.get("/", (req, res) => {
    res.redirect("/blogs");
});
//Index Route
app.get("/blogs", (req, res) => {
    blog.find({}, (err, blogs) => {
        if(err){
            console.log(err);
        } else{
            res.render("index", {blogs: blogs});
        }
    });
});
//New Route
app.get("/blogs/new", (req, res) => {
    res.render("new");
});
//Create Route
app.post("/blogs", (req, res) => {
    //create blog then redirect
    //req.body is the info coming from the form, blog.body is coming from blog[body]
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.create(req.body.blog, (err, newBlog) => {
        if(err){
            res.render("new");
        }else {
            res.redirect("/blogs");
        }
    });
});
//Show Route
app.get("/blogs/:id", (req, res) => {
    blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        }else {
            res.render("show", {blog: foundBlog});
        }
    })
});
//Edit Route
app.get("/blogs/:id/edit", (req, res) => {
    blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        }else {
            res.render("edit", {blog: foundBlog});
        }
    });
});
//Update Route
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if(err){
            res.redirect("/blogs");
        }else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});
//Delete Route
app.delete("/blogs/:id", (req, res) => {
    //destroy blog & redirect 
    blog.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/blogs");
        }
    });
});

app.listen(3000, function(){
    console.log("Server Running");
})