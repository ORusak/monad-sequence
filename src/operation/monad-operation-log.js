/**
 * Created by Oleg Rusak on 27.02.2016.
 *
 * Monad sequence. Operation. Log.
 */

'use strict';

//  todo: documentation

const srvMonadGeneral = require("./../monad-general-service")

function resolveValueByName (listName, data) {

    return listName.map(nameKey => data[nameKey])
}

/**
 *
 * @param {string[]} listReturnProperty -
 * @param {MonadSequence} monadSequence -
 *
 * @return {Promise.object} -
 */
module.exports.log = function logFactory (logger) {

    function logRegistration () {
        //  todo: const [levelLogger, message, ...templateProp] = arguments;
        const _arguments = Array.prototype.slice.call(arguments),
            levelLogger = _arguments[0],
            message = _arguments[1],
            templateProp = _arguments.slice(2);
        const lastArgument = templateProp[templateProp.length-1]
        const isLastArgumentMeta = srvMonadGeneral.isFunction(lastArgument)
        const listPropTemplate = isLastArgumentMeta
            ? templateProp.slice(0, templateProp.length-1)
            : templateProp

        function logExecute (data, scope, initParam, settings) {

            const arg = [message]
            const argWithProp = arg.concat(resolveValueByName(listPropTemplate, scope))
            const argWithPropAndMeta = isLastArgumentMeta
                ? argWithProp.concat([lastArgument(scope)])
                : argWithProp

            logger[levelLogger].apply(logger, argWithPropAndMeta)

            return null;
        }

        /**
         * Node js custom inspect
         *
         * @return {string} -
         */
        logExecute.inspect = function inspectOperationAll (depth, opts) {

            return `Operation Log`
        }

        return logExecute
    }

    logRegistration.getMeta = function providerGetMeta (listProperty) {

        return function execGetMeta (data) {

            return listProperty.reduce(function (dataMeta, property) {

                dataMeta[property] = data[property]

                return dataMeta
            }, {})
        }
    }

    return logRegistration
}
