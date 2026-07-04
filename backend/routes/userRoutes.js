const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  updateProfile,
  deleteUser,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, restrictTo('admin'), getUsers);
router.get('/:id', protect, getUser);
router.put('/profile', protect, updateProfile);
router.put('/:id', protect, restrictTo('admin'), updateUser);
router.delete('/:id', protect, restrictTo('admin'), deleteUser);

module.exports = router;
