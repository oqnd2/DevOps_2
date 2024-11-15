import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Alert, Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import EditReservationModal from "./EditReservationModal";

const UserReservations = ({ userId, filter }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [reservations, setReservation] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal de confirmación
  const [reservationToCancel, setReservationToCancel] = useState(null); // Estado para almacenar la reserva que se va a cancelar
  const [showEditModal, setShowEditModal] = useState(false); // Estado para manejar si el modal está abierto
  const [selectedReservation, setSelectedReservation] = useState(null);// Estado para manejar la reserva seleccionada

  const userRole = localStorage.getItem('userRole');

  // Usar useCallback para definir fetchReservation
  const fetchReservation = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/reservation/${userId}`);
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
      await axios.put(`${API_URL}/reservation/${reservationToCancel}/cancel`, {
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

  const openEditModal = (reservation) => {
    setSelectedReservation(reservation); // Establece la reserva seleccionada
    setShowEditModal(true); // Muestra el modal
    fetchReservation();
  };

  const updateReservation = (updatedReservation) => {
    // Aquí iría la lógica para actualizar la reserva
    console.log('Reserva actualizada:', updatedReservation);
    // Cierra el modal después de actualizar
    setShowEditModal(false);
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
              <Card style={{ backgroundColor: getCardBackgroundColor(reservation.state), height: "290px" }}>
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
                  {reservation.state === "PENDIENTE" && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="primary"
                        onClick={() => openEditModal(reservation)}
                        style={{ padding: '0', border: 'none', background: 'none', width: 'auto' }} // Ajuste del padding y ancho
                      >
                        <FontAwesomeIcon icon={faEdit} style={{ color: 'blue', fontSize: '20px' }} />
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => handleCancelReservation(reservation.id)}
                        style={{ padding: '0', border: 'none', background: 'none', width: 'auto' }} // Ajuste del padding y ancho
                      >
                        <FontAwesomeIcon icon={faTrash} style={{ color: 'red', fontSize: '20px', marginLeft: '15px' }} />
                      </Button>
                    </div>
                  )}
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

      {/* Modal de edición */}
      <EditReservationModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        selectedReservation={selectedReservation}
        updateReservation={updateReservation}
        fetchReservation={fetchReservation}
      />
    </Container>
  );
};

export default UserReservations;