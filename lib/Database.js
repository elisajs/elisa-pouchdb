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
  getSchema(name) {
    return new Schema(this, name);
  }

  /**
   * @override
   */
  readSchema(name, callback) {
    callback(undefined, new Schema(this, name));
  }
}
