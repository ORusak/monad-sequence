/**
 * Created by Oleg Rusak on 08.01.2017.
 */

'use strict';

const createDebug = require('debug')
const debugDetailValue = createDebug("monad:sequence:value")
const util = require('util')

const srvDI = require('./monad-di-service');
const srvGeneral = require('./monad-general-service');

class AsyncSequenceService {

    static executeAsyncSequence (listOperation, settings, scope) {
        const promiseValueInit = Promise.resolve({});
        const strictMode = settings.codeExecuteMode;
        const handlerError = settings.handlerError;

        //  deep copy init scope data. for resolve collision with parallels change data object in scope.
        const _initScopeInit = scope ? srvGeneral.objectDeepCopy(scope) : {}
        const scopeInit = srvDI._initScope(_initScopeInit)

        const chainOperation = listOperation.reduce(function calculateSequence (value, operation, index) {
            const valueExecute = value
            //  todo: operation name, index
                .then(function (data) {
                    debugDetailValue("          Operation start. Execute: %O", data);
                    debugDetailValue("          Operation start. Scope value: %O", scopeInit);

                    return data
                })
                .then(AsyncSequenceService.executeOperation(operation, settings, scopeInit, index))
                .then(srvDI._updateScope(scopeInit, strictMode, operation.name, index))
                //  todo: operation name, index
                .then(function (data) {
                    debugDetailValue("          Operation end. Result: %O", data);
                    debugDetailValue("          Operation end. Scope value: %O", scopeInit);

                    return data
                })

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

                return operation(data, scope, srvDI.initParameterAction.bind(null, data, scope))
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

    static applyHandlerErrorCatch (chain, handerError, settings, scope) {
        const chainInit = chain.catch(function asyncErrorHandler (error) {

            if (srvGeneral.isFunction(handerError)) {
                return handerError(error, settings, scope);
            }
        })

        return chainInit;
    }
}

module.exports = AsyncSequenceService;
