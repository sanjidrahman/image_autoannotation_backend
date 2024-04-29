const userRoute = require('express')()
const userController = require('../controllers/userControllers'); // Importing user controller functions
const userAuth = require('../middleware/userAuth'); // Importing user authentication middleware
const upload = require('../middleware/multer'); // Importing middleware for handling file uploads

userRoute.get('/', (req, res) => {
    res.send('Hello from Wasserstoff backend task 👋')
})
// Define routes for user functionalities
userRoute.post('/signup', userController.signup); // Route for user signup
userRoute.post('/signin', userController.signin); // Route for user signin

userRoute.post('/upload', userAuth, upload.single('file'), userController.upload); // Route for user file upload

module.exports = userRoute