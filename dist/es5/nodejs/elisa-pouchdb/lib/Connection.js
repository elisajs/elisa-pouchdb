"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _pouchdb = require("pouchdb");var _pouchdb2 = _interopRequireDefault(_pouchdb);
var _elisa = require("elisa");
var _Database = require("./Database");var _Database2 = _interopRequireDefault(_Database);
var _Server = require("./Server");var _Server2 = _interopRequireDefault(_Server);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}


_pouchdb2.default.plugin(require("pouchdb-find"));var _class = function (_Connection) {_inherits(_class, _Connection);function _class() {_classCallCheck(this, _class);return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));}_createClass(_class, [{ key: "_open", value: function _open(


















    callback) {
      var name, opts, type, config = this.options;


      if (!callback) callback = function callback() {};


      opts = {};

      if (config.hasOwnProperty("protocol") || 
      config.hasOwnProperty("host") || 
      config.hasOwnProperty("port") || 
      config.hasOwnProperty("username")) {
        type = "remote";
        config.port = config.port || 5984;
        name = (config.protocol || "http") + "://" + config.host + ":" + config.port + "/" + config.db;

        if (config.hasOwnProperty("ajax")) opts.ajax = config.ajax;
        if (config.hasOwnProperty("username")) opts.auth = { username: config.username, password: config.password };
        if (config.hasOwnProperty("skipSetup")) opts.skip_setup = config.skipSetup;} else 
      if (config.hasOwnProperty("db")) {
        type = "local";
        name = config.location + "/" + config.db;

        if (config.hasOwnProperty("autoCompaction")) opts.auto_compaction = config.aitoCompaction;
        if (config.hasOwnProperty("adapter")) opts.adapter = config.adapter;
        if (config.hasOwnProperty("revsLimit")) opts.revs_limit = config.revsLimit;} else 
      {
        type = "in-memory";
        name = "in-memory";
        opts = { db: require("memdown") };}



      Object.defineProperty(this, "client", { value: new _pouchdb2.default(name, opts), configurable: true });
      Object.defineProperty(this, "subtype", { value: type, configurable: true });


      callback();} }, { key: "_close", value: function _close(












    callback) {
      if (!callback) callback = function callback() {};
      delete this.client;
      delete this.subtype;
      callback();} }, { key: "_connected", value: function _connected(





    callback) {
      if (this.opened) this._ping(function (error) {return callback(undefined, !error);});else 
      callback(undefined, false);} }, { key: "_ping", value: function _ping(












    callback) {
      if (this.opened) {
        this.client.info(function (error, res) {
          callback(undefined, !error);});} else 

      {
        callback(new Error("Connection closed."));}} }, { key: "server", get: function get() {return new _Server2.default(this);} }, { key: "opened", get: function get() {return !!this.client;} }, { key: "database", get: function get() {return new _Database2.default(this, this.options.db || "in-memory");} }]);return _class;}(_elisa.Connection);exports.default = _class;