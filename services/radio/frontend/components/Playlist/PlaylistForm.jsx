import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Input from '../Form/Input';
import Checkbox from '../Form/Checkbox';
import Button from '../Button/Button';

class PlaylistForm extends React.Component {
    static propTypes = {
        playlist: PropTypes.shape({}),
        errors: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string,
            private: PropTypes.string,
        }),
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
            private: false
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
        const { errors, onAccept, onReject } = this.props;
        const { name, description } = this.state;

        return <div className='playlist-add-form'>
            <div>Create your own playlist and listen to music</div>
            <div className='playlist-add-form__name'>
                <Input id='name' name='name' type="text"
                    errors={errors.name}
                    inputAttrs={{
                        placeholder: 'Name',
                        value: name,
                        pattern: '^[\\d\\w]+$',
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
                <Checkbox id='private' name='private' onChange={(e) => this.setState({ private: e.target.checked })}>
                    Is private?
                </Checkbox>
            </div>
            <div className='form-buttons'>
                <Button title='Create' onClick={() => {
                    onAccept();
                }} />
                <Button title='Close' onClick={() => {
                    onReject();
                }}/>
            </div>
        </div>;
    }
}

const mapStateToProps = (state) => ({
    errors: state.playlist.errors || {}
});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistForm);
