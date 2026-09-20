import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoute.js';
import orgRoutes from './routes/orgRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Backend running" });
});

// Authentication endpoint/route
app.use('/api/auth', authRoutes);

// organization endpoint
app.use('/api/organizations', orgRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});