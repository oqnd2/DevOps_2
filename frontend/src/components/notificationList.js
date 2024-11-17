import React, { useState } from "react";
import axios from "axios";
import { ListGroup, Button, Alert, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const NotificationList = ({ notifications, fetchNotification }) => {

  const API_URL = process.env.REACT_APP_API_URL;
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async (notificationId) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/notificationdelete`, {
        notificationId,
      });
      fetchNotification();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Ordenar las notificaciones por fecha de creación (de más reciente a más antiguo)
  const sortedNotifications = notifications.sort((a, b) => {
    return new Date(b.creation_date) - new Date(a.creation_date);
  });

  return (
    <div className="notification-list">
      {sortedNotifications.length === 0 ? (
        <Alert variant="info" className="text-center">
          No hay notificaciones.
        </Alert>
      ) : (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <ListGroup>
            {sortedNotifications.map((notification) => (
              <ListGroup.Item
                key={notification.id}
                className="d-flex justify-content-between align-items-center"
              >
                <span>{notification.message}</span>
                <Button
                  variant="danger"
                  size="sm"
                  className="ms-2"
                  disabled={isLoading}
                  onClick={() => onDelete(notification.id)}
                >
                  {isLoading ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    <FontAwesomeIcon icon={faTrash} />
                  )}
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
