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
suite("Store (Asynchronous Connection)", function() {
  var drv, cx, store;

  init(function() {
    drv = Driver.getDriver("PouchDB");
  });

  init("*", function(done) {
    drv.openConnection({}, function(error, con) {
      cx = con;
      db = cx.db;
      store = db.getStore("myschema.mystore");
      done();
    });
  });

  fin("*", function(done) {
    db.client.destroy(function(err) {
      cx.close(done);
    });
  });

  test("#qn", function() {
    store.qn.must.be.eq("myschema.mystore");
  });

  test("#fqn", function() {
    store.fqn.must.be.eq("in-memory.myschema.mystore");
  });

  suite("#hasId()", function() {
    init("It exists", function(done) {
      store.client.put({id: "testing", x: 1, y: 2}, "myschema.mystore:testing", function(err) {
        assert(err === null);
        done();
      });
    });

    test("It exists", function(done) {
      store.hasId("testing", function(error, exists) {
        assert(error === undefined);
        exists.must.be.eq(true);
        done();
      });
    });

    test("It doesn't exist", function(done) {
      store.hasId("unknown", function(error, exists) {
        assert(error === undefined);
        exists.must.be.eq(false);
        done();
      });
    });
  });

  suite("#find()", function() {
    suite("Id doesn't exist", function() {
      test("find({id}, callback) => undefined", function(done) {
        store.find({id: "unknown"}, function(error, doc) {
          assert(error === undefined);
          assert(doc === undefined);
          done();
        });
      });
    });

    suite("Id exists", function() {
      init("*", function(done) {
        store.client.put({id: "testing", x: 1, y: 2}, "myschema.mystore:testing", function(err) {
          assert(err === null);
          done();
        });
      });

      test("find({id}, callback)", function(done) {
        store.find({id: "testing"}, function(error, doc) {
          assert(error === undefined);
          doc.must.have({
            id: "testing",
            x: 1,
            y: 2
          });
          done();
        });
      });
    });
  });

  suite("#findAll()", function() {
    init("*", function(done) {
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

    test("findAll(callback)", function(done) {
      store.findAll(function(error, res) {
        assert(error === undefined);
        res.must.be.instanceOf(Result);
        res.length.must.be.eq(2);
        res.docs[0]._id.must.match(/myschema\.mystore:(one|two)/);
        res.docs[1]._id.must.match(/myschema\.mystore:(onw|two)/);
        done();
      });
    });
  });

  suite("#count()", function() {
    suite("Without documents", function() {
      test("count(callback)", function(done) {
        store.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(0);
          done();
        });
      });
    });

    suite("With documents", function() {
      init("*", function(done) {
        store.insert([
          {id: "one", x: 1, y: 1},
          {id: "two", x: 1, y: 2},
          {id: "three", x: 1, y: 3}
        ], done);
      });

      test("count(callback)", function(done) {
        store.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(3);
          done();
        });
      });

      test("count(opts, callback)", function(done) {
        store.count({}, function(error, count) {
          assert(error === undefined);
          count.must.be.eq(3);
          done();
        });
      });
    });
  });

  suite("#insert()", function() {
    suite("One document", function() {
      suite("Id doesn't exist", function() {
        test("insert(doc, callback) - key doesn't exist", function(done) {
          store.insert({id: "testing", x: 1, y: 2, z: 3}, function(error) {
            assert(error === undefined);
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
      });

      suite("Id exists", function() {
        init("*", function(done) {
          store.client.put({a: 1, b: 2}, "myschema.mystore:testing", function(error) {
            assert(error === null);
            done();
          });
        });

        test("insert() - key exists", function(done) {
          store.insert({id: "testing", x: 1, y: 2, z: 3}, function(error) {
            assert(error === undefined);
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
    });

    suite("Several documents", function() {
      suite("No document exists", function() {
        test("insert(docs, callback)", function(done) {
          store.insert([
            {id: "one", x: 1},
            {id: "two", x: 2}
          ], function(error) {
            assert(error === undefined);
            store.findAll(function(error, res) {
              assert(error === undefined);
              res.length.must.be.eq(2);
              done();
            });
          });
        });
      });

      suite("Some document exists", function() {
        init("*", function(done) {
          store.insert({id: "one", x: 1}, done);
        });

        test("insert(docs, callback)", function(done) {
          store.insert([
            {id: "one", x: 111},
            {id: "two", x: 222}
          ], function(error) {
            assert(error === undefined);
            store.findAll(function(error, res) {
              assert(error === undefined);
              res.length.must.be.eq(2);
              if (res.docs[0].id == "one") res.docs[0].x.must.be.eq(111);
              if (res.docs[1].id == "one") res.docs[1].x.must.be.eq(111);
              done();
            });
          });
        });
      });
    });
  });

  suite("#remove()", function() {
    suite("Id doesn't exist", function() {
      test("remove({id})", function() {
        store.remove({id: "unknown"});
      });

      test("remove({id}, callback)", function(done) {
        store.remove({id: "unknown"}, function(error) {
          assert(error === undefined);
          done();
        });
      });
    });

    suite("Id exists", function() {
      init("*", function(done) {
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

        setTimeout(function() {
          store.client.get("myschema.mystore:testing", function(res, doc) {
            res.must.have({
              error: true,
              message: "missing"
            });
            done();
          });
        }, 1000);
      });

      test("remove({id}, callback)", function(done) {
        store.remove({id: "testing"}, function(error) {
          assert(error === undefined);
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
  });

  suite("#update()", function() {
    suite("Id doesn't exist", function() {
      test("update({id}, fields)", function(done) {
        store.update({id: "unknown"}, {x: 123});

        setTimeout(function() {
          store.find({id: "unknown"}, function(error, doc) {
            assert(error === undefined);
            assert(doc === undefined);
            done();
          });
        }, 1000);
      });

      test("update({id}, fields, callback)", function(done) {
        store.update({id: "unknown"}, {x: 123}, function(error) {
          assert(error === undefined);

          store.find({id: "unknown"}, function(error, doc) {
            assert(error === undefined);
            assert(doc === undefined);
            done();
          });
        });
      });
    });

    suite("Id exists", function() {
      init("*", function(done) {
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

      test("update({id}, fields)", function(done) {
        store.update({id: "testing"}, {x: 123, y: {$inc: 1}});

        setTimeout(function() {
          store.find({id: "testing"}, function(error, doc) {
            assert(error === undefined);

            doc.must.have({
              x: 123,
              y: 3,
              z: 3,
              id: "testing"
            });

            done();
          });
        }, 1000);
      });

      test("update({id}, fields, callback)", function(done) {
        store.update({id: "testing"}, {x: 123, y: {$inc: 1}}, function(error) {
          assert(error === undefined);

          store.find({id: "testing"}, function(error, doc) {
            assert(error === undefined);

            doc.must.have({
              x: 123,
              y: 3,
              z: 3,
              id: "testing"
            });

            done();
          });
        });
      });
    });
  });
})();