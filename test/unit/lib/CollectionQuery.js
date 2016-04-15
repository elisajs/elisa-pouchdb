//imports
const assert = require("assert");
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const Driver = require("../../../dist/es5/nodejs/elisa-pouchdb").Driver;

//suite
suite("CollectionQuery", function() {
  var drv, cx, coll;

  init(function() {
    drv = Driver.getDriver("PouchDB");
  });

  init(function(done) {
    drv.openConnection({}, function(error, con) {
      cx = con;
      db = cx.db;
      coll = db.getCollection("myschema.mycoll");
      coll.client.bulkDocs([
        {_id: "myschema.mycoll:1", x: 1, c: 1},
        {_id: "myschema.mycoll:2", x: 2, c: 1},
        {_id: "myschema.mycoll:3", x: 3, c: 1},
        {_id: "myschema.mycoll:4", y: 1, c: 2},
        {_id: "myschema.mycoll:5", y: 2, c: 2},
        {_id: "myschema.mycoll:6", z: 1, c: 2},
        {_id: "myschema.mycoll2:1", x: 1, c: 2},
        {_id: "myschema.mycoll2:2", x: 2, c: 2}
      ], done);
    });
  });

  fin(function(done) {
    db.client.destroy(function(err) {
      cx.close(done);
    });
  });

  suite("Asynchronous connection", function() {
    var coll, q;

    init("*", function(done) {
      drv.openConnection({}, function(error, con) {
        coll = con.db.getCollection("myschema.mycoll");
        q = coll.q();
        done();
      });
    });

    suite("#find()", function() {
      test("find(callback)", function(done) {
        q.find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          for (var doc of res.docs) doc._id.must.match(/^myschema.mycoll:/);
          done();
        });
      });

      test("find(query, callback)", function(done) {
        q.find({x: {$between: [1, 3]}}, function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(3);
          for (var doc of res.docs) {
            doc._id.must.match(/^myschema.mycoll:/);
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
            doc._id.must.match(/^myschema.mycoll:/);
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
          doc._id.must.match(/^myschema.mycoll:/);
          done();
        });
      });

      test("findOne(query, callback)", function(done) {
        q.findOne({x: {$between: [1, 3]}}, function(error, doc) {
          assert(error === undefined);
          doc._id.must.match(/^myschema.mycoll:/);
          doc.x.must.be.between(1, 3);
          done();
        });
      });

      test("findOne(query, opts, callback)", function(done) {
        q.findOne({x: {$between: [1, 3]}}, {}, function(error, doc) {
          assert(error === undefined);
          doc._id.must.match(/^myschema.mycoll:/);
          doc.x.must.be.between(1, 3);
          done();
        });
      });
    });

    suite("#run()", function() {
      test("run(callback) - return all", function(done) {
        q.run(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          for (var i = 0; i < res.length; ++i) res.docs[i]._id.must.match(/^myschema.mycoll:/);
          done();
        });
      });

      test("run(callback) - filter", function(done) {
        q.filter({c: 2}).run(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(3);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc._id.must.match(/^myschema.mycoll:/);
            doc.must.not.have("x");
            doc.c.must.be.eq(2);
          }
          done();
        });
      });

      test("run(callback) - project", function(done) {
        q.project("x", "_id", "_rev").run(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc._id.must.match(/^myschema.mycoll:/);
            doc.must.not.have(["y", "c"]);
          }
          done();
        });
      });

      test("run(callback) - project().filter()", function(done) {
        q.project("x").filter({c: 1}).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(3);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.have("x");
            doc.x.must.be.between(1, 3);
            doc.must.not.have(["y", "z", "_id", "_rev"]);
          }
          done();
        });
      });

      test("run(callback) - project().filter().limit()", function(done) {
        q.project("x").filter({c: 1}).limit(2).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(2);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.have("x");
            doc.x.must.be.between(1, 3);
            doc.must.not.have(["y", "z", "_id", "_rev"]);
          }
          done();
        });
      });

      test("run(callback) - project().filter().offset()", function(done) {
        q.project("x").filter({c: 1}).offset(1).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(2);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.have("x");
            doc.x.must.be.between(1, 3);
            doc.must.not.have(["y", "z", "_id", "_rev"]);
          }
          done();
        });
      });

      test("run(callback) - project().filter().offset().limit()", function(done) {
        q.project("x").filter({c: 1}).offset(1).limit(1).find(function(error, res) {
          var doc;

          assert(error === undefined);
          res.length.must.be.eq(1);
          doc = res.docs[0];
          doc.must.have("x");
          doc.x.must.be.between(1, 3);
          doc.must.not.have(["y", "z", "_id", "_rev"]);
          done();
        });
      });

      test("run(callback) - sort()", function(done) {
        q.project("x", "_id").filter({c: 1}).sort({x: "DESC"}).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(3);
          res.docs.must.be.eq([
            {_id: "myschema.mycoll:3", x: 3},
            {_id: "myschema.mycoll:2", x: 2},
            {_id: "myschema.mycoll:1", x: 1}
          ]);
          done();
        });
      });
    });

    suite("#project()", function() {
      test("project(field)", function(done) {
        q.project("x").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.not.have(["y", "c", "_id", "_rev"]);
          }
          done();
        });
      });

      test("project(fields : string[])", function(done) {
        q.project("x", "_id", "_rev").find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc._id.must.match(/^myschema.mycoll:/);
            doc.must.not.have(["y", "c"]);
          }
          done();
        });
      });

      test("project(fields : object)", function(done) {
        q.project({x: "a", y: "b", c: "c"}).find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc.must.not.have(["x", "y", "_id", "_rev"]);
          }
          done();
        });
      });
    });

    suite("#find()", function() {
      test("find(callback)", function(done) {
        q.find(function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(6);
          for (var i = 0; i < res.length; ++i) res.docs[i]._id.must.match(/^myschema.mycoll:/);
          done();
        });
      });

      test("find(filter, callback)", function(done) {
        q.find({c: 1}, function(error, res) {
          assert(error === undefined);
          res.length.must.be.eq(3);
          for (var i = 0; i < res.length; ++i) {
            var doc = res.docs[i];
            doc._id.must.match(/^myschema.mycoll:/);
            doc.c.must.be.eq(1);
            doc.x.must.be.between(1, 3);
          }
          done();
        });
      });
    });
  });

  suite("Synchronous connection", function() {
    var coll, q;

    init("*", function() {
      coll = drv.openConnection({type: "sync"}, {}).db.getCollection("myschema.mycoll");
      q = coll.q();
    });

    suite("#find()", function() {
      test("find() : Result", function() {
        const res = q.find();
        res.length.must.be.eq(6);
        for (var doc of res.docs) doc._id.must.match(/^myschema.mycoll:/);
      });

      test("find(query) : Result", function() {
        const res = q.find({x: {$between: [1, 3]}});
        res.length.must.be.eq(3);
        for (var doc of res.docs) {
          doc._id.must.match(/^myschema.mycoll:/);
          doc.x.must.be.between(1, 3);
        }
      });

      test("find(query, opts) : Result", function() {
        const res = q.find({x: {$between: [1, 3]}}, {});
        res.length.must.be.eq(3);
        for (var doc of res.docs) {
          doc._id.must.match(/^myschema.mycoll:/);
          doc.x.must.be.between(1, 3);
        }
      });
    });

    suite("#findOne()", function() {
      test("findOne() : object", function() {
        const doc = q.findOne();
        doc._id.must.match(/^myschema.mycoll:/);
      });

      test("findOne(query) : object", function() {
        const doc = q.findOne({x: {$between: [1, 3]}});
        doc._id.must.match(/^myschema.mycoll:/);
        doc.x.must.be.between(1, 3);
      });

      test("findOne(query, opts) : object", function() {
        const doc = q.findOne({x: {$between: [1, 3]}}, {});
        doc._id.must.match(/^myschema.mycoll:/);
        doc.x.must.be.between(1, 3);
      });
    });

    suite("#run()", function() {
      test("run() : Result - find all", function() {
        const res = q.run();
        res.length.must.be.eq(6);
        for (var i = 0; i < res.length; ++i) res.docs[i]._id.must.match(/^myschema.mycoll:/);
      });

      test("run() : Result - filter", function() {
        const res = q.filter({c: 2}).run();
        res.length.must.be.eq(3);
        for (var i = 0; i < res.length; ++i) {
          var doc = res.docs[i];
          doc._id.must.match(/^myschema.mycoll:/);
          doc.must.not.have("x");
          doc.c.must.be.eq(2);
        }
      });
    });
  });
})();
