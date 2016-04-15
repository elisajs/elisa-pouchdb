"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _elisa = require("elisa");
var _elisaUtil = require("elisa-util");
var _Result = require("./Result");var _Result2 = _interopRequireDefault(_Result);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}


var key = Symbol();
var insertDoc = Symbol();
var insertDocs = Symbol();


var update = new _elisaUtil.Updater().update;
var filter = new _elisaUtil.Filter().filter;
var project = new _elisaUtil.Projector().project;var _class = function (_Store) {_inherits(_class, _Store);












  function _class(schema, name, opts) {_classCallCheck(this, _class);

    if (!opts) opts = {};var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, 


    schema, name));
    Object.defineProperty(_this, "prefix", { value: opts.prefix || _this.qn + ":" });return _this;}_createClass(_class, [{ key: 















    key, value: function value(id) {
      return this.prefix + id;} }, { key: "_hasId", value: function _hasId(





    id, callback) {
      var _id;


      _id = this[key](id);


      this.client.get(_id, function (res, doc) {
        if (res) {
          if (res.error && res.reason == "missing") callback(undefined, false);else 
          callback(err);} else 
        {
          callback(undefined, true);}});} }, { key: "_find", value: function _find(







    query, opts, callback) {
      var _id;


      if (!opts) opts = {};
      if (!query.id) throw new Error("Id field expected.");


      _id = this[key](query.id);


      this.client.get(_id, opts, function (err, doc) {
        if (err && err.message != "missing") {
          callback(err);} else 
        {

          callback(undefined, doc);}});} }, { key: "_findOne", value: function _findOne(







    query, opts, callback) {
      this._find(query, opts, callback);} }, { key: "_findAll", value: function _findAll(





    opts, callback) {var _this2 = this;

      if (!opts) opts = {};


      this.client.allDocs(Object.assign({ include_docs: true }, opts), function (error, docs) {
        if (error) callback(error);else 
        callback(undefined, new _Result2.default(filter(project(docs.rows, "doc", { top: true }), { _id: { $like: "^" + _this2.qn + ":" } })));});} }, { key: "_insert", value: function _insert(






    docs, opts, callback) {

      if (!opts) opts = {};
      if (!callback) callback = function callback() {};


      if (docs instanceof Array) this[insertDocs](docs, opts, callback);else 
      this[insertDoc](docs, opts, callback);} }, { key: 


    insertDoc, value: function value(doc, opts, callback) {var _this3 = this;
      var _id;


      _id = this[key](doc.id);


      this.client.put(doc, _id, opts, function (res) {
        if (res && res.error) {
          if (res.name == "conflict" && res.message == "Document update conflict") {

            _this3.client.get(_id, function (err, cur) {
              _this3.client.put(doc, _id, cur._rev, function (res) {
                if (res && res.error) callback(res);else 
                callback();});});} else 


          {
            callback(res);}} else 

        {
          callback();}});} }, { key: 




    insertDocs, value: function value(docs, opts, callback) {var _this4 = this;
      var insert = function insert(i) {
        if (i < docs.length) {
          _this4[insertDoc](docs[i], opts, function (error) {
            if (error) callback(error);else 
            insert(i + 1);});} else 

        {
          callback();}};



      insert(0);} }, { key: "_update", value: function _update(





    query, updt, opts, callback) {var _this5 = this;

      if (!opts) opts = {};
      if (!callback) callback = function callback() {};


      this._find({ id: query.id }, {}, function (error, doc) {
        if (doc) {
          update(doc, updt);
          _this5._insert(doc, opts, function (error) {
            if (error) callback(error);else 
            callback();});} else 

        {
          callback();}});} }, { key: "_remove", value: function _remove(







    query, opts, callback) {var _this6 = this;
      var _id;


      if (!opts) opts = {};
      if (!callback) callback = function callback() {};


      _id = this[key](query.id);


      if (query._rev || opts.rev) {
        this.client.remove(_id, query._rev || opts.rev, function (res) {
          if (res && res.error) {
            if (res.message == "missing") callback();else 
            callback(res);} else 
          {
            callback();}});} else 


      {
        this.client.get(_id, function (res, doc) {
          if (doc) {
            _this6.client.remove(_id, doc._rev, function (res) {
              if (res && res.error) {
                if (res.message == "missing") callback();else 
                callback(res);} else 
              {
                callback();}});} else 


          {
            callback();}});}} }, { key: "client", get: function get() {return this.connection.client;} }]);return _class;}(_elisa.Store);exports.default = _class;