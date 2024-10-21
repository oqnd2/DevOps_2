import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";

const UserReservations = ({ userId }) => {
  const [reservations, setReservation] = useState([]);
  const [error, setError] = useState("");
  const userRole = localStorage.getItem('userRole');

  // Usar useCallback para definir fetchReservation
  const fetchReservation = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/reservation/${userId}`);
      setReservation(response.data);
    } catch (err) {
      setError("Error al cargar las reservas");
      console.error(err);
    }
  }, [userId]); // Añadimos userId como dependencia

  useEffect(() => {
    if (userId) {
      fetchReservation(); // Ejecutar la función cuando el userId cambie
    }
  }, [userId, fetchReservation]); // fetchReservation ahora es una función memorizada

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' }; 
    return date.toLocaleDateString('es-ES', options); 
  };

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {reservations.length === 0 ? (
        <Alert variant="info">
          {userRole === "empleado" ? "No hay reservas registradas." : "No tienes reservas."}
        </Alert>
      ) : (
        <Row>
          {reservations.map((reservation, index) => (
            <Col key={reservation.id} md={3} className="mb-3">
              <Card style={{ backgroundColor: '#9eb5d9'}}>
                <Card.Body>
                  <Card.Title>Reserva { index + 1 }</Card.Title>
                  <Card.Text>Fecha: {formatDate(reservation.date)}</Card.Text>
                  <Card.Text>Hora de ingreso: {reservation.start_hour}</Card.Text>
                  <Card.Text>Hora de salida: {reservation.end_hour}</Card.Text>
                  <Card.Text>Número de personas: {reservation.num_people}</Card.Text>
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
