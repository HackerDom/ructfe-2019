import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faPlay,
    faStop
} from '@fortawesome/free-solid-svg-icons';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Button from '../Button/Button';
import {
    fetchPlaylist,
    createTrack,
    deleteTrack
} from '../../actions/playlist/actions';
import Spring from '../Spring/Spring';

class PlaylistDetail extends React.Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        currentPlaylist: PropTypes.shape({
            ID: PropTypes.number,
            name: PropTypes.string,
            description: PropTypes.string,
            tracks: PropTypes.arrayOf(PropTypes.shape({})),
        }),
        createTrack: PropTypes.func,
        fetchPlaylist: PropTypes.func,
        deleteTrack: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {
            trackPlayID: -1,
            currentId: null
        };
    }

    fetchPlaylist() {
        const { match, fetchPlaylist } = this.props;
        const { id } = match.params;
        const { currentId } = this.state;
        if (id !== currentId) {
            fetchPlaylist(id, () => {
                this.setState({ currentId: id });
            });
        }
    }

    play(trackID) {
        this.setState({ trackPlayID: trackID });
    }

    isTrackPlaying(trackID) {
        const { trackPlayID } = this.state;
        return trackPlayID === trackID;
    }

    stop() {
        const { trackPlayID } = this.state;
        if (trackPlayID !== -1) {
            this.setState({ trackPlayID: -1 });
        }
    }

    componentDidMount() {
        this.fetchPlaylist();
    }

    componentDidUpdate() {
        this.fetchPlaylist();
    }

    componentWillUnmount() {
        this.stop();
    }

    getTracks() {
        const { currentPlaylist, deleteTrack } = this.props;
        return currentPlaylist.tracks.map((track, i) => <div key={`track-${currentPlaylist.ID}-${i}`} className='playlist-track'>
            <div className='playlist-track__buttons'>
                {this.isTrackPlaying(track.ID) && <FontAwesomeIcon className='playlist-clickable-button'
                    icon={faStop} onClick={() => {
                        this.stop();
                    }}/>}
                {!this.isTrackPlaying(track.ID) && <FontAwesomeIcon className='playlist-clickable-button'
                    icon={faPlay} onClick={() => {
                        this.play(track.ID);
                    }}/>}
            </div>
            <div className='playlist-track__name'>{track.name}</div>
            <Spring />
            <div className='playlist-track__delete'>
                <FontAwesomeIcon icon={faTimes} onClick={() => {
                    deleteTrack(track.ID);
                }}/>
            </div>
        </div>);
    }

    render() {
        const { currentPlaylist, createTrack } = this.props;

        return <React.Fragment>
            {currentPlaylist && <div className='playlist-detail'>
                <div className='playlist-detail__title'>{currentPlaylist.name}</div>
                {currentPlaylist.description && <div className='playlist-detail__description'>{currentPlaylist.description}</div>}
                <div className='playlist-detail-tracks'>
                    {this.getTracks()}
                </div>
                <Spring />
                <div className='playlist-add-track-button'>
                    <Button title='+ Add track' onClick={() => {
                        createTrack(currentPlaylist.ID);
                    }} />
                </div>
            </div>}
        </React.Fragment>;
    }
}

const mapStateToProps = (state) => ({
    currentPlaylist: state.playlist.currentPlaylist
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    fetchPlaylist,
    createTrack,
    deleteTrack
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlaylistDetail));
