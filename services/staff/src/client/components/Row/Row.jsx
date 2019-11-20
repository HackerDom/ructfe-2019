import React from 'react';
import s from './Row.css';
import cn from 'classnames';

export function Row ({ children, gap, className }) {
    if (children.length !== 2) {
        throw new Error('Row should contain two children');
    }

    const style = {
        width: gap
    };

    return (
        <div className={cn(s.row, className)}>
            <div style={style} className={s.leftElementContainer}>
                <div className={s.leftElement}>{children[0]}</div>
            </div>
            <div className={s.rightElement}>{children[1]}</div>
        </div>
    );
}
