import React, { useState, useEffect } from "react";
import MyNavbar from "../components/myNavbar";
import { Container, Form, Button, FormControl, Alert, Modal } from "react-bootstrap";
import axios from "axios";

const Register = () => {
    const userId = localStorage.getItem('userId');

    const [error, setError] = useState('');
    const [show, setShow] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleShow = () => setShow(true);

    useEffect(() => {
        if (userId) {
            window.location.href = '/';
        }
    });

    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if(confirmPassword !== formData.password){
                setError('Las contraseñas no coinciden');
                return;
            }
            
            const response = await axios.post("http://localhost:5000/register", formData);
            console.log(response.data.message);
            handleShow();
            setFormData({
                name: "",
                last_name: "",
                email: "",
                phone: "",
                password: "",
            });
        } catch (error) {
            console.error("Error en el registro:", error.response.data);
            if (error.response.data.message === "El correo electrónico ya está en uso") {
                setError("El correo ya está en uso. Por favor, ingresa otro correo.");
            } else if (error.response.data.message === "El número telefónico ya está en uso") {
                setError("El número de telefono ya está en uso, ingrese otro número")
            }
            else {
                setError("Error al registrar: " + error.response.data.message);
            }
        }
    };

    const redirect = () => {
        window.location.href = '/login';
    }


    return (
        <div className="fondo">
            <MyNavbar />
            <Modal show={show}>
                <Modal.Header closeButton>
                    <Modal.Title>EXITO</Modal.Title>
                </Modal.Header>
                <Modal.Body>Te has registrado exitosamente</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={redirect}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
            <Container className="mt-5 p-5 border rounded text-white" style={{ backgroundColor: '#242424', maxWidth: '500px' }}>
                {error && <Alert variant='danger' className=''>{error}</Alert>}
                <h2 className="text-center mb-3">Registro de usuario nuevo</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <FormControl
                            type="text"
                            placeholder="Ingrese su nombre"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Apellidos</Form.Label>
                        <FormControl
                            type="text"
                            placeholder="Ingrese sus apellidos"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Télefono</Form.Label>
                        <FormControl
                            type="number"
                            placeholder="Ingrese su número telefonico"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Correo</Form.Label>
                        <FormControl
                            type="text"
                            placeholder="Ingrese su correo electronico"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <FormControl
                            type="password"
                            placeholder="Ingrese su contraseña"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Confirmar contraseña</Form.Label>
                        <FormControl
                            type="password"
                            placeholder="Ingrese su contraseña"
                            name="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <div className="text-center">
                        <Button variante="primary" type="submit" className="mt-3">Registrarse</Button>
                    </div>
                </Form>

            </Container>
        </div>
    )
}

export default Register;

