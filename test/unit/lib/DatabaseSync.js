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
suite("Database (Synchronous Connection)", function() {
  var drv, cx, db;

  init({title: "Get driver"}, function() {
    drv = Driver.getDriver("PouchDB");
  });

  init({title: "Open connection"}, function() {
    cx = drv.openConnection({type: "sync"}, {});
    db = cx.db;
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

  suite("#hasSchema()", function() {
    test("hasSchema(name) : true", function() {
      db.hasSchema("mysch").must.be.eq(true);
    });
  });

  suite("#findSchema()", function() {
    test("findSchema(name) : Schema", function() {
      var sch = db.findSchema("mysch");

      sch.must.be.instanceOf(Schema);
      sch.name.must.be.eq("mysch");
      sch.design.must.be.eq("mysch");
      sch.db.must.be.same(db);
      sch.connection.must.be.same(cx);
      sch.driver.must.be.same(drv);
    });

    test("findSchema(name, opts) : Schema", function() {
      var sch = db.findSchema("mysch", {design: "mydesign"});

      sch.must.be.instanceOf(Schema);
      sch.name.must.be.eq("mysch");
      sch.design.must.be.eq("mydesign");
      sch.db.must.be.same(db);
      sch.connection.must.be.same(cx);
      sch.driver.must.be.same(drv);
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
      test("findStore(schema, store) : Store", function() {
        const store = db.findStore("mysch", "mystore");
        store.must.be.instanceOf(Store);
        store.must.have({
          name: "mystore",
          qn: "mysch.mystore",
          fqn: "in-memory.mysch.mystore",
          prefix: "mysch.mystore:",
          view: undefined
        });
      });

      test("findStore(schema, store, opts) : Store", function() {
        const store = db.findStore("mysch", "mystore", {prefix: "myprefix:", view: "myview"});
        store.must.be.instanceOf(Store);
        store.must.have({
          name: "mystore",
          qn: "mysch.mystore",
          fqn: "in-memory.mysch.mystore",
          prefix: "myprefix:",
          view: "myview"
        });
      });

      test("findStore(qn) : Store", function() {
        const store = db.findStore("mysch.mystore");
        store.must.be.instanceOf(Store);
        store.must.have({
          name: "mystore",
          qn: "mysch.mystore",
          fqn: "in-memory.mysch.mystore",
          prefix: "mysch.mystore:",
          view: undefined
        });
      });

      test("findStore(qn, opts) : Store", function() {
        const store = db.findStore("mysch.mystore", {prefix: "myprefix:", view: "myview"});
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

    suite("#hasStore()", function() {
      test("hasStore(schema, store) : true", function() {
        db.hasStore("mysch", "store").must.be.eq(true);
      });

      test("hasStore(qn) : true", function() {
        db.hasStore("mysch.store").must.be.eq(true);
      });
    });
  });

  suite("Collection", function() {
    suite("#getCollection()", function() {
      test("getCollection(schema, coll) : Collection", function() {
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

      test("getCollection(schema, coll, opts) : Collection", function() {
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

      test("getCollection(qn) : Collection", function() {
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

      test("getCollection(qn, opts) : Collection", function() {
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
      test("findCollection(schema, coll) : Collection", function() {
        const coll = db.findCollection("mysch", "mycoll");
        coll.must.be.instanceOf(Collection);
        coll.must.have({
          name: "mycoll",
          qn: "mysch.mycoll",
          fqn: "in-memory.mysch.mycoll",
          prefix: "mysch.mycoll:",
          view: undefined
        });
      });

      test("findCollection(schema, coll, opts) : Collection", function() {
        const coll = db.findCollection("mysch", "mycoll", {prefix: "myprefix:", view: "myview"});
        coll.must.be.instanceOf(Collection);
        coll.must.have({
          name: "mycoll",
          qn: "mysch.mycoll",
          fqn: "in-memory.mysch.mycoll",
          prefix: "myprefix:",
          view: "myview"
        });
      });

      test("findCollection(qn) : Collection", function() {
        const coll = db.findCollection("mysch.mycoll");
        coll.must.be.instanceOf(Collection);
        coll.must.have({
          name: "mycoll",
          qn: "mysch.mycoll",
          fqn: "in-memory.mysch.mycoll",
          prefix: "mysch.mycoll:",
          view: undefined
        });
      });

      test("findCollection(qn, opts) : Collection", function() {
        const coll = db.findCollection("mysch.mycoll", {prefix: "myprefix:", view: "myview"});
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

    suite("#hasCollection()", function() {
      test("hasCollection(schema, coll) : true", function() {
        db.hasCollection("mysch", "mycoll").must.be.eq(true);
      });

      test("hasCollection(qn) : true", function() {
        db.hasCollection("mysch.mycoll").must.be.eq(true);
      });
    });
  });
})();
