'use strict'

/* global describe, it*/

const winston = require("winston");
const logger = new (winston.Logger)({
    level: 'debug',
    handleExceptions: false,
    transports: [
        new (winston.transports.Console)({
            timestamp() {
                return (new Date()).toGMTString()
            }
        }),
    ],
});

const MonadSequence = require("./../../src/monad")

const all = MonadSequence.operation.all
const logFactory = MonadSequence.operation.log

describe('Monad.sequence. Operation log', () => {

    function handlerError (error) {

        console.log("sequence calculate with error: ", error);
    }

    const log = logFactory(logger);

    it("complite usage", () => {
        const monad = MonadSequence([
            all({
                one: 1,
                dataDocument: {
                    id: 1,
                    name: "name_document"
                }
            }),
            log("info", "Milestone %s %s", "one", "dataDocument"),
            log("debug", "Milestone %s %j", "one", "dataDocument", log.getMeta(["one", "dataDocument"])),
        ], {
            id: "logMonad"
        })

        monad.execute({
            handlerError: handlerError
        })

        return monad.value().should.be.eventually.eql(null)
    })
})
