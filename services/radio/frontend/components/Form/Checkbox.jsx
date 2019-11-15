import React from 'react';
import PropTypes from 'prop-types';

import Errors from './Errors.jsx';

export default class Checkbox extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        onChange: PropTypes.func,
        onEnterPress: PropTypes.func,
        inputAttrs: PropTypes.shape({}),
        errors: PropTypes.arrayOf(PropTypes.string)
    }

    static defaultProps = {
        onChange: () => {},
        onEnterPress: () => {},
        errors: []
    }

    render() {
        const {
            inputAttrs, children, id, errors, name, onChange,
            onEnterPress,
        } = this.props;

        return <div className='form-checkbox'>
            <div className='form-checkbox__inner form-checkbox-inner'>
                <input id={id} name={name} onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                        onEnterPress(e);
                    }
                }} type="checkbox" {...inputAttrs}
                onChange={onChange.bind(this)} className="form-checkbox-inner__input"/>
                { children && <label htmlFor={id}
                    className="form-checkbox-inner__label form-checkbox-label">
                    <div className="form-checkbox-label__content">{children}</div>
                </label> }
                { errors && errors.length > 0 && <Errors errors={errors} />}
            </div>
        </div>;
    }
}
