"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _elisa = require("elisa");
var _elisaUtil = require("elisa-util");function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}


var findAll = Symbol();
var runNoIndex = Symbol();
var runUsingIndex = Symbol();


var filter = new _elisaUtil.Filter().filter;
var project = new _elisaUtil.Projector().project;
var sort = new _elisaUtil.Sorter().sort;var _class = function (_CollectionQuery) {_inherits(_class, _CollectionQuery);function _class() {_classCallCheck(this, _class);return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));}_createClass(_class, [{ key: 












    findAll, value: function value(opts, callback) {var _this2 = this;
      var src = this.source;
      var client = src.client;

      if (src.isView()) {
        client.query(src.viewId, {}, function (error, res) {
          if (error) callback(error);else 
          callback(undefined, new _elisa.Result(project(res.rows, "value", { top: true })));});} else 

      {
        client.allDocs(Object.assign({ include_docs: true }, opts), function (error, res) {
          if (error) return callback(error);
          callback(undefined, new _elisa.Result(filter(project(res.rows, "doc", { top: true }), { _id: { $like: "^" + _this2.source.qn + ":" } })));});}} }, { key: "_run", value: function _run(







    opts, callback) {

      if (!opts) opts = {};


      if (opts.index) this[runUsingIndex](opts, callback);else 
      this[runNoIndex](opts, callback);} }, { key: 


    runNoIndex, value: function value(opts, callback) {var _this3 = this;
      this[findAll](opts, function (error, res) {
        var docs = void 0;

        if (error) return callback(error);


        docs = res.docs;
        if (_this3.condition) docs = filter(docs, _this3.condition);
        if (_this3.fields) docs = project(docs, _this3.fields);
        if (_this3.hasOwnProperty("skip")) docs = docs.slice(_this3.skip);
        if (_this3.hasOwnProperty("maxLimit")) docs = docs.slice(0, _this3.maxLimit);
        if (_this3.hasOwnProperty("order")) docs = sort(docs, _this3.order);


        callback(undefined, new _elisa.Result(docs));});} }, { key: 



    runUsingIndex, value: function value(opts, callback) {} }]);return _class;}(_elisa.CollectionQuery);exports.default = _class;