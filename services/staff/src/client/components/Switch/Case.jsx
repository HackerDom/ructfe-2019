import * as React from 'react';

export class Case extends React.Component {
    constructor (props) {
        super(props);
        this.value = props.value;
    }

    render () {
        return this.props.children;
    }
}
