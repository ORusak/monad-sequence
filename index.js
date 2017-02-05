/**
 * Created by Oleg Rusak on 04.02.2017.
 */

"use strict"

const MonadSequence = require("./src/monad")

const monad = MonadSequence();

monad.execute()

//  return Promise
monad.value()
    .then(console.log)
