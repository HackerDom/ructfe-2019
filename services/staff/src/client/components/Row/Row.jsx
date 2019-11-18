import React from 'react';
import s from './Row.css';

export function Row ({ children, gap }) {
    if (children.length !== 2) {
        throw new Error('Row should contain two children');
    }

    const style = {
        width: gap
    };

    return (
        <div className={s.row}>
            <div style={style} className={s.leftElementContainer}>
                <div className={s.leftElement}>{children[0]}</div>
            </div>
            <div>{children[1]}</div>
        </div>
    );
}
