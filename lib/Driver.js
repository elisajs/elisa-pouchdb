//imports
import {Driver} from "elisa";
import Connection from "./Connection";

/**
 * The PouchDB Elisa driver.
 */
export default class PouchDBDriver extends Driver {
  /**
   * Constructor.
   *
   * @private
   */
  constructor() {
    super("PouchDB", ["Pouch"]);
  }

  /**
   * @override
   */
  _createConnection(eliOpts, opts) {
    return new Connection(this, eliOpts, opts);
  }
}

Driver.register(new PouchDBDriver());
