import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Button from '../Button/Button';
import Input from '../Form/Input';
import PasswordInput from '../Form/PasswordInput';

import { registerUser } from '../../actions/register/actions';

class RegisterForm extends React.Component {
    static propTypes = {
        registerUser: PropTypes.func,
        errors: PropTypes.shape({
            username: PropTypes.arrayOf(PropTypes.string),
            password: PropTypes.arrayOf(PropTypes.string),
            repeated_password: PropTypes.arrayOf(PropTypes.string),
        })
    }

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            repeated_password: ''
        };
    }

    onInputHandler(fieldName, fieldValue, e) {
        const isValid = e.target.validity.valid;
        const value = isValid ? e.target.value : fieldValue;
        this.setState({
            [fieldName]: value
        });
    }

    registerUser() {
        const { registerUser } = this.props;
        const {
            // eslint-disable-next-line camelcase
            username, password, repeated_password
        } = this.state;

        registerUser({ username, password, repeated_password });
    }

    render() {
        const { errors } = this.props;
        const {
            // eslint-disable-next-line camelcase
            username, password, repeated_password
        } = this.state;

        return <div className='register-form'>
            <div className='register-form__title'>Create your account</div>
            <div className='register-form__username'>
                <Input id='username' name='username' type="text"
                    errors={errors.username}
                    onEnterPress={() => {
                        this.registerUser();
                    }}
                    inputAttrs={{
                        autoFocus: true,
                        placeholder: 'Username',
                        value: username,
                        pattern: '^[\\d\\w]+$',
                        onInput: (e) => {
                            this.onInputHandler('username', username, e);
                        }
                    }}/>
            </div>
            <div className='register-form__password'>
                <PasswordInput id='password' name='password'
                    errors={errors.password}
                    onEnterPress={() => {
                        this.registerUser();
                    }}
                    inputAttrs={{
                        placeholder: 'Password',
                        value: password,
                        pattern: '^[\\d\\w]+$',
                        onInput: (e) => {
                            this.onInputHandler('password', password, e);
                        }
                    }}/>
            </div>
            <div className='register-form__password'>
                <PasswordInput id='repeated_password' name='repeated_password'
                    errors={errors.repeated_password || errors.__all__}
                    onEnterPress={() => {
                        this.registerUser();
                    }}
                    inputAttrs={{
                        placeholder: 'Repeat password',
                        value: repeated_password,
                        pattern: '^[\\d\\w]+$',
                        onInput: (e) => {
                            this.onInputHandler('repeated_password', repeated_password, e);
                        }
                    }}/>
            </div>
            <div className='register-form__submit'>
                <Button title='Sign Up' modifiers={['white', 'register']} onClick={() => {
                    this.registerUser();
                }} />
            </div>
        </div>;
    }
}

const mapStateToProps = (state) => ({
    errors: state.register.errors
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    registerUser
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
