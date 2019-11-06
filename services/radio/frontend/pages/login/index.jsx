import React from 'react';
import Layout from '../../layouts/layout';
import LoginForm from '../../components/Login/LoginForm';

export default class LoginPage extends React.Component {
    render() {
        return <Layout>
            <div className='login-page'>
                <LoginForm />
            </div>
        </Layout>;
    }
}
