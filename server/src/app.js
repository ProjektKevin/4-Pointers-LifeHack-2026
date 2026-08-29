import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mainRoutes from './routes/mainRoute.js';
import { pool, testDBConnection } from './services/db.js'; 

// config the dotenv
dotenv.config();

const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

const CORS_OPTIONS = {
  origin: [process.env.FRONT_END_URL || 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(CORS_OPTIONS));

app.use('/api', mainRoutes);

// Test the database connection when the server starts
testDBConnection(pool);


export default app;