const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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


//Formato de horas para los datos en la BD
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

//Formato de fecha para mostrarlo en el frontend
function formatDateToYYYYMMDD(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

//Formato de hora para mostrarlo en el frontend
function formatTimeTo12Hour(time) {
  const [hour, minute] = time.split(':').map(Number); // Divide la hora y conviértela a números
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12; // Convierte 0 a 12 para las horas en AM/PM
  return `${formattedHour}:${String(minute).padStart(2, '0')} ${ampm}`;
}

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
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, "devops2", { expiresIn: "1h" });
    res.json({ token, message: "Inicio de sesión exitoso." });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).send("Error en el servidor");
  }
}
);

//Ruta para registro
app.post("/register", async (req, res) => {
  try {
    const { name, last_name, email, phone, password } = req.body;

    if (!name || !last_name || !email || !phone || !password) {
      return res.status(400).json({ message: "Por favor ingrese todos los datos" });
    }

    // Verificar si el usuario ya existe
    const [userExists] = await db.query(
      "SELECT * FROM users WHERE name = ? AND last_name = ? AND email = ? AND phone = ?",
      [name, last_name, email, phone]
    );

    if (userExists.length > 0) {
      return res.status(400).json({ message: "El usuario ya está registrado" });
    }

    // Verificar si email o teléfono están en uso
    const [conflictCheck] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [email, phone]
    );

    if (conflictCheck.length > 0) {
      if (conflictCheck.some((user) => user.email === email)) {
        return res.status(400).json({ message: "El correo electrónico ya está en uso" });
      }
      if (conflictCheck.some((user) => user.phone === phone)) {
        return res.status(400).json({ message: "El número telefónico ya está en uso" });
      }
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "cliente";

    await db.query(
      "INSERT INTO users (name, last_name, email, phone, role, password) VALUES (?, ?, ?, ?, ?, ?)",
      [name, last_name, email, phone, role, hashedPassword]
    );

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    console.error("Error en el registro:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


//Consulta datos de usuario (Sesión de editar perfil)
app.get("/user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // Realizar la consulta a la base de datos
    const [results] = await db.query(
      "SELECT name, last_name, email, phone FROM users WHERE email = ?",
      [email]
    );

    // Verificar si se encontró al usuario
    if (results.length === 0) {
      return res.status(404).json({ message: "El usuario no fue encontrado" });
    }

    // Devolver el usuario encontrado
    res.status(200).json(results[0]);
  } catch (error) {
    // Manejo de errores del servidor
    console.error("Error al buscar usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

//Editar datos de usuario
app.post("/edit", async (req, res) => {
  const { name, last_name, email, phone, password } = req.body;

  // Validar que se proporcionen todos los campos obligatorios
  if (!name || !last_name || !email || !phone) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el usuario existe
    const [userResults] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (userResults.length === 0) {
      return res.status(404).json({ message: "No fue encontrado el usuario" });
    }

    // Obtener la contraseña actual si no se proporciona una nueva
    let hashedPassword = userResults[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Actualizar los datos del usuario
    await db.query(
      "UPDATE users SET name = ?, last_name = ?, phone = ?, password = ? WHERE email = ?",
      [name, last_name, phone, hashedPassword, email]
    );

    res.status(200).json({ message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


//Obtener reservas de usuario
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
      const [userReservations] = await db.query("SELECT * FROM reservations WHERE id_user = ?", [userId]);
      res.json(userReservations);
    }
  } catch (err) {
    // Manejo de errores general
    console.error("Error al obtener información:", err);
    res.status(500).json({ message: "Error al obtener información de reservas" });
  }
});

//Realizar reserva
app.post("/reservation", async (req, res) => {
  const { date, start_hour, end_hour, num_people, id_user } = req.body;

  if (!date || !start_hour || !end_hour || !num_people || !id_user) {
    return res.status(400).json({ message: "Por favor ingrese todos los datos requeridos" });
  }

  try {
    const results = await db.query("SELECT * FROM users WHERE id = ?", [id_user]);

    // Aquí verificamos si hay resultados
    if (results.length === 0) {
      return res.status(400).json({ message: "No fue encontrado el usuario" });
    }

    const creation_date = new Date();
    const startHour24 = convertTo24HourFormat(start_hour);
    const endHour24 = convertTo24HourFormat(end_hour);

    await db.query(
      "INSERT INTO reservations (id_user, date, start_hour, end_hour, num_people, creation_date) VALUES (?, ?, ?, ?, ?, ?)",
      [id_user, date, startHour24, endHour24, num_people, creation_date]
    );

    res.status(201).json({ message: "Reserva realizada satisfactoriamente" });
  } catch (error) {
    console.error("Error en el servidor: ", error);
    res.status(500).json({ message: "Error en el servidor" });
  }

  db.query("SELECT role FROM users WHERE id = ?", id_user, (err, userResults) => {
    if (err || userResults.length === 0) {
      console.error("Error al obtener los datos del usuario", err);
      return res.status(500).json({ message: "Error al obtener el rol del usuario" });
    }
    const userRole = userResults[0].role;

    if (userRole === 'empleado') {
      db.query(`SELECT reservations.*, users.name, users.last_name FROM reservations JOIN users ON reservations.id_user = users.id`, (err, allReseservation) => {
        if (err) {
          console.error("Error al obtener la información de la reserva", err);
          return res.status(500).json({ message: "Error al obtener información de la reserva" });
        }
        res.json(allReseservation);
      });
    } else {
      db.query("SELECT * FROM reservations WHERE id_user = ?", [userId], (err, userReservations) => {
        if (err) {
          console.error("Error al obtener la información de la reserva", err);
          return res.status(500).json({ message: "Error al obtener información de la reserva" });
        }
        res.json(userReservations);
      });
    }
  });
});

//Cancelar una reserva y generar notificación
app.put('/reservation/:id/cancel', async (req, res) => {
  const reservationId = req.params.id;
  const role = req.body.userRole;
  const cancellationDate = new Date();

  try {
    // Primero, obtener la reserva y el cliente asociado
    const [reservationResult] = await db.query('SELECT * FROM reservations WHERE id = ?', [reservationId]);

    if (!reservationResult) {
      return res.status(404).send({ error: 'Reserva no encontrada' });
    }

    const reservation = reservationResult[0];

    const customerId = reservation.id_user;  // El cliente que hizo la reserva
    const reservationDate = reservation.date;  // Fecha de la reserva
    const reservationHour = reservation.start_hour; // Hora de la reserva

    // Actualizamos el estado de la reserva
    await db.query('UPDATE reservations SET state = ?, cancellation_date = ? WHERE id = ?', ['CANCELADA', cancellationDate, reservationId]);

    // Lógica para las notificaciones de cancelación.
    if (role == 'cliente') {
      // Ahora obtenemos los datos del cliente
      const [customerResult] = await db.query('SELECT * FROM users WHERE id = ?', [customerId]);
      if (!customerResult) {
        return res.status(404).send({ error: 'Cliente no encontrado' });
      }

      customer = customerResult[0];

      // Creamos la notificación para los empleados
      const message = `${customer.name} ${customer.last_name} (ID de cliente: ${customer.id}) ha cancelado su reserva del dia: ${formatDateToYYYYMMDD(reservationDate)} para las: ${formatTimeTo12Hour(reservationHour)}.`;

      // Insertamos la notificación en la tabla
      await db.query('INSERT INTO notifications (user_id, recipient_role, reservation_id, message, creation_date) VALUES (?, ?, ?, ?, ?)', [
        null,  // El usuario es nulo, ya que es para empleados
        'empleado',
        reservationId,
        message,
        new Date()
      ]);
    }
    else if (role == 'empleado') {
      // Creamos la notificación para el cliente
      const message = `El restaurante ha cancelado tu reserva del dia: ${formatDateToYYYYMMDD(reservationDate)} para las: ${formatTimeTo12Hour(reservationHour)}.`;

      // Insertamos la notificación en la tabla
      await db.query('INSERT INTO notifications (user_id, recipient_role, reservation_id, message, creation_date) VALUES (?, ?, ?, ?, ?)', [
        customerId,  // El id del usuario que recibirá la notificación.
        'cliente',
        reservationId,
        message,
        new Date()
      ]);
    }
    else {
      res.status(500).send({ error: 'Error al detectar el rol del usuario.' });
    }


    // Responder con éxito
    res.status(200).send({ message: 'Reserva cancelada y notificación enviada correctamente' });

  } catch (error) {
    res.status(500).send({ error: 'Error al cancelar la reserva o enviar la notificación' });
  }
});

//Editar una reserva y generar notificacion.
app.put('/reservation/:reservationId', async (req, res) => {
  const { reservationId } = req.params;
  const { date, start_hour, end_hour, num_people, role } = req.body;

  // Query para actualizar la reserva
  const query = 'UPDATE reservations SET date = ?, start_hour = ?, end_hour = ?, num_people = ? WHERE id = ?';

  try {

    const [reservationResult] = await db.query('SELECT * FROM reservations WHERE id = ?', [reservationId]);

    if (!reservationResult) {
      return res.status(404).send({ error: 'Reserva no encontrada' });
    }

    const reservation = reservationResult[0];

    const customerId = reservation.id_user;  // El cliente que hizo la reserva
    const reservationDate = reservation.date;  // Fecha de la reserva
    const reservationHour = reservation.start_hour; // Hora de la reserva

    //Lógica para actualizar datos.
    const connection = await db.getConnection(); // Obtener una conexión del pool
    const [results] = await connection.query(query, [date, start_hour, end_hour, num_people, reservationId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    //Lógica notificación
    if (role == 'cliente') {
      // Ahora obtenemos los datos del cliente
      const [customerResult] = await db.query('SELECT * FROM users WHERE id = ?', [customerId]);
      if (!customerResult) {
        return res.status(404).send({ error: 'Cliente no encontrado' });
      }

      customer = customerResult[0];

      // Creamos el mensahe de la notificación para los empleados
      const message = `${customer.name} ${customer.last_name} (ID de cliente: ${customer.id}) ha editado su reserva con datos: ${formatDateToYYYYMMDD(reservationDate)} ${formatTimeTo12Hour(reservationHour)}. Los nuevos datos son: ${formatDateToYYYYMMDD(date)} ${formatTimeTo12Hour(start_hour)}`;

      // Insertamos la notificación en la tabla
      await db.query('INSERT INTO notifications (user_id, recipient_role, reservation_id, message, creation_date) VALUES (?, ?, ?, ?, ?)', [
        null,  // El usuario es nulo, ya que es para empleados
        'empleado',
        reservationId,
        message,
        new Date()
      ]);
    }
    else if (role == 'empleado') {
      // Creamos la notificación para el cliente
      const message = `El restaurante ha editado tu reserva con datos: ${formatDateToYYYYMMDD(reservationDate)} ${formatTimeTo12Hour(reservationHour)}. Los nuevos datos son: ${formatDateToYYYYMMDD(date)} ${formatTimeTo12Hour(start_hour)}`;

      // Insertamos la notificación en la tabla
      await db.query('INSERT INTO notifications (user_id, recipient_role, reservation_id, message, creation_date) VALUES (?, ?, ?, ?, ?)', [
        customerId,  // El id del usuario que recibirá la notificación.
        'cliente',
        reservationId,
        message,
        new Date()
      ]);
    }
    else {
      return res.status(500).send({ error: 'Error al detectar el rol del usuario.' });
    }

    res.status(200).json({ message: 'Reserva actualizada con éxito' });
    connection.release(); // Liberar la conexión después de usarla
  } catch (error) {
    console.error("Error al actualizar la reserva:", error);
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
});

//Obtener notificaciones
app.post('/notifications', async (req, res) => {
  const id_user = req.body.userId;
  const role = req.body.userRole;

  if (!id_user || !role) {
    return res.status(400).json({ message: "No se obtuvieron todos los datos requeridos" });
  }

  if (role == 'empleado') {
    const [notifications] = await db.query('SELECT * FROM notifications WHERE user_id IS NULL');
    res.json(notifications);
  }
  else if (role == 'cliente') {
    const [notifications] = await db.query('SELECT * FROM notifications WHERE user_id = ?', [id_user]);
    res.json(notifications);
  }
  else {
    return res.status(400).json({ message: "Error en el rol del usuario" });
  }
})

//Ruta para eliminar notificaciones:
app.post('/notificationdelete', async (req, res) => {
  const notifId = req.body.notificationId;

  try{
    //Verificar que la notificación exista
    const [notifications] = await db.query('SELECT * FROM notifications WHERE id = ?', [notifId]);

    if(!notifications){
      return res.status(400).json({ message: `Error: no se encontró la notificación.` });  
    }

    //Eliminar la notificación
    await db.query('DELETE FROM notifications WHERE id = ?', notifId)
    res.status(200).json({ message: 'Notificación eliminada con éxito' });

  }catch(err){
    return res.status(400).json({ message: `Error: ${err.message}` });
  }
})

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

module.exports = { app, server, db }