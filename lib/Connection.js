//imports
import PouchDB from "pouchdb";
import {Connection} from "elisa";
import Database from "./Database";
import Server from "./Server";

//plugins
PouchDB.plugin(require("pouchdb-find"));

/**
 * A PouchDB connection.
 *
 * @readonly subtype:string     The PouchDB connection type: remote, local or in-memory.
 * @readonly(#) client:PouchDB  The PouchDB client.
 */
export default class extends Connection {
  /**
   * @override
   */
  get server() {
    return new Server(this);
  }

  /**
   * @override
   */
  _open(callback) {
    var name, opts, type, config = this.options;

    //(1) arguments
    if (!callback) callback = function() {};

    //(2) get name and options
    opts = {};

    if (config.hasOwnProperty("protocol") ||
        config.hasOwnProperty("host") ||
        config.hasOwnProperty("port") ||
        config.hasOwnProperty("username")) {  //remote db
      type = "remote";
      config.port = config.port || 5984;
      name = `${(config.protocol || "http")}://${config.host}:${config.port}/${config.db}`;

      if (config.hasOwnProperty("ajax")) opts.ajax = config.ajax;
      if (config.hasOwnProperty("username")) opts.auth = {username: config.username, password: config.password};
      if (config.hasOwnProperty("skipSetup")) opts.skip_setup = config.skipSetup;
    } else if (config.hasOwnProperty("db")) { //local db
      type = "local";
      name = config.location + "/" + config.db;

      if (config.hasOwnProperty("autoCompaction")) opts.auto_compaction = config.aitoCompaction;
      if (config.hasOwnProperty("adapter")) opts.adapter = config.adapter;
      if (config.hasOwnProperty("revsLimit")) opts.revs_limit = config.revsLimit;
    } else {  //in-memory db
      type = "in-memory";
      name = "in-memory";
      opts = {db: require("memdown")};
    }

    //(2) open
    Object.defineProperty(this, "client", {value: new PouchDB(name, opts), configurable: true});
    Object.defineProperty(this, "subtype", {value: type, configurable: true});

    //(3) callback
    callback();
  }

  /**
   * @override
   */
  get opened() {
    return !!this.client;
  }

  /**
   * @override
   */
  _close(callback) {
    if (!callback) callback = function() {};
    delete this.client;
    delete this.subtype;
    callback();
  }

  /**
   * @override
   */
  _connected(callback) {
    if (this.opened) this._ping((error) => callback(undefined, !error));
    else callback(undefined, false);
  }

  /**
   * @override
   */
  get database() {
    return new Database(this, this.options.db || "in-memory");
  }

  /**
   * @override
   */
  _ping(callback) {
    if (this.opened) {
      this.client.info(function(error, res) {
        callback(undefined, !error);
      });
    } else {
      callback(new Error("Connection closed."));
    }
  }
}
