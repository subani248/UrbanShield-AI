const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

module.exports = router;
