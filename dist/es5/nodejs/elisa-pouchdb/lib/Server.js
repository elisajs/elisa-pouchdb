"use strict";Object.defineProperty(exports, "__esModule", { value: true });
var _elisa = require("elisa");function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _class = function (_Server) {_inherits(_class, _Server);











  function _class(connection) {_classCallCheck(this, _class);var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, 
    connection));

    Object.defineProperty(_this, "host", { value: connection.subtype == "remote" ? connection.options.host : "localhost", enumerable: true });
    Object.defineProperty(_this, "port", { value: connection.subtype == "remote" ? connection.options.port : undefined, enumerable: true });
    Object.defineProperty(_this, "version", { value: undefined, enumerable: true });return _this;}return _class;}(_elisa.Server);exports.default = _class;