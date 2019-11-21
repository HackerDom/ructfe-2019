import React from 'react';
import s from './Row.css';
import cn from 'classnames';

export function Row ({ children, gap, className }) {
    // if (children.length !== 2) {
    //     throw new Error('Row should contain two children');
    // }

    const style = {
        width: gap
    };

    return (
        <div className={cn(s.row, className)}>
            {children.map(child => <div style={style} className={s.child}>{child}</div>)}
            {/*<div style={style} className={s.child}>{children}</div>*/}
            {/*<div style={style} className={s.child}>{children[0]}</div>*/}
            {/*<div className={s.child}>{children[1]}</div>*/}
        </div>
    );
}
