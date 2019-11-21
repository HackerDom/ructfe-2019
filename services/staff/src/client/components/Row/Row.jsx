import React from 'react';
import s from './Row.css';
import cn from 'classnames';

export function Row ({ children, gap, className }) {
    console.log(children);
    if (children.length <= 1) {
        throw new Error('Row should contain at least one element');
    }

    const style = {
        width: gap
    };

    return (
        <div className={cn(s.row, className)}>
            <div style={style} className={s.child}>{children[0]}</div>
            {children.slice(1).map(child => <div className={s.child}>{child}</div>)}
        </div>
    );
}
