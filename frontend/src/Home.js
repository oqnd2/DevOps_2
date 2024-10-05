import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MyNavbar from './components/myNavbar';
import './index.css';
import icono from './icono.png'; 


const Home = () => {
    return (
      <div className="App vh-100 overflow-hidden">
        <MyNavbar />
        <Container fluid className="App-header d-flex align-items-center">
          <Row className="w-100 mx-0">
            <Col md={6} className="text-start px-5">
            <img src={icono} alt="Icono" className="icono" style={{ width: '150px', height: 'auto' }} />
              <h1 className='text_tittle'>Bienvenido</h1>
              <p className='text'>Realiza tus pedidos de manera rápida y fácil.</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
}

export default Home;



