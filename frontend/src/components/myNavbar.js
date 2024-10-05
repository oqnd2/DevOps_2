import React from 'react';
import { Navbar, Nav, Button, Dropdown } from 'react-bootstrap';

const MyNavbar = () => {
  const userName = localStorage.getItem('userName'); // Obtener el nombre del usuario de localStorage
  const userRole = localStorage.getItem('userRole'); // Obtener el rol del usuario de localStorage

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole'); // Eliminar también el rol al cerrar sesión
    window.location.reload(); // Recargar la página para actualizar el navbar
  };

  const getPanelLink = () => {
    if (userRole === 'empleado') {
      return '/reservations-employ';
    } else if (userRole === 'cliente') {
      return '/reservations-clients';
    }
    return '/';
  };

  return (
    <Navbar bg="dark" variant='dark' expand="lg">
      <Navbar.Brand className='ms-3' href="/">
        <img src='https://cdn-icons-png.flaticon.com/512/272/272155.png' width="30" height="30" className='d-inline-block align-top me-3' alt="Logo de Mi Restaurante"></img>
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
              <Dropdown.Toggle variant="outline-light">
                {userName} {/* Muestra el nombre del usuario */}
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item href={getPanelLink()}>Reservas</Dropdown.Item>
                <Dropdown.Item href='/' onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              <Button variant="dark" className="me-2" href="/login">Iniciar Sesión</Button>
              <Button variant="outline-light" href="#register" className='me-3'>Registrarse</Button>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MyNavbar;
