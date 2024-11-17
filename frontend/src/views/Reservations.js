import React, { useEffect, useState } from "react";
import MyNavbar from "../components/myNavbar";
import { Container, Button } from "react-bootstrap";
import FloatingButton from "../components/floatingButton";
import ModalReservation from "../components/ModalReservation";
import UserReservations from "../components/UserReservations";
import { jwtDecode } from "jwt-decode";

const Reservations = () => {

    const token = localStorage.getItem('token');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState("todas"); // Estado para el filtro
    
    const [userId, setUserId] = useState();
    const [userRole, setUserRole] = useState();

    useEffect(() => {
        if (token) {
            try {
                const decode = jwtDecode(token);
                setUserId(decode.id);
                setUserRole(decode.role);
            } catch (err) {
                console.log(err.message);
            }
        }
        else {
            window.location.href = '/login';
            
        }
    }, [token]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="fondo">
                <MyNavbar />
                {userRole === 'cliente' && (
                    <FloatingButton onClick={handleOpenModal} />
                )}

                {/* Agregar botones de filtro */}
                <Container className="d-flex justify-content-center mt-3">
                    <div className="filter-buttons">
                        <Button variant="light" className="mx-1" onClick={() => setFilter("todas")}>Todas</Button>
                        <Button variant="success" className="mx-1" onClick={() => setFilter("COMPLETADA")}>Completadas</Button>
                        <Button variant="primary" className="mx-1" onClick={() => setFilter("PENDIENTE")}>Pendientes</Button>
                        <Button variant="danger" className="mx-1" onClick={() => setFilter("CANCELADA")}>Canceladas</Button>
                    </div>
                </Container>

                <div>
                    {userId && <UserReservations userId={userId} filter={filter} />}
                </div>
            </div>
            <ModalReservation isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
    );
};

export default Reservations;