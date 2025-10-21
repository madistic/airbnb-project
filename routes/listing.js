const express = require("express");
const router =express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,isOwner, validateListing } = require("../middleware.js");
const listingsController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

//index n create route
router.route("/")
.get(wrapAsync(listingsController.index))
.post(isLoggedIn,  upload.single("image"), validateListing, wrapAsync(listingsController.createListing));

//new route
router.get("/new", isLoggedIn, listingsController.renderNewForm);

//show, update, n dlt route
router.route("/:id")
.get(wrapAsync(listingsController.showListing))
.put(isLoggedIn, isOwner, upload.single("image"), validateListing, wrapAsync(listingsController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, validateListing, wrapAsync(listingsController.renderEditForm));

module.exports = router;