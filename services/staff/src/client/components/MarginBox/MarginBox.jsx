import React from 'react';
import s from './MarginBox.css';
import cn from 'classnames';

export function MarginBox ({ children, alignCenter }) {
    return (
        <div
            className={cn(s.marginBox, { [s.alignCenter]: alignCenter })}
        >
            {children}
        </div>
    );
}
