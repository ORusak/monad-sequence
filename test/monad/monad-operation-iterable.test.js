'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")
const all = require("./../../src/operation/monad-operation-basic").all
const one = require("./../../src/operation/monad-operation-basic").one

const mapFactory = require("./../../src/operation/monad-operation-iteration").mapFactory
const map = require("./../../src/operation/monad-operation-iteration").map

const a = [1, 2, 3]

describe('Monad.sequence. Operation iterable.', () => {

    //  action

    it ("operation mapFactory. transform iterable object", () => {
        //  typeof valueIterable[Symbol.iterator] !== "undefined"

        function powQuad () {

            return function callbackPowQuad(item) {

                return Math.pow(item, 2)
            }
        }

        return MonadSequence([
            all({
                exponent: 2,
                "numeric": a
            }),
            mapFactory("quaderic", "numeric", powQuad)
        ])
            .execute()
            .value().should.be.eventually.eql({
                quaderic: [1, 4, 9]
            })
    })

    it ("operation mapFactory. get value from prev operation", () => {
        //  typeof valueIterable[Symbol.iterator] !== "undefined"

        function powQuad (exponent) {

            return function (item) {

                return Math.pow(item, exponent)
            }
        }

        return MonadSequence([
            all({
                exponent: 3,
                numeric: a
            }),
            mapFactory("quaderic", "numeric", powQuad)
        ])
            .execute()
            .value().should.be.eventually.eql({
                quaderic: [1, 8, 27]
            })
    })

    it ("operation mapFactory. complex example.", () => {

        const b = [1, 4, 9]

        function calculateAverage () {
            let total = 0

            return function (item, index, list) {
                total += item

                return Math.floor(total / (index + 1))
            }
        }

        return MonadSequence([
            one("numeric", b),
            mapFactory("quaderic", "numeric", calculateAverage)
        ])
            .execute()
            .value().should.be.eventually.eql({
                quaderic: [1, 2, 4]
            })
    })

    it ("operation map. simple callback. transform iterable object.", () => {
        //  typeof valueIterable[Symbol.iterator] !== "undefined"

        function callbackPowQuad(item) {

            return Math.pow(item, 2)
        }

        return MonadSequence([
            one("numeric", a),
            map("quaderic", "numeric", callbackPowQuad)
        ])
            .execute()
            .value().should.be.eventually.eql({
                quaderic: [1, 4, 9]
            })
    })
})
