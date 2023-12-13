var express = require("express");
var router = express.Router();
var path = require("path");
var multer = require("multer");
var fs = require("fs");
var PDFDocument = require("pdfkit");

// send the file "public/html/index.html" to the client
router.get("/", function (req, res, next) {
  // if there are no image filenames in a session, return the normal HTML page
  if (req.session.imagefiles === undefined) {
    res.sendFile(path.join(__dirname, "..", "/public/html/index.html"));
  } else {
    // if there are image filenames stored in a session, render them in an "index.jade" file
    res.render("index", { images: req.session.imagefiles });
  }
});

// multer file storage configuration
let storage = multer.diskStorage({
  //store the images in the "public/images" folder
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  //rename the images
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + "." + file.mimetype.split("/")[1]
    );
  },
});

// configuration for file filter
let fileFilter = (req, file, callback) => {
  let ext = path.extname(file.originalname);
  // if the file extension isn't '.png' or '.jpg' return an error page else return true
  if (ext !== ".png" && ext !== ".jpg") {
    return callback(new Error("Only png and jpg files are accepted"));
  } else {
    return callback(null, true);
  }
};

// initialize Multer with the configurations for storage and file filter
var upload = multer({ storage, fileFilter });

// upload.array('images') method which tells mutler to only store files input element's name is "images"
router.post("/upload", upload.array("images"), function (req, res) {
  let files = req.files;
  let imgNames = [];

  // extract the filenames
  for (i of files) {
    let index = Object.keys(i).findIndex(function (e) {
      return e === "filename";
    });
    imgNames.push(Object.values(i)[index]);
  }
  // store the image filenames in a session
  req.session.imagefiles = imgNames;
  console.log("imgNames:", imgNames);

  // redirect the request to the root URL route
  res.redirect("/");
});

router.post("/pdf", function (req, res, next) {
  let body = req.body;

  // Create a new pdf
  let doc = new PDFDocument({ size: "A4", autoFirstPage: false });
  let pdfName = "pdf-" + Date.now() + ".pdf";

  // store the pdf in the "public/pdf" folder
  doc.pipe(
    fs.createWriteStream(path.join(__dirname, "..", `/public/pdf/${pdfName}`))
  );

  // create the pdf pages and add the images
  for (let name of body) {
    doc.addPage();
    doc.image(path.join(__dirname, "..", `/public/images/${name}`), 20, 20, {
      width: 555.28,
      align: "center",
      valign: "center",
    });
  }
  // end the process
  doc.end();

  // send the address back to the browser
  res.send(`/pdf/${pdfName}`);
});

module.exports = router;
