const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'bhj8xabfkyw4f6r5vnug-mysql.services.clever-cloud.com',
  user: 'ueso7iu48n32uqt7',
  password: 'FvwB1QGjOLO3KK74A974',
  database: 'bhj8xabfkyw4f6r5vnug'
});

db.connect(err => {
  if (err) {
      console.error('Error de conexión: ' + err.stack);
      return;
  }
  console.log('Conectado a la base de datos.');
});

// Rutas
app.get('/api/data', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
      if (err) {
          return res.status(500).send(err);
      }
      res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
