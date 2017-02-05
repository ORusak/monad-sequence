/**
 * Created by Oleg Rusak on 04.12.2016.
 *
 * Monad sequence
 */

'use strict';

//  todo: documentation

const srvGeneralPlugin = require('./general-plugin-service');

function processActionsResult (actions) {
    const listNameAction = Object.keys(actions)

    return function execProcessActionsResult (listActionsResult) {
        if (listActionsResult.length !== listNameAction.length) {
            //  todo: custom error
            throw new Error("execProcessActionsResult")
        }

        const unionActionsResult = listActionsResult.reduce((unionResult, actionResult, index) => {
            unionResult[listNameAction[index]] = actionResult

            return unionResult
        }, {})

        return unionActionsResult
    }
}

module.exports.all = function setDataActionOperationAll (dataAction) {

    function all (data, scope, initParam) {
        const listNameAction = Object.keys(dataAction);
        const listActionInit = listNameAction
            .map(srvGeneralPlugin.getObjectValueByKey(dataAction))
            .map(function initParamAction (action, index) {

                return initParam(action, listNameAction[index])
            })

        return Promise.all(listActionInit.map(action => action()))
            .then(processActionsResult(dataAction))
    }

    /**
     * Node js custom inspect
     *
     * @return {string} -
     */
    all.inspect = function inspectOperationAll (depth, opts) {

        return `Operation All`
    }

    return all
}
