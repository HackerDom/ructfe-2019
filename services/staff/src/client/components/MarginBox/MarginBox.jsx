import React from 'react';
import s from './MarginBox.css';

export function MarginBox ({ children }) {
    return (
        <div className={s.marginBox}>{children}</div>
    );
}
