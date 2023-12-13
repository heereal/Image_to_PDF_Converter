var express = require("express");
var router = express.Router();

var path = require("path");

// send the file "public/html/index.html" to the client
router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "..", "/public/html/index.html"));
});

module.exports = router;
