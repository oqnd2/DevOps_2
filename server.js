const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Backend conectado!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
