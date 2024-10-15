import React, {useEffect} from "react";
import MyNavbar from "../components/myNavbar";
import FloatingButton from "../components/floatingButton";

const Reservations = () =>{

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if(!userId){
            window.location.href = '/login';
        }
    })

    return (
        <div>
            <div className="fondo">
                <MyNavbar/>
                <FloatingButton/>
            </div>
            <h1>Panel reservas clientes</h1>
        </div>
    )
};

export default Reservations