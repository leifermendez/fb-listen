const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

var db = new JsonDB(new Config("userLog", true, false, '/'));
var dbReplay = new JsonDB(new Config("userReplay", true, false, '/'));
db.push("/users[]", {});

module.exports = { db, dbReplay }