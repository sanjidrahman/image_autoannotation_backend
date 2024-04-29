const adminRoute = require('express')(); 
const adminController = require('../controllers/adminControllers'); // Importing admin controller functions
const adminAuth = require('../middleware/adminAuth'); // Importing admin authentication middleware

// Define routes for admin functionalities
// Signup and Signin routes for admin authentication
adminRoute.post('/signup', adminController.signup);
adminRoute.post('/signin', adminController.signin);

// Routes for blocking and unblocking user
adminRoute.patch('/block/:id', adminAuth, adminController.blockUser);
adminRoute.patch('/unblock/:id', adminAuth, adminController.unblockUser);

// Routes for retrieving user-specific images and all users
adminRoute.get('/userimages/:id', adminAuth, adminController.userImages);
adminRoute.get('/users', adminAuth, adminController.getAllUsers);

// Routes for retrieving all images and image details
adminRoute.get('/images', adminAuth, adminController.getAllImage);
adminRoute.get('/image/:id', adminAuth, adminController.getImageDetails);

// Routes for approving and rejecting images
adminRoute.patch('/approve/:id', adminAuth, adminController.approve);
adminRoute.patch('/reject/:id', adminAuth, adminController.reject);

// Routes for exporting data
adminRoute.get('/export', adminController.exportAllData); // Export all approved images data
adminRoute.get('/export/:id', adminController.exportData); // Export data for a specific image

module.exports = adminRoute;
