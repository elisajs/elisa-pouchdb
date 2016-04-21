//imports
const assert = require("assert");
const fs = require("justo-fs");
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const Driver = require("../../../dist/es5/nodejs/elisa-pouchdb").Driver;
const Database = require("../../../dist/es5/nodejs/elisa-pouchdb/lib/Database").default;

//suite
suite("Connection (Synchronous Connection)", function() {
  const DATA = "test/unit/data";
  var drv;

  init({title: "Get driver"}, function() {
    drv = Driver.getDriver("PouchDB");
  });

  suite("#db", function() {
    var cx;

    init({name: "*", title: "Open connection"}, function(done) {
      drv.openConnection({}, function(err, con) {
        cx = con;
        done();
      });
    });

    test("db", function() {
      cx.db.must.be.instanceOf(Database);
      cx.db.name.must.be.eq("in-memory");
      cx.db.connection.must.be.same(cx);
      cx.db.driver.must.be.same(drv);
    });
  });

  suite("#open()", function() {
    suite("In-memory database", function() {
      var cx;

      init({name: "*", title: "Create connection"}, function() {
        cx = drv.createConnection({type: "sync"}, {});
      });

      test("open()", function() {
        cx.open();
        cx.opened.must.be.eq(true);
        cx.closed.must.be.eq(false);
        cx.subtype.must.be.eq("in-memory");
      });
    });

    suite("Local database", function() {
      var cx;

      init({name: "*", title: "Create connection"}, function() {
        cx = drv.createConnection({type: "sync"}, {db: "mydb", location: DATA});
      });

      fin({name: "*", title: "Drop database"}, function(done) {
        cx.client.destroy(done);
      });

      test("open()", function() {
        cx.open();
        cx.opened.must.be.eq(true);
        cx.closed.must.be.eq(false);
        cx.subtype.must.be.eq("local");
      });
    });

    suite("Remote database", function() {
      suite("PouchDB Server", function() {
        var cx;

        init({name: "*", title: "Create connection"}, function() {
          cx = drv.createConnection({type: "sync"}, {host: "localhost", port: 5985, db: "elisa"});
        });

        fin({name: "*", title: "Drop database"}, function(done) {
          cx.client.destroy(done);
        });

        test("open()", function(done) {
          cx.open();
          cx.opened.must.be.eq(true);
          cx.closed.must.be.eq(false);
          cx.subtype.must.be.eq("remote");
          cx.client.put({x: 1}, "testing", function(res) {
            assert(res === null);
            done();
          });
        });
      });

      suite("CouchDB", function() {
        var cx;

        init({name: "*", title: "Create connection"}, function() {
          cx = drv.createConnection({type: "sync"}, {host: "localhost", port: 5984, db: "elisa"});
        });

        fin({name: "*", title: "Drop database"}, function(done) {
          cx.client.destroy(done);
        });

        test("open()", function(done) {
          cx.open();
          cx.opened.must.be.eq(true);
          cx.closed.must.be.eq(false);
          cx.subtype.must.be.eq("remote");
          cx.client.put({x: 1}, "testing", function(res) {
            assert(res === null);
            done();
          });
        });
      });
    });
  });

  suite("#close()", function() {
    var cx;

    init({name: "*", title: "Open connection"}, function() {
      cx = drv.openConnection({type: "sync"}, {});
    });

    test("close()", function() {
      cx.close();
      cx.closed.must.be.eq(true);
      cx.opened.must.be.eq(false);
    });
  });

  suite("#connected()", function() {
    var cx;

    init({name: "*", title: "Open connection"}, function() {
      cx = drv.openConnection({type: "sync"}, {});
    });

    test("connected() - with opened connection", function() {
      cx.connected().must.be.eq(true);
    });

    test("connected() - with closed connection", function() {
      cx.close();
      cx.connected().must.be.eq(false);
    });
  });

  suite("#ping()", function() {
    test("ping() - opened connection", function() {
      drv.openConnection({type: "sync"}, {}).ping();
    });

    test("ping() - closed connection", function() {
      var cx = drv.createConnection({type: "sync"}, {});
      cx.ping.bind(cx).must.raise(Error);
    });
  });
})();
