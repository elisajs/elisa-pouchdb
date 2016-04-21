//imports
const assert = require("assert");
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const Driver = require("../../../dist/es5/nodejs/elisa-pouchdb").Driver;
const Schema = require("../../../dist/es5/nodejs/elisa-pouchdb/lib/Schema").default;
const Store = require("../../../dist/es5/nodejs/elisa-pouchdb/lib/Store").default;
const Collection = require("../../../dist/es5/nodejs/elisa-pouchdb/lib/Collection").default;

//suite
suite("Schema (Synchronous Connection)", function() {
  var drv, cx, db, sch;

  init({title: "Get driver"}, function() {
    drv = Driver.getDriver("PouchDB");
  });

  init({title: "Open connection and get schema"}, function() {
    cx = drv.openConnection({type: "sync"}, {});
    db = cx.db;
    sch = db.getSchema("mysch");
  });

  test("#qn", function() {
    sch.qn.must.be.eq("mysch");
  });

  test("#fqn", function() {
    sch.fqn.must.be.eq("in-memory.mysch");
  });

  suite("#getStore()", function() {
    test("getStore(name)", function() {
      var store = sch.getStore("mystore");

      store.must.be.instanceOf(Store);
      store.must.have({
        name: "mystore",
        qn: "mysch.mystore",
        fqn: "in-memory.mysch.mystore",
        prefix: "mysch.mystore:"
      });
    });

    test("getStore(name, opts)", function() {
      var store = sch.getStore("mystore", {prefix: "myprefix:"});

      store.must.be.instanceOf(Store);
      store.must.have({
        name: "mystore",
        qn: "mysch.mystore",
        fqn: "in-memory.mysch.mystore",
        prefix: "myprefix:"
      });
    });
  });

  suite("#readStore()", function() {
    test("readStore(name, callback) => Store", function(done) {
      sch.readStore("mystore", function(error, store) {
        assert(error === undefined);
        store.must.be.instanceOf(Store);
        store.must.have({
          name: "mystore",
          qn: "mysch.mystore",
          fqn: "in-memory.mysch.mystore",
          prefix: "mysch.mystore:"
        });
        done();
      });
    });

    test("readStore(name, opts, callback) => Store", function(done) {
      sch.readStore("mystore", {prefix: "myprefix:"}, function(error, store) {
        assert(error === undefined);
        store.must.be.instanceOf(Store);
        store.must.have({
          name: "mystore",
          qn: "mysch.mystore",
          fqn: "in-memory.mysch.mystore",
          prefix: "myprefix:"
        });
        done();
      });
    });
  });

  suite("#findStore()", function() {
    test("findStore(name) : Store", function() {
      const store = sch.findStore("mystore");
      store.must.be.instanceOf(Store);
      store.must.have({
        name: "mystore",
        qn: "mysch.mystore",
        fqn: "in-memory.mysch.mystore",
        prefix: "mysch.mystore:"
      });
    });

    test("findStore(name, opts) : Store", function() {
      const store = sch.findStore("mystore", {prefix: "myprefix:"});
      store.must.be.instanceOf(Store);
      store.must.have({
        name: "mystore",
        qn: "mysch.mystore",
        fqn: "in-memory.mysch.mystore",
        prefix: "myprefix:"
      });
    });
  });

  suite("#hasStore()", function() {
    test("hasStore(name) : true", function() {
      sch.hasStore("mystore").must.be.eq(true);
    });
  });

  suite("#getCollection()", function() {
    test("getCollection(name)", function() {
      var coll = sch.getCollection("mycoll");

      coll.must.be.instanceOf(Collection);
      coll.must.have({
        name: "mycoll",
        qn: "mysch.mycoll",
        fqn: "in-memory.mysch.mycoll",
        prefix: "mysch.mycoll:"
      });
    });

    test("getCollection(name, opts)", function() {
      var coll = sch.getCollection("mycoll", {prefix: "myprefix:"});

      coll.must.be.instanceOf(Collection);
      coll.must.have({
        name: "mycoll",
        qn: "mysch.mycoll",
        fqn: "in-memory.mysch.mycoll",
        prefix: "myprefix:"
      });
    });
  });

  suite("#hasCollection()", function() {
    test("hasCollection(name) : true", function() {
      sch.hasCollection("mycoll").must.be.eq(true);
    });
  });

  suite("#readCollection()", function() {
    test("readCollection(name, callback)", function(done) {
      sch.readCollection("mycoll", function(error, coll) {
        coll.must.be.instanceOf(Collection);
        coll.must.have({
          name: "mycoll",
          qn: "mysch.mycoll",
          fqn: "in-memory.mysch.mycoll",
          prefix: "mysch.mycoll:"
        });
        done();
      });
    });

    test("readCollection(name, opts, callback)", function(done) {
      sch.readCollection("mycoll", {prefix: "myprefix:"}, function(error, coll) {
        coll.must.be.instanceOf(Collection);
        coll.must.have({
          name: "mycoll",
          qn: "mysch.mycoll",
          fqn: "in-memory.mysch.mycoll",
          prefix: "myprefix:"
        });
        done();
      });
    });
  });

  suite("#findCollection()", function() {
    test("findCollection(name) : Collection", function() {
      const coll = sch.findCollection("mycoll");
      coll.must.be.instanceOf(Collection);
      coll.must.have({
        name: "mycoll",
        qn: "mysch.mycoll",
        fqn: "in-memory.mysch.mycoll",
        prefix: "mysch.mycoll:"
      });
    });

    test("findCollection(name, opts) : Collection", function() {
      const coll = sch.findCollection("mycoll", {prefix: "myprefix:"});
      coll.must.be.instanceOf(Collection);
      coll.must.have({
        name: "mycoll",
        qn: "mysch.mycoll",
        fqn: "in-memory.mysch.mycoll",
        prefix: "myprefix:"
      });
    });
  });
})();
