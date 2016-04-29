"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _pouchdb = require("pouchdb");var _pouchdb2 = _interopRequireDefault(_pouchdb);
var _elisaUtil = require("elisa-util");
var _Result = require("./Result");var _Result2 = _interopRequireDefault(_Result);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}


var filter = new _elisaUtil.Filter().filter;
var project = new _elisaUtil.Projector().project;
var sort = new _elisaUtil.Sorter().sort;


var insertDocWithId = Symbol();
var insertDocWithoutId = Symbol();var 




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


      opts = Object.assign({ include_docs: true }, opts);
      opts.startkey = src.prefix;
      opts.endkey = src.prefix + "￿";


      cli.allDocs(opts, function (error, res) {
        if (error) callback(error);else 
        callback(undefined, new _Result2.default(project(res.rows, "doc", { top: true })));});} }, { key: "findOne", value: function findOne(












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



        remove(0);});} }, { key: "insert", value: function insert(











    src, doc, opts, callback) {
      if (doc.hasOwnProperty("id")) this[insertDocWithId](src, doc, opts, callback);else 
      this[insertDocWithoutId](src, doc, opts, callback);} }, { key: 


    insertDocWithId, value: function value(src, doc, opts, callback) {
      var cli = src.client;

      this.hasId(src, doc.id, function (error, exists) {
        if (error) return callback(error);
        if (exists) return callback(new Error("Id already exists."));

        cli.put(doc, src.key(doc.id), opts, function (res) {
          if (res && res.error) callback(res);else 
          callback();});});} }, { key: 




    insertDocWithoutId, value: function value(src, doc, opts, callback) {
      var cli = src.client;

      if (src.id == "uuid") {
        doc.id = _pouchdb2.default.utils.uuid();

        cli.put(doc, src.key(doc.id), opts, function (res) {
          if (res && res.error) callback(res);else 
          callback();});} else 

      if (src.id == "sequence") {
        src.nextSequenceValue(function (error, value) {
          if (error) return callback(error);
          doc.id = value;
          cli.put(doc, src.key(doc.id), opts, function (res) {
            if (res && res.error) callback(res);else 
            callback();});});}} }]);return DbEngine;}();exports.default = DbEngine;