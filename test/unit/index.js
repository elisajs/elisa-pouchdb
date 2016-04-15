//imports
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const pkg = require("../../dist/es5/nodejs/elisa-pouchdb");

//suite
suite("API", function() {
  test("Driver", function() {
    pkg.Driver.must.be.instanceOf(Function);
  });
})();
