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
suite("Base Collection (Asynchronous Connection)", function() {
  var drv, cx, db, coll, cli;

  init(function() {
    drv = Driver.getDriver("PouchDB");
  });

  init("*", function(done) {
    drv.openConnection({}, function(error, con) {
      cx = con;
      db = cx.db;
      cli = db.client;
      coll = db.getCollection("myschema.mycoll");
      done();
    });
  });

  init("*", function(done) {
    cli.bulkDocs([
      {_id: "myschema.mycoll:one", id: "one", x: 1, c: 1},
      {_id: "myschema.mycoll:two", id: "two", x: 2, c: 1},
      {_id: "myschema.mycoll:three", id: "three", x: 3, c: 1},
      {_id: "myschema.mycoll:four", id: "four", y: 1, c: 1},
      {_id: "myschema.mycoll:five", id: "five", y: 2, c: 1},
      {_id: "myschema.mycoll:six", id: "six", z: 1, c: 1},
      {_id: "myschema.mycoll2:one", id: "one", x: 1, c: 2},
      {_id: "myschema.mycoll2:two", id: "two", x: 2, c: 2}
    ], done);
  });

  fin("*", function(done) {
    cli.destroy(function(res) {
      cx.close(done);
    });
  });

  test("#isView()", function() {
    coll.isView().must.be.eq(false);
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
      coll.hasId("one", function(error, exists) {
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

  suite("#count()", function() {
    suite("Without documents", function() {
      init("*", function() {
        coll = db.getCollection("myschema.empty");
      });

      test("count(callback)", function(done) {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(0);
          done();
        });
      });

      test("count(opts, callback)", function(done) {
        coll.count({}, function(error, count) {
          assert(error === undefined);
          count.must.be.eq(0);
          done();
        });
      });
    });

    suite("With documents", function() {
      test("count(callback)", function(done) {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(6);
          done();
        });
      });

      test("count(opts, callback)", function(done) {
        coll.count({}, function(error, count) {
          assert(error === undefined);
          count.must.be.eq(6);
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
                _id: "myschema.mycoll:111",
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
                _id: "myschema.mycoll:111",
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
                _id: "myschema.mycoll:111",
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
                _id: "myschema.mycoll:111",
                id: 111,
                x: 1,
                y: 2
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
                _id: "myschema.mycoll:1",
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
                _id: "myschema.mycoll:1",
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
                _id: "myschema.mycoll:1",
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
                _id: "myschema.mycoll:1",
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
                  _id: "myschema.mycoll:1",
                  id: 1,
                  x: 1,
                  y: 2
                });
                coll.findOne({id: 2}, function(error, doc) {
                  assert(error === undefined);
                  doc.must.have({
                    _id: "myschema.mycoll:2",
                    id: 2,
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
          coll.count(function(error, count) {
            assert(error === undefined);
            count.must.be.eq(8);
            done();
          });
        }, 500);
      });
    });
  });

  suite("#update()", function() {
    test("update(query, update)", function(done) {
      coll.update({x: {$between: [2, 3]}}, {c: 123});

      setTimeout(function() {
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          res.docs[0].must.have({_id: "myschema.mycoll:five", id: "five", y: 2, c: 1});
          res.docs[1].must.have({_id: "myschema.mycoll:four", id: "four", y: 1, c: 1});
          res.docs[2].must.have({_id: "myschema.mycoll:one", id: "one", x: 1, c: 1});
          res.docs[3].must.have({_id: "myschema.mycoll:six", id: "six", z: 1, c: 1});
          res.docs[4].must.have({_id: "myschema.mycoll:three", id: "three", x: 3, c: 123});
          res.docs[5].must.have({_id: "myschema.mycoll:two", id: "two", x: 2, c: 123});
          done();
        });
      }, 500);
    });

    test("update(query, update, opts)", function(done) {
      coll.update({x: {$between: [2, 3]}}, {c: 123}, {});

      setTimeout(function() {
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          res.docs[0].must.have({_id: "myschema.mycoll:five", id: "five", y: 2, c: 1});
          res.docs[1].must.have({_id: "myschema.mycoll:four", id: "four", y: 1, c: 1});
          res.docs[2].must.have({_id: "myschema.mycoll:one", id: "one", x: 1, c: 1});
          res.docs[3].must.have({_id: "myschema.mycoll:six", id: "six", z: 1, c: 1});
          res.docs[4].must.have({_id: "myschema.mycoll:three", id: "three", x: 3, c: 123});
          res.docs[5].must.have({_id: "myschema.mycoll:two", id: "two", x: 2, c: 123});
          done();
        });
      }, 500);
    });

    test("update(query, update, opts, callback)", function(done) {
      coll.update({x: {$between: [2, 3]}}, {c: 123}, {}, function(error) {
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          res.docs[0].must.have({_id: "myschema.mycoll:five", id: "five", y: 2, c: 1});
          res.docs[1].must.have({_id: "myschema.mycoll:four", id: "four", y: 1, c: 1});
          res.docs[2].must.have({_id: "myschema.mycoll:one", id: "one", x: 1, c: 1});
          res.docs[3].must.have({_id: "myschema.mycoll:six", id: "six", z: 1, c: 1});
          res.docs[4].must.have({_id: "myschema.mycoll:three", id: "three", x: 3, c: 123});
          res.docs[5].must.have({_id: "myschema.mycoll:two", id: "two", x: 2, c: 123});
          done();
        });
      });
    });

    test("update(query, update, callback) - None", function(done) {
      coll.update({x: {$between: [-100, -1]}}, {c: 123}, function(error) {
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          res.docs[0].must.have({_id: "myschema.mycoll:five", id: "five", y: 2, c: 1});
          res.docs[1].must.have({_id: "myschema.mycoll:four", id: "four", y: 1, c: 1});
          res.docs[2].must.have({_id: "myschema.mycoll:one", id: "one", x: 1, c: 1});
          res.docs[3].must.have({_id: "myschema.mycoll:six", id: "six", z: 1, c: 1});
          res.docs[4].must.have({_id: "myschema.mycoll:three", id: "three", x: 3, c: 1});
          res.docs[5].must.have({_id: "myschema.mycoll:two", id: "two", x: 2, c: 1});
          done();
        });
      });
    });

    test("update(query, update, callback) - One", function(done) {
      coll.update({z: 1}, {c: 123}, function(error) {
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          res.docs[0].must.have({_id: "myschema.mycoll:five", id: "five", y: 2, c: 1});
          res.docs[1].must.have({_id: "myschema.mycoll:four", id: "four", y: 1, c: 1});
          res.docs[2].must.have({_id: "myschema.mycoll:one", id: "one", x: 1, c: 1});
          res.docs[3].must.have({_id: "myschema.mycoll:six", id: "six", z: 1, c: 123});
          res.docs[4].must.have({_id: "myschema.mycoll:three", id: "three", x: 3, c: 1});
          res.docs[5].must.have({_id: "myschema.mycoll:two", id: "two", x: 2, c: 1});
          done();
        });
      });
    });

    test("update(query, update, callback) - Several", function(done) {
      coll.update({x: {$between: [2, 3]}}, {c: 123}, {}, function(error) {
        coll.q().sort("id").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          res.docs[0].must.have({_id: "myschema.mycoll:five", id: "five", y: 2, c: 1});
          res.docs[1].must.have({_id: "myschema.mycoll:four", id: "four", y: 1, c: 1});
          res.docs[2].must.have({_id: "myschema.mycoll:one", id: "one", x: 1, c: 1});
          res.docs[3].must.have({_id: "myschema.mycoll:six", id: "six", z: 1, c: 1});
          res.docs[4].must.have({_id: "myschema.mycoll:three", id: "three", x: 3, c: 123});
          res.docs[5].must.have({_id: "myschema.mycoll:two", id: "two", x: 2, c: 123});
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
          cnt.must.be.eq(6);
          done();
        });
      }, 500);
    });

    test("remove(query)", function(done) {
      coll.remove({z: 1});

      setTimeout(function() {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(5);
          done();
        });
      }, 500);
    });

    test("remove(query, callback)", function(done) {
      coll.remove({z: 1}, function(error) {
        assert(error === undefined);
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(5);
          done();
        });
      });
    });

    test("remove(query, opts)", function(done) {
      coll.remove({z: 1}, {});

      setTimeout(function() {
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(5);
          done();
        });
      }, 500);
    });

    test("remove(query, opts, callback)", function(done) {
      coll.remove({z: 1}, {}, function(error) {
        assert(error === undefined);
        coll.count(function(error, count) {
          assert(error === undefined);
          count.must.be.eq(5);
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
          cli.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(2);
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
          cli.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(2);
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
          cli.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(2);
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
          cli.allDocs(function(error, res) {
            assert(error === null);
            res.total_rows.must.be.eq(2);
            done();
          });
        });
      });
    });
  });
})();
