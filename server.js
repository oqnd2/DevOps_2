const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "bhj8xabfkyw4f6r5vnug-mysql.services.clever-cloud.com",
  user: "ueso7iu48n32uqt7",
  password: "FvwB1QGjOLO3KK74A974",
  database: "bhj8xabfkyw4f6r5vnug",
});

db.getConnection()
  .then(connection => {
    console.log("Conexión a la base de datos establecida correctamente");
    connection.release(); // Liberar la conexión si no se necesita
  })
  .catch(err => {
    console.error("Error al conectar a la base de datos:", err);
    process.exit(1); // Termina el proceso si no se puede conectar
  });

  // Middleware para poder recibir JSON
app.use(express.json());


// Rutas

// Ruta para iniciar sesión
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validar que se proporcionen email y password
  if (!email || !password) {
    return res.status(400).send("Email y contraseña son requeridos");
  }

  try {
    // Buscar el usuario en la base de datos
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    // Verificar si se encontró al usuario
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
    const token = jwt.sign({ id: user.id, email: user.email }, "your_jwt_secret", { expiresIn: "1h" });
    
    res.json({ token, name: user.name, role: user.role, id: user.id });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).send("Error en el servidor");
  }
});


app.post("/register", async (req, res) => {
  const { name, last_name, email, phone, password } = req.body;

  if (!name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ message: "Por favor ingrese todos los datos" });
  }

    await db.query(
    "SELECT * FROM users WHERE name = ? AND last_name = ? AND email = ? AND phone = ?",
    [name, last_name, email, phone],async (err, results) => {
      if (err) {
        console.error("Error al buscar el usuario: " + err);
        return res.status(500).json({ message: "Error en el servidor" });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: "El usuario ya está registrado" });
      }

      await db.query("SELECT * FROM users WHERE email = ? OR phone = ?",
        [email, phone],async (err, results) => {
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

          await db.query(
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

app.get("/user/:email", async (req, res) => {
  const { email } = req.params;
  try {
    await db.query("SELECT name, last_name, email, phone FROM users WHERE email = ? ",
      [email],(err, results) => {
        if (err) {
          console.error("Error al buscar usuario " + err);
          return res.status(500).json({ message: "Error en el servidor" });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: "El usuario no fue encontrado" });
        }
        res.status(200).json(results[0]);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

app.post("/edit", async (req, res) => {
  const { name, last_name, email, phone, password } = req.body;

  if (!name || !last_name || !email || !phone) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }
  try {
    await db.query("SELECT * FROM users WHERE email = ?",
      [email],async (err, results) => {
        if (err) {
          console.error("Error al buscar usuario " + err);
          return res.status(400).json({ message: "Error en el servidor" });
        }
        if (results.length === 0) {
          return res.status(400).json({ message: "No fue encontrado el usuario" });
        }
        let hashedPassword = results[0].password;
        if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
        }

        await db.query(
          "UPDATE users SET name = ?, last_name = ?, phone = ?, password = ? WHERE email = ?",
          [name, last_name, phone, hashedPassword, email],(err, results) => {
            if (err) {
              console.error("Error al actualizar el usuario " + err);
              return res.status(500).json({ message: "Error al actualizar los datos del usuario" });
            }
            return res.status(200).json({ message: "Usuario actualizado exitosamente" });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

app.get('/reservation/:userId', async (req, res) => {
  const { userId } = req.params;

  // Verificar si userId está presente
  if (!userId) {
    return res.status(400).json({ message: "userId es requerido" });
  }

  try {
    // Obtener el rol del usuario
    const [userResults] = await db.query("SELECT role FROM users WHERE id = ?", [userId]);

    // Manejar errores al obtener el rol
    if (userResults.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const userRole = userResults[0].role;

    // Consultas dependiendo del rol
    if (userRole === 'empleado') {
      const [allReservations] = await db.query(`
        SELECT reservations.*, users.name, users.last_name 
        FROM reservations 
        JOIN users ON reservations.id_user = users.id
      `);
      res.json(allReservations);
    } else {
      const [userReservations] = await db.query("SELECT * FROM reservations WHERE id_user = ? AND state != 'CANCELADA'", [userId]);
      res.json(userReservations);
    }
  } catch (err) {
    // Manejo de errores general
    console.error("Error al obtener información:", err);
    res.status(500).json({ message: "Error al obtener información de reservas" });
  }
});

const convertTo24HourFormat = (time12h) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier.toLowerCase() === 'pm') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}:00`;
};


app.post("/reservation", async (req, res) => {
  const { date, start_hour, end_hour, num_people, id_user } = req.body;
  console.log("Datos recibidos en el servidor:", { date, start_hour, end_hour, num_people, id_user });

  if (!date || !start_hour || !end_hour || !num_people || !id_user) {
    return res.status(400).json({ message: "Por favor ingrese todos los datos requeridos" });
  }

  try {
    console.log("Buscando usuario con id:", id_user);
    const results = await db.query("SELECT * FROM users WHERE id = ?", [id_user]);

    // Aquí verificamos si hay resultados
    if (results.length === 0) {
      return res.status(400).json({ message: "No fue encontrado el usuario" });
    }

    console.log("Consulta realizada exitosamente", results); // Muestra los resultados de la consulta

    const creation_date = new Date();
    const startHour24 = convertTo24HourFormat(start_hour);
    const endHour24 = convertTo24HourFormat(end_hour);

    console.log("Hora de inicio en formato 24:", startHour24);
    console.log("Hora de fin en formato 24:", endHour24);

    await db.query(
      "INSERT INTO reservations (id_user, date, start_hour, end_hour, num_people, creation_date) VALUES (?, ?, ?, ?, ?, ?)",
      [id_user, date, startHour24, endHour24, num_people, creation_date]
    );

    res.status(201).json({ message: "Reserva realizada satisfactoriamente" });
  } catch (error) {
    console.error("Error en el servidor: ", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//ruta para cancelar reservas
app.put('/reservation/:id/cancel', async (req, res) => {
  const reservationId = req.params.id;

  try {
    await await db.query('UPDATE reservations SET state = ? WHERE id = ?', ['CANCELADA', reservationId]);
    res.status(200).send({ message: 'Reserva cancelada correctamente' });
  } catch (error) {
    res.status(500).send({ error: 'Error al cancelar la reserva' });
  }
});
