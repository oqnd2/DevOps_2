import React, { useEffect, useState } from "react";
import MyNavbar from "../components/myNavbar";
import { Container, Button } from "react-bootstrap";
import FloatingButton from "../components/floatingButton";
import ModalReservation from "../components/ModalReservation";
import UserReservations from "../components/UserReservations";

const Reservations = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState("todas"); // Estado para el filtro
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        if (!userId) {
            window.location.href = '/login';
        }
    }, [userId]);

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
                        <Button variant="success" className="mx-1"  onClick={() => setFilter("COMPLETADA")}>Completadas</Button>
                        <Button variant="primary" className="mx-1"  onClick={() => setFilter("PENDIENTE")}>Pendientes</Button>
                        <Button variant="danger" className="mx-1"  onClick={() => setFilter("CANCELADA")}>Canceladas</Button>
                    </div>
                </Container>

                <div>
                    <UserReservations userId={userId} filter={filter} />
                </div>
            </div>
            <ModalReservation isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
    );
};

export default Reservations;
