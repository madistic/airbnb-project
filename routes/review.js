const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/Expresserror.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js"); 
const reviewsController = require("../controllers/reviews.js");
const review = require("../models/review.js");

//Post route for reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewsController.createReview));

//Delete route for reviews
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewsController.deleteReview));

module.exports = router;


