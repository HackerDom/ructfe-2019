import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Layout from '../../layouts/layout';
import Playlist from '../../components/Playlist/Playlist';

class MainPage extends React.Component {
    static propTypes = {
        user: PropTypes.shape({}),
    }

    render() {
        const { user } = this.props;

        return <Layout>
            {!user && <div className='main-page'>
                main page
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
