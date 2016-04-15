[![Build Status](https://travis-ci.org/elisajs/elisa-pouchdb.svg?branch=master)](https://travis-ci.org/elisajs/elisa-pouchdb)

*PouchDB* *Elisa.js* driver.

Features:

- This driver allow to use the *schema* concept.
- This driver can work with key-value stores and document collections.
- This driver can connect to local databases (*browser apps* and *Node.js* apps) and remote databases (*PouchDB Server* or *CouchDB*).
- This driver can be used with an in-memory database.

*PouchDB* is a document database, where all the documents are saved into a database,
without collection support and without schema support. But **this driver** simulates *key-value stores* and
*document collections* and *schemas*.

# Install

```
npm install elisa-pouchdb
```

# Driver load

```
const Driver = require("elisa-pouchdb").Driver;
const driver = Driver.getDriver("PouchDB");
```

We can use the following names:

- `PouchDB`
- `Pouch`

# Connection

## Connection to local database

```
var cx = driver.createConnection({
  db: "DB name",
  location: "directory path",
  autoCompaction: true|false,
  adapter: "adapter name",
  revsLimit: number
});
```

The `location` option is used in `Node.js` apps to indicate where to save the database.

## Connection to in-memory database

```
var cx = driver.createConnection({});
```

## Connection to remote database

We can connect to a *PouchDB Server* or a *CouchDB*:

```
var cx = driver.createConnection({
  db: "db name",
  protocol: "http|https",
  host: "hostname",
  port: port,
  username: "username",
  password: "password",
  skipSetup: true|false
});
```

When the server has no authentication, we can skip `username` and `password`.

# Key-value stores

*PouchDB* is a document database, but we can use this driver to save documents
as values in key-value stores.

```
var store = cx.db.getStore("schema.store");
cx.db.findStore("schema.store", function(error, store) {});
```

## Inserting a key-value

This method is used to insert a document. The document must set the key:

```
store.insert({id: "the key", x: 1, y: 2}, function(error) {});
```

If the document exists, this is overwritten.

We can insert several documents:

```
store.insert([
  {id: "one", x: 1, y: 1},
  {id: "two", x: 1, y: 2},
  {id: "three", x: 1, y: 3}
], function(error) {

});
```

## Updating a value

If we need to update all the document, we must use the `insert()` method. But
if we want to update some fields, the `update()` method:

```
store.update({id: "the key", {x: "new value"}}, function(error) {});
```

## Removing a key-value

```
//one key-value
store.remove({id: "the key"}, function(error) {});

//all
store.remove({}, function(error) {});
```

## Finding values

```
//one document
store.find({id: "the key"}, function(error, doc) {});

//all documents
store.findAll(function(error, result) {});
```

## Other methods

See the *Elisa.js* spec.

# Document collection

*PouchDB* is a document database. This DBMS doesn't support the *collection* concept.
But this driver does it.

```
var coll = cx.db.getCollection("schema.collection");
cx.db.findCollection("schema.collection", function(error, coll) {});
```

## Inserting documents

```
//one document
coll.insert({x: 1, y: 1}, function(error) {});

//several documents
coll.insert([{x: 1, y: 1}, {x: 1, y: 2}], function(error) {});
```

If the document has no `id`, the driver sets it.

## Updating documents

```
coll.update({x: 1}, {y: {$inc: 1}}, function(error) {});
```

## Removing documents

```
//several documents
coll.remove({x: 1}, function(error) {});

//all documents
coll.remove({}, function(error) {});
```

## Finding documents

```
coll.find({x: 1}, function(error, result) {});
coll.findOne({x: 1}, function(error, doc) {});
```

We also can use the `query` interface:

```
var q = coll.q();
q.project("x", "y").filter({x: 1}).sort("x").run(function(error, result) {});
q.project("x", "y").find({x: 1}, function(error, result) {});
```

## Other methods

See the *Elisa.js* spec.
