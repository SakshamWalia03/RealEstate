const mongoose = require("mongoose");

const favoritePropertiesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  favoriteProperties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing", // Reference to the Listing model
    },
  ],
  prevFavCount: {
    type: Number,
    default: 0, // Default to 0 when a user is created
  },
});

const FavoriteProperty = mongoose.model("FavoriteProperties", favoritePropertiesSchema);

module.exports = FavoriteProperty;