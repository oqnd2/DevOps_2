import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Alert, Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';



const UserReservations = ({ userId }) => {
  const [reservations, setReservation] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal de confirmación
  const [reservationToCancel, setReservationToCancel] = useState(null); // Estado para almacenar la reserva que se va a cancelar
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

  const handleCancelReservation = (reservationId) => {
    setReservationToCancel(reservationId); // Guardamos la reserva a cancelar
    setShowModal(true); // Mostramos el modal de confirmación
  };

    // Confirmar la cancelación de la reserva
    const confirmCancelReservation = async () => {
      try {
        await axios.put(`http://localhost:5000/reservation/${reservationToCancel}/cancel`, {
          state: "CANCELADA", // Actualizamos el estado a "CANCELADA"
        });
        setReservation(reservations.filter(res => res.id !== reservationToCancel)); // Removemos la reserva cancelada de la lista visual
        setShowModal(false); // Cerramos el modal
      } catch (error) {
        setError("Error al cancelar la reserva");
      }
    };

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
                  <div  style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="danger" 
                    onClick={() => handleCancelReservation(reservation.id)} 
                    style={{ padding: '0', border: 'none', background: 'none' }} // Para un estilo más limpio
                    >
                    <FontAwesomeIcon icon={faTrash} style={{ color: 'red', fontSize: '20px' }} />
                  </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
        {/* Modal de confirmación */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Cancelación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas cancelar esta reserva?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            No
          </Button>
          <Button variant="danger" onClick={confirmCancelReservation}>
            Sí, cancelar
          </Button> {/* Confirmar cancelación */}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserReservations;
