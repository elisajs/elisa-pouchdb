//imports
const assert = require("assert");
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const Driver = require("../../../dist/es5/nodejs/elisa-pouchdb").Driver;
const CollectionQuery = require("../../../dist/es5/nodejs/elisa-pouchdb/lib/CollectionQuery").default;
const Result = require("../../../dist/es5/nodejs/elisa-pouchdb/lib/Result").default;

//suite
suite("Collection (Asynchronous Connection)", function() {
  var drv, cx, db, coll;

  init(function() {
    drv = Driver.getDriver("PouchDB");
  });

  init("*", function(done) {
    drv.openConnection({}, function(error, con) {
      cx = con;
      db = cx.db;
      coll = db.getCollection("myschema.mycoll");
      done();
    });
  });

  fin("*", function(done) {
    db.client.destroy(function(res) {
      cx.close(done);
    });
  });

  test("#qn", function() {
    coll.qn.must.be.eq("myschema.mycoll");
  });

  test("#fqn", function() {
    coll.fqn.must.be.eq("in-memory.myschema.mycoll");
  });

  test("#q()", function() {
    var q = coll.q();
    q.must.be.instanceOf(CollectionQuery);
    q.source.must.be.same(coll);
  });

  suite("#hasId()", function() {
    init("It exists", function(done) {
      coll.client.put({id: "testing", x: 1, y: 2}, "myschema.mycoll:testing", function(err) {
        assert(err === null);
        done();
      });
    });

    test("It exists", function(done) {
      coll.hasId("testing", function(error, exists) {
        assert(error === undefined);
        exists.must.be.eq(true);
        done();
      });
    });

    test("It doesn't exist", function(done) {
      coll.hasId("unknown", function(error, exists) {
        assert(error === undefined);
        exists.must.be.eq(false);
        done();
      });
    });
  });

  suite("Find", function() {
    init("*", function(done) {
      coll.client.bulkDocs([
        {_id: "myschema.mycoll:1", x: 1, c: 1},
        {_id: "myschema.mycoll:2", x: 2, c: 1},
        {_id: "myschema.mycoll:3", x: 3, c: 1},
        {_id: "myschema.mycoll:4", y: 1, c: 1},
        {_id: "myschema.mycoll:5", y: 2, c: 1},
        {_id: "myschema.mycoll:6", z: 1, c: 1},
        {_id: "myschema.mycoll2:1", x: 1, c: 2},
        {_id: "myschema.mycoll2:2", x: 2, c: 2}
      ], done);
    });

    suite("#find()", function() {
      test("find(filter, callback)", function(done) {
        coll.find({x: {$between: [1, 2]}}, function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(2);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.x.must.be.between(1, 2);
            doc._id.must.match(/^myschema.mycoll:/);
          }
          done();
        });
      });

      test("find(filter, opts, callback)", function(done) {
        coll.find({x: {$between: [1, 2]}}, {}, function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(2);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.x.must.be.between(1, 2);
            doc._id.must.match(/^myschema.mycoll:/);
          }
          done();
        });
      });
    });

    suite("#findOne()", function() {
      test("findOne(filter, callback)", function(done) {
        coll.findOne({x: 1}, function(error, doc) {
          assert(error === undefined);
          doc._id.must.match(/^myschema.mycoll:/);
          doc.x.must.be.eq(1);
          done();
        });
      });

      test("findOne(filter, opts, callback)", function(done) {
        coll.findOne({x: 1}, {}, function(error, doc) {
          assert(error === undefined);
          doc._id.must.match(/^myschema.mycoll:/);
          doc.x.must.be.eq(1);
          done();
        });
        done();
      });
    });

    suite("#findAll()", function() {
      test("findAll(callback)", function(done) {
        coll.findAll(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          for (var i = 0; i < res.length; ++i) res.docs[i]._id.must.match(/^myschema.mycoll:/);
          done();
        });
      });
    });
  });

  suite("#count()", function() {
    suite("Without documents", function() {
      test("count(callback)", function(done) {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(0);
          done();
        });
      });
    });

    suite("With documents", function() {
      init("*", function(done) {
        coll.insert([
          {x: 1, y: 1},
          {x: 1, y: 2},
          {x: 1, y: 3}
        ], done);
      });

      test("count(callback)", function(done) {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(3);
          done();
        });
      });

      test("count(opts, callback)", function(done) {
        coll.count({}, function(error, count) {
          assert(error === undefined);
          count.must.be.eq(3);
          done();
        });
      });
    });
  });

  suite("#nextSequenceValue()", function() {
    test("nextSequenceValue(callback) - Sequence doesn't exist", function(done) {
      coll.nextSequenceValue(function(error, value) {
        assert(error === undefined);
        value.must.be.eq(1);
        done();
      });
    });

    test("nextSequenceValue(callback) - Sequence exists", function(done) {
      coll.nextSequenceValue(function(error, value) {
        assert(error === undefined);
        value.must.be.eq(1);
        coll.nextSequenceValue(function(error, value) {
          assert(error === undefined);
          value.must.be.eq(2);
          done();
        });
      });
    });
  });

  suite("#insert()", function() {
    suite("One document", function() {
      suite("With explicit id", function() {
        test("insert(doc)", function(done) {
          coll.insert({id: 111, x: 1, y: 2});

          setTimeout(function() {
            coll.findOne({id: 111}, function(error, doc) {
              assert(error === undefined);
              doc.must.have({
                id: 111,
                x: 1,
                y: 2,
                _id: "myschema.mycoll:111"
              });
              done();
            });
          }, 500);
        });

        test("insert(doc, opts)", function(done) {
          coll.insert({id: 111, x: 1, y: 2}, {});

          setTimeout(function() {
            coll.findOne({id: 111}, function(error, doc) {
              assert(error === undefined);
              doc.must.have({
                id: 111,
                x: 1,
                y: 2,
                _id: "myschema.mycoll:111"
              });
              done();
            });
          }, 500);
        });

        test("insert(doc, callback)", function(done) {
          coll.insert({id: 111, x: 1, y: 2}, function(error) {
            assert(error === undefined);
            coll.findOne({id: 111}, function(error, doc) {
              assert(error === undefined);
              doc.must.have({
                id: 111,
                x: 1,
                y: 2,
                _id: "myschema.mycoll:111"
              });
              done();
            });
          });
        });

        test("insert(doc, opts, callback)", function(done) {
          coll.insert({id: 111, x: 1, y: 2}, {}, function(error) {
            assert(error === undefined);
            coll.findOne({id: 111}, function(error, doc) {
              assert(error === undefined);
              doc.must.have({
                id: 111,
                x: 1,
                y: 2,
                _id: "myschema.mycoll:111"
              });
              done();
            });
          });
        });

        test("insert() - Id exists", function(done) {
          coll.insert({id: 111, x: 1, y: 2}, function(error) {
            assert(error === undefined);
            coll.insert({id: 111, x: 1, y: 2}, function(error) {
              error.message.must.be.eq("Id already exists.");
              done();
            });
          })
        });
      });

      suite("Without explicit id", function() {
        test("insert(doc)", function(done) {
          coll.insert({x: 1, y: 2});

          setTimeout(function() {
            coll.findOne({id: 1}, function(error, doc) {
              assert(error === undefined);
              doc.must.have({
                id: 1,
                _id: "myschema.mycoll:1",
                x: 1,
                y: 2
              });
              done();
            });
          }, 500);
        });

        test("insert(doc, opts)", function(done) {
          coll.insert({x: 1, y: 2}, {});

          setTimeout(function() {
            coll.findOne({id: 1}, function(error, doc) {
              assert(error === undefined);
              doc.must.have({
                id: 1,
                _id: "myschema.mycoll:1",
                x: 1,
                y: 2
              });
              done();
            });
          }, 500);
        });

        test("insert(doc, callback)", function(done) {
          coll.insert({x: 1, y: 2}, function(error) {
            assert(error === undefined);
            coll.findOne({id: 1}, function(error, doc) {
              assert(error === undefined);
              doc.must.have({
                id: 1,
                _id: "myschema.mycoll:1",
                x: 1,
                y: 2
              });
              done();
            });
          });
        });

        test("insert(doc, opts, callback)", function(done) {
          coll.insert({x: 1, y: 2}, {}, function(error) {
            assert(error === undefined);
            coll.findOne({id: 1}, function(error, doc) {
              assert(error === undefined);
              doc.must.have({
                id: 1,
                _id: "myschema.mycoll:1",
                x: 1,
                y: 2
              });
              done();
            });
          });
        });

        test("insert(doc, callback) - several inserts", function(done) {
          coll.insert({x: 1, y: 2}, function(error) {
            assert(error === undefined);
            coll.insert({x: 2, y: 1}, function(error) {
              assert(error === undefined);
              coll.findOne({id: 1}, function(error, doc) {
                assert(error === undefined);
                doc.must.have({
                  id: 1,
                  _id: "myschema.mycoll:1",
                  x: 1,
                  y: 2
                });
                coll.findOne({id: 2}, function(error, doc) {
                  assert(error === undefined);
                  doc.must.have({
                    id: 2,
                    _id: "myschema.mycoll:2",
                    x: 2,
                    y: 1
                  });
                  done();
                });
              });
            });
          });
        });
      });
    });

    suite("Several documents", function() {
      test("insert([])", function(done) {
        coll.insert([]);
        done();
      });

      test("insert([], opts)", function(done) {
        coll.insert([], {});
        done();
      });

      test("insert([], opts, callback)", function(done) {
        coll.insert([], {}, function(error) {
          assert(error === undefined);
          done();
        });
      });

      test("insert([doc, doc])", function(done) {
        coll.insert([{x: 1, y: 2}, {x: 2, y: 1}]);

        setTimeout(function() {
          coll.q().sort("x").find(function(error, res) {
            assert(error === undefined);
            res.length.must.be.eq(2);
            res.docs[0].must.have({
              x: 1,
              y: 2,
              id: 1,
              _id: "myschema.mycoll:1"
            });
            res.docs[1].must.have({
              x: 2,
              y: 1,
              id: 2,
              _id: "myschema.mycoll:2"
            });
            done();
          });
        }, 500);
      });
    });
  });

  suite("#update()", function() {
    init("*", function(done) {
      coll.insert([
        {x: 1, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 3},
        {x: 4, y: 4}
      ], done);
    });

    test("update(query, update)", function(done) {
      coll.update({x: {$between: [2, 3]}}, {y: 123});

      setTimeout(function() {
        coll.q().sort("x").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({x: 1, y: 1});
          res.docs[1].must.have({x: 2, y: 123});
          res.docs[2].must.have({x: 3, y: 123});
          res.docs[3].must.have({x: 4, y: 4});
          done();
        });
      }, 500);
    });

    test("update(query, update, opts)", function(done) {
      coll.update({x: {$between: [2, 3]}}, {y: 123}, {});
      setTimeout(function() {
        coll.q().sort("x").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({x: 1, y: 1});
          res.docs[1].must.have({x: 2, y: 123});
          res.docs[2].must.have({x: 3, y: 123});
          res.docs[3].must.have({x: 4, y: 4});
          done();
        });
      }, 500);
    });

    test("update(query, update, opts, callback)", function(done) {
      coll.update({x: {$between: [2, 3]}}, {y: 123}, {}, function(error) {
        assert(error === undefined);
        coll.q().sort("x").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({x: 1, y: 1});
          res.docs[1].must.have({x: 2, y: 123});
          res.docs[2].must.have({x: 3, y: 123});
          res.docs[3].must.have({x: 4, y: 4});
          done();
        });
      });
    });

    test("update(query, update, callback) - None", function(done) {
      coll.update({x: 123}, {y: 321}, function(error) {
        assert(error === undefined);
        coll.q().sort("x").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({x: 1, y: 1});
          res.docs[1].must.have({x: 2, y: 2});
          res.docs[2].must.have({x: 3, y: 3});
          res.docs[3].must.have({x: 4, y: 4});
          done();
        });
      });
    });

    test("update(query, update, callback) - One", function(done) {
      coll.update({x: 1, y: 1}, {y: 123}, function(error) {
        assert(error === undefined);
        coll.q().sort("x").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({x: 1, y: 123});
          res.docs[1].must.have({x: 2, y: 2});
          res.docs[2].must.have({x: 3, y: 3});
          res.docs[3].must.have({x: 4, y: 4});
          done();
        });
      });
    });

    test("update(query, update, callback) - Several", function(done) {
      coll.update({x: {$between: [2, 3]}}, {y: 123}, function(error) {
        assert(error === undefined);
        coll.q().sort("x").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({x: 1, y: 1});
          res.docs[1].must.have({x: 2, y: 123});
          res.docs[2].must.have({x: 3, y: 123});
          res.docs[3].must.have({x: 4, y: 4});
          done();
        });
      });
    });
  });

  suite("#remove()", function() {
    init("*", function(done) {
      coll.insert([
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 3},
        {x: 4, y: 3}
      ], done);
    });

    test("remove()", function() {
      coll.remove.bind(coll).must.raise(Error, []);
    });

    test("remove(query)", function(done) {
      coll.remove({y: 2});

      setTimeout(function() {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(2);
          done();
        });
      }, 500);
    });

    test("remove(query, callback)", function(done) {
      coll.remove({y: 2}, function(error) {
        assert(error === undefined);
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(2);
          done();
        });
      });
    });

    test("remove(query, opts)", function(done) {
      coll.remove({y: 2}, {});

      setTimeout(function() {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(2);
          done();
        });
      }, 500);
    });

    test("remove(query, opts, callback)", function(done) {
      coll.remove({y: 2}, {}, function(error) {
        assert(error === undefined);
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(2);
          done();
        });
      });
    });
  });
})();