/* globals __INITIAL_PROPS__ */
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import RadioApp from './pages/_app';

import './styles/build.less';

const initialProps = __INITIAL_PROPS__ || {};

ReactDOM.render(
    <BrowserRouter>
        <RadioApp initialProps={initialProps} />
    </BrowserRouter>,
    document.getElementById('app')
);
