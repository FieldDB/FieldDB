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
  domain : 'ifielddevs.iriscouch.com',
  port : '6984',
  dbname : 'zfielddbuserscouch',
  path: ""
};