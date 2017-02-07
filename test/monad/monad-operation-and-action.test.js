'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")
const all = require("./../../src/operation/monad-operation-basic").all
const one = require("./../../src/operation/monad-operation-basic").one
const race = require("./../../src/operation/monad-operation-condition").race

describe('Monad.sequence. Operation and action.', () => {

    //  action
    const addOne = function (value) {
        return value + 1;
    }

    const addOneOther = function (one) {
        return one + 1;
    }

    function timeout (count) {

        return function execTimeout () {

            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(count)
                }, count)
            })
        }
    }

    it ("operation all. auto init argument action. assign result action with name in result operation data.", () => {
        const monad = MonadSequence([
            all({
                value: 1    //  strict value
            }),
            all({
                one: addOne,
                two: 2,
                three: 3,
            }),
            all({
                one: addOneOther
            })
        ])

        monad.execute()

        return monad.value().should.be.eventually.eql({
            one: 3
        })
    })

    it ("operation all. execute action parallel.", () => {
        const monad = MonadSequence([
            all({
                one: timeout(300),
                two: timeout(600),
            })
        ])

        monad.execute()

        return monad.value().should.be.eventually.eql({
            one: 300,
            two: 600,
        })
    })

    it ("operation one. execute one action with set name property.", () => {
        const monad = MonadSequence([
            one(timeout(300), "one")
        ])

        monad.execute()

        return monad.value().should.be.eventually.eql({
            one: 300
        })
    })

    it ("operation race. execute action parallel. return first finished.", () => {
        const monad = MonadSequence([
            race({
                one: timeout(1000),
                two: timeout(2000),
            })
        ])

        monad.execute()

        return monad.value().should.be.eventually.eql({
            one: 1000
        })
    })
})
