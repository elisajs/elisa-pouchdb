"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _elisaUtil = require("elisa-util");
var _Result = require("./Result");var _Result2 = _interopRequireDefault(_Result);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}


var filter = new _elisaUtil.Filter().filter;
var project = new _elisaUtil.Projector().project;
var sort = new _elisaUtil.Sorter().sort;var 




DbEngine = function () {function DbEngine() {_classCallCheck(this, DbEngine);}_createClass(DbEngine, [{ key: "hasId", value: function hasId(







    src, id, callback) {
      var cli = src.client;

      cli.get(src.key(id), function (res, doc) {
        if (res) {
          if (res.error && ["missing", "deleted"].indexOf(res.reason) < 0) callback(err);else 
          callback(undefined, false);} else 
        {
          callback(undefined, !!doc);}});} }, { key: "findAll", value: function findAll(










    src, opts, callback) {
      var cli = src.client;

      cli.allDocs(Object.assign({ include_docs: true }, opts), function (error, docs) {
        if (error) callback(error);else 
        callback(undefined, new _Result2.default(filter(project(docs.rows, "doc", { top: true }), { _id: { $like: "^" + src.qn + ":" } })));});} }, { key: "findOne", value: function findOne(












    src, query, ops, opts, callback) {
      var cli = src.client;

      cli.get(src.key(query.id), opts, function (err, doc) {
        if (err && err.message != "missing") return callback(err);

        if (ops.fields) doc = project(doc, ops.fields);
        callback(undefined, doc);});} }, { key: "find", value: function find(












    src, query, ops, opts, callback) {
      this.findAll(src, opts, function (error, res) {

        if (error) return callback(error);


        var docs = res.docs;

        docs = filter(docs, query);
        if (ops.fields) docs = project(docs, ops.fields);
        if (ops.skip) docs = docs.slice(ops.skip);
        if (ops.maxLimit) docs = docs.slice(0, ops.maxLimit);
        if (ops.order) docs = sort(docs, ops.order);

        callback(undefined, new _Result2.default(docs));});} }, { key: "truncate", value: function truncate(










    src, opts, callback) {
      var cli = src.client;


      this.findAll(src, {}, function (error, res) {
        var remove = function remove(i) {
          if (i < res.length) {
            var doc = res.docs[i];

            cli.remove(doc._id, doc._rev, opts, function (error) {
              if (error) callback(error);else 
              remove(i + 1);});} else 

          {
            callback();}};



        remove(0);});} }]);return DbEngine;}();exports.default = DbEngine;