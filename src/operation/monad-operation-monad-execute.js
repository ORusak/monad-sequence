/**
 * Created by Oleg Rusak on 18.12.2016.
 *
 * Monad sequence. Operation. Iteration.
 */

'use strict';

//  todo: documentation

/**
 *
 * @param {string[]} listReturnProperty -
 * @param {MonadSequence} monadSequence -
 *
 * @return {Promise.object} -
 */
module.exports.monad = function setDataActionOperationMonad (listReturnProperty, monadSequence) {

    function monadExecute (data, scope, initParam, settings) {
        if (Object.getPrototypeOf(monadSequence).constructor.name === "MonadSequence") {

            const settingInheritParentMonad = {
                codeExecuteMode: settings.codeExecuteMode,
                debug: settings.debug
            }

            return monadSequence
                .execute(settingInheritParentMonad, scope)
                .value()
                .then(function processOneActionsResult (result) {

                    return listReturnProperty.reduce(function reducePropertyToData (data, key) {
                        if (typeof result[key] === "undefined") {
                            throw new Error(`[OperationMonad] Expect in result execute monad key [${key}] value not undefined`)
                        }

                        data[key] = result[key]

                        return data
                    }, {})
                })
        }
    }

    /**
     * Node js custom inspect
     *
     * @return {string} -
     */
    monadExecute.inspect = function inspectOperationAll (depth, opts) {

        return `Operation Monad`
    }

    return monadExecute
}
