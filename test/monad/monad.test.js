'use strict'

/* global describe, it*/

const should = require("should")

const MonadSequence = require("./../../src/monad")

describe('Monad.sequence', () => {

    describe('base behavior', () => {

        it("init", () => {
            const sequenceFactory = MonadSequence([]);
            const sequenceClass = new MonadSequence([]);

            sequenceFactory.should.be.instanceof(MonadSequence)
            sequenceClass.should.be.instanceof(MonadSequence)
        })

        it("execute sequence return promise with empty object", () => {
            const monad = MonadSequence();

            monad.execute()

            //  return Promise
            return monad.value().should.be.eventually.eql({})
        })

        it("execute sequence as chain", () => {
            return MonadSequence()
                .execute()
                .value().should.be.eventually.eql({})
        })
    })

    describe("execute sequence. base mechanic.", () => {
        //  action
        const addOne = function (value) {
            return value + 1;
        }

        const addOneOther = function (one) {
            return one + 1;
        }

        //  return base type value
        function customOperation1 () {

            return 1
        }

        //  return key: value
        function customOperation2 (data) {

            return {
                first: data
            }
        }

        //  return Promise
        function customOperation3 (data) {

            return Promise.resolve({
                one: data.first,
                two: 2,
                three: 3,
            });
        }

        it("sequence operation. simple promise chain wrap.", () => {
            const monad = MonadSequence([
                customOperation1,
                customOperation2,
                customOperation3,
                //  call directly action
                function customOperation4 (data) {
                    //  access only data prev operation
                    data.should.be.eql({
                        one: 1,
                        two: 2,
                        three: 3,
                    })

                    const two = addOne(data.one)

                    return {
                        one: two
                    };
                }
            ]);

            monad.execute()

            return monad.value().should.be.eventually.eql({
                one: 2
            })

        })

        it("sequence operation. promise chain with access previous operation data value.", () => {
            const monad = MonadSequence([
                customOperation1,
                customOperation2,
                customOperation3,
                //  call directly action
                function operation4 (data, scope) {
                    //  access data prev customOperation1
                    const two = addOne(scope.first)

                    return {
                        one: two
                    };
                }
            ]);

            monad.execute()

            return monad.value().should.be.eventually.eql({
                one: 2
            })

        })

        it("sequence operation. promise chain with init value action.", () => {
            const monad = MonadSequence([
                customOperation1,
                customOperation2,
                customOperation3,
                //  call directly action with auto init chain data
                function operation4 (data, scope, initValue) {
                    //  addOne require argument name 'value'
                    //  monad auto init value from data or scope
                    //  if param no in data throw error
                    should.throws(initValue.bind(null, addOne), 'Error')    //  no value

                    should.doesNotThrow(initValue.bind(null, addOneOther), 'Error') //  exist one

                    const two = initValue(addOneOther)()

                    return {
                        one: two
                    };
                }
            ])

            monad.execute()

            return monad.value().should.be.eventually.eql({
                one: 2
            })

        })
    })
})
