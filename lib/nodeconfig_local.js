exports.apphttpsdomain = "https://localhost:3182";
exports.port = "3182";
exports.httpsOptions = {
  key: 'fielddb_debug.key',
  cert: 'fielddb_debug.crt',
  port: "3182",
  host: "localhost",
  method: 'GET'
};
exports.usersDbConnection = {
  protocol: 'http://',
  domain: 'localhost',
  port: '5984',
  dbname: 'zfielddbuserscouch',
  path: ''
};
exports.usersDBExternalDomainName = 'localhost';


console.log("Loaded localhost config");
