const express = require('express');
const router = express.Router();
const {
  getAllGames,
  getGameByIdOrSlug,
  getCategories,
  createGame,
  updateGame,
  deleteGame
} = require('../controllers/gameController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/categories', getCategories);
router.get('/', optionalAuthMiddleware, getAllGames);
router.get('/:idOrSlug', optionalAuthMiddleware, getGameByIdOrSlug);

// Admin-only endpoints
router.post('/', authMiddleware, roleMiddleware('admin'), createGame);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateGame);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteGame);

module.exports = router;
