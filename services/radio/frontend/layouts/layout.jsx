import React from 'react';
import PropTypes from 'prop-types';
import Nav from '../components/Nav/Nav';

export default class Layout extends React.Component {
    static propTypes = {
        children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
    }

    render() {
        const { children } = this.props;

        return <React.Fragment>
            <Nav />
            {children}
        </React.Fragment>;
    }
}
