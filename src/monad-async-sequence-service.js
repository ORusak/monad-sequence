/**
 * Created by Oleg Rusak on 08.01.2017.
 */

'use strict';

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
                .then(AsyncSequenceService.executeOperation(operation, settings, scopeInit, index))
                .then(srvDI._updateScope(scopeInit, strictMode, operation.name, index))

            return valueExecute

        }, promiseValueInit);

        const chainOperationHandlerErrorInit = AsyncSequenceService.applyHandlerErrorCatch(chainOperation,
            handlerError, settings, scopeInit);

        return chainOperationHandlerErrorInit;
    }

    static executeOperation (operation, settings, scope, index) {
        //  action primitive type
        if (srvGeneral._isFunction(operation)) {
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
                    .then(function (data) {
                        return data
                    })
            }
        }

        throw new Error(`Expect operation [${operation}(${typeof operation})] must be operation function or monad.sequence.`);
    }

    static applyHandlerErrorCatch (chain, handerError, settings, scope) {
        const chainInit = chain.catch(function asyncErrorHandler (error) {

            if (srvGeneral._isFunction(handerError)) {
                return handerError(error, settings, scope);
            }
        })

        return chainInit;
    }
}

module.exports = AsyncSequenceService;
