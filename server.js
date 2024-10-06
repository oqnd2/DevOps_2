const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "bhj8xabfkyw4f6r5vnug-mysql.services.clever-cloud.com",
  user: "ueso7iu48n32uqt7",
  password: "FvwB1QGjOLO3KK74A974",
  database: "bhj8xabfkyw4f6r5vnug",
});

db.connect((err) => {
  if (err) {
    console.error("Error de conexión: " + err.stack);
    return;
  }
  console.log("Conectado a la base de datos.");
});

// Rutas

// Ruta para iniciar sesión
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Buscar el usuario en la base de datos
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).send("Error en el servidor");
      }
      if (results.length === 0) {
        return res.status(400).send("Usuario no registrado");
      }

      const user = results[0];

      // Comparar contraseñas
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send("Contraseña incorrecta");
      }

      // Generar un token JWT y devolver datos
      const token = jwt.sign(
        { id: user.id, email: user.email },
        "your_jwt_secret",
        { expiresIn: "1h" }
      );
      res.json({ token, name: user.name, role: user.role });
    }
  );
});

app.post("/register", async (req, res) => {
  const { name, last_name, email, phone, password } = req.body;

  if (!name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ message: "Por favor ingrese todos los datos" });
  }

  db.query(
    "SELECT * FROM users WHERE name = ? AND last_name = ? AND email = ? AND phone = ?",
    [name, last_name, email, phone], async (err, results) => {
      if (err) {
        console.error("Error al buscar el usuario: " + err);
        return res.status(500).json({ message: "Error en el servidor" });
      }
      if (results.length > 0) {
        return res
          .status(400)
          .json({ message: "El usuario ya está registrado" });
      }

      db.query(
        "SELECT * FROM users WHERE email = ? OR phone = ?",[email, phone],async (err, results) => {
          if (err) {
            console.error("Error al buscar el usuario " + err);
            return res.status(500).json({ message: "Error en el sevidor" });
          }
          if (results.length > 0) {
            if (results[0].email === email) {
              return res.status(400).json({ message: "El correo electrónico ya está en uso" });
            }
            if (results[0].phone === phone) {
              return res.status(400).json({ message: "El número telefónico ya está en uso" });
            }
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const role = "cliente";

          db.query(
            "INSERT INTO users (name, last_name, email, phone, role, password) VALUES (?, ?, ?, ?, ?, ?)",
            [name, last_name, email, phone, role, hashedPassword],(err, results) => {
              if (err) {
                console.error("Error en la inserción: " + err);
                return res.status(500).json({ message: "Error al registrar usuario" });
              }
              res.status(201).json({ message: "Usuario registrado exitosamente" });
            }
          );
        }
      );
    }
  );
});

app.get("/user/:email", async (req, res) =>{
  const { email } = req.params;
  try{
    db.query("SELECT name, last_name, email, phone FROM users WHERE email = ? ", 
      [email], (err, results) => {
        if(err){
          console.error("Error al buscar usuario " + err);
          return res.status(500).json({message: "Error en el servidor"});
        }
        if (results.length === 0) {
          return res.status(404).json({message: "El usuario no fue encontrado"});
        }
        res.status(200).json(results[0]);
      }
    );
  }
  catch (error){
    console.error(error);
    res.status(500).json({ message: "Error en el servidor"});
  }
});

app.post("/edit", async (req, res) => {
  const { name, last_name, email, phone, password} = req.body;

  if(!name || !last_name || !email || !phone){
    return res.status(400).json({message: "Todos los campos son obligatorios"});
  }
  try{
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) =>{
      if(err){
        console.error("Error al buscar usuario " + err);
        return res.status(400).json({message: "Error en el servidor"});
      }
      if(results.length === 0){
        return res.status(400).json({message: "No fue encontrado el usuario"});
      }
      let hashedPassword = results[0].password;
      if(password){
        hashedPassword = await bcrypt.hash(password, 10);
      }

      db.query("UPDATE users SET name = ?, last_name = ?, phone = ?, password = ? WHERE email = ?", 
        [name, last_name,  phone, hashedPassword, email], (err, results) => {
          if(err){
            console.error("Error al actualizar el usuario " + err)
            return res.status(500).json({message : "Error al actualizar los datos del usuario"});
          }
          return res.status(200).json({message: "Usuario actualizado exitosamente"});
        }
      );
    });
  }catch(error){
    console.error(error);
    res.status(500).json({message: "Error en el servidor"});
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
