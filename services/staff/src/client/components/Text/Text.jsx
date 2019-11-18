import React from 'react';
import s from './Text.css';

export function Text ({ text }) {
    return <span className={s.text}>{text}</span>;
}
