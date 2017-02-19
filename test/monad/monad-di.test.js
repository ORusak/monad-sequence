'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")
const all = MonadSequence.operation.all
const one = MonadSequence.operation.one

describe('Monad.sequence. DI', () => {

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

    //  todo: show name param
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

    it("init argument action by name param from scope in custom operation", () => {
        const monad = MonadSequence([
            //  call directly action with auto init chain data
            all({
                a: 1,
                c: 2
            }),
            function operation2 (data, scope, initValue) {
                const result = initValue([sum, 'a', 'c'])()

                return {
                    result: result
                };
            },
            all({
                message: log
            })
        ])

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

    it("init argument action. set value directly without set in scope.", () => {

        return MonadSequence([
            one("a", 1),
            all({
                "result": [sum, 'a', '[c]=10'],
                //  override a value
                "resultToo": [sum, 'a=2', '[c]=10']
            }),
            one("message", function log (result, resultToo) {

                return result + resultToo
            })
        ], {
            handlerError: error => Promise.reject(error)
        })
            .execute()
            .value().should.be.eventually.eql({
                message: 23
            })
    })

    //  this problem solved spread operator, but not support yet all platform
    it("bind for save context action", () => {
        function Animal (name) {
            this.name = name;

            this.getName = function getName () {

                return this.name;
            }
        }

        const animal = new Animal ("choo")

        const monad = MonadSequence([
            all({
                message: animal.getName.bind(animal)
            })
        ], {
            handlerError: error => Promise.reject(error)
        });

        monad.execute()

        return monad.value().should.be.eventually.eql({
            message: "choo"
        })
    })
})
