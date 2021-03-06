//imports
import {Schema} from "elisa";
import Store from "./Store";
import Collection from "./Collection";

/**
 * A PouchDB schema.
 * This object really doesn¡t exist in PouchDB.
 *
 * @readonly design:string  The design document name.
 */
export default class extends Schema {
  /**
   * Constructor.
   *
   * @param(attr) database
   * @param(attr) name
   * @param opts:object The schema options: design (string), the design document name.
   */
  constructor(database, name, opts) {
    //(1) arguments
    if (!opts) opts = {};

    //(2) init
    super(database, name, opts);
    Object.defineProperty(this, "design", {value: opts.design || name});
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
   * Return a store object.
   *
   * @param name:string   The store name.
   * @param opts?:object  The store options: prefix (string), the key prefix.
   */
  getStore(name, opts) {
    return new Store(this, name, opts);
  }

  /**
   * @override
   */
  readStore(...args) {
    var name, opts, callback;

    //(1) arguments
    if (args.length == 2) [name, callback] = args;
    else if (args.length >= 3) [name, opts, callback] = args;

    //(2) read
    callback(undefined, new Store(this, name, opts));
  }

  /**
   * Return a collection object.
   *
   * @param name:string   The collection name.
   * @param opts?:object  The collection options: prefix (string), the key prefix.
   */
  getCollection(name, opts) {
    return new Collection(this, name, opts);
  }

  /**
   * @override
   */
  readCollection(...args) {
    var name, opts, callback;

    //(1) arguments
    if (args.length == 2) [name, callback] = args;
    else if (args.length >= 3) [name, opts, callback] = args;

    //(2) read
    callback(undefined, new Collection(this, name, opts));
  }
}
