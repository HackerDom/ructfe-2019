import React from 'react';
import PropTypes from 'prop-types';

import WaveSurfer from 'wavesurfer.js';

export default class Wave extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);

        this.radioWaveRef = React.createRef();
        this.waveform = null;
    }

    componentDidMount() {
        const { id, name } = this.props;

        if (this.waveform == null) {
            this.waveform = WaveSurfer.create({
                container: `#${id}`,
                waveColor: 'white',
                interact: false,
                height: 600,
                responsive: true,
                cursorColor: 'black',
                hideScrollbar: true
            });
            this.waveform.load(`/static/waveform/${name}`);
        }
    }

    render() {
        const { id } = this.props;

        return <div ref={this.radioWaveRef} className='radio-wave' id={id} />;
    }
}
