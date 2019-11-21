import PropTypes from 'prop-types';
import React from 'react';
import s from './Input.css';

export function Input ({ onChange, value }) {
    const changeHandler = (e) => onChange(e.target.value);

    return (
        <div>
            <input
                value={value}
                onChange={changeHandler}
                className={s.input}
            />
        </div>
    );
}

Input.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string
};
