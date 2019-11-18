import React from 'react';
import { connect } from 'react-redux';

import Layout from '../../layouts/layout';
import PlaylistShare from '../../components/Playlist/PlaylistShare';

class PlaylistSharePage extends React.Component {
    render() {
        return <Layout>
            <PlaylistShare />
        </Layout>;
    }
}

const mapDispatchToProps = () => ({});
const mapStateToProps = (state) => ({
    user: state.user.user
});

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistSharePage);
