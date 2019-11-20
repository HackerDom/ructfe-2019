import React from 'react';
import PropTypes from 'prop-types';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import Spring from '../components/Spring/Spring';

export default class Layout extends React.Component {
    static propTypes = {
        isCenterByVertical: PropTypes.bool,
        children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
    }

    static defaultProps = {
        isCenterByVertical: false
    }

    render() {
        const { isCenterByVertical, children } = this.props;

        return <React.Fragment>
            <Nav />
            {!isCenterByVertical && <div className='radio-page-wrapper'>
                {children}
            </div>}
            {isCenterByVertical && <div className='radio-page-wrapper'>
                <div className='radio-page-vertical-wrapper'>
                    <Spring />
                    {children}
                    <Spring />
                </div>
            </div>}
            <Footer />
        </React.Fragment>;
    }
}
