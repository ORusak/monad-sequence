/**
 * Created by Oleg Rusak on 08.01.2017.
 */

'use strict';
//  todo: lib di

const srvGeneral = require('./monad-general-service');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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

    static _isExpression (nameExpressionKey) {
        return /^.*=.+$/.test(nameExpressionKey)
    }

    static _getNameNotRequired (nameExpressionKey) {
        const listValueMatch = nameExpressionKey.match(/^\[(.+)\]$/)

        return listValueMatch[1]
    }

    static _getValueFromExpression (nameExpressionKey) {
        const listValueMatch = nameExpressionKey.match(/^.*=(.+)$/)

        return listValueMatch[1]
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

    static _initScope (scopeParent) {
        //  todo: deep copy init scope data. for resolve collision with parallels change data object in scope.
        const scopeParentInit = scopeParent ? scopeParent : {}
        const scope = {}

        Object.defineProperty(scope, '_parent', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: scopeParentInit
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

    static _convertStringToBaseType (stringValue) {

        return JSON.parse(stringValue);
    }

    static _getValueByName (data, scope, nameAction) {

        return function execGetValueByName (nameKey) {
            let nameKeyInit
            let flagNotRequired

            //  *=1
            if (DIService._isExpression(nameKey)){
                return DIService._convertStringToBaseType(
                    DIService._getValueFromExpression(nameKey)
                )
            }

            //  [arg]
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
            throw new Error(`Expected for action [${nameAction}] required [${!flagNotRequired}] param [${nameKeyInit}]`)
        }
    }

    static initParameterAction (data, scope, action, name) {
        if (typeof action === "undefined") {
            //  todo: custom error
            throw new Error(`Expected action [${name}] not undefined`)
        }
        
        const dataInit = data || {}

        //  operation with list action
        if (srvGeneral.isFunction(action)) {

            let actionFunc = action

            //  support proxy function sinon library
            if (action.isSinonProxy) {
                actionFunc = action.prototype.constructor
            }

            const listActionParam = srvGeneral.getParamNames(actionFunc)
            const args = listActionParam.map(DIService._getValueByName(dataInit, scope, actionFunc.name))

            return action.bind.apply(action, [null].concat(args))
        }

        //  todo: check type action full value array
        //  array syntax [action, 'param1', 'param2']
        if (Array.isArray(action) && srvGeneral.isFunction(action[0])) {
            const actionHandler = action[0]
            const listActionParam = action.slice(1)

            const args = listActionParam.map(DIService._getValueByName(dataInit, scope, actionHandler.name))

            return actionHandler.bind.apply(actionHandler, [null].concat(args))
        }

        //  base type value
        return () => Promise.resolve(action);
    }
}

module.exports = DIService;
