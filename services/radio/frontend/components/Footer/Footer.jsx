import React from 'react';
import Spring from '../Spring/Spring';

export default class Footer extends React.Component {
    render() {
        return <div className='footer'>
            <div className='footer__item footer-item'>Ructfe</div>
            <div className='footer__item footer-item'>
                <a className='footer-link' href='/our-users/'>Our users</a>
            </div>
            <Spring />
            <div className='footer__item footer-item'>2019</div>
        </div>;
    }
}
