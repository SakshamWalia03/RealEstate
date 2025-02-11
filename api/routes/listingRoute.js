const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const verifyToken = require("../util/verifyToken.js");

router.post('/create', listingController.createListing);
router.get('/get/:id', listingController.getListing);
router.get('/get', listingController.getListings);
router.delete('/delete/:id', verifyToken, listingController.deleteListing);
router.put('/update/:id', verifyToken, listingController.updateListing);

module.exports = router;
