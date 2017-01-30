/**
 * Created by Oleg Rusak on 04.12.2016.
 *
 * Monad sequence
 */

'use strict';

//  todo: documentation

const srvGeneralPlugin = require('./general-plugin-service');

function bindKeyNameToResultAction (listNameAction) {

    return function bindActionIndex (action, index) {
        const nameKeyResult = listNameAction[index]

        return function wrapResultRace () {

            return new Promise(function promisifyActionRace (resolve, reject) {
                action()
                    .then(function resolveValueAsKeyValue (value) {
                        resolve({
                            [nameKeyResult]: value
                        })
                    })
                    .catch(reject)
            })
        }
    }
}

module.exports.race = function setDataActionOperationRace (dataAction) {

    return function race (data, scope, initParam) {
        const listNameAction = Object.keys(dataAction)
        const listActionInit = listNameAction
            .map(srvGeneralPlugin.getObjectValueByKey(dataAction))
            .map(initParam)
            .map(bindKeyNameToResultAction(listNameAction))

        return Promise.race(listActionInit.map(action => action()));
    }
};
