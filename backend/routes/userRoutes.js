const express = require('express');
const router = express.Router();
const {
  getProfile,
  getFavourites,
  addFavourite,
  removeFavourite,
  getPlayHistory,
  getAllUsers
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/profile', getProfile);
router.get('/favourites', getFavourites);
router.post('/favourites', addFavourite);
router.delete('/favourites/:gameId', removeFavourite);
router.get('/history', getPlayHistory);

// Admin-only user management
router.get('/all', roleMiddleware('admin'), getAllUsers);

module.exports = router;
