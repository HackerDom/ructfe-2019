import cn from 'classnames';
import s from './BorderBox.css';
import React from 'react';

export function BorderBox ({ children, style}) {
    return (
        <div
            className={cn(s.boarderBox)}
            style={style}
        >
            {children}
        </div>
    );
}
