/**
 * Created by Oleg Rusak on 08.01.2017.
 */

'use strict';
//  todo: lib di

class GeneralService {
    static isFunction (functionToCheck) {
        const getType = {};

        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    /**
     * Get list function arguments
     * @private
     * @param {function} func - function
     * @returns {Array} - list argument
     */
    static getParamNames (func) {
        const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        const ARGUMENT_NAMES = /([^\s,]+)/g;
        const fnStr = func.toString().replace(STRIP_COMMENTS, '');
        let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

        if (result === null) {
            result = [];
        }

        return result
    }

    /**
     * Deep copy object
     *
     * @param {object} data -
     * @return {object} - clone data
     */
    static objectDeepCopy (data) {

        return JSON.parse(JSON.stringify(data))
    }
}

module.exports = GeneralService;
