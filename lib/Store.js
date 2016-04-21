//imports
import {Store} from "elisa";
import {Updater, Filter, Projector} from "elisa-util";
import Result from "./Result";
import ViewEngine from "./ViewEngine";
import DbEngine from "./DbEngine";

//private members
const insertDoc = Symbol();
const insertDocs = Symbol();

//internal data
const update = new Updater().update;
const filter = new Filter().filter;
const project = new Projector().project;
const viewEngine = new ViewEngine();
const dbEngine = new DbEngine();

/**
 * A PouchDB store.
 *
 * @readonly view:string  The view name.
 */
export default class extends Store {
  /**
   * Constructor.
   *
   * @param(attr) schema
   * @param(attr) name
   * @param opts:object The store options: prefix (string), view (boolean or string).
   */
  constructor(schema, name, opts) {
    super(schema, name, opts);

    if (!opts) opts = {};
    Object.defineProperty(this, "prefix", {value: opts.prefix || (this.qn + ":")});
    Object.defineProperty(this, "view", {value: (opts.view === true ? name : opts.view)});
  }

  /**
   * Is it a view?
   *
   * @return boolean
   */
  isView() {
    return !!this.view;
  }

  /**
   * The view id.
   *
   * @type string
   */
  get viewId() {
    return this.isView() ? `${this.schema.design}/${this.view}` : undefined;
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
   * Returns the key.
   */
  key(id) {
    return this.prefix + id;
  }

  /**
   * @override
   */
  _hasId(id, callback) {
    if (this.isView()) viewEngine.hasId(this, id, callback);
    else dbEngine.hasId(this, id, callback);
  }

  /**
   * @override
   */
  _count(opts, callback) {
    this._findAll(opts, (error, res) => {
      if (error) callback(error);
      else callback(undefined, res.length);
    });
  }

  /**
   * @override
   */
  _findOne(query, opts, callback) {
    if (this.isView()) viewEngine.findOne(this, query, {}, opts, callback);
    else dbEngine.findOne(this, query, {}, opts, callback);
  }

  /**
   * @override
   */
  _findAll(opts, callback) {
    if (this.isView()) viewEngine.findAll(this, opts, callback);
    else dbEngine.findAll(this, opts, callback);
  }

  /**
   * @override
   */
  _insert(docs, opts, callback) {
    if (docs instanceof Array) this[insertDocs](docs, opts, callback);
    else this[insertDoc](docs, opts, callback);
  }

  [insertDoc](doc, opts, callback) {
    const cli = this.client;
    var _id;

    //(1) determine _id
    _id = this.key(doc.id);

    //(2) put
    cli.put(doc, _id, opts, (res) => {
      if (res && res.error) {
        if (res.name == "conflict" && res.message == "Document update conflict") {
          //get _rev and update with _id and _rev
          cli.get(_id, (err, cur) => {             //get _rev
            cli.put(doc, _id, cur._rev, (res) => { //update
              if (res && res.error) callback(res);
              else callback();
            });
          });
        } else {
          callback(res);
        }
      } else {
        callback();
      }
    });
  }

  [insertDocs](docs, opts, callback) {
    const insert = (i) => {
      if (i < docs.length) {
        this[insertDoc](docs[i], opts, (error) => {
          if (error) callback(error);
          else insert(i+1);
        });
      } else {
        callback();
      }
    };

    insert(0);
  }

  /**
   * @override
   */
  _update(query, updt, opts, callback) {
    //(1) arguments
    if (!opts) opts = {};
    if (!callback) callback = function() {};

    //(2) update
    this._findOne({id: query.id}, {}, (error, doc) => {
      if (doc) {
        update(doc, updt);
        this._insert(doc, opts, (error) => {
          if (error) callback(error);
          else callback();
        });
      } else {
        callback();
      }
    });
  }

  /**
   * @override
   */
  _remove(query, opts, callback) {
    const client = this.client;
    var _id;

    //(1) arguments
    if (!opts) opts = {};
    if (!callback) callback = function() {};

    //(2) determine _id
    _id = this.key(query.id);

    //(3) remove
    if (query._rev || opts.rev) {
      client.remove(_id, query._rev || opts.rev, (res) => {
        if (res && res.error) {
          if (res.message == "missing") callback();
          else callback(res);
        } else {
          callback();
        }
      });
    } else {
      client.get(_id, (res, doc) => {
        if (doc) {
          client.remove(_id, doc._rev, (res) => {
            if (res && res.error) {
              if (res.message == "missing") callback();
              else callback(res);
            } else {
              callback();
            }
          });
        } else {
          callback();
        }
      });
    }
  }

  /**
   * @override
   */
  _truncate(opts, callback) {
    if (this.isView()) viewEngine.truncate(this, opts, callback);
    else dbEngine.truncate(this, opts, callback);
  }
}
