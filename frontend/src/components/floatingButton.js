import React from 'react';
import PropTypes from 'prop-types';

const FloatingButton = ({ onClick }) => {
  return (
    <button className="floating-button" onClick={onClick}>
      Hacer reserva
    </button>
  );
};

// Agregar validación de props
FloatingButton.propTypes = {
  onClick: PropTypes.func.isRequired,  // Validar que 'onClick' es una función y es obligatoria
};

export default FloatingButton;