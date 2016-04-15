"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _elisa = require("elisa");
var _Connection = require("./Connection");var _Connection2 = _interopRequireDefault(_Connection);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var 




PouchDBDriver = function (_Driver) {_inherits(PouchDBDriver, _Driver);





  function PouchDBDriver() {_classCallCheck(this, PouchDBDriver);return _possibleConstructorReturn(this, Object.getPrototypeOf(PouchDBDriver).call(this, 
    "PouchDB", ["Pouch"]));}_createClass(PouchDBDriver, [{ key: "_createConnection", value: function _createConnection(





    eliOpts, opts) {
      return new _Connection2.default(this, eliOpts, opts);} }]);return PouchDBDriver;}(_elisa.Driver);exports.default = PouchDBDriver;



_elisa.Driver.register(new PouchDBDriver());