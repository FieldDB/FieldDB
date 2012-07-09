({
  baseUrl : "./public",
  dir : "./release",
  optimize : 'none',
//  optimize : 'uglify',
//  uglify: {
//    toplevel: true,
//    ascii_only: true,
//    beautify: true,
//    max_line_length: 1000
//  },
//  inlineText: true,
//  namespace: 'ifield',
  skipModuleInsertion: false,
//  stubModules: ['underscore', 'jquery','backbone'],
//  wrap: {
//    start: "(function() {",
//    end: "}());"
//  },
  mainConfigFile : "public/main.js",
  modules : [ {
    name : "main"
  } ]
})