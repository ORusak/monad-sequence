/**
 * Created by Oleg Rusak on 08.01.2017.
 */

'use strict';
//  todo: lib di

class DebugService {
    static log (option, message, data) {
        if (!option.debug) {
            return null;
        }

        if (option.log) {
            option.log(message, data)
        } else {
            console.log(message, data)
        }
    }
}

module.exports = DebugService;
