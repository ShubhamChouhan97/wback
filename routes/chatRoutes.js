const express = require('express');
const { getAllUsers,ofuser,messag } = require('../controllers/chatController'); // Import controller

const router = express.Router();

// // Middleware to log incoming requests
// router.use((req, res, next) => {
//    // console.log(`Incoming request: ${req.method} ${req.url}`);
//   //  console.log('Request Body:', req.body);
//     next();
// });

// Route to fetch all users using the controller function
router.get('/allusers', getAllUsers);
router.post('/ofuser',ofuser);
router.post('/messages',messag);
module.exports = router;
