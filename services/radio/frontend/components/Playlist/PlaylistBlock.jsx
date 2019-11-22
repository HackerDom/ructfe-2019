import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import PlaylistDetail from './PlaylistDetail';

import { fetchPlaylist } from '../../actions/playlist/actions';

class PlaylistBlock extends React.Component {
    static propTypes = {
        match: PropTypes.object,
        currentPlaylist: PropTypes.shape({
            ID: PropTypes.number,
            name: PropTypes.string,
            description: PropTypes.string,
            tracks: PropTypes.arrayOf(PropTypes.shape({})),
        }),
        fetchPlaylist: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {
            id: null
        };
    }

    fetchContainer() {
        const { match: { params } } = this.props;
        const { playlistId } = params;

        if (playlistId && this.state.id !== playlistId) {
            const { fetchPlaylist } = this.props;
            fetchPlaylist(playlistId);
            this.setState({ id: playlistId });
        }
    }

    componentDidMount() {
        this.fetchContainer();
    }

    componentDidUpdate() {
        this.fetchContainer();
    }

    render() {
        const { currentPlaylist } = this.props;

        return <React.Fragment>
            {currentPlaylist && <PlaylistDetail playlist={currentPlaylist}/>}
        </React.Fragment>;
    }
}

const mapStateToProps = (state) => ({
    currentPlaylist: state.playlist.currentPlaylist,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    fetchPlaylist
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(PlaylistBlock)
);
