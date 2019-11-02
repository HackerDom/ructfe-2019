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
        playlist: PropTypes.shape({
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
        };
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

    componentWillUnmount() {
        this.stop();
    }

    getTracks() {
        const { playlist, deleteTrack } = this.props;
        return playlist.tracks.map((track, i) => <div key={`track-${playlist.ID}-${i}`} className='playlist-track'>
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
        const { playlist, createTrack } = this.props;

        return <React.Fragment>
            {playlist && <div className='playlist-detail'>
                <div className='playlist-detail__title'>{playlist.name}</div>
                {playlist.description && <div className='playlist-detail__description'>{playlist.description}</div>}
                <div className='playlist-detail-tracks'>
                    {this.getTracks()}
                </div>
                <Spring />
                <div className='playlist-add-track-button'>
                    <Button title='+ Add track' onClick={() => {
                        createTrack(playlist.ID);
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
