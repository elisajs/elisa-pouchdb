"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _elisa = require("elisa");
var _Store = require("./Store");var _Store2 = _interopRequireDefault(_Store);
var _Collection = require("./Collection");var _Collection2 = _interopRequireDefault(_Collection);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _class = function (_Schema) {_inherits(_class, _Schema);












  function _class(database, name) {_classCallCheck(this, _class);return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, 
    database, name));}_createClass(_class, [{ key: "getStore", value: function getStore(


















    name, opts) {
      return new _Store2.default(this, name, opts);} }, { key: "readStore", value: function readStore() 





    {
      var name, opts, callback;for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}


      if (args.length == 2) {;name = args[0];callback = args[1];} else 
      if (args.length >= 3) {;name = args[0];opts = args[1];callback = args[2];}


      callback(undefined, new _Store2.default(this, name, opts));} }, { key: "getCollection", value: function getCollection(








    name, opts) {
      return new _Collection2.default(this, name, opts);} }, { key: "readCollection", value: function readCollection() 





    {
      var name, opts, callback;for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {args[_key2] = arguments[_key2];}


      if (args.length == 2) {;name = args[0];callback = args[1];} else 
      if (args.length >= 3) {;name = args[0];opts = args[1];callback = args[2];}


      callback(undefined, new _Collection2.default(this, name, opts));} }, { key: "client", get: function get() {return this.connection.client;} }]);return _class;}(_elisa.Schema);exports.default = _class;