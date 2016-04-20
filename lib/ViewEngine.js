//imports
import {Filter, Projector, Sorter} from "elisa-util";
import Result from "./Result";

//internal data
const filter = new Filter().filter;
const project = new Projector().project;
const sort = new Sorter().sort;

/**
 * A query engine to use with views.
 */
export default class ViewEngine {
  /**
   * Check whether the view has an id.
   *
   * @param src:DataStore     The source data store.
   * @param id:object         The id value to check.
   * @param callback:function The function to call: fn(error, exists).
   */
  hasId(src, id, callback) {
    const cli = src.client;
    const viewId = src.viewId;

    cli.query(viewId, {key: id, limit: 1}, (error, res) => {
      if (error) callback(error);
      else callback(undefined, res.rows.length > 0);
    });
  }

  /**
   * Return all the documents of a view.
   *
   * @param src:DataStore     The source data store.
   * @param opts:object       The find options.
   * @param callback:function The function to call: fn(error, result).
   */
  findAll(src, opts, callback) {
    const cli = src.client;
    const viewId = src.viewId;

    cli.query(viewId, {}, (error, res) => {
      if (error) callback(error);
      else callback(undefined, new Result(project(res.rows, "value", {top: true})));
    });
  }

  /**
   * Return one document of a view.
   *
   * @param src:DataStore     The source data store.
   * @param query:object      The query document.
   * @param ops:object        The additional operations to run: fields, skip, maxLimit, order.
   * @param opts:object       The find options.
   * @param callback:function The function to call: function(error, doc).
   */
  findOne(src, query, ops, opts, callback) {
    const cli = src.client;
    const viewId = src.viewId;
    const pq = {};
    var pending = true;

    //(1) get PouchDB query
    if (query.hasOwnProperty("id")) {
      let val = query.id;

      if (["string", "number", "boolean"].indexOf(typeof(val)) >= 0) {
        pq.key = val;
        pq.limit = 1;
        pending = false;
      } else {
        let optorNo = Object.keys(value).length;

        if (val.hasOwnProperty("$eq")) {
          pq.key = val;
          if (optorNo == 1) {
            pending = false;
            pq.limit = 1;
          }
        } else if (val.hasOwnProperty("$between")) {
          pq.startkey = val.$between[0];
          pq.endkey = val.$between[1];
          if (optorNo == 1) {
            pending = false;
            pq.limit = 1;
          }
        } else if (val.hasOwnProperty("$lt")) {
          pq.endkey = val.$lt;
          pq.inclusive_end = false;
          if (optorNo == 1) {
            pending = false;
            pq.limit = 1;
          }
        } else if (val.hasOwnProperty("$le") || val.hasOwnProperty("$lte")) {
          pq.endkey = val.$le || val.$lte;
          pq.inclusive_end = true;
          if (optorNo == 1) {
            pending = false;
            pq.limit = 1;
          }
        } else if (val.hasOwnProperty("$ge") || val.hasOwnProperty("$gte")) {
          pq.startkey = val.$ge || val.$gte;
          if (optorNo == 1) {
            pending = false;
            pq.limit = 1;
          }
        }
      }
    }

    //(2) return
    cli.query(viewId, pq, (err, res) => {
      let docs;

      //(1) pre
      if (err) return callback(err);

      //(2) filter and project
      docs = project(res.rows, "value", {top: true});
      if (pending) docs = filter(docs, query);
      if (ops.fields) docs = project(docs, ops.fields);

      //(3) return
      callback(undefined, docs.length > 0 ? docs[0] : undefined);
    });
  }

  /**
   * Return several documents of a view.
   *
   * @param src:DataStore     The source data store.
   * @param query:object      The query document.
   * @param ops:object        The additional operations to run: fields, skip, maxLimit, order.
   * @param opts:object       The find options.
   * @param callback:function The function to call: function(error, doc).
   */
  find(src, query, ops, opts, callback) {
    const cli = src.client;
    const viewId = src.viewId;
    const pq = {};
    var pending = true;

    //(1) get PouchDB query
    if (query && query.hasOwnProperty("id")) {
      let val = query.id;

      if (["string", "number", "boolean"].indexOf(typeof(val)) >= 0) {
        pq.key = val;
        pending = false;
      } else {
        let optorNo = Object.keys(value).length;

        if (val.hasOwnProperty("$eq")) {
          pq.key = val;
          if (optorNo == 1) pending = false;
        } else if (val.hasOwnProperty("$between")) {
          pq.startkey = val.$between[0];
          pq.endkey = val.$between[1];
          if (optorNo == 1) pending = false;
        } else if (val.hasOwnProperty("$lt")) {
          pq.endkey = val.$lt;
          pq.inclusive_end = false;
          if (optorNo == 1) pending = false;
        } else if (val.hasOwnProperty("$le") || val.hasOwnProperty("$lte")) {
          pq.endkey = val.$le || val.$lte;
          pq.inclusive_end = true;
          if (optorNo == 1) pending = false;
        } else if (val.hasOwnProperty("$ge") || val.hasOwnProperty("$gte")) {
          pq.startkey = val.$ge || val.$gte;
          if (optorNo == 1) pending = false;
        }
      }
    }

    //(2) return
    cli.query(viewId, pq, (err, res) => {
      let docs;

      //(1) pre
      if (err) return callback(err);

      //(2) filter, project, skip...
      docs = project(res.rows, "value", {top: true});
      if (pending) docs = filter(docs, query);
      if (ops.fields) docs = project(docs, ops.fields);
      if (ops.skip) docs = docs.slice(ops.skip);
      if (ops.maxLimit) docs = docs.slice(0, ops.maxLimit);
      if (ops.order) docs = sort(docs, ops.order);

      //(3) return
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
}
