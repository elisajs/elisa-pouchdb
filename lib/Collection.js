//imports
import {Collection} from "elisa";
import {Checker, Updater} from "elisa-util";
import CollectionQuery from "./CollectionQuery";

//internal data
const check = new Checker().check;
const update = new Updater().update;

//private members
const key = Symbol();
const insertDocs = Symbol();
const insertDoc = Symbol();
const insertDocWithId = Symbol();
const insertDocWithoutId = Symbol();

/**
 * A PouchDB collection.
 *
 * @readonly prefix:string    The prefix to the ids.
 * @readonly sequence:string  The sequence id to the collection sequence.
 */
export default class extends Collection {
  /**
   * Constructor.
   *
   * @param(attr) schema
   * @param(attr) name
   * @param opts:object   The collection options: prefix (string), sequence (string).
   */
  constructor(schema, name, opts) {
    //(1) arguments
    if (!opts) opts = {};

    //(2) init
    super(schema, name);
    Object.defineProperty(this, "prefix", {value: opts.prefix || this.qn + ":"});
    Object.defineProperty(this, "sequence", {value: opts.sequence || this.qn + ".__sequence_"});
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
  query() {
    return new CollectionQuery(this);
  }

  /**
   * @override
   */
  _hasId(id, callback) {
    var _id;

    //(1) determine the real id
    _id = this[key](id);

    //(2) check
    this.client.get(_id, (res, doc) => {
      if (res) {
        if (res.error && res.reason == "missing") callback(undefined, false);
        else callback(err);
      } else {
        callback(undefined, true);
      }
    });
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
    //(1) arguments
    if (!opts) opts = {};
    if (!callback) callback = function() {};

    //(2) insert
    if (docs instanceof Array) this[insertDocs](docs, opts, callback);
    else this[insertDoc](docs, opts, callback);
  }

  [insertDoc](doc, opts, callback) {
    if (doc.hasOwnProperty("id")) this[insertDocWithId](doc, opts, callback);
    else this[insertDocWithoutId](doc, opts, callback);
  }

  [insertDocWithId](doc, opts, callback) {
    this._hasId(doc.id, (error, exists) => {
      if (error) return callback(error);
      if (exists) return callback(new Error("Id already exists."));

      this.client.put(doc, this[key](doc.id), opts, (res) => {
        if (res && res.error) callback(res);
        else callback();
      });
    });
  }

  [insertDocWithoutId](doc, opts, callback) {
    this.nextSequenceValue((error, value) => {
      if (error) return callback(error);
      doc.id = value;
      this.client.put(doc, this[key](doc.id), opts, (res) => {
        if (res && res.error) callback(res);
        else callback();
      });
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
  _update(query, upd, opts, callback) {
    //(1) arguments
    if (!opts) opts = {};
    if (!callback) callback = function() {};

    //(2) update
    this._find(query, {}, (error, res) => {
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
    //(1) arguments
    if (!query) throw new Error("Query expected.");
    if (!opts) opts = {};
    if (!callback) callback = function() {};

    //(2) remove
    this._find(query, {}, (error, res) => {
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
}