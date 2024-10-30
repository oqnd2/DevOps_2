import React, { useState, useEffect } from "react";
import MyNavbar from "../components/myNavbar";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

const Login = () => {
    const userId = localStorage.getItem('userId');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (userId) {
            window.location.href = '/';
        }
    });

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/login', {
                email,
                password,
            });

            // Guardar el token y el nombre de usuario en localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.name); // Almacenar el nombre
            localStorage.setItem('userRole', response.data.role); // Almacenar el rol
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userId', response.data.id);

            window.location.href = '/reservations';
        } catch (err) {
            setError(err.response?.data || 'An error occurred');
        }
    };

    return (

        <div className="fondo">
            <div>
                <MyNavbar />
            </div>
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px)' }}>

                <Form onSubmit={handleLogin} style={{ background: '#242424', width: '300px' }} className="text-white p-4 rounded border">
                    {error && <Alert variant='danger' className=''>{error}</Alert>}
                    <h2 className="text-center mb-4">Iniciar sesión</h2>
                    <Form.Group className="mb-3">
                        <Form.Label>Correo:</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-secondary text-white"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Contraseña:</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-secondary text-white"
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100">
                        Ingresar
                    </Button>
                </Form>

            </Container>
        </div>
    );
}

export default Login