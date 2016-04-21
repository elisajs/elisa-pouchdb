//imports
const assert = require("assert");
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const Driver = require("../../../dist/es5/nodejs/elisa-pouchdb").Driver;

//suite
suite("CollectionQuery (View)", function() {
  var drv, cx, db, cli;

  init({title: "Get driver"}, function() {
    drv = Driver.getDriver("PouchDB");
  });

  init({title: "Open connection"}, function(done) {
    drv.openConnection({}, function(error, con) {
      cx = con;
      db = cx.db;
      cli = db.client;
      done();
    });
  });

  init({title: "Create design document and insert data"}, function(done) {
    cli.put({
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

      cli.bulkDocs([
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

  fin({title: "Drop database"}, function(done) {
    cli.destroy(function(err) {
      cx.close(done);
    });
  });

  suite("Asynchronous connection", function() {
    var coll, q;

    init({title: "Open connection and get collection"}, function(done) {
      drv.openConnection({}, function(error, con) {
        coll = con.db.getCollection("mysch.mycoll", {design: "mysch", view: "mycoll"});
        coll.isView().must.be.eq(true);
        done();
      });
    });

    init({name: "*", title: "Get query"}, function() {
      q = coll.q();
    });

    suite("#find()", function() {
      test("find(callback)", function(done) {
        q.find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          for (var doc of res.docs) doc._id.must.match(/^mysch.mycoll:/);
          done();
        });
      });

      test("find(query, callback)", function(done) {
        q.find({x: {$between: [1, 3]}}, function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(3);
          for (var doc of res.docs) {
            doc._id.must.match(/^mysch.mycoll:/);
            doc.x.must.be.between(1, 3);
          }
          done();
        });
      });

      test("find(query, opts, callback)", function(done) {
        q.find({x: {$between: [1, 3]}}, {}, function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(3);
          for (var doc of res.docs) {
            doc._id.must.match(/^mysch.mycoll:/);
            doc.x.must.be.between(1, 3);
          }
          done();
        });
      });
    });

    suite("#findOne()", function() {
      test("findOne(callback)", function(done) {
        q.findOne(function(error, doc) {
          assert(error === undefined);
          doc._id.must.match(/^mysch.mycoll:/);
          done();
        });
      });

      test("findOne(query, callback)", function(done) {
        q.findOne({x: {$between: [1, 3]}}, function(error, doc) {
          assert(error === undefined);
          doc._id.must.match(/^mysch.mycoll:/);
          doc.x.must.be.between(1, 3);
          done();
        });
      });

      test("findOne(query, opts, callback)", function(done) {
        q.findOne({x: {$between: [1, 3]}}, {}, function(error, doc) {
          assert(error === undefined);
          doc._id.must.match(/^mysch.mycoll:/);
          doc.x.must.be.between(1, 3);
          done();
        });
      });
    });

    suite("#run()", function() {
      test("run(callback) - return all", function(done) {
        q.run(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          for (var i = 0; i < res.length; ++i) res.docs[i]._id.must.match(/^mysch.mycoll:/);
          done();
        });
      });

      test("run(callback) - filter", function(done) {
        q.filter({x: 1}).run(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(2);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc._id.must.match(/^mysch.mycoll:/);
            doc.x.must.be.eq(1);
          }
          done();
        });
      });

      test("run(callback) - project", function(done) {
        q.project("x", "_id", "_rev").run(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc._id.must.match(/^mysch.mycoll:/);
            doc.must.have("x");
            doc.must.not.have(["id", "y"]);
          }
          done();
        });
      });

      test("run(callback) - project().filter()", function(done) {
        q.project("x").filter({x: 1}).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(2);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.have("x");
            doc.x.must.be.between(1, 3);
            doc.must.not.have(["y", "id", "_id", "_rev"]);
          }
          done();
        });
      });

      test("run(callback) - project().filter().limit()", function(done) {
        q.project("x").filter({x: 1}).limit(1).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(1);
          var doc = res.docs[0];
          doc.must.have("x");
          doc.x.must.be.between(1, 3);
          doc.must.not.have(["y", "id", "_id", "_rev"]);
          done();
        });
      });

      test("run(callback) - project().filter().offset()", function(done) {
        q.project("x").filter({x: {$between: [1, 3]}}).offset(1).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(2);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.have("x");
            doc.x.must.be.between(1, 3);
            doc.must.not.have(["y", "id", "_id", "_rev"]);
          }
          done();
        });
      });

      test("run(callback) - project().filter().offset().limit()", function(done) {
        q.project("x").filter({x: {$between: [1, 3]}}).offset(1).limit(1).find(function(error, res) {
          var doc;

          assert(error === undefined);
          res.length.must.be.eq(1);
          doc = res.docs[0];
          doc.must.have("x");
          doc.x.must.be.between(1, 3);
          doc.must.not.have(["y", "id", "_id", "_rev"]);
          done();
        });
      });

      test("run(callback) - sort()", function(done) {
        q.project("x", "id").sort({x: "DESC"}).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          res.docs.must.be.eq([
            {id: "testing", x: 111},
            {id: "three", x: 2},
            {id: "one", x: 1},
            {id: "two", x: 1}
          ]);
          done();
        });
      });
    });

    suite("#project()", function() {
      test("project(field)", function(done) {
        q.project("x").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.have("x");
            doc.must.not.have(["y", "id", "_id", "_rev"]);
          }
          done();
        });
      });

      test("project(...fields : string[])", function(done) {
        q.project("x", "_id", "_rev").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.have(["x", "_id", "_rev"]);
            doc._id.must.match(/^mysch.mycoll:/);
            doc.must.not.have(["y", "id"]);
          }
          done();
        });
      });

      test("project(fields : object)", function(done) {
        q.project({x: "a", y: "b"}).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.have(["a", "b"]);
            doc.must.not.have(["x", "y", "id", "_id", "_rev"]);
          }
          done();
        });
      });
    });

    suite("#find()", function() {
      test("find(callback)", function(done) {
        q.find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(4);
          for (var i = 0; i < res.length; ++i) res.docs[i]._id.must.match(/^mysch.mycoll:/);
          done();
        });
      });

      test("find(filter, callback)", function(done) {
        q.find({x: 1}, function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(2);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc._id.must.match(/^mysch.mycoll:/);
            doc.x.must.be.eq(1);
          }
          done();
        });
      });
    });
  });

  suite("Synchronous connection", function() {
    var coll, q;

    init({title: "Open connection and get collection"}, function() {
      coll = drv.openConnection({type: "sync"}, {}).db.getCollection("mysch.mycoll", {design: "mysch", view: "mycoll"});
    });

    init({name: "*", title: "Get query"}, function() {
      q = coll.q();
    });

    suite("#find()", function() {
      test("find() : Result", function() {
        const res = q.find();
        res.length.must.be.eq(4);
        for (var doc of res.docs) doc._id.must.match(/^mysch.mycoll:/);
      });

      test("find(query) : Result", function() {
        const res = q.find({x: {$between: [1, 3]}});
        res.length.must.be.eq(3);
        for (var doc of res.docs) {
          doc._id.must.match(/^mysch.mycoll:/);
          doc.x.must.be.between(1, 3);
        }
      });

      test("find(query, opts) : Result", function() {
        const res = q.find({x: {$between: [1, 3]}}, {});
        res.length.must.be.eq(3);
        for (var doc of res.docs) {
          doc._id.must.match(/^mysch.mycoll:/);
          doc.x.must.be.between(1, 3);
        }
      });
    });

    suite("#findOne()", function() {
      test("findOne() : object", function() {
        const doc = q.findOne();
        doc._id.must.match(/^mysch.mycoll:/);
      });

      test("findOne(query) : object", function() {
        const doc = q.findOne({x: {$between: [1, 3]}});
        doc._id.must.match(/^mysch.mycoll:/);
        doc.x.must.be.between(1, 3);
      });

      test("findOne(query, opts) : object", function() {
        const doc = q.findOne({x: {$between: [1, 3]}}, {});
        doc._id.must.match(/^mysch.mycoll:/);
        doc.x.must.be.between(1, 3);
      });
    });

    suite("#run()", function() {
      test("run() : Result - find all", function() {
        const res = q.run();
        res.length.must.be.eq(4);
        for (var i = 0; i < res.length; ++i) res.docs[i]._id.must.match(/^mysch.mycoll:/);
      });

      test("run() : Result - filter", function() {
        const res = q.filter({x: {$between: [1, 2]}}).run();
        res.length.must.be.eq(3);
        for (var i = 0; i < res.length; ++i) {
          var doc = res.docs[i];
          doc._id.must.match(/^mysch.mycoll:/);
          doc.x.must.be.between(1, 2);
        }
      });
    });
  });
})();
