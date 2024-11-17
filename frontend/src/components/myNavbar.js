import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar, Nav, Button, Dropdown, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faBell } from '@fortawesome/free-solid-svg-icons'; 
import './../styles/index.css';
import icono from '../assets/icono.png';
import NotificationList from './notificationList';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const MyNavbar = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');
  const [userName, setUserName] = useState();
  const [userId, setUserId] = useState();
  const [userRole, setUserRole] = useState();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationsRef = useRef(null);  // Ref para la lista de notificaciones

  // Obtener datos por medio del token
  useEffect(() => {
    if(token){
      try{
        const decode = jwtDecode(token);
        setUserName(decode.name);
        setUserId(decode.id);
        setUserRole(decode.role);
      }catch(err){
        console.log(err.message);
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // Recargar la página para actualizar el navbar
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const fetchNotification = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/notifications`, {
        userId,
        userRole
      });
      setNotifications(response.data);
    } catch (err) {
      console.error(err);
    }
  }, [userId, userRole, API_URL]);

  useEffect(() => {
    if(userId){
      fetchNotification();
    }
  }, [userId, fetchNotification]);

  // Detectar clic fuera de la lista de notificaciones
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          {token ? (
            <>
              <Button variant="outline-light" className="me-3 position-relative" onClick={toggleNotifications}>
                <FontAwesomeIcon icon={faBell} style={{ fontSize: '1rem' }} /> 
                {notifications.length > 0 && (
                  <Badge pill bg="danger" style={{ position: 'absolute', top: '0', right: '0' }}>
                    {notifications.length}
                  </Badge>
                )}
              </Button>

              <Dropdown>
                <Dropdown.Toggle variant="outline-light" className='me-3'>
                  {userName} 
                </Dropdown.Toggle>

                <Dropdown.Menu align="end">
                  <Dropdown.Item href={'/reservations'}>Reservas</Dropdown.Item>
                  <Dropdown.Item href={'/edit-profile'}>Perfil</Dropdown.Item>
                  <Dropdown.Item href='/' onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* Lista de notificaciones con ref */}
              {showNotifications && (
                <div ref={notificationsRef}>
                  <NotificationList notifications={notifications} fetchNotification={fetchNotification} />
                </div>
              )}
            </>
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
