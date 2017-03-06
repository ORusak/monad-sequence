'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")

const all = MonadSequence.operation.all
const one = MonadSequence.operation.one

describe("Monad.sequence. execute sequence. combine sequence.", () => {

    it ("sub monad sequence. parent manad execute sub monad.", () => {
        const monadChild1 = new MonadSequence([]);
        const monadChild2 = new MonadSequence([]);
        const monadParent = MonadSequence([
            monadChild1,
            monadChild2
        ]);

        monadParent.execute()

        //  return Promise
        return monadParent.value().should.be.eventually.eql({})
    })

    it ("sub monad sequence. get param from parent monad, sub execute, return data.", () => {
        const monadChild2 = new MonadSequence([
            all({
                sum: function (a, b) {
                    return a + b
                }
            })
        ]);
        const monadChild1 = new MonadSequence([
            one("b", 1),
            monadChild2
        ]);

        return MonadSequence([
            one("a", 1),
            monadChild1
        ])
            .execute()
            .value().should.be.eventually.eql({sum: 2})
    })

    it.skip ("monad sequence. avoid collision for execute sequence in parallel.", () => {
        //  todo: test change initScope data
    })
})
