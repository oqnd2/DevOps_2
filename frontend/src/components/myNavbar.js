// src/components/MyNavbar.js
import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';

const MyNavbar = () => {
    return (
        <Navbar bg="dark" variant='dark' expand="lg">
            <Navbar.Brand className='ms-3' href="#home">
                <img src='https://cdn-icons-png.flaticon.com/512/272/272155.png' width="30" height="30" className='d-inline-block align-top me-3' alt="Logo de Mi Restaurante"></img>
                Mi restaurante
                </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link href="#home">Inicio</Nav.Link>
                </Nav>
                <Nav className="ms-auto">
                    <Button variant="dark" className="me-2" href="#login">Iniciar Sesión</Button>
                    <Button variant="outline-light" href="#register" className='me-3'>Registrarse</Button>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default MyNavbar;
