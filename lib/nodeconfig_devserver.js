exports.port = "3183";
exports.httpsOptions = {
  key : 'fielddb_debug.key',
  cert : 'fielddb_debug.crt',
  port : "3183",
  host : "authdev.fieldlinguist.com",
  method: 'POST'
};
exports.usersDbConnection = {
  protocol : 'https://',
  domain : 'corpusdev.lingsync.org',
  port : '443',
  dbname : 'zfielddbuserscouch',
  path: ""
};
exports.usersDBExternalDomainName = "corpusdev.lingsync.org";
