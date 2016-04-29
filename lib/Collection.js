//imports
import {Collection} from "elisa";
import {Checker, Updater} from "elisa-util";
import CollectionQuery from "./CollectionQuery";
import ViewEngine from "./ViewEngine";
import DbEngine from "./DbEngine";

//internal data
const check = new Checker().check;
const update = new Updater().update;
const viewEngine = new ViewEngine();
const dbEngine = new DbEngine();

//private members
const insertDocs = Symbol();
const insertDoc = Symbol();

/**
 * A PouchDB collection.
 *
 * @readonly prefix:string    The prefix to the ids.
 * @readonly view:string      The view name.
 * @readonly sequence:string  The sequence id to the collection sequence.
 */
export default class extends Collection {
  /**
   * Constructor.
   *
   * @param(attr) schema
   * @param(attr) name
   * @param opts:object   The collection options: prefix (string), view (boolean or string),
   *                      id (string: uuid or sequence), sequence (string, the sequence name to use
   *                      if id == "sequence").
   */
  constructor(schema, name, opts) {
    super(schema, name, opts);

    if (!opts) opts = {};
    Object.defineProperty(this, "prefix", {value: opts.prefix || this.qn + ":"});
    Object.defineProperty(this, "view", {value: (opts.view === true ? name : opts.view)});
    Object.defineProperty(this, "id", {value: opts.id || "uuid"});
    Object.defineProperty(this, "sequence", {value: opts.sequence || this.qn + ".__sequence_"});
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
  query() {
    return new CollectionQuery(this);
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
  _findAll(opts, callback) {
    if (this.isView()) viewEngine.findAll(this, opts, callback);
    else dbEngine.findAll(this, opts, callback);
  }

  /**
   * Return the next id to use with the inserts without id.
   *
   * @private
   * @param callback:function The function to call: fn(error, value).
   */
  nextSequenceValue(callback) {
    this.client.get(this.sequence, (res, seq) => {
      //(1) get current value
      if (res) {
        if (res.error && res.reason == "missing") {
          seq = {
            value: 0,
            _id: this.sequence
          };
        } else {
          return callback(res);
        }
      }

      //(2) inc
      seq.value += 1;
      this.client.put(seq, (res) => {
        if (res) callback(res);
        else callback(undefined, seq.value);
      });
    });
  }

  /**
   * @override
   */
  _insert(docs, opts, callback) {
    if (docs instanceof Array) this[insertDocs](docs, opts, callback);
    else this[insertDoc](docs, opts, callback);
  }

  [insertDoc](doc, opts, callback) {
    dbEngine.insert(this, doc, opts, callback);
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
  _update(query, upd, opts, callback) {
    this.q().filter(query)._run({}, (error, res) => {
      const modify = (i) => {
        if (i < res.length) {
          let doc = res.docs[i];

          if (check(doc, query)) {
            update(doc, upd);

            this.client.put(doc, function(res) {
              if (res && res.error) callback(res);
              else modify(i+1);
            });
          } else {
            modify(i+1);
          }
        } else {
          callback();
        }
      };

      modify(0);
    });
  }

  /**
   * @override
   */
  _remove(query, opts, callback) {
    this.q().filter(query)._run({}, (error, res) => {
      const remove = (i) => {
        if (i < res.length) {
          this.client.remove(res.docs[i], opts, (error) => {
            if (error) callback(error);
            else remove(i+1);
          });
        } else {
          callback();
        }
      };

      if (error) callback(error);
      else remove(0);
    });
  }

  /**
   * @override
   */
  _truncate(opts, callback) {
    if (this.isView()) viewEngine.truncate(this, opts, callback);
    else dbEngine.truncate(this, opts, callback);
  }
}
