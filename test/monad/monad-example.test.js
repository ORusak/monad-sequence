'use strict'

/* global describe, it*/

const MonadSequence = require("./../../src/monad")

const all = MonadSequence.operation.all
const race = MonadSequence.operation.race

describe('Monad.sequence. Example usage', () => {

    function handlerError (error) {

        console.log("sequence calculate with error: ", error);
    }

    function getInitValue (one, five) {
        return 1 + one + five
    }

    function getContext (value1, value2, value3) {
        return 'ctx' + (value1 + value2)
    }

    function giveFive (one) {
        return one * 5
    }

    function timeout (count) {

        return function execTimeout () {

            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(count)
                }, count)
            })
        }
    }

    function getFirstCar (car1, car2, car3) {

        return car1 || car2 || car3
    }

    it("complite usage", () => {
        const id = 123

        const monad4 = MonadSequence([
            all({
                five: giveFive
            })
        ], {id: "returnFive"})

        const monad = MonadSequence([
            all({
                one: 1
            }),
            all({
                a: 1,
                b: 2,
                two: 3
            }),
            race({
                car1: timeout(4000),
                car2: timeout(2000),
                car3: timeout(1000)
            }),
            monad4,
            all({
                ctx: [getContext, "a", "b"],
                value: getInitValue,
                id: id,
                firstCar: [getFirstCar, "[car1]", "[car2]", "[car3]"]
            })
        ])

        monad.execute({
            id: "mainMonad",
            handlerError: handlerError
        })

        return monad.value().should.be.eventually.eql({
            ctx: 'ctx3',
            firstCar: 1000,
            id: 123,
            value: 7
        })
    })
})
