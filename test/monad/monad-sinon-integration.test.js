'use strict'

/* global describe, it*/

const sinon = require("sinon")
require("should-sinon")

const MonadSequence = require("./../../src/monad")
const all = require("./../../src/operation/monad-operation-basic").all

describe('Monad.sequence. Sinon test.', () => {

    //  action
    const addOne = function (value) {
        return value + 1;
    }

    const addOneOther = function (one) {
        return one + 1;
    }

    it ("operation all. auto init argument action. assign result action with name in result operation data.", () => {
        const spyAddOne = sinon.spy(addOne)
        const spyAddOneOther = sinon.spy(addOneOther)

        const monad = MonadSequence([
            all({
                value: 1    //  strict value
            }),
            all({
                one: spyAddOne,
                two: 2,
                three: 3,
            }),
            all({
                one: spyAddOneOther
            })
        ], {
            handlerError: function (error) {
                console.log(error)
            }
        })

        monad
            .execute()
            .value()
            .then(function assertResult () {
                spyAddOneOther.should.be.calledOnce().and.calledWith(2)
                spyAddOne.should.be.calledOnce().and.calledWith(1)
            })
    })
})
