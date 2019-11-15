import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { fetchPlaylists, deletePlaylist } from '../../actions/playlist/actions';

class PlaylistList extends React.Component {
    static propTypes = {
        playlists: PropTypes.arrayOf(PropTypes.shape({})),
        deletePlaylist: PropTypes.func,
        fetchPlaylists: PropTypes.func,
    }

    componentDidMount() {
        const { playlists, fetchPlaylists } = this.props;
        if (playlists == null) {
            fetchPlaylists();
        }
    }

    render() {
        const { playlists, deletePlaylist } = this.props;

        return <div className='playlist-list'>
            {playlists && playlists.length === 0 && <div className='playlist-list__empty'>
                You don&apos;t have playlists
            </div>}
            {playlists && playlists.length > 0 && <div className='playlist-list__instances'>
                {playlists.map((p, i) => <div key={`playlist-item-${i}`} className='playlist-item'>
                    <div className='playlist-item__name' title={p.name}>{p.name}</div>
                    <FontAwesomeIcon icon={faTimes} onClick={() => {
                        deletePlaylist(p.ID);
                    }}/>
                </div>)}
            </div>}
        </div>;
    }
}

const mapStateToProps = (state) => ({
    playlists: state.playlist.playlists
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    fetchPlaylists,
    deletePlaylist,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistList);
