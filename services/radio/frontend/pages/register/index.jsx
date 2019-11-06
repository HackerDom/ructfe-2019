import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Layout from '../../layouts/layout';
import RegisterForm from '../../components/Register/RegisterForm';

import { registerUser } from '../../actions/register/actions';

class RegisterPage extends React.Component {
    render() {
        return <Layout>
            <div className='register-page'>
                <RegisterForm />
            </div>
        </Layout>;
    }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    registerUser
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage);
