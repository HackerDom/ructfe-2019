import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Spring from '../Spring/Spring';

export default class Nav extends React.Component {
    static propTypes = {}

    render() {
        return <nav className='radio-nav'>
            <Link to='/' className='radio-nav__item radio-nav-item'>Main</Link>
            <Spring />
            <Link to='/signin/' className='radio-nav__item radio-nav-item'>Sign in</Link>
            <Link to='/signup/' className='radio-nav__item radio-nav-item radio-nav-item--with-border'>Sign up</Link>
        </nav>;
    }
}
