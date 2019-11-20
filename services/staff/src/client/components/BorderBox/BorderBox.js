import cn from 'classnames';
import s from './BorderBox.css';
import React from 'react';

export function BorderBox ({ children }) {
    return (
        <div
            className={cn(s.boarderBox)}
        >
            {children}
        </div>
    );
}
