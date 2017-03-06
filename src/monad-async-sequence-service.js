/**
 * Created by Oleg Rusak on 08.01.2017.
 */

'use strict';

const createDebug = require('debug')
const debug = createDebug("monad:sequence")
const debugDetailValue = createDebug("monad:sequence:value")
const util = require('util')

const srvDI = require('./monad-di-service');
const srvGeneral = require('./monad-general-service');

class AsyncSequenceService {

    static executeAsyncSequence (listOperation, settings, scope) {
        const promiseValueInit = Promise.resolve({});
        const strictMode = settings.codeExecuteMode;
        const handlerError = settings.handlerError;

        const scopeInit = srvDI._initScope(scope)

        const chainOperation = listOperation.reduce(function calculateSequence (value, operation, index) {
            const nameOperation = operation.inspect ? operation.inspect() : operation.name;

            const valueExecute = value
            //  todo: operation name, index
                .then(function (data) {
                    debugDetailValue(`          ${nameOperation} [${index}] start. Execute: %O`, data);

                    return data
                })
                .then(AsyncSequenceService.executeOperation(operation, settings, scopeInit, index))
                .then(srvDI._updateScope(scopeInit, strictMode, operation.name, index))
                //  todo: operation name, index
                .then(function (data) {
                    debugDetailValue(`          ${nameOperation} [${index}] end. Result: %O`, data);

                    return data
                })
                .then(AsyncSequenceService.validateData(nameOperation, index))

            return valueExecute

        }, promiseValueInit);

        const chainOperationHandlerErrorInit = AsyncSequenceService.applyHandlerErrorCatch(chainOperation,
            handlerError, settings, scopeInit);

        return chainOperationHandlerErrorInit;
    }

    static executeOperation (operation, settings, scope, index) {
        //  action primitive type
        if (srvGeneral.isFunction(operation)) {
            //  action function
            return function executeOperationFunction (data) {

                return operation(data, scope, srvDI.initParameterAction.bind(null, data, scope), settings)
            }
        }

        //  todo: problem circular require module monad for check instanseof operation
        //  operation instanceof require('./monad') - Error: Right-hand side of 'instanceof' is not callable
        if (Object.getPrototypeOf(operation).constructor.name === "MonadSequence") {

            return function executeOperationMonad () {
                const subMonadSequence = operation;
                const settingInheritParentMonad = {
                    codeExecuteMode: settings.codeExecuteMode,
                    debug: settings.debug
                }

                subMonadSequence.execute(settingInheritParentMonad, scope)

                return subMonadSequence.value()
            }
        }

        throw new Error(`Expect operation [${operation}(${typeof operation})] must be operation function or monad.sequence.`);
    }

    static applyHandlerErrorCatch (chain, handlerError, settings, scope) {
        const chainInit = chain.catch(function asyncErrorHandler (error) {
            debug("     Error execute operation");
            debugDetailValue("          Error execute operation. Error: %O. Scope: %O", error, scope);

            if (srvGeneral.isFunction(handlerError)) {
                return handlerError(error, settings, scope);
            }
            
            return Promise.reject(error);
        })

        return chainInit;
    }

    /**
     * Check operation result data. Not value equal undefined.
     * Require set returned value in action directly in same type or null.
     * With action returned undefined something went wrong.
     *
     * @param {string} nameOperation -
     * @param {number} index -
     *
     * @return {function} - callback
     */
    static validateData (nameOperation, index) {

        /**
         * @param {object} data -
         *
         * @return {object} -
         */
        return function execValidateData (data) {
            if (!data || typeof data !== "object") {
                return data
            }

            Object.keys(data).forEach(function validateDataValue (key) {

                if (typeof data[key] === "undefined") {
                    debugDetailValue(`          ${nameOperation} [${index}] end. Result: %O`, data);

                    throw new Error(`Operation ${nameOperation} [${index}] expect [${key}] action result value not equal undefined.`);
                }
            })

            return data
        }
    }
}

module.exports = AsyncSequenceService;
