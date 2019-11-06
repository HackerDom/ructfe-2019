import React from 'react';
import PropTypes from 'prop-types';
import passwordGenerator from 'password-generator';

import Errors from './Errors';

export default class PasswordInput extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        name: PropTypes.string,
        onChange: PropTypes.func,
        inputAttrs: PropTypes.shape({}),
        onKeyPress: PropTypes.func,
        onPasswordGenerate: PropTypes.func,
        classes: PropTypes.arrayOf(PropTypes.string),
        errors: PropTypes.arrayOf(PropTypes.string),
        withGenerator: PropTypes.bool
    }

    static defaultProps = {
        errors: [],
        onChange: () => {},
        inputAttrs: {},
        onKeyPress: () => {},
        classes: [],
        onPasswordGenerate: () => {},
        withGenerator: true
    }

    constructor(props) {
        super(props);

        this.passwordInputRef = React.createRef();
    }

    generatePassword(e) {
        const { onPasswordGenerate } = this.props;
        const password = passwordGenerator(16, false);
        this.passwordInputRef.current.value = password;
        onPasswordGenerate(password);
        e.stopPropagation();
    }

    render() {
        const {
            id,
            name,
            label,
            errors,
            classes,
            onChange,
            inputAttrs,
            onKeyPress,
            withGenerator
        } = this.props;

        const classNames = ['form_input', 'form_input_password', ...classes];
        if (errors && errors.length > 0) {
            classNames.push('form_input_password--error');
        }

        return <div className={classNames.join(' ')}>
            <div className='form_input__inner'>
                { label && <label htmlFor={id} className='form_input_label' dangerouslySetInnerHTML={{ __html: label }}></label> }
                <div className='form_input_password_wrapper'>
                    <input id={id} type='text' name={name}
                        onKeyPress={onKeyPress.bind(this)}
                        className='form_input__input'
                        onChange={onChange.bind(this)}
                        ref={this.passwordInputRef}
                        {...inputAttrs}/>
                    { withGenerator && <div
                        className='form_input_password_wrapper__generator icon-password'
                        onClick={this.generatePassword.bind(this)}>
                    </div> }
                </div>
                { errors && errors.length > 0 && <Errors errors={errors} />}
            </div>
        </div>;
    }
}
