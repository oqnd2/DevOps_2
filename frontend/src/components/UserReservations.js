import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Alert, Button, Modal, Spinner, Form } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import EditReservationModal from "./EditReservationModal";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client"
import PropTypes from "prop-types";
import './../styles/index.css'

const UserReservations = ({ userId, filter }) => {

  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');
  const socketRef = useRef(null);
  const [userRole, setUserRole] = useState();
  const userRoleRef = useRef(userRole);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showTodayOnly, setShowTodayOnly] = useState(false); // Estado para el checkbox

  const formatTimeTo12Hour = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${String(minute).padStart(2, '0')} ${ampm}`;
  };

  //Buscar las reservas del usuario.
  const fetchReservation = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/reservation/${userId}`);
      setReservations(response.data);
      setError("");
    } catch (err) {
      setError("Error al cargar las reservas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, API_URL]);

  useEffect(() => {
    userRoleRef.current = userRole; // Actualiza el valor de userRoleRef cuando el estado de userRole cambie
  }, [userRole]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (err) {
        console.error(err.message);
      }

      fetchReservation();

      // Configuración del WebSocket solo si aún no se ha conectado
      if (!socketRef.current) {
        socketRef.current = io(API_URL, { transports: ['websocket'] });

        socketRef.current.on('new_reservation', (data) => {
          if (userRoleRef.current === "empleado") {
            console.log("Nueva reserva recibida:", data);
            fetchReservation(); // Actualiza las reservas al recibir un evento
          }
        });
        socketRef.current.on('client_cancel', (data) => {
          if (userRoleRef.current === "empleado") {
            console.log("Se ha cancelado la reserva con id: " + data.reservation);
            fetchReservation(); // Actualiza las reservas al recibir un evento
          }
        });
        socketRef.current.on('employee_cancel', (data) => {
          if (userId === data.customer) {
            console.log("Se ha cancelado tu reserva con id: " + data.reservation);
            fetchReservation(); // Actualiza las reservas al recibir un evento
          }
        });
        socketRef.current.on('client_edit', (data) => {
          if (userRoleRef.current === "empleado") {
            console.log("Se ha editado la reserva con id: " + data.reservation);
            fetchReservation(); // Actualiza las reservas al recibir un evento
          }
        });
        socketRef.current.on('employee_edit', (data) => {
          if (userId === data.customer) {
            console.log("Se ha editado tu reserva con id: " + data.reservation);
            fetchReservation(); // Actualiza las reservas al recibir un evento
          }
        });
      }
    }
  }, [token, fetchReservation, API_URL, userId]);

  const handleCancelReservation = (reservationId) => {
    setReservationToCancel(reservationId);
    setShowModal(true);
  };

  const confirmCancelReservation = async () => {
    try {
      await axios.put(`${API_URL}/reservation/${reservationToCancel}/cancel`, { state: "CANCELADA", userRole });
      setShowModal(false);
      setReservationToCancel(null);
      fetchReservation();
    } catch (error) {
      setError("Error al cancelar la reserva");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    // Asegúrate de que la fecha se maneje en UTC
    const date = new Date(dateString);

    // Convierte la fecha a la zona horaria local de Colombia (America/Bogota)
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }));

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return localDate.toLocaleDateString('es-ES', options);
  };


  const openEditModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowEditModal(true);
  };

  const updateReservation = (updatedReservation) => {
    console.log('Reserva actualizada:', updatedReservation);
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

  // Filtrar las reservas según el filtro y si se selecciona "Mostrar solo las reservas de hoy"
  const sortedAndFilteredReservations = reservations
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter((reservation) => {
      if (filter !== "todas" && reservation.state !== filter) return false;
      if (showTodayOnly) {
        const today = new Date();
        const reservationDate = new Date(reservation.date);
        return today.toDateString() === reservationDate.toDateString(); // Solo las reservas de hoy
      }
      return true;
    });

  const getAlertMessage = () => {
    if (sortedAndFilteredReservations.length > 0) return "";
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
      {/* Checkbox para mostrar solo las reservas de hoy */}
      <div className="d-flex justify-content-center mb-3">
        <div className="back-checkbox">
          <Form.Check
            type="checkbox"
            id="todayOnlyCheckbox"
            label="Mostrar las reservas de hoy"
            checked={showTodayOnly}
            onChange={() => setShowTodayOnly(!showTodayOnly)}
            className="custom-checkbox"
          />
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
          <Spinner animation="border" variant="primary">
            <span className="visually-hidden">Cargando reservas...</span>
          </Spinner>
        </div>
      ) : sortedAndFilteredReservations.length === 0 ? (
        <Alert variant="info">{getAlertMessage()}</Alert>
      ) : (
        <Row>
          {sortedAndFilteredReservations.map((reservation, index) => (
            <Col key={reservation.id} md={3} className="mb-3">
              <Card style={{ backgroundColor: getCardBackgroundColor(reservation.state), height: "350px" }}>
                <Card.Body>
                  <Card.Title>Reserva {index + 1}</Card.Title>
                  <Card.Text>Fecha: {formatDate(reservation.date)}</Card.Text>
                  <Card.Text>Hora de ingreso: {formatTimeTo12Hour(reservation.start_hour)}</Card.Text>
                  <Card.Text>Hora de salida: {formatTimeTo12Hour(reservation.end_hour)}</Card.Text>
                  <Card.Text>Número de personas: {reservation.num_people}</Card.Text>
                  <Card.Text>Estado: {reservation.state}</Card.Text>
                  {userRole === "empleado" && (
                    <Card.Text>Usuario: {reservation.name} {reservation.last_name}</Card.Text>
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
                  {reservation.state === 'CANCELADA' && (
                    <Card.Text>Fecha cancelación: {formatDate(reservation.cancellation_date)}</Card.Text>
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
          </Button>
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

UserReservations.propTypes = {
  userId: PropTypes.string.isRequired,
  filter: PropTypes.string.isRequired,
};

export default UserReservations;
