import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Input from '../Form/Input';
import Checkbox from '../Form/Checkbox';
import Button from '../Button/Button';

import { createPlaylist } from '../../actions/playlist/actions';

class PlaylistForm extends React.Component {
    static propTypes = {
        playlist: PropTypes.shape({}),
        errors: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string,
            is_private: PropTypes.string,
        }),
        createPlaylist: PropTypes.func,
        onAccept: PropTypes.func,
        onReject: PropTypes.func,
    }

    static defaultProps = {
        onAccept: () => {},
        onReject: () => {},
    }

    constructor(props) {
        super(props);

        this.state = {
            name: '',
            description: '',
            is_private: false
        };
    }

    onInputHandler(fieldName, fieldValue, e) {
        const isValid = e.target.validity.valid;
        const value = isValid ? e.target.value : fieldValue;
        this.setState({
            [fieldName]: value
        });
    }

    render() {
        const {
            errors, onAccept, onReject, createPlaylist
        } = this.props;
        // eslint-disable-next-line camelcase
        const { name, description, is_private } = this.state;

        return <div className='playlist-add-form radio-form'>
            <div className='playlist-add-form__name'>
                <Input id='name' name='name' type="text"
                    errors={errors.name}
                    inputAttrs={{
                        autoFocus: true,
                        placeholder: 'Name',
                        value: name,
                        onInput: (e) => {
                            this.onInputHandler('name', name, e);
                        }
                    }}/>
            </div>
            <div className='playlist-add-form__description'>
                <Input id='description' name='description' type="text"
                    errors={errors.description}
                    inputAttrs={{
                        placeholder: 'Description',
                        value: description,
                        onInput: (e) => {
                            this.onInputHandler('description', description, e);
                        }
                    }}/>
            </div>
            <div className='playlist-add-form__private'>
                <Checkbox id='private' name='private' onChange={(e) => this.setState({ is_private: e.target.checked })}>
                    Is private?
                </Checkbox>
            </div>
            <div className='form-buttons'>
                <Button title='Create' modifiers={['white']} onClick={() => {
                    createPlaylist({ name, description, is_private }, () => {
                        onAccept();
                    });
                }} />
                <Button title='Close' modifiers={['white']} onClick={() => {
                    onReject();
                }}/>
            </div>
        </div>;
    }
}

const mapStateToProps = (state) => ({
    errors: state.playlist.errors
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    createPlaylist
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistForm);
