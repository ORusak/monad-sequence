/**
 * Created by Oleg Rusak on 03.11.2016.
 *
 * Monad sequence
 */

'use strict';

//  todo: documentation

const srvAsyncSequence = require('./monad-async-sequence-service');

const operationBasic = require("./operation/monad-operation-basic")
const operationCondition = require("./operation/monad-operation-condition")

function MonadSequence (listOperation, settings) {
    if (typeof this === "undefined") {
        return new MonadSequence(listOperation, settings);
    }

    //  todo: in debug mode check list operation on integrity
    this._listOperation = listOperation || [];

    this.modeExecutive = {
        strict: 'strict',
        normal: 'normal'
    };

    /**
     *
     * Note. Execute MUST run with immutable data. It need for resolve collision with parallels run monad.
     *
     * @param {object} settingsNew -
     * @param {object} [initScope] -
     */
    this.execute = function sequence (settingsNew, scope) {
        // srvDebug.log(optionsInit, "[MonadSequence.executeSequence] Execute with data: ", scopeParent, dataValue)

        //  init
        const settingsInit = Object.assign({}, this._settings, settingsNew);

        this._value = srvAsyncSequence.executeAsyncSequence(this._listOperation, settingsInit, scope);

        return this;
    }

    this.setSettingsByDefault = function setSettingsByDefault () {

        this._settings = Object.assign({}, {
            codeExecuteMode: this.modeExecutive.normal,
            debug: false,
            id: Date.now(),
            handlerError: null
        });
    }

    this.setSettings = function setSettings (settingsNew) {

        this._settings = Object.assign({}, this._settings, settingsNew);

        return this;
    }

    this.getSettings = function getSettings () {

        return Object.assign({}, this._settings);
    }

    this.value = function value () {

        return this._value
    }

    //  init
    this.setSettingsByDefault();
    this.setSettings(settings);
}

MonadSequence.modeExecutive = {
    strict: 'strict',
    normal: 'normal'
};

MonadSequence.operation = {
    all: operationBasic.all,
    race: operationCondition.race
};

module.exports = MonadSequence
