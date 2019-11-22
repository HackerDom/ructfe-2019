import React from 'react';
import PropTypes from 'prop-types';

import WaveSurfer from 'wavesurfer.js';

export default class WaveTrack extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        isPlaying: PropTypes.bool
    }

    constructor(props) {
        super(props);

        this.radioWaveRef = React.createRef();
        this.waveform = null;
    }

    play() {
        this.waveform.play();
    }

    stop() {
        this.waveform.stop();
    }

    componentDidUpdate(prevProps) {
        const { isPlaying } = this.props;
        if (isPlaying !== prevProps.isPlaying) {
            if (isPlaying) {
                this.play();
            } else {
                this.stop();
            }
        }
    }

    componentDidMount() {
        const { name } = this.props;

        if (this.waveform == null) {
            this.waveform = WaveSurfer.create({
                container: this.radioWaveRef.current,
                waveColor: 'white',
                height: 16,
                responsive: true,
                hideScrollbar: true
            });
            this.waveform.load(`/music/${name}`);
        }
    }

    componentWillUnmount() {
        this.waveform.destroy();
    }

    render() {
        const { id } = this.props;

        return <div ref={this.radioWaveRef} className='radio-wave' id={id} />;
    }
}
