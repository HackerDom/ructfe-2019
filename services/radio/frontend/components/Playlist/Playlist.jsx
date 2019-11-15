import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '../Button/Button';
import PlaylistForm from './PlaylistForm';

class Playlist extends React.Component {
    static propTypes = {
        playlists: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string,
            private: PropTypes.bool,
            tracks: PropTypes.arrayOf(PropTypes.shape({}))
        })),
    }

    constructor(props) {
        super(props);

        this.state = {
            isAddFormOpen: false
        };
    }

    render() {
        const { isAddFormOpen } = this.state;

        return <div className='playlist-page'>
            <div className='playlist-page'>Your playlists</div>
            <div className='playlists'>
                <div className='playlist-add-button'>
                    {isAddFormOpen && <div>
                        <PlaylistForm onReject={() => {
                            this.setState({ isAddFormOpen: false })
                        }} />
                    </div>}
                    <Button title='+ Add playlist' onClick={() => {
                        this.setState({
                            isAddFormOpen: true
                        });
                    }} />
                </div>
            </div>
        </div>;
    }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);
