import React from 'react';
import s from './Row.css';

export function Row (props) {
    const { children } = props;

    if (children.length !== 2) {
        throw new Error('Row should contain two children');
    }

    return (
        <div className={s.row}>
            {children[0]}
            {children[1]}
        </div>
    );
}
