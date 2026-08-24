const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const movieController = require('../controllers/movieController');
const userController = require('../controllers/userController');
const feedController = require('../controllers/feedController');
const listController = require('../controllers/listController');
const socialController = require('../controllers/socialController');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);

// Movie Catalog & Interaction Routes
router.get('/movies/popular', movieController.getPopular);
router.get('/movies/top-rated', movieController.getTopRated);
router.get('/movies/upcoming', movieController.getUpcoming);
router.get('/movies/search', movieController.search);
router.get('/movies/:id', optionalAuth, movieController.getMovieDetails);
router.post('/movies/:id/interact', authMiddleware, movieController.interactWithMovie);
router.delete('/movies/:id/interact', authMiddleware, movieController.removeInteraction);

// User Profile & Social Routes
router.get('/users/:username', optionalAuth, userController.getProfile);
router.get('/users/:username/movies', userController.getUserMovies);
router.put('/users/profile', authMiddleware, userController.updateProfile);
router.post('/users/:id/follow', authMiddleware, userController.toggleFollow);

// Feed Route
router.get('/feed', optionalAuth, feedController.getFeed);

// Lists Routes
router.get('/lists', listController.getLists);
router.post('/lists', authMiddleware, listController.createList);
router.get('/lists/:id', listController.getListDetails);
router.post('/lists/:id/movies', authMiddleware, listController.addMovieToList);

// Social (Likes & Comments)
router.post('/social/like', authMiddleware, socialController.toggleLike);
router.post('/social/comment', authMiddleware, socialController.addComment);
router.get('/social/comments', socialController.getComments);

module.exports = router;
