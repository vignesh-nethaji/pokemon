const cors = require('cors');
const { NODE_ENV, ALLOWED_ORIGINS } = require('./environment');

const corsOptions = {
    origin: (origin, callback) => {
        if (NODE_ENV === 'development' || !origin) {
            // Allow all in development or for non-browser requests
            return callback(null, true);
        }

        if (ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET'], // Only allow GET requests
    optionsSuccessStatus: 200,
    credentials: false,
    maxAge: 86400 // 24 hours
};

module.exports = cors(corsOptions);