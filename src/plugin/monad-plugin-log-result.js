/**
 * Created by Oleg Rusak on 11.12.2016.
 *
 * Monad sequence.
 * Plugin: log result
 */

'use strict';

//  todo: documentation

/**
 *
 * Note.
 * 1. Идентификатор монады
 * 2. Идентификатор операции, имя операции
 * 3. Параметры запуска операции: data, scope
 * 4. Параметры запуска каждого действия: аргументы и их значения
 * 5. Возвращаемое значнение действия
 * 6. Возвращаемое значнение операции
 * 7. Структура под очередей
 * 8. Исключительные ситуации
 *
 *
 * Полное описание
 * Sequence [123]
 *      Operation [1]: all
 *          Scope execute: {d: 2}
 *          Param execute: { a: 1, b: 2, two: 3 }
     *          [1] c = Action1 (a = 1, b = true, c = {object})
     *          [2] f = Action2 (a = 1)
 *          Param return: {f: {object}, c: 123}
 *              c = 123
 *              f = {object}
 *
 * Краткое описание
 * Scope: {d: 2}
 * Sequence. Operation all [1.1.1]. Param execute: { a: 1, b: 2, two: 3 }
 * Sequence Operation all [1.1.1]. Param return: { a: 1, b: 2, two: 3 }
 */

module.exports = function setOptionPlugin (logHandler) {

    return {
        start: function handlerStartSequenceExecute (options) {

            return function (data) {
                logHandler(`
Sequence. |----------------------|
Sequence. Start. Id [${options.id}]. Param execute: ${data}`);
            }
        },
        prev: function handlerPrevOperationExecute (operation, index, options) {

            return function (data) {
                const idSequence = `${options.id ? options.id + '.' : ''}${index}`;
                const nameOperation = operation.name;

                logHandler('');
                logHandler(`Sequence. Operation ${nameOperation} [${idSequence}]. Param execute: `,
                    data);
            }
        },
        post: function handlerPostOperationReturn (operation, index, options) {

            return function (data) {
                const idSequence = `${options.id ? options.id + '.' : ''}${index}`;
                const nameOperation = operation.name;

                logHandler(`Sequence. Operation ${nameOperation} [${idSequence}]. Param return: `,
                    data);
            }
        },
        finish: function handlerFinshSequenceExecute (options) {

            return function (data) {
                logHandler(`Sequence. Finish. Id [${options.id}]. Param return: ${data}
Sequence. |----------------------|
`);
            }
        },
        catch: function handlerCatchErrorOperation (options) {

            return function (error) {
                logHandler(`Sequence. Catch error. Id [${options.id}]. `, error);
            }
        }
    }
};
