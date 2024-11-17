import React from "react";
import axios from "axios";
import { ListGroup, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const NotificationList = ({ notifications }) => {

  const API_URL = process.env.REACT_APP_API_URL;

  const onDelete = async (notificationId) => {
    try {
      await axios.post(`${API_URL}/notificationdelete`, {
        notificationId,
      });
  
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notification-list">
      {notifications.length === 0 ? (
        <Alert variant="info" className="text-center">
          No hay notificaciones.
        </Alert>
      ) : (
        <ListGroup>
          {notifications.map((notification) => (
            <ListGroup.Item
              key={notification.id}
              className="d-flex justify-content-between align-items-center"
            >
              <span>{notification.message}</span>
              <Button
                variant="danger"
                size="sm"
                className="ms-2"
                onClick={() => onDelete(notification.id)}
              >
                <FontAwesomeIcon icon={faTrash}/>
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default NotificationList;
