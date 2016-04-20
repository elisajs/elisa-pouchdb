//imports
import {CollectionQuery, Result} from "elisa";
import {Filter, Projector, Sorter} from "elisa-util";
import ViewEngine from "./ViewEngine";
import DbEngine from "./DbEngine";

//internal members
const runNoIndex = Symbol();
const runUsingIndex = Symbol();

//internal data
const filter = new Filter().filter;
const project = new Projector().project;
const sort = new Sorter().sort;
const viewEngine = new ViewEngine();
const dbEngine = new DbEngine();

/**
 * A PouchDB query.
 */
export default class extends CollectionQuery {
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
    if (this.source.isView()) {
      viewEngine.find(
        this.source,
        this.condition,
        {fields: this.fields, skip: this.skip, maxLimit: this.maxLimit, order: this.order},
        opts,
        callback
      );
    } else {
      dbEngine.find(
        this.source,
        this.condition,
        {fields: this.fields, skip: this.skip, maxLimit: this.maxLimit, order: this.order},
        opts,
        callback
      );
    }
  }

  [runUsingIndex](opts, callback) {
    //TODO
  }
}
