const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Article = mongoose.model("Article", articleSchema);

/////////////////////// REQUESTS TARGETTING ALL ARTICLES ///////////////////////////
app.route("/articles")

  .get(function(req, res) {
    Article.find({}, function(err, articles) {
      if (!err) {
        res.send(articles);
      } else {
        res.send(err);
      }
    });
  })

  .post(function(req, res) {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });

    newArticle.save(function(err) {
      if (!err) {
        res.send("Successfully added new article.");
      } else {
        res.send(err);
      }
    });
  })

  .delete(function(req, res) {
    Article.deleteMany({}, function(err) {
      if (!err) {
        res.send("Successfully deleted ALL articles.");
      } else {
        res.send(err);
      }
    });
  });

/////////////////////// REQUESTS TARGETTING SPECIFIC ARTICLES ///////////////////////////
app.route("/articles/:articleTitle")
  .get(function(req, res) {
    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No articles matching that title were found.");
      }
    });
  })

  .put(function(req, res) {
    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
      if (foundArticle && !err) {
        Article.update(
          {title: req.params.articleTitle},
          {title: req.body.title, content: req.body.content}, // must specify all fields with PUT because it replaces entire entry
          {overwrite: true},
          function(err) {
            if (!err) {
              res.send("Successfully overwrote article.");
            }
          }
        )
      } else if (err) {
        res.send(err);
      } else {
        res.send("Article cannot be overwritten because it does not exist.");
      }
    })
  })

  .patch(function(req, res) {
    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
      if (foundArticle && !err) {
        Article.update(
          {title: req.params.articleTitle},
          {$set: req.body},
          function(err) {
            if (!err) {
              res.send("Successfully updated article.");
            }
          }
        )
      } else if (err) {
        res.send(err);
      } else {
        res.send("Article cannot be updated because it does not exist.");
      }
    })
  })

  .delete(function(req, res) {
    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
      if (foundArticle && !err) {
        Article.deleteOne(
          {title: req.params.articleTitle}, function(err) {
            if (!err) {
              res.send("Successfully deleted article.");
            }
          }
        )
      } else if (err) {
        res.send(err);
      } else {
        res.send("Article cannot be deleted because it does not exist.");
      }
    })
  })
;


////////////////SPIN OFF SERVER on LOCAL HOST 3000 PORT //////////////////////////////////
app.listen(3000, function() {
  console.log("Server listening on port 3000");
});
