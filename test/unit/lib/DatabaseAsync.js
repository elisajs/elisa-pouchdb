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
suite("Database (Asynchronous Connection)", function() {
  var drv, cx, db;

  init(function() {
    drv = Driver.getDriver("PouchDB");
  });

  init(function(done) {
    drv.openConnection({}, function(err, con) {
      cx = con;
      db = cx.db;
      done();
    });
  });

  suite("#getSchema()", function() {
    test("getSchema(name)", function() {
      var sch = db.getSchema("mysch");

      sch.must.be.instanceOf(Schema);
      sch.name.must.be.eq("mysch");
      sch.design.must.be.eq("mysch");
      sch.db.must.be.same(db);
      sch.connection.must.be.same(cx);
    });

    test("getSchema(name, opts)", function() {
      var sch = db.getSchema("mysch", {design: "mydesign"});

      sch.must.be.instanceOf(Schema);
      sch.name.must.be.eq("mysch");
      sch.design.must.be.eq("mydesign");
      sch.db.must.be.same(db);
      sch.connection.must.be.same(cx);
    });
  });

  suite("#readSchema()", function() {
    test("readSchema(name, callback)", function(done) {
      db.readSchema("mysch", function(err, sch) {
        assert(err === undefined);
        sch.must.be.instanceOf(Schema);
        sch.name.must.be.eq("mysch");
        sch.design.must.be.eq("mysch");
        sch.db.must.be.same(db);
        sch.connection.must.be.same(cx);
        done();
      });
    });

    test("readSchema(name, opts, callback)", function(done) {
      db.readSchema("mysch", {design: "mydesign"}, function(err, sch) {
        assert(err === undefined);
        sch.must.be.instanceOf(Schema);
        sch.name.must.be.eq("mysch");
        sch.design.must.be.eq("mydesign");
        sch.db.must.be.same(db);
        sch.connection.must.be.same(cx);
        done();
      });
    });
  });

  suite("#hasSchema()", function() {
    test("hasSchema(name, callback)", function(done) {
      db.hasSchema("mysch", function(err, res) {
        assert(err === undefined);
        res.must.be.eq(true);
        done();
      });
    });
  });

  suite("#findSchema()", function() {
    test("findSchema(name, callback)", function(done) {
      db.findSchema("mysch", function(err, sch) {
        assert(err === undefined);
        sch.must.be.instanceOf(Schema);
        sch.name.must.be.eq("mysch");
        sch.design.must.be.eq("mysch");
        sch.db.must.be.same(db);
        sch.connection.must.be.same(cx);
        sch.driver.must.be.same(drv);
        done();
      });
    });

    test("findSchema(name, opts, callback)", function(done) {
      db.findSchema("mysch", {design: "mydesign"}, function(err, sch) {
        assert(err === undefined);
        sch.must.be.instanceOf(Schema);
        sch.name.must.be.eq("mysch");
        sch.design.must.be.eq("mydesign");
        sch.db.must.be.same(db);
        sch.connection.must.be.same(cx);
        sch.driver.must.be.same(drv);
        done();
      });
    });
  });

  suite("Store", function() {
    suite("#getStore()", function() {
      test("getStore(schema, store)", function() {
        var store = db.getStore("mysch", "mystore");
        store.must.be.instanceOf(Store);
        store.must.have({
          name: "mystore",
          qn: "mysch.mystore",
          fqn: "in-memory.mysch.mystore",
          prefix: "mysch.mystore:",
          view: undefined
        });
      });

      test("getStore(schema, store, opts)", function() {
        var store = db.getStore("mysch", "mystore", {prefix: "myprefix:", view: "myview"});
        store.must.be.instanceOf(Store);
        store.must.have({
          name: "mystore",
          qn: "mysch.mystore",
          fqn: "in-memory.mysch.mystore",
          prefix: "myprefix:",
          view: "myview"
        });
      });

      test("getStore(qn)", function() {
        var store = db.getStore("mysch.mystore");
        store.must.be.instanceOf(Store);
        store.must.have({
          name: "mystore",
          qn: "mysch.mystore",
          fqn: "in-memory.mysch.mystore",
          prefix: "mysch.mystore:",
          view: undefined
        });
      });

      test("getStore(qn, opts)", function() {
        var store = db.getStore("mysch.mystore", {prefix: "myprefix:", view: "myview"});
        store.must.be.instanceOf(Store);
        store.must.have({
          name: "mystore",
          qn: "mysch.mystore",
          fqn: "in-memory.mysch.mystore",
          prefix: "myprefix:",
          view: "myview"
        });
      });
    });

    suite("#findStore()", function() {
      test("findStore(schema, store, callback)", function(done) {
        db.findStore("mysch", "mystore", function(error, store) {
          assert(error === undefined);
          store.must.be.instanceOf(Store);
          store.must.have({
            name: "mystore",
            qn: "mysch.mystore",
            fqn: "in-memory.mysch.mystore",
            prefix: "mysch.mystore:",
            view: undefined
          });
          done();
        });
      });

      test("findStore(schema, store, opts, callback)", function(done) {
        db.findStore("mysch", "mystore", {prefix: "myprefix:", view: "myview"}, function(error, store) {
          assert(error === undefined);
          store.must.be.instanceOf(Store);
          store.must.have({
            name: "mystore",
            qn: "mysch.mystore",
            fqn: "in-memory.mysch.mystore",
            prefix: "myprefix:",
            view: "myview"
          });
          done();
        });
      });

      test("findStore(qn, callback) => Store", function(done) {
        db.findStore("mysch.mystore", function(error, store) {
          assert(error === undefined);
          store.must.be.instanceOf(Store);
          store.must.have({
            name: "mystore",
            qn: "mysch.mystore",
            fqn: "in-memory.mysch.mystore",
            prefix: "mysch.mystore:",
            view: undefined
          });
          done();
        });
      });

      test("findStore(qn, opts, callback) => Store", function(done) {
        db.findStore("mysch.mystore", {prefix: "myprefix:", view: "myview"}, function(error, store) {
          assert(error === undefined);
          store.must.be.instanceOf(Store);
          store.must.have({
            name: "mystore",
            qn: "mysch.mystore",
            fqn: "in-memory.mysch.mystore",
            prefix: "myprefix:",
            view: "myview"
          });
          done();
        });
      });
    });

    suite("#hasStore()", function() {
      test("hasStore(schema, store, callback) => true", function(done) {
        db.hasStore("mysch", "store", function(error, exist) {
          assert(error === undefined);
          exist.must.be.eq(true);
          done();
        });
      });

      test("hasStore(qn, callback) => true", function(done) {
        db.hasStore("mysch.store", function(error, exist) {
          assert(error === undefined);
          exist.must.be.eq(true);
          done();
        });
      });
    });
  });

  suite("Collection", function() {
    suite("#getCollection()", function() {
      test("getCollection(schema, coll)", function() {
        var coll = db.getCollection("mysch", "mycoll");
        coll.must.be.instanceOf(Collection);
        coll.must.have({
          name: "mycoll",
          qn: "mysch.mycoll",
          fqn: "in-memory.mysch.mycoll",
          prefix: "mysch.mycoll:",
          view: undefined
        });
      });

      test("getCollection(schema, coll, opts)", function() {
        var coll = db.getCollection("mysch", "mycoll", {prefix: "myprefix:", view: "myview"});
        coll.must.be.instanceOf(Collection);
        coll.must.have({
          name: "mycoll",
          qn: "mysch.mycoll",
          fqn: "in-memory.mysch.mycoll",
          prefix: "myprefix:",
          view: "myview"
        });
      });

      test("getCollection(qn)", function() {
        var coll = db.getCollection("mysch.mycoll");
        coll.must.be.instanceOf(Collection);
        coll.must.have({
          name: "mycoll",
          qn: "mysch.mycoll",
          fqn: "in-memory.mysch.mycoll",
          prefix: "mysch.mycoll:",
          view: undefined
        });
      });

      test("getCollection(qn, opts)", function() {
        var coll = db.getCollection("mysch.mycoll", {prefix: "myprefix:", view: "myview"});
        coll.must.be.instanceOf(Collection);
        coll.must.have({
          name: "mycoll",
          qn: "mysch.mycoll",
          fqn: "in-memory.mysch.mycoll",
          prefix: "myprefix:",
          view: "myview"
        });
      });
    });

    suite("#findCollection()", function() {
      test("findCollection(schema, coll, callback)", function(done) {
        db.findCollection("mysch", "mycoll", function(error, coll) {
          assert(error === undefined);
          coll.must.be.instanceOf(Collection);
          coll.must.have({
            name: "mycoll",
            qn: "mysch.mycoll",
            fqn: "in-memory.mysch.mycoll",
            prefix: "mysch.mycoll:",
            view: undefined
          });
          done();
        });
      });

      test("findCollection(schema, coll, opts, callback)", function(done) {
        db.findCollection("mysch", "mycoll", {prefix: "myprefix:", view: "myview"}, function(error, coll) {
          assert(error === undefined);
          coll.must.be.instanceOf(Collection);
          coll.must.have({
            name: "mycoll",
            qn: "mysch.mycoll",
            fqn: "in-memory.mysch.mycoll",
            prefix: "myprefix:",
            view: "myview"
          });
          done();
        });
      });

      test("findCollection(qn, callback)", function(done) {
        db.findCollection("mysch.mycoll", function(error, coll) {
          assert(error === undefined);
          coll.must.be.instanceOf(Collection);
          coll.must.have({
            name: "mycoll",
            qn: "mysch.mycoll",
            fqn: "in-memory.mysch.mycoll",
            prefix: "mysch.mycoll:",
            view: undefined
          });
          done();
        });
      });

      test("findCollection(qn, opts, callback)", function(done) {
        db.findCollection("mysch.mycoll", {prefix: "myprefix:", view: "myview"}, function(error, coll) {
          assert(error === undefined);
          coll.must.be.instanceOf(Collection);
          coll.must.have({
            name: "mycoll",
            qn: "mysch.mycoll",
            fqn: "in-memory.mysch.mycoll",
            prefix: "myprefix:",
            view: "myview"
          });
          done();
        });
      });
    });

    suite("#hasCollection()", function() {
      test("hasCollection(schema, coll, callback) => true", function(done) {
        db.hasCollection("mysch", "mycoll", function(error, exist) {
          assert(error === undefined);
          exist.must.be.eq(true);
          done();
        });
      });

      test("hasCollection(qn, callback) => true", function(done) {
        db.hasCollection("mysch.mycoll", function(error, exist) {
          assert(error === undefined);
          exist.must.be.eq(true);
          done();
        });
      });
    });
  });
})();
