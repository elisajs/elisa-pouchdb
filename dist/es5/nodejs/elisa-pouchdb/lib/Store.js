"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _elisa = require("elisa");
var _elisaUtil = require("elisa-util");
var _Result = require("./Result");var _Result2 = _interopRequireDefault(_Result);
var _ViewEngine = require("./ViewEngine");var _ViewEngine2 = _interopRequireDefault(_ViewEngine);
var _DbEngine = require("./DbEngine");var _DbEngine2 = _interopRequireDefault(_DbEngine);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}


var insertDoc = Symbol();
var insertDocs = Symbol();


var update = new _elisaUtil.Updater().update;
var filter = new _elisaUtil.Filter().filter;
var project = new _elisaUtil.Projector().project;
var viewEngine = new _ViewEngine2.default();
var dbEngine = new _DbEngine2.default();var _class = function (_Store) {_inherits(_class, _Store);














  function _class(schema, name, opts) {_classCallCheck(this, _class);var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, 
    schema, name, opts));

    if (!opts) opts = {};
    Object.defineProperty(_this, "prefix", { value: opts.prefix || _this.qn + ":" });
    Object.defineProperty(_this, "view", { value: opts.view === true ? name : opts.view });return _this;}_createClass(_class, [{ key: "isView", value: function isView() 







    {
      return !!this.view;} }, { key: "key", value: function key(
























    id) {
      return this.prefix + id;} }, { key: "_hasId", value: function _hasId(





    id, callback) {
      if (this.isView()) viewEngine.hasId(this, id, callback);else 
      dbEngine.hasId(this, id, callback);} }, { key: "_count", value: function _count(





    opts, callback) {
      this._findAll(opts, function (error, res) {
        if (error) callback(error);else 
        callback(undefined, res.length);});} }, { key: "_findOne", value: function _findOne(






    query, opts, callback) {
      if (this.isView()) viewEngine.findOne(this, query, {}, opts, callback);else 
      dbEngine.findOne(this, query, {}, opts, callback);} }, { key: "_findAll", value: function _findAll(





    opts, callback) {
      if (this.isView()) viewEngine.findAll(this, opts, callback);else 
      dbEngine.findAll(this, opts, callback);} }, { key: "_insert", value: function _insert(





    docs, opts, callback) {
      if (docs instanceof Array) this[insertDocs](docs, opts, callback);else 
      this[insertDoc](docs, opts, callback);} }, { key: 


    insertDoc, value: function value(doc, opts, callback) {
      var cli = this.client;
      var _id;


      _id = this.key(doc.id);


      cli.put(doc, _id, opts, function (res) {
        if (res && res.error) {
          if (res.name == "conflict" && res.message == "Document update conflict") {

            cli.get(_id, function (err, cur) {
              cli.put(doc, _id, cur._rev, function (res) {
                if (res && res.error) callback(res);else 
                callback();});});} else 


          {
            callback(res);}} else 

        {
          callback();}});} }, { key: 




    insertDocs, value: function value(docs, opts, callback) {var _this2 = this;
      var insert = function insert(i) {
        if (i < docs.length) {
          _this2[insertDoc](docs[i], opts, function (error) {
            if (error) callback(error);else 
            insert(i + 1);});} else 

        {
          callback();}};



      insert(0);} }, { key: "_update", value: function _update(





    query, updt, opts, callback) {var _this3 = this;

      if (!opts) opts = {};
      if (!callback) callback = function callback() {};


      this._findOne({ id: query.id }, {}, function (error, doc) {
        if (doc) {
          update(doc, updt);
          _this3._insert(doc, opts, function (error) {
            if (error) callback(error);else 
            callback();});} else 

        {
          callback();}});} }, { key: "_remove", value: function _remove(







    query, opts, callback) {
      var client = this.client;
      var _id;


      if (!opts) opts = {};
      if (!callback) callback = function callback() {};


      _id = this.key(query.id);


      if (query._rev || opts.rev) {
        client.remove(_id, query._rev || opts.rev, function (res) {
          if (res && res.error) {
            if (res.message == "missing") callback();else 
            callback(res);} else 
          {
            callback();}});} else 


      {
        client.get(_id, function (res, doc) {
          if (doc) {
            client.remove(_id, doc._rev, function (res) {
              if (res && res.error) {
                if (res.message == "missing") callback();else 
                callback(res);} else 
              {
                callback();}});} else 


          {
            callback();}});}} }, { key: "_truncate", value: function _truncate(








    opts, callback) {
      if (this.isView()) viewEngine.truncate(this, opts, callback);else 
      dbEngine.truncate(this, opts, callback);} }, { key: "viewId", get: function get() {return this.isView() ? this.schema.design + "/" + this.view : undefined;} }, { key: "client", get: function get() {return this.connection.client;} }]);return _class;}(_elisa.Store);exports.default = _class;