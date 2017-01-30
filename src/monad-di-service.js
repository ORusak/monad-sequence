/**
 * Created by Oleg Rusak on 08.01.2017.
 */

'use strict';
//  todo: lib di

const srvGeneral = require('./monad-general-service');

class DIService {
    static get modeExecutive () {
        return {
            strict: 'strict',
            normal: 'normal'
        }
    }

    static _isNotRequired (nameExpressionKey) {
        return /^\[.+\]$/.test(nameExpressionKey)
    }

    //  todo: lib di
    static _getNameNotRequired (nameExpressionKey) {
        const listValueMatch = nameExpressionKey.match(/^\[(.+)\]$/)
        const INDEX_NAME_PARAMETER = 1

        return listValueMatch[INDEX_NAME_PARAMETER]
    }

    static _updateScope (scope, strictMode, nameOperation, indexOperation) {

        return function _execUpdateScope (data) {

            for (const keyValue in data) {
                if (!data.hasOwnProperty(keyValue)) {
                    continue;
                }

                if (keyValue in scope && strictMode === DIService.modeExecutive.strict) {
                    //  todo: custom error
                    throw new Error(`Operation [${nameOperation}(${indexOperation})]. In strict mode not override scope value. Key [${keyValue}]. Scope value [${scope[keyValue]}]. Data value [${data[keyValue]}]]`)
                }

                scope[keyValue] = data[keyValue]
            }

            //  update
            Object.assign(scope, data)

            //  return data prev operation
            return data
        }
    }

    static _initScope (parentScope) {
        const scope = {}

        Object.defineProperty(scope, '_parent', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: parentScope
        })

        return scope
    }

    static _searchValueInParentScopes (nameKey, scope) {
        if (typeof scope === "undefined") {
            return undefined
        }

        if (nameKey in scope) {
            return scope[nameKey]
        }

        const parentScope = scope._parent

        return DIService._searchValueInParentScopes(nameKey, parentScope)
    }

    static _getValueByName (data, scope, nameAction) {

        return function execGetValueByName (nameKey) {
            let nameKeyInit
            let flagNotRequired

            if (DIService._isNotRequired(nameKey)) {
                nameKeyInit = DIService._getNameNotRequired(nameKey)
                flagNotRequired = true
            } else {
                nameKeyInit = nameKey
                flagNotRequired = false
            }

            //  search in data value prev operation
            if (nameKeyInit in data) {
                return data[nameKey]
            }

            const valueParentScope = DIService._searchValueInParentScopes(nameKeyInit, scope)

            if (typeof valueParentScope !== "undefined") {
                return valueParentScope
            }

            if (flagNotRequired) {
                return undefined
            }

            //  todo: custom error
            throw new Error(`Expected for action [${nameAction}] param [${nameKeyInit}] required [${!flagNotRequired}] in ${data}`)
        }
    }

    static initParameterAction (data, scope, action) {
        if (typeof action === "undefined") {
            //  todo: custom error
            throw new Error("Expected action not undefined")
        }

        //  operation with list action
        if (srvGeneral._isFunction(action)) {
            const listActionParam = srvGeneral._getParamNames(action)

            const args = listActionParam.map(DIService._getValueByName(data, scope, action.name))

            return action.bind(null, ...args)
        }

        //  todo: check type action full value array
        //  array syntax [action, 'param1', 'param2']
        if (Array.isArray(action) && srvGeneral._isFunction(action[0])) {
            const actionHandler = action[0]
            const listActionParam = action.slice(1)

            const args = listActionParam.map(DIService._getValueByName(data, scope, action.name))

            return actionHandler.bind(null, ...args)
        }

        //  base type value
        return () => Promise.resolve(action);
    }
}

module.exports = DIService;
