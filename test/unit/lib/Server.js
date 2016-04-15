//imports
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const Driver = require("../../../dist/es5/nodejs/elisa-pouchdb").Driver;

//suite
suite("Server", function() {
  const DATA = "test/unit/data";
  var drv, cx, svr;

  init(function() {
    drv = Driver.getDriver("PouchDB");
  });

  suite("Local database", function() {
    init(function(done) {
      drv.openConnection({db: "elisa", location: DATA}, function(error, con) {
        cx = con;
        svr = cx.server;
        done();
      });
    });

    fin(function(done) {
      cx.client.destroy(done);
    });

    test("#host", function() {
      svr.host.must.be.eq("localhost");
    });

    test("#port", function() {
      svr.must.have({port: undefined});
    });

    test("#version", function() {
      svr.must.have({version: undefined});
    });
  });

  suite("In-memory database", function() {
    init(function(done) {
      drv.openConnection({}, function(error, con) {
        cx = con;
        svr = cx.server;
        done();
      });
    });

    test("#host", function() {
      svr.host.must.be.eq("localhost");
    });

    test("#port", function() {
      svr.must.have({port: undefined});
    });

    test("#version", function() {
      svr.must.have({version: undefined});
    });
  });

  suite("Remote database", function() {
    init(function(done) {
      drv.openConnection({host: "localhost", port: 5985}, function(error, con) {
        cx = con;
        svr = cx.server;
        done();
      });
    });

    test("#host", function() {
      svr.host.must.be.eq("localhost");
    });

    test("#port", function() {
      svr.must.have({port: 5985});
    });

    test("#version", function() {
      svr.must.have({version: undefined});
    });
  });
})();
