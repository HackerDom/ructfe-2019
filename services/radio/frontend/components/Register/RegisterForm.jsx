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
        registerUser: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password1: '',
            password2: ''
        };
    }

    onInputHandler(fieldName, fieldValue, e) {
        const isValid = e.target.validity.valid;
        const value = isValid ? e.target.value : fieldValue;
        this.setState({
            [fieldName]: value
        });
    }

    render() {
        const { registerUser } = this.props;
        const {
            username, password1, password2
        } = this.state;

        return <div className='register-form'>
            <div className='register-form__username'>
                <Input id='username' name='username' type="text"
                    inputAttrs={{
                        placeholder: 'Username',
                        value: username,
                        pattern: '^[\\d\\w]+$',
                        onInput: (e) => {
                            this.onInputHandler('username', username, e);
                        }
                    }}/>
            </div>
            <div className='register-form__password'>
                <PasswordInput id='password1' name='password1'
                    inputAttrs={{
                        placeholder: 'Password',
                        value: password1,
                        pattern: '^[\\d\\w]+$',
                        onInput: (e) => {
                            this.onInputHandler('password1', password1, e);
                        }
                    }}/>
            </div>
            <div className='register-form__password'>
                <PasswordInput id='password2' name='password2'
                    inputAttrs={{
                        placeholder: 'Repeat password',
                        value: password2,
                        pattern: '^[\\d\\w]+$',
                        onInput: (e) => {
                            this.onInputHandler('password2', password2, e);
                        }
                    }}/>
            </div>
            <div className='register-form__submit'>
                <Button title='Sign Up' modifiers={['submit']} onClick={() => {
                    registerUser({ username, password1, password2 });
                }} />
            </div>
        </div>;
    }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    registerUser
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
