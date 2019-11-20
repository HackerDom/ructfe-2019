import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Button from '../Button/Button';
import Input from '../Form/Input';
import PasswordInput from '../Form/PasswordInput';

import { loginUser } from '../../actions/login/actions';

class LoginForm extends React.Component {
    static propTypes = {
        loginUser: PropTypes.func,
        errors: PropTypes.shape({
            username: PropTypes.arrayOf(PropTypes.string),
            password: PropTypes.arrayOf(PropTypes.string),
            __all__: PropTypes.arrayOf(PropTypes.string)
        }),
    }

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
        };
    }

    loginUser() {
        const { loginUser } = this.props;
        const { username, password } = this.state;
        loginUser({ username, password });
    }

    onInputHandler(fieldName, fieldValue, e) {
        const isValid = e.target.validity.valid;
        const value = isValid ? e.target.value : fieldValue;
        this.setState({
            [fieldName]: value
        });
    }

    render() {
        const { loginUser, errors } = this.props;
        const {
            username, password
        } = this.state;

        return <div className='register-form'>
            <div className='register-form__title'>Login, create and share your playlist</div>
            <div className='register-form__username'>
                <Input id='username' name='username' type="text"
                    errors={errors.username}
                    onEnterPress={() => {
                        this.loginUser();
                    }}
                    inputAttrs={{
                        autoFocus: true,
                        value: username,
                        placeholder: 'Username',
                        pattern: '^[\\d\\w]+$',
                        onInput: (e) => {
                            this.onInputHandler('username', username, e);
                        }
                    }}/>
            </div>
            <div className='register-form__password'>
                <PasswordInput id='password' name='password'
                    errors={errors.password || errors.__all__}
                    onEnterPress={() => {
                        this.loginUser();
                    }}
                    inputAttrs={{
                        value: password,
                        placeholder: 'Password',
                        pattern: '^[\\d\\w]+$',
                        onInput: (e) => {
                            this.onInputHandler('password', password, e);
                        }
                    }}/>
            </div>
            <div className='register-form__submit'>
                <Button title='Sign In' modifiers={['white']} onClick={() => {
                    this.loginUser();
                }} />
            </div>
        </div>;
    }
}

const mapStateToProps = (state) => ({
    errors: state.login.errors
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    loginUser
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
