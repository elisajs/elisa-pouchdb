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
suite("Connection (Asynchronous Connection)", function() {
  const DATA = "test/unit/data";
  var drv;

  init(function() {
    drv = Driver.getDriver("PouchDB");
  });

  suite("#db", function() {
    var cx;

    init("*", function(done) {
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

      init("*", function() {
        cx = drv.createConnection({});
      });

      test("open()", function(done) {
        cx.open();

        setTimeout(function() {
          cx.opened.must.be.eq(true);
          cx.closed.must.be.eq(false);
          cx.subtype.must.be.eq("in-memory");
          done();
        }, 1500);
      });

      test("open(callback)", function(done) {
        cx.open(function(err) {
          assert(err === undefined);
          cx.opened.must.be.eq(true);
          cx.closed.must.be.eq(false);
          cx.subtype.must.be.eq("in-memory");
          done();
        });
      });
    });

    suite("Local database", function() {
      var cx;

      init("*", function() {
        cx = drv.createConnection({db: "mydb", location: DATA});
      });

      fin("*", function(done) {
        cx.client.destroy(done);
      });

      test("open()", function(done) {
        cx.open();

        setTimeout(function() {
          cx.opened.must.be.eq(true);
          cx.closed.must.be.eq(false);
          cx.subtype.must.be.eq("local");
          done();
        }, 1500);
      });

      test("open(callback)", function(done) {
        cx.open(function(err) {
          assert(err === undefined);
          cx.opened.must.be.eq(true);
          cx.closed.must.be.eq(false);
          cx.subtype.must.be.eq("local");
          done();
        });
      });
    });

    suite("Remote database", function() {
      suite("PouchDB Server", function() {
        var cx;

        init("*", function() {
          cx = drv.createConnection({host: "localhost", port: 5985, db: "elisa"});
        });

        fin("*", function(done) {
          cx.client.destroy(done);
        });

        test("open()", function(done) {
          cx.open();

          setTimeout(function() {
            cx.opened.must.be.eq(true);
            cx.closed.must.be.eq(false);
            cx.subtype.must.be.eq("remote");
            cx.client.put({x: 1}, "testing", function(res) {
              assert(res === null);
              done();
            });
          }, 1500);
        });

        test("open(callback)", function(done) {
          cx.open(function(error) {
            assert(error === undefined);
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

      suite("CouchDB", function() {
        var cx;

        init("*", function() {
          cx = drv.createConnection({host: "localhost", port: 5984, db: "elisa"});
        });

        fin("*", function(done) {
          cx.client.destroy(done);
        });

        test("open()", function(done) {
          cx.open();

          setTimeout(function() {
            cx.opened.must.be.eq(true);
            cx.closed.must.be.eq(false);
            cx.subtype.must.be.eq("remote");
            cx.client.put({x: 1}, "testing", function(res) {
              assert(res === null);
              done();
            });
          }, 1500);
        });

        test("open(callback)", function(done) {
          cx.open(function(error) {
            assert(error === undefined);
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
  });

  suite("#close()", function() {
    var cx;

    init("*", function(done) {
      drv.openConnection({}, function(err, con) {
        cx = con;
        done();
      });
    });

    test("close()", function(done) {
      cx.close();

      setTimeout(function() {
        cx.closed.must.be.eq(true);
        cx.opened.must.be.eq(false);
        done();
      }, 1000);
    });

    test("close(callback)", function(done) {
      cx.close(function(err) {
        assert(err === undefined);
        cx.closed.must.be.eq(true);
        cx.opened.must.be.eq(false);
        done();
      });
    });
  });

  suite("#connected()", function() {
    var cx;

    init("*", function(done) {
      drv.openConnection({}, function(err, con) {
        cx = con;
        done();
      });
    });

    test("connected(callback) - with opened connection", function(done) {
      cx.connected(function(error, con) {
        assert(error === undefined);
        con.must.be.eq(true);
        done();
      });
    });

    test("connected(callback) - with closed connection", function(done) {
      cx.close();

      setTimeout(function() {
        cx.connected(function(error, con) {
          assert(error === undefined);
          con.must.be.eq(false);
          done();
        });
      }, 500);
    });
  });

  suite("#ping()", function() {
    test("ping() - opened connection", function(done) {
      drv.openConnection({}, function(err, cx) {
        cx.ping(function(err) {
          assert(err === undefined);
          done();
        });
      });
    });

    test("ping() - closed connection", function(done) {
      var cx = drv.createConnection({});

      cx.ping(function(err) {
        err.must.be.instanceOf(Error);
        err.message.must.be.eq("Connection closed.");
        done();
      });
    });
  });
})();
