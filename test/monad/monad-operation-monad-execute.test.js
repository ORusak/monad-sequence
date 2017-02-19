'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")
const monad = MonadSequence.operation.monad
const one = require("./../../src/operation/monad-operation-basic").one
const all = require("./../../src/operation/monad-operation-basic").all

describe('Monad.sequence. Operation monad.', () => {

    //  action

    it ("operation monad. set return from sub monad value directly.", () => {

        const subMonad = MonadSequence([
            all({
                foo: 1,
                too: 2,
                boo: 3,
            })
        ])

        return MonadSequence([
            one("goo", 1),
            monad(["foo", "boo"], subMonad),
            one("result", function result (foo, boo, goo) {

                return foo + boo + goo
            })
        ])
            .execute()
            .value().should.be.eventually.eql({
                result: 5
            })
    })

    it ("operation monad. no access no defined value.", () => {

        const subMonad = MonadSequence([
            all({
                foo: 1,
                too: 2,
                boo: 3,
            })
        ])

        return MonadSequence([
            one("goo", 1),
            monad(["foo", "boo"], subMonad),
            one("result", function result (foo, boo, goo, too) {

                return foo + boo + goo + too
            })
        ], {
            handlerError: error => Promise.reject(error)
        })
            .execute()
            .value()
            .should.be.rejectedWith("Expected for action [result] required [true] param [too]")
    })

    it ("operation monad. error with no requested value.", () => {

        const subMonad = MonadSequence([
            all({
                foo: 1,
                too: 2,
                boo: 3,
            })
        ])

        return MonadSequence([
            one("goo", 1),
            monad(["foo", "boo", "doo"], subMonad),
            one("result", function result (foo, boo, goo, doo) {

                return foo + boo + goo + doo
            })
        ], {
            handlerError: error => Promise.reject(error)
        })
            .execute()
            .value()
            .should.be.rejectedWith("[OperationMonad] Expect in result execute monad key [doo] value not undefined")
    })
})
