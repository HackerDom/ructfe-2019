import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Layout from '../../layouts/layout';
import RegisterForm from '../../components/Register/RegisterForm';

import { registerUser } from '../../actions/register/actions';

class RegisterPage extends React.Component {
    render() {
        return <Layout isCenterByVertical={true}>
            <div className='register-page'>
                <div className='register-page__form'>
                    <RegisterForm />
                </div>
            </div>
        </Layout>;
    }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    registerUser
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage);
