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
suite("Collection (Synchronous Connection)", function() {
  var drv, cx, db, coll;

  init({title: "Get driver"}, function() {
    drv = Driver.getDriver("PouchDB");
  });

  init({name: "*", title: "Open connection and get collection"}, function() {
    cx = drv.openConnection({type: "sync"}, {});
    db = cx.db;
    coll = db.getCollection("myschema.mycoll");
  });

  fin({name: "*", title: "Drop database"}, function(done) {
    db.client.destroy(function(res) {
      cx.close();
      done();
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
    init({name: "It exists", title: "Insert data"}, function(done) {
      coll.client.put({id: "testing", x: 1, y: 2}, "myschema.mycoll:testing", function(err) {
        assert(err === null);
        done();
      });
    });

    test("It exists", function() {
      coll.hasId("testing").must.be.eq(true);
    });

    test("It doesn't exist", function() {
      coll.hasId("unknown").must.be.eq(false);
    });
  });

  suite("Find", function() {
    init({name: "*", title: "Insert data"}, function(done) {
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
      test("find(filter) : Result", function() {
        const res = coll.find({x: {$between: [1, 2]}});
        res.length.must.be.eq(2);
        for (var i = 0; i < res.length; ++i) {
          var doc = res.docs[i];
          doc.x.must.be.between(1, 2);
          doc._id.must.match(/^myschema.mycoll:/);
        }
      });

      test("find(filter, opts) : Result", function() {
        const res = coll.find({x: {$between: [1, 2]}}, {});
        res.length.must.be.eq(2);
        for (var i = 0; i < res.length; ++i) {
          var doc = res.docs[i];
          doc.x.must.be.between(1, 2);
          doc._id.must.match(/^myschema.mycoll:/);
        }
      });
    });

    suite("#findOne()", function() {
      test("findOne(filter) : object", function() {
        const doc = coll.findOne({x: 1});
        doc._id.must.match(/^myschema.mycoll:/);
        doc.x.must.be.eq(1);
      });

      test("findOne(filter, opts) : object", function() {
        const doc= coll.findOne({x: 1}, {});
        doc._id.must.match(/^myschema.mycoll:/);
        doc.x.must.be.eq(1);
      });
    });

    suite("#findAll()", function() {
      test("findAll() : Result", function() {
        const res = coll.findAll();
        res.length.must.be.eq(6);
        for (var i = 0; i < res.length; ++i) res.docs[i]._id.must.match(/^myschema.mycoll:/);
      });
    });
  });

  suite("#count()", function() {
    suite("Without documents", function() {
      test("count() : number", function() {
        coll.count().must.be.eq(0);
      });
    });

    suite("With documents", function() {
      init({name: "*", title: "Insert data"}, function() {
        coll.insert([
          {x: 1, y: 1},
          {x: 1, y: 2},
          {x: 1, y: 3}
        ]);
      });

      test("count() : number", function() {
        coll.count().must.be.eq(3);
      });

      test("count(opts) : number", function() {
        coll.count({}).must.be.eq(3);
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
        test("insert(doc)", function() {
          coll.insert({id: 111, x: 1, y: 2});
          coll.findOne({id: 111}).must.have({
            id: 111,
            x: 1,
            y: 2,
            _id: "myschema.mycoll:111"
          });
        });

        test("insert(doc, opts)", function() {
          coll.insert({id: 111, x: 1, y: 2}, {});
          coll.findOne({id: 111}).must.have({
            id: 111,
            x: 1,
            y: 2,
            _id: "myschema.mycoll:111"
          });
        });

        test("insert() - Id exists", function() {
          coll.insert({id: 111, x: 1, y: 2});
          coll.insert.bind(coll).must.raise(Error, [{id: 111, x: 1, y: 2}]);
        });
      });

      suite("Without explicit id", function() {
        test("insert(doc)", function() {
          coll.insert({x: 1, y: 2});
          coll.findOne({id: 1}).must.have({
            id: 1,
            _id: "myschema.mycoll:1",
            x: 1,
            y: 2
          });
        });

        test("insert(doc, opts)", function() {
          coll.insert({x: 1, y: 2}, {});
          coll.findOne({id: 1}).must.have({
            id: 1,
            _id: "myschema.mycoll:1",
            x: 1,
            y: 2
          });
        });
      });
    });

    suite("Several documents", function() {
      test("insert([])", function() {
        coll.insert([]);
      });

      test("insert([], opts)", function() {
        coll.insert([], {});
      });

      test("insert([doc, doc])", function() {
        coll.insert([{x: 1, y: 2}, {x: 2, y: 1}]);
        const res = coll.q().sort("x").find({});
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
      });
    });
  });

  suite("#update()", function() {
    init({name: "*", title: "Insert data"}, function() {
      coll.insert([
        {x: 1, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 3},
        {x: 4, y: 4}
      ]);
    });

    test("update(query, update)", function() {
      coll.update({x: {$between: [2, 3]}}, {y: 123});
      const res = coll.q().sort("x").find({});
      res.length.must.be.eq(4);
      res.docs[0].must.have({x: 1, y: 1});
      res.docs[1].must.have({x: 2, y: 123});
      res.docs[2].must.have({x: 3, y: 123});
      res.docs[3].must.have({x: 4, y: 4});
    });

    test("update(query, update, opts)", function() {
      coll.update({x: {$between: [2, 3]}}, {y: 123}, {});
      const res = coll.q().sort("x").find({});
      res.length.must.be.eq(4);
      res.docs[0].must.have({x: 1, y: 1});
      res.docs[1].must.have({x: 2, y: 123});
      res.docs[2].must.have({x: 3, y: 123});
      res.docs[3].must.have({x: 4, y: 4});
    });

    test("update(query, update) - None", function() {
      coll.update({x: 123}, {y: 321});
      const res = coll.q().sort("x").find({});
      res.length.must.be.eq(4);
      res.docs[0].must.have({x: 1, y: 1});
      res.docs[1].must.have({x: 2, y: 2});
      res.docs[2].must.have({x: 3, y: 3});
      res.docs[3].must.have({x: 4, y: 4});
    });

    test("update(query, update) - One", function() {
      coll.update({x: 1, y: 1}, {y: 123});
      const res = coll.q().sort("x").find({});
      res.length.must.be.eq(4);
      res.docs[0].must.have({x: 1, y: 123});
      res.docs[1].must.have({x: 2, y: 2});
      res.docs[2].must.have({x: 3, y: 3});
      res.docs[3].must.have({x: 4, y: 4});
    });

    test("update(query, update) - Several", function() {
      coll.update({x: {$between: [2, 3]}}, {y: 123});
      const res = coll.q().sort("x").find({});
      res.length.must.be.eq(4);
      res.docs[0].must.have({x: 1, y: 1});
      res.docs[1].must.have({x: 2, y: 123});
      res.docs[2].must.have({x: 3, y: 123});
      res.docs[3].must.have({x: 4, y: 4});
    });
  });

  suite("#remove()", function() {
    init({name: "*", title: "Insert data"}, function() {
      coll.insert([
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 3},
        {x: 4, y: 3}
      ]);
    });

    test("remove()", function() {
      coll.remove.bind(coll).must.raise(Error, []);
    });

    test("remove(query)", function() {
      coll.remove({y: 2});
      coll.count().must.be.eq(2);
    });

    test("remove(query, opts)", function() {
      coll.remove({y: 2}, {});
      coll.count().must.be.eq(2);
    });
  });
})();
