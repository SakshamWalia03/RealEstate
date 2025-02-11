const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteListingController");
const verifyToken = require("../util/verifyToken.js");

// ✅ Add a listing to favorites
router.post("/:listingId", verifyToken, favoriteController.addFavorite);
// ✅ Get all favorite listings of the user
router.get("/:id", verifyToken, favoriteController.getFavoriteList);
// ✅ Remove a listing from favorites
router.delete("/:listingId", verifyToken, favoriteController.removeFavorite);
// getting specific property data
router.get("/specific/:listingId",verifyToken,favoriteController.getFavoriteById)

module.exports = router;