//imports
import {CollectionQuery, Result} from "elisa";
import {Filter, Projector, Sorter} from "elisa-util";

//internal members
const findAll = Symbol();
const runNoIndex = Symbol();
const runUsingIndex = Symbol();

//internal data
const filter = new Filter().filter;
const project = new Projector().project;
const sort = new Sorter().sort;

/**
 * A PouchDB query.
 */
export default class extends CollectionQuery {
  /**
   * Return all the documents of the collection.
   *
   * @private
   * @param opts:object       The run options.
   * @param callback:function The function to call: fn(error, resul).
   */
  [findAll](opts, callback) {
    this.source.client.allDocs(Object.assign({include_docs: true}, opts), (error, res) => {
      if (error) return callback(error);
      callback(undefined, new Result(filter(project(res.rows, "doc", {top: true}), {_id: {$like: `^${this.source.qn}:`}})));
    });
  }

  /**
   * @override
   */
  _run(opts, callback) {
    //(1) arguments
    if (!opts) opts = {};

    //(2) run
    if (opts.index) this[runUsingIndex](opts, callback);
    else this[runNoIndex](opts, callback);
  }

  [runNoIndex](opts, callback) {
    this[findAll](opts, (error, res) => {
      let docs;

      if (error) return callback(error);

      //(1) find
      docs = res.docs;
      if (this.condition) docs = filter(docs, this.condition);
      if (this.fields) docs = project(docs, this.fields);
      if (this.hasOwnProperty("skip")) docs = docs.slice(this.skip);
      if (this.hasOwnProperty("maxLimit")) docs = docs.slice(0, this.maxLimit);
      if (this.hasOwnProperty("order")) docs = sort(docs, this.order);

      //(2) return
      callback(undefined, new Result(docs));
    });
  }

  [runUsingIndex](opts, callback) {
    //TODO
  }
}
