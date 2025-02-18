import * as express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, TypeScript!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
