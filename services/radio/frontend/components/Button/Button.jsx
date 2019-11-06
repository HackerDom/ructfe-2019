import React from 'react';
import PropTypes from 'prop-types';

import BaseButton from './BaseButton';

export default class Button extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        modifiers: PropTypes.arrayOf(PropTypes.string),
        disabled: PropTypes.bool,
        onClick: PropTypes.func
    }

    static defaultProps = {
        onClick: () => {},
        disabled: false
    }

    render() {
        const {
            title,
            disabled,
            onClick,
            modifiers
        } = this.props;
        const transformedModifiers = [...modifiers];
        if (disabled) {
            transformedModifiers.push('disabled');
        }
        return (<BaseButton
            onClick={(e) => {
                if (!disabled) {
                    onClick(e);
                }
            }}
            modifiers={transformedModifiers}>
            <div className="button__inner">{title}</div>
        </BaseButton>);
    }
}
