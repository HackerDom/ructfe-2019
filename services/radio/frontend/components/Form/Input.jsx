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
        onKeyPress: PropTypes.func,
        classes: PropTypes.arrayOf(PropTypes.string),
        errors: PropTypes.arrayOf(PropTypes.string),
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
        onKeyPress: () => {}
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
            hasErrors
        } = this.props;
        const endlessType = isHidden ? 'hidden' : type;
        const classNames = ['form_input', ...classes];
        if (isHidden) {
            classNames.push('form_input--hidden');
        }
        if ((errors && errors.length > 0) || hasErrors) {
            classNames.push('form_input--error');
        }
        return <div className={classNames.join(' ')}>
            <div className='form_input__inner'>
                { !isHidden && label && <label htmlFor={id} className='form_input_label' dangerouslySetInnerHTML={{ __html: label }}></label> }
                <input id={id} type={endlessType} name={name}
                    onKeyPress={onKeyPress.bind(this)}
                    className='form_input__input'
                    ref={this.inputRef}
                    onChange={onChange.bind(this)} {...inputAttrs}/>
                { !isHidden && errors && errors.length > 0 && <Errors errors={errors} />}
            </div>
        </div>;
    }
}
