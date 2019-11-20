import React from 'react';
import s from './Text.css';
import PropTypes from 'prop-types';

export function Text ({ text, style }) {
    return <span style={style} className={s.text}>{text}</span>;
}

Text.propTypes = {
    text: PropTypes.string.isRequired,
    style: PropTypes.object
};

Text.defaultProps = {
    style: {}
};
