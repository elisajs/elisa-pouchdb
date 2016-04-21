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
suite("View Store (Asynchronous Connection)", function() {
  var drv, cx, store, client;

  init(function() {
    drv = Driver.getDriver("PouchDB");
  });

  init("*", function(done) {
    drv.openConnection({}, function(error, con) {
      cx = con;
      client = cx.client;
      db = cx.db;
      store = db.getStore("myschema.mystore", {prefix: "mysch.mysto:", design: "mysch", view: "mysto"});
      done();
    });
  });

  init("*", function(done) {
    client.put({
      _id: "_design/mysch",
      views: {
        mysto: {
          map: function(doc) {
            if (doc._id.startsWith("mysch.mysto:")) {
              emit(doc.id, doc);
            }
          }.toString()
        }
      }
    }, function(res) {
      if (res && res.error) return done(res);
      client.bulkDocs([
        {_id: "mysch.mysto:one", id: "one", x: 1, y: 1},
        {_id: "mysch.mysto:two", id: "two", x: 1, y: 2},
        {_id: "mysch.mysto:three", id: "three", x: 2, y: 1},
        {_id: "mysch.mysto:testing", id: "testing", x: 111, y: 222},
        {_id: "mysch.mycoll:one", id: "one", a: 1, b: 1},
        {_id: "mysch.mycoll:two", id: "two", a: 1, b: 2},
        {_id: "mysch.mycoll:three", id: "three", a: 2, b: 1}
      ], done);
    });
  });

  fin("*", function(done) {
    client.destroy(function(err) {
      cx.close(done);
    });
  });

  test("#view", function() {
    store.view.must.be.eq("mysto");
  });

  test("#viewId", function() {
    store.viewId.must.be.eq("mysch/mysto");
  });

  test("#isView()", function() {
    store.isView().must.be.eq(true);
  });

  test("#qn", function() {
    store.qn.must.be.eq("myschema.mystore");
  });

  test("#fqn", function() {
    store.fqn.must.be.eq("in-memory.myschema.mystore");
  });

  suite("#hasId()", function() {
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

  suite("#findOne()", function() {
    suite("Id doesn't exist", function() {
      test("findOne({id}, callback) => undefined", function(done) {
        store.findOne({id: "unknown"}, function(error, doc) {
          assert(error === undefined);
          assert(doc === undefined);
          done();
        });
      });
    });

    suite("Id exists", function() {
      test("findOne({id}, callback)", function(done) {
        store.findOne({id: "testing"}, function(error, doc) {
          assert(error === undefined);
          doc.must.have({
            id: "testing",
            _id: "mysch.mysto:testing",
            x: 111,
            y: 222
          });
          done();
        });
      });
    });
  });

  suite("#findAll()", function() {
    test("findAll(callback)", function(done) {
      store.findAll(function(error, res) {
        assert(error === undefined);
        res.must.be.instanceOf(Result);
        res.length.must.be.eq(4);
        for (var doc of res.docs) doc._id.must.match(/^mysch\.mysto:/);
        done();
      });
    });
  });

  suite("#count()", function() {
    test("count(callback)", function(done) {
      store.count(function(error, count) {
        assert(error === undefined);
        count.must.be.eq(4);
        done();
      });
    });

    test("count(opts, callback)", function(done) {
      store.count({}, function(error, count) {
        assert(error === undefined);
        count.must.be.eq(4);
        done();
      });
    });
  });

  suite("#insert()", function() {
    suite("One document", function() {
      test("insert(doc, callback) - key doesn't exist", function(done) {
        store.insert({id: "new", x: 1, y: 2, z: 3}, function(error) {
          assert(error === undefined);
          store.find({id: "new"}, function(error, doc) {
            assert(error === undefined);
            doc.must.have({
              _id: "mysch.mysto:new",
              id: "new",
              x: 1,
              y: 2,
              z: 3
            });
            done();
          });
        });
      });

      test("insert() - key exists", function(done) {
        store.insert({id: "testing", x: 1, y: 2, z: 3}, function(error) {
          assert(error === undefined);
          store.find({id: "testing"}, function(error, doc) {
            assert(error === undefined);
            doc.must.have({
              _id: "mysch.mysto:testing",
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

    suite("Several documents", function() {
      suite("No document exists", function() {
        test("insert(docs, callback)", function(done) {
          store.insert([
            {id: "newone", x: 1},
            {id: "newtwo", x: 2}
          ], function(error) {
            assert(error === undefined);
            store.findAll(function(error, res) {
              assert(error === undefined);
              res.length.must.be.eq(6);
              done();
            });
          });
        });
      });

      suite("Some document exists", function() {
        test("insert(docs, callback)", function(done) {
          store.insert([
            {id: "one", x: 111},
            {id: "newtwo", x: 222}
          ], function(error) {
            assert(error === undefined);
            store.findAll(function(error, res) {
              assert(error === undefined);
              res.length.must.be.eq(5);
              done();
            });
          });
        });
      });
    });
  });

  suite("#remove()", function() {
    test("remove()", function() {
      store.remove.bind(store).must.raise(Error, []);
    });

    test("remove({})", function() {
      store.remove.bind(store).must.raise(Error, [{}]);
    });

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
      test("remove({id})", function(done) {
        store.remove({id: "testing"});

        setTimeout(function() {
          store.find({id: "testing"}, function(error, doc) {
            assert(error === undefined);
            assert(doc === undefined);
            done();
          });
        }, 1000);
      });

      test("remove({id}, callback)", function(done) {
        store.remove({id: "testing"}, function(error) {
          assert(error === undefined);
          store.find({id: "testing"}, function(error, doc) {
            assert(error === undefined);
            assert(doc === undefined);
            done();
          });
        });
      });
    });
  });

  suite("#truncate()", function() {
    test("truncate()", function(done) {
      store.truncate();

      setTimeout(function() {
        store.count(function(error, cnt) {
          assert(error === undefined);
          cnt.must.be.eq(0);
          client.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(4);
            done();
          });
        });
      }, 500);
    });

    test("truncate(opts)", function(done) {
      store.truncate({});

      setTimeout(function() {
        store.count(function(error, cnt) {
          assert(error === undefined);
          cnt.must.be.eq(0);
          client.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(4);
            done();
          });
        });
      }, 500);
    });

    test("truncate(callback)", function(done) {
      store.truncate(function(error) {
        assert(error === undefined);

        store.count(function(error, cnt) {
          assert(error === undefined);
          cnt.must.be.eq(0);
          client.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(4);
            done();
          });
        });
      });
    });

    test("truncate(opts, callback)", function(done) {
      store.truncate({}, function(error) {
        assert(error === undefined);

        store.count(function(error, cnt) {
          assert(error === undefined);
          cnt.must.be.eq(0);
          client.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(4);
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
      test("update({id}, fields)", function(done) {
        store.update({id: "testing"}, {x: 123, y: {$inc: 1}});

        setTimeout(function() {
          store.find({id: "testing"}, function(error, doc) {
            assert(error === undefined);

            doc.must.have({
              _id: "mysch.mysto:testing",
              id: "testing",
              x: 123,
              y: 223
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
              _id: "mysch.mysto:testing",
              id: "testing",
              x: 123,
              y: 223
            });

            done();
          });
        });
      });
    });
  });
})();
