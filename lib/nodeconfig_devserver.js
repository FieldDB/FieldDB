exports.apphttpsdomain = "https://wwwdev.lingsync.org:3182";
exports.port = "3182";
exports.httpsOptions = {
  key: 'fielddb_debug.key',
  cert: 'fielddb_debug.crt',
  port: "3182",
  host: "wwwdev.lingsync.org",
  method: 'GET'
};
exports.usersDbConnection = {
  protocol: 'https://',
  domain: 'corpusdev.lingsync.org',
  port: '443',
  dbname: 'zfielddbuserscouch',
  path: ''
};
exports.usersDBExternalDomainName = 'corpusdev.lingsync.org';

console.log("Loaded dev config");
