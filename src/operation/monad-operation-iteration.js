/**
 * Created by Oleg Rusak on 18.12.2016.
 *
 * Monad sequence. Operation. Iteration.
 */

'use strict';

//  todo: documentation

module.exports.map = function setDataActionOperationMap (namePropertyResult, namePropertySource, action) {

    function map (data, scope, initParam) {
        const valueIterable = scope[namePropertySource]

        if (typeof valueIterable[Symbol.iterator] === "undefined") {
            //  todo: custom error
            throw new Error(`[OperationMap] Expect value [${namePropertySource}] as iterable`)
        }

        const listResult = []
        let index = 0

        for (const item of valueIterable) {
            listResult.push(action(item, index++, valueIterable))
        }

        return Promise.all(listResult)
            .then(function processOneActionsResult (result) {

                return {
                    [namePropertyResult]: result
                }
            })
    }

    /**
     * Node js custom inspect
     *
     * @return {string} -
     */
    map.inspect = function inspectOperationAll (depth, opts) {

        return `Operation Map`
    }

    return map
}

module.exports.mapFactory = function setDataActionOperationMap (namePropertyResult, namePropertySource, action) {

    function mapFactory (data, scope, initParam) {
        const valueIterable = scope[namePropertySource]

        if (typeof valueIterable[Symbol.iterator] === "undefined") {
            //  todo: custom error
            throw new Error(`[OperationMap] Expect value [${namePropertySource}] as iterable`)
        }

        const callback = initParam(action, namePropertySource)()
        const listResult = []
        let index = 0

        for (const item of valueIterable) {
            listResult.push(callback(item, index++, valueIterable))
        }

        return Promise.all(listResult)
            .then(function processOneActionsResult (result) {

                return {
                    [namePropertyResult]: result
                }
            })
    }

    /**
     * Node js custom inspect
     *
     * @return {string} -
     */
    mapFactory.inspect = function inspectOperationAll (depth, opts) {

        return `Operation MapFactory`
    }

    return mapFactory
}
