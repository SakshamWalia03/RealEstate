const FavoriteProperty = require("../models/favoriteListings");

// ✅ Add a listing to favorites
const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({ message: "Listing ID is required!" });
    }

    // Check if the user already has a favorites list
    let favoriteEntry = await FavoriteProperty.findOne({ userId });

    if (!favoriteEntry) {
      // Create a new favorite entry if it doesn't exist
      favoriteEntry = new FavoriteProperty({
        userId,
        favoriteProperties: [listingId]
      });
    } else {
      // Add listing to favorites only if it's not already present
      if (!favoriteEntry.favoriteProperties.includes(listingId)) {
        favoriteEntry.favoriteProperties.push(listingId);
        favoriteEntry.prevFavCount += 1;
      }
    }

    // Save the updated favorites list
    await favoriteEntry.save();

    res.status(200).json({
      message: "Listing added to favorites!",
      favorites: favoriteEntry.favoriteProperties,
    });
  } catch (error) {
    console.error("Error adding favorite:", error.message);
    next(error);
  }
};

// ✅ Get a specific favorite listing by ID (Returns true or false)
const getFavoriteById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;

    if (!listingId) {
        console.log("by id");
      return res.status(400).json({ message: "Listing ID is required!" });
    }

    const userFavorites = await FavoriteProperty.findOne({ userId });

    const isFavorite = userFavorites?.favoriteProperties.includes(listingId) || false;

    res.status(200).json({ isFavorite });
  } catch (error) {
    console.error("Error fetching specific favorite listing:", error.message);
    next(error);
  }
};

// ✅ Get user's favorite listings
const getFavoriteList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userFavorites = await FavoriteProperty.findOne({ userId }).populate("favoriteProperties");

    res.status(200).json({
      favoriteProperties: userFavorites?.favoriteProperties || [],
      prevFavCount: userFavorites?.prevFavCount || 0,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error.message);
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
  
      const updatedUserFavorites = await FavoriteProperty.findOneAndUpdate(
        { userId },
        {
          $pull: { favoriteProperties: listingId }, // Removes the listing
          $inc: { prevFavCount: -1 } // Decrease count
        },
        { new: true }
      );
  
      if (!updatedUserFavorites) {
        return res.status(404).json({ message: "User favorites not found!" });
      }
  
      res.status(200).json({ message: "Listing removed from favorites!", data: updatedUserFavorites });
    } catch (error) {
      console.error("Error removing favorite:", error.message);
      next(error);
    }
  };

module.exports = { addFavorite, getFavoriteList, removeFavorite, getFavoriteById };