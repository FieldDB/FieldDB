(function() { 
/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  Math.uuid = function (len, radix) {
    var chars = CHARS, uuid = [];
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (var i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Math.uuidFast = function() {
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };

  // A more compact, but less performant, RFC4122v4 solution:
  Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    }).toUpperCase();
  };
})();

// END Math.uuid.js

/**
*
*  MD5 (Message-Digest Algorithm)
*
*  For original source see http://www.webtoolkit.info/
*  Download: 15.02.2009 from http://www.webtoolkit.info/javascript-md5.html
*
*  Licensed under CC-BY 2.0 License
*  (http://creativecommons.org/licenses/by/2.0/uk/)
*
**/

var Crypto = {};
(function() {
  Crypto.MD5 = function(string) {

    function RotateLeft(lValue, iShiftBits) {
      return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }

    function AddUnsigned(lX,lY) {
      var lX4,lY4,lX8,lY8,lResult;
      lX8 = (lX & 0x80000000);
      lY8 = (lY & 0x80000000);
      lX4 = (lX & 0x40000000);
      lY4 = (lY & 0x40000000);
      lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
      if (lX4 & lY4) {
        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        } else {
          return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        }
      } else {
        return (lResult ^ lX8 ^ lY8);
      }
    }

    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }

    function FF(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
      var lWordCount;
      var lMessageLength = string.length;
      var lNumberOfWords_temp1=lMessageLength + 8;
      var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
      var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
      var lWordArray=Array(lNumberOfWords-1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while ( lByteCount < lMessageLength ) {
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
        lByteCount++;
      }
      lWordCount = (lByteCount-(lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
      lWordArray[lNumberOfWords-2] = lMessageLength<<3;
      lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
      return lWordArray;
    };

    function WordToHex(lValue) {
      var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
      for (lCount = 0;lCount<=3;lCount++) {
        lByte = (lValue>>>(lCount*8)) & 255;
        WordToHexValue_temp = "0" + lByte.toString(16);
        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
      }
      return WordToHexValue;
    };

    //**	function Utf8Encode(string) removed. Aready defined in pidcrypt_utils.js

    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;

    //	string = Utf8Encode(string); #function call removed

    x = ConvertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k=0;k<x.length;k+=16) {
      AA=a; BB=b; CC=c; DD=d;
      a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
      d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
      c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
      b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
      a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
      d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
      c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
      b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
      a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
      d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
      c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
      b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
      a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
      d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
      c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
      b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
      a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
      d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
      c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
      b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
      a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
      d=GG(d,a,b,c,x[k+10],S22,0x2441453);
      c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
      b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
      a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
      d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
      c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
      b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
      a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
      d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
      c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
      b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
      a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
      d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
      c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
      b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
      a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
      d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
      c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
      b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
      a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
      d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
      c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
      b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
      a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
      d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
      c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
      b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
      a=II(a,b,c,d,x[k+0], S41,0xF4292244);
      d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
      c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
      b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
      a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
      d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
      c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
      b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
      a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
      d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
      c=II(c,d,a,b,x[k+6], S43,0xA3014314);
      b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
      a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
      d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
      c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
      b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
      a=AddUnsigned(a,AA);
      b=AddUnsigned(b,BB);
      c=AddUnsigned(c,CC);
      d=AddUnsigned(d,DD);
    }
    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
    return temp.toLowerCase();
  }
})();

// END Crypto.md5.js
window.Pouch = function Pouch(name, opts, callback) {

  if (!(this instanceof Pouch)) {
    return new Pouch(name, opts, callback);
  }

  if (opts instanceof Function || typeof opts === 'undefined') {
    callback = opts;
    opts = {};
  }

  var backend = Pouch.parseAdapter(opts.name || name);
  opts.name = backend.name;
  opts.adapter = opts.adapter || backend.adapter;

  if (!Pouch.adapters[backend.adapter]) {
    throw 'Adapter is missing';
  }

  if (!Pouch.adapters[backend.adapter].valid()) {
    throw 'Invalid Adapter';
  }

  var adapter = Pouch.adapters[backend.adapter](opts, callback);
  for (var j in adapter) {
    this[j] = adapter[j];
  }
}


Pouch.parseAdapter = function(name) {

  var match = name.match(/([a-z\-]*):\/\/(.*)/);

  if (match) {
    // the http or https adapter expects the fully qualified name
    if (match[1] === 'http') {
      name = 'http://' + match[2];
    } else if (match[1] === 'https') {
      name = 'https://' + match[2];
    } else {
      name = match[2];
    }
    var adapter = match[1];
    if (!Pouch.adapters[adapter].valid()) {
      throw 'Invalid adapter';
    }
    return {name: name, adapter: match[1]};
  }

  // the name didnt specify which adapter to use, so we just pick the first
  // valid one, we will probably add some bias to this (ie http should be last
  // fallback)
  for (var i in Pouch.adapters) {
    if (Pouch.adapters[i].valid()) {
      return {name: name, adapter: i};
    }
  }
  throw 'No Valid Adapter.';
}


Pouch.destroy = function(name, callback) {
  var opts = Pouch.parseAdapter(name);
  Pouch.adapters[opts.adapter].destroy(opts.name, callback);
};


Pouch.adapters = {};

Pouch.adapter = function (id, obj) {
  Pouch.adapters[id] = obj;
}


// Enumerate errors, add the status code so we can reflect the HTTP api
// in future
Pouch.Errors = {
  MISSING_BULK_DOCS: {
    status: 400,
    error: 'bad_request',
    reason: "Missing JSON list of 'docs'"
  },
  MISSING_DOC: {
    status: 404,
    error: 'not_found',
    reason: 'missing'
  },
  REV_CONFLICT: {
    status: 409,
    error: 'conflict',
    reason: 'Document update conflict'
  },
  INVALID_ID: {
    status: 400,
    error: 'invalid_id',
    reason: '_id field must contain a string'
  },
  UNKNOWN_ERROR: {
    status: 500,
    error: 'unknown_error',
    reason: 'Database encountered an unknown error'
  }
};
(function() {

  Pouch.collate = function(a, b) {
    var ai = collationIndex(a);
    var bi = collationIndex(b);
    if ((ai - bi) !== 0) {
      return ai - bi;
    }
    if (a === null) {
      return 0;
    }
    if (typeof a === 'number') {
      return a - b;
    }
    if (typeof a === 'boolean') {
      return a < b ? -1 : 1;
    }
    if (typeof a === 'string') {
      return stringCollate(a, b);
    }
    if (Array.isArray(a)) {
      return arrayCollate(a, b)
    }
    if (typeof a === 'object') {
      return objectCollate(a, b);
    }
  }

  var stringCollate = function(a, b) {
    // See: https://github.com/daleharvey/pouchdb/issues/40
    // This is incompatible with the CouchDB implementation, but its the
    // best we can do for now
    return (a === b) ? 0 : ((a > b) ? 1 : -1);
  }

  var objectCollate = function(a, b) {
    var ak = Object.keys(a), bk = Object.keys(b);
    var len = Math.min(ak.length, bk.length);
    for (var i = 0; i < len; i++) {
      // First sort the keys
      var sort = Pouch.collate(ak[i], bk[i]);
      if (sort !== 0) {
        return sort;
      }
      // if the keys are equal sort the values
      sort = Pouch.collate(a[ak[i]], b[bk[i]]);
      if (sort !== 0) {
        return sort;
      }

    }
    return (ak.length === bk.length) ? 0 :
      (ak.length > bk.length) ? 1 : -1;
  }

  var arrayCollate = function(a, b) {
    var len = Math.min(a.length, b.length);
    for (var i = 0; i < len; i++) {
      var sort = Pouch.collate(a[i], b[i]);
      if (sort !== 0) {
        return sort;
      }
    }
    return (a.length === b.length) ? 0 :
      (a.length > b.length) ? 1 : -1;
  }

  // The collation is defined by erlangs ordered terms
  // the atoms null, true, false come first, then numbers, strings,
  // arrays, then objects
  var collationIndex = function(x) {
    var id = ['boolean', 'number', 'string', 'object'];
    if (id.indexOf(typeof x) !== -1) {
      if (x === null) {
        return 1;
      }
      return id.indexOf(typeof x) + 2;
    }
    if (Array.isArray(x)) {
      return 4.5;
    }
  }

}).call(this);(function() {

  // for a better overview of what this is doing, read:
  // https://github.com/apache/couchdb/blob/master/src/couchdb/couch_key_tree.erl
  //
  // But for a quick intro, CouchDB uses a revision tree to store a documents
  // history, A -> B -> C, when a document has conflicts, that is a branch in the
  // tree, A -> (B1 | B2 -> C), We store these as a nested array in the format
  //
  // KeyTree = [Path ... ]
  // Path = {pos: position_from_root, ids: Tree}
  // Tree = [Key, Tree]

  // Turn a path as a flat array into a tree with a single branch
  function pathToTree(path) {
    var root = [path.shift(), []];
    var leaf = root;
    while (path.length) {
      nleaf = [path.shift(), []];
      leaf[1].push(nleaf);
      leaf = nleaf;
    }
    return root;
  }

  // To ensure we dont grow the revision tree infinitely, we stem old revisions
  function stem(tree, depth) {
    // First we break out the tree into a complete list of root to leaf paths,
    // we cut off the start of the path and generate a new set of flat trees
    var stemmedPaths = rootToLeaf(tree).map(function(path) {
      var stemmed = path.ids.slice(-depth);
      return {
        pos: path.pos + (path.ids.length - stemmed.length),
        ids: pathToTree(stemmed)
      };
    });
    // Then we remerge all those flat trees together, ensuring that we dont
    // connect trees that would go beyond the depth limit
    return stemmedPaths.reduce(function(prev, current, i, arr) {
      return doMerge(prev, current, true).tree;
    }, [stemmedPaths.shift()]);
  }

  // Merge two trees together
  function mergeTree(tree1, tree2) {
    var conflicts = false;
    for (var i = 0; i < tree2[1].length; i++) {
      if (!tree1[1][0]) {
        conflicts = 'new_leaf';
        tree1[1][0] = tree2[1][i];
      }
      if (tree1[1][0].indexOf(tree2[1][i][0]) === -1) {
        conflicts = 'new_branch';
        tree1[1].push(tree2[1][i]);
        tree1[1].sort();
      } else {
        var result = mergeTree(tree1[1][0], tree2[1][i]);
        conflicts = result.conflicts || conflicts;
        tree1[1][0] = result.tree;
      }
    }
    return {conflicts: conflicts, tree: tree1};
  }

  function doMerge(tree, path, dontExpand) {
    var restree = [];
    var conflicts = false;
    var merged = false;
    var res, branch;

    if (!tree.length) {
      return {tree: [path], conflicts: 'new_leaf'};
    }

    tree.forEach(function(branch) {
      if (branch.pos === path.pos && branch.ids[0] === path.ids[0]) {
        // Paths start at the same position and have the same root, so they need
        // merged
        res = mergeTree(branch.ids, path.ids);
        restree.push({pos: branch.pos, ids: res.tree});
        conflicts = conflicts || res.conflicts;
        merged = true;
      } else if (dontExpand !== true) {
        // The paths start at a different position, take the earliest path and
        // traverse up until it as at the same point from root as the path we want to
        // merge if the keys match we return the longer path with the other merged
        // After stemming we dont want to expand the trees

        // destructive assignment plz
        var t1 = branch.pos < path.pos ? branch : path;
        var t2 = branch.pos < path.pos ? path : branch;
        var diff = t2.pos - t1.pos;
        var parent, tmp = t1.ids;

        while(diff--) {
          parent = tmp[1];
          tmp = tmp[1][0];
        }

        if (tmp[0] !== t2.ids[0]) {
          restree.push(branch);
        } else {
          res = mergeTree(tmp, t2.ids);
          parent[0] = res.tree;
          restree.push({pos: t1.pos, ids: t1.ids});
          conflicts = conflicts || res.conflicts;
          merged = true;
        }
      } else {
        restree.push(branch);
      }
    });

    // We didnt find
    if (!merged) {
      restree.push(path);
    }

    restree.sort(function(a, b) {
      return a.pos - b.pos;
    });

    return {
      tree: restree,
      conflicts: conflicts || 'internal_node'
    };
  }

  this.Pouch.merge = function(tree, path, depth) {
    // Ugh, nicer way to not modify arguments in place?
    tree = JSON.parse(JSON.stringify(tree));
    path = JSON.parse(JSON.stringify(path));
    var newTree = doMerge(tree, path);
    return {
      tree: stem(newTree.tree, depth),
      conflicts: newTree.conflicts
    };
  };

}).call(this);
(function() {

  function replicate(src, target, opts, callback, replicateRet) {

    fetchCheckpoint(src, target, function(checkpoint) {
      var results = [];
      var completed = false;
      var pending = 0;
      var last_seq = 0;
      var continuous = opts.continuous || false;
      var result = {
        ok: true,
        start_time: new Date(),
        docs_read: 0,
        docs_written: 0
      };

      function isCompleted() {
        if (completed && pending === 0) {
          result.end_time = new Date();
          writeCheckpoint(src, target, last_seq, function() {
            call(callback, null, result);
          });
        }
      }

      if (replicateRet.cancelled) {
        return;
      }

      var repOpts = {
        continuous: continuous,
        since: checkpoint,
        onChange: function(change) {
          last_seq = change.seq;
          results.push(change);
          result.docs_read++;
          pending++;
          var diff = {};
          diff[change.id] = change.changes.map(function(x) { return x.rev; });
          target.revsDiff(diff, function(err, diffs) {
            if (Object.keys(diffs).length === 0) {
              pending--;
              isCompleted();
              return;
            }
            for (var id in diffs) {
              diffs[id].missing.map(function(rev) {
                src.get(id, {revs: true, rev: rev, attachments: true}, function(err, doc) {
                  target.bulkDocs({docs: [doc]}, {new_edits: false}, function() {
                    result.docs_written++;
                    pending--;
                    isCompleted();
                  });
                });
              });
            }
          });
        },
        complete: function(err, res) {
          completed = true;
          isCompleted();
        }
      };

      if (opts.filter) {
        repOpts.filter = opts.filter;
      }

      var changes = src.changes(repOpts);
      if (opts.continuous) {
        replicateRet.cancel = changes.cancel;
      }
    });
  }

  function toPouch(db, callback) {
    if (typeof db === 'string') {
      return new Pouch(db, callback);
    }
    callback(null, db);
  }

  Pouch.replicate = function(src, target, opts, callback) {
    // TODO: This needs some cleaning up, from the replicate call I want
    // to return a promise in which I can cancel continuous replications
    // this will just proxy requests to cancel the changes feed but only
    // after we start actually running the changes feed
    var ret = function() {
      this.cancelled = false;
      this.cancel = function() {
        this.cancelled = true;
      }
    }
    var replicateRet = new ret();
    toPouch(src, function(_, src) {
      toPouch(target, function(_, target) {
        replicate(src, target, opts, callback, replicateRet);
      });
    });
    return replicateRet;
  };

}).call(this);// Pretty dumb name for a function, just wraps callback calls so we dont
// to if (callback) callback() everywhere
var call = function(fun) {
  var args = Array.prototype.slice.call(arguments, 1);
  if (typeof fun === typeof Function) {
    fun.apply(this, args);
  }
}

// Preprocess documents, parse their revisions, assign an id and a
// revision for new writes that are missing them, etc
var parseDoc = function(doc, newEdits) {
  var error = null;
  if (newEdits) {
    if (!doc._id) {
      doc._id = Math.uuid();
    }
    var newRevId = Math.uuid(32, 16).toLowerCase();
    var nRevNum;
    if (doc._rev) {
      var revInfo = /^(\d+)-(.+)$/.exec(doc._rev);
      if (!revInfo) {
        throw "invalid value for property '_rev'";
      }
      doc._rev_tree = [{
        pos: parseInt(revInfo[1], 10),
        ids: [revInfo[2], [[newRevId, []]]]
      }];
      nRevNum = parseInt(revInfo[1], 10) + 1;
    } else {
      doc._rev_tree = [{
        pos: 1,
        ids : [newRevId, []]
      }];
      nRevNum = 1;
    }
  } else {
    if (doc._revisions) {
      doc._rev_tree = [{
        pos: doc._revisions.start - doc._revisions.ids.length + 1,
        ids: doc._revisions.ids.reduce(function(acc, x) {
          if (acc === null) {
            return [x, []];
          } else {
            return [x, [acc]];
          }
        }, null)
      }];
    }
    if (!doc._rev_tree) {
      var revInfo = /^(\d+)-(.+)$/.exec(doc._rev);
      nRevNum = parseInt(revInfo[1], 10);
      newRevId = revInfo[2];
      doc._rev_tree = [{
        pos: parseInt(revInfo[1], 10),
        ids: [revInfo[2], []]
      }];
    }
  }

  if (typeof doc._id !== 'string') {
    error = Pouch.Errors.INVALID_ID;
  }

  doc._id = decodeURIComponent(doc._id);
  doc._rev = [nRevNum, newRevId].join('-');

  if (error) {
    return error;
  }

  return Object.keys(doc).reduce(function(acc, key) {
    if (/^_/.test(key) && key !== '_attachments') {
      acc.metadata[key.slice(1)] = doc[key];
    } else {
      acc.data[key] = doc[key];
    }
    return acc;
  }, {metadata : {}, data : {}});
};

var compareRevs = function(a, b) {
  // Sort by id
  if (a.id !== b.id) {
    return (a.id < b.id ? -1 : 1);
  }
  // Then by deleted
  if (a.deleted ^ b.deleted) {
    return (a.deleted ? -1 : 1);
  }
  // Then by rev id
  if (a.rev_tree[0].pos === b.rev_tree[0].pos) {
    return (a.rev_tree[0].ids < b.rev_tree[0].ids ? -1 : 1);
  }
  // Then by depth of edits
  return (a.rev_tree[0].start < b.rev_tree[0].start ? -1 : 1);
};

// Pretty much all below can be combined into a higher order function to
// traverse revisions
// Turn a tree into a list of rootToLeaf paths
var expandTree = function(all, i, tree) {
  all.push({rev: i + '-' + tree[0], status: 'available'});
  tree[1].forEach(function(child) {
    expandTree(all, i + 1, child);
  });
}

var collectRevs = function(path) {
  var revs = [];
  expandTree(revs, path.pos, path.ids);
  return revs;
}

var collectLeavesInner = function(all, pos, tree) {
  if (!tree[1].length) {
    all.push({rev: pos + '-' + tree[0]});
  }
  tree[1].forEach(function(child) {
    collectLeavesInner(all, pos+1, child);
  });
}

var collectLeaves = function(revs) {
  var leaves = [];
  revs.forEach(function(tree) {
    collectLeavesInner(leaves, tree.pos, tree.ids);
  });
  return leaves;
}

var collectConflicts = function(revs) {
  var leaves = collectLeaves(revs);
  // First is current rev
  leaves.shift();
  return leaves.map(function(x) { return x.rev; });
}

var fetchCheckpoint = function(src, target, callback) {
  var id = Crypto.MD5(src.id() + target.id());
  src.get('_local/' + id, function(err, doc) {
    if (err && err.status === 404) {
      callback(0);
    } else {
      callback(doc.last_seq);
    }
  });
};

var writeCheckpoint = function(src, target, checkpoint, callback) {
  var check = {
    _id: '_local/' + Crypto.MD5(src.id() + target.id()),
    last_seq: checkpoint
  };
  src.get(check._id, function(err, doc) {
    if (doc && doc._rev) {
      check._rev = doc._rev;
    }
    src.put(check, function(err, doc) {
      callback();
    });
  });
};

// Turn a tree into a list of rootToLeaf paths
function expandTree2(all, current, pos, arr) {
  current = current.slice(0);
  current.push(arr[0]);
  if (!arr[1].length) {
    all.push({pos: pos, ids: current});
  }
  arr[1].forEach(function(child) {
    expandTree2(all, current, pos, child);
  });
}

function rootToLeaf(tree) {
  var all = [];
  tree.forEach(function(path) {
    expandTree2(all, [], path.pos, path.ids);
  });
  return all;
}

var arrayFirst = function(arr, callback) {
  for (var i = 0; i < arr.length; i++) {
    if (callback(arr[i], i) === true) {
      return arr[i];
    }
  }
  return false;
};

// Basic wrapper for localStorage
var localJSON = (function(){
  if (!localStorage) {
    return false;
  }
  return {
    set: function(prop, val) {
      localStorage.setItem(prop, JSON.stringify(val));
    },
    get: function(prop, def) {
      try {
        if (localStorage.getItem(prop) === null) {
          return def;
        }
        return JSON.parse((localStorage.getItem(prop) || 'false'));
      } catch(err) {
        return def;
      }
    },
    remove: function(prop) {
      localStorage.removeItem(prop);
    }
  };
})();
// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
function parseUri (str) {
  var o = parseUri.options;
  var m = o.parser[o.strictMode ? "strict" : "loose"].exec(str);
  var uri = {};
  var i = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  return uri;
};

parseUri.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host",
        "port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

// Get all the information you possibly can about the URI given by name and 
// return it as a suitable object.
function getHost(name) {
  // If the given name contains "http:" or "https:"
  if ((/http:/.test(name)) || (/https:/.test(name))) {
    // Prase the URI into all its little bits
    var uri = parseUri(name);
    
    // Store the fact that it is a remote URI
    uri.remote = true;
    
    // Store the user and password as a separate auth object
    uri.auth = {username: uri.user, password: uri.password};
    
    // Split the path part of the URI into parts using '/' as the delimiter
    // after removing any leading '/' and any trailing '/'
    var parts = uri.path.replace(/(^\/|\/$)/g, '').split('/');
    
    // Store the first part as the database name and remove it from the parts
    // array
    uri.db = parts.pop();
    
    // Restore the path by joining all the remaining parts (all the parts
    // except for the database name) with '/'s
    uri.path = parts.join('/');
    
    return uri;
  }
  
  // If the given name does not contain 'http:' or 'https' then return a 
  // very basic object
  // with no host, the current path, the given name as the database name and no
  // username/password
  return {host: '', path: '/', db: name, auth: false};
}

// Generate a URL with the host data given by opts and the given path
function genUrl(opts, path) {
  // If the host is remote
  if (opts.remote) {
    // If the host already has a path, then we need to have a path delimiter
    // Otherwise, the path delimiter is the empty string
    var pathDel = !opts.path ? '' : '/';
    
    // Return the URL made up of all the host's information and the given path
    return opts.protocol + '://' + opts.host + ':' + opts.port + '/' + opts.path
      + pathDel + opts.db + '/' + path;
  }
  
  // If the host is not remote, then return the URL made up of just the
  // database name and the given path
  return '/' + opts.db + '/' + path;
};

function ajax(options, callback) {
  var defaults = {
    success: function (obj, _, xhr) {
      call(callback, null, obj, xhr);
    },
    error: function (err) {
      if (err) {
        var errObj = {status: err.status};
        try {
          errObj = $.extend({}, errObj, JSON.parse(err.responseText));
        } catch (e) {}
        call(callback, errObj);
      } else {
        call(callback, true);
      }
    },
    headers: {
      Accept: 'application/json'
    },
    dataType: 'json',
    contentType: 'application/json'
  };
  options = $.extend({}, defaults, options);

  if (options.data && typeof options.data !== 'string') {
    options.data = JSON.stringify(options.data);
  }
  if (options.auth) {
    options.beforeSend = function(xhr) {
      var token = btoa(options.auth.username + ":" + options.auth.password);
      xhr.setRequestHeader("Authorization", "Basic " + token);
    }
  }
  return $.ajax(options);
};

// Implements the PouchDB API for dealing with CouchDB instances over HTTP
var HttpPouch = function(opts, callback) {

  // Parse the URI given by opts.name into an easy-to-use object
  var host = getHost(opts.name);
  
  // Generate the database URL based on the host
  var db_url = genUrl(host, '');
  
  // The functions that will be publically available for HttpPouch
  var api = {};

  // Create a new CouchDB database based on the given opts
  ajax({auth: host.auth, type: 'PUT', url: db_url}, function(err, ret) {
    // If we get an "Unauthorized" error
    if (err && err.status === 401) {
      // Test if the database already exists
      ajax({auth: host.auth, type: 'HEAD', url: db_url}, function (err, ret) {
        // If there is still an error
        if (err) {
          // Give the error to the callback to deal with
          call(callback, err);
        } else {
          // Continue as if there had been no errors
          call(callback, null, api);
        }
      });
    // If there were no errros or if the only error is "Precondition Failed"
    // (note: "Precondition Failed" occurs when we try to create a database
    // that already exists)
    } else if (!err || err.status === 412) {
      // Continue as if there had been no errors
      call(callback, null, api);
    } else {
      call(callback, Pouch.Errors.UNKNOWN_ERROR);
    }
  });

  // The HttpPouch's ID is its URL
  api.id = function() {
    return genUrl(host, '');
  };

  // Calls GET on the host, which gets back a JSON string containing
  //    couchdb: A welcome string
  //    version: The version of CouchDB it is running
  api.info = function(callback) {
    ajax({
      auth: host.auth,
      type:'GET',
      url: genUrl(host, ''),
    }, callback);
  };

  // Get the document with the given id from the database given by host.
  // The id could be solely the _id in the database, or it may be a 
  // _design/ID or _local/ID path
  api.get = function(id, opts, callback) {
    // If no options were given, set the callback to the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    
    // List of parameters to add to the GET request
    var params = [];
    
    // If it exists, add the opts.revs value to the list of parameters.
    // If revs=true then the resulting JSON will include a field
    // _revisions containing an array of the revision IDs.
    if (opts.revs) {
      params.push('revs=true');
    }
    
    // If it exists, add the opts.revs_info value to the list of parameters.
    // If revs_info=true then the resulting JSON will include the field
    // _revs_info containing an array of objects in which each object 
    // representing an available revision.
    if (opts.revs_info) {
      params.push('revs_info=true');
    }
    
    // If it exists, add the opts.attachments value to the list of parameters.
    // If attachments=true the resulting JSON will include the base64-encoded
    // contents in the "data" property of each attachment.
    if (opts.attachments) {
      params.push('attachments=true');
    }
    
    // If it exists, add the opts.rev value to the list of parameters.
    // If rev is given a revision number then get the specified revision.
    if (opts.rev) {
      params.push('rev=' + opts.rev);
    }
    
    // If it exists, add the opts.conflicts value to the list of parameters.
    // If conflicts=true then the resulting JSON will include the field
    // _conflicts containing all the conflicting revisions.
    if (opts.conflicts) {
      params.push('conflicts=' + opts.conflicts);
    }
    
    // Format the list of parameters into a valid URI query string
    params = params.join('&');
    params = params === '' ? '' : '?' + params;

    // Set the options for the ajax call
    var options = {
      auth: host.auth,
      type: 'GET',
      url: genUrl(host, id + params)
    };

    // If the given id contains at least one '/' and the part before the '/'
    // is NOT "_design" and is NOT "_local"
    // OR 
    // If the given id contains at least two '/' and the part before the first
    // '/' is "_design".
    // TODO This second condition seems strange since if parts[0] === '_design' 
    // then we already know that parts[0] !== '_local'.
    var parts = id.split('/');
    if ((parts.length > 1 && parts[0] !== '_design' && parts[0] !== '_local') ||
        (parts.length > 2 && parts[0] === '_design' && parts[0] !== '_local')) {
      // Nothing is expected back from the server
      options.dataType = false;
    }

    // Get the document
    ajax(options, function(err, doc, xhr) {
      // If the document does not exist, send an error to the callback
      if (err) {
        return call(callback, Pouch.Errors.MISSING_DOC);
      }
      
      // Send the document to the callback
      call(callback, null, doc, xhr);
    });
  };

  // Get the view given by fun of the database given by host.
  // fun is formatted in two parts separated by a '/'; the first
  // part is the design and the second is the view.
  api.query = function(fun, opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    
    // List of parameters to add to the PUT request
    var params = [];
    
    // If opts.reduce exists and is defined, then add it to the list
    // of parameters.
    // If reduce=false then the results are that of only the map function
    // not the final result of map and reduce.
    if (typeof opts.reduce !== 'undefined') {
      params.push('reduce=' + opts.reduce);
    }
    
    // Format the list of parameters into a valid URI query string
    params = params.join('&');
    params = params === '' ? '' : '?' + params;

    var parts = fun.split('/');
    ajax({
      auth: host.auth,
      type:'GET',
      url: genUrl(host, '_design/' + parts[0] + '/_view/' + parts[1] + params),
    }, callback);
  };

  // Delete the document given by doc from the database given by host.
  api.remove = function(doc, opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    
    // Delete the document
    ajax({
      auth: host.auth,
      type:'DELETE',
      url: genUrl(host, doc._id) + '?rev=' + doc._rev
    }, callback);
  };

  // Add the attachment given by doc and the content type given by type
  // to the document with the given id, the revision given by rev, and
  // add it to the database given by host.
  api.putAttachment = function(id, rev, doc, type, callback) {
    // Add the attachment
    ajax({
      auth: host.auth,
      type:'PUT',
      url: genUrl(host, id) + '?rev=' + rev,
      headers: {'Content-Type': type},
      data: doc
    }, callback);
  };

  // Add the document given by doc (in JSON string format) to the database
  // given by host. This assumes that doc has a _id field.
  api.put = function(doc, opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }

    // List of parameter to add to the PUT request
    var params = [];
    
    // If it exists, add the opts.new_edits value to the list of parameters.
    // If new_edits = false then the database will NOT assign this document a
    // new revision number
    if (opts && typeof opts.new_edits !== 'undefined') {
      params.push('new_edits=' + opts.new_edits);
    }

    // Format the list of parameters into a valid URI query string
    params = params.join('&');
    if (params !== '') {
      params = '?' + params;
    }

    // Add the document
    ajax({
      auth: host.auth,
      type: 'PUT',
      url: genUrl(host, doc._id) + params,
      data: doc
    }, callback);
  };

  // Add the document given by doc (in JSON string format) to the database
  // given by host. This assumes that doc is a new document (i.e. does not
  // have a _id or a _rev field.
  api.post = function(doc, opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    
    // Add the document
    ajax({
      auth: host.auth,
      type: 'POST',
      url: genUrl(host, ''),
      data: doc
    }, callback);
  };

  // Update/create multiple documents given by req in the database
  // given by host.
  api.bulkDocs = function(req, opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    
    // If opts.new_edits exists add it to the document data to be
    // send to the database.
    // If new_edits=false then it prevents the database from creating
    // new revision numbers for the documents. Instead it just uses
    // the old ones. This is used in database replication.
    if (typeof opts.new_edits !== 'undefined') {
      req.new_edits = opts.new_edits;
    }
    
    // Update/create the documents
    ajax({
      auth: host.auth,
      type:'POST',
      url: genUrl(host, '_bulk_docs'),
      data: req
    }, callback);
  };

  // Get a listing of the documents in the database given
  // by host and ordered by increasing id.
  api.allDocs = function(opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    
    // List of parameters to add to the GET request
    var params = [];
    
    // TODO I don't see conflicts as a valid parameter for a
    // _all_docs request (see http://wiki.apache.org/couchdb/HTTP_Document_API#all_docs)
    if (opts.conflicts) {
      params.push('conflicts=true');
    }
    
    // If opts.include_docs exists, add the include_docs value to the
    // list of parameters.
    // If include_docs=true then include the associated document with each
    // result.
    if (opts.include_docs) {
      params.push('include_docs=true');
    }
    
    // If opts.startkey exists, add the startkey value to the list of
    // parameters.
    // If startkey is given then the returned list of documents will
    // start with the document whose id is startkey.
    if (opts.startkey) {
      params.push('startkey=' +
                  encodeURIComponent(JSON.stringify(opts.startkey)));
    }
    
    // If opts.endkey exists, add the endkey value to the list of parameters.
    // If endkey is given then the returned list of docuemnts will
    // end with the document whose id is endkey.
    if (opts.endkey) {
      params.push('endkey=' + encodeURIComponent(JSON.stringify(opts.endkey)));
    }

    // Format the list of parameters into a valid URI query string
    params = params.join('&');
    if (params !== '') {
      params = '?' + params;
    }

    // Get the document listing
    ajax({
      auth: host.auth,
      type:'GET',
      url: genUrl(host, '_all_docs' + params)
    }, callback);
  };

  // Get a list of changes made to documents in the database given by host.
  // TODO According to the README, there should be two other methods here,
  // api.changes.addListener and api.changes.removeListener.
  api.changes = function(opts, callback) {
    // If no options were given, set the callback to the first parameter
    if (opts instanceof Function) {
      opts = {complete: opts};
    }
    
    // If a callback was provided outside of opts, then it is the one that
    // will be called upon completion
    if (callback) {
      opts.complete = callback;
    }

    console.info(db_url + ': Start Changes Feed: continuous=' + opts.continuous);

    // Query string of all the parameters to add to the GET request
    var params = '?style=all_docs'
    
    // If opts.include_docs exists, opts.filter exists, and opts.filter is a
    // function, add the include_docs value to the query string.
    // If include_docs=true then include the associated document with each
    // result.
    if (opts.include_docs || opts.filter && typeof opts.filter === 'function') {
      params += '&include_docs=true'
    }
    
    // If opts.continuous exists, add the feed value to the query string.
    // If feed=longpoll then it waits for either a timeout or a change to 
    // occur before returning.
    if (opts.continuous) {
      params += '&feed=longpoll';
    }
    
    // If opts.conflicts exists, add the conflicts value to the query string.
    // TODO I can't find documentation of what conflicts=true does. See
    // http://wiki.apache.org/couchdb/HTTP_database_API#Changes
    if (opts.conflicts) {
      params += '&conflicts=true';
    }
    
    // If opts.descending exists, add the descending value to the query string.
    // if descending=true then the change results are returned in 
    // descending order (most recent change first).
    if (opts.descending) {
      params += '&descending=true';
    }
    
    // If opts.filter exists and is a string then add the filter value
    // to the query string.
    // If filter is given a string containing the name of a filter in
    // the design, then only documents passing through the filter will
    // be returned.
    if (opts.filter && typeof opts.filter === 'string') {
      params += '&filter=' + opts.filter;
    }

    var xhr;

    // Get all the changes starting wtih the one immediately after the
    // sequence number given by since.
    var fetch = function(since, callback) {
      // Set the options for the ajax call
      var xhrOpts = {
        auth: host.auth, type:'GET',
        url: genUrl(host, '_changes' + params + '&since=' + since)
      };
      
      if (opts.aborted) {
        return;
      }

      // Get the changes
      xhr = ajax(xhrOpts, function(err, res) {
        callback(res);
      });
    }

    // If opts.since exists, get all the changes from the sequence
    // number given by opts.since. Otherwise, get all the changes
    // from the sequence number 0.
    var fetched = function(res) {
      // If the result of the ajax call (res) contains changes (res.results)
      if (res && res.results) {
        // For each change
        res.results.forEach(function(c) {
          var hasFilter = opts.filter && typeof opts.filter === 'function';
          if (opts.aborted || hasFilter && !opts.filter.apply(this, [c.doc])) {
            return;
          }
          
          // Process the change
          call(opts.onChange, c);
        });
      }
      if (res && opts.continuous) {
        // Call fetch again with the newest sequence number
        fetch(res.last_seq, fetched);
      } else {
        // We're done, call the callback
        call(opts.complete, null, res);
      }
    }

    fetch(opts.since || 0, fetched);

    // Return a method to cancel this method from processing any more
    return {
      cancel: function() {
        console.info(db_url + ': Cancel Changes Feed');
        opts.aborted = true;
        xhr.abort();
      }
    };
  };

  // Given a set of document/revision IDs (given by req), tets the subset of 
  // those that do NOT correspond to revisions stored in the database.
  // See http://wiki.apache.org/couchdb/HttpPostRevsDiff
  api.revsDiff = function(req, opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    
    // Get the missing document/revision IDs
    ajax({
      auth: host.auth,
      type:'POST',
      url: genUrl(host, '_revs_diff'),
      data: req
    }, function(err, res) {
      call(callback, null, res);
    });
  };

  api.replicate = {};

  // Replicate from the database given by url to this HttpPouch
  api.replicate.from = function(url, opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    return Pouch.replicate(url, api, opts, callback);
  };

  // Replicate to the database given by dbName from this HttpPouch
  api.replicate.to = function(dbName, opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    return Pouch.replicate(api, dbName, opts, callback);
  };


  return api;
};

// Delete the HttpPouch specified by the given name.
HttpPouch.destroy = function(name, callback) {
  var host = getHost(name);
  ajax({auth: host.auth, type: 'DELETE', url: genUrl(host, '')}, callback);
};

// HttpPouch is a valid adapter.
HttpPouch.valid = function() {
  return true;
}

// Set HttpPouch to be the adapter used with the http scheme.
Pouch.adapter('http', HttpPouch);
// Set HttpPouch to be the adapter used with the https scheme.
Pouch.adapter('https', HttpPouch);
// While most of the IDB behaviors match between implementations a
// lot of the names still differ. This section tries to normalize the
// different objects & methods.
window.indexedDB = window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB;

window.IDBCursor = window.IDBCursor ||
  window.webkitIDBCursor;

window.IDBKeyRange = window.IDBKeyRange ||
  window.webkitIDBKeyRange;

window.IDBTransaction = window.IDBTransaction ||
  window.webkitIDBTransaction;

window.IDBDatabaseException = window.IDBDatabaseException ||
  window.webkitIDBDatabaseException;

// Newer webkits expect strings for transaction + cursor paramters
// older webkit + older firefox require constants, we can drop
// the constants when both stable releases use strings
IDBTransaction = IDBTransaction || {};
IDBTransaction.READ_WRITE = IDBTransaction.READ_WRITE || 'readwrite';
IDBTransaction.READ = IDBTransaction.READ || 'readonly';

IDBCursor = IDBCursor || {};
IDBCursor.NEXT = IDBCursor.NEXT || 'next';
IDBCursor.PREV = IDBCursor.PREV || 'prev';

var idbError = function(callback) {
  return function(event) {
    var code = event.target.errorCode;
    call(callback, {
      status: 500,
      error: event.type,
      reason: Object.keys(IDBDatabaseException)[code-1].toLowerCase()
    });
  }
};

var IdbPouch = function(opts, callback) {

  // IndexedDB requires a versioned database structure, this is going to make
  // it hard to dynamically create object stores if we needed to for things
  // like views
  var POUCH_VERSION = 1;

  // The object stores created for each database
  // DOC_STORE stores the document meta data, its revision history and state
  var DOC_STORE = 'document-store';
  // BY_SEQ_STORE stores a particular version of a document, keyed by its
  // sequence id
  var BY_SEQ_STORE = 'by-sequence';
  // Where we store attachments
  var ATTACH_STORE = 'attach-store';

  var name = opts.name;
  var req = indexedDB.open(name, POUCH_VERSION);
  var update_seq = 0;

  var api = {};
  var idb;

  console.info(name + ': Open Database');

  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    db.createObjectStore(DOC_STORE, {keyPath : 'id'})
      .createIndex('seq', 'seq', {unique : true});
    db.createObjectStore(BY_SEQ_STORE, {autoIncrement : true});
    db.createObjectStore(ATTACH_STORE, {keyPath: 'digest'});
  };

  req.onsuccess = function(e) {

    idb = e.target.result;

    idb.onversionchange = function() {
      idb.close();
    };

    // polyfill the new onupgradeneeded api for chrome. can get rid of when
    // http://code.google.com/p/chromium/issues/detail?id=108223 lands
    if (idb.setVersion && Number(idb.version) !== POUCH_VERSION) {
      var versionReq = idb.setVersion(POUCH_VERSION);
      versionReq.onsuccess = function(evt) {
        function setVersionComplete() {
          req.onsuccess(e);
        }
        evt.target.result.oncomplete = setVersionComplete;
        req.onupgradeneeded(e);
      };
      return;
    }

    // TODO: This is a really inneficient way of finding the last
    // update sequence, cant think of an alterative right now
    api.changes(function(err, changes) {
      if (changes.results.length) {
        update_seq = changes.results[changes.results.length - 1].seq;
      }
      call(callback, null, api);
    });

  };

  req.onerror = idbError(callback);

  // Each database needs a unique id so that we can store the sequence
  // checkpoint without having other databases confuse itself, since
  // localstorage is per host this shouldnt conflict, if localstorage
  // gets wiped it isnt fatal, replications will just start from scratch
  api.id = function idb_id() {
    var id = localJSON.get(name + '_id', null);
    if (id === null) {
      id = Math.uuid();
      localJSON.set(name + '_id', id);
    }
    return id;
  };

  api.bulkDocs = function idb_bulkDocs(req, opts, callback) {

    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    if (!opts) {
      opts = {}
    }

    if (!req.docs) {
      return call(callback, Pouch.Errors.MISSING_BULK_DOCS);
    }

    var newEdits = 'new_edits' in opts ? opts.new_edits : true;
    var userDocs = JSON.parse(JSON.stringify(req.docs));

    // Parse the docs, give them a sequence number for the result
    var docInfos = userDocs.map(function(doc, i) {
      var newDoc = parseDoc(doc, newEdits);
      newDoc._bulk_seq = i;
      return newDoc;
    });

    var results = [];
    var docs = [];

    docInfos.forEach(function(docInfo) {
      if (docInfo.error) {
        return results.push(docInfo);
      }
      if (!docs.length || docInfo.metadata.id !== docs[0].metadata.id) {
        return docs.unshift(docInfo);
      }
      // We mark subsequent bulk docs with a duplicate id as conflicts
      results.push(makeErr(Pouch.Errors.REV_CONFLICT, docInfo._bulk_seq));
    });

    if (!docs.length) {
      return txnComplete();
    }

    docs.sort(function(a, b) {
      return Pouch.collate(a.metadata.id, b.metadata.id);
    });

    var txn = idb.transaction([DOC_STORE, BY_SEQ_STORE, ATTACH_STORE],
                              IDBTransaction.READ_WRITE);
    txn.onerror = idbError(callback);
    txn.ontimeout = idbError(callback);
    txn.oncomplete = txnComplete;

    var keyRange = IDBKeyRange.bound(
      docs[0].metadata.id, docs[docs.length-1].metadata.id,
      false, false);

    txn.objectStore(DOC_STORE)
      .openCursor(keyRange, IDBCursor.NEXT).onsuccess = readDoc;

    function readDoc(event) {
      var cursor = event.target.result;
      // Cursor has exceeded the key range so the rest are inserts
      if (!cursor) {
        return docs.forEach(insertDoc);
      }
      var doc = docs.shift();
      if (cursor.key === doc.metadata.id) {
        updateDoc(cursor, cursor.value, doc);
      } else {
        insertDoc(doc);
      }
    }

    function txnComplete(event) {
      var aresults = [];
      results.sort(sortByBulkSeq);
      results.forEach(function(result) {
        delete result._bulk_seq;
        if (result.error) {
          aresults.push(result);
          return;
        }
        var metadata = result.metadata;
        var rev = winningRev(metadata.rev_tree[0].pos, metadata.rev_tree[0].ids);
        aresults.push({
          ok: true,
          id: metadata.id,
          rev: rev,
        });

        if (/_local/.test(metadata.id)) {
          return;
        }

        var change = {
          id: metadata.id,
          seq: metadata.seq,
          changes: collectLeaves(metadata.rev_tree),
          doc: result.data
        };
        change.doc._rev = rev;
        update_seq++;
        IdbPouch.Changes.emitChange(name, change);
      });
      call(callback, null, aresults);
    }

    function writeDoc(docInfo, callback) {

      for (var key in docInfo.data._attachments) {
        if (!docInfo.data._attachments[key].stub) {
          var data = docInfo.data._attachments[key].data;
          var digest = 'md5-' + Crypto.MD5(data);
          delete docInfo.data._attachments[key].data;
          docInfo.data._attachments[key].digest = digest;
          saveAttachment(digest, data);
        }
      }

      docInfo.data._id = docInfo.metadata.id;
      if (docInfo.metadata.deleted) {
        docInfo.data._deleted = true;
      }
      var dataReq = txn.objectStore(BY_SEQ_STORE).put(docInfo.data);
      dataReq.onsuccess = function(e) {
        console.info(name + ': Wrote Document ', docInfo.metadata.id);
        docInfo.metadata.seq = e.target.result;
        // Current _rev is calculated from _rev_tree on read
        delete docInfo.metadata.rev;
        var metaDataReq = txn.objectStore(DOC_STORE).put(docInfo.metadata);
        metaDataReq.onsuccess = function() {
          results.push(docInfo);
          call(callback);
        };
      };
    }

    function updateDoc(cursor, oldDoc, docInfo) {
      var merged = Pouch.merge(oldDoc.rev_tree,
                               docInfo.metadata.rev_tree[0], 1000);
      var inConflict = (oldDoc.deleted && docInfo.metadata.deleted) ||
        (!oldDoc.deleted && newEdits && merged.conflicts !== 'new_leaf');

      if (inConflict) {
        results.push(makeErr(Pouch.Errors.REV_CONFLICT, docInfo._bulk_seq));
        return cursor['continue']();
      }

      docInfo.metadata.rev_tree = merged.tree;

      writeDoc(docInfo, function() {
        cursor['continue']();
      });
    }

    function insertDoc(docInfo) {
      // Cant insert new deleted documents
      if (docInfo.metadata.deleted) {
        return results.push(Pouch.Errors.MISSING_DOC);
      }
      writeDoc(docInfo);
    }

    // Insert sequence number into the error so we can sort later
    function makeErr(err, seq) {
      err._bulk_seq = seq;
      return err;
    }

    // right now fire and forget, needs cleaned
    function saveAttachment(digest, data) {
      txn.objectStore(ATTACH_STORE).put({digest: digest, body: data});
    }
  };

  function sortByBulkSeq(a, b) {
    return a._bulk_seq - b._bulk_seq;
  }

  // First we look up the metadata in the ids database, then we fetch the
  // current revision(s) from the by sequence store
  api.get = function idb_get(id, opts, callback) {

    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }

    var txn = idb.transaction([DOC_STORE, BY_SEQ_STORE, ATTACH_STORE],
                              IDBTransaction.READ);

    if (/\//.test(id) && !/^_local/.test(id) && !/^_design/.test(id)) {
      var docId = id.split('/')[0];
      var attachId = id.split('/')[1];
      txn.objectStore(DOC_STORE).get(docId).onsuccess = function(e) {
        var metadata = e.target.result;
        var bySeq = txn.objectStore(BY_SEQ_STORE);
        bySeq.get(metadata.seq).onsuccess = function(e) {
          var digest = e.target.result._attachments[attachId].digest;
          txn.objectStore(ATTACH_STORE).get(digest).onsuccess = function(e) {
            call(callback, null, atob(e.target.result.body));
          };
        };
      }
      return;
    }

    txn.objectStore(DOC_STORE).get(id).onsuccess = function(e) {
      var metadata = e.target.result;
      if (!e.target.result || metadata.deleted) {
        return call(callback, Pouch.Errors.MISSING_DOC);
      }

      txn.objectStore(BY_SEQ_STORE).get(metadata.seq).onsuccess = function(e) {
        var doc = e.target.result;
        doc._id = metadata.id;
        doc._rev = winningRev(metadata.rev_tree[0].pos, metadata.rev_tree[0].ids);
        if (opts.revs) {
          var path = arrayFirst(rootToLeaf(metadata.rev_tree), function(arr) {
            return arr.ids.indexOf(doc._rev.split('-')[1]) !== -1;
          });
          path.ids.reverse();
          doc._revisions = {
            start: (path.pos + path.ids.length) - 1,
            ids: path.ids
          };
        }
        if (opts.revs_info) {
          doc._revs_info = metadata.rev_tree.reduce(function(prev, current) {
            return prev.concat(collectRevs(current));
          }, []);
        }
        if (opts.conflicts) {
          var conflicts = collectConflicts(metadata.rev_tree);
          if (conflicts.length) {
            doc._conflicts = conflicts;
          }
        }

        if (opts.attachments && doc._attachments) {
          var attachments = Object.keys(doc._attachments);
          var recv = 0;

          attachments.forEach(function(key) {
            api.get(doc._id + '/' + key, function(err, data) {
              doc._attachments[key].data = btoa(data);
              if (++recv === attachments.length) {
                callback(null, doc);
              }
            });
          });
        } else {
          callback(null, doc);
        }
      };
    };
  };

  api.put = api.post = function idb_put(doc, opts, callback) {
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    return api.bulkDocs({docs: [doc]}, opts, yankError(callback));
  };


  api.remove = function idb_remove(doc, opts, callback) {
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    var newDoc = JSON.parse(JSON.stringify(doc));
    newDoc._deleted = true;
    return api.bulkDocs({docs: [newDoc]}, opts, yankError(callback));
  };


  api.allDocs = function idb_allDocs(opts, callback) {
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }

    var start = 'startkey' in opts ? opts.startkey : false;
    var end = 'endkey' in opts ? opts.endkey : false;

    var descending = 'descending' in opts ? opts.descending : false;
    descending = descending ? IDBCursor.PREV : null;

    var keyRange = start && end ? IDBKeyRange.bound(start, end, false, false)
      : start ? IDBKeyRange.lowerBound(start, true)
      : end ? IDBKeyRange.upperBound(end) : false;
    var transaction = idb.transaction([DOC_STORE, BY_SEQ_STORE],
                                      IDBTransaction.READ);
    keyRange = keyRange || null;
    var oStore = transaction.objectStore(DOC_STORE);
    var oCursor = descending ? oStore.openCursor(keyRange, descending)
      : oStore.openCursor(keyRange);
    var results = [];
    oCursor.onsuccess = function(e) {
      if (!e.target.result) {
        return callback(null, {
          total_rows: results.length,
          rows: results
        });
      }
      var cursor = e.target.result;
      function allDocsInner(metadata, data) {
        if (/_local/.test(metadata.id)) {
          return cursor['continue']();
        }
        if (metadata.deleted !== true) {
          var doc = {
            id: metadata.id,
            key: metadata.id,
            value: {
              rev: winningRev(metadata.rev_tree[0].pos,
                              metadata.rev_tree[0].ids)
            }
          };
          if (opts.include_docs) {
            doc.doc = data;
            doc.doc._rev = winningRev(metadata.rev_tree[0].pos,
                                      metadata.rev_tree[0].ids);
            if (opts.conflicts) {
              doc.doc._conflicts = collectConflicts(metadata.rev_tree);
            }
          }
          results.push(doc);
        }
        cursor['continue']();
      }

      if (!opts.include_docs) {
        allDocsInner(cursor.value);
      } else {
        var index = transaction.objectStore(BY_SEQ_STORE);
        index.get(cursor.value.seq).onsuccess = function(event) {
          allDocsInner(cursor.value, event.target.result);
        };
      }
    }
  };

  // Looping through all the documents in the database is a terrible idea
  // easiest to implement though, should probably keep a counter
  api.info = function idb_info(callback) {
    var count = 0;
    idb.transaction([DOC_STORE], IDBTransaction.READ)
      .objectStore(DOC_STORE).openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if (!cursor) {
          return callback(null, {
            db_name: name,
            doc_count: count,
            update_seq: update_seq
          });
        }
        if (cursor.value.deleted !== true) {
          count++;
        }
        cursor['continue']();
      };
  };

  api.putAttachment = function idb_putAttachment(id, rev, doc, type, callback) {
    var docId = id.split('/')[0];
    var attachId = id.split('/')[1];
    api.get(docId, {attachments: true}, function(err, obj) {
      obj._attachments || (obj._attachments = {});
      obj._attachments[attachId] = {
        content_type: type,
        data: btoa(doc)
      }
      api.put(obj, callback);
    });
  };


  api.revsDiff = function idb_revsDiff(req, opts, callback) {
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    var ids = Object.keys(req);
    var count = 0;
    var missing = {};

    function readDoc(err, doc, id) {
      req[id].map(function(revId) {
        var matches = function(x) { return x.rev !== revId; };
        if (!doc || doc._revs_info.every(matches)) {
          if (!missing[id]) {
            missing[id] = {missing: []};
          }
          missing[id].missing.push(revId);
        }
      });

      if (++count === ids.length) {
        return call(callback, null, missing);
      }
    }

    ids.map(function(id) {
      api.get(id, {revs_info: true}, function(err, doc) {
        readDoc(err, doc, id);
      });
    });
  };

  api.changes = function idb_changes(opts, callback) {

    if (opts instanceof Function) {
      opts = {complete: opts};
    }
    if (callback) {
      opts.complete = callback;
    }
    if (!opts.seq) {
      opts.seq = 0;
    }
    if (opts.since) {
      opts.seq = opts.since;
    }

    console.info(name + ': Start Changes Feed: continuous=' + opts.continuous);

    var descending = 'descending' in opts ? opts.descending : false;
    descending = descending ? IDBCursor.PREV : null;

    var results = [];
    var id = name + ':' + Math.uuid();
    var txn;

    if (opts.filter && typeof opts.filter === 'string') {
      var filterName = opts.filter.split('/');
      api.get('_design/' + filterName[0], function(err, ddoc) {
        var filter = eval('(function() { return ' +
                          ddoc.filters[filterName[1]] + ' })()');
        opts.filter = filter;
        fetchChanges();
      });
    } else {
      fetchChanges();
    }

    function fetchChanges() {
      txn = idb.transaction([DOC_STORE, BY_SEQ_STORE]);
      var req = descending
        ? txn.objectStore(BY_SEQ_STORE)
          .openCursor(IDBKeyRange.lowerBound(opts.seq, true), descending)
        : txn.objectStore(BY_SEQ_STORE)
          .openCursor(IDBKeyRange.lowerBound(opts.seq, true));
      req.onsuccess = onsuccess;
      req.onerror = onerror;
    }

    function onsuccess(event) {
      if (!event.target.result) {
        if (opts.continuous && !opts.cancelled) {
          IdbPouch.Changes.addListener(name, id, opts);
        }
        results.map(function(c) {
          if (opts.filter && !opts.filter.apply(this, [c.doc])) {
            return;
          }
          if (!opts.include_docs) {
            delete c.doc;
          }
          call(opts.onChange, c);
        });
        return call(opts.complete, null, {results: results});
      }
      var cursor = event.target.result;
      var index = txn.objectStore(DOC_STORE);
      index.get(cursor.value._id).onsuccess = function(event) {
        var metadata = event.target.result;
        if (/_local/.test(metadata.id)) {
          return cursor['continue']();
        }

        var change = {
          id: metadata.id,
          seq: cursor.key,
          changes: collectLeaves(metadata.rev_tree),
          doc: cursor.value,
        };

        change.doc._rev = winningRev(metadata.rev_tree[0].pos,
                                     metadata.rev_tree[0].ids);

        if (metadata.deleted) {
          change.deleted = true;
        }
        if (opts.conflicts) {
          change.doc._conflicts = collectConflicts(metadata.rev_tree);
        }

        // Dedupe the changes feed
        results = results.filter(function(doc) {
          return doc.id !== change.id;
        });
        results.push(change);
        cursor['continue']();
      };
    };

    function onerror(error) {
      if (opts.continuous) {
        IdbPouch.Changes.addListener(name, id, opts);
      }
      call(opts.complete);
    };

    if (opts.continuous) {
      return {
        cancel: function() {
          console.info(name + ': Cancel Changes Feed');
          opts.cancelled = true;
          IdbPouch.Changes.removeListener(name, id);
        }
      }
    }
  };

  api.replicate = {};

  api.replicate.from = function idb_replicate_from(url, opts, callback) {
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    return Pouch.replicate(url, api, opts, callback);
  };

  api.replicate.to = function idb_replicate_to(dbName, opts, callback) {
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    return Pouch.replicate(api, dbName, opts, callback);
  };

  api.query = function idb_query(fun, opts, callback) {
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    if (callback) {
      opts.complete = callback;
    }

    if (typeof fun === 'string') {
      var parts = fun.split('/');
      api.get('_design/' + parts[0], function(err, doc) {
        if (err) {
          call(callback, err);
        }
        new viewQuery({
          map: doc.views[parts[1]].map,
          reduce: doc.views[parts[1]].reduce
        }, idb, opts);
      });
    } else {
      new viewQuery(fun, idb, opts);
    }
  }

  // Wrapper for functions that call the bulkdocs api with a single doc,
  // if the first result is an error, return an error
  var yankError = function(callback) {
    return function(err, results) {
      if (err || results[0].error) {
        call(callback, err || results[0]);
      } else {
        call(callback, null, results[0]);
      }
    };
  };

  var viewQuery = function(fun, idb, options) {

    if (!options.complete) {
      return;
    }

    function sum(values) {
      return values.reduce(function(a, b) { return a + b; }, 0);
    }

    var txn = idb.transaction([DOC_STORE, BY_SEQ_STORE], IDBTransaction.READ);
    var objectStore = txn.objectStore(DOC_STORE);
    var results = [];
    var current;

    var emit = function(key, val) {
      var viewRow = {
        id: current._id,
        key: key,
        value: val
      }
      if (options.include_docs) {
        viewRow.doc = current.doc;
      }
      results.push(viewRow);
    };

    // We may have passed in an anonymous function that used emit in
    // the global scope, this is an ugly way to rescope it
    eval('fun.map = ' + fun.map.toString() + ';');
    if (fun.reduce) {
      eval('fun.reduce = ' + fun.reduce.toString() + ';');
    }

    var request = objectStore.openCursor();
    request.onerror = idbError(options.error);
    request.onsuccess = fetchMetadata;

    function viewComplete() {
      results.sort(function(a, b) {
        return Pouch.collate(a.key, b.key);
      });
      if (options.descending) {
        results.reverse();
      }
      if (options.reduce === false) {
        return options.complete(null, {rows: results});
      }

      var groups = [];
      results.forEach(function(e) {
        var last = groups[groups.length-1] || null;
        if (last && Pouch.collate(last.key[0][0], e.key) === 0) {
          last.key.push([e.key, e.id]);
          last.value.push(e.value);
          return;
        }
        groups.push({ key: [ [e.key,e.id] ], value: [ e.value ]});
      });

      groups.forEach(function(e) {
        e.value = fun.reduce(e.key, e.value) || null;
        e.key = e.key[0][0];
      });
      options.complete(null, {rows: groups});
    }

    function fetchDocData(cursor, metadata, e) {
      current = {doc: e.target.result, metadata: metadata};
      current.doc._rev = winningRev(current.metadata.rev_tree[0].pos,
                                    current.metadata.rev_tree[0].ids);

      if (options.complete && !current.metadata.deleted) {
        fun.map.apply(this, [current.doc]);
      }
      cursor['continue']();
    }

    function fetchMetadata(e) {
      var cursor = e.target.result;
      if (!cursor) {
        return viewComplete();
      }
      var metadata = e.target.result.value;
      var dataReq = txn.objectStore(BY_SEQ_STORE).get(metadata.seq);
      dataReq.onsuccess = fetchDocData.bind(this, cursor, metadata);
      dataReq.onerror = idbError(options.complete);
    }
  }

  // Trees are sorted by length, winning revision is the last revision
  // in the longest tree
  function winningRev(pos, tree) {
    if (!tree[1].length) {
      return pos + '-' + tree[0];
    }
    return winningRev(pos + 1, tree[1][0]);
  }


  return api;
};

IdbPouch.valid = function idb_valid() {
  return !!window.indexedDB;
};

IdbPouch.destroy = function idb_destroy(name, callback) {

  console.info(name + ': Delete Database');
  IdbPouch.Changes.clearListeners(name);
  var req = indexedDB.deleteDatabase(name);

  req.onsuccess = function() {
    call(callback, null);
  };

  req.onerror = idbError(callback);
};

IdbPouch.Changes = (function() {

  var api = {};
  var listeners = {};

  api.addListener = function(db, id, opts) {
    if (!listeners[db]) {
      listeners[db] = {};
    }
    listeners[db][id] = opts;
  }

  api.removeListener = function(db, id) {
    delete listeners[db][id];
  }

  api.clearListeners = function(db) {
    delete listeners[db];
  }

  api.emitChange = function(db, change) {
    if (!listeners[db]) {
      return;
    }
    for (var i in listeners[db]) {
      var opts = listeners[db][i];
      if (opts.filter && !opts.filter.apply(this, [change.doc])) {
        return;
      }
      if (!opts.include_docs) {
        delete change.doc;
      }
      opts.onChange.apply(opts.onChange, [change]);
    }
  }

  return api;
})();

Pouch.adapter('idb', IdbPouch);
 })(this);
