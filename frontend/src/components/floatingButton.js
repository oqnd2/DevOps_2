import React from 'react';

const FloatingButton = ({ onClick }) => {
  return (
    <button className="floating-button" onClick={onClick}>
      Hacer reserva
    </button>
  );
};

export default FloatingButton;