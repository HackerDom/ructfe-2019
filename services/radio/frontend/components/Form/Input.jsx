import React from 'react';
import PropTypes from 'prop-types';

import Errors from './Errors';

export default class Input extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        onChange: PropTypes.func,
        inputAttrs: PropTypes.shape({}),
        isHidden: PropTypes.bool,
        onEnterPress: PropTypes.func,
        onKeyPress: PropTypes.func,
        classes: PropTypes.arrayOf(PropTypes.string),
        errors: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
        hasErrors: PropTypes.bool
    }

    static defaultProps = {
        errors: [],
        onChange: () => {},
        inputAttrs: {},
        type: 'text',
        classes: [],
        isHidden: false,
        hasErrors: false,
        onEnterPress: () => {},
        onKeyPress: () => {},
    }

    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
    }

    cleanInput() {
        this.inputRef.current.value = '';
    }

    setValue(value) {
        this.inputRef.current.value = value;
    }

    focus() {
        this.inputRef.current.focus();
    }

    render() {
        const {
            id,
            name,
            type,
            label,
            errors,
            classes,
            onChange,
            isHidden,
            inputAttrs,
            onKeyPress,
            onEnterPress,
            hasErrors,
        } = this.props;
        const endlessType = isHidden ? 'hidden' : type;
        const classNames = ['form-input', ...classes];
        if (isHidden) {
            classNames.push('form-input--hidden');
        }
        if ((errors && errors.length > 0) || hasErrors) {
            classNames.push('form-input--error');
        }
        return <div className={classNames.join(' ')}>
            <div className='form-input__inner'>
                {!isHidden && label && <label htmlFor={id} className='form-input-label' dangerouslySetInnerHTML={{ __html: label }}></label> }
                <input id={id} type={endlessType} name={name}
                    onKeyPress={onKeyPress.bind(this)}
                    onKeyDown={(e) => {
                        if (e.keyCode === 13) {
                            onEnterPress(e);
                        }
                    }}
                    className='form-input__input'
                    ref={this.inputRef}
                    onChange={onChange.bind(this)} {...inputAttrs}/>
                {!isHidden && <Errors errors={errors} />}
            </div>
        </div>;
    }
}
