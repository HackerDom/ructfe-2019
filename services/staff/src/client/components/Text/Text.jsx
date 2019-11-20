import React from 'react';
import s from './Text.css';
import PropTypes from 'prop-types';

export function Text ({ text }) {
    return <span className={s.text}>{text}</span>;
}

Text.propTypes = {
    text: PropTypes.string
};
