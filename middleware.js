const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/Expresserror.js");
const { listingSchema, reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in to access that page!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)){
        req.flash("error", "You don't have permission to edit this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};   

module.exports.validateListing = (req, res, next) => {
    const validationData = {...req.body};
    if (!validationData.listing) {
        validationData.listing = {};
    }
    if (!validationData.listing.image && req.file) {
        validationData.listing.image = { url: "" };
    }

    let {error} = listingSchema.validate(validationData);
    if (error) {
        let msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    }else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
     let {error} = reviewSchema.validate(req.body);
    if (error) {
        let msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId).populate("author");
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};   