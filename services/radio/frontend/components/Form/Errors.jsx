import React from 'react';
import PropTypes from 'prop-types';

export default class Errors extends React.Component {
    static propTypes = {
        errors: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string])
    }

    render() {
        const { errors } = this.props;

        return <React.Fragment>
            { errors && errors.length > 0 && <div className='form-errors'>
                <div className='form-errors__inner'>
                    {errors && errors.map && errors.map((error, i) => <div key={`form-error-${i}`} className='form-error' dangerouslySetInnerHTML={ { __html: error } } />)}
                    {typeof errors === 'string' && <div className='form-error' dangerouslySetInnerHTML={ { __html: errors } }></div>}
                </div>
            </div> }
        </React.Fragment>;
    }
}
