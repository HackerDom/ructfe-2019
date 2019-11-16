import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { push } from 'connected-react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { fetchPlaylists, deletePlaylist } from '../../actions/playlist/actions';

class PlaylistList extends React.Component {
    static propTypes = {
        playlists: PropTypes.arrayOf(PropTypes.shape({})),
        deletePlaylist: PropTypes.func,
        fetchPlaylists: PropTypes.func,
        push: PropTypes.func,
    }

    componentDidMount() {
        const { playlists, fetchPlaylists } = this.props;
        if (playlists == null) {
            fetchPlaylists();
        }
    }

    render() {
        const { playlists, deletePlaylist, push } = this.props;

        return <div className='playlist-list'>
            {playlists && playlists.length === 0 && <div className='playlist-list__empty'>
                You don&apos;t have playlists
            </div>}
            {playlists && playlists.length > 0 && <div className='playlist-list__instances'>
                {playlists.map((p, i) => <div key={`playlist-item-${i}`}
                    onClick={() => { push(`/playlist/${p.ID}/`); }}
                    className='playlist-item'>
                    <div className='playlist-item__name' title={p.name}>{p.name}</div>
                    <FontAwesomeIcon icon={faTimes} onClick={(e) => {
                        deletePlaylist(p.ID);
                        e.stopPropagation();
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
    push
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistList);
