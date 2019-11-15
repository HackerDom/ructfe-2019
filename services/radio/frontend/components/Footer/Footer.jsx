import React from 'react';
import Spring from '../Spring/Spring';

export default class Footer extends React.Component {
    render() {
        return <div className='footer'>
            <div className='footer__item footer-item'>Ructfe</div>
            <Spring />
            <div className='footer__item footer-item'>2019</div>
        </div>;
    }
}
