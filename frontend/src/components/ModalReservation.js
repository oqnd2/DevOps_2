import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

const ModalReservation = ({ isOpen, onClose }) => {
  const token = localStorage.getItem("token");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState();
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    date: "",
    start_hour: "",
    end_hour: "",
    num_people: "",
  });

  useEffect(() => {
    if (token) {
      try {
        const decode = jwtDecode(token);
        setUserId(decode.id);
      } catch (err) {
        console.log(err.message);
      }
    }
  }, [setUserId, token]);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const generateTimes = () => {
    const hours = [];
    for (let i = 11; i <= 21; i++) {
      const hour = i <= 12 ? i : i - 12;
      const period = i < 12 ? "am" : "pm";
      hours.push(`${hour.toString().padStart(2, "0")}:00 ${period}`);
    }
    return hours;
  };

  const handleStartHours = (e) => {
    const selectedTime = e.target.value;
    setFormData({
      ...formData,
      start_hour: selectedTime,
    });

    const [hour, period] = selectedTime.split(" ");
    let endHour = parseInt(hour) + 2;

    let newPeriod = period;
    if (endHour > 12) {
      endHour = endHour - 12;
      newPeriod = period === "am" ? "pm" : "am";
    }

    setFormData({
      ...formData,
      start_hour: selectedTime,
      end_hour: `${endHour.toString().padStart(2, "0")}:00 ${newPeriod}`,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //Crear reserva
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reservationData = {
        ...formData,
        id_user: userId,
      };

      const response = await axios.post(`${API_URL}/reservation`, reservationData);

      setFormData({
        date: "",
        start_hour: "",
        end_hour: "",
        num_people: "",
      });

      setError(""); // Limpia errores previos
      setSuccessMessage(response.data.message || "Reserva realizada satisfactoriamente");
      setShowSuccessModal(true); // Mostrar el modal de éxito
      onClose(); // Cierra el formulario de reserva
    } catch (error) {
      if (error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Hubo un error al realizar la reserva");
      }
    }
  };

  return (
    <>
      <Modal show={isOpen} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Realiza tu reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFecha" className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getCurrentDate()}
                required
              />
            </Form.Group>
            <Form.Group controlId="formHoraIngreso" className="mb-3">
              <Form.Label>Hora de ingreso</Form.Label>
              <Form.Control
                as="select"
                name="start_hour"
                value={formData.start_hour}
                onChange={handleStartHours}
                required
              >
                <option value="">Seleccione una hora</option>
                {generateTimes().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formHoraSalida" className="mb-3">
              <Form.Label>Hora de Salida</Form.Label>
              <Form.Control
                type="text"
                name="end_hour"
                value={formData.end_hour}
                onChange={handleChange}
                readOnly
                required
              />
            </Form.Group>
            <Form.Group controlId="formPersona" className="mb-3">
              <Form.Label>Número de personas</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="6"
                name="num_people"
                value={formData.num_people}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
              <Button variant="primary" type="submit">
                Reservar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de confirmación */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>¡Reserva exitosa!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{successMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => {
              setShowSuccessModal(false);
              window.location.reload();
            }}
          >
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

ModalReservation.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalReservation;
