/**
 * Created by Oleg Rusak on 03.11.2016.
 *
 * Monad sequence
 */

'use strict';

//  todo: documentation

const createDebug = require('debug')
const util = require('util')

createDebug.formatters.l = (v) => {
    if (!Array.isArray(v)){

        return String(v)
    }

    const colors = this.useColors;

    return util.inspect(v, {
            // showHidden: false,
            depth: 0,
            colors: colors,
            // customInspect: true,
            // showProxy: false,
            // maxArrayLength: 100,
            // breakLength: 60
    });
}

const debug = createDebug("monad:sequence")
const debugDetailValue = createDebug("monad:sequence:value")

const srvAsyncSequence = require('./monad-async-sequence-service');

const operationBasic = require("./operation/monad-operation-basic")
const operationCondition = require("./operation/monad-operation-condition")

/**
 *
 * @param {function[]} [initListOperation] -
 * @param {object} [settings] -
 * @return {MonadSequence} -
 *
 * @constructor
 */
function MonadSequence (initListOperation, settings) {
    if (typeof this === "undefined") {

        return new MonadSequence(initListOperation, settings);
    }

    /**
     *
     * Note. Execute MUST run with immutable data. It need for resolve collision with parallels run monad.
     *
     * @param {object} settingsNew -
     * @param {object} [scope] -
     *
     * @return {MonadSequence} -
     */
    this.execute = function execute (settingsNew, scope) {
        const settingsInit = Object.assign({}, this._settings, settingsNew);

        this._value = srvAsyncSequence.executeAsyncSequence(this._listOperation, settingsInit, scope);

        return this;
    }

    this.setSettingsByDefault = function setSettingsByDefault () {

        this._settings = Object.assign({}, {
            codeExecuteMode: MonadSequence.modeExecutive.normal,
            debug: false,
            id: this._id,
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

    this.getListOperation = function getListOperation () {

        return this._listOperation;
    }

    this.setListOperation = function setListOperation (listOperationNew) {

        this._listOperation = listOperationNew;

        return this;
    }

    this.value = function value () {

        return this._value
    }

    /**
     * Node js custom inspect
     *
     * @return {string} -
     */
    this.inspect = function inspectMonad () {

        return `MonadSequence. Id [${this.getSettings().id}]`
    }
    
    this._getUniqueId = function _getUniqueId () {

        return Math.floor(Math.random() * 10000000)
    }

    this._getId = function getId (id) {

        return id ? id : this._getUniqueId()
    }

    /**
     *
     * @param {object} settingsInit -
     *
     * @private
     * @return {object} -
     */
    this._initSetting = function _initSetting (settingsInit) {
        debug("    Initializing parameter. Settings: type [%s]", typeof settingsInit);

        if (!settingsInit) {
            debug("    Initializing parameter. Set setting by default.");

            this.setSettingsByDefault();
        } else {
            debug("    Initializing parameter. Set setting assign default and parameter.");

            this.setSettingsByDefault();
            this.setSettings(settingsInit);
        }
        debugDetailValue("          Initializing parameter. Setting: %o", this.getSettings());
    }

    this._initListOperation = function _initListOperation (initListOperation) {
        debug("    Initializing parameter. List operation: type [%s]", typeof initListOperation);

        if (!initListOperation) {
            debug("    Initializing parameter. Set list operation by default: empty list");

            this.setListOperation([]);
        } else {
            debug("    Initializing parameter. Set list operation: %d count operation", initListOperation.length);

            this.setListOperation(initListOperation);
        }

        debugDetailValue("          Initializing parameter. List operation: %l", this.getListOperation());
    }

    this._id = this._getId(settings.id)

    debug("    Initializing monad.sequence start. Id [%s]", this._id);

    //  todo: in debug mode check list operation on integrity
    this._initListOperation(initListOperation)
    this._initSetting(settings)

    debug("    Initializing monad.sequence end. Id [%s]", this._id);
}

MonadSequence.modeExecutive = {
    strict: 'strict',
    normal: 'normal'
};

MonadSequence.operation = {
    all: operationBasic.all,
    one: operationBasic.one,
    race: operationCondition.race
};

module.exports = MonadSequence
