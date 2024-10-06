import React, { useEffect, useState } from "react";
import MyNavbar from "./components/myNavbar";
import { Container, Form, Button, FormControl, Col, Row } from "react-bootstrap";
import axios from "axios";

const EditProfile  = () => {

    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const fetchUserData = async (email) => {
        try{
            const response = await axios.get(`http://localhost:5000/user/${email}`);
            setFormData(response.data);
        }catch(error){
            console.error("Error al obtener los datos del usuario", error);
            alert("No se pudo cargar los datos del usuario");
        }
    };

    useEffect(() => {
        const userEmail = localStorage.getItem("userEmail");
        if(userEmail){
            fetchUserData(userEmail)
        }
    }, []);

    const handleChange = (e) =>{
        const {name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    const hideFields = () => {
        const passwordFields = document.getElementById("passwordFields");
        if (passwordFields.style.display === "none" || passwordFields.style.display === "") {
            passwordFields.style.display = "block"; 
        }else {
            passwordFields.style.display = "none"; 
        }
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if(formData.newPassword && formData.newPassword !== formData.confirmPassword){
            alert("Las contraseñas no coinciden");
            return;
        }
        try{
            const response = await axios.post("http://localhost:5000/edit", {
                name: formData.name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                password: formData.newPassword || formData.currentPassword
            });
            if(response.status == 200){
                alert("El perfil se actualizo con éxito");
            }
            else{
                alert("Hubo un error al actualizar el perfil");
            }
        }catch(error){
            console.error("Error al actualizar el perfil", error);
            alert("Hubo un error en el servidor");
        }
    };

    return(
        <div>
                <MyNavbar />
            <Container className="mt-5 p-5 border rounded text-white" style={{ backgroundColor: '#181842', maxWidth: '700px' }}>
                <h2 className="text-center mb-3">Editar Perfil</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Row} className="mb-3 d-flex align-items-center">
                        <Form.Label column sm={3}>
                            Nombre
                        </Form.Label>
                        <Col sm={9}>
                        <FormControl 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 d-flex align-items-center">
                        <Form.Label column sm={3}>
                            Apellidos
                        </Form.Label>
                        <Col sm={9}>
                        <FormControl
                         type="text"
                         name="last_name"
                         value={formData.last_name}
                         onChange={handleChange}
                         />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 d-flex align-items-center">
                        <Form.Label column sm={3}>
                            Telefono
                        </Form.Label>
                        <Col sm={9}>
                        <FormControl 
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 d-flex align-items-center">
                        <Form.Label column sm={3}>
                            Correo
                        </Form.Label>
                        <Col sm={9}>
                        <FormControl 
                        type="text"
                        name="email"
                        value={formData.email}
                        readOnly
                        />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 d-flex align-items-center">
                    <Col sm={9}>
                        <Button variant="link" onClick={hideFields}>
                            Cambiar contraseña
                        </Button>
                    </Col>
                    </Form.Group>
                    <div id="passwordFields" style={{display: "none"}}>
                    <Form.Group as={Row} className="mb-3 d-flex align-items-center">
                        <Form.Label column sm={3}>
                            Contraseña actual
                        </Form.Label>
                        <Col sm={9}>
                        <FormControl 
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        
                        />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 d-flex align-items-center">
                        <Form.Label column sm={3}>
                            Contraseña nueva
                        </Form.Label>
                        <Col sm={9}>
                        <FormControl 
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 d-flex align-items-center">
                        <Form.Label column sm={3}>
                            Confirmar contraseña
                        </Form.Label>
                        <Col sm={9}>
                        <FormControl 
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        />
                        </Col>
                    </Form.Group>
                    </div>
                    <div className="text-center">
                    <Button variante="primary" type="submit" className="mt-3">Guardar Cambios</Button>
                    </div>
                </Form>

            </Container>
        </div>
    );
};
export default EditProfile;