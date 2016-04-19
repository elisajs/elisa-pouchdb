//imports
import {Store} from "elisa";
import {Updater, Filter, Projector} from "elisa-util";
import Result from "./Result";

//private members
const key = Symbol();
const insertDoc = Symbol();
const insertDocs = Symbol();

//internal data
const update = new Updater().update;
const filter = new Filter().filter;
const project = new Projector().project;

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
    //(1) arguments
    if (!opts) opts = {};

    //(2) init
    super(schema, name);
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
  [key](id) {
    return this.prefix + id;
  }

  /**
   * @override
   */
  _hasId(id, callback) {
    const client = this.client;

    //(1) check
    if (this.isView()) {
      client.query(this.viewId, {key: id}, (error, res) => {
        callback(undefined, res.rows.length == 1);
      });
    } else {
      client.get(this[key](id), (res, doc) => {
        if (res) {
          if (res.error && res.reason == "missing") callback(undefined, false);
          else callback(err);
        } else {
          callback(undefined, true);
        }
      });
    }
  }

  /**
   * @override
   */
  _find(query, opts, callback) {
    const client = this.client;

    //(1) arguments
    if (!opts) opts = {};
    if (!query.id) throw new Error("Id field expected.");

    //(2) query
    if (this.isView()) {
      client.query(this.viewId, {key: query.id}, (err, res) => {
        if (err) callback(err);
        else callback(undefined, res.rows.length > 0 ? res.rows[0].value : undefined);
      });
    } else {
      client.get(this[key](query.id), opts, (err, doc) => {
        if (err && err.message != "missing") callback(err);
        else callback(undefined, doc);
      });
    }
  }

  /**
   * @override
   */
  _findOne(query, opts, callback) {
    this._find(query, opts, callback);
  }

  /**
   * @override
   */
  _findAll(opts, callback) {
    const client = this.client;

    //(1) arguments
    if (!opts) opts = {};

    //(2) query
    if (this.isView()) {
      client.query(this.viewId, {}, (error, res) => {
        if (error) callback(error);
        else callback(undefined, new Result(project(res.rows, "value", {top: true})));
      });
    } else {
      client.allDocs(Object.assign({include_docs: true}, opts), (error, docs) => {
        if (error) callback(error);
        else callback(undefined, new Result(filter(project(docs.rows, "doc", {top: true}), {_id: {$like: `^${this.qn}:`}})));
      });
    }
  }

  /**
   * @override
   */
  _insert(docs, opts, callback) {
    //(1) arguments
    if (!opts) opts = {};
    if (!callback) callback = function() {};

    //(2) insert
    if (docs instanceof Array) this[insertDocs](docs, opts, callback);
    else this[insertDoc](docs, opts, callback);
  }

  [insertDoc](doc, opts, callback) {
    const client = this.client;
    var _id;

    //(1) determine _id
    _id = this[key](doc.id);

    //(2) put
    client.put(doc, _id, opts, (res) => {
      if (res && res.error) {
        if (res.name == "conflict" && res.message == "Document update conflict") {
          //get _rev and update with _id and _rev
          client.get(_id, (err, cur) => {             //get _rev
            client.put(doc, _id, cur._rev, (res) => { //update
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
    this._find({id: query.id}, {}, (error, doc) => {
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
    _id = this[key](query.id);

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
}
