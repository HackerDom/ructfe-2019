import React from 'react';
import PropTypes from 'prop-types';

export default class BaseButton extends React.Component {
    static propTypes = {
        children: PropTypes.object,
        onClick: PropTypes.func,
        modifiers: PropTypes.arrayOf(PropTypes.string)
    }

    static defaultProps = {
        onClick: () => {},
        modifiers: ['blue']
    }

    render() {
        const {
            onClick,
            children,
            modifiers
        } = this.props;

        return <div
            onClick={(e) => {
                onClick(e);
            }}
            className={`button ${modifiers.map((m) => `button--${m}`).join(' ')}`}>
            {children}
        </div>;
    }
}
