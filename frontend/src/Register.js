import React, { useState } from "react";
import MyNavbar from "./components/myNavbar";
import { Container, Form, Button, FormControl } from "react-bootstrap";
import axios from "axios";

const Register = ()  => {
    const [formData, setFormData] = useState({
        name: "",
        last_name : "",
        email: "",
        phone: "",
        password: ""
    });

    const handleChange = (e) => {
        const{ name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await axios.post("http://localhost:5000/register", formData);
            alert("Resgistro exitoso");
            setFormData({
                name: "",
                last_name: "",
                email: "",
                phone: "",
                password: "",
            });
        }catch(error){
            console.error("Error en el registro:", error.response.data);
            if (error.response.data.message === "El correo electrónico ya está en uso") {
                alert("El correo ya está en uso. Por favor, ingresa otro correo.");
            }else if(error.response.data.message === "El número telefónico ya está en uso"){
                alert("El número de telefono ya está en uso, ingrese otro número")
            }
             else {
                alert("Error al registrar: " + error.response.data.message);
            }
        }
    };


    return(
        <div className="fondo">
                <MyNavbar />
            <Container className="mt-5 p-5 border rounded text-white" style={{ backgroundColor: '#242424', maxWidth: '500px' }}>
                <h2 className="text-center mb-3">Registro de usuario nuevo</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <FormControl
                        type="text"
                        placeholder="Ingrese su nombre"
                        name= "name"
                        value={formData.name}
                        onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Apellidos</Form.Label>
                        <FormControl
                        type="text"
                        placeholder="Ingrese sus apellidos"
                        name= "last_name"
                        value={formData.last_name}
                        onChange={handleChange}

                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Télefono</Form.Label>
                        <FormControl
                        type="text"
                        placeholder="Ingrese su número telefonico"
                        name= "phone"
                        value={formData.phone}
                        onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Correo</Form.Label>
                        <FormControl
                        type="text"
                        placeholder="Ingrese su correo electronico"
                        name= "email"
                        value={formData.email}
                        onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <FormControl
                        type="password"
                        placeholder="Ingrese su contraseña"
                        name= "password"
                        value={formData.password}
                        onChange={handleChange}
                        />
                    </Form.Group>
                    <div className="text-center">
                    <Button variante="primary" type="submit" className="mt-3">Registrarse</Button>
                    </div>
                </Form>

            </Container>
        </div>
    )
}

export default  Register;

