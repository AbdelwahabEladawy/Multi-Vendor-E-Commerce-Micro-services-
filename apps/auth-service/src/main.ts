import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error.middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = require('./swagger-output.json');

const app = express();

// CORS must be first
app.use(cors(
  {
    origin: true, // Allow all origins for development
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  }
));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req: Request, res: Response) => {
  console.log('GET / request received');
  res.send({ message: 'Welcome to auth-service!' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/docs-json", (req: Request, res: Response) => {
  res.json(swaggerDocument);
});

app.use("/api", router);

// 404 handler - must be before error middleware
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handler - must be last
app.use(errorMiddleware);
const port = process.env.PORT || 6001;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  console.log(`API docs available at http://localhost:${port}/api-docs`);

});
server.on('error', (err: unknown) => {
  console.error("server-error:", err);
});
