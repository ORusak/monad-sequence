'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")
const all = require("./../../src/operation/monad-operation-basic").all

describe('Monad.sequence', () => {

    describe("monad DI", () => {
        function sum (a, b) {
            const d = b || 5

            return a + d;
        }

        function log (result) {

            return result
        }

        it("init argument action by name", () => {
            const monad = MonadSequence([
                all({
                    a: 1
                }),
                all({
                    b: 2
                }),
                all({
                    result: sum
                }),
                all({
                    message: log
                })
            ]);

            monad.execute()

            return monad.value().should.be.eventually.eql({
                message: 3
            })
        })

        it("throw error if no argument require action by name", () => {
            const monad = MonadSequence([
                all({
                    a: 1,
                    c: 2
                }),
                all({
                    result: sum
                }),
                all({
                    message: log
                })
            ], {
                handlerError: error => Promise.reject(error)
            });

            monad.execute()

            return monad.value().should.be.rejectedWith("Expected for action [sum] required [true] param [b]")
        })

        it("init argument action by name param from scope", () => {
            const monad = MonadSequence([
                all({
                    a: 1,
                    c: 2
                }),
                all({
                    result: [sum, 'a', 'c']
                }),
                all({
                    message: log
                })
            ], {
                handlerError: error => Promise.reject(error)
            });

            monad.execute()

            return monad.value().should.be.eventually.eql({
                message: 3
            })
        })

        it("init argument action as not required", () => {
            const monad = MonadSequence([
                all({
                    a: 1
                }),
                all({
                    result: [sum, 'a', '[c]']
                }),
                all({
                    message: log
                })
            ], {
                handlerError: error => Promise.reject(error)
            });

            monad.execute()

            return monad.value().should.be.eventually.eql({
                message: 6
            })
        })

        it.only("init argument action default value", () => {
            const monad = MonadSequence([
                all({
                    a: 1
                }),
                all({
                    result: [sum, 'a', '[c]=10']
                }),
                all({
                    message: log
                })
            ], {
                handlerError: error => Promise.reject(error)
            });

            monad.execute()

            return monad.value().should.be.eventually.eql({
                message: 11
            })
        })
    })
})
