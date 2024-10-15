import React from 'react';
import { Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import '../index.css';
import icono from '../assets/icono.png';

const MyNavbar = () => {
  const userName = localStorage.getItem('userName'); // Obtener el nombre del usuario de localStorage

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    window.location.reload(); // Recargar la página para actualizar el navbar
  };

  return (
    <Navbar bg="black" variant='dark' expand="lg">
      <Navbar.Brand className='ms-3' href="/">
        <img src={icono} width="35" height="auto" className='d-inline-block align-top me-3' alt="Logo de Mi Restaurante"></img>
        Mi restaurante
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/">Inicio</Nav.Link>
        </Nav>
        <Nav className="ms-auto">
          {userName ? (
            <Dropdown>
              <Dropdown.Toggle variant="outline-light" className='me-3'>
                {userName} {/* Muestra el nombre del usuario */}
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item href={'/reservations'}>Reservas</Dropdown.Item>
                <Dropdown.Item href={'/edit-profile'}>Perfil</Dropdown.Item>
                <Dropdown.Item href='/' onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              <Button variant="dark" className="me-2" href="/login">Iniciar Sesión</Button>
              <Button variant="outline-light" href="/register" className='me-3'>Registrarse</Button>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MyNavbar;
