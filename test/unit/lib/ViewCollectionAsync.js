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
suite("View Collection (Asynchronous Connection)", function() {
  var drv, cx, db, coll, client;

  init({title: "Get driver"}, function() {
    drv = Driver.getDriver("PouchDB");
  });

  init({name: "*", title: "Open connection and get collection"}, function(done) {
    drv.openConnection({}, function(error, con) {
      cx = con;
      client = cx.client;
      db = cx.db;
      coll = db.getCollection("myschema.mycoll", {prefix: "mysch.mycoll:", design: "mysch", view: "mycoll", id: "sequence"});
      done();
    });
  });

  init({name: "*", title: "Create design document and insert data"}, function(done) {
    client.put({
      _id: "_design/mysch",
      views: {
        mycoll: {
          map: function(doc) {
            if (doc._id.startsWith("mysch.mycoll:")) {
              emit(doc.id, doc);
            }
          }.toString()
        }
      }
    }, function(res) {
      if (res && res.error) return done(res);
      client.bulkDocs([
        {_id: "mysch.mycoll:one", id: "one", x: 1, y: 1},
        {_id: "mysch.mycoll:two", id: "two", x: 1, y: 2},
        {_id: "mysch.mycoll:three", id: "three", x: 2, y: 1},
        {_id: "mysch.mycoll:testing", id: "testing", x: 111, y: 222},
        {_id: "mysch.mysto:one", id: "one", a: 1, b: 1},
        {_id: "mysch.mysto:two", id: "two", a: 1, b: 2},
        {_id: "mysch.mysto:three", id: "three", a: 2, b: 1}
      ], done);
    });
  });

  fin({name: "*", title: "Drop database"}, function(done) {
    client.destroy(function(res) {
      cx.close(done);
    });
  });

  test("#view", function() {
    coll.view.must.be.eq("mycoll");
  });

  test("#viewId", function() {
    coll.viewId.must.be.eq("mysch/mycoll");
  });

  test("#isView()", function() {
    coll.isView().must.be.eq(true);
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

  suite("#find()", function() {
    test("find(filter, callback)", function(done) {
      coll.find({x: {$between: [1, 2]}}, function(error, res) {
        assert(error === undefined);
        res.length.must.be.eq(3);
        for (var i = 0; i < res.length; ++i) {
          var doc = res.docs[i];
          doc.x.must.be.between(1, 2);
          doc.id.must.match(/^(one|two|three)$/);
          doc._id.must.match(/^mysch.mycoll:(one|two|three)$/);
        }
        done();
      });
    });

    test("find(filter, opts, callback)", function(done) {
      coll.find({x: {$between: [1, 2]}}, {}, function(error, res) {
        assert(error === undefined);
        res.length.must.be.eq(3);
        for (var i = 0; i < res.length; ++i) {
          var doc = res.docs[i];
          doc.x.must.be.between(1, 2);
          doc.id.must.match(/^(one|two|three)$/);
          doc._id.must.match(/^mysch.mycoll:(one|two|three)$/);
        }
        done();
      });
    });
  });

  suite("#findAll()", function() {
    test("findAll(callback)", function(done) {
      coll.findAll(function(error, res) {
        assert(error === undefined);
        res.length.must.be.eq(4);
        for (var i = 0; i < res.length; ++i) res.docs[i]._id.must.match(/^mysch.mycoll:/);
        done();
      });
    });
  });

  suite("#count()", function() {
    test("count(callback)", function(done) {
      coll.count(function(error, count) {
        assert(error === undefined);
        count.must.be.eq(4);
        done();
      });
    });

    test("count(opts, callback)", function(done) {
      coll.count({}, function(error, count) {
        assert(error === undefined);
        count.must.be.eq(4);
        done();
      });
    });
  });

  suite("#findOne()", function() {
    test("findOne(filter, callback)", function(done) {
      coll.findOne({x: 1}, function(error, doc) {
        assert(error === undefined);
        doc.must.have({
          _id: "mysch.mycoll:one",
          id: "one",
          x: 1,
          y: 1
        });
        done();
      });
    });

    test("findOne(filter, opts, callback)", function(done) {
      coll.findOne({x: 1}, {}, function(error, doc) {
        assert(error === undefined);
        doc.must.have({
          _id: "mysch.mycoll:one",
          id: "one",
          x: 1,
          y: 1
        });
        done();
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
                _id: "mysch.mycoll:111",
                id: 111,
                x: 1,
                y: 2
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
                _id: "mysch.mycoll:111",
                id: 111,
                x: 1,
                y: 2
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
                _id: "mysch.mycoll:111",
                id: 111,
                x: 1,
                y: 2
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
                _id: "mysch.mycoll:111",
                id: 111,
                x: 1,
                y: 2
              });
              done();
            });
          });
        });

        test("insert(doc, callback) - Id exists", function(done) {
          coll.insert({id: 111, x: 1, y: 2}, function(error) {
            assert(error === undefined);
            coll.insert({id: 111, x: 1, y: 2}, function(error) {
              error.message.must.be.eq("Id already exists.");
              done();
            });
          });
        });
      });

      suite("Without explicit id", function() {
        test("insert(doc)", function(done) {
          coll.insert({x: 1, y: 2});

          setTimeout(function() {
            coll.findOne({id: 1}, function(error, doc) {
              assert(error === undefined);
              doc.must.have({
                _id: "mysch.mycoll:1",
                id: 1,
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
                _id: "mysch.mycoll:1",
                id: 1,
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
                _id: "mysch.mycoll:1",
                id: 1,
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
                _id: "mysch.mycoll:1",
                id: 1,
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
                  _id: "mysch.mycoll:1",
                  x: 1,
                  y: 2
                });
                coll.findOne({id: 2}, function(error, doc) {
                  assert(error === undefined);
                  doc.must.have({
                    id: 2,
                    _id: "mysch.mycoll:2",
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
          coll.count(function(error, cnt) {
            assert(error === undefined);
            cnt.must.be.eq(6);
            done();
          });
        }, 500);
      });
    });
  });

  suite("#update()", function() {
    test("update(query, update)", function(done) {
      coll.update({x: {$between: [2, 3]}}, {y: 123});
      setTimeout(function() {
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({id: "one", x: 1, y: 1});
          res.docs[1].must.have({id: "testing", x: 111, y: 222});
          res.docs[2].must.have({id: "three", x: 2, y: 123});
          res.docs[3].must.have({id: "two", x: 1, y: 2});
          done();
        });
      }, 500);
    });

    test("update(query, update, opts)", function(done) {
      coll.update({x: {$between: [2, 3]}}, {y: 123}, {});

      setTimeout(function() {
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({id: "one", x: 1, y: 1});
          res.docs[1].must.have({id: "testing", x: 111, y: 222});
          res.docs[2].must.have({id: "three", x: 2, y: 123});
          res.docs[3].must.have({id: "two", x: 1, y: 2});
          done();
        });
      }, 500);
    });

    test("update(query, update, opts, callback)", function(done) {
      coll.update({x: {$between: [2, 3]}}, {y: 123}, {}, function(error) {
        assert(error === undefined);
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({id: "one", x: 1, y: 1});
          res.docs[1].must.have({id: "testing", x: 111, y: 222});
          res.docs[2].must.have({id: "three", x: 2, y: 123});
          res.docs[3].must.have({id: "two", x: 1, y: 2});
          done();
        });
      });
    });

    test("update(query, update, callback) - None", function(done) {
      coll.update({x: {$between: [10, 20]}}, {y: 123}, function(error) {
        assert(error === undefined);
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({id: "one", x: 1, y: 1});
          res.docs[1].must.have({id: "testing", x: 111, y: 222});
          res.docs[2].must.have({id: "three", x: 2, y: 1});
          res.docs[3].must.have({id: "two", x: 1, y: 2});
          done();
        });
      });
    });

    test("update(query, update, callback) - One", function(done) {
      coll.update({x: {$between: [2, 3]}}, {y: 123}, function(error) {
        assert(error === undefined);
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({id: "one", x: 1, y: 1});
          res.docs[1].must.have({id: "testing", x: 111, y: 222});
          res.docs[2].must.have({id: "three", x: 2, y: 123});
          res.docs[3].must.have({id: "two", x: 1, y: 2});
          done();
        });
      });
    });

    test("update(query, update, callback) - Several", function(done) {
      coll.update({x: {$between: [1, 2]}}, {y: 123}, {}, function(error) {
        assert(error === undefined);
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs[0].must.have({id: "one", x: 1, y: 123});
          res.docs[1].must.have({id: "testing", x: 111, y: 222});
          res.docs[2].must.have({id: "three", x: 2, y: 123});
          res.docs[3].must.have({id: "two", x: 1, y: 123});
          done();
        });
      });
    });
  });

  suite("#remove()", function() {
    test("remove()", function() {
      coll.remove.bind(coll).must.raise(Error, []);
    });

    test("remove({})", function(done) {
      coll.remove({});
      setTimeout(function() {
        coll.count(function(error, cnt) {
          assert(error === undefined);
          cnt.must.be.eq(4);
          done();
        });
      }, 500);
    });

    test("remove(query)", function(done) {
      coll.remove({y: 2});

      setTimeout(function() {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(3);
          done();
        });
      }, 500);
    });

    test("remove(query, callback)", function(done) {
      coll.remove({y: 2}, function(error) {
        assert(error === undefined);
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(3);
          done();
        });
      });
    });

    test("remove(query, opts)", function(done) {
      coll.remove({y: 2}, {});

      setTimeout(function() {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(3);
          done();
        });
      }, 500);
    });

    test("remove(query, opts, callback)", function(done) {
      coll.remove({y: 2}, {}, function(error) {
        assert(error === undefined);
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(3);
          done();
        });
      });
    });
  });

  suite("#truncate()", function() {
    test("truncate()", function(done) {
      coll.truncate();

      setTimeout(function() {
        coll.count(function(error, cnt) {
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
      coll.truncate({});

      setTimeout(function() {
        coll.count(function(error, cnt) {
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

    test("truncate(opts, callback)", function(done) {
      coll.truncate({}, function(error) {
        assert(error === undefined);

        coll.count(function(error, cnt) {
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

    test("truncate(callback)", function(done) {
      coll.truncate(function(error) {
        assert(error === undefined);

        coll.count(function(error, cnt) {
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
})();
