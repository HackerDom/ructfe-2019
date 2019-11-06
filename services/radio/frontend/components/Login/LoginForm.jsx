import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Button from '../Button/Button';
import Input from '../Form/Input';
import PasswordInput from '../Form/PasswordInput';

import { loginUser } from '../../actions/login/actions';

class RegisterForm extends React.Component {
    static propTypes = {
        loginUser: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
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
        const { loginUser } = this.props;
        const {
            username, password
        } = this.state;

        return <div className='register-form'>
            <div className='register-form__username'>
                <Input id='username' name='username' type="text"
                    inputAttrs={{
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
                        value: password,
                        pattern: '^[\\d\\w]+$',
                        onInput: (e) => {
                            this.onInputHandler('password', password, e);
                        }
                    }}/>
            </div>
            <div className='register-form__submit'>
                <Button title='Submit' modifiers={['submit']} onClick={() => {
                    loginUser({ username, password });
                }} />
            </div>
        </div>;
    }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    loginUser
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
