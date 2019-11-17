import PropTypes from 'prop-types';
import React from 'react';

export function Input ({ onChange, value }) {
    const changeHandler = (e) => onChange(e.target.value);

    return (
        <input
            value={value}
            onChange={changeHandler}
        />
    );
}

Input.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string
};
