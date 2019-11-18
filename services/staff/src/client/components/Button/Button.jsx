import s from './Button.css';
import React from 'react';

export function Button ({ text }) {
    return (
        <button className={s.button}>{text}</button>
    );
}
