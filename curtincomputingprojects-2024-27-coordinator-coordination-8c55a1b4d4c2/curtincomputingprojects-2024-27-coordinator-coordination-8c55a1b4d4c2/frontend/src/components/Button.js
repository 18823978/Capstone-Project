import React from 'react';
import './Button.css';

const Button = ({ label, onClick, size = 'normal', type ="button" }) => {
  return (
    <button className={`button ${size}`} onClick={onClick} type={type}>
      {label}
    </button>
  );
};

export default Button;
