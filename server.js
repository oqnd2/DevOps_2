const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Buscar el usuario en la base de datos
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).send('Error en el servidor');
    }
    if (results.length === 0) {
      return res.status(400).send('Usuario no registrado');
    }

    const user = results[0];

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Contraseña incorrecta');
    }

    // Generar un token JWT y devolver datos
    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, name: user.name, role: user.role });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
