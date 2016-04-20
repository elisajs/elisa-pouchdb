"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _elisaUtil = require("elisa-util");
var _Result = require("./Result");var _Result2 = _interopRequireDefault(_Result);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}


var filter = new _elisaUtil.Filter().filter;
var project = new _elisaUtil.Projector().project;
var sort = new _elisaUtil.Sorter().sort;var 




ViewEngine = function () {function ViewEngine() {_classCallCheck(this, ViewEngine);}_createClass(ViewEngine, [{ key: "hasId", value: function hasId(







    src, id, callback) {
      var cli = src.client;
      var viewId = src.viewId;

      cli.query(viewId, { key: id, limit: 1 }, function (error, res) {
        if (error) callback(error);else 
        callback(undefined, res.rows.length > 0);});} }, { key: "findAll", value: function findAll(










    src, opts, callback) {
      var cli = src.client;
      var viewId = src.viewId;

      cli.query(viewId, {}, function (error, res) {
        if (error) callback(error);else 
        callback(undefined, new _Result2.default(project(res.rows, "value", { top: true })));});} }, { key: "findOne", value: function findOne(












    src, query, ops, opts, callback) {
      var cli = src.client;
      var viewId = src.viewId;
      var pq = {};
      var pending = true;


      if (query.hasOwnProperty("id")) {
        var val = query.id;

        if (["string", "number", "boolean"].indexOf(typeof val === "undefined" ? "undefined" : _typeof(val)) >= 0) {
          pq.key = val;
          pq.limit = 1;
          pending = false;} else 
        {
          var optorNo = Object.keys(value).length;

          if (val.hasOwnProperty("$eq")) {
            pq.key = val;
            if (optorNo == 1) {
              pending = false;
              pq.limit = 1;}} else 

          if (val.hasOwnProperty("$between")) {
            pq.startkey = val.$between[0];
            pq.endkey = val.$between[1];
            if (optorNo == 1) {
              pending = false;
              pq.limit = 1;}} else 

          if (val.hasOwnProperty("$lt")) {
            pq.endkey = val.$lt;
            pq.inclusive_end = false;
            if (optorNo == 1) {
              pending = false;
              pq.limit = 1;}} else 

          if (val.hasOwnProperty("$le") || val.hasOwnProperty("$lte")) {
            pq.endkey = val.$le || val.$lte;
            pq.inclusive_end = true;
            if (optorNo == 1) {
              pending = false;
              pq.limit = 1;}} else 

          if (val.hasOwnProperty("$ge") || val.hasOwnProperty("$gte")) {
            pq.startkey = val.$ge || val.$gte;
            if (optorNo == 1) {
              pending = false;
              pq.limit = 1;}}}}






      cli.query(viewId, pq, function (err, res) {
        var docs = void 0;


        if (err) return callback(err);


        docs = project(res.rows, "value", { top: true });
        if (pending) docs = filter(docs, query);
        if (ops.fields) docs = project(docs, ops.fields);


        callback(undefined, docs.length > 0 ? docs[0] : undefined);});} }, { key: "find", value: function find(












    src, query, ops, opts, callback) {
      var cli = src.client;
      var viewId = src.viewId;
      var pq = {};
      var pending = true;


      if (query && query.hasOwnProperty("id")) {
        var val = query.id;

        if (["string", "number", "boolean"].indexOf(typeof val === "undefined" ? "undefined" : _typeof(val)) >= 0) {
          pq.key = val;
          pending = false;} else 
        {
          var optorNo = Object.keys(value).length;

          if (val.hasOwnProperty("$eq")) {
            pq.key = val;
            if (optorNo == 1) pending = false;} else 
          if (val.hasOwnProperty("$between")) {
            pq.startkey = val.$between[0];
            pq.endkey = val.$between[1];
            if (optorNo == 1) pending = false;} else 
          if (val.hasOwnProperty("$lt")) {
            pq.endkey = val.$lt;
            pq.inclusive_end = false;
            if (optorNo == 1) pending = false;} else 
          if (val.hasOwnProperty("$le") || val.hasOwnProperty("$lte")) {
            pq.endkey = val.$le || val.$lte;
            pq.inclusive_end = true;
            if (optorNo == 1) pending = false;} else 
          if (val.hasOwnProperty("$ge") || val.hasOwnProperty("$gte")) {
            pq.startkey = val.$ge || val.$gte;
            if (optorNo == 1) pending = false;}}}





      cli.query(viewId, pq, function (err, res) {
        var docs = void 0;


        if (err) return callback(err);


        docs = project(res.rows, "value", { top: true });
        if (pending) docs = filter(docs, query);
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



        remove(0);});} }]);return ViewEngine;}();exports.default = ViewEngine;