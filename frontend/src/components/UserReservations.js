import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";

const UserReservations = ({ userId, filter }) => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const userRole = localStorage.getItem('userRole');

  const fetchReservations = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/reservation/${userId}`);
      setReservations(response.data);
    } catch (err) {
      setError("Error al cargar las reservas");
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchReservations();
    }
  }, [userId, fetchReservations]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' }; 
    return date.toLocaleDateString('es-ES', options); 
  };

  const getCardBackgroundColor = (state) => {
    switch (state) {
      case 'CANCELADA':
        return '#f8d7da';
      case 'PENDIENTE':
        return '#cfe2ff';
      case 'COMPLETADA':
        return '#d1e7dd';
      default:
        return '#9eb5d9';
    }
  };

  // Filtrar reservas según el filtro seleccionado
  const filteredReservations = reservations.filter((reservation) => {
    if (filter === "todas") return true;
    return reservation.state === filter;
  });

  // Generar mensaje de alerta según el filtro y el rol
  const getAlertMessage = () => {
    if (filteredReservations.length > 0) return ""; // Si hay reservas, no mostrar mensaje de alerta

    const baseMessage = userRole === "empleado" ? "No hay" : "No tienes";
    switch (filter) {
      case "todas":
        return `${baseMessage} reservas registradas.`;
      case "COMPLETADA":
        return `${baseMessage} reservas completadas.`;
      case "PENDIENTE":
        return `${baseMessage} reservas pendientes.`;
      case "CANCELADA":
        return `${baseMessage} reservas canceladas.`;
      default:
        return `${baseMessage} reservas.`;
    }
  };

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {filteredReservations.length === 0 ? (
        <Alert variant="info">{getAlertMessage()}</Alert>
      ) : (
        <Row>
          {filteredReservations.map((reservation, index) => (
            <Col key={reservation.id} md={3} className="mb-3">
              <Card style={{ backgroundColor: getCardBackgroundColor(reservation.state) }}>
                <Card.Body>
                  <Card.Title>Reserva {index + 1}</Card.Title>
                  <Card.Text>Fecha: {formatDate(reservation.date)}</Card.Text>
                  <Card.Text>Hora de ingreso: {reservation.start_hour}</Card.Text>
                  <Card.Text>Hora de salida: {reservation.end_hour}</Card.Text>
                  <Card.Text>Número de personas: {reservation.num_people}</Card.Text>
                  <Card.Text>Estado: {reservation.state}</Card.Text>
                  {userRole === "empleado" && (
                    <div>
                      <Card.Text>Usuario: {reservation.name} {reservation.last_name}</Card.Text>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default UserReservations;
