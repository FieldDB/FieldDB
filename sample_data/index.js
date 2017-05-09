// var fs = require('fs');

(function(exports) {
"use strict";

  var sampleData = {
    'activity_v2.4.0': require('./activity_v2.4.0.json'),
    // 'sample_elan.txt': fs.readFileSync(__dirname + "./sample_elan.txt", "utf8"),
    'tag_v1.22.1': require('./tag_v1.22.1.json'),
    'corpus_mask_v1.22.1': require('./corpus_mask_v1.22.1.json'),
    'corpus_v1.22.1_expected': require('./corpus_v1.22.1_expected.json'),
    'corpus_v1.22.1': require('./corpus_v1.22.1.json'),
    'user_v1.22.1': require('./user_v1.22.1.json'),
    'datalist_v1.22.1': require('./datalist_v1.22.1.json'),
    'participant_v2.32.0': require('./participant_v2.32.0.json'),
    'session_v1.22.1': require('./session_v1.22.1.json'),
    'usermask_v3.6.1': require('./usermask_v3.6.1.json'),
    'datum_v1.22.1': require('./datum_v1.22.1.json'),
    'lexicon_v1.22.1': require('./lexicon_v1.22.1.json'),
    'permissions_v1.22.1': require('./permissions_v1.22.1.json'),
    'validation-status_v1.22.1': require('./validation-status_v1.22.1.json'),
    'game_v2.24.0': require('./game_v2.24.0.json'),
  };

  exports.sampleData = sampleData;
  global.sampleData = sampleData;
  console.log('Loaded sample data', sampleData);
  return sampleData;
}(typeof exports === "object" && exports || this));
