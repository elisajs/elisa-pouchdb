[![Build Status](https://travis-ci.org/elisajs/elisa-pouchdb.svg?branch=master)](https://travis-ci.org/elisajs/elisa-pouchdb)

*PouchDB* *Elisa.js* driver.

Features:

- This driver allows to use the *schema* concept.
- This driver can work with key-value stores and document collections.
- This driver can connect to local databases (*browser apps* and *Node.js* apps) and remote databases (*PouchDB Server* or *CouchDB*).
- This driver can be used with an in-memory database.
- This driver can work with design documents and views.

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

# Schemas

The schemas doesn't support by *PouchDB*/*CouchDB* natively. But this driver does it.
In many cases, the schemas are associated to design documents.

To get a schema object, we can use the methods: `getSchema()` and `findSchema()` of the
`Database` class. To indicate the design document name, use the `design` option.

Next, some illustrative examples:

```
var hr = db.getSchema("hr");
var hr = db.getSchema("hr", {design: "hr"});
```

# Key-value stores

*PouchDB* is a document database, but we can use this driver to save documents
as values in key-value stores.

To get a store object, we can use the `getStore()` and `findStore()` methods.
With the `view` option, we can indicate the view name if the store is associated
to a view.

Examples:

```
var emp = cx.db.getStore("hr.employee");
var emp = cx.db.getStore("hr.employee", {design: "hr", view: "employees"});
```

The `view` option can be:

- A string, the view name.
- `true`, then the driver will use the store name as view name.

## Inserting a key-value

The `insert()` method is used to insert documents how indicated in the *Elisa* spec.
We must not forget to indicate the `id` property, this is the document key.

Example:

```
emp.insert({id: "Elvis Costello", year: 1954}, function(error) {});
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

If we need to update all the documents, we must use the `insert()` method. But
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

## Observations

Please, see the *Elisa.js* spec to know how to use the stores. This driver
complies with the spec.

# Document collection

*PouchDB* is a document database. This DBMS doesn't support the *collection* concept.
But this driver does it.

To get a collection object, we must use the `getCollection()` and `findCollection()` methods.
If the collection is associated to a view, we can indicate it with the `view` option:

- If its value is true, the view name is the collection name.
- If its value is a string, the view name is the specified one.

Examples:

```
var emp = cx.db.getCollection("hr.employees");
var emp = cx.db.getCollection("hr.employees", {design: "hr", view: "employees"});
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

## Observations

Please, see the *Elisa.js* spec to know how to use the collections. This driver
complies with the spec.
