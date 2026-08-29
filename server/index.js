import app from './src/app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.BACK_END_PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});