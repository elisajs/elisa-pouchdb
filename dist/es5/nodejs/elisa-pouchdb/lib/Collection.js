"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _elisa = require("elisa");
var _elisaUtil = require("elisa-util");
var _CollectionQuery = require("./CollectionQuery");var _CollectionQuery2 = _interopRequireDefault(_CollectionQuery);
var _ViewEngine = require("./ViewEngine");var _ViewEngine2 = _interopRequireDefault(_ViewEngine);
var _DbEngine = require("./DbEngine");var _DbEngine2 = _interopRequireDefault(_DbEngine);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}


var check = new _elisaUtil.Checker().check;
var update = new _elisaUtil.Updater().update;
var viewEngine = new _ViewEngine2.default();
var dbEngine = new _DbEngine2.default();


var insertDocs = Symbol();
var insertDoc = Symbol();var _class = function (_Collection) {_inherits(_class, _Collection);


















  function _class(schema, name, opts) {_classCallCheck(this, _class);var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, 
    schema, name, opts));

    if (!opts) opts = {};
    Object.defineProperty(_this, "prefix", { value: opts.prefix || _this.qn + ":" });
    Object.defineProperty(_this, "view", { value: opts.view === true ? name : opts.view });
    Object.defineProperty(_this, "id", { value: opts.id || "uuid" });
    Object.defineProperty(_this, "sequence", { value: opts.sequence || _this.qn + ".__sequence_" });return _this;}_createClass(_class, [{ key: "isView", value: function isView() 







    {
      return !!this.view;} }, { key: "key", value: function key(
























    id) {
      return this.prefix + id;} }, { key: "query", value: function query() 





    {
      return new _CollectionQuery2.default(this);} }, { key: "_hasId", value: function _hasId(





    id, callback) {
      if (this.isView()) viewEngine.hasId(this, id, callback);else 
      dbEngine.hasId(this, id, callback);} }, { key: "_count", value: function _count(





    opts, callback) {
      this._findAll(opts, function (error, res) {
        if (error) callback(error);else 
        callback(undefined, res.length);});} }, { key: "_findAll", value: function _findAll(






    opts, callback) {
      if (this.isView()) viewEngine.findAll(this, opts, callback);else 
      dbEngine.findAll(this, opts, callback);} }, { key: "nextSequenceValue", value: function nextSequenceValue(








    callback) {var _this2 = this;
      this.client.get(this.sequence, function (res, seq) {

        if (res) {
          if (res.error && res.reason == "missing") {
            seq = { 
              value: 0, 
              _id: _this2.sequence };} else 

          {
            return callback(res);}}




        seq.value += 1;
        _this2.client.put(seq, function (res) {
          if (res) callback(res);else 
          callback(undefined, seq.value);});});} }, { key: "_insert", value: function _insert(







    docs, opts, callback) {
      if (docs instanceof Array) this[insertDocs](docs, opts, callback);else 
      this[insertDoc](docs, opts, callback);} }, { key: 


    insertDoc, value: function value(doc, opts, callback) {
      dbEngine.insert(this, doc, opts, callback);} }, { key: 


    insertDocs, value: function value(docs, opts, callback) {var _this3 = this;
      var insert = function insert(i) {
        if (i < docs.length) {
          _this3[insertDoc](docs[i], opts, function (error) {
            if (error) callback(error);else 
            insert(i + 1);});} else 

        {
          callback();}};



      insert(0);} }, { key: "_update", value: function _update(





    query, upd, opts, callback) {var _this4 = this;
      this.q().filter(query)._run({}, function (error, res) {
        var modify = function modify(i) {
          if (i < res.length) {
            var doc = res.docs[i];

            if (check(doc, query)) {
              update(doc, upd);

              _this4.client.put(doc, function (res) {
                if (res && res.error) callback(res);else 
                modify(i + 1);});} else 

            {
              modify(i + 1);}} else 

          {
            callback();}};



        modify(0);});} }, { key: "_remove", value: function _remove(






    query, opts, callback) {var _this5 = this;
      this.q().filter(query)._run({}, function (error, res) {
        var remove = function remove(i) {
          if (i < res.length) {
            _this5.client.remove(res.docs[i], opts, function (error) {
              if (error) callback(error);else 
              remove(i + 1);});} else 

          {
            callback();}};



        if (error) callback(error);else 
        remove(0);});} }, { key: "_truncate", value: function _truncate(






    opts, callback) {
      if (this.isView()) viewEngine.truncate(this, opts, callback);else 
      dbEngine.truncate(this, opts, callback);} }, { key: "viewId", get: function get() {return this.isView() ? this.schema.design + "/" + this.view : undefined;} }, { key: "client", get: function get() {return this.connection.client;} }]);return _class;}(_elisa.Collection);exports.default = _class;