import 'dotenv/config';
import cors from 'cors';
import proxy from "express-http-proxy";
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import express from 'express';

const app = express();
app.use(cors(
  {
    origin: true, // Allow all origins for development
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  }
));

app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.set('trust proxy', 1);

// apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,

});

app.use(limiter);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to api-gateway! Use /api for API endpoints.' });
});

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});


app.use("/api", proxy("http://localhost:6001", {
    proxyReqPathResolver: (req) => {
        // Forward the request path to auth-service, keeping /api prefix
        // req.originalUrl includes /api, so we pass it as is
        return req.originalUrl;
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        // Remove upgrade and connection headers to prevent WebSocket upgrade
        if (proxyReqOpts.headers) {
            // Remove WebSocket-related headers
            delete proxyReqOpts.headers['upgrade'];
            // Set connection to close for regular HTTP requests
            proxyReqOpts.headers['connection'] = 'close';
        }
        return proxyReqOpts;
    },
    // Filter function to only proxy HTTP requests, not WebSocket
    filter: (req, res) => {
        // Always proxy HTTP requests
        // The proxyReqOptDecorator will handle removing WebSocket headers
        return true;
    },
    // Handle errors
    proxyErrorHandler: (err, res, next) => {
        console.error('Proxy error:', err.message);
        res.status(502).json({
            status: 'error',
            message: 'Bad Gateway - Service unavailable'
        });
    },
}));


const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
