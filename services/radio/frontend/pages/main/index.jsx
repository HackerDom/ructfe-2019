import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Layout from '../../layouts/layout';
import Playlist from '../../components/Playlist/Playlist';
import Wave from '../../components/Wave/Wave';

class MainPage extends React.Component {
    static propTypes = {
        user: PropTypes.shape({}),
    }

    render() {
        const { user } = this.props;
        return <Layout>
            {!user && <div className='main-page'>
                <div className='main-page__title'>Listen to music and radio on the submarine</div>
                <div className="main-page__wave">
                    <Wave id='main-page-wave' name='wave.mp3'/>
                </div>
                <div className='main-page__register-button'>
                    <Link to='/signup/' className='radio-nav__item radio-nav-item radio-nav-item--with-border'>Sign up</Link>
                </div>
            </div>}
            {user && <Playlist />}
        </Layout>;
    }
}

const mapDispatchToProps = () => ({});
const mapStateToProps = (state) => ({
    user: state.user.user
});

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);
