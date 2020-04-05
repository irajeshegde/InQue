var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    app = express();

const writeStream = fs.createReadStream

//APP CONFIG
mongoose.connect("mongodb://localhost/IntQ");
app.use(express.static("public")); // to serve public directory for express
app.set("view engine", "ejs"); // extention not needed if this line is active
app.use(bodyParser.urlencoded({
    extended: true
}));

// MONGOOSE MODEL CONFIG
var myDB = new mongoose.Schema({
    company: String,
    fileUrl: String,
    created: {
        type: Date,
        default: Date.now
    }
});
var DataBase = mongoose.model("Data", myDB);

var myFeedback = new mongoose.Schema({
    email: String,
    message: String,
    created: {
        type: Date,
        default: Date.now
    }
});
var FeedBack = mongoose.model("FeedBack", myFeedback);

// DataBase.create({
//     company: "IDM",
//     fileUrl: "https://file.com"
// });

// FeedBack.create({
//     email: "rajesh@gmail.com",
//     message: "Alright"
// });

// HOMEPAGE
app.get("/", (req, res) => {
    var message = "";
    res.render("index", {
        message: message
    });
});

// HISTORY
app.get("/history", function (req, res) {
    DataBase.find({}, function (err, myDB) {
        if (err) {
            console.log(err);
        } else {
            res.render("history", {
                myDB: myDB
            });
        }
    });
});

//CREATE HISTORY BY POST REQUEST
app.post("/history", function (req, res) {
    var company = req.body.company;
    var url = req.body.url;

    request(url,
        (error, response, html) => {
            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(html);
                const content = $('body').text();
                fs.writeFile(`saved/${company}.txt`, content, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    // console.log("The file was saved!");
                    DataBase.create({
                        company: company,
                        fileUrl: url
                    }, function (err, DataBase) {
                        if (err) {
                            res.redirect("/")
                        } else {
                            res.redirect("/history")
                        }
                    });

                });
            }
        }
    );


});

// HOMEPAGE
app.get("/feedback", (req, res) => {
    res.render("feedback");
});


app.post("/feedback", (req, res) => {
    FeedBack.create(req.body.data, function (err, newFeedback) {
        if (err) {
            var message = "Success!"
            res.render("index", {
                message: message
            });
        } else {
            res.redirect("/")
        }
    });
});

app.get("/admin", (req, res) => {
    FeedBack.find({}, function (err, myFeedback) {
        if (err) {
            console.log(err);
        } else {
            res.render("admin", {
                myFeedback: myFeedback
            });
        }
    });
});

var server = app.listen(3000, "0.0.0.0", function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("listening at http://%s:%s\n", host, port);
});