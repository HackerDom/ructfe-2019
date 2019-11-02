import React from 'react';

export default class Submarine extends React.Component {
    render() {
        return <img className='logo-submarine' src='/static/icons/submarine.svg' height='32' width='32' {...this.props} />;
    }
}
