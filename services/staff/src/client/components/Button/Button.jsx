import s from './Button.css';
import React from 'react';
import PropTypes from 'prop-types';

export function Button ({ text, onClick }) {
    const clickHandler = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <button
            className={s.button}
            onClick={clickHandler}
        >
            {text}
        </button>
    );
}

Button.propTyoes = {
    text: PropTypes.string,
    onClick: PropTypes.func
};
