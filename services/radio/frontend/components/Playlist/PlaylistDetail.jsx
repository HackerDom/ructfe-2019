import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Button from '../Button/Button';
import { fetchPlaylist } from '../../actions/playlist/actions';
import Spring from '../Spring/Spring';

class PlaylistDetail extends React.Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        currentPlaylist: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string,
        }),
        fetchPlaylist: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {
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

    componentDidMount() {
        this.fetchPlaylist();
    }

    componentDidUpdate() {
        this.fetchPlaylist();
    }

    render() {
        const { currentPlaylist } = this.props;

        return <React.Fragment>
            {currentPlaylist && <div className='playlist-detail'>
                <div className='playlist-detail__title'>{currentPlaylist.name}</div>
                {currentPlaylist.description && <div className='playlist-detail__description'>{currentPlaylist.description}</div>}
                <Spring />
                <div className='playlist-detail-tracks'>
                    <Button title='+ Add track' onClick={() => {
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
    fetchPlaylist
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlaylistDetail));
