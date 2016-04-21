//imports
const assert = require("assert");
const justo = require("justo");
const spy = require("justo-spy");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const Driver = require("../../../dist/es5/nodejs/elisa-pouchdb").Driver;
const Result = require("../../../dist/es5/nodejs/elisa-pouchdb/lib/Result").default;

//suite
suite("Base Store (Asynchronous Connection)", function() {
  var drv, cx, cli, db, store;

  init({title: "Get driver"}, function() {
    drv = Driver.getDriver("PouchDB");
  });

  init({name: "*", title: "Open connection and get store"}, function(done) {
    drv.openConnection({}, function(error, con) {
      cx = con;
      db = cx.db;
      cli = db.client;
      store = db.getStore("myschema.mystore");
      done();
    });
  });

  init({name: "*", title: "Insert data"}, function(done) {
    cli.bulkDocs([
      {_id: "myschema.mystore:one", id: "one", x: 1, y: 1},
      {_id: "myschema.mystore:two", id: "two", x: 1, y: 2},
      {_id: "myschema.mystore:three", id: "three", x: 2, y: 1},
      {_id: "myschema.mystore:testing", id: "testing", x: 111, y: 222},
      {_id: "myschema.mycoll:one", id: "one", a: 1, b: 1},
      {_id: "myschema.mycoll:two", id: "two", a: 1, b: 2},
      {_id: "myschema.mycoll:three", id: "three", a: 2, b: 1}
    ], done);
  });

  fin({name: "*", title: "Drop database"}, function(done) {
    cli.destroy(function(err) {
      cx.close(done);
    });
  });

  test("#qn", function() {
    store.qn.must.be.eq("myschema.mystore");
  });

  test("#fqn", function() {
    store.fqn.must.be.eq("in-memory.myschema.mystore");
  });

  test("#isView()", function() {
    store.isView().must.be.eq(false);
  });

  test("#hasInjection()", function() {
    store.hasInjection().must.be.eq(false);
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
    test("findOne({id}, callback) - id doesn't exist", function(done) {
      store.findOne({id: "unknown"}, function(error, doc) {
        assert(error === undefined);
        assert(doc === undefined);
        done();
      });
    });

    test("findOne({id}, callback) - id exists", function(done) {
      store.findOne({id: "testing"}, function(error, doc) {
        assert(error === undefined);
        doc.must.have({
          _id: "myschema.mystore:testing",
          id: "testing",
          x: 111,
          y: 222
        });
        done();
      });
    });
  });

  suite("#findAll()", function() {
    test("findAll(callback)", function(done) {
      store.findAll(function(error, res) {
        assert(error === undefined);
        res.must.be.instanceOf(Result);
        res.length.must.be.eq(4);
        for (var doc of res.docs) doc._id.must.match(/^myschema\.mystore:/);
        done();
      });
    });
  });

  suite("#count()", function() {
    suite("Without documents", function() {
      init({name: "*", title: "Get store"}, function() {
        store = db.getStore("myschema.empty");
      });

      test("count(callback) => 0", function(done) {
        store.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(0);
          done();
        });
      });
    });

    suite("With documents", function() {
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
  });

  suite("#insert()", function() {
    suite("One document", function() {
      suite("Id doesn't exist", function() {
        test("insert(doc, callback) - key doesn't exist", function(done) {
          store.insert({id: "new", x: 1, y: 2, z: 3}, function(error) {
            assert(error === undefined);
            store.findOne({id: "new"}, function(error, doc)  {
              assert(error === undefined);

              doc.must.have({
                _id: "myschema.mystore:new",
                id: "new",
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
        test("insert() - key exists", function(done) {
          store.insert({id: "testing", x: 1, y: 2, z: 3}, function(error) {
            assert(error === undefined);
            store.findOne({id: "testing"}, function(error, doc) {
              assert(error === undefined);
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
      test("insert(docs, callback)", function(done) {
        store.insert([
          {id: "new1", x: 1},
          {id: "new2", x: 2},
          {id: "one", a: 1, b: 2, c: 3}
        ], function(error) {
          assert(error === undefined);

          store.findOne({id: "new1"}, function(error, doc) {
            assert(error === undefined);

            doc.must.have({
              _id: "myschema.mystore:new1",
              id: "new1",
              x: 1
            });

            store.findOne({id: "new2"}, function(error, doc) {
              assert(error === undefined);

              doc.must.have({
                _id: "myschema.mystore:new2",
                id: "new2",
                x: 2
              });

              store.findOne({id: "one"}, function(error, doc) {
                assert(error === undefined);

                doc.must.have({
                  _id: "myschema.mystore:one",
                  id: "one",
                  a: 1,
                  b: 2,
                  c: 3
                });

                doc.must.not.have(["x", "y", "z"]);

                done();
              });

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
      test("remove({id})", function(done) {
        store.remove({id: "unknown"});
        store.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(4);
          done();
        });
      });

      test("remove({id}, callback)", function(done) {
        store.remove({id: "unknown"}, function(error) {
          assert(error === undefined);
          store.count(function(error, count) {
            assert(error === undefined);
            count.must.be.eq(4);
            done();
          });
        });
      });
    });

    suite("Id exists", function() {
      test("remove({id})", function(done) {
        store.remove({id: "testing"});

        setTimeout(function() {
          store.count(function(error, count) {
            assert(error === undefined);
            count.must.be.eq(3);
            store.hasId("testing", function(error, exists) {
              assert(error === undefined);
              exists.must.be.eq(false);
              done();
            });
          });
        }, 1000);
      });

      test("remove({id}, callback)", function(done) {
        store.remove({id: "testing"}, function(error) {
          assert(error === undefined);
          store.count(function(error, count) {
            assert(error === undefined);
            count.must.be.eq(3);
            store.hasId("testing", function(error, exists) {
              assert(error === undefined);
              exists.must.be.eq(false);
              done();
            });
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
          cli.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(3);
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
          cli.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(3);
            done();
          });
        });
      }, 500);
    });

    test("truncate(opts, callback)", function(done) {
      store.truncate({}, function(error) {
        assert(error === undefined);

        store.count(function(error, cnt) {
          assert(error === undefined);
          cnt.must.be.eq(0);
          cli.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(3);
            done();
          });
        });
      });
    });


    test("truncate(callback)", function(done) {
      store.truncate(function(error) {
        assert(error === undefined);

        store.count(function(error, cnt) {
          assert(error === undefined);
          cnt.must.be.eq(0);
          cli.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(3);
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
          store.findOne({id: "unknown"}, function(error, doc) {
            assert(error === undefined);
            assert(doc === undefined);
            done();
          });
        }, 1000);
      });

      test("update({id}, fields, callback)", function(done) {
        store.update({id: "unknown"}, {x: 123}, function(error) {
          assert(error === undefined);

          store.findOne({id: "unknown"}, function(error, doc) {
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
          store.findOne({id: "testing"}, function(error, doc) {
            assert(error === undefined);

            doc.must.have({
              _id: "myschema.mystore:testing",
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

          store.findOne({id: "testing"}, function(error, doc) {
            assert(error === undefined);

            doc.must.have({
              _id: "myschema.mystore:testing",
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

  suite("Injection", function() {
    init({name: "*", title: "Get store"}, function() {
      store = spy(db.getStore("myschema.mystore", {inject: {inj: "theValue"}}), [
        "_findOne()",
        "_insert()",
        "_update()",
        "_remove()"
      ]);
    });

    test("#hasInjection() : true", function() {
      store.hasInjection().must.be.eq(true);
    });

    test("findOne(query, callback)", function(done) {
      store.findOne({id: "testing"}, function(error, doc) {
        assert(error === undefined);
        store.spy.called("_findOne()").must.be.eq(1);
        store.spy.getCall("_findOne()").arguments[0].must.be.eq({id: "testing"});
        done();
      });
    });

    test("insert(doc, callback)", function(done) {
      store.insert({id: "new", x: 1}, function(error) {
        assert(error === undefined);
        store.spy.called("_insert()").must.be.eq(1);
        store.spy.getCall("_insert()").arguments[0].must.be.eq({id: "new", x: 1, inj: "theValue"});
        done();
      });
    });

    test("insert(docs, callback)", function(done) {
      store.insert([{id: "new1", x: 1}, {id: "new2", x: 2}], function(error) {
        assert(error === undefined);
        store.spy.called("_insert()").must.be.eq(1);
        store.spy.getCall("_insert()").arguments[0].must.be.eq([
          {id: "new1", x: 1, inj: "theValue"},
          {id: "new2", x: 2, inj: "theValue"}
        ]);
        done();
      });
    });

    test("update(query, upd, callback)", function(done) {
      store.update({id: "testing"}, {x: 123}, function(error) {
        assert(error === undefined);
        store.spy.called("_update()").must.be.eq(1);
        store.spy.getCall("_update()").arguments[0].must.be.eq({id: "testing"});
        store.spy.getCall("_update()").arguments[1].must.be.eq({x: 123});
        done();
      });
    });

    test("remove(query, callback)", function(done) {
      store.remove({id: "testing"}, function(error) {
        assert(error === undefined);
        store.spy.called("_remove()").must.be.eq(1);
        store.spy.getCall("_remove()").arguments[0].must.be.eq({id: "testing"});
        done();
      });
    });
  });
})();
