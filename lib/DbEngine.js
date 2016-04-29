//imports
import PouchDB from "pouchdb";
import {Filter, Projector, Sorter} from "elisa-util";
import Result from "./Result";

//internal data
const filter = new Filter().filter;
const project = new Projector().project;
const sort = new Sorter().sort;

//private members
const insertDocWithId = Symbol();
const insertDocWithoutId = Symbol();

/**
 * A query engine to use with views.
 */
export default class DbEngine {
  /**
   * Check whether a data store has an id.
   *
   * @param src:DataStore     The source data store..
   * @param id:object         The id value to check.
   * @param callback:function The function to call: fn(error, exists).
   */
  hasId(src, id, callback) {
    const cli = src.client;

    cli.get(src.key(id), (res, doc) => {
      if (res) {
        if (res.error && (["missing", "deleted"].indexOf(res.reason) < 0)) callback(err);
        else callback(undefined, false);
      } else {
        callback(undefined, !!doc);
      }
    });
  }

  /**
   * Return all the documents of a data store.
   *
   * @param src:DataStore     The source  data store.
   * @param callback:function The function to call: fn(error, result).
   */
  findAll(src, opts, callback) {
    const cli = src.client;

    //(1) determine options
    opts = Object.assign({include_docs: true}, opts);
    opts.startkey = src.prefix;
    opts.endkey = src.prefix + "\uffff";

    //(2) query
    cli.allDocs(opts, (error, res) => {
      if (error) callback(error);
      else callback(undefined, new Result(project(res.rows, "doc", {top: true})));
    });
  }

  /**
   * Return one document of data store.
   *
   * @param src:DataStore     The source data store.
   * @param query:object      The query document.
   * @param ops:object        The additional operations to run: fields.
   * @param opts:object       The find options.
   * @param callback:function The function to call: function(error, doc).
   */
  findOne(src, query, ops, opts, callback) {
    const cli = src.client;

    cli.get(src.key(query.id), opts, (err, doc) => {
      if (err && err.message != "missing") return callback(err);

      if (ops.fields) doc = project(doc, ops.fields);
      callback(undefined, doc);
    });
  }

  /**
   * Return several documents of a view.
   *
   * @param src:DataStore     The source data store.
   * @param query:object      The query document.
   * @param ops:object        The additional operations to run: fields, skip, maxLimit, order.
   * @param opts:object       The find options.
   * @param callback:function The function to call: function(error, res).
   */
  find(src, query, ops, opts, callback) {
    this.findAll(src, opts, (error, res) => {
      //(1) pre
      if (error) return callback(error);

      //(2) filter, project...
      var docs = res.docs;

      docs = filter(docs, query);
      if (ops.fields) docs = project(docs, ops.fields);
      if (ops.skip) docs = docs.slice(ops.skip);
      if (ops.maxLimit) docs = docs.slice(0, ops.maxLimit);
      if (ops.order) docs = sort(docs, ops.order);

      callback(undefined, new Result(docs));
    });
  }

  /**
   * Empty a data store.
   *
   * @param src:DataStore     The source data store.
   * @param opts:object       The truncate options.
   * @param callback:function The function to call: fn(error).
   */
  truncate(src, opts, callback) {
    const cli = src.client;

    //find and remove
    this.findAll(src, {}, (error, res) => {
      const remove = (i) => {
        if (i < res.length) {
          let doc = res.docs[i];

          cli.remove(doc._id, doc._rev, opts, (error) => {
            if (error) callback(error);
            else remove(i+1);
          });
        } else {
          callback();
        }
      };

      remove(0);
    });
  }

  /**
   * Insert a document into the database.
   *
   * @param src:DataStore     The source data store.
   * @param doc:object        The document to insert.
   * @param opts:object       The insert options.
   * @param callback:function The function to call: function(error).
   */
  insert(src, doc, opts, callback) {
    if (doc.hasOwnProperty("id")) this[insertDocWithId](src, doc, opts, callback);
    else this[insertDocWithoutId](src, doc, opts, callback);
  }

  [insertDocWithId](src, doc, opts, callback) {
    const cli = src.client;

    this.hasId(src, doc.id, (error, exists) => {
      if (error) return callback(error);
      if (exists) return callback(new Error("Id already exists."));

      cli.put(doc, src.key(doc.id), opts, (res) => {
        if (res && res.error) callback(res);
        else callback();
      });
    });
  }

  [insertDocWithoutId](src, doc, opts, callback) {
    const cli = src.client;

    if (src.id == "uuid") {
      doc.id = PouchDB.utils.uuid();

      cli.put(doc, src.key(doc.id), opts, (res) => {
        if (res && res.error) callback(res);
        else callback();
      });
    } else if (src.id == "sequence") {
      src.nextSequenceValue((error, value) => {
        if (error) return callback(error);
        doc.id = value;
        cli.put(doc, src.key(doc.id), opts, (res) => {
          if (res && res.error) callback(res);
          else callback();
        });
      });
    }
  }
}
