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

    return function all (data, scope, initParam) {
        const listActionInit = Object.keys(dataAction)
            .map(srvGeneralPlugin.getObjectValueByKey(dataAction))
            .map(initParam)

        return Promise.all(listActionInit.map(action => action()))
            .then(processActionsResult(dataAction))
    }
};
