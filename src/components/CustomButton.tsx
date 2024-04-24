import React, { PropsWithChildren } from 'react';

interface CustomButtonProps {
  handleButton: () => void;
  isButtonActive: boolean;
  onColor?: string;
  offColor?: string;
}

const CustomButton: React.FC<PropsWithChildren<CustomButtonProps>> = ({ handleButton, isButtonActive, onColor = 'green', offColor = 'red', children }) => {
  const buttonColor = isButtonActive ? onColor : offColor;

  return (
    <button
      onClick={handleButton}
      style={{
        backgroundColor: buttonColor,
        color: '#ffffff',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        textAlign: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
};

export default CustomButton;