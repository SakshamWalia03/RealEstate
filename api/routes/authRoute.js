const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const verifyToken = require('../util/verifyToken');

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post('/google', authController.google);
router.get('/signout',verifyToken, authController.signOut);

module.exports = router;