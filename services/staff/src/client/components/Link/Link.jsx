import PropTypes from 'prop-types';
import React from 'react';
import s from './Link.css';

export function Link ({ href, value }) {
    return (
        <div>
            <a className={s.input} href={href}>{value}</a>
        </div>
    );
}

Link.propTypes = {
    href: PropTypes.string,
    value: PropTypes.string
};
