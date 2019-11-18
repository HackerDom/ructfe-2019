import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Spring from '../Spring/Spring';
import Submarine from '../Icon/Submarine';

class Nav extends React.Component {
    static propTypes = {
        user: PropTypes.shape({
            username: PropTypes.string,
        })
    }

    render() {
        const { user } = this.props;

        return <nav className='radio-nav'>
            <Link to='/' className='radio-nav__item radio-nav-item logo-nav'>
                <div className='logo-nav-text'>Radio</div>
                <Submarine />
            </Link>
            <Spring />
            {!user && <React.Fragment>
                <Link to='/signin/' className='radio-nav__item radio-nav-item'>Sign in</Link>
                <Link to='/signup/' className='radio-nav__item radio-nav-item radio-nav-item--with-border'>Sign up</Link>
            </React.Fragment>}
            {user && <React.Fragment>
                <div className='radio-nav__item radio-nav-item'>{user.username}</div>
                <a href='/logout/' className='radio-nav__item radio-nav-item radio-nav-item--with-border'>Logout</a>
            </React.Fragment>}
        </nav>;
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Nav);
