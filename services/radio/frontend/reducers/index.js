import _ from 'lodash';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

const attachedReducers = [
    'user',
    'login',
    'register',
    'playlist',
    'ourUsers',
];

const normalizeModuleName = (moduleName) => moduleName.split('/').map((item, i) => {
    if (i === 0) {
        return item;
    }
    return _.upperFirst(item);
}).join('');

export default (initialState, history) => {
    const reducersMap = {
        router: connectRouter(history)
    };
    attachedReducers.forEach((reducerName) => {
        const reducerKey = normalizeModuleName(reducerName);
        const reducerModule = require(`./${reducerName}`); // eslint-disable-line global-require, import/no-dynamic-require
        reducersMap[reducerKey] = reducerModule.default(initialState);
    });
    return combineReducers(reducersMap);
};
