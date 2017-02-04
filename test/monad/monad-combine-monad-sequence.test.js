'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")

describe("Monad.sequence. execute sequence. combine sequence.", () => {

    it ("sub monad sequence. get param from parent monad, sub execute, return data.", () => {
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

    it.skip ("monad sequence. avoid collision for execute sequence in parallel.", () => {
        //  todo: test change initScope data
    })
})
