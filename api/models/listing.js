const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    description: { type: String, required: true },
    address: { type: String, required: true },
    regularPrice: { type: Number, required: true }, 
    discountPrice: { type: Number, required: true }, 
    bathrooms: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    furnished: { type: Boolean, required: true },
    parking: { type: Boolean, required: true },
    type: { type: String, required: true },
    offer: { type: Boolean, required: true },
    imageUrls: { type: Array, required: true },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;