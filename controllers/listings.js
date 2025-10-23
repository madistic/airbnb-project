const Listing =  require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async(req,res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Requested listing does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res) => {
  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    if (mapToken) {
      try {
        let response = await geocodingClient.forwardGeocode({
          query: req.body.listing.location,
          limit: 1
        }).send();

        if (response.body.features && response.body.features.length > 0) {
          newListing.geometry = response.body.features[0].geometry;
        } else {
          newListing.geometry = {
            type: 'Point',
            coordinates: [0, 0]
          };
        }
      } catch (geoError) {
        console.error("Geocoding error:", geoError);
        newListing.geometry = {
          type: 'Point',
          coordinates: [0, 0]
        };
      }
    } else {
      newListing.geometry = {
        type: 'Point',
        coordinates: [0, 0]
      };
    }

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error);
    req.flash("error", `Failed to create listing: ${error.message}`);
    res.redirect("/listings/new");
  }
};


module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Requested listing does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,c_fit/");
    res.render("listings/edit.ejs",{listing, originalImageUrl });
};

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};  

module.exports.deleteListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};