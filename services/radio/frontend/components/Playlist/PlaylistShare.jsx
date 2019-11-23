import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import PlaylistDetail from './PlaylistDetail';
import { fetchPlaylistByHash } from '../../actions/playlist/actions';

class PlaylistShare extends React.Component {
    static propTypes = {
        fetchPlaylistByHash: PropTypes.func,
        currentPlaylist: PropTypes.shape({
            ID: PropTypes.number,
            name: PropTypes.string,
            description: PropTypes.string,
            tracks: PropTypes.arrayOf(PropTypes.shape({})),
        }),
        match: PropTypes.object
    }

    componentDidMount() {
        const { fetchPlaylistByHash, match } = this.props;
        const { h } = match.params;
        if (h) {
            fetchPlaylistByHash(h);
        }
    }

    render() {
        const { currentPlaylist } = this.props;

        return <React.Fragment>
            {currentPlaylist && <PlaylistDetail playlist={currentPlaylist} isShared={true} />}
        </React.Fragment>;
    }
}

const mapStateToProps = (state) => ({
    currentPlaylist: state.playlist.currentPlaylist,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    fetchPlaylistByHash,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(PlaylistShare)
);
