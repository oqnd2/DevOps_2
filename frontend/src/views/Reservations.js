import React, {useEffect, useState} from "react";
import MyNavbar from "../components/myNavbar";
import FloatingButton from "../components/floatingButton";
import ModalReservation from "../components/ModalReservation";
import UserReservations from "../components/UserReservations";

const Reservations = () =>{
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole')

    useEffect(() => {
        if(!userId){
            window.location.href = '/login';
        }
    },[userId]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal =  () => { 
        setIsModalOpen(false);
    };

    return (
        <div>
        <div className="fondo">
            <MyNavbar />
            {userRole === 'cliente' && (
                <FloatingButton onClick={handleOpenModal} />
            )};
            <UserReservations userId={userId} />
        </div>
        <ModalReservation isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
    );
};

export default Reservations;