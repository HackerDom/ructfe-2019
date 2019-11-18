import React from 'react';
import s from './Row.css';

export function Row (props) {
    const { children } = props;

    if (children.length !== 2) {
        throw new Error('Row should contain two children');
    }

    return (
        <div className={s.row}>
            <div className={s.rightElement}>{children[0]}</div>
            {children[1]}
        </div>
    );
}
