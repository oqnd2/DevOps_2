import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

const EditReservationModal = ({ showEditModal, setShowEditModal, selectedReservation, updateReservation, fetchReservation }) => {

  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');
  const [userRole, setUserRole] = useState();

  const [formData, setFormData] = useState({
    date: '',
    start_hour: '',
    end_hour: '',
    num_people: 1,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      try {
        const decode = jwtDecode(token);
        setUserRole(decode.role);
      } catch (err) {
        console.log(err.message);
      }
    }

    if (selectedReservation) {
      setFormData({
        date: selectedReservation.date.split("T")[0],
        start_hour: formatTime(selectedReservation.start_hour),
        end_hour: formatTime(selectedReservation.end_hour),
        num_people: selectedReservation.num_people,
      });
    }

    setError("");
  }, [selectedReservation, token]);

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour < 12 ? "am" : "pm";
    const formattedHour = (hour % 12 === 0 ? 12 : hour % 12).toString().padStart(2, "0"); // Convertir a formato de 12 horas
    return `${formattedHour}:${minutes} ${period}`; // Retornar el formato deseado
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleSave = async (e) => {
    e.preventDefault();

    // Convertir horas al formato correcto
    const convertTo24HourFormat = (time) => {
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':');
      if (modifier === 'pm' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
      } else if (modifier === 'am' && hours === '12') {
        hours = '00';
      }
      return `${hours}:${minutes}:00`; // Devuelve en formato HH:mm:ss
    };

    const updatedReservation = {
      ...formData,
      start_hour: convertTo24HourFormat(formData.start_hour), // Convertir hora de inicio
      end_hour: convertTo24HourFormat(formData.end_hour), // Convertir hora de fin
      role: userRole,
      id: selectedReservation.id, // Incluimos el ID de la reserva que estamos editando
    };

    // Hacemos la petición PUT para actualizar la reserva
    try {
      const response = await axios.put(
        `${API_URL}/reservation/${selectedReservation.id}`,
        updatedReservation
      );

      console.log("Reserva actualizada:", response.data);
      updateReservation(updatedReservation); // Actualizamos la reserva en la vista principal
      fetchReservation();
      handleClose(); // Cerramos el modal
    } catch (error) {
      if (error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Hubo un error al realizar la reserva");
      }
    }
  };


  const generateTimes = () => {
    const hours = [];
    for (let i = 11; i <= 21; i++) {
      const hour = i <= 12 ? i : i - 12;
      const period = i < 12 ? "am" : "pm";
      hours.push(
        `${hour.toString().padStart(2, "0")}:00 ${period}`
      )
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
    })

  };

  const handleClose = () => {
    setShowEditModal(false); // Cierra el modal al cambiar el estado
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  return (
    <Modal show={showEditModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Reserva</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        <Form onSubmit={handleSave}>
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
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// Definir PropTypes después del componente
EditReservationModal.propTypes = {
  showEditModal: PropTypes.bool.isRequired,
  setShowEditModal: PropTypes.func.isRequired,
  selectedReservation: PropTypes.shape({
    id: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    start_hour: PropTypes.string.isRequired,
    end_hour: PropTypes.string.isRequired,
    num_people: PropTypes.number.isRequired,
  }).isRequired,
  updateReservation: PropTypes.func.isRequired,
  fetchReservation: PropTypes.func.isRequired,
};


export default EditReservationModal;