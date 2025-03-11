


const express = require('express');
const { register, login, logout, getProtectedData, detail, updatedata,idget,DeleteAccount } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware'); // Import authentication middleware

const router = express.Router();
// router.use((req, res, next) => {
//     console.log(`Incoming request: ${req.method} ${req.url}`);
//     next();
//   });
// // Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected Routes (Require Authentication)
router.post('/delete',DeleteAccount );
router.get('/idget',authenticate,idget)
router.get('/protected', authenticate, getProtectedData);
router.post('/detail', authenticate, detail);  
router.post('/update', authenticate, updatedata); 

module.exports = router;
