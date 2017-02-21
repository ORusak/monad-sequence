'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")

const all = require("./../../src/operation/monad-operation-basic").all

describe('Monad.sequence. Exception handling.', () => {

    function somethingBreak () {
        throw new Error("boom!");

        return 1;
    }

    function handlerError (error) {
        //console.log(error);

        return Promise.reject(error);
    }

    function handlerErrorExtend (error, setting, scope) {
        const message = `[monad.sequence] Id [${setting.id}]. Process object id [${scope.idObject}]. Execute with error.`
        //  output message to log..

        message.should.be.equal("[monad.sequence] Id [mainMonad]. Process object id [1]. Execute with error.")

        return Promise.reject(error);
    }

    let monad

    before(() => {
        monad = MonadSequence([
            all({
                value: somethingBreak
            })
        ])
    });

    it("not usage handler exception. error rejected.", () => {

        monad.execute({
            id: "mainMonad",
            handlerError: null
        })

        return monad.value().should.be.rejectedWith('boom!')
    })

    it("usage handler exception", () => {

        monad.execute({
            id: "mainMonad",
            handlerError: handlerError
        })

        return monad.value().should.be.rejectedWith('boom!')
    })

    it("handler exception. extended info about execute.", () => {
        const monadExtend = MonadSequence([
            all({
                idObject: 1
            }),
            all({
                value: somethingBreak
            })
        ])

        return monadExtend
            .execute({
                id: "mainMonad",
                handlerError: handlerErrorExtend
            })
            .value().should.be.rejectedWith('boom!')
    })
})
