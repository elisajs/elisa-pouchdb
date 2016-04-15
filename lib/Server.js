//imports
import {Server} from "elisa";

/**
 * A DB instance.
 */
export default class extends Server {
  /**
   * Constructor.
   *
   * @param(attr) connection
   * @param opts:object The server options: host, port, version.
   */
  constructor(connection) {
    super(connection);

    Object.defineProperty(this, "host", {value: (connection.subtype == "remote" ? connection.options.host : "localhost"), enumerable: true});
    Object.defineProperty(this, "port", {value: (connection.subtype == "remote" ? connection.options.port : undefined), enumerable: true});
    Object.defineProperty(this, "version", {value: undefined, enumerable: true});
  }
}
