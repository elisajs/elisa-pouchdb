//imports
const assert = require("assert");
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const Driver = require("../../../dist/es5/nodejs/elisa-pouchdb").Driver;
const Result = require("../../../dist/es5/nodejs/elisa-pouchdb/lib/Result").default;

//suite
suite("Store (Synchronous Connection)", function() {
  var drv, cx, store;

  init({title: "Get driver"}, function() {
    drv = Driver.getDriver("PouchDB");
  });

  init({name: "*", title: "Open connection and get store"}, function() {
    cx = drv.openConnection({type: "sync"}, {});
    db = cx.db;
    store = db.getStore("myschema.mystore");
  });

  fin({name: "*", title: "Drop database"}, function(done) {
    db.client.destroy(function(err) {
      cx.close();
      done();
    });
  });

  test("#qn", function() {
    store.qn.must.be.eq("myschema.mystore");
  });

  test("#fqn", function() {
    store.fqn.must.be.eq("in-memory.myschema.mystore");
  });

  suite("#hasId()", function() {
    init({name: "It exists", title: "Insert data"}, function(done) {
      store.client.put({id: "testing", x: 1, y: 2}, "myschema.mystore:testing", function(err) {
        assert(err === null);
        done();
      });
    });

    test("It exists", function() {
      store.hasId("testing").must.be.eq(true);
    });

    test("It doesn't exist", function() {
      store.hasId("unknown").must.be.eq(false);
    });
  });

  suite("#find()", function() {
    suite("Id doesn't exist", function() {
      test("find({id}) : undefined", function() {
        assert(store.find({id: "unknown"}) === undefined);
      });
    });

    suite("Id exists", function() {
      init({name: "*", title: "Insert data"}, function(done) {
        store.client.put({id: "testing", x: 1, y: 2}, "myschema.mystore:testing", function(err) {
          assert(err === null);
          done();
        });
      });

      test("find({id}) : object", function() {
        store.find({id: "testing"}).must.have({
          id: "testing",
          x: 1,
          y: 2
        });
      });
    });
  });

  suite("#findAll()", function() {
    init({name: "*", title: "Insert data"}, function(done) {
      store.client.put({id: "one", x: 1, y: 2}, "myschema.mystore:one", function(res) {
        assert(res === null);

        store.client.put({id: "two", x: 2, y: 3}, "myschema.mystore:two", function(res) {
          assert(res === null);

          store.client.put({id: "one", x: 3, y: 4}, "myschema.mystore2:one", function(res) {
            assert(res === null);
            done();
          });
        });
      });
    });

    test("findAll() : Result", function() {
      const res = store.findAll();
      res.must.be.instanceOf(Result);
      res.length.must.be.eq(2);
      res.docs[0]._id.must.match(/myschema\.mystore:(one|two)/);
      res.docs[1]._id.must.match(/myschema\.mystore:(onw|two)/);
    });
  });

  suite("#count()", function() {
    suite("Without documents", function() {
      test("count() : number", function() {
        store.count().must.be.eq(0);
      });
    });

    suite("With documents", function() {
      init({name: "*", title: "Insert data"}, function() {
        store.insert([
          {id: "one", x: 1, y: 1},
          {id: "two", x: 1, y: 2},
          {id: "three", x: 1, y: 3}
        ]);
      });

      test("count() : number", function() {
        store.count().must.be.eq(3);
      });

      test("count(opts) : number", function() {
        store.count({}).must.be.eq(3);
      });
    });
  });

  suite("#insert()", function() {
    suite("One document", function() {
      suite("Id doesn't exist", function() {
        test("insert(doc) - key doesn't exist", function(done) {
          store.insert({id: "testing", x: 1, y: 2, z: 3});
          store.client.get("myschema.mystore:testing", function(error, doc) {
            doc.must.have({
              _id: "myschema.mystore:testing",
              id: "testing",
              x: 1,
              y: 2,
              z: 3
            });
            done();
          });
        });
      });

      suite("Id exists", function() {
        init({name: "*", title: "Insert data"}, function(done) {
          store.client.put({a: 1, b: 2}, "myschema.mystore:testing", function(error) {
            assert(error === null);
            done();
          });
        });

        test("insert(doc) - key exists", function(done) {
          store.insert({id: "testing", x: 1, y: 2, z: 3});
          store.client.get("myschema.mystore:testing", function(error, doc) {
            assert(error === null);
            doc.must.have({
              _id: "myschema.mystore:testing",
              id: "testing",
              x: 1,
              y: 2,
              z: 3
            });
            doc.must.not.have(["a", "b", "c"]);
            done();
          });
        });
      });
    });

    suite("Several documents", function() {
      suite("No document exists", function() {
        test("insert(docs)", function() {
          store.insert([
            {id: "one", x: 1},
            {id: "two", x: 2}
          ]);
          store.findAll().length.must.be.eq(2);
        });
      });

      suite("Some document exists", function() {
        init({name: "*", title: "Insert data"}, function() {
          store.insert({id: "one", x: 1});
        });

        test("insert(docs)", function() {
          store.insert([
            {id: "one", x: 111},
            {id: "two", x: 222}
          ]);

          const res = store.findAll();
          res.length.must.be.eq(2);
          if (res.docs[0].id == "one") res.docs[0].x.must.be.eq(111);
          if (res.docs[1].id == "one") res.docs[1].x.must.be.eq(111);
        });
      });
    });
  });

  suite("#remove()", function() {
    suite("Id doesn't exist", function() {
      test("remove({id})", function() {
        store.remove({id: "unknown"});
      });
    });

    suite("Id exists", function() {
      init({name: "*", title: "Insert data"}, function(done) {
        store.client.put({x: 1, y: 2, z: 3}, "myschema.mystore:testing", function(res) {
          assert(res === null);
          store.client.get("myschema.mystore:testing", function(res, doc) {
            assert(res === null);
            doc.must.have({
              x: 1,
              y: 2,
              z: 3,
              _id: "myschema.mystore:testing"
            });
            done();
          });
        });
      });

      test("remove({id})", function(done) {
        store.remove({id: "testing"});
        store.client.get("myschema.mystore:testing", function(res, doc) {
          res.must.have({
            error: true,
            message: "missing"
          });
          done();
        });
      });
    });
  });

  suite("#update()", function() {
    suite("Id doesn't exist", function() {
      test("update({id}, fields)", function() {
        store.update({id: "unknown"}, {x: 123});
        assert(store.find({id: "unknown"}) === undefined);
      });
    });

    suite("Id exists", function() {
      init({name: "*", title: "Insert data"}, function(done) {
        store.client.put({id: "testing", x: 1, y: 2, z: 3}, "myschema.mystore:testing", function(res) {
          assert(res === null);
          store.client.get("myschema.mystore:testing", function(res, doc) {
            assert(res === null);
            doc.must.have({
              x: 1,
              y: 2,
              z: 3,
              id: "testing",
              _id: "myschema.mystore:testing"
            });
            done();
          });
        });
      });

      test("update({id}, fields)", function() {
        store.update({id: "testing"}, {x: 123, y: {$inc: 1}});
        store.find({id: "testing"}).must.have({
          x: 123,
          y: 3,
          z: 3,
          id: "testing"
        });
      });
    });
  });
})();
