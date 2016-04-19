//imports
import {Database} from "elisa";
import Schema from "./Schema";

/**
 * A PouchDB database.
 */
export default class extends Database {
  /**
   * Constructor.
   *
   * @protected
   * @param(attr) connection
   * @param(attr) name
   */
  constructor(connection, name) {
    super(connection, name);
  }

  /**
   * The PouchDB client.
   *
   * @private
   * @type PouchDB
   */
  get client() {
    return this.connection.client;
  }

  /**
   * @override
   */
  getSchema(name, opts) {
    return new Schema(this, name, opts);
  }

  /**
   * @override
   */
  readSchema(name, ...rest) {
    var opts, callback;

    //(1) arguments
    if (rest.length == 1) callback = rest[0];
    else if (rest.length >= 2) [opts, callback] = rest;

    //(2) read
    callback(undefined, new Schema(this, name, opts));
  }
}
