const express = require('express');
const mongoose = require('mongoose'); // Importing Mongoose for MongoDB interaction
const morgan = require('morgan'); // Importing Morgan for HTTP request logging
const cors = require('cors');
const session = require('express-session'); // Importing Express session for session management
const userRoute = require('./routes/userRoutes'); // Importing user routes
const adminRoute = require('./routes/adminRoutes'); // Importing user routes
const cluster = require('cluster');
const os = require('os')
require('dotenv').config(); // Loading environment variables from .env file

const cpus = os.cpus().length

const createServer = () => {
    const app = express()

    // Connecting to MongoDB database
    mongoose.connect(process.env.DB_URL)
        .then(() => console.log('DB Connected..!'))
        .catch((err) => console.log(err))

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));
    app.use('/file', express.static('public')); // Serving static files from the 'public' directory under '/file' route
    app.use(session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: false,
    }))

    app.use('/', userRoute); // Mounting user routes
    app.use('/admin', adminRoute); // Mounting admin routes

    return app
}

// Master process
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < cpus; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    // Worker processes
    console.log(`Worker ${process.pid} started`);

    const app = createServer();

    app.listen(5050, () => {
        console.log(`Server started on process ${process.pid}`);
    });
}