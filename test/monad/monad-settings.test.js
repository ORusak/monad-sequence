'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")
const all = MonadSequence.operation.all

//  todo: monad execute settings

describe('Monad.sequence. Execute settings.', () => {

    before(function () {

    })

    it("Run with settings by default", function () {
        MonadSequence([])
            .execute()
    })
})
