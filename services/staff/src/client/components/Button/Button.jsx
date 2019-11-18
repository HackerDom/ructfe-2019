import s from './Button.css';
import React from 'react';
import PropTypes from 'prop-types';

export function Button ({ text, onClick }) {
    return (
        <button
            className={s.button}
            onClick={onClick}
        >
            {text}
        </button>
    );
}

Button.propTyoes = {
    text: PropTypes.string,
    onClick: PropTypes.func
};
