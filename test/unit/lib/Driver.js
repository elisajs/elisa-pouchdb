//imports
const assert = require("assert");
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const Driver = require("../../../dist/es5/nodejs/elisa-pouchdb").Driver;
const Connection = require("../../../dist/es5/nodejs/elisa-pouchdb/lib/Connection").default;

//suite
suite("Driver", function() {
  var drv;

  init(function() {
    drv = Driver.getDriver("PouchDB");
  });

  test("Check whether the driver is registered", function() {
    drv.must.be.instanceOf(Driver);
  });

  suite("#createConnection()", function() {
    test("#createConnection(opts)", function() {
      var cx = drv.createConnection({
        host: "localhost",
        port: 5984,
        db: "mydb",
        protocol: "https",
        username: "anonymous",
        password: "mypwd"
      });

      cx.must.be.instanceOf(Connection);
      cx.driver.must.be.same(drv);
      cx.options.must.have(["host", "port", "db", "protocol", "username", "password"]);
      cx.opened.must.be.eq(false);
      cx.closed.must.be.eq(true);
    });
  });

  suite("#openConnection()", function() {
    suite("Asynchronous connection", function() {
      test("openConnection(opts, callback)", function(done) {
        drv.openConnection({}, function(err, cx) {
          assert(err === undefined);
          cx.must.be.instanceOf(Connection);
          cx.driver.must.be.same(drv);
          cx.type.must.be.eq("async");
          cx.opened.must.be.eq(true);
          cx.closed.must.be.eq(false);
          done();
        });
      });

      test("openConnection({type: 'async'}, opts, callback)", function(done) {
        drv.openConnection({type: "async"}, {}, function(err, cx) {
          assert(err === undefined);
          cx.must.be.instanceOf(Connection);
          cx.driver.must.be.same(drv);
          cx.type.must.be.eq("async");
          cx.opened.must.be.eq(true);
          cx.closed.must.be.eq(false);
          done();
        });
      });
    });

    suite("Synchronous connection", function() {
      test("openConnection({type: 'sync', opts) : Connection", function() {
        var cx = drv.openConnection({type: "sync"}, {});
        cx.must.be.instanceOf(Connection);
        cx.driver.must.be.same(drv);
        cx.type.must.be.eq("sync");
        cx.opened.must.be.eq(true);
        cx.closed.must.be.eq(false);
      });
    });
  });
})();
