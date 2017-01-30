/**
 * Created by Oleg Rusak on 08.01.2017.
 */
'use strict';

class GeneralPluginService {
    static getObjectValueByKey (dataAction) {

        return function execGetObjectValueByKey (key) {
            if (key in dataAction) {
                return dataAction[key]
            }

            //  undefined
            return void 0;
        }
    }
}

module.exports = GeneralPluginService;
