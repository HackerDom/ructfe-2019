import React from 'react';
import s from './Snackbar.css';

/**
 * @return {null}
 */
export function Snackbar ({ message }) {
    if (!message) {
        return null;
    }

    return (
        <div className={s.notify}>
            {message}
        </div>
    );
}
