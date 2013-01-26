
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

define("underscore", (function (global) {
    return function () {
        var ret, fn;
        return ret || global._;
    };
}(this)));

/*! jQuery v1.8.3 jquery.com | jquery.org/license */
(function(e,t){function _(e){var t=M[e]={};return v.each(e.split(y),function(e,n){t[n]=!0}),t}function H(e,n,r){if(r===t&&e.nodeType===1){var i="data-"+n.replace(P,"-$1").toLowerCase();r=e.getAttribute(i);if(typeof r=="string"){try{r=r==="true"?!0:r==="false"?!1:r==="null"?null:+r+""===r?+r:D.test(r)?v.parseJSON(r):r}catch(s){}v.data(e,n,r)}else r=t}return r}function B(e){var t;for(t in e){if(t==="data"&&v.isEmptyObject(e[t]))continue;if(t!=="toJSON")return!1}return!0}function et(){return!1}function tt(){return!0}function ut(e){return!e||!e.parentNode||e.parentNode.nodeType===11}function at(e,t){do e=e[t];while(e&&e.nodeType!==1);return e}function ft(e,t,n){t=t||0;if(v.isFunction(t))return v.grep(e,function(e,r){var i=!!t.call(e,r,e);return i===n});if(t.nodeType)return v.grep(e,function(e,r){return e===t===n});if(typeof t=="string"){var r=v.grep(e,function(e){return e.nodeType===1});if(it.test(t))return v.filter(t,r,!n);t=v.filter(t,r)}return v.grep(e,function(e,r){return v.inArray(e,t)>=0===n})}function lt(e){var t=ct.split("|"),n=e.createDocumentFragment();if(n.createElement)while(t.length)n.createElement(t.pop());return n}function Lt(e,t){return e.getElementsByTagName(t)[0]||e.appendChild(e.ownerDocument.createElement(t))}function At(e,t){if(t.nodeType!==1||!v.hasData(e))return;var n,r,i,s=v._data(e),o=v._data(t,s),u=s.events;if(u){delete o.handle,o.events={};for(n in u)for(r=0,i=u[n].length;r<i;r++)v.event.add(t,n,u[n][r])}o.data&&(o.data=v.extend({},o.data))}function Ot(e,t){var n;if(t.nodeType!==1)return;t.clearAttributes&&t.clearAttributes(),t.mergeAttributes&&t.mergeAttributes(e),n=t.nodeName.toLowerCase(),n==="object"?(t.parentNode&&(t.outerHTML=e.outerHTML),v.support.html5Clone&&e.innerHTML&&!v.trim(t.innerHTML)&&(t.innerHTML=e.innerHTML)):n==="input"&&Et.test(e.type)?(t.defaultChecked=t.checked=e.checked,t.value!==e.value&&(t.value=e.value)):n==="option"?t.selected=e.defaultSelected:n==="input"||n==="textarea"?t.defaultValue=e.defaultValue:n==="script"&&t.text!==e.text&&(t.text=e.text),t.removeAttribute(v.expando)}function Mt(e){return typeof e.getElementsByTagName!="undefined"?e.getElementsByTagName("*"):typeof e.querySelectorAll!="undefined"?e.querySelectorAll("*"):[]}function _t(e){Et.test(e.type)&&(e.defaultChecked=e.checked)}function Qt(e,t){if(t in e)return t;var n=t.charAt(0).toUpperCase()+t.slice(1),r=t,i=Jt.length;while(i--){t=Jt[i]+n;if(t in e)return t}return r}function Gt(e,t){return e=t||e,v.css(e,"display")==="none"||!v.contains(e.ownerDocument,e)}function Yt(e,t){var n,r,i=[],s=0,o=e.length;for(;s<o;s++){n=e[s];if(!n.style)continue;i[s]=v._data(n,"olddisplay"),t?(!i[s]&&n.style.display==="none"&&(n.style.display=""),n.style.display===""&&Gt(n)&&(i[s]=v._data(n,"olddisplay",nn(n.nodeName)))):(r=Dt(n,"display"),!i[s]&&r!=="none"&&v._data(n,"olddisplay",r))}for(s=0;s<o;s++){n=e[s];if(!n.style)continue;if(!t||n.style.display==="none"||n.style.display==="")n.style.display=t?i[s]||"":"none"}return e}function Zt(e,t,n){var r=Rt.exec(t);return r?Math.max(0,r[1]-(n||0))+(r[2]||"px"):t}function en(e,t,n,r){var i=n===(r?"border":"content")?4:t==="width"?1:0,s=0;for(;i<4;i+=2)n==="margin"&&(s+=v.css(e,n+$t[i],!0)),r?(n==="content"&&(s-=parseFloat(Dt(e,"padding"+$t[i]))||0),n!=="margin"&&(s-=parseFloat(Dt(e,"border"+$t[i]+"Width"))||0)):(s+=parseFloat(Dt(e,"padding"+$t[i]))||0,n!=="padding"&&(s+=parseFloat(Dt(e,"border"+$t[i]+"Width"))||0));return s}function tn(e,t,n){var r=t==="width"?e.offsetWidth:e.offsetHeight,i=!0,s=v.support.boxSizing&&v.css(e,"boxSizing")==="border-box";if(r<=0||r==null){r=Dt(e,t);if(r<0||r==null)r=e.style[t];if(Ut.test(r))return r;i=s&&(v.support.boxSizingReliable||r===e.style[t]),r=parseFloat(r)||0}return r+en(e,t,n||(s?"border":"content"),i)+"px"}function nn(e){if(Wt[e])return Wt[e];var t=v("<"+e+">").appendTo(i.body),n=t.css("display");t.remove();if(n==="none"||n===""){Pt=i.body.appendChild(Pt||v.extend(i.createElement("iframe"),{frameBorder:0,width:0,height:0}));if(!Ht||!Pt.createElement)Ht=(Pt.contentWindow||Pt.contentDocument).document,Ht.write("<!doctype html><html><body>"),Ht.close();t=Ht.body.appendChild(Ht.createElement(e)),n=Dt(t,"display"),i.body.removeChild(Pt)}return Wt[e]=n,n}function fn(e,t,n,r){var i;if(v.isArray(t))v.each(t,function(t,i){n||sn.test(e)?r(e,i):fn(e+"["+(typeof i=="object"?t:"")+"]",i,n,r)});else if(!n&&v.type(t)==="object")for(i in t)fn(e+"["+i+"]",t[i],n,r);else r(e,t)}function Cn(e){return function(t,n){typeof t!="string"&&(n=t,t="*");var r,i,s,o=t.toLowerCase().split(y),u=0,a=o.length;if(v.isFunction(n))for(;u<a;u++)r=o[u],s=/^\+/.test(r),s&&(r=r.substr(1)||"*"),i=e[r]=e[r]||[],i[s?"unshift":"push"](n)}}function kn(e,n,r,i,s,o){s=s||n.dataTypes[0],o=o||{},o[s]=!0;var u,a=e[s],f=0,l=a?a.length:0,c=e===Sn;for(;f<l&&(c||!u);f++)u=a[f](n,r,i),typeof u=="string"&&(!c||o[u]?u=t:(n.dataTypes.unshift(u),u=kn(e,n,r,i,u,o)));return(c||!u)&&!o["*"]&&(u=kn(e,n,r,i,"*",o)),u}function Ln(e,n){var r,i,s=v.ajaxSettings.flatOptions||{};for(r in n)n[r]!==t&&((s[r]?e:i||(i={}))[r]=n[r]);i&&v.extend(!0,e,i)}function An(e,n,r){var i,s,o,u,a=e.contents,f=e.dataTypes,l=e.responseFields;for(s in l)s in r&&(n[l[s]]=r[s]);while(f[0]==="*")f.shift(),i===t&&(i=e.mimeType||n.getResponseHeader("content-type"));if(i)for(s in a)if(a[s]&&a[s].test(i)){f.unshift(s);break}if(f[0]in r)o=f[0];else{for(s in r){if(!f[0]||e.converters[s+" "+f[0]]){o=s;break}u||(u=s)}o=o||u}if(o)return o!==f[0]&&f.unshift(o),r[o]}function On(e,t){var n,r,i,s,o=e.dataTypes.slice(),u=o[0],a={},f=0;e.dataFilter&&(t=e.dataFilter(t,e.dataType));if(o[1])for(n in e.converters)a[n.toLowerCase()]=e.converters[n];for(;i=o[++f];)if(i!=="*"){if(u!=="*"&&u!==i){n=a[u+" "+i]||a["* "+i];if(!n)for(r in a){s=r.split(" ");if(s[1]===i){n=a[u+" "+s[0]]||a["* "+s[0]];if(n){n===!0?n=a[r]:a[r]!==!0&&(i=s[0],o.splice(f--,0,i));break}}}if(n!==!0)if(n&&e["throws"])t=n(t);else try{t=n(t)}catch(l){return{state:"parsererror",error:n?l:"No conversion from "+u+" to "+i}}}u=i}return{state:"success",data:t}}function Fn(){try{return new e.XMLHttpRequest}catch(t){}}function In(){try{return new e.ActiveXObject("Microsoft.XMLHTTP")}catch(t){}}function $n(){return setTimeout(function(){qn=t},0),qn=v.now()}function Jn(e,t){v.each(t,function(t,n){var r=(Vn[t]||[]).concat(Vn["*"]),i=0,s=r.length;for(;i<s;i++)if(r[i].call(e,t,n))return})}function Kn(e,t,n){var r,i=0,s=0,o=Xn.length,u=v.Deferred().always(function(){delete a.elem}),a=function(){var t=qn||$n(),n=Math.max(0,f.startTime+f.duration-t),r=n/f.duration||0,i=1-r,s=0,o=f.tweens.length;for(;s<o;s++)f.tweens[s].run(i);return u.notifyWith(e,[f,i,n]),i<1&&o?n:(u.resolveWith(e,[f]),!1)},f=u.promise({elem:e,props:v.extend({},t),opts:v.extend(!0,{specialEasing:{}},n),originalProperties:t,originalOptions:n,startTime:qn||$n(),duration:n.duration,tweens:[],createTween:function(t,n,r){var i=v.Tween(e,f.opts,t,n,f.opts.specialEasing[t]||f.opts.easing);return f.tweens.push(i),i},stop:function(t){var n=0,r=t?f.tweens.length:0;for(;n<r;n++)f.tweens[n].run(1);return t?u.resolveWith(e,[f,t]):u.rejectWith(e,[f,t]),this}}),l=f.props;Qn(l,f.opts.specialEasing);for(;i<o;i++){r=Xn[i].call(f,e,l,f.opts);if(r)return r}return Jn(f,l),v.isFunction(f.opts.start)&&f.opts.start.call(e,f),v.fx.timer(v.extend(a,{anim:f,queue:f.opts.queue,elem:e})),f.progress(f.opts.progress).done(f.opts.done,f.opts.complete).fail(f.opts.fail).always(f.opts.always)}function Qn(e,t){var n,r,i,s,o;for(n in e){r=v.camelCase(n),i=t[r],s=e[n],v.isArray(s)&&(i=s[1],s=e[n]=s[0]),n!==r&&(e[r]=s,delete e[n]),o=v.cssHooks[r];if(o&&"expand"in o){s=o.expand(s),delete e[r];for(n in s)n in e||(e[n]=s[n],t[n]=i)}else t[r]=i}}function Gn(e,t,n){var r,i,s,o,u,a,f,l,c,h=this,p=e.style,d={},m=[],g=e.nodeType&&Gt(e);n.queue||(l=v._queueHooks(e,"fx"),l.unqueued==null&&(l.unqueued=0,c=l.empty.fire,l.empty.fire=function(){l.unqueued||c()}),l.unqueued++,h.always(function(){h.always(function(){l.unqueued--,v.queue(e,"fx").length||l.empty.fire()})})),e.nodeType===1&&("height"in t||"width"in t)&&(n.overflow=[p.overflow,p.overflowX,p.overflowY],v.css(e,"display")==="inline"&&v.css(e,"float")==="none"&&(!v.support.inlineBlockNeedsLayout||nn(e.nodeName)==="inline"?p.display="inline-block":p.zoom=1)),n.overflow&&(p.overflow="hidden",v.support.shrinkWrapBlocks||h.done(function(){p.overflow=n.overflow[0],p.overflowX=n.overflow[1],p.overflowY=n.overflow[2]}));for(r in t){s=t[r];if(Un.exec(s)){delete t[r],a=a||s==="toggle";if(s===(g?"hide":"show"))continue;m.push(r)}}o=m.length;if(o){u=v._data(e,"fxshow")||v._data(e,"fxshow",{}),"hidden"in u&&(g=u.hidden),a&&(u.hidden=!g),g?v(e).show():h.done(function(){v(e).hide()}),h.done(function(){var t;v.removeData(e,"fxshow",!0);for(t in d)v.style(e,t,d[t])});for(r=0;r<o;r++)i=m[r],f=h.createTween(i,g?u[i]:0),d[i]=u[i]||v.style(e,i),i in u||(u[i]=f.start,g&&(f.end=f.start,f.start=i==="width"||i==="height"?1:0))}}function Yn(e,t,n,r,i){return new Yn.prototype.init(e,t,n,r,i)}function Zn(e,t){var n,r={height:e},i=0;t=t?1:0;for(;i<4;i+=2-t)n=$t[i],r["margin"+n]=r["padding"+n]=e;return t&&(r.opacity=r.width=e),r}function tr(e){return v.isWindow(e)?e:e.nodeType===9?e.defaultView||e.parentWindow:!1}var n,r,i=e.document,s=e.location,o=e.navigator,u=e.jQuery,a=e.$,f=Array.prototype.push,l=Array.prototype.slice,c=Array.prototype.indexOf,h=Object.prototype.toString,p=Object.prototype.hasOwnProperty,d=String.prototype.trim,v=function(e,t){return new v.fn.init(e,t,n)},m=/[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,g=/\S/,y=/\s+/,b=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,w=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,E=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,S=/^[\],:{}\s]*$/,x=/(?:^|:|,)(?:\s*\[)+/g,T=/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,N=/"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,C=/^-ms-/,k=/-([\da-z])/gi,L=function(e,t){return(t+"").toUpperCase()},A=function(){i.addEventListener?(i.removeEventListener("DOMContentLoaded",A,!1),v.ready()):i.readyState==="complete"&&(i.detachEvent("onreadystatechange",A),v.ready())},O={};v.fn=v.prototype={constructor:v,init:function(e,n,r){var s,o,u,a;if(!e)return this;if(e.nodeType)return this.context=this[0]=e,this.length=1,this;if(typeof e=="string"){e.charAt(0)==="<"&&e.charAt(e.length-1)===">"&&e.length>=3?s=[null,e,null]:s=w.exec(e);if(s&&(s[1]||!n)){if(s[1])return n=n instanceof v?n[0]:n,a=n&&n.nodeType?n.ownerDocument||n:i,e=v.parseHTML(s[1],a,!0),E.test(s[1])&&v.isPlainObject(n)&&this.attr.call(e,n,!0),v.merge(this,e);o=i.getElementById(s[2]);if(o&&o.parentNode){if(o.id!==s[2])return r.find(e);this.length=1,this[0]=o}return this.context=i,this.selector=e,this}return!n||n.jquery?(n||r).find(e):this.constructor(n).find(e)}return v.isFunction(e)?r.ready(e):(e.selector!==t&&(this.selector=e.selector,this.context=e.context),v.makeArray(e,this))},selector:"",jquery:"1.8.3",length:0,size:function(){return this.length},toArray:function(){return l.call(this)},get:function(e){return e==null?this.toArray():e<0?this[this.length+e]:this[e]},pushStack:function(e,t,n){var r=v.merge(this.constructor(),e);return r.prevObject=this,r.context=this.context,t==="find"?r.selector=this.selector+(this.selector?" ":"")+n:t&&(r.selector=this.selector+"."+t+"("+n+")"),r},each:function(e,t){return v.each(this,e,t)},ready:function(e){return v.ready.promise().done(e),this},eq:function(e){return e=+e,e===-1?this.slice(e):this.slice(e,e+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(l.apply(this,arguments),"slice",l.call(arguments).join(","))},map:function(e){return this.pushStack(v.map(this,function(t,n){return e.call(t,n,t)}))},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:[].sort,splice:[].splice},v.fn.init.prototype=v.fn,v.extend=v.fn.extend=function(){var e,n,r,i,s,o,u=arguments[0]||{},a=1,f=arguments.length,l=!1;typeof u=="boolean"&&(l=u,u=arguments[1]||{},a=2),typeof u!="object"&&!v.isFunction(u)&&(u={}),f===a&&(u=this,--a);for(;a<f;a++)if((e=arguments[a])!=null)for(n in e){r=u[n],i=e[n];if(u===i)continue;l&&i&&(v.isPlainObject(i)||(s=v.isArray(i)))?(s?(s=!1,o=r&&v.isArray(r)?r:[]):o=r&&v.isPlainObject(r)?r:{},u[n]=v.extend(l,o,i)):i!==t&&(u[n]=i)}return u},v.extend({noConflict:function(t){return e.$===v&&(e.$=a),t&&e.jQuery===v&&(e.jQuery=u),v},isReady:!1,readyWait:1,holdReady:function(e){e?v.readyWait++:v.ready(!0)},ready:function(e){if(e===!0?--v.readyWait:v.isReady)return;if(!i.body)return setTimeout(v.ready,1);v.isReady=!0;if(e!==!0&&--v.readyWait>0)return;r.resolveWith(i,[v]),v.fn.trigger&&v(i).trigger("ready").off("ready")},isFunction:function(e){return v.type(e)==="function"},isArray:Array.isArray||function(e){return v.type(e)==="array"},isWindow:function(e){return e!=null&&e==e.window},isNumeric:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},type:function(e){return e==null?String(e):O[h.call(e)]||"object"},isPlainObject:function(e){if(!e||v.type(e)!=="object"||e.nodeType||v.isWindow(e))return!1;try{if(e.constructor&&!p.call(e,"constructor")&&!p.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(n){return!1}var r;for(r in e);return r===t||p.call(e,r)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},error:function(e){throw new Error(e)},parseHTML:function(e,t,n){var r;return!e||typeof e!="string"?null:(typeof t=="boolean"&&(n=t,t=0),t=t||i,(r=E.exec(e))?[t.createElement(r[1])]:(r=v.buildFragment([e],t,n?null:[]),v.merge([],(r.cacheable?v.clone(r.fragment):r.fragment).childNodes)))},parseJSON:function(t){if(!t||typeof t!="string")return null;t=v.trim(t);if(e.JSON&&e.JSON.parse)return e.JSON.parse(t);if(S.test(t.replace(T,"@").replace(N,"]").replace(x,"")))return(new Function("return "+t))();v.error("Invalid JSON: "+t)},parseXML:function(n){var r,i;if(!n||typeof n!="string")return null;try{e.DOMParser?(i=new DOMParser,r=i.parseFromString(n,"text/xml")):(r=new ActiveXObject("Microsoft.XMLDOM"),r.async="false",r.loadXML(n))}catch(s){r=t}return(!r||!r.documentElement||r.getElementsByTagName("parsererror").length)&&v.error("Invalid XML: "+n),r},noop:function(){},globalEval:function(t){t&&g.test(t)&&(e.execScript||function(t){e.eval.call(e,t)})(t)},camelCase:function(e){return e.replace(C,"ms-").replace(k,L)},nodeName:function(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()},each:function(e,n,r){var i,s=0,o=e.length,u=o===t||v.isFunction(e);if(r){if(u){for(i in e)if(n.apply(e[i],r)===!1)break}else for(;s<o;)if(n.apply(e[s++],r)===!1)break}else if(u){for(i in e)if(n.call(e[i],i,e[i])===!1)break}else for(;s<o;)if(n.call(e[s],s,e[s++])===!1)break;return e},trim:d&&!d.call("\ufeff\u00a0")?function(e){return e==null?"":d.call(e)}:function(e){return e==null?"":(e+"").replace(b,"")},makeArray:function(e,t){var n,r=t||[];return e!=null&&(n=v.type(e),e.length==null||n==="string"||n==="function"||n==="regexp"||v.isWindow(e)?f.call(r,e):v.merge(r,e)),r},inArray:function(e,t,n){var r;if(t){if(c)return c.call(t,e,n);r=t.length,n=n?n<0?Math.max(0,r+n):n:0;for(;n<r;n++)if(n in t&&t[n]===e)return n}return-1},merge:function(e,n){var r=n.length,i=e.length,s=0;if(typeof r=="number")for(;s<r;s++)e[i++]=n[s];else while(n[s]!==t)e[i++]=n[s++];return e.length=i,e},grep:function(e,t,n){var r,i=[],s=0,o=e.length;n=!!n;for(;s<o;s++)r=!!t(e[s],s),n!==r&&i.push(e[s]);return i},map:function(e,n,r){var i,s,o=[],u=0,a=e.length,f=e instanceof v||a!==t&&typeof a=="number"&&(a>0&&e[0]&&e[a-1]||a===0||v.isArray(e));if(f)for(;u<a;u++)i=n(e[u],u,r),i!=null&&(o[o.length]=i);else for(s in e)i=n(e[s],s,r),i!=null&&(o[o.length]=i);return o.concat.apply([],o)},guid:1,proxy:function(e,n){var r,i,s;return typeof n=="string"&&(r=e[n],n=e,e=r),v.isFunction(e)?(i=l.call(arguments,2),s=function(){return e.apply(n,i.concat(l.call(arguments)))},s.guid=e.guid=e.guid||v.guid++,s):t},access:function(e,n,r,i,s,o,u){var a,f=r==null,l=0,c=e.length;if(r&&typeof r=="object"){for(l in r)v.access(e,n,l,r[l],1,o,i);s=1}else if(i!==t){a=u===t&&v.isFunction(i),f&&(a?(a=n,n=function(e,t,n){return a.call(v(e),n)}):(n.call(e,i),n=null));if(n)for(;l<c;l++)n(e[l],r,a?i.call(e[l],l,n(e[l],r)):i,u);s=1}return s?e:f?n.call(e):c?n(e[0],r):o},now:function(){return(new Date).getTime()}}),v.ready.promise=function(t){if(!r){r=v.Deferred();if(i.readyState==="complete")setTimeout(v.ready,1);else if(i.addEventListener)i.addEventListener("DOMContentLoaded",A,!1),e.addEventListener("load",v.ready,!1);else{i.attachEvent("onreadystatechange",A),e.attachEvent("onload",v.ready);var n=!1;try{n=e.frameElement==null&&i.documentElement}catch(s){}n&&n.doScroll&&function o(){if(!v.isReady){try{n.doScroll("left")}catch(e){return setTimeout(o,50)}v.ready()}}()}}return r.promise(t)},v.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(e,t){O["[object "+t+"]"]=t.toLowerCase()}),n=v(i);var M={};v.Callbacks=function(e){e=typeof e=="string"?M[e]||_(e):v.extend({},e);var n,r,i,s,o,u,a=[],f=!e.once&&[],l=function(t){n=e.memory&&t,r=!0,u=s||0,s=0,o=a.length,i=!0;for(;a&&u<o;u++)if(a[u].apply(t[0],t[1])===!1&&e.stopOnFalse){n=!1;break}i=!1,a&&(f?f.length&&l(f.shift()):n?a=[]:c.disable())},c={add:function(){if(a){var t=a.length;(function r(t){v.each(t,function(t,n){var i=v.type(n);i==="function"?(!e.unique||!c.has(n))&&a.push(n):n&&n.length&&i!=="string"&&r(n)})})(arguments),i?o=a.length:n&&(s=t,l(n))}return this},remove:function(){return a&&v.each(arguments,function(e,t){var n;while((n=v.inArray(t,a,n))>-1)a.splice(n,1),i&&(n<=o&&o--,n<=u&&u--)}),this},has:function(e){return v.inArray(e,a)>-1},empty:function(){return a=[],this},disable:function(){return a=f=n=t,this},disabled:function(){return!a},lock:function(){return f=t,n||c.disable(),this},locked:function(){return!f},fireWith:function(e,t){return t=t||[],t=[e,t.slice?t.slice():t],a&&(!r||f)&&(i?f.push(t):l(t)),this},fire:function(){return c.fireWith(this,arguments),this},fired:function(){return!!r}};return c},v.extend({Deferred:function(e){var t=[["resolve","done",v.Callbacks("once memory"),"resolved"],["reject","fail",v.Callbacks("once memory"),"rejected"],["notify","progress",v.Callbacks("memory")]],n="pending",r={state:function(){return n},always:function(){return i.done(arguments).fail(arguments),this},then:function(){var e=arguments;return v.Deferred(function(n){v.each(t,function(t,r){var s=r[0],o=e[t];i[r[1]](v.isFunction(o)?function(){var e=o.apply(this,arguments);e&&v.isFunction(e.promise)?e.promise().done(n.resolve).fail(n.reject).progress(n.notify):n[s+"With"](this===i?n:this,[e])}:n[s])}),e=null}).promise()},promise:function(e){return e!=null?v.extend(e,r):r}},i={};return r.pipe=r.then,v.each(t,function(e,s){var o=s[2],u=s[3];r[s[1]]=o.add,u&&o.add(function(){n=u},t[e^1][2].disable,t[2][2].lock),i[s[0]]=o.fire,i[s[0]+"With"]=o.fireWith}),r.promise(i),e&&e.call(i,i),i},when:function(e){var t=0,n=l.call(arguments),r=n.length,i=r!==1||e&&v.isFunction(e.promise)?r:0,s=i===1?e:v.Deferred(),o=function(e,t,n){return function(r){t[e]=this,n[e]=arguments.length>1?l.call(arguments):r,n===u?s.notifyWith(t,n):--i||s.resolveWith(t,n)}},u,a,f;if(r>1){u=new Array(r),a=new Array(r),f=new Array(r);for(;t<r;t++)n[t]&&v.isFunction(n[t].promise)?n[t].promise().done(o(t,f,n)).fail(s.reject).progress(o(t,a,u)):--i}return i||s.resolveWith(f,n),s.promise()}}),v.support=function(){var t,n,r,s,o,u,a,f,l,c,h,p=i.createElement("div");p.setAttribute("className","t"),p.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",n=p.getElementsByTagName("*"),r=p.getElementsByTagName("a")[0];if(!n||!r||!n.length)return{};s=i.createElement("select"),o=s.appendChild(i.createElement("option")),u=p.getElementsByTagName("input")[0],r.style.cssText="top:1px;float:left;opacity:.5",t={leadingWhitespace:p.firstChild.nodeType===3,tbody:!p.getElementsByTagName("tbody").length,htmlSerialize:!!p.getElementsByTagName("link").length,style:/top/.test(r.getAttribute("style")),hrefNormalized:r.getAttribute("href")==="/a",opacity:/^0.5/.test(r.style.opacity),cssFloat:!!r.style.cssFloat,checkOn:u.value==="on",optSelected:o.selected,getSetAttribute:p.className!=="t",enctype:!!i.createElement("form").enctype,html5Clone:i.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",boxModel:i.compatMode==="CSS1Compat",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,boxSizingReliable:!0,pixelPosition:!1},u.checked=!0,t.noCloneChecked=u.cloneNode(!0).checked,s.disabled=!0,t.optDisabled=!o.disabled;try{delete p.test}catch(d){t.deleteExpando=!1}!p.addEventListener&&p.attachEvent&&p.fireEvent&&(p.attachEvent("onclick",h=function(){t.noCloneEvent=!1}),p.cloneNode(!0).fireEvent("onclick"),p.detachEvent("onclick",h)),u=i.createElement("input"),u.value="t",u.setAttribute("type","radio"),t.radioValue=u.value==="t",u.setAttribute("checked","checked"),u.setAttribute("name","t"),p.appendChild(u),a=i.createDocumentFragment(),a.appendChild(p.lastChild),t.checkClone=a.cloneNode(!0).cloneNode(!0).lastChild.checked,t.appendChecked=u.checked,a.removeChild(u),a.appendChild(p);if(p.attachEvent)for(l in{submit:!0,change:!0,focusin:!0})f="on"+l,c=f in p,c||(p.setAttribute(f,"return;"),c=typeof p[f]=="function"),t[l+"Bubbles"]=c;return v(function(){var n,r,s,o,u="padding:0;margin:0;border:0;display:block;overflow:hidden;",a=i.getElementsByTagName("body")[0];if(!a)return;n=i.createElement("div"),n.style.cssText="visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px",a.insertBefore(n,a.firstChild),r=i.createElement("div"),n.appendChild(r),r.innerHTML="<table><tr><td></td><td>t</td></tr></table>",s=r.getElementsByTagName("td"),s[0].style.cssText="padding:0;margin:0;border:0;display:none",c=s[0].offsetHeight===0,s[0].style.display="",s[1].style.display="none",t.reliableHiddenOffsets=c&&s[0].offsetHeight===0,r.innerHTML="",r.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",t.boxSizing=r.offsetWidth===4,t.doesNotIncludeMarginInBodyOffset=a.offsetTop!==1,e.getComputedStyle&&(t.pixelPosition=(e.getComputedStyle(r,null)||{}).top!=="1%",t.boxSizingReliable=(e.getComputedStyle(r,null)||{width:"4px"}).width==="4px",o=i.createElement("div"),o.style.cssText=r.style.cssText=u,o.style.marginRight=o.style.width="0",r.style.width="1px",r.appendChild(o),t.reliableMarginRight=!parseFloat((e.getComputedStyle(o,null)||{}).marginRight)),typeof r.style.zoom!="undefined"&&(r.innerHTML="",r.style.cssText=u+"width:1px;padding:1px;display:inline;zoom:1",t.inlineBlockNeedsLayout=r.offsetWidth===3,r.style.display="block",r.style.overflow="visible",r.innerHTML="<div></div>",r.firstChild.style.width="5px",t.shrinkWrapBlocks=r.offsetWidth!==3,n.style.zoom=1),a.removeChild(n),n=r=s=o=null}),a.removeChild(p),n=r=s=o=u=a=p=null,t}();var D=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,P=/([A-Z])/g;v.extend({cache:{},deletedIds:[],uuid:0,expando:"jQuery"+(v.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(e){return e=e.nodeType?v.cache[e[v.expando]]:e[v.expando],!!e&&!B(e)},data:function(e,n,r,i){if(!v.acceptData(e))return;var s,o,u=v.expando,a=typeof n=="string",f=e.nodeType,l=f?v.cache:e,c=f?e[u]:e[u]&&u;if((!c||!l[c]||!i&&!l[c].data)&&a&&r===t)return;c||(f?e[u]=c=v.deletedIds.pop()||v.guid++:c=u),l[c]||(l[c]={},f||(l[c].toJSON=v.noop));if(typeof n=="object"||typeof n=="function")i?l[c]=v.extend(l[c],n):l[c].data=v.extend(l[c].data,n);return s=l[c],i||(s.data||(s.data={}),s=s.data),r!==t&&(s[v.camelCase(n)]=r),a?(o=s[n],o==null&&(o=s[v.camelCase(n)])):o=s,o},removeData:function(e,t,n){if(!v.acceptData(e))return;var r,i,s,o=e.nodeType,u=o?v.cache:e,a=o?e[v.expando]:v.expando;if(!u[a])return;if(t){r=n?u[a]:u[a].data;if(r){v.isArray(t)||(t in r?t=[t]:(t=v.camelCase(t),t in r?t=[t]:t=t.split(" ")));for(i=0,s=t.length;i<s;i++)delete r[t[i]];if(!(n?B:v.isEmptyObject)(r))return}}if(!n){delete u[a].data;if(!B(u[a]))return}o?v.cleanData([e],!0):v.support.deleteExpando||u!=u.window?delete u[a]:u[a]=null},_data:function(e,t,n){return v.data(e,t,n,!0)},acceptData:function(e){var t=e.nodeName&&v.noData[e.nodeName.toLowerCase()];return!t||t!==!0&&e.getAttribute("classid")===t}}),v.fn.extend({data:function(e,n){var r,i,s,o,u,a=this[0],f=0,l=null;if(e===t){if(this.length){l=v.data(a);if(a.nodeType===1&&!v._data(a,"parsedAttrs")){s=a.attributes;for(u=s.length;f<u;f++)o=s[f].name,o.indexOf("data-")||(o=v.camelCase(o.substring(5)),H(a,o,l[o]));v._data(a,"parsedAttrs",!0)}}return l}return typeof e=="object"?this.each(function(){v.data(this,e)}):(r=e.split(".",2),r[1]=r[1]?"."+r[1]:"",i=r[1]+"!",v.access(this,function(n){if(n===t)return l=this.triggerHandler("getData"+i,[r[0]]),l===t&&a&&(l=v.data(a,e),l=H(a,e,l)),l===t&&r[1]?this.data(r[0]):l;r[1]=n,this.each(function(){var t=v(this);t.triggerHandler("setData"+i,r),v.data(this,e,n),t.triggerHandler("changeData"+i,r)})},null,n,arguments.length>1,null,!1))},removeData:function(e){return this.each(function(){v.removeData(this,e)})}}),v.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=v._data(e,t),n&&(!r||v.isArray(n)?r=v._data(e,t,v.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=v.queue(e,t),r=n.length,i=n.shift(),s=v._queueHooks(e,t),o=function(){v.dequeue(e,t)};i==="inprogress"&&(i=n.shift(),r--),i&&(t==="fx"&&n.unshift("inprogress"),delete s.stop,i.call(e,o,s)),!r&&s&&s.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return v._data(e,n)||v._data(e,n,{empty:v.Callbacks("once memory").add(function(){v.removeData(e,t+"queue",!0),v.removeData(e,n,!0)})})}}),v.fn.extend({queue:function(e,n){var r=2;return typeof e!="string"&&(n=e,e="fx",r--),arguments.length<r?v.queue(this[0],e):n===t?this:this.each(function(){var t=v.queue(this,e,n);v._queueHooks(this,e),e==="fx"&&t[0]!=="inprogress"&&v.dequeue(this,e)})},dequeue:function(e){return this.each(function(){v.dequeue(this,e)})},delay:function(e,t){return e=v.fx?v.fx.speeds[e]||e:e,t=t||"fx",this.queue(t,function(t,n){var r=setTimeout(t,e);n.stop=function(){clearTimeout(r)}})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,n){var r,i=1,s=v.Deferred(),o=this,u=this.length,a=function(){--i||s.resolveWith(o,[o])};typeof e!="string"&&(n=e,e=t),e=e||"fx";while(u--)r=v._data(o[u],e+"queueHooks"),r&&r.empty&&(i++,r.empty.add(a));return a(),s.promise(n)}});var j,F,I,q=/[\t\r\n]/g,R=/\r/g,U=/^(?:button|input)$/i,z=/^(?:button|input|object|select|textarea)$/i,W=/^a(?:rea|)$/i,X=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,V=v.support.getSetAttribute;v.fn.extend({attr:function(e,t){return v.access(this,v.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){v.removeAttr(this,e)})},prop:function(e,t){return v.access(this,v.prop,e,t,arguments.length>1)},removeProp:function(e){return e=v.propFix[e]||e,this.each(function(){try{this[e]=t,delete this[e]}catch(n){}})},addClass:function(e){var t,n,r,i,s,o,u;if(v.isFunction(e))return this.each(function(t){v(this).addClass(e.call(this,t,this.className))});if(e&&typeof e=="string"){t=e.split(y);for(n=0,r=this.length;n<r;n++){i=this[n];if(i.nodeType===1)if(!i.className&&t.length===1)i.className=e;else{s=" "+i.className+" ";for(o=0,u=t.length;o<u;o++)s.indexOf(" "+t[o]+" ")<0&&(s+=t[o]+" ");i.className=v.trim(s)}}}return this},removeClass:function(e){var n,r,i,s,o,u,a;if(v.isFunction(e))return this.each(function(t){v(this).removeClass(e.call(this,t,this.className))});if(e&&typeof e=="string"||e===t){n=(e||"").split(y);for(u=0,a=this.length;u<a;u++){i=this[u];if(i.nodeType===1&&i.className){r=(" "+i.className+" ").replace(q," ");for(s=0,o=n.length;s<o;s++)while(r.indexOf(" "+n[s]+" ")>=0)r=r.replace(" "+n[s]+" "," ");i.className=e?v.trim(r):""}}}return this},toggleClass:function(e,t){var n=typeof e,r=typeof t=="boolean";return v.isFunction(e)?this.each(function(n){v(this).toggleClass(e.call(this,n,this.className,t),t)}):this.each(function(){if(n==="string"){var i,s=0,o=v(this),u=t,a=e.split(y);while(i=a[s++])u=r?u:!o.hasClass(i),o[u?"addClass":"removeClass"](i)}else if(n==="undefined"||n==="boolean")this.className&&v._data(this,"__className__",this.className),this.className=this.className||e===!1?"":v._data(this,"__className__")||""})},hasClass:function(e){var t=" "+e+" ",n=0,r=this.length;for(;n<r;n++)if(this[n].nodeType===1&&(" "+this[n].className+" ").replace(q," ").indexOf(t)>=0)return!0;return!1},val:function(e){var n,r,i,s=this[0];if(!arguments.length){if(s)return n=v.valHooks[s.type]||v.valHooks[s.nodeName.toLowerCase()],n&&"get"in n&&(r=n.get(s,"value"))!==t?r:(r=s.value,typeof r=="string"?r.replace(R,""):r==null?"":r);return}return i=v.isFunction(e),this.each(function(r){var s,o=v(this);if(this.nodeType!==1)return;i?s=e.call(this,r,o.val()):s=e,s==null?s="":typeof s=="number"?s+="":v.isArray(s)&&(s=v.map(s,function(e){return e==null?"":e+""})),n=v.valHooks[this.type]||v.valHooks[this.nodeName.toLowerCase()];if(!n||!("set"in n)||n.set(this,s,"value")===t)this.value=s})}}),v.extend({valHooks:{option:{get:function(e){var t=e.attributes.value;return!t||t.specified?e.value:e.text}},select:{get:function(e){var t,n,r=e.options,i=e.selectedIndex,s=e.type==="select-one"||i<0,o=s?null:[],u=s?i+1:r.length,a=i<0?u:s?i:0;for(;a<u;a++){n=r[a];if((n.selected||a===i)&&(v.support.optDisabled?!n.disabled:n.getAttribute("disabled")===null)&&(!n.parentNode.disabled||!v.nodeName(n.parentNode,"optgroup"))){t=v(n).val();if(s)return t;o.push(t)}}return o},set:function(e,t){var n=v.makeArray(t);return v(e).find("option").each(function(){this.selected=v.inArray(v(this).val(),n)>=0}),n.length||(e.selectedIndex=-1),n}}},attrFn:{},attr:function(e,n,r,i){var s,o,u,a=e.nodeType;if(!e||a===3||a===8||a===2)return;if(i&&v.isFunction(v.fn[n]))return v(e)[n](r);if(typeof e.getAttribute=="undefined")return v.prop(e,n,r);u=a!==1||!v.isXMLDoc(e),u&&(n=n.toLowerCase(),o=v.attrHooks[n]||(X.test(n)?F:j));if(r!==t){if(r===null){v.removeAttr(e,n);return}return o&&"set"in o&&u&&(s=o.set(e,r,n))!==t?s:(e.setAttribute(n,r+""),r)}return o&&"get"in o&&u&&(s=o.get(e,n))!==null?s:(s=e.getAttribute(n),s===null?t:s)},removeAttr:function(e,t){var n,r,i,s,o=0;if(t&&e.nodeType===1){r=t.split(y);for(;o<r.length;o++)i=r[o],i&&(n=v.propFix[i]||i,s=X.test(i),s||v.attr(e,i,""),e.removeAttribute(V?i:n),s&&n in e&&(e[n]=!1))}},attrHooks:{type:{set:function(e,t){if(U.test(e.nodeName)&&e.parentNode)v.error("type property can't be changed");else if(!v.support.radioValue&&t==="radio"&&v.nodeName(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}},value:{get:function(e,t){return j&&v.nodeName(e,"button")?j.get(e,t):t in e?e.value:null},set:function(e,t,n){if(j&&v.nodeName(e,"button"))return j.set(e,t,n);e.value=t}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(e,n,r){var i,s,o,u=e.nodeType;if(!e||u===3||u===8||u===2)return;return o=u!==1||!v.isXMLDoc(e),o&&(n=v.propFix[n]||n,s=v.propHooks[n]),r!==t?s&&"set"in s&&(i=s.set(e,r,n))!==t?i:e[n]=r:s&&"get"in s&&(i=s.get(e,n))!==null?i:e[n]},propHooks:{tabIndex:{get:function(e){var n=e.getAttributeNode("tabindex");return n&&n.specified?parseInt(n.value,10):z.test(e.nodeName)||W.test(e.nodeName)&&e.href?0:t}}}}),F={get:function(e,n){var r,i=v.prop(e,n);return i===!0||typeof i!="boolean"&&(r=e.getAttributeNode(n))&&r.nodeValue!==!1?n.toLowerCase():t},set:function(e,t,n){var r;return t===!1?v.removeAttr(e,n):(r=v.propFix[n]||n,r in e&&(e[r]=!0),e.setAttribute(n,n.toLowerCase())),n}},V||(I={name:!0,id:!0,coords:!0},j=v.valHooks.button={get:function(e,n){var r;return r=e.getAttributeNode(n),r&&(I[n]?r.value!=="":r.specified)?r.value:t},set:function(e,t,n){var r=e.getAttributeNode(n);return r||(r=i.createAttribute(n),e.setAttributeNode(r)),r.value=t+""}},v.each(["width","height"],function(e,t){v.attrHooks[t]=v.extend(v.attrHooks[t],{set:function(e,n){if(n==="")return e.setAttribute(t,"auto"),n}})}),v.attrHooks.contenteditable={get:j.get,set:function(e,t,n){t===""&&(t="false"),j.set(e,t,n)}}),v.support.hrefNormalized||v.each(["href","src","width","height"],function(e,n){v.attrHooks[n]=v.extend(v.attrHooks[n],{get:function(e){var r=e.getAttribute(n,2);return r===null?t:r}})}),v.support.style||(v.attrHooks.style={get:function(e){return e.style.cssText.toLowerCase()||t},set:function(e,t){return e.style.cssText=t+""}}),v.support.optSelected||(v.propHooks.selected=v.extend(v.propHooks.selected,{get:function(e){var t=e.parentNode;return t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex),null}})),v.support.enctype||(v.propFix.enctype="encoding"),v.support.checkOn||v.each(["radio","checkbox"],function(){v.valHooks[this]={get:function(e){return e.getAttribute("value")===null?"on":e.value}}}),v.each(["radio","checkbox"],function(){v.valHooks[this]=v.extend(v.valHooks[this],{set:function(e,t){if(v.isArray(t))return e.checked=v.inArray(v(e).val(),t)>=0}})});var $=/^(?:textarea|input|select)$/i,J=/^([^\.]*|)(?:\.(.+)|)$/,K=/(?:^|\s)hover(\.\S+|)\b/,Q=/^key/,G=/^(?:mouse|contextmenu)|click/,Y=/^(?:focusinfocus|focusoutblur)$/,Z=function(e){return v.event.special.hover?e:e.replace(K,"mouseenter$1 mouseleave$1")};v.event={add:function(e,n,r,i,s){var o,u,a,f,l,c,h,p,d,m,g;if(e.nodeType===3||e.nodeType===8||!n||!r||!(o=v._data(e)))return;r.handler&&(d=r,r=d.handler,s=d.selector),r.guid||(r.guid=v.guid++),a=o.events,a||(o.events=a={}),u=o.handle,u||(o.handle=u=function(e){return typeof v=="undefined"||!!e&&v.event.triggered===e.type?t:v.event.dispatch.apply(u.elem,arguments)},u.elem=e),n=v.trim(Z(n)).split(" ");for(f=0;f<n.length;f++){l=J.exec(n[f])||[],c=l[1],h=(l[2]||"").split(".").sort(),g=v.event.special[c]||{},c=(s?g.delegateType:g.bindType)||c,g=v.event.special[c]||{},p=v.extend({type:c,origType:l[1],data:i,handler:r,guid:r.guid,selector:s,needsContext:s&&v.expr.match.needsContext.test(s),namespace:h.join(".")},d),m=a[c];if(!m){m=a[c]=[],m.delegateCount=0;if(!g.setup||g.setup.call(e,i,h,u)===!1)e.addEventListener?e.addEventListener(c,u,!1):e.attachEvent&&e.attachEvent("on"+c,u)}g.add&&(g.add.call(e,p),p.handler.guid||(p.handler.guid=r.guid)),s?m.splice(m.delegateCount++,0,p):m.push(p),v.event.global[c]=!0}e=null},global:{},remove:function(e,t,n,r,i){var s,o,u,a,f,l,c,h,p,d,m,g=v.hasData(e)&&v._data(e);if(!g||!(h=g.events))return;t=v.trim(Z(t||"")).split(" ");for(s=0;s<t.length;s++){o=J.exec(t[s])||[],u=a=o[1],f=o[2];if(!u){for(u in h)v.event.remove(e,u+t[s],n,r,!0);continue}p=v.event.special[u]||{},u=(r?p.delegateType:p.bindType)||u,d=h[u]||[],l=d.length,f=f?new RegExp("(^|\\.)"+f.split(".").sort().join("\\.(?:.*\\.|)")+"(\\.|$)"):null;for(c=0;c<d.length;c++)m=d[c],(i||a===m.origType)&&(!n||n.guid===m.guid)&&(!f||f.test(m.namespace))&&(!r||r===m.selector||r==="**"&&m.selector)&&(d.splice(c--,1),m.selector&&d.delegateCount--,p.remove&&p.remove.call(e,m));d.length===0&&l!==d.length&&((!p.teardown||p.teardown.call(e,f,g.handle)===!1)&&v.removeEvent(e,u,g.handle),delete h[u])}v.isEmptyObject(h)&&(delete g.handle,v.removeData(e,"events",!0))},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(n,r,s,o){if(!s||s.nodeType!==3&&s.nodeType!==8){var u,a,f,l,c,h,p,d,m,g,y=n.type||n,b=[];if(Y.test(y+v.event.triggered))return;y.indexOf("!")>=0&&(y=y.slice(0,-1),a=!0),y.indexOf(".")>=0&&(b=y.split("."),y=b.shift(),b.sort());if((!s||v.event.customEvent[y])&&!v.event.global[y])return;n=typeof n=="object"?n[v.expando]?n:new v.Event(y,n):new v.Event(y),n.type=y,n.isTrigger=!0,n.exclusive=a,n.namespace=b.join("."),n.namespace_re=n.namespace?new RegExp("(^|\\.)"+b.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,h=y.indexOf(":")<0?"on"+y:"";if(!s){u=v.cache;for(f in u)u[f].events&&u[f].events[y]&&v.event.trigger(n,r,u[f].handle.elem,!0);return}n.result=t,n.target||(n.target=s),r=r!=null?v.makeArray(r):[],r.unshift(n),p=v.event.special[y]||{};if(p.trigger&&p.trigger.apply(s,r)===!1)return;m=[[s,p.bindType||y]];if(!o&&!p.noBubble&&!v.isWindow(s)){g=p.delegateType||y,l=Y.test(g+y)?s:s.parentNode;for(c=s;l;l=l.parentNode)m.push([l,g]),c=l;c===(s.ownerDocument||i)&&m.push([c.defaultView||c.parentWindow||e,g])}for(f=0;f<m.length&&!n.isPropagationStopped();f++)l=m[f][0],n.type=m[f][1],d=(v._data(l,"events")||{})[n.type]&&v._data(l,"handle"),d&&d.apply(l,r),d=h&&l[h],d&&v.acceptData(l)&&d.apply&&d.apply(l,r)===!1&&n.preventDefault();return n.type=y,!o&&!n.isDefaultPrevented()&&(!p._default||p._default.apply(s.ownerDocument,r)===!1)&&(y!=="click"||!v.nodeName(s,"a"))&&v.acceptData(s)&&h&&s[y]&&(y!=="focus"&&y!=="blur"||n.target.offsetWidth!==0)&&!v.isWindow(s)&&(c=s[h],c&&(s[h]=null),v.event.triggered=y,s[y](),v.event.triggered=t,c&&(s[h]=c)),n.result}return},dispatch:function(n){n=v.event.fix(n||e.event);var r,i,s,o,u,a,f,c,h,p,d=(v._data(this,"events")||{})[n.type]||[],m=d.delegateCount,g=l.call(arguments),y=!n.exclusive&&!n.namespace,b=v.event.special[n.type]||{},w=[];g[0]=n,n.delegateTarget=this;if(b.preDispatch&&b.preDispatch.call(this,n)===!1)return;if(m&&(!n.button||n.type!=="click"))for(s=n.target;s!=this;s=s.parentNode||this)if(s.disabled!==!0||n.type!=="click"){u={},f=[];for(r=0;r<m;r++)c=d[r],h=c.selector,u[h]===t&&(u[h]=c.needsContext?v(h,this).index(s)>=0:v.find(h,this,null,[s]).length),u[h]&&f.push(c);f.length&&w.push({elem:s,matches:f})}d.length>m&&w.push({elem:this,matches:d.slice(m)});for(r=0;r<w.length&&!n.isPropagationStopped();r++){a=w[r],n.currentTarget=a.elem;for(i=0;i<a.matches.length&&!n.isImmediatePropagationStopped();i++){c=a.matches[i];if(y||!n.namespace&&!c.namespace||n.namespace_re&&n.namespace_re.test(c.namespace))n.data=c.data,n.handleObj=c,o=((v.event.special[c.origType]||{}).handle||c.handler).apply(a.elem,g),o!==t&&(n.result=o,o===!1&&(n.preventDefault(),n.stopPropagation()))}}return b.postDispatch&&b.postDispatch.call(this,n),n.result},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(e,t){return e.which==null&&(e.which=t.charCode!=null?t.charCode:t.keyCode),e}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(e,n){var r,s,o,u=n.button,a=n.fromElement;return e.pageX==null&&n.clientX!=null&&(r=e.target.ownerDocument||i,s=r.documentElement,o=r.body,e.pageX=n.clientX+(s&&s.scrollLeft||o&&o.scrollLeft||0)-(s&&s.clientLeft||o&&o.clientLeft||0),e.pageY=n.clientY+(s&&s.scrollTop||o&&o.scrollTop||0)-(s&&s.clientTop||o&&o.clientTop||0)),!e.relatedTarget&&a&&(e.relatedTarget=a===e.target?n.toElement:a),!e.which&&u!==t&&(e.which=u&1?1:u&2?3:u&4?2:0),e}},fix:function(e){if(e[v.expando])return e;var t,n,r=e,s=v.event.fixHooks[e.type]||{},o=s.props?this.props.concat(s.props):this.props;e=v.Event(r);for(t=o.length;t;)n=o[--t],e[n]=r[n];return e.target||(e.target=r.srcElement||i),e.target.nodeType===3&&(e.target=e.target.parentNode),e.metaKey=!!e.metaKey,s.filter?s.filter(e,r):e},special:{load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(e,t,n){v.isWindow(this)&&(this.onbeforeunload=n)},teardown:function(e,t){this.onbeforeunload===t&&(this.onbeforeunload=null)}}},simulate:function(e,t,n,r){var i=v.extend(new v.Event,n,{type:e,isSimulated:!0,originalEvent:{}});r?v.event.trigger(i,null,t):v.event.dispatch.call(t,i),i.isDefaultPrevented()&&n.preventDefault()}},v.event.handle=v.event.dispatch,v.removeEvent=i.removeEventListener?function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n,!1)}:function(e,t,n){var r="on"+t;e.detachEvent&&(typeof e[r]=="undefined"&&(e[r]=null),e.detachEvent(r,n))},v.Event=function(e,t){if(!(this instanceof v.Event))return new v.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.returnValue===!1||e.getPreventDefault&&e.getPreventDefault()?tt:et):this.type=e,t&&v.extend(this,t),this.timeStamp=e&&e.timeStamp||v.now(),this[v.expando]=!0},v.Event.prototype={preventDefault:function(){this.isDefaultPrevented=tt;var e=this.originalEvent;if(!e)return;e.preventDefault?e.preventDefault():e.returnValue=!1},stopPropagation:function(){this.isPropagationStopped=tt;var e=this.originalEvent;if(!e)return;e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=tt,this.stopPropagation()},isDefaultPrevented:et,isPropagationStopped:et,isImmediatePropagationStopped:et},v.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(e,t){v.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,s=e.handleObj,o=s.selector;if(!i||i!==r&&!v.contains(r,i))e.type=s.origType,n=s.handler.apply(this,arguments),e.type=t;return n}}}),v.support.submitBubbles||(v.event.special.submit={setup:function(){if(v.nodeName(this,"form"))return!1;v.event.add(this,"click._submit keypress._submit",function(e){var n=e.target,r=v.nodeName(n,"input")||v.nodeName(n,"button")?n.form:t;r&&!v._data(r,"_submit_attached")&&(v.event.add(r,"submit._submit",function(e){e._submit_bubble=!0}),v._data(r,"_submit_attached",!0))})},postDispatch:function(e){e._submit_bubble&&(delete e._submit_bubble,this.parentNode&&!e.isTrigger&&v.event.simulate("submit",this.parentNode,e,!0))},teardown:function(){if(v.nodeName(this,"form"))return!1;v.event.remove(this,"._submit")}}),v.support.changeBubbles||(v.event.special.change={setup:function(){if($.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")v.event.add(this,"propertychange._change",function(e){e.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),v.event.add(this,"click._change",function(e){this._just_changed&&!e.isTrigger&&(this._just_changed=!1),v.event.simulate("change",this,e,!0)});return!1}v.event.add(this,"beforeactivate._change",function(e){var t=e.target;$.test(t.nodeName)&&!v._data(t,"_change_attached")&&(v.event.add(t,"change._change",function(e){this.parentNode&&!e.isSimulated&&!e.isTrigger&&v.event.simulate("change",this.parentNode,e,!0)}),v._data(t,"_change_attached",!0))})},handle:function(e){var t=e.target;if(this!==t||e.isSimulated||e.isTrigger||t.type!=="radio"&&t.type!=="checkbox")return e.handleObj.handler.apply(this,arguments)},teardown:function(){return v.event.remove(this,"._change"),!$.test(this.nodeName)}}),v.support.focusinBubbles||v.each({focus:"focusin",blur:"focusout"},function(e,t){var n=0,r=function(e){v.event.simulate(t,e.target,v.event.fix(e),!0)};v.event.special[t]={setup:function(){n++===0&&i.addEventListener(e,r,!0)},teardown:function(){--n===0&&i.removeEventListener(e,r,!0)}}}),v.fn.extend({on:function(e,n,r,i,s){var o,u;if(typeof e=="object"){typeof n!="string"&&(r=r||n,n=t);for(u in e)this.on(u,n,r,e[u],s);return this}r==null&&i==null?(i=n,r=n=t):i==null&&(typeof n=="string"?(i=r,r=t):(i=r,r=n,n=t));if(i===!1)i=et;else if(!i)return this;return s===1&&(o=i,i=function(e){return v().off(e),o.apply(this,arguments)},i.guid=o.guid||(o.guid=v.guid++)),this.each(function(){v.event.add(this,e,i,r,n)})},one:function(e,t,n,r){return this.on(e,t,n,r,1)},off:function(e,n,r){var i,s;if(e&&e.preventDefault&&e.handleObj)return i=e.handleObj,v(e.delegateTarget).off(i.namespace?i.origType+"."+i.namespace:i.origType,i.selector,i.handler),this;if(typeof e=="object"){for(s in e)this.off(s,n,e[s]);return this}if(n===!1||typeof n=="function")r=n,n=t;return r===!1&&(r=et),this.each(function(){v.event.remove(this,e,r,n)})},bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},live:function(e,t,n){return v(this.context).on(e,this.selector,t,n),this},die:function(e,t){return v(this.context).off(e,this.selector||"**",t),this},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return arguments.length===1?this.off(e,"**"):this.off(t,e||"**",n)},trigger:function(e,t){return this.each(function(){v.event.trigger(e,t,this)})},triggerHandler:function(e,t){if(this[0])return v.event.trigger(e,t,this[0],!0)},toggle:function(e){var t=arguments,n=e.guid||v.guid++,r=0,i=function(n){var i=(v._data(this,"lastToggle"+e.guid)||0)%r;return v._data(this,"lastToggle"+e.guid,i+1),n.preventDefault(),t[i].apply(this,arguments)||!1};i.guid=n;while(r<t.length)t[r++].guid=n;return this.click(i)},hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),v.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(e,t){v.fn[t]=function(e,n){return n==null&&(n=e,e=null),arguments.length>0?this.on(t,null,e,n):this.trigger(t)},Q.test(t)&&(v.event.fixHooks[t]=v.event.keyHooks),G.test(t)&&(v.event.fixHooks[t]=v.event.mouseHooks)}),function(e,t){function nt(e,t,n,r){n=n||[],t=t||g;var i,s,a,f,l=t.nodeType;if(!e||typeof e!="string")return n;if(l!==1&&l!==9)return[];a=o(t);if(!a&&!r)if(i=R.exec(e))if(f=i[1]){if(l===9){s=t.getElementById(f);if(!s||!s.parentNode)return n;if(s.id===f)return n.push(s),n}else if(t.ownerDocument&&(s=t.ownerDocument.getElementById(f))&&u(t,s)&&s.id===f)return n.push(s),n}else{if(i[2])return S.apply(n,x.call(t.getElementsByTagName(e),0)),n;if((f=i[3])&&Z&&t.getElementsByClassName)return S.apply(n,x.call(t.getElementsByClassName(f),0)),n}return vt(e.replace(j,"$1"),t,n,r,a)}function rt(e){return function(t){var n=t.nodeName.toLowerCase();return n==="input"&&t.type===e}}function it(e){return function(t){var n=t.nodeName.toLowerCase();return(n==="input"||n==="button")&&t.type===e}}function st(e){return N(function(t){return t=+t,N(function(n,r){var i,s=e([],n.length,t),o=s.length;while(o--)n[i=s[o]]&&(n[i]=!(r[i]=n[i]))})})}function ot(e,t,n){if(e===t)return n;var r=e.nextSibling;while(r){if(r===t)return-1;r=r.nextSibling}return 1}function ut(e,t){var n,r,s,o,u,a,f,l=L[d][e+" "];if(l)return t?0:l.slice(0);u=e,a=[],f=i.preFilter;while(u){if(!n||(r=F.exec(u)))r&&(u=u.slice(r[0].length)||u),a.push(s=[]);n=!1;if(r=I.exec(u))s.push(n=new m(r.shift())),u=u.slice(n.length),n.type=r[0].replace(j," ");for(o in i.filter)(r=J[o].exec(u))&&(!f[o]||(r=f[o](r)))&&(s.push(n=new m(r.shift())),u=u.slice(n.length),n.type=o,n.matches=r);if(!n)break}return t?u.length:u?nt.error(e):L(e,a).slice(0)}function at(e,t,r){var i=t.dir,s=r&&t.dir==="parentNode",o=w++;return t.first?function(t,n,r){while(t=t[i])if(s||t.nodeType===1)return e(t,n,r)}:function(t,r,u){if(!u){var a,f=b+" "+o+" ",l=f+n;while(t=t[i])if(s||t.nodeType===1){if((a=t[d])===l)return t.sizset;if(typeof a=="string"&&a.indexOf(f)===0){if(t.sizset)return t}else{t[d]=l;if(e(t,r,u))return t.sizset=!0,t;t.sizset=!1}}}else while(t=t[i])if(s||t.nodeType===1)if(e(t,r,u))return t}}function ft(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function lt(e,t,n,r,i){var s,o=[],u=0,a=e.length,f=t!=null;for(;u<a;u++)if(s=e[u])if(!n||n(s,r,i))o.push(s),f&&t.push(u);return o}function ct(e,t,n,r,i,s){return r&&!r[d]&&(r=ct(r)),i&&!i[d]&&(i=ct(i,s)),N(function(s,o,u,a){var f,l,c,h=[],p=[],d=o.length,v=s||dt(t||"*",u.nodeType?[u]:u,[]),m=e&&(s||!t)?lt(v,h,e,u,a):v,g=n?i||(s?e:d||r)?[]:o:m;n&&n(m,g,u,a);if(r){f=lt(g,p),r(f,[],u,a),l=f.length;while(l--)if(c=f[l])g[p[l]]=!(m[p[l]]=c)}if(s){if(i||e){if(i){f=[],l=g.length;while(l--)(c=g[l])&&f.push(m[l]=c);i(null,g=[],f,a)}l=g.length;while(l--)(c=g[l])&&(f=i?T.call(s,c):h[l])>-1&&(s[f]=!(o[f]=c))}}else g=lt(g===o?g.splice(d,g.length):g),i?i(null,o,g,a):S.apply(o,g)})}function ht(e){var t,n,r,s=e.length,o=i.relative[e[0].type],u=o||i.relative[" "],a=o?1:0,f=at(function(e){return e===t},u,!0),l=at(function(e){return T.call(t,e)>-1},u,!0),h=[function(e,n,r){return!o&&(r||n!==c)||((t=n).nodeType?f(e,n,r):l(e,n,r))}];for(;a<s;a++)if(n=i.relative[e[a].type])h=[at(ft(h),n)];else{n=i.filter[e[a].type].apply(null,e[a].matches);if(n[d]){r=++a;for(;r<s;r++)if(i.relative[e[r].type])break;return ct(a>1&&ft(h),a>1&&e.slice(0,a-1).join("").replace(j,"$1"),n,a<r&&ht(e.slice(a,r)),r<s&&ht(e=e.slice(r)),r<s&&e.join(""))}h.push(n)}return ft(h)}function pt(e,t){var r=t.length>0,s=e.length>0,o=function(u,a,f,l,h){var p,d,v,m=[],y=0,w="0",x=u&&[],T=h!=null,N=c,C=u||s&&i.find.TAG("*",h&&a.parentNode||a),k=b+=N==null?1:Math.E;T&&(c=a!==g&&a,n=o.el);for(;(p=C[w])!=null;w++){if(s&&p){for(d=0;v=e[d];d++)if(v(p,a,f)){l.push(p);break}T&&(b=k,n=++o.el)}r&&((p=!v&&p)&&y--,u&&x.push(p))}y+=w;if(r&&w!==y){for(d=0;v=t[d];d++)v(x,m,a,f);if(u){if(y>0)while(w--)!x[w]&&!m[w]&&(m[w]=E.call(l));m=lt(m)}S.apply(l,m),T&&!u&&m.length>0&&y+t.length>1&&nt.uniqueSort(l)}return T&&(b=k,c=N),x};return o.el=0,r?N(o):o}function dt(e,t,n){var r=0,i=t.length;for(;r<i;r++)nt(e,t[r],n);return n}function vt(e,t,n,r,s){var o,u,f,l,c,h=ut(e),p=h.length;if(!r&&h.length===1){u=h[0]=h[0].slice(0);if(u.length>2&&(f=u[0]).type==="ID"&&t.nodeType===9&&!s&&i.relative[u[1].type]){t=i.find.ID(f.matches[0].replace($,""),t,s)[0];if(!t)return n;e=e.slice(u.shift().length)}for(o=J.POS.test(e)?-1:u.length-1;o>=0;o--){f=u[o];if(i.relative[l=f.type])break;if(c=i.find[l])if(r=c(f.matches[0].replace($,""),z.test(u[0].type)&&t.parentNode||t,s)){u.splice(o,1),e=r.length&&u.join("");if(!e)return S.apply(n,x.call(r,0)),n;break}}}return a(e,h)(r,t,s,n,z.test(e)),n}function mt(){}var n,r,i,s,o,u,a,f,l,c,h=!0,p="undefined",d=("sizcache"+Math.random()).replace(".",""),m=String,g=e.document,y=g.documentElement,b=0,w=0,E=[].pop,S=[].push,x=[].slice,T=[].indexOf||function(e){var t=0,n=this.length;for(;t<n;t++)if(this[t]===e)return t;return-1},N=function(e,t){return e[d]=t==null||t,e},C=function(){var e={},t=[];return N(function(n,r){return t.push(n)>i.cacheLength&&delete e[t.shift()],e[n+" "]=r},e)},k=C(),L=C(),A=C(),O="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",_=M.replace("w","w#"),D="([*^$|!~]?=)",P="\\["+O+"*("+M+")"+O+"*(?:"+D+O+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+_+")|)|)"+O+"*\\]",H=":("+M+")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:"+P+")|[^:]|\\\\.)*|.*))\\)|)",B=":(even|odd|eq|gt|lt|nth|first|last)(?:\\("+O+"*((?:-\\d)?\\d*)"+O+"*\\)|)(?=[^-]|$)",j=new RegExp("^"+O+"+|((?:^|[^\\\\])(?:\\\\.)*)"+O+"+$","g"),F=new RegExp("^"+O+"*,"+O+"*"),I=new RegExp("^"+O+"*([\\x20\\t\\r\\n\\f>+~])"+O+"*"),q=new RegExp(H),R=/^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,U=/^:not/,z=/[\x20\t\r\n\f]*[+~]/,W=/:not\($/,X=/h\d/i,V=/input|select|textarea|button/i,$=/\\(?!\\)/g,J={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),NAME:new RegExp("^\\[name=['\"]?("+M+")['\"]?\\]"),TAG:new RegExp("^("+M.replace("w","w*")+")"),ATTR:new RegExp("^"+P),PSEUDO:new RegExp("^"+H),POS:new RegExp(B,"i"),CHILD:new RegExp("^:(only|nth|first|last)-child(?:\\("+O+"*(even|odd|(([+-]|)(\\d*)n|)"+O+"*(?:([+-]|)"+O+"*(\\d+)|))"+O+"*\\)|)","i"),needsContext:new RegExp("^"+O+"*[>+~]|"+B,"i")},K=function(e){var t=g.createElement("div");try{return e(t)}catch(n){return!1}finally{t=null}},Q=K(function(e){return e.appendChild(g.createComment("")),!e.getElementsByTagName("*").length}),G=K(function(e){return e.innerHTML="<a href='#'></a>",e.firstChild&&typeof e.firstChild.getAttribute!==p&&e.firstChild.getAttribute("href")==="#"}),Y=K(function(e){e.innerHTML="<select></select>";var t=typeof e.lastChild.getAttribute("multiple");return t!=="boolean"&&t!=="string"}),Z=K(function(e){return e.innerHTML="<div class='hidden e'></div><div class='hidden'></div>",!e.getElementsByClassName||!e.getElementsByClassName("e").length?!1:(e.lastChild.className="e",e.getElementsByClassName("e").length===2)}),et=K(function(e){e.id=d+0,e.innerHTML="<a name='"+d+"'></a><div name='"+d+"'></div>",y.insertBefore(e,y.firstChild);var t=g.getElementsByName&&g.getElementsByName(d).length===2+g.getElementsByName(d+0).length;return r=!g.getElementById(d),y.removeChild(e),t});try{x.call(y.childNodes,0)[0].nodeType}catch(tt){x=function(e){var t,n=[];for(;t=this[e];e++)n.push(t);return n}}nt.matches=function(e,t){return nt(e,null,null,t)},nt.matchesSelector=function(e,t){return nt(t,null,null,[e]).length>0},s=nt.getText=function(e){var t,n="",r=0,i=e.nodeType;if(i){if(i===1||i===9||i===11){if(typeof e.textContent=="string")return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=s(e)}else if(i===3||i===4)return e.nodeValue}else for(;t=e[r];r++)n+=s(t);return n},o=nt.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return t?t.nodeName!=="HTML":!1},u=nt.contains=y.contains?function(e,t){var n=e.nodeType===9?e.documentElement:e,r=t&&t.parentNode;return e===r||!!(r&&r.nodeType===1&&n.contains&&n.contains(r))}:y.compareDocumentPosition?function(e,t){return t&&!!(e.compareDocumentPosition(t)&16)}:function(e,t){while(t=t.parentNode)if(t===e)return!0;return!1},nt.attr=function(e,t){var n,r=o(e);return r||(t=t.toLowerCase()),(n=i.attrHandle[t])?n(e):r||Y?e.getAttribute(t):(n=e.getAttributeNode(t),n?typeof e[t]=="boolean"?e[t]?t:null:n.specified?n.value:null:null)},i=nt.selectors={cacheLength:50,createPseudo:N,match:J,attrHandle:G?{}:{href:function(e){return e.getAttribute("href",2)},type:function(e){return e.getAttribute("type")}},find:{ID:r?function(e,t,n){if(typeof t.getElementById!==p&&!n){var r=t.getElementById(e);return r&&r.parentNode?[r]:[]}}:function(e,n,r){if(typeof n.getElementById!==p&&!r){var i=n.getElementById(e);return i?i.id===e||typeof i.getAttributeNode!==p&&i.getAttributeNode("id").value===e?[i]:t:[]}},TAG:Q?function(e,t){if(typeof t.getElementsByTagName!==p)return t.getElementsByTagName(e)}:function(e,t){var n=t.getElementsByTagName(e);if(e==="*"){var r,i=[],s=0;for(;r=n[s];s++)r.nodeType===1&&i.push(r);return i}return n},NAME:et&&function(e,t){if(typeof t.getElementsByName!==p)return t.getElementsByName(name)},CLASS:Z&&function(e,t,n){if(typeof t.getElementsByClassName!==p&&!n)return t.getElementsByClassName(e)}},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace($,""),e[3]=(e[4]||e[5]||"").replace($,""),e[2]==="~="&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),e[1]==="nth"?(e[2]||nt.error(e[0]),e[3]=+(e[3]?e[4]+(e[5]||1):2*(e[2]==="even"||e[2]==="odd")),e[4]=+(e[6]+e[7]||e[2]==="odd")):e[2]&&nt.error(e[0]),e},PSEUDO:function(e){var t,n;if(J.CHILD.test(e[0]))return null;if(e[3])e[2]=e[3];else if(t=e[4])q.test(t)&&(n=ut(t,!0))&&(n=t.indexOf(")",t.length-n)-t.length)&&(t=t.slice(0,n),e[0]=e[0].slice(0,n)),e[2]=t;return e.slice(0,3)}},filter:{ID:r?function(e){return e=e.replace($,""),function(t){return t.getAttribute("id")===e}}:function(e){return e=e.replace($,""),function(t){var n=typeof t.getAttributeNode!==p&&t.getAttributeNode("id");return n&&n.value===e}},TAG:function(e){return e==="*"?function(){return!0}:(e=e.replace($,"").toLowerCase(),function(t){return t.nodeName&&t.nodeName.toLowerCase()===e})},CLASS:function(e){var t=k[d][e+" "];return t||(t=new RegExp("(^|"+O+")"+e+"("+O+"|$)"))&&k(e,function(e){return t.test(e.className||typeof e.getAttribute!==p&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r,i){var s=nt.attr(r,e);return s==null?t==="!=":t?(s+="",t==="="?s===n:t==="!="?s!==n:t==="^="?n&&s.indexOf(n)===0:t==="*="?n&&s.indexOf(n)>-1:t==="$="?n&&s.substr(s.length-n.length)===n:t==="~="?(" "+s+" ").indexOf(n)>-1:t==="|="?s===n||s.substr(0,n.length+1)===n+"-":!1):!0}},CHILD:function(e,t,n,r){return e==="nth"?function(e){var t,i,s=e.parentNode;if(n===1&&r===0)return!0;if(s){i=0;for(t=s.firstChild;t;t=t.nextSibling)if(t.nodeType===1){i++;if(e===t)break}}return i-=r,i===n||i%n===0&&i/n>=0}:function(t){var n=t;switch(e){case"only":case"first":while(n=n.previousSibling)if(n.nodeType===1)return!1;if(e==="first")return!0;n=t;case"last":while(n=n.nextSibling)if(n.nodeType===1)return!1;return!0}}},PSEUDO:function(e,t){var n,r=i.pseudos[e]||i.setFilters[e.toLowerCase()]||nt.error("unsupported pseudo: "+e);return r[d]?r(t):r.length>1?(n=[e,e,"",t],i.setFilters.hasOwnProperty(e.toLowerCase())?N(function(e,n){var i,s=r(e,t),o=s.length;while(o--)i=T.call(e,s[o]),e[i]=!(n[i]=s[o])}):function(e){return r(e,0,n)}):r}},pseudos:{not:N(function(e){var t=[],n=[],r=a(e.replace(j,"$1"));return r[d]?N(function(e,t,n,i){var s,o=r(e,null,i,[]),u=e.length;while(u--)if(s=o[u])e[u]=!(t[u]=s)}):function(e,i,s){return t[0]=e,r(t,null,s,n),!n.pop()}}),has:N(function(e){return function(t){return nt(e,t).length>0}}),contains:N(function(e){return function(t){return(t.textContent||t.innerText||s(t)).indexOf(e)>-1}}),enabled:function(e){return e.disabled===!1},disabled:function(e){return e.disabled===!0},checked:function(e){var t=e.nodeName.toLowerCase();return t==="input"&&!!e.checked||t==="option"&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},parent:function(e){return!i.pseudos.empty(e)},empty:function(e){var t;e=e.firstChild;while(e){if(e.nodeName>"@"||(t=e.nodeType)===3||t===4)return!1;e=e.nextSibling}return!0},header:function(e){return X.test(e.nodeName)},text:function(e){var t,n;return e.nodeName.toLowerCase()==="input"&&(t=e.type)==="text"&&((n=e.getAttribute("type"))==null||n.toLowerCase()===t)},radio:rt("radio"),checkbox:rt("checkbox"),file:rt("file"),password:rt("password"),image:rt("image"),submit:it("submit"),reset:it("reset"),button:function(e){var t=e.nodeName.toLowerCase();return t==="input"&&e.type==="button"||t==="button"},input:function(e){return V.test(e.nodeName)},focus:function(e){var t=e.ownerDocument;return e===t.activeElement&&(!t.hasFocus||t.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},active:function(e){return e===e.ownerDocument.activeElement},first:st(function(){return[0]}),last:st(function(e,t){return[t-1]}),eq:st(function(e,t,n){return[n<0?n+t:n]}),even:st(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:st(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:st(function(e,t,n){for(var r=n<0?n+t:n;--r>=0;)e.push(r);return e}),gt:st(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}},f=y.compareDocumentPosition?function(e,t){return e===t?(l=!0,0):(!e.compareDocumentPosition||!t.compareDocumentPosition?e.compareDocumentPosition:e.compareDocumentPosition(t)&4)?-1:1}:function(e,t){if(e===t)return l=!0,0;if(e.sourceIndex&&t.sourceIndex)return e.sourceIndex-t.sourceIndex;var n,r,i=[],s=[],o=e.parentNode,u=t.parentNode,a=o;if(o===u)return ot(e,t);if(!o)return-1;if(!u)return 1;while(a)i.unshift(a),a=a.parentNode;a=u;while(a)s.unshift(a),a=a.parentNode;n=i.length,r=s.length;for(var f=0;f<n&&f<r;f++)if(i[f]!==s[f])return ot(i[f],s[f]);return f===n?ot(e,s[f],-1):ot(i[f],t,1)},[0,0].sort(f),h=!l,nt.uniqueSort=function(e){var t,n=[],r=1,i=0;l=h,e.sort(f);if(l){for(;t=e[r];r++)t===e[r-1]&&(i=n.push(r));while(i--)e.splice(n[i],1)}return e},nt.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},a=nt.compile=function(e,t){var n,r=[],i=[],s=A[d][e+" "];if(!s){t||(t=ut(e)),n=t.length;while(n--)s=ht(t[n]),s[d]?r.push(s):i.push(s);s=A(e,pt(i,r))}return s},g.querySelectorAll&&function(){var e,t=vt,n=/'|\\/g,r=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,i=[":focus"],s=[":active"],u=y.matchesSelector||y.mozMatchesSelector||y.webkitMatchesSelector||y.oMatchesSelector||y.msMatchesSelector;K(function(e){e.innerHTML="<select><option selected=''></option></select>",e.querySelectorAll("[selected]").length||i.push("\\["+O+"*(?:checked|disabled|ismap|multiple|readonly|selected|value)"),e.querySelectorAll(":checked").length||i.push(":checked")}),K(function(e){e.innerHTML="<p test=''></p>",e.querySelectorAll("[test^='']").length&&i.push("[*^$]="+O+"*(?:\"\"|'')"),e.innerHTML="<input type='hidden'/>",e.querySelectorAll(":enabled").length||i.push(":enabled",":disabled")}),i=new RegExp(i.join("|")),vt=function(e,r,s,o,u){if(!o&&!u&&!i.test(e)){var a,f,l=!0,c=d,h=r,p=r.nodeType===9&&e;if(r.nodeType===1&&r.nodeName.toLowerCase()!=="object"){a=ut(e),(l=r.getAttribute("id"))?c=l.replace(n,"\\$&"):r.setAttribute("id",c),c="[id='"+c+"'] ",f=a.length;while(f--)a[f]=c+a[f].join("");h=z.test(e)&&r.parentNode||r,p=a.join(",")}if(p)try{return S.apply(s,x.call(h.querySelectorAll(p),0)),s}catch(v){}finally{l||r.removeAttribute("id")}}return t(e,r,s,o,u)},u&&(K(function(t){e=u.call(t,"div");try{u.call(t,"[test!='']:sizzle"),s.push("!=",H)}catch(n){}}),s=new RegExp(s.join("|")),nt.matchesSelector=function(t,n){n=n.replace(r,"='$1']");if(!o(t)&&!s.test(n)&&!i.test(n))try{var a=u.call(t,n);if(a||e||t.document&&t.document.nodeType!==11)return a}catch(f){}return nt(n,null,null,[t]).length>0})}(),i.pseudos.nth=i.pseudos.eq,i.filters=mt.prototype=i.pseudos,i.setFilters=new mt,nt.attr=v.attr,v.find=nt,v.expr=nt.selectors,v.expr[":"]=v.expr.pseudos,v.unique=nt.uniqueSort,v.text=nt.getText,v.isXMLDoc=nt.isXML,v.contains=nt.contains}(e);var nt=/Until$/,rt=/^(?:parents|prev(?:Until|All))/,it=/^.[^:#\[\.,]*$/,st=v.expr.match.needsContext,ot={children:!0,contents:!0,next:!0,prev:!0};v.fn.extend({find:function(e){var t,n,r,i,s,o,u=this;if(typeof e!="string")return v(e).filter(function(){for(t=0,n=u.length;t<n;t++)if(v.contains(u[t],this))return!0});o=this.pushStack("","find",e);for(t=0,n=this.length;t<n;t++){r=o.length,v.find(e,this[t],o);if(t>0)for(i=r;i<o.length;i++)for(s=0;s<r;s++)if(o[s]===o[i]){o.splice(i--,1);break}}return o},has:function(e){var t,n=v(e,this),r=n.length;return this.filter(function(){for(t=0;t<r;t++)if(v.contains(this,n[t]))return!0})},not:function(e){return this.pushStack(ft(this,e,!1),"not",e)},filter:function(e){return this.pushStack(ft(this,e,!0),"filter",e)},is:function(e){return!!e&&(typeof e=="string"?st.test(e)?v(e,this.context).index(this[0])>=0:v.filter(e,this).length>0:this.filter(e).length>0)},closest:function(e,t){var n,r=0,i=this.length,s=[],o=st.test(e)||typeof e!="string"?v(e,t||this.context):0;for(;r<i;r++){n=this[r];while(n&&n.ownerDocument&&n!==t&&n.nodeType!==11){if(o?o.index(n)>-1:v.find.matchesSelector(n,e)){s.push(n);break}n=n.parentNode}}return s=s.length>1?v.unique(s):s,this.pushStack(s,"closest",e)},index:function(e){return e?typeof e=="string"?v.inArray(this[0],v(e)):v.inArray(e.jquery?e[0]:e,this):this[0]&&this[0].parentNode?this.prevAll().length:-1},add:function(e,t){var n=typeof e=="string"?v(e,t):v.makeArray(e&&e.nodeType?[e]:e),r=v.merge(this.get(),n);return this.pushStack(ut(n[0])||ut(r[0])?r:v.unique(r))},addBack:function(e){return this.add(e==null?this.prevObject:this.prevObject.filter(e))}}),v.fn.andSelf=v.fn.addBack,v.each({parent:function(e){var t=e.parentNode;return t&&t.nodeType!==11?t:null},parents:function(e){return v.dir(e,"parentNode")},parentsUntil:function(e,t,n){return v.dir(e,"parentNode",n)},next:function(e){return at(e,"nextSibling")},prev:function(e){return at(e,"previousSibling")},nextAll:function(e){return v.dir(e,"nextSibling")},prevAll:function(e){return v.dir(e,"previousSibling")},nextUntil:function(e,t,n){return v.dir(e,"nextSibling",n)},prevUntil:function(e,t,n){return v.dir(e,"previousSibling",n)},siblings:function(e){return v.sibling((e.parentNode||{}).firstChild,e)},children:function(e){return v.sibling(e.firstChild)},contents:function(e){return v.nodeName(e,"iframe")?e.contentDocument||e.contentWindow.document:v.merge([],e.childNodes)}},function(e,t){v.fn[e]=function(n,r){var i=v.map(this,t,n);return nt.test(e)||(r=n),r&&typeof r=="string"&&(i=v.filter(r,i)),i=this.length>1&&!ot[e]?v.unique(i):i,this.length>1&&rt.test(e)&&(i=i.reverse()),this.pushStack(i,e,l.call(arguments).join(","))}}),v.extend({filter:function(e,t,n){return n&&(e=":not("+e+")"),t.length===1?v.find.matchesSelector(t[0],e)?[t[0]]:[]:v.find.matches(e,t)},dir:function(e,n,r){var i=[],s=e[n];while(s&&s.nodeType!==9&&(r===t||s.nodeType!==1||!v(s).is(r)))s.nodeType===1&&i.push(s),s=s[n];return i},sibling:function(e,t){var n=[];for(;e;e=e.nextSibling)e.nodeType===1&&e!==t&&n.push(e);return n}});var ct="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",ht=/ jQuery\d+="(?:null|\d+)"/g,pt=/^\s+/,dt=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,vt=/<([\w:]+)/,mt=/<tbody/i,gt=/<|&#?\w+;/,yt=/<(?:script|style|link)/i,bt=/<(?:script|object|embed|option|style)/i,wt=new RegExp("<(?:"+ct+")[\\s/>]","i"),Et=/^(?:checkbox|radio)$/,St=/checked\s*(?:[^=]|=\s*.checked.)/i,xt=/\/(java|ecma)script/i,Tt=/^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,Nt={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},Ct=lt(i),kt=Ct.appendChild(i.createElement("div"));Nt.optgroup=Nt.option,Nt.tbody=Nt.tfoot=Nt.colgroup=Nt.caption=Nt.thead,Nt.th=Nt.td,v.support.htmlSerialize||(Nt._default=[1,"X<div>","</div>"]),v.fn.extend({text:function(e){return v.access(this,function(e){return e===t?v.text(this):this.empty().append((this[0]&&this[0].ownerDocument||i).createTextNode(e))},null,e,arguments.length)},wrapAll:function(e){if(v.isFunction(e))return this.each(function(t){v(this).wrapAll(e.call(this,t))});if(this[0]){var t=v(e,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstChild&&e.firstChild.nodeType===1)e=e.firstChild;return e}).append(this)}return this},wrapInner:function(e){return v.isFunction(e)?this.each(function(t){v(this).wrapInner(e.call(this,t))}):this.each(function(){var t=v(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=v.isFunction(e);return this.each(function(n){v(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(){return this.parent().each(function(){v.nodeName(this,"body")||v(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(e){(this.nodeType===1||this.nodeType===11)&&this.appendChild(e)})},prepend:function(){return this.domManip(arguments,!0,function(e){(this.nodeType===1||this.nodeType===11)&&this.insertBefore(e,this.firstChild)})},before:function(){if(!ut(this[0]))return this.domManip(arguments,!1,function(e){this.parentNode.insertBefore(e,this)});if(arguments.length){var e=v.clean(arguments);return this.pushStack(v.merge(e,this),"before",this.selector)}},after:function(){if(!ut(this[0]))return this.domManip(arguments,!1,function(e){this.parentNode.insertBefore(e,this.nextSibling)});if(arguments.length){var e=v.clean(arguments);return this.pushStack(v.merge(this,e),"after",this.selector)}},remove:function(e,t){var n,r=0;for(;(n=this[r])!=null;r++)if(!e||v.filter(e,[n]).length)!t&&n.nodeType===1&&(v.cleanData(n.getElementsByTagName("*")),v.cleanData([n])),n.parentNode&&n.parentNode.removeChild(n);return this},empty:function(){var e,t=0;for(;(e=this[t])!=null;t++){e.nodeType===1&&v.cleanData(e.getElementsByTagName("*"));while(e.firstChild)e.removeChild(e.firstChild)}return this},clone:function(e,t){return e=e==null?!1:e,t=t==null?e:t,this.map(function(){return v.clone(this,e,t)})},html:function(e){return v.access(this,function(e){var n=this[0]||{},r=0,i=this.length;if(e===t)return n.nodeType===1?n.innerHTML.replace(ht,""):t;if(typeof e=="string"&&!yt.test(e)&&(v.support.htmlSerialize||!wt.test(e))&&(v.support.leadingWhitespace||!pt.test(e))&&!Nt[(vt.exec(e)||["",""])[1].toLowerCase()]){e=e.replace(dt,"<$1></$2>");try{for(;r<i;r++)n=this[r]||{},n.nodeType===1&&(v.cleanData(n.getElementsByTagName("*")),n.innerHTML=e);n=0}catch(s){}}n&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(e){return ut(this[0])?this.length?this.pushStack(v(v.isFunction(e)?e():e),"replaceWith",e):this:v.isFunction(e)?this.each(function(t){var n=v(this),r=n.html();n.replaceWith(e.call(this,t,r))}):(typeof e!="string"&&(e=v(e).detach()),this.each(function(){var t=this.nextSibling,n=this.parentNode;v(this).remove(),t?v(t).before(e):v(n).append(e)}))},detach:function(e){return this.remove(e,!0)},domManip:function(e,n,r){e=[].concat.apply([],e);var i,s,o,u,a=0,f=e[0],l=[],c=this.length;if(!v.support.checkClone&&c>1&&typeof f=="string"&&St.test(f))return this.each(function(){v(this).domManip(e,n,r)});if(v.isFunction(f))return this.each(function(i){var s=v(this);e[0]=f.call(this,i,n?s.html():t),s.domManip(e,n,r)});if(this[0]){i=v.buildFragment(e,this,l),o=i.fragment,s=o.firstChild,o.childNodes.length===1&&(o=s);if(s){n=n&&v.nodeName(s,"tr");for(u=i.cacheable||c-1;a<c;a++)r.call(n&&v.nodeName(this[a],"table")?Lt(this[a],"tbody"):this[a],a===u?o:v.clone(o,!0,!0))}o=s=null,l.length&&v.each(l,function(e,t){t.src?v.ajax?v.ajax({url:t.src,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0}):v.error("no ajax"):v.globalEval((t.text||t.textContent||t.innerHTML||"").replace(Tt,"")),t.parentNode&&t.parentNode.removeChild(t)})}return this}}),v.buildFragment=function(e,n,r){var s,o,u,a=e[0];return n=n||i,n=!n.nodeType&&n[0]||n,n=n.ownerDocument||n,e.length===1&&typeof a=="string"&&a.length<512&&n===i&&a.charAt(0)==="<"&&!bt.test(a)&&(v.support.checkClone||!St.test(a))&&(v.support.html5Clone||!wt.test(a))&&(o=!0,s=v.fragments[a],u=s!==t),s||(s=n.createDocumentFragment(),v.clean(e,n,s,r),o&&(v.fragments[a]=u&&s)),{fragment:s,cacheable:o}},v.fragments={},v.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){v.fn[e]=function(n){var r,i=0,s=[],o=v(n),u=o.length,a=this.length===1&&this[0].parentNode;if((a==null||a&&a.nodeType===11&&a.childNodes.length===1)&&u===1)return o[t](this[0]),this;for(;i<u;i++)r=(i>0?this.clone(!0):this).get(),v(o[i])[t](r),s=s.concat(r);return this.pushStack(s,e,o.selector)}}),v.extend({clone:function(e,t,n){var r,i,s,o;v.support.html5Clone||v.isXMLDoc(e)||!wt.test("<"+e.nodeName+">")?o=e.cloneNode(!0):(kt.innerHTML=e.outerHTML,kt.removeChild(o=kt.firstChild));if((!v.support.noCloneEvent||!v.support.noCloneChecked)&&(e.nodeType===1||e.nodeType===11)&&!v.isXMLDoc(e)){Ot(e,o),r=Mt(e),i=Mt(o);for(s=0;r[s];++s)i[s]&&Ot(r[s],i[s])}if(t){At(e,o);if(n){r=Mt(e),i=Mt(o);for(s=0;r[s];++s)At(r[s],i[s])}}return r=i=null,o},clean:function(e,t,n,r){var s,o,u,a,f,l,c,h,p,d,m,g,y=t===i&&Ct,b=[];if(!t||typeof t.createDocumentFragment=="undefined")t=i;for(s=0;(u=e[s])!=null;s++){typeof u=="number"&&(u+="");if(!u)continue;if(typeof u=="string")if(!gt.test(u))u=t.createTextNode(u);else{y=y||lt(t),c=t.createElement("div"),y.appendChild(c),u=u.replace(dt,"<$1></$2>"),a=(vt.exec(u)||["",""])[1].toLowerCase(),f=Nt[a]||Nt._default,l=f[0],c.innerHTML=f[1]+u+f[2];while(l--)c=c.lastChild;if(!v.support.tbody){h=mt.test(u),p=a==="table"&&!h?c.firstChild&&c.firstChild.childNodes:f[1]==="<table>"&&!h?c.childNodes:[];for(o=p.length-1;o>=0;--o)v.nodeName(p[o],"tbody")&&!p[o].childNodes.length&&p[o].parentNode.removeChild(p[o])}!v.support.leadingWhitespace&&pt.test(u)&&c.insertBefore(t.createTextNode(pt.exec(u)[0]),c.firstChild),u=c.childNodes,c.parentNode.removeChild(c)}u.nodeType?b.push(u):v.merge(b,u)}c&&(u=c=y=null);if(!v.support.appendChecked)for(s=0;(u=b[s])!=null;s++)v.nodeName(u,"input")?_t(u):typeof u.getElementsByTagName!="undefined"&&v.grep(u.getElementsByTagName("input"),_t);if(n){m=function(e){if(!e.type||xt.test(e.type))return r?r.push(e.parentNode?e.parentNode.removeChild(e):e):n.appendChild(e)};for(s=0;(u=b[s])!=null;s++)if(!v.nodeName(u,"script")||!m(u))n.appendChild(u),typeof u.getElementsByTagName!="undefined"&&(g=v.grep(v.merge([],u.getElementsByTagName("script")),m),b.splice.apply(b,[s+1,0].concat(g)),s+=g.length)}return b},cleanData:function(e,t){var n,r,i,s,o=0,u=v.expando,a=v.cache,f=v.support.deleteExpando,l=v.event.special;for(;(i=e[o])!=null;o++)if(t||v.acceptData(i)){r=i[u],n=r&&a[r];if(n){if(n.events)for(s in n.events)l[s]?v.event.remove(i,s):v.removeEvent(i,s,n.handle);a[r]&&(delete a[r],f?delete i[u]:i.removeAttribute?i.removeAttribute(u):i[u]=null,v.deletedIds.push(r))}}}}),function(){var e,t;v.uaMatch=function(e){e=e.toLowerCase();var t=/(chrome)[ \/]([\w.]+)/.exec(e)||/(webkit)[ \/]([\w.]+)/.exec(e)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e)||/(msie) ([\w.]+)/.exec(e)||e.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e)||[];return{browser:t[1]||"",version:t[2]||"0"}},e=v.uaMatch(o.userAgent),t={},e.browser&&(t[e.browser]=!0,t.version=e.version),t.chrome?t.webkit=!0:t.webkit&&(t.safari=!0),v.browser=t,v.sub=function(){function e(t,n){return new e.fn.init(t,n)}v.extend(!0,e,this),e.superclass=this,e.fn=e.prototype=this(),e.fn.constructor=e,e.sub=this.sub,e.fn.init=function(r,i){return i&&i instanceof v&&!(i instanceof e)&&(i=e(i)),v.fn.init.call(this,r,i,t)},e.fn.init.prototype=e.fn;var t=e(i);return e}}();var Dt,Pt,Ht,Bt=/alpha\([^)]*\)/i,jt=/opacity=([^)]*)/,Ft=/^(top|right|bottom|left)$/,It=/^(none|table(?!-c[ea]).+)/,qt=/^margin/,Rt=new RegExp("^("+m+")(.*)$","i"),Ut=new RegExp("^("+m+")(?!px)[a-z%]+$","i"),zt=new RegExp("^([-+])=("+m+")","i"),Wt={BODY:"block"},Xt={position:"absolute",visibility:"hidden",display:"block"},Vt={letterSpacing:0,fontWeight:400},$t=["Top","Right","Bottom","Left"],Jt=["Webkit","O","Moz","ms"],Kt=v.fn.toggle;v.fn.extend({css:function(e,n){return v.access(this,function(e,n,r){return r!==t?v.style(e,n,r):v.css(e,n)},e,n,arguments.length>1)},show:function(){return Yt(this,!0)},hide:function(){return Yt(this)},toggle:function(e,t){var n=typeof e=="boolean";return v.isFunction(e)&&v.isFunction(t)?Kt.apply(this,arguments):this.each(function(){(n?e:Gt(this))?v(this).show():v(this).hide()})}}),v.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Dt(e,"opacity");return n===""?"1":n}}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":v.support.cssFloat?"cssFloat":"styleFloat"},style:function(e,n,r,i){if(!e||e.nodeType===3||e.nodeType===8||!e.style)return;var s,o,u,a=v.camelCase(n),f=e.style;n=v.cssProps[a]||(v.cssProps[a]=Qt(f,a)),u=v.cssHooks[n]||v.cssHooks[a];if(r===t)return u&&"get"in u&&(s=u.get(e,!1,i))!==t?s:f[n];o=typeof r,o==="string"&&(s=zt.exec(r))&&(r=(s[1]+1)*s[2]+parseFloat(v.css(e,n)),o="number");if(r==null||o==="number"&&isNaN(r))return;o==="number"&&!v.cssNumber[a]&&(r+="px");if(!u||!("set"in u)||(r=u.set(e,r,i))!==t)try{f[n]=r}catch(l){}},css:function(e,n,r,i){var s,o,u,a=v.camelCase(n);return n=v.cssProps[a]||(v.cssProps[a]=Qt(e.style,a)),u=v.cssHooks[n]||v.cssHooks[a],u&&"get"in u&&(s=u.get(e,!0,i)),s===t&&(s=Dt(e,n)),s==="normal"&&n in Vt&&(s=Vt[n]),r||i!==t?(o=parseFloat(s),r||v.isNumeric(o)?o||0:s):s},swap:function(e,t,n){var r,i,s={};for(i in t)s[i]=e.style[i],e.style[i]=t[i];r=n.call(e);for(i in t)e.style[i]=s[i];return r}}),e.getComputedStyle?Dt=function(t,n){var r,i,s,o,u=e.getComputedStyle(t,null),a=t.style;return u&&(r=u.getPropertyValue(n)||u[n],r===""&&!v.contains(t.ownerDocument,t)&&(r=v.style(t,n)),Ut.test(r)&&qt.test(n)&&(i=a.width,s=a.minWidth,o=a.maxWidth,a.minWidth=a.maxWidth=a.width=r,r=u.width,a.width=i,a.minWidth=s,a.maxWidth=o)),r}:i.documentElement.currentStyle&&(Dt=function(e,t){var n,r,i=e.currentStyle&&e.currentStyle[t],s=e.style;return i==null&&s&&s[t]&&(i=s[t]),Ut.test(i)&&!Ft.test(t)&&(n=s.left,r=e.runtimeStyle&&e.runtimeStyle.left,r&&(e.runtimeStyle.left=e.currentStyle.left),s.left=t==="fontSize"?"1em":i,i=s.pixelLeft+"px",s.left=n,r&&(e.runtimeStyle.left=r)),i===""?"auto":i}),v.each(["height","width"],function(e,t){v.cssHooks[t]={get:function(e,n,r){if(n)return e.offsetWidth===0&&It.test(Dt(e,"display"))?v.swap(e,Xt,function(){return tn(e,t,r)}):tn(e,t,r)},set:function(e,n,r){return Zt(e,n,r?en(e,t,r,v.support.boxSizing&&v.css(e,"boxSizing")==="border-box"):0)}}}),v.support.opacity||(v.cssHooks.opacity={get:function(e,t){return jt.test((t&&e.currentStyle?e.currentStyle.filter:e.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":t?"1":""},set:function(e,t){var n=e.style,r=e.currentStyle,i=v.isNumeric(t)?"alpha(opacity="+t*100+")":"",s=r&&r.filter||n.filter||"";n.zoom=1;if(t>=1&&v.trim(s.replace(Bt,""))===""&&n.removeAttribute){n.removeAttribute("filter");if(r&&!r.filter)return}n.filter=Bt.test(s)?s.replace(Bt,i):s+" "+i}}),v(function(){v.support.reliableMarginRight||(v.cssHooks.marginRight={get:function(e,t){return v.swap(e,{display:"inline-block"},function(){if(t)return Dt(e,"marginRight")})}}),!v.support.pixelPosition&&v.fn.position&&v.each(["top","left"],function(e,t){v.cssHooks[t]={get:function(e,n){if(n){var r=Dt(e,t);return Ut.test(r)?v(e).position()[t]+"px":r}}}})}),v.expr&&v.expr.filters&&(v.expr.filters.hidden=function(e){return e.offsetWidth===0&&e.offsetHeight===0||!v.support.reliableHiddenOffsets&&(e.style&&e.style.display||Dt(e,"display"))==="none"},v.expr.filters.visible=function(e){return!v.expr.filters.hidden(e)}),v.each({margin:"",padding:"",border:"Width"},function(e,t){v.cssHooks[e+t]={expand:function(n){var r,i=typeof n=="string"?n.split(" "):[n],s={};for(r=0;r<4;r++)s[e+$t[r]+t]=i[r]||i[r-2]||i[0];return s}},qt.test(e)||(v.cssHooks[e+t].set=Zt)});var rn=/%20/g,sn=/\[\]$/,on=/\r?\n/g,un=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,an=/^(?:select|textarea)/i;v.fn.extend({serialize:function(){return v.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?v.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||an.test(this.nodeName)||un.test(this.type))}).map(function(e,t){var n=v(this).val();return n==null?null:v.isArray(n)?v.map(n,function(e,n){return{name:t.name,value:e.replace(on,"\r\n")}}):{name:t.name,value:n.replace(on,"\r\n")}}).get()}}),v.param=function(e,n){var r,i=[],s=function(e,t){t=v.isFunction(t)?t():t==null?"":t,i[i.length]=encodeURIComponent(e)+"="+encodeURIComponent(t)};n===t&&(n=v.ajaxSettings&&v.ajaxSettings.traditional);if(v.isArray(e)||e.jquery&&!v.isPlainObject(e))v.each(e,function(){s(this.name,this.value)});else for(r in e)fn(r,e[r],n,s);return i.join("&").replace(rn,"+")};var ln,cn,hn=/#.*$/,pn=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,dn=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,vn=/^(?:GET|HEAD)$/,mn=/^\/\//,gn=/\?/,yn=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bn=/([?&])_=[^&]*/,wn=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,En=v.fn.load,Sn={},xn={},Tn=["*/"]+["*"];try{cn=s.href}catch(Nn){cn=i.createElement("a"),cn.href="",cn=cn.href}ln=wn.exec(cn.toLowerCase())||[],v.fn.load=function(e,n,r){if(typeof e!="string"&&En)return En.apply(this,arguments);if(!this.length)return this;var i,s,o,u=this,a=e.indexOf(" ");return a>=0&&(i=e.slice(a,e.length),e=e.slice(0,a)),v.isFunction(n)?(r=n,n=t):n&&typeof n=="object"&&(s="POST"),v.ajax({url:e,type:s,dataType:"html",data:n,complete:function(e,t){r&&u.each(r,o||[e.responseText,t,e])}}).done(function(e){o=arguments,u.html(i?v("<div>").append(e.replace(yn,"")).find(i):e)}),this},v.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(e,t){v.fn[t]=function(e){return this.on(t,e)}}),v.each(["get","post"],function(e,n){v[n]=function(e,r,i,s){return v.isFunction(r)&&(s=s||i,i=r,r=t),v.ajax({type:n,url:e,data:r,success:i,dataType:s})}}),v.extend({getScript:function(e,n){return v.get(e,t,n,"script")},getJSON:function(e,t,n){return v.get(e,t,n,"json")},ajaxSetup:function(e,t){return t?Ln(e,v.ajaxSettings):(t=e,e=v.ajaxSettings),Ln(e,t),e},ajaxSettings:{url:cn,isLocal:dn.test(ln[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":Tn},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":e.String,"text html":!0,"text json":v.parseJSON,"text xml":v.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:Cn(Sn),ajaxTransport:Cn(xn),ajax:function(e,n){function T(e,n,s,a){var l,y,b,w,S,T=n;if(E===2)return;E=2,u&&clearTimeout(u),o=t,i=a||"",x.readyState=e>0?4:0,s&&(w=An(c,x,s));if(e>=200&&e<300||e===304)c.ifModified&&(S=x.getResponseHeader("Last-Modified"),S&&(v.lastModified[r]=S),S=x.getResponseHeader("Etag"),S&&(v.etag[r]=S)),e===304?(T="notmodified",l=!0):(l=On(c,w),T=l.state,y=l.data,b=l.error,l=!b);else{b=T;if(!T||e)T="error",e<0&&(e=0)}x.status=e,x.statusText=(n||T)+"",l?d.resolveWith(h,[y,T,x]):d.rejectWith(h,[x,T,b]),x.statusCode(g),g=t,f&&p.trigger("ajax"+(l?"Success":"Error"),[x,c,l?y:b]),m.fireWith(h,[x,T]),f&&(p.trigger("ajaxComplete",[x,c]),--v.active||v.event.trigger("ajaxStop"))}typeof e=="object"&&(n=e,e=t),n=n||{};var r,i,s,o,u,a,f,l,c=v.ajaxSetup({},n),h=c.context||c,p=h!==c&&(h.nodeType||h instanceof v)?v(h):v.event,d=v.Deferred(),m=v.Callbacks("once memory"),g=c.statusCode||{},b={},w={},E=0,S="canceled",x={readyState:0,setRequestHeader:function(e,t){if(!E){var n=e.toLowerCase();e=w[n]=w[n]||e,b[e]=t}return this},getAllResponseHeaders:function(){return E===2?i:null},getResponseHeader:function(e){var n;if(E===2){if(!s){s={};while(n=pn.exec(i))s[n[1].toLowerCase()]=n[2]}n=s[e.toLowerCase()]}return n===t?null:n},overrideMimeType:function(e){return E||(c.mimeType=e),this},abort:function(e){return e=e||S,o&&o.abort(e),T(0,e),this}};d.promise(x),x.success=x.done,x.error=x.fail,x.complete=m.add,x.statusCode=function(e){if(e){var t;if(E<2)for(t in e)g[t]=[g[t],e[t]];else t=e[x.status],x.always(t)}return this},c.url=((e||c.url)+"").replace(hn,"").replace(mn,ln[1]+"//"),c.dataTypes=v.trim(c.dataType||"*").toLowerCase().split(y),c.crossDomain==null&&(a=wn.exec(c.url.toLowerCase()),c.crossDomain=!(!a||a[1]===ln[1]&&a[2]===ln[2]&&(a[3]||(a[1]==="http:"?80:443))==(ln[3]||(ln[1]==="http:"?80:443)))),c.data&&c.processData&&typeof c.data!="string"&&(c.data=v.param(c.data,c.traditional)),kn(Sn,c,n,x);if(E===2)return x;f=c.global,c.type=c.type.toUpperCase(),c.hasContent=!vn.test(c.type),f&&v.active++===0&&v.event.trigger("ajaxStart");if(!c.hasContent){c.data&&(c.url+=(gn.test(c.url)?"&":"?")+c.data,delete c.data),r=c.url;if(c.cache===!1){var N=v.now(),C=c.url.replace(bn,"$1_="+N);c.url=C+(C===c.url?(gn.test(c.url)?"&":"?")+"_="+N:"")}}(c.data&&c.hasContent&&c.contentType!==!1||n.contentType)&&x.setRequestHeader("Content-Type",c.contentType),c.ifModified&&(r=r||c.url,v.lastModified[r]&&x.setRequestHeader("If-Modified-Since",v.lastModified[r]),v.etag[r]&&x.setRequestHeader("If-None-Match",v.etag[r])),x.setRequestHeader("Accept",c.dataTypes[0]&&c.accepts[c.dataTypes[0]]?c.accepts[c.dataTypes[0]]+(c.dataTypes[0]!=="*"?", "+Tn+"; q=0.01":""):c.accepts["*"]);for(l in c.headers)x.setRequestHeader(l,c.headers[l]);if(!c.beforeSend||c.beforeSend.call(h,x,c)!==!1&&E!==2){S="abort";for(l in{success:1,error:1,complete:1})x[l](c[l]);o=kn(xn,c,n,x);if(!o)T(-1,"No Transport");else{x.readyState=1,f&&p.trigger("ajaxSend",[x,c]),c.async&&c.timeout>0&&(u=setTimeout(function(){x.abort("timeout")},c.timeout));try{E=1,o.send(b,T)}catch(k){if(!(E<2))throw k;T(-1,k)}}return x}return x.abort()},active:0,lastModified:{},etag:{}});var Mn=[],_n=/\?/,Dn=/(=)\?(?=&|$)|\?\?/,Pn=v.now();v.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Mn.pop()||v.expando+"_"+Pn++;return this[e]=!0,e}}),v.ajaxPrefilter("json jsonp",function(n,r,i){var s,o,u,a=n.data,f=n.url,l=n.jsonp!==!1,c=l&&Dn.test(f),h=l&&!c&&typeof a=="string"&&!(n.contentType||"").indexOf("application/x-www-form-urlencoded")&&Dn.test(a);if(n.dataTypes[0]==="jsonp"||c||h)return s=n.jsonpCallback=v.isFunction(n.jsonpCallback)?n.jsonpCallback():n.jsonpCallback,o=e[s],c?n.url=f.replace(Dn,"$1"+s):h?n.data=a.replace(Dn,"$1"+s):l&&(n.url+=(_n.test(f)?"&":"?")+n.jsonp+"="+s),n.converters["script json"]=function(){return u||v.error(s+" was not called"),u[0]},n.dataTypes[0]="json",e[s]=function(){u=arguments},i.always(function(){e[s]=o,n[s]&&(n.jsonpCallback=r.jsonpCallback,Mn.push(s)),u&&v.isFunction(o)&&o(u[0]),u=o=t}),"script"}),v.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(e){return v.globalEval(e),e}}}),v.ajaxPrefilter("script",function(e){e.cache===t&&(e.cache=!1),e.crossDomain&&(e.type="GET",e.global=!1)}),v.ajaxTransport("script",function(e){if(e.crossDomain){var n,r=i.head||i.getElementsByTagName("head")[0]||i.documentElement;return{send:function(s,o){n=i.createElement("script"),n.async="async",e.scriptCharset&&(n.charset=e.scriptCharset),n.src=e.url,n.onload=n.onreadystatechange=function(e,i){if(i||!n.readyState||/loaded|complete/.test(n.readyState))n.onload=n.onreadystatechange=null,r&&n.parentNode&&r.removeChild(n),n=t,i||o(200,"success")},r.insertBefore(n,r.firstChild)},abort:function(){n&&n.onload(0,1)}}}});var Hn,Bn=e.ActiveXObject?function(){for(var e in Hn)Hn[e](0,1)}:!1,jn=0;v.ajaxSettings.xhr=e.ActiveXObject?function(){return!this.isLocal&&Fn()||In()}:Fn,function(e){v.extend(v.support,{ajax:!!e,cors:!!e&&"withCredentials"in e})}(v.ajaxSettings.xhr()),v.support.ajax&&v.ajaxTransport(function(n){if(!n.crossDomain||v.support.cors){var r;return{send:function(i,s){var o,u,a=n.xhr();n.username?a.open(n.type,n.url,n.async,n.username,n.password):a.open(n.type,n.url,n.async);if(n.xhrFields)for(u in n.xhrFields)a[u]=n.xhrFields[u];n.mimeType&&a.overrideMimeType&&a.overrideMimeType(n.mimeType),!n.crossDomain&&!i["X-Requested-With"]&&(i["X-Requested-With"]="XMLHttpRequest");try{for(u in i)a.setRequestHeader(u,i[u])}catch(f){}a.send(n.hasContent&&n.data||null),r=function(e,i){var u,f,l,c,h;try{if(r&&(i||a.readyState===4)){r=t,o&&(a.onreadystatechange=v.noop,Bn&&delete Hn[o]);if(i)a.readyState!==4&&a.abort();else{u=a.status,l=a.getAllResponseHeaders(),c={},h=a.responseXML,h&&h.documentElement&&(c.xml=h);try{c.text=a.responseText}catch(p){}try{f=a.statusText}catch(p){f=""}!u&&n.isLocal&&!n.crossDomain?u=c.text?200:404:u===1223&&(u=204)}}}catch(d){i||s(-1,d)}c&&s(u,f,c,l)},n.async?a.readyState===4?setTimeout(r,0):(o=++jn,Bn&&(Hn||(Hn={},v(e).unload(Bn)),Hn[o]=r),a.onreadystatechange=r):r()},abort:function(){r&&r(0,1)}}}});var qn,Rn,Un=/^(?:toggle|show|hide)$/,zn=new RegExp("^(?:([-+])=|)("+m+")([a-z%]*)$","i"),Wn=/queueHooks$/,Xn=[Gn],Vn={"*":[function(e,t){var n,r,i=this.createTween(e,t),s=zn.exec(t),o=i.cur(),u=+o||0,a=1,f=20;if(s){n=+s[2],r=s[3]||(v.cssNumber[e]?"":"px");if(r!=="px"&&u){u=v.css(i.elem,e,!0)||n||1;do a=a||".5",u/=a,v.style(i.elem,e,u+r);while(a!==(a=i.cur()/o)&&a!==1&&--f)}i.unit=r,i.start=u,i.end=s[1]?u+(s[1]+1)*n:n}return i}]};v.Animation=v.extend(Kn,{tweener:function(e,t){v.isFunction(e)?(t=e,e=["*"]):e=e.split(" ");var n,r=0,i=e.length;for(;r<i;r++)n=e[r],Vn[n]=Vn[n]||[],Vn[n].unshift(t)},prefilter:function(e,t){t?Xn.unshift(e):Xn.push(e)}}),v.Tween=Yn,Yn.prototype={constructor:Yn,init:function(e,t,n,r,i,s){this.elem=e,this.prop=n,this.easing=i||"swing",this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=s||(v.cssNumber[n]?"":"px")},cur:function(){var e=Yn.propHooks[this.prop];return e&&e.get?e.get(this):Yn.propHooks._default.get(this)},run:function(e){var t,n=Yn.propHooks[this.prop];return this.options.duration?this.pos=t=v.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):Yn.propHooks._default.set(this),this}},Yn.prototype.init.prototype=Yn.prototype,Yn.propHooks={_default:{get:function(e){var t;return e.elem[e.prop]==null||!!e.elem.style&&e.elem.style[e.prop]!=null?(t=v.css(e.elem,e.prop,!1,""),!t||t==="auto"?0:t):e.elem[e.prop]},set:function(e){v.fx.step[e.prop]?v.fx.step[e.prop](e):e.elem.style&&(e.elem.style[v.cssProps[e.prop]]!=null||v.cssHooks[e.prop])?v.style(e.elem,e.prop,e.now+e.unit):e.elem[e.prop]=e.now}}},Yn.propHooks.scrollTop=Yn.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},v.each(["toggle","show","hide"],function(e,t){var n=v.fn[t];v.fn[t]=function(r,i,s){return r==null||typeof r=="boolean"||!e&&v.isFunction(r)&&v.isFunction(i)?n.apply(this,arguments):this.animate(Zn(t,!0),r,i,s)}}),v.fn.extend({fadeTo:function(e,t,n,r){return this.filter(Gt).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=v.isEmptyObject(e),s=v.speed(t,n,r),o=function(){var t=Kn(this,v.extend({},e),s);i&&t.stop(!0)};return i||s.queue===!1?this.each(o):this.queue(s.queue,o)},stop:function(e,n,r){var i=function(e){var t=e.stop;delete e.stop,t(r)};return typeof e!="string"&&(r=n,n=e,e=t),n&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,n=e!=null&&e+"queueHooks",s=v.timers,o=v._data(this);if(n)o[n]&&o[n].stop&&i(o[n]);else for(n in o)o[n]&&o[n].stop&&Wn.test(n)&&i(o[n]);for(n=s.length;n--;)s[n].elem===this&&(e==null||s[n].queue===e)&&(s[n].anim.stop(r),t=!1,s.splice(n,1));(t||!r)&&v.dequeue(this,e)})}}),v.each({slideDown:Zn("show"),slideUp:Zn("hide"),slideToggle:Zn("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){v.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),v.speed=function(e,t,n){var r=e&&typeof e=="object"?v.extend({},e):{complete:n||!n&&t||v.isFunction(e)&&e,duration:e,easing:n&&t||t&&!v.isFunction(t)&&t};r.duration=v.fx.off?0:typeof r.duration=="number"?r.duration:r.duration in v.fx.speeds?v.fx.speeds[r.duration]:v.fx.speeds._default;if(r.queue==null||r.queue===!0)r.queue="fx";return r.old=r.complete,r.complete=function(){v.isFunction(r.old)&&r.old.call(this),r.queue&&v.dequeue(this,r.queue)},r},v.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2}},v.timers=[],v.fx=Yn.prototype.init,v.fx.tick=function(){var e,n=v.timers,r=0;qn=v.now();for(;r<n.length;r++)e=n[r],!e()&&n[r]===e&&n.splice(r--,1);n.length||v.fx.stop(),qn=t},v.fx.timer=function(e){e()&&v.timers.push(e)&&!Rn&&(Rn=setInterval(v.fx.tick,v.fx.interval))},v.fx.interval=13,v.fx.stop=function(){clearInterval(Rn),Rn=null},v.fx.speeds={slow:600,fast:200,_default:400},v.fx.step={},v.expr&&v.expr.filters&&(v.expr.filters.animated=function(e){return v.grep(v.timers,function(t){return e===t.elem}).length});var er=/^(?:body|html)$/i;v.fn.offset=function(e){if(arguments.length)return e===t?this:this.each(function(t){v.offset.setOffset(this,e,t)});var n,r,i,s,o,u,a,f={top:0,left:0},l=this[0],c=l&&l.ownerDocument;if(!c)return;return(r=c.body)===l?v.offset.bodyOffset(l):(n=c.documentElement,v.contains(n,l)?(typeof l.getBoundingClientRect!="undefined"&&(f=l.getBoundingClientRect()),i=tr(c),s=n.clientTop||r.clientTop||0,o=n.clientLeft||r.clientLeft||0,u=i.pageYOffset||n.scrollTop,a=i.pageXOffset||n.scrollLeft,{top:f.top+u-s,left:f.left+a-o}):f)},v.offset={bodyOffset:function(e){var t=e.offsetTop,n=e.offsetLeft;return v.support.doesNotIncludeMarginInBodyOffset&&(t+=parseFloat(v.css(e,"marginTop"))||0,n+=parseFloat(v.css(e,"marginLeft"))||0),{top:t,left:n}},setOffset:function(e,t,n){var r=v.css(e,"position");r==="static"&&(e.style.position="relative");var i=v(e),s=i.offset(),o=v.css(e,"top"),u=v.css(e,"left"),a=(r==="absolute"||r==="fixed")&&v.inArray("auto",[o,u])>-1,f={},l={},c,h;a?(l=i.position(),c=l.top,h=l.left):(c=parseFloat(o)||0,h=parseFloat(u)||0),v.isFunction(t)&&(t=t.call(e,n,s)),t.top!=null&&(f.top=t.top-s.top+c),t.left!=null&&(f.left=t.left-s.left+h),"using"in t?t.using.call(e,f):i.css(f)}},v.fn.extend({position:function(){if(!this[0])return;var e=this[0],t=this.offsetParent(),n=this.offset(),r=er.test(t[0].nodeName)?{top:0,left:0}:t.offset();return n.top-=parseFloat(v.css(e,"marginTop"))||0,n.left-=parseFloat(v.css(e,"marginLeft"))||0,r.top+=parseFloat(v.css(t[0],"borderTopWidth"))||0,r.left+=parseFloat(v.css(t[0],"borderLeftWidth"))||0,{top:n.top-r.top,left:n.left-r.left}},offsetParent:function(){return this.map(function(){var e=this.offsetParent||i.body;while(e&&!er.test(e.nodeName)&&v.css(e,"position")==="static")e=e.offsetParent;return e||i.body})}}),v.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,n){var r=/Y/.test(n);v.fn[e]=function(i){return v.access(this,function(e,i,s){var o=tr(e);if(s===t)return o?n in o?o[n]:o.document.documentElement[i]:e[i];o?o.scrollTo(r?v(o).scrollLeft():s,r?s:v(o).scrollTop()):e[i]=s},e,i,arguments.length,null)}}),v.each({Height:"height",Width:"width"},function(e,n){v.each({padding:"inner"+e,content:n,"":"outer"+e},function(r,i){v.fn[i]=function(i,s){var o=arguments.length&&(r||typeof i!="boolean"),u=r||(i===!0||s===!0?"margin":"border");return v.access(this,function(n,r,i){var s;return v.isWindow(n)?n.document.documentElement["client"+e]:n.nodeType===9?(s=n.documentElement,Math.max(n.body["scroll"+e],s["scroll"+e],n.body["offset"+e],s["offset"+e],s["client"+e])):i===t?v.css(n,r,i,u):v.style(n,r,i,u)},n,o?i:t,o,null)}})}),e.jQuery=e.$=v,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return v})})(window);
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

/**
 * @namespace
 * $.couch is used to communicate with a CouchDB server, the server methods can
 * be called directly without creating an instance. Typically all methods are
 * passed an <code>options</code> object which defines a success callback which
 * is called with the data returned from the http request to CouchDB, you can
 * find the other settings that can be used in the <code>options</code> object
 * from <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
 * jQuery.ajax settings</a>
 * <pre><code>$.couch.activeTasks({
 *   success: function (data) {
 *     console.log(data);
 *   }
 * });</code></pre>
 * Outputs (for example):
 * <pre><code>[
 *  {
 *   "pid" : "<0.11599.0>",
 *   "status" : "Copied 0 of 18369 changes (0%)",
 *   "task" : "recipes",
 *   "type" : "Database Compaction"
 *  }
 *]</code></pre>
 */
(function($) {

  $.couch = $.couch || {};
  /** @lends $.couch */

  /**
   * @private
   */
  function encodeDocId(docID) {
    var parts = docID.split("/");
    if (parts[0] == "_design") {
      parts.shift();
      return "_design/" + encodeURIComponent(parts.join('/'));
    }
    return encodeURIComponent(docID);
  }

  /**
   * @private
   */

  var uuidCache = [];

  $.extend($.couch, {
    urlPrefix: '',

    /**
     * You can obtain a list of active tasks by using the /_active_tasks URL.
     * The result is a JSON array of the currently running tasks, with each task
     * being described with a single object.
     * @see <a href="http://techzone.couchbase.com/sites/default/files/uploads/
     * all/documentation/couchbase-api-misc.html#couchbase-api-misc_active-task
     * s_get">docs for /_active_tasks</a>
     * @param {ajaxSettings} options <a href="http://api.jquery.com/jQuery.ajax
     * /#jQuery-ajax-settings">jQuery ajax settings</a>
     */
    activeTasks: function(options) {
      ajax(
        {url: this.urlPrefix + "/_active_tasks"},
        options,
        "Active task status could not be retrieved"
      );
    },

    /**
     * Returns a list of all the databases in the CouchDB instance
     * @see <a href="http://techzone.couchbase.com/sites/default/files/uploads/
     * all/documentation/couchbase-api-misc.html#couchbase-api-misc_active-task
     * s_get">docs for /_all_dbs</a>
     * @param {ajaxSettings} options <a href="http://api.jquery.com/jQuery.ajax
     * /#jQuery-ajax-settings">jQuery ajax settings</a>
     */
    allDbs: function(options) {
      ajax(
        {url: this.urlPrefix + "/_all_dbs"},
        options,
        "An error occurred retrieving the list of all databases"
      );
    },

    /**
     * View and edit the CouchDB configuration, called with just the options
     * parameter the entire config is returned, you can be more specific by
     * passing the section and option parameters, if you specify a value that
     * value will be stored in the configuration.
     * @see <a href="http://techzone.couchbase.com/sites/default/files/uploads/
     * all/documentation/couchbase-api-config.html#couchbase-api-config_config
     * -section-key_put">docs for /_config</a>
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
     * jQuery ajax settings</a>
     * @param {String} [section] the section of the config
     * @param {String} [option] the particular config option
     * @param {String} [value] value to be set
     */
    config: function(options, section, option, value) {
      var req = {url: this.urlPrefix + "/_config/"};
      if (section) {
        req.url += encodeURIComponent(section) + "/";
        if (option) {
          req.url += encodeURIComponent(option);
        }
      }
      if (value === null) {
        req.type = "DELETE";        
      } else if (value !== undefined) {
        req.type = "PUT";
        req.data = toJSON(value);
        req.contentType = "application/json";
        req.processData = false
      }

      ajax(req, options,
        "An error occurred retrieving/updating the server configuration"
      );
    },
    
    /**
     * Returns the session information for the currently logged in user.
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
     * jQuery ajax settings</a>
     */
    session: function(options) {
      options = options || {};
      $.ajax({
        type: "GET", url: this.urlPrefix + "/_session",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Accept', 'application/json');
        },
        complete: function(req) {
          var resp = $.parseJSON(req.responseText);
          if (req.status == 200) {
            if (options.success) options.success(resp);
          } else if (options.error) {
            options.error(req.status, resp.error, resp.reason);
          } else {
            alert("An error occurred getting session info: " + resp.reason);
          }
        }
      });
    },

    /**
     * @private
     */
    userDb : function(callback) {
      $.couch.session({
        success : function(resp) {
          var userDb = $.couch.db(resp.info.authentication_db);
          callback(userDb);
        }
      });
    },

    /**
     * Create a new user on the CouchDB server, <code>user_doc</code> is an
     * object with a <code>name</code> field and other information you want
     * to store relating to that user, for example
     * <code>{"name": "daleharvey"}</code>
     * @param {Object} user_doc Users details
     * @param {String} password Users password
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
      * jQuery ajax settings</a>
     */
    signup: function(user_doc, password, options) {      
      options = options || {};
      // prepare user doc based on name and password
      user_doc = this.prepareUserDoc(user_doc, password);
      $.couch.userDb(function(db) {
        db.saveDoc(user_doc, options);
      });
    },

    /**
     * Populates a user doc with a new password.
     * @param {Object} user_doc User details
     * @param {String} new_password New Password
     */
    prepareUserDoc: function(user_doc, new_password) {
      if (typeof hex_sha1 == "undefined") {
        alert("creating a user doc requires sha1.js to be loaded in the page");
        return;
      }
      var user_prefix = "org.couchdb.user:";
      user_doc._id = user_doc._id || user_prefix + user_doc.name;
      if (new_password) {
        // handle the password crypto
        user_doc.salt = $.couch.newUUID();
        user_doc.password_sha = hex_sha1(new_password + user_doc.salt);
      }
      user_doc.type = "user";
      if (!user_doc.roles) {
        user_doc.roles = [];
      }
      return user_doc;
    },

    /**
     * Authenticate against CouchDB, the <code>options</code> parameter is
      *expected to have <code>name</code> and <code>password</code> fields.
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
     * jQuery ajax settings</a>
     */
    login: function(options) {
      options = options || {};
      $.ajax({
        type: "POST", url: this.urlPrefix + "/_session", dataType: "json",
        data: {name: options.name, password: options.password},
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Accept', 'application/json');
        },
        complete: function(req) {
          var resp = $.parseJSON(req.responseText);
          if (req.status == 200) {
            if (options.success) options.success(resp);
          } else if (options.error) {
            options.error(req.status, resp.error, resp.reason);
          } else {
            alert("An error occurred logging in: " + resp.reason);
          }
        }
      });
    },


    /**
     * Delete your current CouchDB user session
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
     * jQuery ajax settings</a>
     */
    logout: function(options) {
      options = options || {};
      $.ajax({
        type: "DELETE", url: this.urlPrefix + "/_session", dataType: "json",
        username : "_", password : "_",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Accept', 'application/json');
        },
        complete: function(req) {
          var resp = $.parseJSON(req.responseText);
          if (req.status == 200) {
            if (options.success) options.success(resp);
          } else if (options.error) {
            options.error(req.status, resp.error, resp.reason);
          } else {
            alert("An error occurred logging out: " + resp.reason);
          }
        }
      });
    },

    /**
     * @namespace
     * $.couch.db is used to communicate with a specific CouchDB database
     * <pre><code>var $db = $.couch.db("mydatabase");
     *$db.allApps({
     *  success: function (data) {
     *    ... process data ...
     *  }
     *});
     * </code></pre>
     */
    db: function(name, db_opts) {
      db_opts = db_opts || {};
      var rawDocs = {};
      function maybeApplyVersion(doc) {
        if (doc._id && doc._rev && rawDocs[doc._id] &&
            rawDocs[doc._id].rev == doc._rev) {
          // todo: can we use commonjs require here?
          if (typeof Base64 == "undefined") {
            alert("please include /_utils/script/base64.js in the page for " +
                  "base64 support");
            return false;
          } else {
            doc._attachments = doc._attachments || {};
            doc._attachments["rev-"+doc._rev.split("-")[0]] = {
              content_type :"application/json",
              data : Base64.encode(rawDocs[doc._id].raw)
            };
            return true;
          }
        }
      };
      return /** @lends $.couch.db */{
        name: name,
        uri: this.urlPrefix + "/" + encodeURIComponent(name) + "/",

        /**
         * Request compaction of the specified database.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db-compact_post">docs for /db/_compact</a>
         * @param {ajaxSettings} options
         * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
         * jQuery ajax settings</a>
         */
        compact: function(options) {
          $.extend(options, {successStatus: 202});
          ajax({
              type: "POST", url: this.uri + "_compact",
              data: "", processData: false
            },
            options,
            "The database could not be compacted"
          );
        },

        /**
         * Cleans up the cached view output on disk for a given view.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db
         * _db-view-cleanup_post">docs for /db/_compact</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        viewCleanup: function(options) {
          $.extend(options, {successStatus: 202});
          ajax({
              type: "POST", url: this.uri + "_view_cleanup",
              data: "", processData: false
            },
            options,
            "The views could not be cleaned up"
          );
        },

        /**
         * Compacts the view indexes associated with the specified design
         * document. You can use this in place of the full database compaction
         * if you know a specific set of view indexes have been affected by a
         * recent database change.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/upl
         * oads/all/documentation/couchbase-api-db.html#couchbase-api-db_db-
         * compact-design-doc_post">docs for /db/_compact/design-doc</a>
         * @param {String} groupname Name of design-doc to compact
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        compactView: function(groupname, options) {
          $.extend(options, {successStatus: 202});
          ajax({
              type: "POST", url: this.uri + "_compact/" + groupname,
              data: "", processData: false
            },
            options,
            "The view could not be compacted"
          );
        },

        /**
         * Create a new database
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db_put">docs for PUT /db/</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        create: function(options) {
          $.extend(options, {successStatus: 201});
          ajax({
              type: "PUT", url: this.uri, contentType: "application/json",
              data: "", processData: false
            },
            options,
            "The database could not be created"
          );
        },

        /**
         * Deletes the specified database, and all the documents and
         * attachments contained within it.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db_delete">docs for DELETE /db/</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        drop: function(options) {
          ajax(
            {type: "DELETE", url: this.uri},
            options,
            "The database could not be deleted"
          );
        },

        /**
         * Gets information about the specified database.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db
         * _db_get">docs for GET /db/</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        info: function(options) {
          ajax(
            {url: this.uri},
            options,
            "Database information could not be retrieved"
          );
        },

        /**
         * @namespace
         * $.couch.db.changes provides an API for subscribing to the changes
         * feed
         * <pre><code>var $changes = $.couch.db("mydatabase").changes();
         *$changes.onChange = function (data) {
         *    ... process data ...
         * }
         * $changes.stop();
         * </code></pre>
         */
        changes: function(since, options) {

          options = options || {};
          // set up the promise object within a closure for this handler
          var timeout = 100, db = this, active = true,
            listeners = [],
            promise = /** @lends $.couch.db.changes */ {
              /**
               * Add a listener callback
               * @see <a href="http://techzone.couchbase.com/sites/default/
               * files/uploads/all/documentation/couchbase-api-db.html#couch
               * base-api-db_db-changes_get">docs for /db/_changes</a>
               * @param {Function} fun Callback function to run when
               * notified of changes.
               */
            onChange : function(fun) {
              listeners.push(fun);
            },
              /**
               * Stop subscribing to the changes feed
               */
            stop : function() {
              active = false;
            }
          };
          // call each listener when there is a change
          function triggerListeners(resp) {
            $.each(listeners, function() {
              this(resp);
            });
          };
          // when there is a change, call any listeners, then check for
          // another change
          options.success = function(resp) {
            timeout = 100;
            if (active) {
              since = resp.last_seq;
              triggerListeners(resp);
              getChangesSince();
            };
          };
          options.error = function() {
            if (active) {
              setTimeout(getChangesSince, timeout);
              timeout = timeout * 2;
            }
          };
          // actually make the changes request
          function getChangesSince() {
            var opts = $.extend({heartbeat : 10 * 1000}, options, {
              feed : "longpoll",
              since : since
            });
            ajax(
              {url: db.uri + "_changes"+encodeOptions(opts)},
              options,
              "Error connecting to "+db.uri+"/_changes."
            );
          }
          // start the first request
          if (since) {
            getChangesSince();
          } else {
            db.info({
              success : function(info) {
                since = info.update_seq;
                getChangesSince();
              }
            });
          }
          return promise;
        },

        /**
         * Fetch all the docs in this db, you can specify an array of keys to
         * fetch by passing the <code>keys</code> field in the
         * <code>options</code>
         * parameter.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db-all-docs_get">docs for /db/all_docs/</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        allDocs: function(options) {
          var type = "GET";
          var data = null;
          if (options["keys"]) {
            type = "POST";
            var keys = options["keys"];
            delete options["keys"];
            data = toJSON({ "keys": keys });
          }
          ajax({
              type: type,
              data: data,
              url: this.uri + "_all_docs" + encodeOptions(options)
            },
            options,
            "An error occurred retrieving a list of all documents"
          );
        },

        /**
         * Fetch all the design docs in this db
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        allDesignDocs: function(options) {
          this.allDocs($.extend(
            {startkey:"_design", endkey:"_design0"}, options));
        },

        /**
         * Fetch all the design docs with an index.html, <code>options</code>
         * parameter expects an <code>eachApp</code> field which is a callback
         * called on each app found.
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        allApps: function(options) {
          options = options || {};
          var self = this;
          if (options.eachApp) {
            this.allDesignDocs({
              success: function(resp) {
                $.each(resp.rows, function() {
                  self.openDoc(this.id, {
                    success: function(ddoc) {
                      var index, appPath, appName = ddoc._id.split('/');
                      appName.shift();
                      appName = appName.join('/');
                      index = ddoc.couchapp && ddoc.couchapp.index;
                      if (index) {
                        appPath = ['', name, ddoc._id, index].join('/');
                      } else if (ddoc._attachments &&
                                 ddoc._attachments["index.html"]) {
                        appPath = ['', name, ddoc._id, "index.html"].join('/');
                      }
                      if (appPath) options.eachApp(appName, appPath, ddoc);
                    }
                  });
                });
              }
            });
          } else {
            alert("Please provide an eachApp function for allApps()");
          }
        },

        /**
         * Returns the specified doc from the specified db.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-dbdoc.html#couchbase-api-
         * dbdoc_db-doc_get">docs for GET /db/doc</a>
         * @param {String} docId id of document to fetch
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         * @param {ajaxSettings} ajaxOptions <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        openDoc: function(docId, options, ajaxOptions) {
          options = options || {};
          if (db_opts.attachPrevRev || options.attachPrevRev) {
            $.extend(options, {
              beforeSuccess : function(req, doc) {
                rawDocs[doc._id] = {
                  rev : doc._rev,
                  raw : req.responseText
                };
              }
            });
          } else {
            $.extend(options, {
              beforeSuccess : function(req, doc) {
                if (doc["jquery.couch.attachPrevRev"]) {
                  rawDocs[doc._id] = {
                    rev : doc._rev,
                    raw : req.responseText
                  };
                }
              }
            });
          }
          ajax({url: this.uri + encodeDocId(docId) + encodeOptions(options)},
            options,
            "The document could not be retrieved",
            ajaxOptions
          );
        },

        /**
         * Create a new document in the specified database, using the supplied
         * JSON document structure. If the JSON structure includes the _id
         * field, then the document will be created with the specified document
         * ID. If the _id field is not specified, a new unique ID will be
         * generated.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-dbdoc.html#couchbase-api-
         * dbdoc_db_post">docs for GET /db/doc</a>
         * @param {String} doc document to save
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        saveDoc: function(doc, options) {
          options = options || {};
          var db = this;
          var beforeSend = fullCommit(options);
          if (doc._id === undefined) {
            var method = "POST";
            var uri = this.uri;
          } else {
            var method = "PUT";
            var uri = this.uri + encodeDocId(doc._id);
          }
          var versioned = maybeApplyVersion(doc);
          $.ajax({
            type: method, url: uri + encodeOptions(options),
            contentType: "application/json",
            dataType: "json", data: toJSON(doc),
            beforeSend : beforeSend,
            complete: function(req) {
              var resp = $.parseJSON(req.responseText);
              if (req.status == 200 || req.status == 201 || req.status == 202) {
                doc._id = resp.id;
                doc._rev = resp.rev;
                if (versioned) {
                  db.openDoc(doc._id, {
                    attachPrevRev : true,
                    success : function(d) {
                      doc._attachments = d._attachments;
                      if (options.success) options.success(resp);
                    }
                  });
                } else {
                  if (options.success) options.success(resp);
                }
              } else if (options.error) {
                options.error(req.status, resp.error, resp.reason);
              } else {
                alert("The document could not be saved: " + resp.reason);
              }
            }
          });
        },

        /**
         * Save a list of documents
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db-bulk-docs_post">docs for /db/_bulk_docs</a>
         * @param {Object[]} docs List of documents to save
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        bulkSave: function(docs, options) {
          var beforeSend = fullCommit(options);
          $.extend(options, {successStatus: 201, beforeSend : beforeSend});
          ajax({
              type: "POST",
              url: this.uri + "_bulk_docs" + encodeOptions(options),
              contentType: "application/json", data: toJSON(docs)
            },
            options,
            "The documents could not be saved"
          );
        },

        /**
         * Deletes the specified document from the database. You must supply
         * the current (latest) revision and <code>id</code> of the document
         * to delete eg <code>removeDoc({_id:"mydoc", _rev: "1-2345"})</code>
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-dbdoc.html#couchbase-api
         * -dbdoc_db-doc_delete">docs for DELETE /db/doc</a>
         * @param {Object} doc Document to delete
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        removeDoc: function(doc, options) {
          ajax({
              type: "DELETE",
              url: this.uri +
                   encodeDocId(doc._id) +
                   encodeOptions({rev: doc._rev})
            },
            options,
            "The document could not be deleted"
          );
        },

        /**
         * Remove a set of documents
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db-bulk-docs_post">docs for /db/_bulk_docs</a>
         * @param {String[]} docs List of document id's to remove
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        bulkRemove: function(docs, options){
          docs.docs = $.each(
            docs.docs, function(i, doc){
              doc._deleted = true;
            }
          );
          $.extend(options, {successStatus: 201});
          ajax({
              type: "POST",
              url: this.uri + "_bulk_docs" + encodeOptions(options),
              data: toJSON(docs)
            },
            options,
            "The documents could not be deleted"
          );
        },

        /**
         * The COPY command (which is non-standard HTTP) copies an existing
         * document to a new or existing document.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-dbdoc.html#couchbase-api-
         * dbdoc_db-doc_copy">docs for COPY /db/doc</a>
         * @param {String[]} docId document id to copy
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        copyDoc: function(docId, options, ajaxOptions) {
          ajaxOptions = $.extend(ajaxOptions, {
            complete: function(req) {
              var resp = $.parseJSON(req.responseText);
              if (req.status == 201) {
                if (options.success) options.success(resp);
              } else if (options.error) {
                options.error(req.status, resp.error, resp.reason);
              } else {
                alert("The document could not be copied: " + resp.reason);
              }
            }
          });
          ajax({
              type: "COPY",
              url: this.uri + encodeDocId(docId)
            },
            options,
            "The document could not be copied",
            ajaxOptions
          );
        },

        /**
         * Creates (and executes) a temporary view based on the view function
         * supplied in the JSON request.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db
         * _db-temp-view_post">docs for /db/_temp_view</a>
         * @param {Function} mapFun Map function
         * @param {Function} reduceFun Reduce function
         * @param {Function} language Language the map / reduce funs are
         * implemented in
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        query: function(mapFun, reduceFun, language, options) {
          language = language || "javascript";
          if (typeof(mapFun) !== "string") {
            mapFun = mapFun.toSource ? mapFun.toSource()
              : "(" + mapFun.toString() + ")";
          }
          var body = {language: language, map: mapFun};
          if (reduceFun != null) {
            if (typeof(reduceFun) !== "string")
              reduceFun = reduceFun.toSource ? reduceFun.toSource()
                : "(" + reduceFun.toString() + ")";
            body.reduce = reduceFun;
          }
          ajax({
              type: "POST",
              url: this.uri + "_temp_view" + encodeOptions(options),
              contentType: "application/json", data: toJSON(body)
            },
            options,
            "An error occurred querying the database"
          );
        },

        /**
         * Fetch a _list view output, you can specify a list of
         * <code>keys</code> in the options object to recieve only those keys.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-design.html#couchbase-api
         * -design_db-design-designdoc-list-listname-viewname_get">
         * docs for /db/_design/design-doc/_list/l1/v1</a>
         * @param {String} list Listname in the form of ddoc/listname
         * @param {String} view View to run list against
         * @param {options} CouchDB <a href="http://wiki.apache.org/couchdb/
         * HTTP_view_API">View Options</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        list: function(list, view, options, ajaxOptions) {
          var list = list.split('/');
          var options = options || {};
          var type = 'GET';
          var data = null;
          if (options['keys']) {
            type = 'POST';
            var keys = options['keys'];
            delete options['keys'];
            data = toJSON({'keys': keys });
          }
          ajax({
              type: type,
              data: data,
              url: this.uri + '_design/' + list[0] +
                   '/_list/' + list[1] + '/' + view + encodeOptions(options)
              },
              ajaxOptions, 'An error occured accessing the list'
          );
        },

        /**
         * Executes the specified view-name from the specified design-doc
         * design document, you can specify a list of <code>keys</code>
         * in the options object to recieve only those keys.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-design.html#couchbase-api-
         * design_db-design-designdoc-view-viewname_get">docs for /db/
         * _design/design-doc/_list/l1/v1</a>
         * @param {String} name View to run list against
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        view: function(name, options) {
          var name = name.split('/');
          var options = options || {};
          var type = "GET";
          var data= null;
          if (options["keys"]) {
            type = "POST";
            var keys = options["keys"];
            delete options["keys"];
            data = toJSON({ "keys": keys });
          }
          ajax({
              type: type,
              data: data,
              url: this.uri + "_design/" + name[0] +
                   "/_view/" + name[1] + encodeOptions(options)
            },
            options, "An error occurred accessing the view"
          );
        },

        /**
         * Fetch an arbitrary CouchDB database property
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api.html">docs for /db/_prop</a>
         * @param {String} propName Propery name to fetch
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         * @param {ajaxSettings} ajaxOptions <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        getDbProperty: function(propName, options, ajaxOptions) {
          ajax({url: this.uri + propName + encodeOptions(options)},
            options,
            "The property could not be retrieved",
            ajaxOptions
          );
        },

        /**
         * Set an arbitrary CouchDB database property
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api.html">docs for /db/_prop</a>
         * @param {String} propName Propery name to fetch
         * @param {String} propValue Propery value to set
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         * @param {ajaxSettings} ajaxOptions <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        setDbProperty: function(propName, propValue, options, ajaxOptions) {
          ajax({
            type: "PUT", 
            url: this.uri + propName + encodeOptions(options),
            data : JSON.stringify(propValue)
          },
            options,
            "The property could not be updated",
            ajaxOptions
          );
        }
      };
    },

    encodeDocId: encodeDocId, 

    /**
     * Accessing the root of a CouchDB instance returns meta information about
     * the instance. The response is a JSON structure containing information
     * about the server, including a welcome message and the version of the
     * server.
     * @see <a href="http://techzone.couchbase.com/sites/default/files/uploads/
     * all/documentation/couchbase-api-misc.html#couchbase-api-misc_root_get">
     * docs for GET /</a>
     * @param {ajaxSettings} options <a href="http://api.jquery.com/
     * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
     */
    info: function(options) {
      ajax(
        {url: this.urlPrefix + "/"},
        options,
        "Server information could not be retrieved"
      );
    },

    /**
     * Request, configure, or stop, a replication operation.
     * @see <a href="http://techzone.couchbase.com/sites/default/files/
     * uploads/all/documentation/couchbase-api-misc.html#couchbase-api-
     * misc_replicate_post">docs for POST /_replicate</a>
     * @param {String} source Path or url to source database
     * @param {String} target Path or url to target database
     * @param {ajaxSettings} ajaxOptions <a href="http://api.jquery.com/
     * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
     * @param {Object} repOpts Additional replication options
     */
    replicate: function(source, target, ajaxOptions, repOpts) {
      repOpts = $.extend({source: source, target: target}, repOpts);
      if (repOpts.continuous && !repOpts.cancel) {
        ajaxOptions.successStatus = 202;
      }
      ajax({
          type: "POST", url: this.urlPrefix + "/_replicate",
          data: JSON.stringify(repOpts),
          contentType: "application/json"
        },
        ajaxOptions,
        "Replication failed"
      );
    },

    /**
     * Fetch a new UUID
     * @see <a href="http://techzone.couchbase.com/sites/default/files/
     * uploads/all/documentation/couchbase-api-misc.html#couchbase-api-
     * misc_uuids_get">docs for /_uuids</a>
     * @param {Int} cacheNum Number of uuids to keep cached for future use
     */
    newUUID: function(cacheNum) {
      if (cacheNum === undefined) {
        cacheNum = 1;
      }
      if (!uuidCache.length) {
        ajax({url: this.urlPrefix + "/_uuids", data: {count: cacheNum}, async:
              false}, {
            success: function(resp) {
              uuidCache = resp.uuids;
            }
          },
          "Failed to retrieve UUID batch."
        );
      }
      return uuidCache.shift();
    }
  });

  /**
   * @private
   */
  function ajax(obj, options, errorMessage, ajaxOptions) {

    var defaultAjaxOpts = {
      contentType: "application/json",
      headers:{"Accept": "application/json"}
    };

    options = $.extend({successStatus: 200}, options);
    ajaxOptions = $.extend(defaultAjaxOpts, ajaxOptions);
    errorMessage = errorMessage || "Unknown error";
    $.ajax($.extend($.extend({
      type: "GET", dataType: "json", cache : !$.browser.msie,
      beforeSend: function(xhr){
        if(ajaxOptions && ajaxOptions.headers){
          for (var header in ajaxOptions.headers){
            xhr.setRequestHeader(header, ajaxOptions.headers[header]);
          }
        }
      },
      complete: function(req) {
        try {
          var resp = $.parseJSON(req.responseText);
        } catch(e) {
          if (options.error) {
            options.error(req.status, req, e);
          } else {
            alert(errorMessage + ": " + e);
          }
          return;
        }
        if (options.ajaxStart) {
          options.ajaxStart(resp);
        }
        if (req.status == options.successStatus) {
          if (options.beforeSuccess) options.beforeSuccess(req, resp);
          if (options.success) options.success(resp);
        } else if (options.error) {
          options.error(req.status, resp && resp.error ||
                        errorMessage, resp && resp.reason || "no response");
        } else {
          alert(errorMessage + ": " + resp.reason);
        }
      }
    }, obj), ajaxOptions));
  }

  /**
   * @private
   */
  function fullCommit(options) {
    var options = options || {};
    if (typeof options.ensure_full_commit !== "undefined") {
      var commit = options.ensure_full_commit;
      delete options.ensure_full_commit;
      return function(xhr) {
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader("X-Couch-Full-Commit", commit.toString());
      };
    }
  };

  /**
   * @private
   */
  // Convert a options object to an url query string.
  // ex: {key:'value',key2:'value2'} becomes '?key="value"&key2="value2"'
  function encodeOptions(options) {
    var buf = [];
    if (typeof(options) === "object" && options !== null) {
      for (var name in options) {
        if ($.inArray(name,
                      ["error", "success", "beforeSuccess", "ajaxStart"]) >= 0)
          continue;
        var value = options[name];
        if ($.inArray(name, ["key", "startkey", "endkey"]) >= 0) {
          value = toJSON(value);
        }
        buf.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
      }
    }
    return buf.length ? "?" + buf.join("&") : "";
  }

  /**
   * @private
   */
  function toJSON(obj) {
    return obj !== null ? JSON.stringify(obj) : null;
  }

})(jQuery);
define("jquery-couch", ["jquery"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.$;
    };
}(this)));

/*!
* Bootstrap.js by @fat & @mdo
* Copyright 2012 Twitter, Inc.
* http://www.apache.org/licenses/LICENSE-2.0.txt
*/
!function(e){e(function(){e.support.transition=function(){var e=function(){var e=document.createElement("bootstrap"),t={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},n;for(n in t)if(e.style[n]!==undefined)return t[n]}();return e&&{end:e}}()})}(window.jQuery),!function(e){var t='[data-dismiss="alert"]',n=function(n){e(n).on("click",t,this.close)};n.prototype.close=function(t){function s(){i.trigger("closed").remove()}var n=e(this),r=n.attr("data-target"),i;r||(r=n.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,"")),i=e(r),t&&t.preventDefault(),i.length||(i=n.hasClass("alert")?n:n.parent()),i.trigger(t=e.Event("close"));if(t.isDefaultPrevented())return;i.removeClass("in"),e.support.transition&&i.hasClass("fade")?i.on(e.support.transition.end,s):s()},e.fn.alert=function(t){return this.each(function(){var r=e(this),i=r.data("alert");i||r.data("alert",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.alert.Constructor=n,e(document).on("click.alert.data-api",t,n.prototype.close)}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.button.defaults,n)};t.prototype.setState=function(e){var t="disabled",n=this.$element,r=n.data(),i=n.is("input")?"val":"html";e+="Text",r.resetText||n.data("resetText",n[i]()),n[i](r[e]||this.options[e]),setTimeout(function(){e=="loadingText"?n.addClass(t).attr(t,t):n.removeClass(t).removeAttr(t)},0)},t.prototype.toggle=function(){var e=this.$element.closest('[data-toggle="buttons-radio"]');e&&e.find(".active").removeClass("active"),this.$element.toggleClass("active")},e.fn.button=function(n){return this.each(function(){var r=e(this),i=r.data("button"),s=typeof n=="object"&&n;i||r.data("button",i=new t(this,s)),n=="toggle"?i.toggle():n&&i.setState(n)})},e.fn.button.defaults={loadingText:"loading..."},e.fn.button.Constructor=t,e(document).on("click.button.data-api","[data-toggle^=button]",function(t){var n=e(t.target);n.hasClass("btn")||(n=n.closest(".btn")),n.button("toggle")})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=n,this.options.slide&&this.slide(this.options.slide),this.options.pause=="hover"&&this.$element.on("mouseenter",e.proxy(this.pause,this)).on("mouseleave",e.proxy(this.cycle,this))};t.prototype={cycle:function(t){return t||(this.paused=!1),this.options.interval&&!this.paused&&(this.interval=setInterval(e.proxy(this.next,this),this.options.interval)),this},to:function(t){var n=this.$element.find(".item.active"),r=n.parent().children(),i=r.index(n),s=this;if(t>r.length-1||t<0)return;return this.sliding?this.$element.one("slid",function(){s.to(t)}):i==t?this.pause().cycle():this.slide(t>i?"next":"prev",e(r[t]))},pause:function(t){return t||(this.paused=!0),this.$element.find(".next, .prev").length&&e.support.transition.end&&(this.$element.trigger(e.support.transition.end),this.cycle()),clearInterval(this.interval),this.interval=null,this},next:function(){if(this.sliding)return;return this.slide("next")},prev:function(){if(this.sliding)return;return this.slide("prev")},slide:function(t,n){var r=this.$element.find(".item.active"),i=n||r[t](),s=this.interval,o=t=="next"?"left":"right",u=t=="next"?"first":"last",a=this,f;this.sliding=!0,s&&this.pause(),i=i.length?i:this.$element.find(".item")[u](),f=e.Event("slide",{relatedTarget:i[0]});if(i.hasClass("active"))return;if(e.support.transition&&this.$element.hasClass("slide")){this.$element.trigger(f);if(f.isDefaultPrevented())return;i.addClass(t),i[0].offsetWidth,r.addClass(o),i.addClass(o),this.$element.one(e.support.transition.end,function(){i.removeClass([t,o].join(" ")).addClass("active"),r.removeClass(["active",o].join(" ")),a.sliding=!1,setTimeout(function(){a.$element.trigger("slid")},0)})}else{this.$element.trigger(f);if(f.isDefaultPrevented())return;r.removeClass("active"),i.addClass("active"),this.sliding=!1,this.$element.trigger("slid")}return s&&this.cycle(),this}},e.fn.carousel=function(n){return this.each(function(){var r=e(this),i=r.data("carousel"),s=e.extend({},e.fn.carousel.defaults,typeof n=="object"&&n),o=typeof n=="string"?n:s.slide;i||r.data("carousel",i=new t(this,s)),typeof n=="number"?i.to(n):o?i[o]():s.interval&&i.cycle()})},e.fn.carousel.defaults={interval:5e3,pause:"hover"},e.fn.carousel.Constructor=t,e(document).on("click.carousel.data-api","[data-slide]",function(t){var n=e(this),r,i=e(n.attr("data-target")||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,"")),s=e.extend({},i.data(),n.data());i.carousel(s),t.preventDefault()})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.collapse.defaults,n),this.options.parent&&(this.$parent=e(this.options.parent)),this.options.toggle&&this.toggle()};t.prototype={constructor:t,dimension:function(){var e=this.$element.hasClass("width");return e?"width":"height"},show:function(){var t,n,r,i;if(this.transitioning)return;t=this.dimension(),n=e.camelCase(["scroll",t].join("-")),r=this.$parent&&this.$parent.find("> .accordion-group > .in");if(r&&r.length){i=r.data("collapse");if(i&&i.transitioning)return;r.collapse("hide"),i||r.data("collapse",null)}this.$element[t](0),this.transition("addClass",e.Event("show"),"shown"),e.support.transition&&this.$element[t](this.$element[0][n])},hide:function(){var t;if(this.transitioning)return;t=this.dimension(),this.reset(this.$element[t]()),this.transition("removeClass",e.Event("hide"),"hidden"),this.$element[t](0)},reset:function(e){var t=this.dimension();return this.$element.removeClass("collapse")[t](e||"auto")[0].offsetWidth,this.$element[e!==null?"addClass":"removeClass"]("collapse"),this},transition:function(t,n,r){var i=this,s=function(){n.type=="show"&&i.reset(),i.transitioning=0,i.$element.trigger(r)};this.$element.trigger(n);if(n.isDefaultPrevented())return;this.transitioning=1,this.$element[t]("in"),e.support.transition&&this.$element.hasClass("collapse")?this.$element.one(e.support.transition.end,s):s()},toggle:function(){this[this.$element.hasClass("in")?"hide":"show"]()}},e.fn.collapse=function(n){return this.each(function(){var r=e(this),i=r.data("collapse"),s=typeof n=="object"&&n;i||r.data("collapse",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.collapse.defaults={toggle:!0},e.fn.collapse.Constructor=t,e(document).on("click.collapse.data-api","[data-toggle=collapse]",function(t){var n=e(this),r,i=n.attr("data-target")||t.preventDefault()||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,""),s=e(i).data("collapse")?"toggle":n.data();n[e(i).hasClass("in")?"addClass":"removeClass"]("collapsed"),e(i).collapse(s)})}(window.jQuery),!function(e){function r(){e(t).each(function(){i(e(this)).removeClass("open")})}function i(t){var n=t.attr("data-target"),r;return n||(n=t.attr("href"),n=n&&/#/.test(n)&&n.replace(/.*(?=#[^\s]*$)/,"")),r=e(n),r.length||(r=t.parent()),r}var t="[data-toggle=dropdown]",n=function(t){var n=e(t).on("click.dropdown.data-api",this.toggle);e("html").on("click.dropdown.data-api",function(){n.parent().removeClass("open")})};n.prototype={constructor:n,toggle:function(t){var n=e(this),s,o;if(n.is(".disabled, :disabled"))return;return s=i(n),o=s.hasClass("open"),r(),o||(s.toggleClass("open"),n.focus()),!1},keydown:function(t){var n,r,s,o,u,a;if(!/(38|40|27)/.test(t.keyCode))return;n=e(this),t.preventDefault(),t.stopPropagation();if(n.is(".disabled, :disabled"))return;o=i(n),u=o.hasClass("open");if(!u||u&&t.keyCode==27)return n.click();r=e("[role=menu] li:not(.divider) a",o);if(!r.length)return;a=r.index(r.filter(":focus")),t.keyCode==38&&a>0&&a--,t.keyCode==40&&a<r.length-1&&a++,~a||(a=0),r.eq(a).focus()}},e.fn.dropdown=function(t){return this.each(function(){var r=e(this),i=r.data("dropdown");i||r.data("dropdown",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.dropdown.Constructor=n,e(document).on("click.dropdown.data-api touchstart.dropdown.data-api",r).on("click.dropdown touchstart.dropdown.data-api",".dropdown form",function(e){e.stopPropagation()}).on("click.dropdown.data-api touchstart.dropdown.data-api",t,n.prototype.toggle).on("keydown.dropdown.data-api touchstart.dropdown.data-api",t+", [role=menu]",n.prototype.keydown)}(window.jQuery),!function(e){var t=function(t,n){this.options=n,this.$element=e(t).delegate('[data-dismiss="modal"]',"click.dismiss.modal",e.proxy(this.hide,this)),this.options.remote&&this.$element.find(".modal-body").load(this.options.remote)};t.prototype={constructor:t,toggle:function(){return this[this.isShown?"hide":"show"]()},show:function(){var t=this,n=e.Event("show");this.$element.trigger(n);if(this.isShown||n.isDefaultPrevented())return;this.isShown=!0,this.escape(),this.backdrop(function(){var n=e.support.transition&&t.$element.hasClass("fade");t.$element.parent().length||t.$element.appendTo(document.body),t.$element.show(),n&&t.$element[0].offsetWidth,t.$element.addClass("in").attr("aria-hidden",!1),t.enforceFocus(),n?t.$element.one(e.support.transition.end,function(){t.$element.focus().trigger("shown")}):t.$element.focus().trigger("shown")})},hide:function(t){t&&t.preventDefault();var n=this;t=e.Event("hide"),this.$element.trigger(t);if(!this.isShown||t.isDefaultPrevented())return;this.isShown=!1,this.escape(),e(document).off("focusin.modal"),this.$element.removeClass("in").attr("aria-hidden",!0),e.support.transition&&this.$element.hasClass("fade")?this.hideWithTransition():this.hideModal()},enforceFocus:function(){var t=this;e(document).on("focusin.modal",function(e){t.$element[0]!==e.target&&!t.$element.has(e.target).length&&t.$element.focus()})},escape:function(){var e=this;this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.modal",function(t){t.which==27&&e.hide()}):this.isShown||this.$element.off("keyup.dismiss.modal")},hideWithTransition:function(){var t=this,n=setTimeout(function(){t.$element.off(e.support.transition.end),t.hideModal()},500);this.$element.one(e.support.transition.end,function(){clearTimeout(n),t.hideModal()})},hideModal:function(e){this.$element.hide().trigger("hidden"),this.backdrop()},removeBackdrop:function(){this.$backdrop.remove(),this.$backdrop=null},backdrop:function(t){var n=this,r=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var i=e.support.transition&&r;this.$backdrop=e('<div class="modal-backdrop '+r+'" />').appendTo(document.body),this.$backdrop.click(this.options.backdrop=="static"?e.proxy(this.$element[0].focus,this.$element[0]):e.proxy(this.hide,this)),i&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),i?this.$backdrop.one(e.support.transition.end,t):t()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),e.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(e.support.transition.end,e.proxy(this.removeBackdrop,this)):this.removeBackdrop()):t&&t()}},e.fn.modal=function(n){return this.each(function(){var r=e(this),i=r.data("modal"),s=e.extend({},e.fn.modal.defaults,r.data(),typeof n=="object"&&n);i||r.data("modal",i=new t(this,s)),typeof n=="string"?i[n]():s.show&&i.show()})},e.fn.modal.defaults={backdrop:!0,keyboard:!0,show:!0},e.fn.modal.Constructor=t,e(document).on("click.modal.data-api",'[data-toggle="modal"]',function(t){var n=e(this),r=n.attr("href"),i=e(n.attr("data-target")||r&&r.replace(/.*(?=#[^\s]+$)/,"")),s=i.data("modal")?"toggle":e.extend({remote:!/#/.test(r)&&r},i.data(),n.data());t.preventDefault(),i.modal(s).one("hide",function(){n.focus()})})}(window.jQuery),!function(e){var t=function(e,t){this.init("tooltip",e,t)};t.prototype={constructor:t,init:function(t,n,r){var i,s;this.type=t,this.$element=e(n),this.options=this.getOptions(r),this.enabled=!0,this.options.trigger=="click"?this.$element.on("click."+this.type,this.options.selector,e.proxy(this.toggle,this)):this.options.trigger!="manual"&&(i=this.options.trigger=="hover"?"mouseenter":"focus",s=this.options.trigger=="hover"?"mouseleave":"blur",this.$element.on(i+"."+this.type,this.options.selector,e.proxy(this.enter,this)),this.$element.on(s+"."+this.type,this.options.selector,e.proxy(this.leave,this))),this.options.selector?this._options=e.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},getOptions:function(t){return t=e.extend({},e.fn[this.type].defaults,t,this.$element.data()),t.delay&&typeof t.delay=="number"&&(t.delay={show:t.delay,hide:t.delay}),t},enter:function(t){var n=e(t.currentTarget)[this.type](this._options).data(this.type);if(!n.options.delay||!n.options.delay.show)return n.show();clearTimeout(this.timeout),n.hoverState="in",this.timeout=setTimeout(function(){n.hoverState=="in"&&n.show()},n.options.delay.show)},leave:function(t){var n=e(t.currentTarget)[this.type](this._options).data(this.type);this.timeout&&clearTimeout(this.timeout);if(!n.options.delay||!n.options.delay.hide)return n.hide();n.hoverState="out",this.timeout=setTimeout(function(){n.hoverState=="out"&&n.hide()},n.options.delay.hide)},show:function(){var e,t,n,r,i,s,o;if(this.hasContent()&&this.enabled){e=this.tip(),this.setContent(),this.options.animation&&e.addClass("fade"),s=typeof this.options.placement=="function"?this.options.placement.call(this,e[0],this.$element[0]):this.options.placement,t=/in/.test(s),e.detach().css({top:0,left:0,display:"block"}).insertAfter(this.$element),n=this.getPosition(t),r=e[0].offsetWidth,i=e[0].offsetHeight;switch(t?s.split(" ")[1]:s){case"bottom":o={top:n.top+n.height,left:n.left+n.width/2-r/2};break;case"top":o={top:n.top-i,left:n.left+n.width/2-r/2};break;case"left":o={top:n.top+n.height/2-i/2,left:n.left-r};break;case"right":o={top:n.top+n.height/2-i/2,left:n.left+n.width}}e.offset(o).addClass(s).addClass("in")}},setContent:function(){var e=this.tip(),t=this.getTitle();e.find(".tooltip-inner")[this.options.html?"html":"text"](t),e.removeClass("fade in top bottom left right")},hide:function(){function r(){var t=setTimeout(function(){n.off(e.support.transition.end).detach()},500);n.one(e.support.transition.end,function(){clearTimeout(t),n.detach()})}var t=this,n=this.tip();return n.removeClass("in"),e.support.transition&&this.$tip.hasClass("fade")?r():n.detach(),this},fixTitle:function(){var e=this.$element;(e.attr("title")||typeof e.attr("data-original-title")!="string")&&e.attr("data-original-title",e.attr("title")||"").removeAttr("title")},hasContent:function(){return this.getTitle()},getPosition:function(t){return e.extend({},t?{top:0,left:0}:this.$element.offset(),{width:this.$element[0].offsetWidth,height:this.$element[0].offsetHeight})},getTitle:function(){var e,t=this.$element,n=this.options;return e=t.attr("data-original-title")||(typeof n.title=="function"?n.title.call(t[0]):n.title),e},tip:function(){return this.$tip=this.$tip||e(this.options.template)},validate:function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},enable:function(){this.enabled=!0},disable:function(){this.enabled=!1},toggleEnabled:function(){this.enabled=!this.enabled},toggle:function(t){var n=e(t.currentTarget)[this.type](this._options).data(this.type);n[n.tip().hasClass("in")?"hide":"show"]()},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}},e.fn.tooltip=function(n){return this.each(function(){var r=e(this),i=r.data("tooltip"),s=typeof n=="object"&&n;i||r.data("tooltip",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.tooltip.Constructor=t,e.fn.tooltip.defaults={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover",title:"",delay:0,html:!1}}(window.jQuery),!function(e){var t=function(e,t){this.init("popover",e,t)};t.prototype=e.extend({},e.fn.tooltip.Constructor.prototype,{constructor:t,setContent:function(){var e=this.tip(),t=this.getTitle(),n=this.getContent();e.find(".popover-title")[this.options.html?"html":"text"](t),e.find(".popover-content > *")[this.options.html?"html":"text"](n),e.removeClass("fade top bottom left right in")},hasContent:function(){return this.getTitle()||this.getContent()},getContent:function(){var e,t=this.$element,n=this.options;return e=t.attr("data-content")||(typeof n.content=="function"?n.content.call(t[0]):n.content),e},tip:function(){return this.$tip||(this.$tip=e(this.options.template)),this.$tip},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}}),e.fn.popover=function(n){return this.each(function(){var r=e(this),i=r.data("popover"),s=typeof n=="object"&&n;i||r.data("popover",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.popover.Constructor=t,e.fn.popover.defaults=e.extend({},e.fn.tooltip.defaults,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'})}(window.jQuery),!function(e){function t(t,n){var r=e.proxy(this.process,this),i=e(t).is("body")?e(window):e(t),s;this.options=e.extend({},e.fn.scrollspy.defaults,n),this.$scrollElement=i.on("scroll.scroll-spy.data-api",r),this.selector=(this.options.target||(s=e(t).attr("href"))&&s.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.$body=e("body"),this.refresh(),this.process()}t.prototype={constructor:t,refresh:function(){var t=this,n;this.offsets=e([]),this.targets=e([]),n=this.$body.find(this.selector).map(function(){var t=e(this),n=t.data("target")||t.attr("href"),r=/^#\w/.test(n)&&e(n);return r&&r.length&&[[r.position().top,n]]||null}).sort(function(e,t){return e[0]-t[0]}).each(function(){t.offsets.push(this[0]),t.targets.push(this[1])})},process:function(){var e=this.$scrollElement.scrollTop()+this.options.offset,t=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,n=t-this.$scrollElement.height(),r=this.offsets,i=this.targets,s=this.activeTarget,o;if(e>=n)return s!=(o=i.last()[0])&&this.activate(o);for(o=r.length;o--;)s!=i[o]&&e>=r[o]&&(!r[o+1]||e<=r[o+1])&&this.activate(i[o])},activate:function(t){var n,r;this.activeTarget=t,e(this.selector).parent(".active").removeClass("active"),r=this.selector+'[data-target="'+t+'"],'+this.selector+'[href="'+t+'"]',n=e(r).parent("li").addClass("active"),n.parent(".dropdown-menu").length&&(n=n.closest("li.dropdown").addClass("active")),n.trigger("activate")}},e.fn.scrollspy=function(n){return this.each(function(){var r=e(this),i=r.data("scrollspy"),s=typeof n=="object"&&n;i||r.data("scrollspy",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.scrollspy.Constructor=t,e.fn.scrollspy.defaults={offset:10},e(window).on("load",function(){e('[data-spy="scroll"]').each(function(){var t=e(this);t.scrollspy(t.data())})})}(window.jQuery),!function(e){var t=function(t){this.element=e(t)};t.prototype={constructor:t,show:function(){var t=this.element,n=t.closest("ul:not(.dropdown-menu)"),r=t.attr("data-target"),i,s,o;r||(r=t.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,""));if(t.parent("li").hasClass("active"))return;i=n.find(".active:last a")[0],o=e.Event("show",{relatedTarget:i}),t.trigger(o);if(o.isDefaultPrevented())return;s=e(r),this.activate(t.parent("li"),n),this.activate(s,s.parent(),function(){t.trigger({type:"shown",relatedTarget:i})})},activate:function(t,n,r){function o(){i.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),t.addClass("active"),s?(t[0].offsetWidth,t.addClass("in")):t.removeClass("fade"),t.parent(".dropdown-menu")&&t.closest("li.dropdown").addClass("active"),r&&r()}var i=n.find("> .active"),s=r&&e.support.transition&&i.hasClass("fade");s?i.one(e.support.transition.end,o):o(),i.removeClass("in")}},e.fn.tab=function(n){return this.each(function(){var r=e(this),i=r.data("tab");i||r.data("tab",i=new t(this)),typeof n=="string"&&i[n]()})},e.fn.tab.Constructor=t,e(document).on("click.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(t){t.preventDefault(),e(this).tab("show")})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.typeahead.defaults,n),this.matcher=this.options.matcher||this.matcher,this.sorter=this.options.sorter||this.sorter,this.highlighter=this.options.highlighter||this.highlighter,this.updater=this.options.updater||this.updater,this.$menu=e(this.options.menu).appendTo("body"),this.source=this.options.source,this.shown=!1,this.listen()};t.prototype={constructor:t,select:function(){var e=this.$menu.find(".active").attr("data-value");return this.$element.val(this.updater(e)).change(),this.hide()},updater:function(e){return e},show:function(){var t=e.extend({},this.$element.offset(),{height:this.$element[0].offsetHeight});return this.$menu.css({top:t.top+t.height,left:t.left}),this.$menu.show(),this.shown=!0,this},hide:function(){return this.$menu.hide(),this.shown=!1,this},lookup:function(t){var n;return this.query=this.$element.val(),!this.query||this.query.length<this.options.minLength?this.shown?this.hide():this:(n=e.isFunction(this.source)?this.source(this.query,e.proxy(this.process,this)):this.source,n?this.process(n):this)},process:function(t){var n=this;return t=e.grep(t,function(e){return n.matcher(e)}),t=this.sorter(t),t.length?this.render(t.slice(0,this.options.items)).show():this.shown?this.hide():this},matcher:function(e){return~e.toLowerCase().indexOf(this.query.toLowerCase())},sorter:function(e){var t=[],n=[],r=[],i;while(i=e.shift())i.toLowerCase().indexOf(this.query.toLowerCase())?~i.indexOf(this.query)?n.push(i):r.push(i):t.push(i);return t.concat(n,r)},highlighter:function(e){var t=this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&");return e.replace(new RegExp("("+t+")","ig"),function(e,t){return"<strong>"+t+"</strong>"})},render:function(t){var n=this;return t=e(t).map(function(t,r){return t=e(n.options.item).attr("data-value",r),t.find("a").html(n.highlighter(r)),t[0]}),t.first().addClass("active"),this.$menu.html(t),this},next:function(t){var n=this.$menu.find(".active").removeClass("active"),r=n.next();r.length||(r=e(this.$menu.find("li")[0])),r.addClass("active")},prev:function(e){var t=this.$menu.find(".active").removeClass("active"),n=t.prev();n.length||(n=this.$menu.find("li").last()),n.addClass("active")},listen:function(){this.$element.on("blur",e.proxy(this.blur,this)).on("keypress",e.proxy(this.keypress,this)).on("keyup",e.proxy(this.keyup,this)),this.eventSupported("keydown")&&this.$element.on("keydown",e.proxy(this.keydown,this)),this.$menu.on("click",e.proxy(this.click,this)).on("mouseenter","li",e.proxy(this.mouseenter,this))},eventSupported:function(e){var t=e in this.$element;return t||(this.$element.setAttribute(e,"return;"),t=typeof this.$element[e]=="function"),t},move:function(e){if(!this.shown)return;switch(e.keyCode){case 9:case 13:case 27:e.preventDefault();break;case 38:e.preventDefault(),this.prev();break;case 40:e.preventDefault(),this.next()}e.stopPropagation()},keydown:function(t){this.suppressKeyPressRepeat=!~e.inArray(t.keyCode,[40,38,9,13,27]),this.move(t)},keypress:function(e){if(this.suppressKeyPressRepeat)return;this.move(e)},keyup:function(e){switch(e.keyCode){case 40:case 38:case 16:case 17:case 18:break;case 9:case 13:if(!this.shown)return;this.select();break;case 27:if(!this.shown)return;this.hide();break;default:this.lookup()}e.stopPropagation(),e.preventDefault()},blur:function(e){var t=this;setTimeout(function(){t.hide()},150)},click:function(e){e.stopPropagation(),e.preventDefault(),this.select()},mouseenter:function(t){this.$menu.find(".active").removeClass("active"),e(t.currentTarget).addClass("active")}},e.fn.typeahead=function(n){return this.each(function(){var r=e(this),i=r.data("typeahead"),s=typeof n=="object"&&n;i||r.data("typeahead",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.typeahead.defaults={source:[],items:8,menu:'<ul class="typeahead dropdown-menu"></ul>',item:'<li><a href="#"></a></li>',minLength:1},e.fn.typeahead.Constructor=t,e(document).on("focus.typeahead.data-api",'[data-provide="typeahead"]',function(t){var n=e(this);if(n.data("typeahead"))return;t.preventDefault(),n.typeahead(n.data())})}(window.jQuery),!function(e){var t=function(t,n){this.options=e.extend({},e.fn.affix.defaults,n),this.$window=e(window).on("scroll.affix.data-api",e.proxy(this.checkPosition,this)).on("click.affix.data-api",e.proxy(function(){setTimeout(e.proxy(this.checkPosition,this),1)},this)),this.$element=e(t),this.checkPosition()};t.prototype.checkPosition=function(){if(!this.$element.is(":visible"))return;var t=e(document).height(),n=this.$window.scrollTop(),r=this.$element.offset(),i=this.options.offset,s=i.bottom,o=i.top,u="affix affix-top affix-bottom",a;typeof i!="object"&&(s=o=i),typeof o=="function"&&(o=i.top()),typeof s=="function"&&(s=i.bottom()),a=this.unpin!=null&&n+this.unpin<=r.top?!1:s!=null&&r.top+this.$element.height()>=t-s?"bottom":o!=null&&n<=o?"top":!1;if(this.affixed===a)return;this.affixed=a,this.unpin=a=="bottom"?r.top-n:null,this.$element.removeClass(u).addClass("affix"+(a?"-"+a:""))},e.fn.affix=function(n){return this.each(function(){var r=e(this),i=r.data("affix"),s=typeof n=="object"&&n;i||r.data("affix",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.affix.Constructor=t,e.fn.affix.defaults={offset:0},e(window).on("load",function(){e('[data-spy="affix"]').each(function(){var t=e(this),n=t.data();n.offset=n.offset||{},n.offsetBottom&&(n.offset.bottom=n.offsetBottom),n.offsetTop&&(n.offset.top=n.offsetTop),t.affix(n)})})}(window.jQuery);
define("bootstrap", ["jquery-couch"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.bootstrap;
    };
}(this)));

//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.2';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  var $ = root.jQuery || root.Zepto || root.ender;

  // Set the JavaScript library that will be used for DOM manipulation and
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
  // alternate JavaScript library (or a mock library for testing your views
  // outside of a browser).
  Backbone.setDomLibrary = function(lib) {
    $ = lib;
  };

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {

      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      // Create an immutable callback list, allowing traversal during
      // modification.  The tail is an empty object that will always be used
      // as the next node.
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {tail: tail, next: list ? list.next : node};
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      // Loop through the listed events and contexts, splicing them out of the
      // linked list of callbacks if appropriate.
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        // Create a new list, omitting the indicated callbacks.
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      // For each event, walk through the linked list of callbacks twice,
      // first to trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }

      return this;
    }

  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (options && options.parse) attributes = this.parse(attributes);
    if (defaults = getValue(this, 'defaults')) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) this.collection = options.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this.set(attributes, {silent: true});
    // Reset change tracking.
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // A hash of attributes that have silently changed since the last time
    // `change` was called.  Will become pending attributes on the next call.
    _silent: null,

    // A hash of attributes that have changed since the last `'change'` event
    // began.
    _pending: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.get(attr);
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, value, options) {
      var attrs, attr, val;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var changes = options.changes = {};
      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = attrs[attr];

        // If the new and current value differ, record the change.
        if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }

        // Update or delete the current value.
        options.unset ? delete now[attr] : now[attr] = val;

        // If the new and previous value differ, record the change.  If not,
        // then remove changes for this attribute.
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
          this.changed[attr] = val;
          if (!options.silent) this._pending[attr] = true;
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }

      // Fire the `"change"` events.
      if (!options.silent) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      (options || (options = {})).unset = true;
      return this.set(attr, null, options);
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      (options || (options = {})).unset = true;
      return this.set(_.clone(this.attributes), options);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = Backbone.wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, value, options) {
      var attrs, current;

      // Handle both `("key", value)` and `({key: value})` -style calls.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      options = options ? _.clone(options) : {};

      // If we're "wait"-ing to set changed attributes, validate early.
      if (options.wait) {
        if (!this._validate(attrs, options)) return false;
        current = _.clone(this.attributes);
      }

      // Regular saves `set` attributes before persisting to the server.
      var silentOptions = _.extend({}, options, {silent: true});
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, xhr);
        if (options.wait) {
          delete options.wait;
          serverAttrs = _.extend(attrs || {}, serverAttrs);
        }
        if (!model.set(serverAttrs, options)) return false;
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      // Finish configuring and sending the Ajax request.
      options.error = Backbone.wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
      if (options.wait) this.set(current, silentOptions);
      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var triggerDestroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      if (this.isNew()) {
        triggerDestroy();
        return false;
      }

      options.success = function(resp) {
        if (options.wait) triggerDestroy();
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      options.error = Backbone.wrapError(options.error, model, options);
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
      if (!options.wait) triggerDestroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Call this method to manually fire a `"change"` event for this model and
    // a `"change:attribute"` event for each changed attribute.
    // Calling this will cause all objects observing the model to update.
    change: function(options) {
      options || (options = {});
      var changing = this._changing;
      this._changing = true;

      // Silent changes become pending changes.
      for (var attr in this._silent) this._pending[attr] = true;

      // Silent changes are triggered.
      var changes = _.extend({}, options.changes, this._silent);
      this._silent = {};
      for (var attr in changes) {
        this.trigger('change:' + attr, this, this.get(attr), options);
      }
      if (changing) return this;

      // Continue firing `"change"` events while there are pending changes.
      while (!_.isEmpty(this._pending)) {
        this._pending = {};
        this.trigger('change', this, options);
        // Pending and silent changes still remain.
        for (var attr in this.changed) {
          if (this._pending[attr] || this._silent[attr]) continue;
          delete this.changed[attr];
        }
        this._previousAttributes = _.clone(this.attributes);
      }

      this._changing = false;
      return this;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (!arguments.length) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false, old = this._previousAttributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (!arguments.length || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state. It's only possible to
    // get into an *invalid* state if you're using silent changes.
    isValid: function() {
      return !this.validate(this.attributes);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. If a specific `error` callback has
    // been passed, call that instead of firing the general `"error"` event.
    _validate: function(attrs, options) {
      if (options.silent || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validate(attrs, options);
      if (!error) return true;
      if (options && options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, {silent: true, parse: options.parse});
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: function(models, options) {
      var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];

      // Begin by turning bare objects into model references, and preventing
      // invalid models or duplicate models from being added.
      for (i = 0, length = models.length; i < length; i++) {
        if (!(model = models[i] = this._prepareModel(models[i], options))) {
          throw new Error("Can't add an invalid model to a collection");
        }
        cid = model.cid;
        id = model.id;
        if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
          dups.push(i);
          continue;
        }
        cids[cid] = ids[id] = model;
      }

      // Remove duplicates.
      i = dups.length;
      while (i--) {
        models.splice(dups[i], 1);
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0, length = models.length; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = options.at != null ? options.at : this.models.length;
      splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) this.sort({silent: true});
      if (options.silent) return this;
      for (i = 0, length = this.models.length; i < length; i++) {
        if (!cids[(model = this.models[i]).cid]) continue;
        options.index = i;
        model.trigger('add', model, this, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `remove` event for every model removed.
    remove: function(models, options) {
      var i, l, index, model;
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, options);
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Get a model from the set by id.
    get: function(id) {
      if (id == null) return void 0;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function(attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length == 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      models  || (models = []);
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === undefined) options.parse = true;
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = Backbone.wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) coll.add(model, options);
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        if (options.wait) coll.add(nextModel, options);
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(model, options) {
      options || (options = {});
      if (!(model instanceof Model)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event == 'add' || event == 'remove') && collection != this) return;
      if (event == 'destroy') {
        this.remove(model, options);
      }
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      Backbone.history || (Backbone.history = new History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes .
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(windowOverride) {
      var loc = windowOverride ? windowOverride.location : window.location;
      var match = loc.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = this.getHash();
        }
      }
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
      if (current == this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    }
  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function() {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = (element instanceof $) ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Model.extend = Collection.extend = Router.extend = View.extend = extend;

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    options || (options = {});

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getValue(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function(onError, originalModel, options) {
    return function(model, resp) {
      resp = model === originalModel ? resp : model;
      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);

define("backbonejs", ["underscore","bootstrap"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.Backbone;
    };
}(this)));

// lib/handlebars/base.js
var Handlebars = {};

Handlebars.VERSION = "1.0.beta.6";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + fn(context[i]);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  } else {
    return fn(context);
  }
});

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.OPrime.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context) {
  Handlebars.log(context);
});
;
// lib/handlebars/utils.js
Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  for (var p in tmp) {
    if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
  }

  this.message = tmp.message;
};
Handlebars.Exception.prototype = new Error;

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /&(?!\w+;)|[<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.OPrime = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (typeof value === "undefined") {
        return true;
      } else if (value === null) {
        return true;
      } else if (value === false) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/runtime.js
Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.OPrime.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial);
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;
define("handlebars", ["backbonejs","jquery"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.Handlebars;
    };
}(this)));

(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['app'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- Black Navigation Bar Across the Top -->\n<div class=\"navbar navbar-inverse navbar-fixed-top\">\n	<div class=\"navbar-inner\">\n		<div class=\"container \">\n\n\n\n			<!-- Home button -->\n			<a tabindex=\"-1\" href=\"#\" class=\" brand locale_Show_Dashboard\"\n				rel=\"tooltip\"> <i class=\"icons icon-home icon-white\"></i></a>\n\n			<!-- Top Search Area -->\n			<span class=\"navbar-search\" id=\"search-top\"> </span>\n\n			<!-- .btn-navbar is used as the toggle for collapsed navbar content -->\n			<a class=\"btn btn-navbar\" data-toggle=\"collapse\"\n				data-target=\".nav-collapse\"> <span class=\"icon-bar\"></span> <span\n				class=\"icon-bar\"></span> <span class=\"icon-bar\"></span>\n			</a>\n\n\n			<!-- Collapsing area if the screen is not wide enough -->\n			<div class=\"nav-collapse collapse\">\n				<ul class=\"nav\" role=\"navigation \">\n\n\n\n\n					<!-- Notification -->\n					<li class=\"dropdown\"><a id=\"notification_dropdown_trigger\"\n						href=\"#\" role=\"button\" class=\"dropdown-toggle\"\n						data-toggle=\"dropdown\"><i\n							class=\"icon-exclamation-sign icon-white\"></i> Notifications <b\n							class=\"caret\"></b></a>\n						<ul class=\"dropdown-menu dont_close_notifications_dropdown_if_user_clicks\" role=\"menu\"\n							aria-labelledby=\"notification_dropdown_trigger\">\n\n\n\n\n							<!-- 	<li class=\"\"><span class=\"locale_Need_save\"></span><a\n								tabindex=\"-1\" href=\"#\" class=\"locale_Save_on_this_Computer \"\n								rel=\"tooltip\"> <i\n									class=\"icons icon-save save-dashboard icon-white\"></i>\n							</a></li>\n							<li><progress class=\"unsaved-changes\" max=\"100\" value=\"30\">\n								</progress></li>\n\n							<li class=\"not-a   locale_Recent_Changes\"></li>\n\n\n							<li class=\"divider \"></li>\n\n							<li class=\"\"><span class=\"locale_Need_sync\"></span><a\n								tabindex=\"-1\" href=\"#\" class=\"locale_Sync_and_Share \"\n								rel=\"tooltip\"> <i\n									class=\"icons icon-sitemap  sync-everything icon-white\"></i>\n							</a></li>\n							<li class=\"\"><progress class=\"unsynced-changes\"\n									max=\"100\" value=\"80\"> </progress></li>\n\n							<li class=\"not-a  locale_Differences_with_the_central_server\"></li> -->\n\n\n							<li><a tabindex=\"-1\" href=\"#\" class=\"clear_all_notifications\"><i class=\"icon-remove\"></i>\n									Clear all notifications</a></li>\n\n							<li><div id=\"toast-user-area\" class=\"scrollable\">\n									<div class=\"alert alert-info alert-block\">\n										<a class=\"close\" data-dismiss=\"alert\" href=\"#\">×</a> <strong\n											class=\"alert-heading \">Quick Start Instructions:</strong> <span\n											class=\"locale_Instructions_to_show_on_dashboard\"></span> <span\n											class=\"locale_to_beta_testers\"></span>\n									</div>\n								</div></li>\n\n						</ul></li>\n\n\n				</ul>\n				<ul class=\"nav pull-right\">\n\n					<!--  User dropdown -->\n					<li id=\"auth-menu\" class=\"dropdown\"><a href=\"#\"\n						id=\"user_drop_down_trigger\" role=\"button\"\n						class=\" dropdown-toggle locale_View_Public_Profile_Tooltip pull-left\"\n						data-toggle=\"dropdown\" rel=\"tooltip\"> <b class=\"caret\"></b>\n							<button id=\"login_register_button\" class=\"btn btn-success hide\">Login/Register</button>\n							<span id=\"loggedin_customize_on_auth_dropdown\">Customize</span><span id=\"user-quickview\"> <i\n								class=\"icons icon-user icon-white\"></i>\n						</span>\n					</a>\n						<ul class=\"dropdown-menu scrollable min_auth_dropdown_size\" id=\"authentication-embedded\" role=\"menu\"\n							aria-labelledby=\"user_drop_down_trigger\"></ul></li>\n\n\n				</ul>\n\n			</div>\n\n		</div>\n	</div>\n</div>\n\n\n\n<!-- The rest of the page -->\n<div class=\"container-fluid main\">\n	<div id=\"dashboard-view\" class=\"row-fluid\">\n		<!-- Elements on Lefthand side -->\n		<div class=\"span3\">\n			<div class=\" span12 hide\"></div>\n			<!-- workaround: empty div to set all span12 to line up -->\n			<div id=\"corpus-quickview\" class=\"well span12\"></div>\n			<div id=\"session-quickview\" class=\"well span12\"></div>\n			<div id=\"search-data-list-quickview\" class=\"well hide span12\">\n				<div id=\"search-data-list-quickview-header\" class=\" \"></div>\n				<div class=\"  \">\n					<ul class=\"unstyled zebra datalist_hover_datum_views_so_they_look_clickable  search-data-list-paginated-view \"></ul>\n					<div class=\"pagination-control\"></div>\n				</div>\n			</div>\n			<div id=\"data-list-quickview\" class=\"well span12\">\n				<div id=\"data-list-quickview-header\" class=\" \"></div>\n				<div class=\"  container span12\">\n					<ul class=\"unstyled zebra  datalist_hover_datum_views_so_they_look_clickable current-data-list-paginated-view \"></ul>\n					<div class=\"pagination-control \"></div>\n				</div>\n			</div>\n		</div>\n		<!--Elements in the middle (things that get hidden)  -->\n		<div class=\"span6\">\n\n			<div id=\"datums-embedded\" class=\"middle well\"></div>\n			<div id=\"conversation-embedded\" class=\"middle well\">\n				<div class=\"scrollable\">\n					<div class=\"conversation-text-audio-wrapper\">\n						<div class=\"jp-load-bar\" style=\"width: 960;\">\n							<div class=\"jp-play-bar\" style=\"width: 330;\">\n								<i class=\"icon-gift\"></i><strong>New!</strong>\n								<h4>'Conversations' will let you have multiple speakers\n									with overlapping speech.</h4>\n							</div>\n						</div>\n					</div>\n				</div>\n			</div>\n			<div id=\"data-list-embedded\" class=\"well\">\n				<div id=\"data-list-embedded-header\" class=\"middle \"></div>\n				<div>\n					<ul class=\"unstyled datalist_hover_datum_views_so_they_look_clickable zebra current-data-list-paginated-view\"></ul>\n					<div class=\"pagination-control\"></div>\n				</div>\n			</div>\n			<div id=\"session-embedded\" class=\"middle well\"></div>\n			<div id=\"corpus-embedded\" class=\"middle well\"></div>\n			<div id=\"search-embedded\" class=\"middle well\"></div>\n		</div>\n		<!--/span-->\n		<!-- right hand side -->\n		<div class=\"span3\">\n			<div id=\"insert-unicode\" class=\"well\"></div>\n			<div class=\"well\">\n				<iframe src=\"activity/activity_feed.html#/user/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\n					width=\"100%\" height=\"400\" frameborder=\"0\" ALLOWTRANSPARENCY=\"true\"></iframe>\n			</div>\n\n			<div class=\"well\">\n				<iframe\n					src=\"activity/activity_feed.html#/user/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\n					width=\"100%\" height=\"400\" frameborder=\"0\" ALLOWTRANSPARENCY=\"true\"></iframe>\n			</div>\n		</div>\n		<!--/span-->\n	</div>\n	<!--/row-->\n\n	<!-- FullScreen Views -->\n	<div id=\"user-fullscreen\" class=\"well \"></div>\n	<div id=\"public-user-page\" class=\"well \"></div>\n	<div id=\"corpus-fullscreen\" class=\"well \"></div>\n	<div id=\"session-fullscreen\" class=\"well \"></div>\n	<div id=\"search-fullscreen\" class=\"well \"></div>\n	<div id=\"data-list-fullscreen\" class=\"well row\">\n		<div id=\"data-list-fullscreen-header\"></div>\n		<div class=\"  container span12 \">\n			<ul class=\"unstyled zebra datalist_hover_datum_views_so_they_look_clickable current-data-list-paginated-view\"></ul>\n			<div class=\"pagination-control\"></div>\n		</div>\n	</div>\n	<div id=\"datum-container-fullscreen\" class=\"well\"></div>\n	<div id=\"conversation-container-fullscreen\" class=\"well\">TODO:\n		this will be a conversation</div>\n	<div id=\"import-fullscreen\" class=\"\"></div>\n</div>\n\n<!-- Modals are windows which pop over the active app to take focus -->\n<div id=\"hotkey-settings-modal\" class=\"modal hide\"></div>\n<div id=\"user-modal\" class=\"modal hide\"></div>\n<div id=\"user-preferences-modal\" class=\"modal hide\"></div>\n<div id=\"export-modal\" class=\"modal hide\"></div>\n<div id=\"new-session-modal\" class=\"modal hide\"></div>\n<div id=\"new-corpus-modal\" class=\"modal hide\"></div>\n<div id=\"illustrated_guide_to_dash\" class=\"modal hide\">\n	<div class=\"modal-header\">\n		<p>\n			<span class=\"help_count_reason\"></span> This help will show <span\n				class=\"help_count_left\"></span> more times. <a\n				href=\"https://docs.google.com/drawings/d/16MZ_wF0XX83q2QDQO9BPJnF5HGrNgVe17zOAElu6iqU/edit\"\n				target=\"_blank\">Click here to open the guide in a new tab</a>\n		</p>\n	</div>\n	<a\n		href=\"https://docs.google.com/drawings/d/16MZ_wF0XX83q2QDQO9BPJnF5HGrNgVe17zOAElu6iqU/edit\"\n		target=\"_blank\"> <img\n		src=\"https://docs.google.com/drawings/pub?id=16MZ_wF0XX83q2QDQO9BPJnF5HGrNgVe17zOAElu6iqU&amp;w=1450&amp;h=918\" /></a>\n</div>\n<div id=\"quick-authenticate-modal\" data-backdrop=\"static\"\n	data-keyboard=\"static\" class=\"modal hide\">\n	<div class=\"modal-header\">\n		<h4 class=\"locale_We_need_to_make_sure_its_you\"></h4>\n	</div>\n	<div class=\"modal-body\">\n		<label class=\"locale_Password\"></label> <input type=\"password\"\n			id=\"quick-authenticate-password\" />\n	</div>\n	<div class=\"modal-footer\">\n		<button class=\"btn btn-success locale_Yep_its_me\"\n			id=\"quick-authentication-okay-btn\"></button>\n	</div>\n</div>\n<div id=\"login_modal\" class=\"modal hide\">\n	<div class=\"modal-header\">\n		<h3 class=\"locale_Log_In\"></h3>\n	</div>\n	<div class=\"modal-body\">\n		<div class=\"alert alert-error hide welcome-screen-alerts\"></div>\n		<label class=\"locale_Username\"></label> <input size=\"16\" type=\"text\"\n			class=\"welcomeusername\" value=\"\" /> <label class=\"locale_Password \"></label>\n		<input type=\"password\" size=\"16\" class=\"welcomepassword\" value=\"\" />\n		<label class=\"locale_authUrl\">Server</label> <input type=\"text\"\n			size=\"16\" class=\"welcomeauthurl\" data-provide=\"typeahead\"\n			data-items=\"4\"\n			data-source='[&quot;LingSync.org&quot;,&quot;LingSync Testing&quot;,&quot;McGill ProsodyLab&quot;,&quot;Localhost&quot;]' />\n	</div>\n	<div class=\"modal-footer\">\n		<a href=\"#\" class=\"btn btn-success sync-my-data\"> <span\n			class=\"locale_Log_In\"></span>\n		</a>\n	</div>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['audio_video_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<!-- this is done in the code see AudioVideoEditView -->";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['audio_video_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<audio preload=\"\" controls=\"\" \n	class=\"datum-audio-player\">\n	<source\n		src=\"";
  foundHelper = helpers.URL;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.URL; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\n		type=\"";
  foundHelper = helpers.audioType;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.audioType; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n</audio>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['authentication_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<li class=\"not-a \">\n	<div>\n		<img class=\"gravatar-large\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n		<h4>";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h4>\n	</div>\n</li>\n<li class=\"not-a\">\n	<button id=\"logout\" class=\"btn btn-inverse logout locale_Log_Out\"></button>\n</li>\n<li class=\"not-a \">\n	<div id=\"login_form\" class=\"\">\n\n		<p class=\"wordwrap\">\n			<i class=\"locale_An_offline_online_fieldlinguistics_database\"></i> <span\n				class=\"welcome_version_number\"></span>\n		</p>\n\n		<div class=\"btn-group\">\n			<a href=\"#\"\n				class=\"btn btn-success sync-lingllama-data locale_Close_and_login_as_LingLlama locale_Close_and_login_as_LingLlama_Tooltip\"\n				rel=\"tooltip\"></a> <a class=\"btn btn-success \" data-toggle=\"modal\"\n				href=\"#login_modal\"> <i class=\"icon-user icon-white\"></i> <span\n				class=\"locale_Log_In\"></span> <span class=\"caret\"></span>\n			</a>\n		</div>\n\n		<hr />\n		<div class=\"alert alert-error hide welcome-screen-alerts\"></div>\n\n		<div class=\"breadcrumb create_new_user_password \">\n			<h3 class=\"locale_Create_a_new_user\"></h3>\n			<p>\n				http://www.lingsync.org/<span class=\"potentialUsername\">yourusernamegoeshere</span>\n			</p>\n			<!-- <label class = \"locale_What_is_your_username_going_to_be\">  </label> -->\n			<span class=\"like-form-inline\"> <input\n				class=\"registerusername\" value=\"yourusernamegoeshere\" type=\"text\" />\n				<button class=\"btn btn-primary new-user-button locale_New_User\"></button>\n			</span>\n			<div class=\"hide confirm-password\">\n				<label class=\"locale_Password\"></label> <input\n					class=\"registerpassword\" type=\"password\" /> <label\n					class=\"locale_Confirm_Password\"></label> <input\n					class=\"to-confirm-password\" type=\"password\" /> <label class=\"\">Email:</label>\n				<input class=\"registeruseremail\" type=\"email\" /> <br />\n				<button\n					class=\"btn btn-success register-new-user locale_Sign_in_with_password\">\n				</button>\n				<!-- Hiding Twitter and facebook because I dont think anyone will use them now. <button class=\"btn btn-success register-twitter\">\n        <i class=\"i icon-twitter\"></i> Sign in with Twitter\n      </button>\n      <button class=\"btn btn-success register-facebook\">\n        <i class=\"i icon-facebook\"></i> Sign in with Facebook\n      </button> -->\n			</div>\n		</div>\n	</div>\n</li>\n\n\n<li><a data-toggle=\"modal\" href=\"#user-modal\"><i\n		class=\" icon-user\"></i> <span class=\"locale_Private_Profile\"></span> </a></li>\n\n<li class=\"divider\"></li>\n\n<li><a tabindex=\"-1\" href=\"#help/illustratedguide\"><i\n		class=\"icon-gift\"></i> New! Quick Start Illustrated Guide</a></li>\n<li><a tabindex=\"-1\" href=\"http://fieldlinguist.com\"\n	target=\"_blank\"><i class=\"icon-film\"></i> Help Videos and User\n		Guide</a></li>\n<li><a tabindex=\"-1\"\n	href=\"https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ\"\n	target=\"_blank\"><i class=\" icon-beaker\"></i> Bug Report/Contact Us</a></li>\n<li><a tabindex=\"-1\"\n	href=\"https://github.com/OpenSourceFieldlinguistics/FieldDB/issues/milestones?state=closed\"\n	target=\"_blank\"><i class=\" icon-github\"></i> OpenSource v<span\n		class=\"fielddb-version\"></span></a></li>\n<li class=\"power-users-link\"><a tabindex=\"-1\" data-toggle=\"modal\"\n	href=\"#terminal-modal\"><i class=\" icon-magic\"></i> <span\n		class=\"locale_Terminal_Power_Users\"></span> </a></li>\n\n<li class=\"divider\"></li>\n\n<li><a tabindex=\"-1\" data-toggle=\"modal\"\n	href=\"#user-preferences-modal\"><i class=\" icon-cog\"></i> <span\n		class=\"locale_User_Settings\"></span> </a></li>\n<li><a tabindex=\"-1\" data-toggle=\"modal\"\n	href=\"#hotkey-settings-modal\"><i class=\" icon-hdd\"></i> <span\n		class=\"locale_Keyboard_Shortcuts\"></span></a></li>\n<li><a tabindex=\"-1\" class=\"corpus-settings\"><i\n		class=\" icon-cogs\"></i> <span class=\"locale_Corpus_Settings\"></span></a></li>\n\n<li class=\"divider\"></li>\n\n<li><a tabindex=\"-1\" href=\"#\" class=\" sync-everything\"> <i\n		class=\" icon-upload\"></i> Back-up your\n		preferences\n</a></li>\n\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['comment_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"alert alert-info\">\n\n<span> <img class=\"gravatar-small\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"/></span>\n\n<span>";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n<i class=\"icons icon-comment\"></i>\n\n<div class= \"pull-right\">  ";
  foundHelper = helpers.timestamp;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.timestamp; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n\n<textarea class=\"comment-new-text\">";
  foundHelper = helpers.text;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.text; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n</div>\n\n\n  \n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['comment_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"alert alert-info\">\n\n<span> <img class=\"gravatar-small\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"/></span>\n\n<span> ";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "   </span>\n<i class=\"icons icon-comment\"></i>\n\n<div class= \"pull-right\">  ";
  foundHelper = helpers.timestamp;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.timestamp; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n\n<div class=\"comment-text\">";
  foundHelper = helpers.text;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.text; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n\n</div>\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['conversation_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<div class=\"pull-right\">\n  <a href=\"#\" class= \"locale_Show_Readonly\" rel=\"tooltip\">\n      <i class=\"icons icon-book\"></i></a>\n  <a href=\"#\" class= \"locale_Show_in_Dashboard\" rel=\"tooltip\" >\n      <i class=\"icons icon-resize-small\"></i></a>\n</div>\n<button class=\"btn btn-success pull-left save-datalist locale_Save\" value=\"Save\"></button>\n<br>\n<br>\n<label class = \"locale_Title\"></label> <i class=\"icon-pushpin\"></i> \n<small>";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n<textarea class=\"data-list-title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n<h4>";
  foundHelper = helpers.dateCreated;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateCreated; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h4>\n<label class = \"locale_Description\"></label>\n<textarea class=\"data-list-description locale_Datalist_Description\"\n>";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a>\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['conversation_import_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<label class = \"locale_Title\"></label> <i class=\"icon-pushpin\"></i> \n<textarea class=\"data-list-title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n<label class = \"locale_Description\"></label>\n<textarea class=\"data-list-description locale_Datalist_Description\">\n";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--Import DataList Menu  -->\n<div class=\"btn-group\">\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['conversation_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<div class=\"pull-right\">\n  <a href=\"#\" rel=\"tooltip\" class=\"locale_Edit_Datalist\">\n    <i class=\"icons icon-edit\"></i></a>\n  <a href=\"#\" class= \"locale_Show_in_Dashboard\" rel=\"tooltip\" >\n    <i class=\"icons icon-resize-small\"></i></a> \n</div>\n\n<h3><i class=\"icon-pushpin\"></i> ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n<small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small></h3>\n<h4>";
  foundHelper = helpers.dateCreated;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateCreated; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h4>\n\n";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a>\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div> \n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['conversation_read_link'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "  <a href=\"#data/";
  foundHelper = helpers._id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"> \n	  <i class=\"icon-pushpin\"></i> \n	  ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n  </a>\n  <small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['conversation_search_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<!--  Search Data lists icons -->\n<div class=\"pull-right\">\n  <button class=\"btn btn-success save-search-datalist locale_Save\" value=\"Save\"></button>\n  <a href=\"#\" class= \"locale_Hide_Datalist\" rel=\"tooltip\">\n      <i class=\"icons icon-minus-sign\"></i>\n  </a>  \n</div>\n\n<label class=\"locale_Title\"></label> <i class=\"icon-pushpin\"></i> \n<small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n<textarea class=\"data-list-title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n<label class=\"locale_Description\"></label>\n<textarea class=\"data-list-description locale_Datalist_Description\">\n";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n<!--Search DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <!--This cannot be included in search or import <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a> -->\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['conversation_summary_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<div class=\"pull-right\">\n  <button class=\"btn btn-success save-datalist locale_Save\" value=\"Save\">\n  </button>\n  <a href=\"#\" class= \"locale_Hide_Datalist\" rel=\"tooltip\">\n     <i class=\"icons icon-minus-sign\"></i></a>      \n  <a href=\"#\" class= \"locale_Show_Readonly\" rel=\"tooltip\">\n     <i class=\"icons icon-book\"></i></a>      \n  <a href=\"#\" class = \"locale_Show_Fullscreen\" rel=\"tooltip\">\n     <i class=\"icons icon-resize-full\"></i></a>     \n</div>\n\n<label class = \"locale_Title\"></label> <i class=\"icon-pushpin\"></i> \n<small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n<textarea class=\"data-list-title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n<label class = \"locale_Description\"></label>\n<textarea class=\"data-list-description locale_Datalist_Description\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a>\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['conversation_summary_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<div class=\"pull-right\">\n  <a href=\"#\" class= \"locale_Hide_Datalist\" rel=\"tooltip\">\n      <i class=\"icons icon-minus-sign\"></i></a>      \n  <a href=\"#\" class = \"locale_Edit_Datalist\" rel=\"tooltip\">\n      <i class=\"icons icon-edit\"></i></a>      \n  <a href=\"#\" class = \"locale_Show_Fullscreen\" rel=\"tooltip\">\n      <i class=\"icons icon-resize-full\"></i></a>\n</div>\n\n<h3><i class=\"icon-pushpin\"></i> ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "<small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small></h3>\n<h4>";
  foundHelper = helpers.dateCreated;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateCreated; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h4>\n\n";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a>\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['conversation_summary_read_minimized'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"pull-right\">\n  <a  href=\"#\" class= \"locale_Show_Datalist\" rel=\"tooltip\" title=\"Show data list\" >\n      <i class=\"icons icon-plus-sign\"></i></a>\n</div>\n<h4><i class=\"icon-pushpin\"></i> ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "<small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small></h4>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['conversation_turn_read_latex'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n    <span class = \"latex-judgement\">";
  foundHelper = helpers.speaker;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.speaker; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span> \n  ";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n	  <span class=\"glossCouplet\">\n	    ";
  foundHelper = helpers.utteranceSegment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.utteranceSegment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n	    <br />\n	    ";
  foundHelper = helpers.glossSegment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.glossSegment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n	  </span>\n	";
  return buffer;}

  buffer += "<div class=\"span1\">\n\n</div>\n<div class=\"span1\">\n  ";
  stack1 = depth0.speaker;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n<div class=\"span10\">\n	";
  stack1 = depth0.couplet;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	<br />\n	<span class=\"datum-latex-translation\">";
  foundHelper = helpers.translation;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.translation; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['corpus_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- Corpus icons - Different for all Corpus Handlebars -->\n<div class=\"pull-right\">\n   <a href=\"#\" class= \"locale_Show_Readonly\" rel=\"tooltip\">\n    <i class=\"icons icon-book\"></i></a>\n  <a href=\"#\" class= \"locale_Show_in_Dashboard\" rel=\"tooltip\" >\n    <i class=\"icons icon-resize-small\"></i></a>\n</div>\n<div class=\"btn-toolbar \">\n  <!-- Corpus Menu - Identical for all Corpus Handlebars -->\n  <div class=\"btn-toolbar\">\n    <div class=\"btn-group\">\n      <button class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\">\n        <span class =\"locale_New_menu\"></span>  <span class=\"caret\"></span>\n      </button>\n      <!-- create new stuff in same dashboard -->\n      <ul class=\"dropdown-menu\">\n        <li class=\"new-datum\"><a href=\"#\" class = \"locale_New_Datum\"></a></li>\n        <li class=\"new-conversation\"><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/conversation/new\" class = \"locale_New_Conversation\"></a></li>\n        <li class=\"new-data-list\"><a href=\"#\" class = \"locale_New_Data_List\"></a></li>\n        <li class=\"new-session\"><a href=\"#\" class = \"locale_New_Session\"></a></li>\n        <li class=\"new-corpus\"><a href=\"#\" class = \"locale_New_Corpus\"></a></li>\n      </ul>\n    </div>\n    <div class=\"btn-group\">\n      <button class=\"btn btn-info dropdown-toggle\" data-toggle=\"dropdown\">\n        <span class =\"locale_Data_menu\"></span> <span class=\"caret\"></span>\n      </button>\n      <!-- modify URL -->\n      <ul class=\"dropdown-menu\">\n        <li><a href=\"#import\" class = \"locale_Import_Data\"></a></li>\n        <li><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/export\" class = \"locale_Export_Data\"></a></li>\n        <li><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/alldata\" class = \"locale_All_Data\"></a></li>\n      </ul>\n    </div>\n	  <!-- /Corpus Menu - Identical for all Corpus Handlebars -->\n	  <!-- Corpus Save and Toggle to Readonly - Edit View Only-->\n	  <div class=\"btn-group\">\n	    <button class=\"btn btn-success save-corpus\">\n	     <span class=\"locale_Save\"></span></button>\n	  </div>\n  </div>\n</div>\n\n	\n\n<label class = \"locale_Title\"></label> <i class=\"icon-cloud\"></i> \n<input class=\"corpus-title-input\" value=\"";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"/><small>";
  foundHelper = helpers.publicCorpus;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.publicCorpus; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n\n<label class = locale_Description></label>\n<textarea class=\"corpus-description-input\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n<small>Shareable URL: http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/";
  foundHelper = helpers.titleAsUrl;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.titleAsUrl; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n        \n<div class=\"accordion\" id=\"accordion-edit-embedded\">\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-edit-embedded\" href=\"#collapseSessionsEE\">\n        <i class=\"icon-calendar\"></i> <strong class=\"locale_Sessions_associated\"></strong>\n         </a>\n    </div>\n    <div class=\"accordion-body collapse\" id=\"collapseSessionsEE\">\n      <div class=\"accordion-inner\">\n        <span class=\"locale_elicitation_sessions_explanation\"></span>\n        <ul class = \"sessions-updating-collection unstyled\">\n                <!-- Updating Sessions Collection -->\n        </ul>\n      </div>\n    </div>\n  </div>\n  \n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-edit-embedded\" href=\"#collapseDatalistsEE\">\n          <i class=\"icon-pushpin\"></i> <strong class=\"locale_Datalists_associated\"></strong>\n      </a>\n    </div>\n    <div class=\"accordion-body collapse\" id=\"collapseDatalistsEE\" >\n      <div class=\"accordion-inner\">\n				<span class=\"locale_datalists_explanation\"></span>\n         <ul class = \"datalists-updating-collection unstyled\">\n                <!-- Updating DataLists Collection -->\n        </ul>\n      </div>\n    </div>\n  </div>\n  \n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n			<a class=\"accordion-toggle\" data-toggle=\"collapse\"\n				data-parent=\"accordion-edit-embedded\" href=\"#collapsePermissionsEE\">\n				<i class=\"icon-group\"></i> <strong class=\"locale_Permissions_associated\"></strong>\n			</a>\n		</div>\n    <div class=\"accordion-body collapse\" id=\"collapsePermissionsEE\">\n      <div class=\"accordion-inner container span12\">\n				<span class=\"locale_permissions_explanation\"></span>\n				<label class = \"locale_Public_or_Private\"></label>\n				<input type=\"text\" value=\"";
  foundHelper = helpers.publicCorpus;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.publicCorpus; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\" public-or-private\" data-provide=\"typeahead\" data-items=\"4\" \n				        data-source=\"[&quot;Public&quot;,&quot;Private&quot;]\"/>\n				<a href = \"http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/";
  foundHelper = helpers.titleAsUrl;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.titleAsUrl; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\"><i class=\" icon-link\"></i></a>\n				<small>Shareable URL: http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/";
  foundHelper = helpers.titleAsUrl;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.titleAsUrl; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n			<p>\n				<button class=\"btn btn-inverse reload-corpus-team-permissions\"><i class=\"icon-refresh\"></i> See current team members</button>\n      </p>\n        <ul class = \"permissions-updating-collection unstyled\">\n                      <!-- Updating Permissions Collection -->\n        </ul>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-edit-embedded\" href=\"#collapseDatumFieldSettingsEE\">\n           <i class=\"icon-list\"></i> <strong class=\"locale_Datum_field_settings\"></strong>\n        </a>\n    </div>\n    <div class=\"accordion-body collapse\" id=\"collapseDatumFieldSettingsEE\">\n      <div class=\"accordion-inner\">\n				<span class=\"locale_datum_fields_explanation\"></span>\n        <ul class=\"datum_field_settings unstyled\"></ul>\n        <div class=\"breadcrumb\">\n          <span class=\"pull-right\"> \n            <span class=\"locale_Encrypt_if_confidential\"></span>\n            <input type=\"checkbox\" class=\"add_shouldBeEncrypted\"";
  foundHelper = helpers.shouldBeEncrypted;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.shouldBeEncrypted; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "></input>\n          </span> \n          <input type=\"text\" class=\"span3 choose_add_field\"  data-provide=\"typeahead\" data-items=\"4\" data-source=\"[&quot;Phonemic Transcription&quot;,&quot;Phonetic Transcription&quot;,&quot;Semantic Denotation&quot;,&quot;Semantic Context&quot;,&quot;Spanish&quot;,&quot;Notes&quot;]\">\n          <label class=\"locale_Help_Text\"></label>\n          <textarea class=\"add_help locale_Help_Text_Placeholder\"></textarea>\n          <a href=\"#\" class=\"locale_Add_New_Datum_Field_Tooltip btn btn-primary add-datum-field locale_Add\" rel=\"tooltip\">\n          </a>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-edit-embedded\" href=\"#collapseDatumStateSettingsEE\">\n        <i class=\"icon-flag\"></i>  <strong class=\"locale_Datum_state_settings\"></strong>\n      </a>\n    </div>\n    <div class=\"accordion-body collapse\" id=\"collapseDatumStateSettingsEE\">\n			<span class=\"locale_datum_states_explanation\"></span>\n        <ul class=\"datum_state_settings unstyled\"></ul>\n        <input class=\"add_input locale_Add_Placeholder\" value=\"\" type=\"text\"></input>\n        <select class=\"add_color_chooser\">\n          <option value=\"success\" class = \"locale_Green\"></option>\n          <option value=\"warning\" class = \"locale_Orange\"></option>\n          <option value=\"important\" class = \"locale_Red\"></option>\n          <option value=\"info\" class = \"locale_Teal\"></option>\n          <option value=\"inverse\" class = \"locale_Black\"></option>\n          <option value=\"\" class = \"locale_Default\"></option>\n        </select>\n        <a href=\"#\" class = \"locale_Add_New_Datum_State_Tooltip btn btn-primary add-datum-state locale_Add\" rel=\"tooltip\">\n        </a>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-edit-embedded\" href=\"#collapseConversationFieldSettingsEE\">\n           <i class=\"icon-comments-alt\"></i> <strong class=\"locale_Conversation_field_settings\"></strong>\n        </a>\n    </div>\n    <div class=\"accordion-body collapse\" id=\"collapseConversationFieldSettingsEE\">\n      <div class=\"accordion-inner\">\n				<span class=\"locale_conversation_fields_explanation\"></span>\n        <ul class=\"conversation_field_settings unstyled\"></ul>\n        <div class=\"breadcrumb\">\n          <span class=\"pull-right\"> \n            <span class=\"locale_Encrypt_if_confidential\"></span>\n            <input type=\"checkbox\" class=\"add_conversationShouldBeEncrypted\"";
  foundHelper = helpers.shouldBeEncrypted;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.shouldBeEncrypted; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "></input>\n          </span> \n          <input type=\"text\" class=\"span3 choose_add_conversation_field\"  data-provide=\"typeahead\" data-items=\"4\" data-source=\"[&quot;Semantic Context&quot;,&quot;Speakers&quot;,&quot;Register&quot;,&quot;World Knowledge&quot;,&quot;External References&quot;,&quot;Location&quot;,&quot;Notes&quot;]\">\n          <label class=\"locale_Help_Text\"></label>\n          <textarea class=\"add_conversation_help locale_Help_Text_Placeholder\"></textarea>\n          <a href=\"#\" class=\"locale_Add_New_Conversation_Field_Tooltip btn btn-primary add-conversation-field locale_Add\" rel=\"tooltip\">\n          </a>\n        </div>\n      </div>\n    </div>\n  </div>      \n</div>\n\n<!-- Corpus comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-corpus\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['corpus_edit_new_modal'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"modal-header\">\n  <h1> <i class=\"icon-cloud\"></i>  <span class = \"locale_New_Corpus\"></span> <small class=\"new-corpus-pouchname\">";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small></h1>\n  <p class = \"locale_New_Corpus_Instructions\"></p>\n  <p class=\"alert alert-danger hide\">\n    <strong class=\"locale_Warning\"></strong> \n    <span class = \"locale_New_Corpus_Warning\"></span>\n  </p>\n</div>\n\n<div class=\"modal-body\">\n	<label class = \"locale_Title\"></label>  \n	<textarea class=\"corpus-title-input\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n	<label class = \" locale_Description\">Description:</label>\n	<textarea class=\" corpus-description-input\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n  <label class = \" locale_Public_or_Private\"></label>\n  <input type=\"text\" value=\"";
  foundHelper = helpers.publicCorpus;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.publicCorpus; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"  class=\" public-or-private\" data-provide=\"typeahead\" data-items=\"4\" \n        data-source=\"[&quot;Public&quot;,&quot;Private&quot;]\"/>\n</div>\n\n<div class=\"modal-footer\">\n  <a href=\"#\" class=\"btn locale_Cancel\" data-dismiss=\"modal\"></a>\n  <button class=\"btn btn-success pull-right save-corpus locale_Save\" value=\"Save\"></button>  \n</div>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['corpus_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- Corpus icons - Different for all Corpus Handlebars -->\n<div class=\"pull-right\">\n  <a href=\"#\" class = \"locale_Edit_corpus\" rel=\"tooltip\">\n    <i class=\"icons icon-edit\"></i></a>\n  <a href=\"#\" class= \"locale_Show_in_Dashboard\" rel=\"tooltip\" >\n    <i class=\"icons icon-resize-small\"></i></a>\n</div>\n<div class=\"btn-toolbar \">\n  <!-- Corpus Menu - Identical for all Corpus Handlebars -->\n  <div class=\"btn-toolbar\">\n    <div class=\"btn-group\">\n      <button class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\">\n        <span class =\"locale_New_menu\"></span>  <span class=\"caret\"></span>\n      </button>\n      <ul class=\"dropdown-menu\">\n        <li class=\"new-datum\"><a href=\"#\" class = \"locale_New_Datum\"></a></li>\n        <li class=\"new-conversation\"><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/conversation/new\" class = \"locale_New_Conversation\"></a></li>\n        <li class=\"new-data-list\"><a href=\"#\" class = \"locale_New_Data_List\"></a></li>\n        <li class=\"new-session\"><a href=\"#\" class = \"locale_New_Session\"></a></li>\n        <li class=\"new-corpus\"><a href=\"#\" class = \"locale_New_Corpus\"></a></li>\n      </ul>\n    </div>\n    <div class=\"btn-group\">\n      <button class=\"btn btn-info dropdown-toggle\" data-toggle=\"dropdown\">\n        <span class =\"locale_Data_menu\"></span> <span class=\"caret\"></span>\n      </button>\n      <ul class=\"dropdown-menu\">\n        <li><a href=\"#import\" class = \"locale_Import_Data\"></a></li>\n        <li><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/export\" class = \"locale_Export_Data\"></a></li>\n        <li><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/alldata\" class = \"locale_All_Data\"></a></li>\n      </ul>\n    </div>\n    <!-- /Corpus Menu - Identical for all Corpus Handlebars -->\n  </div>\n</div>\n\n<h2><i class=\"icon-cloud\"></i> ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " <small>";
  foundHelper = helpers.publicCorpus;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.publicCorpus; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small></h2>\n<a href = \"http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/";
  foundHelper = helpers.titleAsUrl;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.titleAsUrl; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" target = \"_blank\"><i class=\" icon-link\"></i></a>\n<small>Shareable URL: http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/";
  foundHelper = helpers.titleAsUrl;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.titleAsUrl; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n<div class=\"description\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n\n<!-- Force directed graph of morphemes in the corpus -->\n<div class=\"corpus-precedence-rules-visualization\" id=\"corpus-precedence-rules-visualization-fullscreen\"></div>\n\n<div class=\"accordion\" id=\"accordion-read-embedded\">\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-read-embedded\" href=\"#collapseSessionsRE\">\n        <i class=\"icon-calendar\"></i> <strong class=\"locale_Sessions_associated\"></strong>\n         </a>\n    </div>\n    <div id=\"collapseSessionsRE\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n				<span class=\"locale_elicitation_sessions_explanation\"></span>\n				<ul class = \"sessions-updating-collection unstyled\">\n                <!-- Updating Sessions Collection -->\n        </ul>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-read-embedded\" href=\"#collapseDatalistsRE\">\n          <i class=\"icon-pushpin\"></i> <strong class=\"locale_Datalists_associated\"></strong>\n        </a>\n    </div>\n    <div id=\"collapseDatalistsRE\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n				<span class=\"locale_datalists_explanation\"></span>\n        <ul class = \"datalists-updating-collection unstyled\">\n                <!-- Updating DataLists Collection -->\n        </ul>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-read-embedded\" href=\"#collapsePermissionsRE\">\n        <i class=\"icon-group\"></i> <strong class=\"locale_Permissions_associated\"></strong>\n        </a>\n    </div>\n    <div id=\"collapsePermissionsRE\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner \">\n				<span class=\"locale_permissions_explanation\"></span>\n        <p>\n        <button class=\"btn btn-inverse reload-corpus-team-permissions\"><i class=\"icon-refresh\"></i> See current team members</button>\n        </p>\n        <ul class = \"permissions-updating-collection unstyled\">\n                      <!-- Updating Permissions Collection -->\n        </ul>\n      </div>\n    </div>\n  </div>\n  \n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n        <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-read-embedded\" href=\"#collapseDatumFieldSettingsRE\">\n          <i class=\"icon-list\"></i>  <strong class=\"locale_Datum_field_settings\"></strong>\n        </a>\n    </div>\n    <div id=\"collapseDatumFieldSettingsRE\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n				<span class=\"locale_datum_fields_explanation\"></span>\n				<ul class=\"datum_field_settings unstyled\"></ul>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-read-embedded\" href=\"#collapseDatumStateSettingsRE\">\n        <i class=\"icon-flag\"></i> <strong class=\"locale_Datum_state_settings\"></strong>\n        </a>\n    </div>\n    <div id=\"collapseDatumStateSettingsRE\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n        <span class=\"locale_datum_states_explanation\"></span>\n        <ul class=\"datum_state_settings unstyled\"></ul>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#accordion-read-embedded\" href=\"#collapseLessonsSettingsRE\">\n        <i class=\"icon-gift\"></i> <strong class=\"\">New! Add Language Lessons components to this corpus</strong>\n        </a>\n    </div>\n    <div id=\"collapseLessonsSettingsRE\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n        <a href=\"https://ifielddevs.iriscouch.com/public-firstcorpus/_design/pages/lessons_corpus/index.html\" target=\"_blank\">See prototype</a>        \n\n      </div>\n    </div>\n  </div>\n</div> \n\n<!-- Corpus comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-corpus\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['corpus_read_link'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<a href=\"user.html#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/";
  foundHelper = helpers.corpusid;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.corpusid; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n<i class=\"icon-cloud\"></i>\n";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " ";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " ";
  foundHelper = helpers.corpusid;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.corpusid; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n<small> ";
  foundHelper = helpers.publicCorpus;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.publicCorpus; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['corpus_summary_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- Corpus icons - Different for all Corpus Handlebars -->\n<div class=\"pull-right\">\n  <a href=\"#\" class= \"locale_Show_Readonly\" rel=\"tooltip\">\n    <i class=\"icons icon-book\"></i></a>\n  <a href=\"#\" class = \"locale_Show_corpus_settings\" rel=\"tooltip\">\n    <i class=\"icons icon-cogs resize-full\"></i></a>\n</div>\n<div class=\"btn-toolbar \">\n  <!-- Corpus Menu - Identical for all Corpus Handlebars -->\n  <div class=\"btn-toolbar\">\n    <div class=\"btn-group\">\n      <button class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\">\n        <span class =\"locale_New_menu\"></span>  <span class=\"caret\"></span>\n      </button>\n      <ul class=\"dropdown-menu\">\n        <li class=\"new-datum\"><a href=\"#\" class = \"locale_New_Datum\"></a></li>\n        <li class=\"new-conversation\"><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/conversation/new\" class = \"locale_New_Conversation\"></a></li>\n        <li class=\"new-data-list\"><a href=\"#\" class = \"locale_New_Data_List\"></a></li>\n        <li class=\"new-session\"><a href=\"#\" class = \"locale_New_Session\"></a></li>\n        <li class=\"new-corpus\"><a href=\"#\" class = \"locale_New_Corpus\"></a></li><!--if put corpus modal on user page user.html#corpus/new -->\n      </ul>\n    </div>\n    <div class=\"btn-group\">\n      <button class=\"btn btn-info dropdown-toggle\" data-toggle=\"dropdown\">\n        <span class =\"locale_Data_menu\"></span> <span class=\"caret\"></span>\n      </button>\n      <ul class=\"dropdown-menu\">\n        <li><a href=\"#import\" class = \"locale_Import_Data\"></a></li>\n        <li><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/export\" class = \"locale_Export_Data\"></a></li>\n        <li><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/alldata\" class = \"locale_All_Data\"></a></li>\n        \n      </ul>\n    </div>\n    <!-- /Corpus Menu - Identical for all Corpus Handlebars -->\n  </div>\n</div>\n\n<div class=\"corpus-description\">\n	<label class=\"locale_Title\"></label> <i class=\"icon-cloud\"></i> \n	<!-- <a href = \"http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/";
  foundHelper = helpers.titleAsUrl;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.titleAsUrl; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" target = \"_blank\"><small><i class=\" icon-link\"></i></small></a> -->\n	<textarea class=\"corpus-title-input save-corpus-blur\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n	<label class=\"locale_Description\"></label>\n	<textarea class=\"corpus-description-input save-corpus-blur\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n	<input type=\"text\" value=\"";
  foundHelper = helpers.publicCorpus;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.publicCorpus; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\" public-or-private\"\n		data-provide=\"typeahead\" data-items=\"4\"\n		data-source=\"[&quot;Public&quot;,&quot;Private&quot;]\" />\n</div>\n\n\n\n\n\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['corpus_summary_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- Corpus icons - Different for all Corpus Handlebars -->\n<div class=\"pull-right\">\n	<a href=\"#\" class=\"locale_Edit_corpus\" rel=\"tooltip\"> <i\n		class=\"icons icon-edit\"></i></a> <a href=\"#\"\n		class=\"locale_Show_corpus_settings\" rel=\"tooltip\"> <i\n		class=\"icons icon-cogs resize-full\"></i></a>\n</div>\n<div class=\"btn-toolbar \">\n	<!-- Corpus Menu - Identical for all Corpus Handlebars -->\n	<div class=\"btn-toolbar\">\n		<div class=\"btn-group\">\n			<button class=\"btn btn-primary dropdown-toggle\"\n				data-toggle=\"dropdown\">\n				<span class=\"locale_New_menu\"></span> <span class=\"caret\"></span>\n			</button>\n			<ul class=\"dropdown-menu\">\n				<li class=\"new-datum\"><a href=\"#\" class=\"locale_New_Datum\"></a></li>\n				<li class=\"new-conversation\"><a\n					href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/conversation/new\"\n					class=\"locale_New_Conversation\"></a></li>\n				<li class=\"new-data-list\"><a href=\"#\"\n					class=\"locale_New_Data_List\"></a></li>\n				<li class=\"new-session\"><a href=\"#\" class=\"locale_New_Session\"></a></li>\n				<li class=\"new-corpus\"><a href=\"#\" class=\"locale_New_Corpus\"></a></li>\n			</ul>\n		</div>\n		<div class=\"btn-group\">\n			<button class=\"btn btn-info dropdown-toggle\" data-toggle=\"dropdown\">\n				<span class=\"locale_Data_menu\"></span> <span class=\"caret\"></span>\n			</button>\n			<ul class=\"dropdown-menu\">\n				<li><a href=\"#import\" class=\"locale_Import_Data\"></a></li>\n				<li><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/export\"\n					class=\"locale_Export_Data\"></a></li>\n				<li><a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/alldata\"\n					class=\"locale_All_Data\"></a></li>\n\n			</ul>\n		</div>\n		<!-- /Corpus Menu - Identical for all Corpus Handlebars -->\n	</div>\n</div>\n\n<div class=\"corpus-description\">\n	<h4>\n		<i class=\"icon-cloud\"></i> ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "<small> ";
  foundHelper = helpers.publicCorpus;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.publicCorpus; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n	</h4>\n	<p>\n		<!-- <a href = \"http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/";
  foundHelper = helpers.titleAsUrl;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.titleAsUrl; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" target = \"_blank\"><i class=\" icon-link\"></i></a> -->\n		";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n	</p>\n</div>\n\n\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['data_list_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

function program5(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n          <option value=\"";
  foundHelper = helpers.state;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" ";
  foundHelper = helpers.selected;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.selected; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + ">";
  foundHelper = helpers.state;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</option>\n      ";
  return buffer;}

  buffer += "<div class=\"pull-right\">\n  <a href=\"#\" class= \"locale_Show_Readonly\" rel=\"tooltip\">\n      <i class=\"icons icon-book\"></i></a>\n  <a href=\"#\" class= \"locale_Show_in_Dashboard\" rel=\"tooltip\" >\n      <i class=\"icons icon-resize-small\"></i></a>\n</div>\n<button class=\"btn btn-success pull-left save-datalist locale_Save\" value=\"Save\"></button>\n<br>\n<br>\n <i class=\"icon-pushpin\"></i> \n<small>";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n<label class = \"locale_Title\"></label>\n<textarea class=\"data-list-title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n<h4>";
  foundHelper = helpers.dateCreated;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateCreated; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h4>\n<label class = \"locale_Description\"></label>\n<textarea class=\"data-list-description locale_Datalist_Description\"\n>";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a>\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>\n\n\n<!-- Datum states dropdown\n <div class = \"datum-state span3 pull-right\">\n    <span class=\"label label-";
  foundHelper = helpers.statecolor;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.statecolor; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " datum-state-color \"><i class = \" icon-flag\"></i><span class=\"datum-state-value\">";
  foundHelper = helpers.datumstate;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumstate; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span></span><br/>\n    <select class=\"datum_state_select pull-right\">\n      ";
  stack1 = depth0.datumStates;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </select>\n\n</div>\n -->\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['data_list_import_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += " <i class=\"icon-pushpin\"></i> \n <label class = \"locale_Title\"></label>\n<textarea class=\"data-list-title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n<label class = \"locale_Description\"></label>\n<textarea class=\"data-list-description locale_Datalist_Description\">\n";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--Import DataList Menu  -->\n<div class=\"btn-group\">\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['data_list_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<div class=\"pull-right\">\n  <a href=\"#\" rel=\"tooltip\" class=\"locale_Edit_Datalist\">\n    <i class=\"icons icon-edit\"></i></a>\n  <a href=\"#\" class= \"locale_Show_in_Dashboard\" rel=\"tooltip\" >\n    <i class=\"icons icon-resize-small\"></i></a> \n</div>\n\n<h3><i class=\"icon-pushpin\"></i> ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n<small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small></h3>\n<h4>";
  foundHelper = helpers.dateCreated;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateCreated; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h4>\n\n";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a>\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['data_list_read_link'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "  <a href=\"#data/";
  foundHelper = helpers._id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"> \n	  <i class=\"icon-pushpin\"></i> \n	  ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n  </a>\n  <small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['data_list_search_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<!--  Search Data lists icons -->\n<div class=\"pull-right\">\n  <button class=\"btn btn-success save-search-datalist locale_Save\" value=\"Save\"></button>\n  <a href=\"#\" class= \"locale_Hide_Datalist\" rel=\"tooltip\">\n      <i class=\"icons icon-minus-sign\"></i>\n  </a>  \n</div>\n<h4><i class=\"icon-search\"></i> Search Result</h4>\n<label class=\"locale_Title\"></label> \n<i class=\"icon-pushpin\"></i> <small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n<textarea class=\"data-list-title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n<label class=\"locale_Description\"></label>\n<textarea class=\"data-list-description locale_Datalist_Description\">\n";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n<!--Search DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <!--This cannot be included in search or import <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a> -->\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['data_list_summary_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<div class=\"pull-right\">\n  <button class=\"btn btn-success save-datalist locale_Save\" value=\"Save\">\n  </button>\n  <a href=\"#\" class= \"locale_Hide_Datalist\" rel=\"tooltip\">\n     <i class=\"icons icon-minus-sign\"></i></a>      \n  <a href=\"#\" class= \"locale_Show_Readonly\" rel=\"tooltip\">\n     <i class=\"icons icon-book\"></i></a>      \n  <a href=\"#\" class = \"locale_Show_Fullscreen\" rel=\"tooltip\">\n     <i class=\"icons icon-resize-full\"></i></a>     \n</div>\n\n<i class=\"icon-pushpin\"></i> \n<small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n<label class = \"locale_Title\"></label> \n<textarea class=\"data-list-title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n<label class = \"locale_Description\"></label>\n<textarea class=\"data-list-description locale_Datalist_Description\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a>\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['data_list_summary_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

  buffer += "<div class=\"pull-right\">\n  <a href=\"#\" class= \"locale_Hide_Datalist\" rel=\"tooltip\">\n      <i class=\"icons icon-minus-sign\"></i></a>      \n  <a href=\"#\" class = \"locale_Edit_Datalist\" rel=\"tooltip\">\n      <i class=\"icons icon-edit\"></i></a>      \n  <a href=\"#\" class = \"locale_Show_Fullscreen\" rel=\"tooltip\">\n      <i class=\"icons icon-resize-full\"></i></a>\n</div>\n\n<h3><i class=\"icon-pushpin\"></i> ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "<small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small></h3>\n<p><strong>";
  foundHelper = helpers.dateCreated;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateCreated; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</strong>\n";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n</p>\n\n<!-- Data list comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datalist\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n\n<!--DataList Menu  -->\n<div class=\"btn-group\">\n  <a  href=\"#\" class = \"locale_Play_Audio_checked btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-bullhorn\"></i></a>\n  <a  href=\"#\" class = \"locale_Remove_checked_from_datalist_tooltip btn btn-mini btn-primary\" rel=\"tooltip\" >\n    <i class=\" icon-remove-sign\"></i></a>\n  <a href=\"#\" class= \"locale_Decrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-unlock\"></i></a> \n  <a href=\"#\" class= \"locale_Encrypt_checked btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" icon-lock\"></i></a>\n  <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n    <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a>\n  <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip_checked btn btn-mini btn-info\" rel=\"tooltip\" >\n    <i class=\" icon-paste\"></i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_LaTeX btn btn-mini btn-info latex-export-datalist LaTeX\" rel=\"tooltip\">\n    <i class=\"\">LaTeX</i></a>\n  <a href=\"#\" class = \"locale_Export_checked_as_CSV btn btn-mini btn-info CSV\" rel=\"tooltip\">\n    <i class=\"\">CSV</i></a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['data_list_summary_read_minimized'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"pull-right\">\n  <a  href=\"#\" class= \"locale_Show_Datalist\" rel=\"tooltip\" title=\"Show data list\" >\n      <i class=\"icons icon-plus-sign\"></i></a>\n</div>\n<h4><i class=\"icon-pushpin\"></i> ";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "<small> ";
  foundHelper = helpers.datumCount;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumCount; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small></h4>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_container_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<!-- full screen button -->\n<div class=\"pull-right\">\n  <a href=\"#\" class= \"locale_Show_Readonly\" rel=\"tooltip\">\n      <i class=\"icons icon-book\"></i></a>        \n  <a href=\"#\" class = \"locale_Show_Fullscreen\" rel=\"tooltip\">\n      <i class=\"icons icon-resize-full\"></i></a>\n</div>\n<h4 class=\"locale_Data_Entry_Area\"></h4>\n\n<!-- Required so that the full screen button doesn't end up inside the next div -->\n<div class=\"clear-spacing\"></div>\n\n<!-- list of datum -->\n<ul class=\"datum-embedded-ul unstyled\"></ul>";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_container_edit_fullscreen'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<!-- shrink button -->\n<div class=\"pull-right\">\n  <a href=\"#\" class= \"locale_Show_Readonly\" rel=\"tooltip\">\n      <i class=\"icons icon-book\"></i></a>    \n  <a href=\"#\" class= \"locale_Show_in_Dashboard\" rel=\"tooltip\" >\n      <i class=\"icons icon-resize-small\"></i></a>\n</div>\n<h4 class=\"locale_Data_Entry_Area\"></h4>\n\n<!-- Required so that the full screen button doesn't end up inside the next div -->\n<div class=\"clear-spacing\"></div>\n\n<!-- list of datum -->\n<ul class=\"datum-embedded-ul unstyled\"></ul>";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_container_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"pull-right\">\n  <a href=\"#\" class = \"locale_Edit_Datum\" rel=\"tooltip\" >\n    <i class=\"icons icon-edit\"></i></a>     \n  <a href=\"#\" class = \"locale_Show_Fullscreen\" rel=\"tooltip\">\n    <i class=\"icons icon-resize-full\"></i></a>\n</div>\n<h4 class=\"locale_Data_Entry_Area\"></h4>\n\n<!-- Required so that the full screen button doesn't end up inside the next div -->\n<div class=\"clear-spacing\"></div>\n\n<!-- list of datum -->\n<ul class=\"datum-embedded-ul unstyled\"></ul>";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_container_read_fullscreen'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"pull-right\">\n  <a href=\"#\" class = \"locale_Edit_Datum\" rel=\"tooltip\" > \n    <i class=\"icons icon-edit\"></i></a>\n  <a href=\"#\" class= \"locale_Show_in_Dashboard\" rel=\"tooltip\" >\n    <i class=\"icons icon-resize-small\"></i></a>\n</div>\n<h4 class=\"locale_Data_Entry_Area\"></h4>\n\n<!-- Required so that the full screen button doesn't end up inside the next div -->\n<div class=\"clear-spacing\"></div>\n\n<!-- list of datum -->\n<ul class=\"datum-embedded-ul unstyled\"></ul>";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-lock";}

function program3(depth0,data) {
  
  
  return "icon-unlock";}

function program5(depth0,data) {
  
  
  return "icon-eye-close";}

function program7(depth0,data) {
  
  
  return "icon-eye-open";}

function program9(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n          <option value=\"";
  foundHelper = helpers.state;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" ";
  foundHelper = helpers.selected;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.selected; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + ">";
  foundHelper = helpers.state;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</option>\n      ";
  return buffer;}

  buffer += "<div class=\"pull-right\">\n	<button class=\"btn btn-success save-datum locale_Save pull-right\" value=\"Save\"></button><br/>\n	<span class=\"last-modified\">";
  foundHelper = helpers.dateModified;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateModified; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span><i class=\" icon-save \"></i><br/>\n	<span class=\"date-created\">";
  foundHelper = helpers.dateEntered;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateEntered; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span><i class=\" icon-time\"></i><br/>\n  \n</div>\n<!-- list for the fields -->\n<ul class=\"datum_fields_ul unstyled\"></ul>\n<a  href=\"#\" class= \"locale_See_Fields\" rel=\"tooltip\" >\n  <i class=\"icons icon-list-alt pull-right\"> </i></a>\n<!-- Datum Edit view specialized fields and menu area -->\n<div class=\"row-fluid\">\n	<div class=\"span6\">\n		<!-- Buttons for various actions -->\n	  <div class=\" btn-group\">\n	    <a href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/datum/new\" class = \"locale_Insert_New_Datum btn btn-mini btn-primary\" rel=\"tooltip\">\n	      <i class=\" icon-plus\"></i></a>\n	    <a  href=\"#\" class = \"locale_Duplicate btn btn-mini btn-primary\" rel=\"tooltip\">\n	      <i class=\" icon-copy\"></i></a>  \n	    <a  href=\"#\" class= \"locale_Encrypt btn btn-mini btn-primary\" rel=\"tooltip\">\n	      <i class=\" ";
  stack1 = depth0.confidential;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i></a> \n	    <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n	      <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i>\n	    </a>\n	    <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip btn btn-mini btn-info\" rel=\"tooltip\" >\n	      <i class=\" icon-paste\"></i></a>\n	    <a href=\"#\" class = \"locale_LaTeX  LaTeX btn btn-mini btn-info\" rel=\"tooltip\">\n	      <i class=\"\">LaTeX</i>\n	    </a>\n	    <a href=\"#\" class = \"locale_CSV_Tooltip CSV btn btn-mini btn-info\" rel=\"tooltip\">\n	      <i class=\"\">CSV</i>\n	    </a>\n	  </div>\n	  <br/>\n		<a href=\"#\" class=\"audio_video locale_Drag_and_Drop_Audio_Tooltip\" rel=\"tooltip\"></a>\n		<span class=\"session-link\"></span>\n	</div>\n  <div class=\"span3 border-left\">\n		<!-- list for the tags -->\n		<ul class=\"datum_tags_ul unstyled\"></ul>\n		<div class=\"controls  no-margin-left\">\n			<!-- TODO go through the corpus to find tags, and put them in this autocomplete -->\n			<div class=\"input-append \">\n			  <input class=\"add_tag span6\" type=\"text\" data-provide=\"typeahead\" data-items=\"4\" \n	            data-source=\"[&quot;Passive&quot;,&quot;Nominalization&quot;]\" \n	      /><button class=\" btn btn-small btn-primary add_datum_tag\" type=\"button\">\n	        <i class=\" icon-tag\"></i>\n	        <span class=\"locale_Add\">Add</span> \n	      </button>\n	    </div>\n		</div>\n	</div>\n  <div class=\"datum_state span3 border-left\">\n    <span class=\"label label-";
  foundHelper = helpers.statecolor;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.statecolor; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " datum-state-color \"><i class = \" icon-flag\"></i><span class=\"datum-state-value\">";
  foundHelper = helpers.datumstate;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.datumstate; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span></span><br/>\n		<!-- drop down for the states -->\n    <select class=\"datum_state_select span12 \">\n      ";
  stack1 = depth0.datumStates;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(9, program9, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </select>\n  </div>\n</div>\n\n\n<!-- Datum comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datum\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_field_settings_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<span class=\"pull-right ";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n\n<span class =\"locale_Encrypt_if_confidential\"></span>\n  <input type=\"checkbox\" class=\"shouldBeEncrypted \" ";
  foundHelper = helpers.shouldBeEncrypted;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.shouldBeEncrypted; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "></input>\n</span>\n\n<input class=\"choose-field \" ";
  foundHelper = helpers.userchooseable;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.userchooseable; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " value=\"";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"/>\n<label class = \"locale_Help_Text\"></label>\n<textarea class=\"help-text locale_Help_Text_Placeholder\">";
  foundHelper = helpers.help;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.help; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_field_settings_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- this is a read-only version.  -->\n<span class=\"pull-right\">\n\n<span class =\"locale_Encrypt_if_confidential\"></span>\n<input type=\"checkbox\" class=\"shouldBeEncrypted\" ";
  foundHelper = helpers.shouldBeEncrypted;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.shouldBeEncrypted; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " disabled></input>\n</span>\n<h4>";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h4> \n<p>";
  foundHelper = helpers.help;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.help; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_field_value_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n<a  href=\"#\" class=\"help-conventions\" rel=\"popover\" data-placement=\"bottom\" data-content=\"";
  foundHelper = helpers.help;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.help; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" \n  data-original-title=\"Conventions/Help\" tabindex=\"-1\">\n  <i class=\"icon-question-sign\"></i>\n</a>\n";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n<br>\n<input class=\"datum_field_input small-field\" type=\"text\" value=\"";
  foundHelper = helpers.mask;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.mask; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n";
  return buffer;}

function program5(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n<textarea class=\"datum_field_input\">";
  foundHelper = helpers.mask;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.mask; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n";
  return buffer;}

  buffer += "<label class=\"datum_field_label\">";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</label>\n";
  stack1 = depth0.helpText;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = depth0.size;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_field_value_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n<a  href=\"#\" class=\"help-conventions\" rel=\"popover\" data-placement=\"bottom\" data-content=\"";
  foundHelper = helpers.help;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.help; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" \n  data-original-title=\"Conventions/Help\" tabindex=\"-1\">\n  <i class=\"icon-question-sign\"></i>\n</a>\n";
  return buffer;}

  buffer += "<h4 class=\"datum_field_h4\">";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h4>\n";
  stack1 = depth0.helpText;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n<p>";
  foundHelper = helpers.mask;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.mask; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "icon-eye-close";}

function program3(depth0,data) {
  
  
  return "icon-eye-open";}

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n	  ";
  stack1 = depth0.selected;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(6, program6, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	  ";
  return buffer;}
function program6(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n	  <span class=\"label label-";
  foundHelper = helpers.color;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.color; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"><i class = \" icon-flag\"></i>";
  foundHelper = helpers.state;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n	  ";
  return buffer;}

  buffer += "<!-- list for the fields -->\n<ul class=\"datum_fields_ul unstyled\"></ul>\n<div class=\"\">\n  <i class=\" icon-save \"></i><span class=\"last-modified\">";
  foundHelper = helpers.dateModified;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateModified; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span><br/>\n  <i class=\" icon-time\"></i><span class=\"date-created\">";
  foundHelper = helpers.dateEntered;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateEntered; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span><br/>\n  <span class=\"session-link\"></span>\n</div>\n<hr/>\n<!-- Datum Read only specialized fields and menu area -->\n<div class=\"row-fluid\">\n  <div class=\"span5\">\n    <!-- Buttons for various read only actions -->\n    <div class=\" btn-group\">\n      <a href=\"#\" class = \"locale_Show_confidential_items_Tooltip btn btn-mini btn-primary\" rel=\"tooltip\">\n        <i class=\" ";
  stack1 = depth0.decryptedMode;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></i>\n      </a>\n      <a  href=\"#\" class = \"locale_Plain_Text_Export_Tooltip btn btn-mini btn-info\" rel=\"tooltip\" >\n        <i class=\" icon-paste\"></i></a>\n      <a href=\"#\" class = \"locale_LaTeX  LaTeX btn btn-mini btn-info\" rel=\"tooltip\">\n        <i class=\"\">LaTeX</i>\n      </a>\n      <a href=\"#\" class = \"locale_CSV_Tooltip CSV btn btn-mini btn-info\" rel=\"tooltip\">\n        <i class=\"\">CSV</i>\n      </a>\n    </div>\n    <br/>\n    <div class=\"audio_video \"></div>\n  </div>\n  <div class=\"span4 border-left\">\n    <!-- list for the tags -->\n    <ul class=\"datum_tags_ul unstyled\"></ul>\n  </div>\n  <div class=\"datum_state span3 border-left\">\n    ";
  stack1 = depth0.datumStates;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </div>\n</div>\n\n<!-- Datum comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-datum\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_read_latex'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n    <span class = \"latex-judgement\">";
  foundHelper = helpers.judgement;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.judgement; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span> \n  ";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n	  <span class=\"glossCouplet\">\n	    ";
  foundHelper = helpers.utteranceSegment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.utteranceSegment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n	    <br />\n	    ";
  foundHelper = helpers.glossSegment;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.glossSegment; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n	  </span>\n	";
  return buffer;}

  buffer += "<div class=\"span1\">\n  <input type=\"checkbox\" class=\"datum-checkboxes\"></input>\n</div>\n<div class=\"span1\">\n  ";
  stack1 = depth0.judgement;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n<div class=\"span10\">\n	";
  stack1 = depth0.couplet;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	<br />\n	<span class=\"datum-latex-translation\">";
  foundHelper = helpers.translation;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.translation; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_state_settings_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<input class=\"datum_state_input\" value=\"";
  foundHelper = helpers.state;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"></input>\n<select class=\"color_chooser\">\n  <option value=\"success\" class=\"locale_Green\"></option>\n  <option value=\"warning\" class=\"locale_Orange\"></option>\n  <option value=\"important\" class=\"locale_Red\"></option>\n  <option value=\"info\" class=\"locale_Teal\"></option>\n  <option value=\"inverse\" class=\"locale_Black\"></option>\n  <option value=\"\" class=\"locale_Default\"></option>\n</select>\n<span class=\"label label-";
  foundHelper = helpers.color;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.color; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"><i class = \" icon-flag\"></i>";
  foundHelper = helpers.state;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_state_settings_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- this is a read-only version.  -->\n\n\n<span class=\"label label-";
  foundHelper = helpers.color;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.color; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"><i class = \" icon-flag\"></i>";
  foundHelper = helpers.state;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_tag_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<input class=\"datum_tag input-small span12\" value=\"";
  foundHelper = helpers.tag;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tag; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"></input>\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['datum_tag_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<span class=\"label label-info\"><i class = \" icon-tag\"></i>";
  foundHelper = helpers.tag;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tag; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['paging_footer'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "\n    <a href=\"#\" class=\"nextinfinitepagination\"><span class = \"locale_More\"></span></a>\r\n    ";}

function program3(depth0,data) {
  
  
  return "\r\n        (All)\r\n      ";}

  buffer += "<div class=\"\">\r\n  <span class=\"cell\">\r\n    ";
  stack1 = depth0.morePages;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <span class=\"cell howmanyperpagination\">\r\n        <span class = \"locale_Show\"></span>\r\n      <a href=\"#\" class=\"selected\">10</a>      |\r\n      <a href=\"#\" class=\"\">50</a>\r\n     |\n      <a href=\"#\" class=\"\">100</a>\r\n       <span class = \"locale_per_page\"></span>\n    </span>\r\n    <span class=\"divider\">/</span>\r\n    <span class=\"cell first records\">\r\n      <span class=\"current\">";
  foundHelper = helpers.currentPage;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.currentPage; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\r\n\r\n <span class = \"locale_of\"></span>\r\n      <span class=\"total\">";
  foundHelper = helpers.totalPages;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.totalPages; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\r\n  <span class = \"locale_pages_shown\"></span>\r\n      ";
  stack1 = depth0.allShown;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </span>\r\n  </span>\r\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['session_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"pull-right\">\n	<a href=\"#\" class=\"locale_Show_Readonly\" rel=\"tooltip\"> <i\n		class=\"icons icon-book\"></i></a> <a href=\"#\"\n		class=\"locale_Show_in_Dashboard\" rel=\"tooltip\"> <i\n		class=\"icons icon-resize-small\"></i></a>\n</div>\n<button class=\"btn btn-success pull-left btn-save-session locale_Save\"\n	value=\"Save\"></button>\n\n<!-- Required so that the full screen button doesn't end up inside the next div -->\n<div class=\"clear-spacing\"></div>\n<h1>\n	<i class=\"icon-calendar\"></i> <span class=\"locale_Elicitation_Session\"></span>\n</h1>\n<ul class=\"session-fields-ul unstyled\"></ul>\n\n\n<!-- Session comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n	<textarea class=\"comment-new-text\"></textarea>\n	<button class=\"btn btn-mini btn-primary add-comment-session\"\n		value=\"Add\">\n		<i class=\"icon-comment\"></i> <span class=\"locale_Add\"></span>\n	</button>\n</div>";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['session_edit_import'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<i class=\"icon-calendar\"></i> <strong class = \"locale_Elicitation_Session\"></strong>\n<br />\n<label class=\"locale_Goal\"></label>\n<textarea class=\"session-goal-input\">";
  foundHelper = helpers.goal;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.goal; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea><br />\n\n<label class=\"locale_Consultants\"></label>\n<textarea class=\"session-consultant-input\">";
  foundHelper = helpers.consultants;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.consultants; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea> <br />\n\n<label class = \"locale_When\"></label>\n<textarea class=\"session-elicitation-date-input\">";
  foundHelper = helpers.dateElicited;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateElicited; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['session_edit_modal'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"modal-header\">\n  <h1><i class=\"icon-calendar\"></i> <span class = \"locale_New_Session\"></span><small>";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small></h1>\n  <span  class= \"locale_New_Session_Instructions\"></span>\n</div>\n<div class=\"modal-body\">\n  <ul class=\"session-fields-ul unstyled\"></ul>\n  <a href=\"#\" class=\"btn locale_Cancel\" data-dismiss=\"modal\"></a>\n  <button class=\"btn btn-success pull-right btn-save-session locale_Save\" value=\"Save\"></button>  \n</div>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['session_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"pull-right\">\n  <a href=\"#\" class = \"locale_Edit_Session\" rel=\"tooltip\">\n      <i class=\"icons icon-edit\"></i></a>\n  <a href=\"#\" class= \"locale_Show_in_Dashboard\" rel=\"tooltip\" >\n      <i class=\"icons icon-resize-small\"></i></a>\n</div>\n\n<h1 ><i class=\"icon-calendar\"> </i><span class = \"locale_Elicitation_Session\"></span></h1>\n<ul class=\"session-fields-ul unstyled\"></ul>\n\n<!-- Session comments -->\n<ul class=\"comments unstyled\"></ul>\n<div class=\"alert alert-info\">\n  <textarea class=\"comment-new-text\"></textarea>\n  <button class=\"btn btn-mini btn-primary add-comment-session\" value=\"Add\">\n    <i class=\"icon-comment\"></i>\n    <span class = \"locale_Add\"></span> \n  </button>\n</div>";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['session_read_link'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<a href=\"#session/";
  foundHelper = helpers._id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\n<i class=\"icon-calendar\"></i>\n  <span>";
  foundHelper = helpers.dateElicited;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateElicited; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span> \n</a>\n--\n<span class= \"locale_Consultants\"></span> <span>";
  foundHelper = helpers.consultants;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.consultants; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n<br/>\n<span class = \"locale_Goal\"></span> <span>";
  foundHelper = helpers.goal;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.goal; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['session_summary_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"pull-right\">\n   <a href=\"#\" class= \"locale_Show_Readonly\" rel=\"tooltip\">\n    <i class=\"icons icon-book\"></i></a>\n  <a href=\"#\" class = \"locale_Show_Fullscreen\" rel=\"tooltip\">    \n    <i class=\"icons icon-resize-full\"></i></a>\n</div>\n  \n<i class=\"icon-calendar\"></i> <strong class = \"locale_Elicitation_Session\"></strong>\n<br />\n<label class=\"locale_Goal\"></label>\n<textarea class=\"session-goal-input\">";
  foundHelper = helpers.goal;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.goal; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea><br />\n\n<label class=\"locale_Consultants\"></label>\n<textarea class=\"session-consultant-input\">";
  foundHelper = helpers.consultants;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.consultants; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea> <br />\n\n<label class = \"locale_When\"></label>\n<textarea class=\"session-elicitation-date-input\">";
  foundHelper = helpers.dateElicited;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateElicited; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['session_summary_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"pull-right\">\n	<a href=\"#\" class=\"locale_Edit_Session\" rel=\"tooltip\"> <i\n		class=\"icons icon-edit\"></i></a> <a href=\"#\"\n		class=\"locale_Show_Fullscreen\" rel=\"tooltip\"> <i\n		class=\"icons icon-resize-full\"></i></a>\n</div>\n\n<h4>\n	<i class=\"icon-calendar\"></i> <span class=\"locale_Elicitation_Session\"></span>\n</h4>\n<p>\n	<strong class=\"locale_Goal\"></strong> <span>";
  foundHelper = helpers.goal;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.goal; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span> <br /> <strong\n		class=\"locale_Consultants\"></strong> <span>";
  foundHelper = helpers.consultants;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.consultants; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span> <br />\n	<strong class=\"locale_When\"></strong> <span>";
  foundHelper = helpers.dateElicited;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.dateElicited; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n</p>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['export_read_modal'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"modeal-header\">\n  <h1 ><span class = \"locale_Export\"> </span> <small id=\"export-type-description\"></small></h1>\n</div>\n<div class=\"modal-body export\">\n<textarea class=\"export-large-textarea\" id=\"export-text-area\"></textarea>  \n\n</div>\n<div class=\"modal-footer\">\n  <a href=\"#\" class=\"btn locale_Close\" data-dismiss=\"modal\"></a>\n</div>";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['hot_key_edit_modal'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "  <div class=\"modal-header\">\n    <h1 class = \"locale_Keyboard_Shortcuts\"></h1>\n  </div>\n  <div class=\"modal-body\">\n     <table class=\"table\">  \n        <thead>  \n          <tr>  \n            <th class = \"locale_Actions\"></th>  \n            <th></th>\n            <th class = \"locale_Navigation\"></th>  \n          </tr>  \n        </thead>  \n        <tbody>  \n          <tr>  \n            <td> <label class = \"locale_Datum_Status_Checked\"></label><input value =\"";
  foundHelper = helpers.user;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.user; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"></input></td>  \n            <td></td>  \n            <td> <label class = \"locale_Next_Datum\"></label><input value =\"";
  foundHelper = helpers.user;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.user; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"></input></td>  \n            <td></td>  \n          </tr>  \n          <tr>  \n            <td><label class = \"locale_New_Datum\"></label><input value =\"";
  foundHelper = helpers.user;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.user; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"></input></td>  \n            <td></td>  \n            <td><label class = \"locale_Previous_Datum\"></label><input value =\"";
  foundHelper = helpers.user;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.user; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"></input></td>  \n            <td></td>  \n          </tr>  \n          <tr>  \n            <td><label class = \"locale_New_Session\"></label><input value =\"";
  foundHelper = helpers.user;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.user; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"></input></td>  \n            <td></td>  \n            <td><label class = \"locale_Search\"></label><input value =\"";
  foundHelper = helpers.user;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.user; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"></input></td>  \n            <td></td>  \n          </tr>  \n        </tbody>  \n      </table>  \n  </div>\n  \n  <div class=\"modal-footer\">\n    <a href=\"#\" class=\"btn locale_Close\" data-dismiss=\"modal\"> </a>\n    <a href=\"#\" class=\"btn btn-success locale_Save\" data-dismiss=\"modal\"></a>\n  </div>\n\n\n\n\n\n\n\n\n\n\n\n           \n     \n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['import_edit_fullscreen'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"container-fluid well\">\n	<div class=\"row-fluid \">\n\n		<div class=\"\">\n			<!--Body content-->\n			<h1>\n				<span class=\"locale_Import\"></span> <small>";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n			</h1>\n\n			<h5>\n				<span class=\"locale_Import_Instructions\"></span> <a\n					href=\"http://www.facebook.com/LingSyncApp\" target=\"_blank\"><i\n					class=\"icons icon-facebook\"></i></a> <a\n					href=\"https://twitter.com/followers\" target=\"_blank\"><i\n					class=\"icons icon-twitter\"></i></a>\n			</h5>\n			<div>";
  foundHelper = helpers.status;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.status; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\n\n		</div>\n	</div>\n	<div class=\"row-fluid \"></div>\n\n	<div class=\"well\" id=\"import-first-step\">\n		<span class=\"locale_Import_First_Step\"></span>\n		<textarea\n			class=\"export-large-textarea  drop-zone locale_Drag_and_Drop_Placeholder\">";
  foundHelper = helpers.rawText;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.rawText; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</textarea>\n\n		<div class=\"btn-group pull-right\">\n			<button class=\"btn btn-info dropdown-toggle\" data-toggle=\"dropdown\">\n				<span>Import from</span> <span class=\"caret\"></span>\n			</button>\n			<ul class=\"dropdown-menu\">\n				<li><a class=\"import-format\" id=\"format-csv\" tabindex=\"-1\"\n					href=\"#\">CSV</a></li>\n				<li><a class=\"import-format\" id=\"format-tabbed\" tabindex=\"-1\"\n					href=\"#\">Tabbed</a></li>\n				<li><a class=\"import-format\" id=\"format-xml\" tabindex=\"-1\"\n					href=\"#\">XML</a></li>\n				<li><a class=\"import-format\" id=\"format-elanxml\" tabindex=\"-1\"\n					href=\"#\">ElanXML</a></li>\n				<li><a class=\"import-format\" id=\"format-toolbox\" tabindex=\"-1\"\n					href=\"#\">Toolbox</a></li>\n				<li><a class=\"import-format\" id=\"format-praat\" tabindex=\"-1\"\n					href=\"#\">Praat Text Grid</a></li>\n				<li><a class=\"import-format\" id=\"format-latex\" tabindex=\"-1\"\n					href=\"#\">LaTex</a></li>\n				<li><a class=\"import-format\" id=\"format-handout\" tabindex=\"-1\"\n					href=\"#\">Handout</a></li>\n			</ul>\n		</div>\n		<span class=\"pull-right\">Did the app guess the wrong format?</span>\n	</div>\n\n	<div class=\"well hidden \" id=\"import-second-step\">\n		<span class=\"locale_Import_Second_Step\"></span>\n\n		<button\n			class=\"btn btn-info add-column pull-right hide locale_Add_Extra_Columns\"></button>\n\n		<div class=\" container span11\">\n\n			<div id=\"import-datum-field-labels\" class=\"row-fluid\"></div>\n		</div>\n\n		<div class=\"scrollable\">\n			<table id=\"csv-table-area\"\n				class=\" table table-striped table-bordered table-condensed \"></table>\n		</div>\n\n		<button\n			class=\"btn btn-success approve-import hide locale_Attempt_Import\"></button>\n\n	</div>\n\n	<div class=\"well hidden container-fluid \" id=\"import-third-step\">\n		<span class=\"locale_Import_Third_Step\"></span>\n\n		<div id=\"import-data-list\" class=\" row-fluid\">\n\n			<div id=\"import-data-list-header\" class=\" \"></div>\n			<div class=\" container span11 \">\n				<ul class=\"unstyled zebra import-data-list-paginated-view\"></ul>\n				<div class=\"pagination-control row span11\"></div>\n			</div>\n\n		</div>\n\n\n		<div id=\"import-session\" class=\"well\"></div>\n\n		<button\n			class=\"btn btn-success approve-save disabled locale_Save_And_Import\"></button>\n\n		<progress class=\"import-progress\" max=\"5\" value=\"0\">\n			<strong class=\"locale_percent_completed\"></strong>\n		</progress>\n\n	</div>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['insert_unicode'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<span class=\"dropdown \" id=\"menu";
  foundHelper = helpers.symbol;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.symbol; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"> \n  <a class=\"btn-mini btn show-unicode-details dropdown-toggle btn-info\" data-toggle=\"dropdown\" href=\"#menu";
  foundHelper = helpers.symbol;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.symbol; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"> \n    <b class=\"unicode-symbol infrequent-unicode-symbol\" draggable=\"true\">";
  foundHelper = helpers.symbol;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.symbol; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</b>\n  </a>\n	<ul class=\"dropdown-menu\">\n		<li class = \"locale_LaTeX_Code\"></li>\n		<li><input class=\"edit-tipa-input input-small\" value=\"";
  foundHelper = helpers.tipa;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.tipa; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"></li>\n		<li class = \"locale_Unicode_Instructions\"></li>\n		<li><a data-toggle=\"modal\" href=\"#hotkey-settings-modal\">\n		  <i class=\"icon-hdd\"></i>\n		  <span class = \"locale_Keyboard_Shortcuts\"></span> </a></li>\n		<li class=\"remove-unicode\"><a>\n		  <i class=\"icon-remove-sign\"></i>\n		  <span class = \"locale_Remove_Unicode\"></span></a></li>\n	</ul>\n</span>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['insert_unicodes'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"pull-right\">\n  <a href=\"#\" class =\"locale_Hide_Unicode_Palette\" rel=\"tooltip\" >\n    <i class=\"icons icon-minus-sign\"></i></a>\n</div>\n<h3><span class = \"locale_Unicode\"></span>\n<span class = \"locale_Drag_and_Drop\">\n  </span>\n</h3>\n<div id=\"unicodes\" class=\"unicode-buttons row-fluid\"></div>\n<br />\n<span class=\"like-form-inline\">\n  <input class=\"insert-unicode-input input-small locale_Paste_Type_Unicode_Symbol_Placeholder\"  type=\"text\"/>\n  <input class=\"insert-unicode-tipa-input input-small locale_TIPA_shortcut\" type=\"text\"/>\n  <a href=\"#\" class = \"locale_Add_new_symbol btn btn-primary add-unicode locale_Add\" rel=\"tooltip\">\n    </a>\n</span>";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['insert_unicodes_minimized'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"pull-right\">\n  <a href=\"#\" class=\"locale_Show_Unicode_Palette\" rel=\"tooltip\" >\n    <i class=\"icons icon-plus-sign\"></i></a>\n</div>\n<h3><span class = \"locale_Unicode\"></span>\n<span class = \"locale_Drag_and_Drop\"> </span>\n</h3>";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['permissions_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n		<li class=\"breadcrumb  ";
  foundHelper = helpers.status;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.status; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">  <img class=\"gravatar-small\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"/>\n		";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " </li> ";
  return buffer;}

  buffer += "\n<div class=\"span5\">\n	<h4>\n		<i class=\"icon-group\"></i> ";
  foundHelper = helpers.role;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.role; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "s\n	</h4>\n	<ul>\n		";
  stack1 = depth0.users;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</ul>\n</div>\n\n<div class=\"span6\">\n	<label class=\"locale_Modify_Username_TODO \">Username:</label> <input type=\"text\"\n		class=\"  choose-add-permission-username\" data-provide=\"typeahead\"\n		data-items=\"4\" data-source='";
  foundHelper = helpers.typeaheadusers;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.typeaheadusers; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "'>\n	<button class=\"btn btn-primary  add-user-to-permission-role\"\n		value=\"Add\">Add</button>\n	<!-- <button class=\"btn btn-primary  delete-user-permission-role\"\n		value=\"Add\">Delete</button> -->\n</div>\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['permissions_read_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n	<li><img class=\"gravatar-small\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" /><br />\n		";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</li> ";
  return buffer;}

  buffer += "<h4>\n	<i class=\"icon-group\"></i> ";
  foundHelper = helpers.role;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.role; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "s\n</h4>\n<ul>\n	";
  stack1 = depth0.users;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</ul>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['search_advanced_edit_embedded'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"title\">\n	<h1 class = \"locale_Advanced_Search\"></h1>\n</div>\n<div class=\"alert alert-info alert-block\">\n	<a class=\"close\" data-dismiss=\"alert\" href=\"#\">×</a> \n	<strong class=\"alert-heading \">How Search Works:</strong> \n	<span class=\"locale_advanced_search_explanation\"></span>\n</div>\n\n<button class=\"btn btn-primary btn-search-union\">\n  <span class =\"locale_OR\"></span> \n  <img src = \"images/or_venn_diagram.png\">\n</button>\n<button class=\"btn btn-primary btn-search-intersection\">\n  <span class =\"locale_AND\"></span>\n  <img src = \"images/and_venn_diagram.png\">\n</button>\n\n<ul class=\"advanced_search_datum unstyled\"></ul>\n<ul class=\"advanced_search_session unstyled\"></ul>\n<button class=\"btn btn-primary btn-search-union\">\n  <span class =\"locale_OR\"></span> \n  <img src = \"images/or_venn_diagram.png\">\n</button>\n<button class=\"btn btn-primary btn-search-intersection\">\n  <span class =\"locale_AND\"></span>\n  <img src = \"images/and_venn_diagram.png\">\n</button>\n\n";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['search_top'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;\n<a href=\"#\" class=\"locale_Search_Tooltip\" rel=\"tooltip\"> <i\n	class=\"icons trigger-quick-search icon-search icon-white\"></i>\n</a> -->\n&nbsp;\n<input type=\"text\" id=\"search_box\" class=\"search-query input-small\"\n	placeholder=\"Search\" value=\"";
  foundHelper = helpers.searchKeywords;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.searchKeywords; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></input>\n\n<span> <a tabindex=\"-1\" href=\"#corpus/";
  foundHelper = helpers.pouchname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.pouchname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "/search\"\n	id=\"advanced_search_drop_down_trigger\"\n	class=\"trigger-advanced-search locale_Advanced_Search_Tooltip\"\n	rel=\"tooltip\"> <i class=\" icon-search icon-white\"></i>\n</a></span>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['user_app'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<!-- Black Navigation Bar Across the Top -->\n<div class=\"navbar navbar-inverse navbar-fixed-top\">\n  <div class=\"navbar-inner\">\n    <div class=\"container \">\n\n\n\n      <!-- Home button -->\n      <a tabindex=\"-1\" href=\"#\" class=\" brand locale_Show_Dashboard\"\n        rel=\"tooltip\"> <i class=\"icons icon-home icon-white\"></i></a>\n\n      <!-- Top Search Area -->\n      <span class=\"navbar-search\" id=\"search-top\"> </span>\n\n      <!-- .btn-navbar is used as the toggle for collapsed navbar content -->\n      <a class=\"btn btn-navbar\" data-toggle=\"collapse\"\n        data-target=\".nav-collapse\"> <span class=\"icon-bar\"></span> <span\n        class=\"icon-bar\"></span> <span class=\"icon-bar\"></span>\n      </a>\n\n\n      <!-- Collapsing area if the screen is not wide enough -->\n      <div class=\"nav-collapse collapse\">\n        <ul class=\"nav\" role=\"navigation \">\n\n\n\n          <!--  Customize dropdown -->\n          <li class=\"dropdown\"><a id=\"customize_dropdown_trigger\"\n            href=\"#\" role=\"button\" class=\"dropdown-toggle\"\n            data-toggle=\"dropdown\"><i class=\"icon-info-sign icon-white\"></i>\n              Information <b class=\"caret\"></b></a>\n            <ul class=\"dropdown-menu\" role=\"menu\"\n              aria-labelledby=\"customize_dropdown_trigger\">\n\n\n              \n              <li class=\"power-users-link\"><a tabindex=\"-1\"\n                data-toggle=\"modal\" href=\"#terminal-modal\"><i\n                  class=\" icon-magic\"></i> <span\n                  class=\"locale_Terminal_Power_Users\"></span> </a></li>\n              <li><a tabindex=\"-1\" href=\"http://fieldlinguist.com\"\n                target=\"_blank\"><i class=\"icons icon-film\"></i> Help Videos and\n                  User Guide</a></li>\n              <li><a tabindex=\"-1\"\n                href=\"https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ\"\n                target=\"_blank\"><i class=\"icons icon-beaker\"></i> Bug\n                  Report/Contact Us</a></li>\n              <li><a tabindex=\"-1\"\n                href=\"https://github.com/OpenSourceFieldlinguistics/FieldDB/issues/milestones?state=closed\"\n                target=\"_blank\"><i class=\"icons icon-github\"></i> OpenSource v<span\n                  class=\"fielddb-version\"></span></a></li>\n\n              <!-- <li class=\"divider\"></li>\n              <li><a tabindex=\"-1\" href=\"#\"><i class=\"icon-trash\"></i>\n                  Clear all customization</a></li> -->\n\n\n            </ul></li>\n\n\n          <!-- Notification -->\n          <li class=\"dropdown hide\"><a id=\"notification_dropdown_trigger\"\n            href=\"#\" role=\"button\" class=\"dropdown-toggle\"\n            data-toggle=\"dropdown\"><i\n              class=\"icon-exclamation-sign icon-white\"></i> Notifications <b\n              class=\"caret\"></b></a>\n            <ul class=\"dropdown-menu\" role=\"menu\"\n              aria-labelledby=\"notification_dropdown_trigger\">\n\n\n\n\n              <!-- <li><span class=\"locale_Need_save\"></span><a tabindex=\"-1\"\n                href=\"#\" class=\"locale_Save_on_this_Computer \" rel=\"tooltip\">\n                  <i class=\"icons icon-save save-dashboard icon-white\"></i>\n              </a></li>\n              <li><progress class=\"unsaved-changes\" max=\"100\" value=\"30\">\n                </progress></li> -->\n\n              <li class=\"not-a locale_Recent_Changes\"></li>\n\n\n              <li class=\"divider\"></li>\n\n              <!-- <li><span class=\"locale_Need_sync\"></span><a tabindex=\"-1\"\n                href=\"#\" class=\"locale_Sync_and_Share \" rel=\"tooltip\"> <i\n                  class=\"icons icon-sitemap  sync-everything icon-white\"></i>\n              </a></li>\n              <li><progress class=\"unsynced-changes\" max=\"100\" value=\"80\">\n                </progress></li> -->\n\n              <li class=\"not-a locale_Differences_with_the_central_server\"></li>\n\n\n              <li class=\"divider\"></li>\n              <li><a tabindex=\"-1\" href=\"#\"><i class=\"icon-remove\"></i>\n                  Clear all notifications</a></li>\n\n              <li><div id=\"toast-user-area\" class=\"scrollable\">\n                  <div class=\"alert alert-info alert-block\">\n                    <a class=\"close\" data-dismiss=\"alert\" href=\"#\">×</a> <strong\n                      class=\"alert-heading \">Quick Start Instructions:</strong> <span\n                      class=\"locale_Instructions_to_show_on_dashboard\"></span> <span\n                      class=\"locale_to_beta_testers\"></span>\n                  </div>\n                </div></li>\n\n            </ul></li>\n\n\n        </ul>\n        <ul class=\"nav pull-right\">\n\n          <!--  User dropdown -->\n          <li id=\"auth-menu\" class=\"dropdown\"><a href=\"#\"\n            id=\"user_drop_down_trigger\" role=\"button\"\n            class=\" dropdown-toggle locale_View_Public_Profile_Tooltip pull-left\"\n            data-toggle=\"dropdown\" rel=\"tooltip\"> <span\n              id=\"user-quickview\"> <i class=\"icons icon-user icon-white\"></i>\n            </span> <b class=\"caret\"></b>\n          </a>\n            <ul class=\"dropdown-menu\" id=\"authentication-embedded\" role=\"menu\"\n              aria-labelledby=\"user_drop_down_trigger\"></ul></li>\n\n\n        </ul>\n\n      </div>\n\n    </div>\n  </div>\n</div>\n\n\n\n\n<!-- The rest of the page -->\n<div class=\"container-fluid main\">\n\n  <!-- FullScreen Views -->\n  <div id=\"user-fullscreen\" class=\"well \"></div>\n</div>\n\n<!-- Modals are windows which pop over the active app to take focus -->\n<div id=\"hotkey-settings-modal\" class=\"modal hide\"></div>\n<div id=\"user-modal\" class=\"modal hide\"></div>\n<div id=\"user-preferences-modal\" class=\"modal hide\"></div>\n<div id=\"quick-authenticate-modal\"  class=\"modal hide\">\n  <div class=\"modal-header\">\n    <h4 class = \"locale_We_need_to_make_sure_its_you\"></h4>\n  </div>\n  <div class=\"modal-body\">\n  <label class = \"locale_Password\"></label>\n      <input type=\"password\" id=\"quick-authenticate-password\"/>\n  </div>\n  <div class=\"modal-footer\">\n    <button class=\"btn btn-success locale_Yep_its_me\" id=\"quick-authentication-okay-btn\"></button>\n  </div>\n</div>\n";});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['user_edit_fullscreen'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<a href=\"#\" class=\"locale_Show_Readonly\" rel=\"tooltip\"> \n   <i class=\"icons icon-book pull-right\"> </i>\n  </a>\n<button class=\"btn btn-success pull-right save-user-profile locale_Save\"\n    value=\"Save\"></button>\n\n<h1>\n	<span class=\"locale_User_Profile\"> </span> <small>";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " 	(";
  foundHelper = helpers.firstname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.firstname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " ";
  foundHelper = helpers.lastname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.lastname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + ") </small>\n</h1>\n<a href = \"http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\"><i class=\" icon-link\"></i></a>\n<small>Shareable URL: http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n<p class = \"locale_Public_Profile_Instructions\"></p>\n<hr/>\n<dl>\n    <dt class=\"locale_Gravatar\"></dt>\n    <dd>\n      <img class=\"gravatar-image gravatar-large\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n    </dd>\n    <dt class=\"locale_Gravatar_URL\"></dt>\n    <dd>\n      <input class=\"gravatar\" type=\"email\" value=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n    </dd>\n    <dt class=\"locale_Firstname\"></dt>\n    <dd>\n      <input class=\"firstname\" value=\"";
  foundHelper = helpers.firstname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.firstname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n    </dd>\n    <dt class=\"locale_Lastname\"></dt>\n    <dd>\n      <input class=\"lastname\" value=\"";
  foundHelper = helpers.lastname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.lastname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n    </dd>\n    <dt class=\"locale_Email\"></dt>\n    <dd>\n      <input class=\"email\" type=\"email\" value=\"";
  foundHelper = helpers.email;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.email; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n    </dd>\n    <dt class=\"locale_Research_Interests\"></dt>\n    <dd>\n      <textarea class=\"researchInterest\">";
  foundHelper = helpers.researchInterest;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.researchInterest; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " \n      </textarea>\n    </dd>\n    <dt class=\"locale_Affiliation\"></dt>\n    <dd>\n      <textarea class=\"affiliation\">";
  foundHelper = helpers.affiliation;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.affiliation; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " \n      </textarea>\n    </dd>\n    <dt class=\"locale_Description\"></dt>\n    <dd>\n      <textarea class=\"description\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " \n      </textarea>\n    </dd>\n    <dt><i class=\"icon-cloud\"></i> <span class=\"locale_Corpora\"></span></dt>\n    <dd>\n      <ul class=\"corpuses\">\n      </ul>\n    </dd>\n  </dl>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['user_edit_modal'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"modal-header\">\n	<a href=\"#\" class=\"locale_Show_Readonly\" rel=\"tooltip\"> \n	 <i class=\"icons icon-book pull-right\"> </i>\n	</a>\n  <h1>\n		<span class=\"locale_User_Profile\"> </span> <small>";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " (";
  foundHelper = helpers.firstname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.firstname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " ";
  foundHelper = helpers.lastname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.lastname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + ") </small>\n	</h1>\n	<p class = \"locale_Private_Profile_Instructions\"></p>\n	<button class=\"btn btn-primary edit-public-user-profile locale_Edit_Public_User_Profile \"></button>\n  \n</div>\n<div class=\"modal-body\">\n\n	<dl>\n		<dt class=\"locale_Gravatar\"></dt>\n		<dd>\n			<img class=\"gravatar-image gravatar-large\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n		</dd>\n		<dt class=\"locale_Gravatar_URL\"></dt>\n		<dd>\n			<input class=\"gravatar\" type=\"email\" value=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n		</dd>\n		<dt class=\"locale_Firstname\"></dt>\n		<dd>\n			<input class=\"firstname\" value=\"";
  foundHelper = helpers.firstname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.firstname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n		</dd>\n		<dt class=\"locale_Lastname\"></dt>\n		<dd>\n			<input class=\"lastname\" value=\"";
  foundHelper = helpers.lastname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.lastname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n		</dd>\n		<dt class=\"locale_Email\"></dt>\n		<dd>\n			<input class=\"email\" type=\"email\" value=\"";
  foundHelper = helpers.email;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.email; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n		</dd>\n		<dt class=\"locale_Research_Interests\"></dt>\n		<dd>\n			<textarea class=\"researchInterest\">";
  foundHelper = helpers.researchInterest;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.researchInterest; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " \n      </textarea>\n		</dd>\n		<dt class=\"locale_Affiliation\"></dt>\n		<dd>\n			<textarea class=\"affiliation\">";
  foundHelper = helpers.affiliation;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.affiliation; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " \n      </textarea>\n		</dd>\n		<dt class=\"locale_Description\"></dt>\n		<dd>\n			<textarea class=\"description\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " \n      </textarea>\n		</dd>\n    <dt><i class=\"icon-cloud\"></i> <span class=\"locale_Corpora\"></span></dt>\n		<dd>\n			<ul class=\"corpuses\">\n			</ul>\n		</dd>\n	</dl>\n</div>\n<div class=\"modal-footer\">\n	<a href=\"#\" class=\"btn locale_Close\" data-dismiss=\"modal\"> </a>\n	<button class=\"btn btn-success pull-right save-user-profile locale_Save\"\n		value=\"Save\"></button>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['user_preference_edit_modal'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"modal-header\">\n	<h1 class = \"locale_User_Settings\"></h1>\n</div>\n<div class=\"modal-body\">\n  <p class=\"locale_user_settings_instructions\">This is where you can\n		adjust settings that are mostly for you as a user, that aren't really\n		tied to a corpus. Your settings are backed up when you authenticate\n		with the server (this usually happens when the \"I need to make sure its you\" box pops up) so that you can get your preferences if you log in on\n		another device.</p>\n\n  <div class=\"border-bottom\">\n		<h5 class = \"locale_Skin\"> </h5>\n		<p class=\"locale_skin_instructions\">You can use a combinations of background colors or pictures,\n			and transparency to create the entire range between high contrast, to low contrast, low eyestrain screens\n			to make it easier on your eyes to enter data for long periods of\n			time. You can also keep the background picture on random if you feel\n			it might help you stop procrastinating and enter your data.</p>\n		<span class=\"user-pref-skin-filename\">";
  foundHelper = helpers.skin;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.skin; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span>\n		<div class=\"control-group\">\n			<button class=\"preference btn change-skin locale_Change_Background\"></button>\n			<button class=\"preference btn randomize-backgound locale_Background_on_Random\">	</button>\n			<button class=\"preference btn transparent-dashboard locale_Transparent_Dashboard\">		</button>\n		</div>\n	</div>\n	<div class=\"border-bottom\">\n		<h5 class =\"locale_Number_Datum\"></h5>\n		<p class=\"locale_number_datum_instructions\">You can change the number\n			of datum in the data entry area of your dashboard, if you like to\n			enter data surrounded by context (ie see the datum that you just\n			entered as you would in Word or Excel), you can set it to a high\n			number (5). This can be confusing because the datum are inserted at\n			the top, not at the bottom of the data entry area (if this annoys\n			you, let us know using the bug form, it probably woudlnt take long to make it into an option.)\n			</p>\n			<p> You can\n			also have the app show only one datum, and even make that datum full\n			screen using the arrows in its widget (if you like to enter data like\n			you would in FileMaker Pro). A pretty good middle ground is 2 datum visible. With two datum \n			you can see when you are creating minimal pairs, or creating new datum  \n			to be checked with a language consultant, based on an existing datum.</p>\n  <label class =\"locale_Number_Datum\" ></label>\n		<select class=\"num_datum_dropdown\">\n			<option value=\"1\">1</option>\n			<option value=\"2\">2</option>\n			<option value=\"3\" selected>3</option>\n			<option value=\"4\">4</option>\n			<option value=\"5\">5</option>\n		</select>\n	</div>\n	<div class=\"border-bottom\">\n    <h5 class =\"locale_Font_Size\">Font Size</h5>\n		<p class=\"locale_font_size_instructions\">It is very easy to adjust\n			the font size in LingSync, you can use the standard browser features\n			(this is one reason we wanted to make the app in a browser).</p>\n		<h5>Larger Font</h5>\n		<ul>\n			<li>Mac: ⌘+ (Command - Shift - +) </li>\n			<li>Linux/Windows: Control - Shift - + </li>\n			<li>Android: On most Androids you can double tap the screen to zoom in and out, let us know if you figure it out.</li>\n			<li>iPad/iPhone: let us know if you figure it out</li>\n		</ul>\n		<h5>Smaller Font</h5>\n    <ul>\n      <li>Mac: ⌘- (Command -) </li>\n      <li>Linux/Windows: Control -  </li>\n      <li>Android: On most Androids you can double tap the screen to zoom in and out, let us know if you figure it out.</li>\n      <li>iPad/iPhone: let us know if you figure it out</li>\n    </ul>\n	</div>\n\n	<div class=\"border-bottom\">\n		<h5 class=\"locale_Full_Screen\">How to go fullscreen</h5>\n		<p class=\"locale_full_screen_instructions\">It is very easy to go\n			full screen and make LingSync look like a native desktop application,\n			(either with a toolbar) or in complete full screen presentation mode.</p>\n		<h5>Full screen</h5>\n		<ul>\n			<li>Mac: ⌘⇧F (Command - Shift - F)</li>\n			<li>Linux: let us know if you figure it out.</li>\n			<li>Windows: F11</li>\n			<li>Android: let us know if you figure it out.</li>\n			<li>iPad/iPhone: let us know if you figure it out</li>\n		</ul>\n		<h5>Full screen (can still see tabs)</h5>\n		<ul>\n			<li>Mac: ⌘^F (Command - Control - F)</li>\n			<li>Linux/Windows: (This how Chrome is normally)</li>\n			<li>Android: (This how Chrome is normally)</li>\n			<li>iPad/iPhone: (This how Chrome is normally)</li>\n		</ul>\n	</div>\n\n</div>\n<div class=\"modal-footer\">\n	<a href=\"#\" class=\"btn locale_Close\" data-dismiss=\"modal\"></a>\n</div>\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['user_read_fullscreen'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "\n<a href=\"#\" class=\"locale_Edit_Public_User_Profile pull-right\" 	rel=\"tooltip\"> <i\n	class=\"icons icon-edit edit-user-profile \"></i></a>\n<h1>\n	<span class=\"locale_User_Profile\"> </span> <small>";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " (";
  foundHelper = helpers.firstname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.firstname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " ";
  foundHelper = helpers.lastname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.lastname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + ") </small>\n</h1>\n<a href = \"http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\"><i class=\" icon-link\"></i></a>\n<small>Shareable URL: http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</small>\n<hr/>\n<dl>\n	<dt class=\"locale_Gravatar\"></dt>\n	<dd>\n		<img class=\"gravatar-image gravatar-large\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n	</dd>\n	<dt class=\"locale_Email\"></dt>\n	<dd class=\"email\">";
  foundHelper = helpers.email;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.email; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</dd>\n	<dt class=\"locale_Research_Interests\"></dt>\n	<dd class=\"researchInterest\">";
  foundHelper = helpers.researchInterest;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.researchInterest; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</dd>\n	<dt class=\"locale_Affiliation\"></dt>\n	<dd class=\"affiliation\">";
  foundHelper = helpers.affiliation;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.affiliation; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</dd>\n	<dt class=\"locale_Description\"></dt>\n	<dd class=\"description\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</dd>\n  <dt><i class=\"icon-cloud\"></i> <span class=\"locale_Corpora\"></span></dt>\n	<dd>\n		<ul class=\"corpuses\">\n		</ul>\n	</dd>\n</dl>\n\n\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['user_read_link'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<a href=\"#user/";
  foundHelper = helpers._id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class = \"locale_View_Profile_Tooltip \" rel=\"tooltip\">\n  <img class=\"gravatar-small\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" border=\"0\" >\n</a>\n";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['user_read_modal'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"modal-header\">\n	<a href=\"#\" class=\"locale_Edit_User_Profile_Tooltip pull-right\" rel=\"tooltip\" >\n	 <i class=\"icons icon-edit edit-user-profile \"></i> </a>\n <h1>\n    <span class=\"locale_User_Profile\"> </span> <small>";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " (";
  foundHelper = helpers.firstname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.firstname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + " ";
  foundHelper = helpers.lastname;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.lastname; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + ") </small>\n	</h1>\n	<p class = \"locale_Private_Profile_Instructions\"></p>\n	 <a href=\"#\" class=\"btn btn-primary view-public-profile locale_View_Public_Profile_Tooltip \" ></a>\n  \n</div>\n<div class=\"modal-body\">\n\n	<dl>\n		<dt class=\"locale_Gravatar\"></dt>\n		<dd>\n			<img class=\"gravatar-image gravatar-large\" src=\"";
  foundHelper = helpers.gravatar;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.gravatar; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\n		</dd>\n		<dt class=\"locale_Email\"></dt>\n		<dd class=\"email\">";
  foundHelper = helpers.email;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.email; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</dd>\n		<dt class=\"locale_Research_Interests\"></dt>\n		<dd class=\"researchInterest\">";
  foundHelper = helpers.researchInterest;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.researchInterest; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</dd>\n		<dt class=\"locale_Affiliation\"></dt>\n		<dd class=\"affiliation\">";
  foundHelper = helpers.affiliation;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.affiliation; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</dd>\n		<dt class=\"locale_Description\"></dt>\n		<dd class=\"description\">";
  foundHelper = helpers.description;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</dd>\n		<dt><i class=\"icon-cloud\"></i> <span class=\"locale_Corpora\"></span></dt>\n		<dd>\n			<ul class=\"corpuses\">\n			</ul>\n		</dd>\n	</dl>\n</div>\n<div class=\"modal-footer\">\n	 <a href=\"#\" class=\"btn locale_Close\" data-dismiss=\"modal\"> </a>\n</div>";
  return buffer;});
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['user_welcome_modal'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"modal-header\">\n  <div class=\"btn-group pull-right\">\n    <a href=\"#\" class=\"btn btn-success sync-lingllama-data locale_Close_and_login_as_LingLlama locale_Close_and_login_as_LingLlama_Tooltip\" rel=\"tooltip\"></a>\n    <a class=\"btn btn-success dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\"> \n      <i class=\"icon-user icon-white\"></i> \n      <span class = \"locale_Log_In\"></span>\n      <span class=\"caret\"></span> \n    </a>\n    <ul class=\"dropdown-menu\">\n      <li class=\"not-a\">\n        <span class = \"locale_Username\"></span>\n        <input class=\"welcomeusername\" size=\"16\" type=\"text\" />\n      </li>\n      <li class=\"not-a\"> \n        <span class = \"locale_Password\"></span>\n        <input class=\"welcomepassword\" size=\"16\" type=\"password\" />\n      </li>\n      <li class=\"not-a\"> \n        <span class = \"locale_authUrl\">Server:</span>\n        <input class=\"welcomeauthurl\" size=\"16\" type=\"text\" />\n      </li>\n      <li class=\"not-a\">\n        <button class=\"btn btn-success sync-my-data\">\n          <span class = \"locale_Sync_my_data_to_this_computer\"></span>\n        </button>\n      </li>\n    </ul>\n  </div>\n  <div>\n    <!-- <h1 class = \"locale_Welcome_to_FieldDB\"></h1> -->\n    <img src=\"images/icon.png\" /><br/>\n    <i class = \"locale_An_offline_online_fieldlinguistics_database\"></i> <span class=\"welcome_version_number\"></span> \n  </div>\n</div>\n\n<div class=\"modal-body\">\n  <!-- <div class = \"locale_Welcome_Beta_Testers\"></div> -->\n \n  <div class=\"breadcrumb create_new_user_password\">\n    <h3 class = \"locale_Create_a_new_user\"></h3>\n    <p>\n      http://www.lingsync.org/";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\n    </p>\n    <!-- <label class = \"locale_What_is_your_username_going_to_be\">  </label> -->\n    <span class=\"like-form-inline\">\n      <input class=\"registerusername\" value=\"";
  foundHelper = helpers.username;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.username; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" type=\"text\"/>\n      <button class=\"btn btn-primary new-user-button locale_New_User\"></button>\n    </span>\n    <div class=\"hide confirm-password\">\n      <label class = \"locale_Password\"></label>\n      <input class=\"registerpassword\" type=\"password\"/>\n      <label class = \"locale_Confirm_Password\"></label>\n      <input class=\"to-confirm-password\" type=\"password\"/>\n      <label class = \"\">Email:</label>\n      <input class=\"registeruseremail\" type=\"email\"/>\n      <br />\n      <button class=\"btn btn-success register-new-user locale_Sign_in_with_password\">\n      </button>\n      <!-- Hiding Twitter and facebook because I dont think anyone will use them now. <button class=\"btn btn-success register-twitter\">\n        <i class=\"i icon-twitter\"></i> Sign in with Twitter\n      </button>\n      <button class=\"btn btn-success register-facebook\">\n        <i class=\"i icon-facebook\"></i> Sign in with Facebook\n      </button> -->\n    </div>\n    </div>\n    <div class=\" alert alert-error hide welcome-screen-alerts\"></div>\n  <div class=\"welcome_video_iframe\">\n    <iframe class=\"welcome_video_iframe\" width=\"420\" height=\"315\" src=\"http://www.youtube.com/embed/videoseries?list=PLUrH6CNxFDrMtraL8hTLbLsQwdw1117FT\" frameborder=\"0\" allowfullscreen></iframe>\n  \n  </div>\n  <!-- <div class=\"alert alert-block\">moved here so that it can be seen on smaller screens by scrolling\n    <a class=\"close\" data-dismiss=\"alert\" href=\"#\">×</a>\n    <h4 class=\"alert-heading locale_Warning\"></h4>\n   <span class = \"locale_Instructions_to_show_on_dashboard\"></span>  \n  </div> -->\n</div>\n";
  return buffer;});
})();
define("compiledTemplates", ["handlebars"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.Handlebars;
    };
}(this)));

// Generated by CoffeeScript 1.3.3

/*
(c) 2012 Jan Monschke
v1.3
backbone-couchdb.js is licensed under the MIT license.
*/


(function() {
  
//parse models
  Backbone.Model.prototype.parse = function(response) {
    // parse internal models
    if (response.ok === undefined) {
      for ( var key in this.internalModels) {
        var embeddedClass = this.internalModels[key];
        if(!response[key]){
          continue;
        }
        var embeddedData = response[key];
        response[key] = new embeddedClass(embeddedData, {
          parse : true
        });
      }
    }

//    // adjust rev
//    if (response.rev) {
//      response._rev = response.rev;
//      delete response.rev;
//    }
//
//    // adjust id
//    if (response.id) {
//      response._id = response.id;
//      delete response.id;
//    }
//
    // remove ok
    delete response.ok;

    return response;
  };

  //parse collections if in a normal view, not a backbone-couchdb view
//  Backbone.Collection.prototype.parse = function(response) {
//    return response.rows && _.map(response.rows, function(row) { 
//      return row.doc || row.value; 
//    });
//  };
  /**
   * 
   * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
   */
//  Backbone.View.prototype.destroy_view = function() {
////    Utils.debug("DESTROYING A VIEW");
//    // COMPLETELY UNBIND THE VIEW
//    this.undelegateEvents();
//
//    $(this.el).removeData().unbind();
//
//    // Remove view from DOM
//    // this.remove();
//    // Backbone.View.prototype.remove.call(this);
//  };
  
  
  var con,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Backbone.couch_connector = con = {
    config: {
      db_name: "default",
      ddoc_name: "pages",
      view_name: "byCollection",
      list_name: null,
      global_changes: false,
      single_feed: false,
      base_url: null
    },
    _global_db_inst: null,
    _global_changes_handler: null,
    _global_changes_callbacks: [],
    helpers: {
      extract_collection_name: function(model) {
        var _name, _splitted;
        if (model == null) {
          throw new Error("No model has been passed");
        }
        if (!(((model.collection != null) && (model.collection.url != null)) || (model.url != null))) {
          return "";
        }
        if (model.url != null) {
          _name = _.isFunction(model.url) ? model.url() : model.url;
        } else {
          _name = _.isFunction(model.collection.url) ? model.collection.url() : model.collection.url;
        }
        if (_name[0] === "/") {
          _name = _name.slice(1, _name.length);
        }
        _splitted = _name.split("/");
        if (_splitted.length > 0) {
          if (model.id === _splitted[_splitted.length - 1]) {
            _splitted.pop();
          }
          _name = _splitted.join('/');
        }
        if (_name.indexOf("/") === 0) {
          _name = _name.replace("/", "");
        }
        return _name;
      },
      filter_collection: function(results, collection_name) {
        var entry, _i, _len, _ref, _results;
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          entry = results[_i];
          if ((entry.deleted === true) || (((_ref = entry.doc) != null ? _ref.collection : void 0) === collection_name)) {
            _results.push(entry);
          }
        }
        return _results;
      },
      make_db: function() {
        var db;
        db = $.couch.db(con.config.db_name);
        if (con.config.base_url != null) {
          db.uri = "" + con.config.base_url + "/" + con.config.db_name + "/";
        }
        return db;
      }
    },
    read: function(model, opts) {
      if (model.models) {
        return con.read_collection(model, opts);
      } else {
        return con.read_model(model, opts);
      }
    },
    read_collection: function(coll, opts) {
      var keys, option, view_options, _ddoc, _i, _len, _list, _opts, _view,
        _this = this;
      _view = this.config.view_name;
      _ddoc = this.config.ddoc_name;
      _list = this.config.list_name;
      keys = [this.helpers.extract_collection_name(coll)];
      if (coll.db != null) {
        if (coll.db.changes || this.config.global_changes) {
          coll.listen_to_changes();
        }
        if (coll.db.view != null) {
          _view = coll.db.view;
        }
        if (coll.db.ddoc != null) {
          _ddoc = coll.db.ddoc;
        }
        if (coll.db.keys != null) {
          keys = coll.db.keys;
        }
        if (coll.db.list != null) {
          _list = coll.db.list;
        }
      }
      _opts = {
        keys: keys,
        success: function(data) {
          var doc, _i, _len, _ref, _temp;
          _temp = [];
          _ref = data.rows;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            doc = _ref[_i];
            if (doc.value) {
              _temp.push(doc.value);
            } else {
              _temp.push(doc.doc);
            }
          }
          opts.success(_temp);
          return opts.complete();
        },
        error: function(status, error, reason) {
          var res;
          res = {
            status: status,
            error: error,
            reason: reason
          };
          opts.error(res);
          return opts.complete(res);
        }
      };
      view_options = ["key", "keys", "startkey", "startkey_docid", "endkey", "endkey_docid", "limit", "stale", "descending", "skip", "group", "group_level", "reduce", "include_docs", "inclusive_end", "update_seq"];
      for (_i = 0, _len = view_options.length; _i < _len; _i++) {
        option = view_options[_i];
        if (opts[option] != null) {
          _opts[option] = opts[option];
        }
      }
      if ((coll.db != null) && (coll.db.view != null) && !(coll.db.keys != null)) {
        delete _opts.keys;
      }
      if (_list) {
        return this.helpers.make_db().list("" + _ddoc + "/" + _list, "" + _view, _opts);
      } else {
        return this.helpers.make_db().view("" + _ddoc + "/" + _view, _opts);
      }
    },
    init_global_changes_handler: function(callback) {
      var _this = this;
      this._global_db_inst = con.helpers.make_db();
      return this._global_db_inst.info({
        "success": function(data) {
          var opts;
          opts = _.extend({
            include_docs: true
          }, con.config.global_changes_opts);
          _this._global_changes_handler = _this._global_db_inst.changes(data.update_seq || 0, opts);
          _this._global_changes_handler.onChange(function(changes) {
            var cb, _i, _len, _ref, _results;
            _ref = _this._global_changes_callbacks;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              cb = _ref[_i];
              _results.push(cb(changes));
            }
            return _results;
          });
          return callback();
        }
      });
    },
    register_global_changes_callback: function(callback) {
      var _this = this;
      if (callback == null) {
        return;
      }
      if (!(this._global_db_inst != null)) {
        return this.init_global_changes_handler(function() {
          return _this._global_changes_callbacks.push(callback);
        });
      } else {
        return this._global_changes_callbacks.push(callback);
      }
    },
    read_model: function(model, opts) {
      if (!model.id) {
        throw new Error("The model has no id property, so it can't get fetched from the database");
      }
      return this.helpers.make_db().openDoc(model.id, {
        success: function(doc) {
          opts.success(doc);
          return opts.complete();
        },
        error: function(status, error, reason) {
          var res;
          res = {
            status: status,
            error: error,
            reason: reason
          };
          opts.error(res);
          return opts.complete(res);
        }
      });
    },
    create: function(model, opts) {
      var coll, vals;
      vals = model.toJSON();
      coll = this.helpers.extract_collection_name(model);
      if (coll.length > 0) {
        vals.collection = coll;
      }
      return this.helpers.make_db().saveDoc(vals, {
        success: function(doc) {
          opts.success({
            _id: doc.id,
            ok: doc.ok,
            _rev: doc.rev
          });
          return opts.complete();
        },
        error: function(status, error, reason) {
          var res;
          res = {
            status: status,
            error: error,
            reason: reason
          };
          opts.error(res);
          return opts.complete(res);
        }
      });
    },
    update: function(model, opts) {
      return this.create(model, opts);
    },
    del: function(model, opts) {
      return this.helpers.make_db().removeDoc(model.toJSON(), {
        success: function() {
          return opts.success();
        },
        error: function(nr, req, error) {
          var res;
          if (error === "deleted") {
            opts.success();
            return opts.complete();
          } else {
            res = {
              error: error
            };
            opts.error(res);
            return opts.complete(res);
          }
        }
      });
    }
  };

  Backbone.sync = function(method, model, opts) {
    var _ref, _ref1, _ref2;
    if ((_ref = opts.success) == null) {
      opts.success = function() {};
    }
    if ((_ref1 = opts.error) == null) {
      opts.error = function() {};
    }
    if ((_ref2 = opts.complete) == null) {
      opts.complete = function() {};
    }
    switch (method) {
      case "read":
        return con.read(model, opts);
      case "create":
        return con.create(model, opts);
      case "update":
        return con.update(model, opts);
      case "delete":
        return con.del(model, opts);
    }
  };

  Backbone.Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.idAttribute = "_id";

    Model.prototype.clone = function() {
      var new_model;
      new_model = new this.constructor(this);
      if (new_model.attributes._id) {
        delete new_model.attributes._id;
      }
      if (new_model.attributes._rev) {
        delete new_model.attributes._rev;
      }
      return new_model;
    };

    return Model;

  })(Backbone.Model);

  Backbone.Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection() {
      this._db_on_change = __bind(this._db_on_change, this);

      this._db_prepared_for_global_changes = __bind(this._db_prepared_for_global_changes, this);

      this._db_prepared_for_changes = __bind(this._db_prepared_for_changes, this);
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.model = Backbone.Model;

    Collection.prototype.initialize = function() {
      if (!this._db_changes_enabled && ((this.db && this.db.changes) || con.config.global_changes)) {
        return this.listen_to_changes();
      }
    };

    Collection.prototype.listen_to_changes = function() {
      if (!this._db_changes_enabled) {
        this._db_changes_enabled = true;
        if (con.config.single_feed) {
          return this._db_prepared_for_global_changes();
        } else {
          if (!this._db_inst) {
            this._db_inst = con.helpers.make_db();
          }
          return this._db_inst.info({
            "success": this._db_prepared_for_changes
          });
        }
      }
    };

    Collection.prototype.stop_changes = function() {
      this._db_changes_enabled = false;
      if (this._db_changes_handler != null) {
        this._db_changes_handler.stop();
        return this._db_changes_handler = null;
      }
    };

    Collection.prototype._db_prepared_for_changes = function(data) {
      var opts,
        _this = this;
      this._db_update_seq = data.update_seq || 0;
      opts = {
        include_docs: true,
        collection: con.helpers.extract_collection_name(this),
        filter: "" + con.config.ddoc_name + "/by_collection"
      };
      _.extend(opts, this.db);
      return _.defer(function() {
        _this._db_changes_handler = _this._db_inst.changes(_this._db_update_seq, opts);
        return _this._db_changes_handler.onChange(_this._db_on_change);
      });
    };

    Collection.prototype._db_prepared_for_global_changes = function() {
      return con.register_global_changes_callback(this._db_on_change);
    };

    Collection.prototype._db_on_change = function(changes) {
      var obj, results, _doc, _i, _len, _results;
      results = changes.results;
      if (this.db && this.db.local_filter) {
        results = this.db.local_filter(results);
      } else if (con.config.single_feed) {
        results = con.helpers.filter_collection(results, con.helpers.extract_collection_name(this));
      }
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        _doc = results[_i];
        obj = this.get(_doc.id);
        if (obj != null) {
          if (_doc.deleted) {
            _results.push(this.remove(obj));
          } else {
            if (obj.get("_rev") !== _doc.doc._rev) {
              _results.push(obj.set(_doc.doc));
            } else {
              _results.push(void 0);
            }
          }
        } else {
          if (!_doc.deleted) {
            _results.push(this.add(_doc.doc));
          } else {
            _results.push(void 0);
          }
        }
      }
      return _results;
    };

    return Collection;

  })(Backbone.Collection);

}).call(this);
define("backbone", ["backbonejs","jquery-couch","compiledTemplates"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.Backbone;
    };
}(this)));

/*
CryptoJS v3.0.1
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(q,i){var f={},l=f.lib={},r=l.Base=function(){function a(){}return{extend:function(d){a.prototype=this;var b=new a;d&&b.mixIn(d);b.$super=this;return b},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var b in a)a.hasOwnProperty(b)&&(this[b]=a[b]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.$super.extend(this)}}}(),n=l.WordArray=r.extend({init:function(a,d){a=
this.words=a||[];this.sigBytes=d!=i?d:4*a.length},toString:function(a){return(a||s).stringify(this)},concat:function(a){var d=this.words,b=a.words,c=this.sigBytes,a=a.sigBytes;this.clamp();if(c%4)for(var g=0;g<a;g++)d[c+g>>>2]|=(b[g>>>2]>>>24-8*(g%4)&255)<<24-8*((c+g)%4);else if(65535<b.length)for(g=0;g<a;g+=4)d[c+g>>>2]=b[g>>>2];else d.push.apply(d,b);this.sigBytes+=a;return this},clamp:function(){var a=this.words,d=this.sigBytes;a[d>>>2]&=4294967295<<32-8*(d%4);a.length=q.ceil(d/4)},clone:function(){var a=
r.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var d=[],b=0;b<a;b+=4)d.push(4294967296*q.random()|0);return n.create(d,a)}}),m=f.enc={},s=m.Hex={stringify:function(a){for(var d=a.words,a=a.sigBytes,b=[],c=0;c<a;c++){var g=d[c>>>2]>>>24-8*(c%4)&255;b.push((g>>>4).toString(16));b.push((g&15).toString(16))}return b.join("")},parse:function(a){for(var d=a.length,b=[],c=0;c<d;c+=2)b[c>>>3]|=parseInt(a.substr(c,2),16)<<24-4*(c%8);return n.create(b,d/2)}},o=m.Latin1={stringify:function(a){for(var d=
a.words,a=a.sigBytes,b=[],c=0;c<a;c++)b.push(String.fromCharCode(d[c>>>2]>>>24-8*(c%4)&255));return b.join("")},parse:function(a){for(var d=a.length,b=[],c=0;c<d;c++)b[c>>>2]|=(a.charCodeAt(c)&255)<<24-8*(c%4);return n.create(b,d)}},p=m.Utf8={stringify:function(a){try{return decodeURIComponent(escape(o.stringify(a)))}catch(d){throw Error("Malformed UTF-8 data");}},parse:function(a){return o.parse(unescape(encodeURIComponent(a)))}},e=l.BufferedBlockAlgorithm=r.extend({reset:function(){this._data=n.create();
this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=p.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var d=this._data,b=d.words,c=d.sigBytes,g=this.blockSize,k=c/(4*g),k=a?q.ceil(k):q.max((k|0)-this._minBufferSize,0),a=k*g,c=q.min(4*a,c);if(a){for(var j=0;j<a;j+=g)this._doProcessBlock(b,j);j=b.splice(0,a);d.sigBytes-=c}return n.create(j,c)},clone:function(){var a=r.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});l.Hasher=e.extend({init:function(){this.reset()},
reset:function(){e.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this._hash},clone:function(){var a=e.clone.call(this);a._hash=this._hash.clone();return a},blockSize:16,_createHelper:function(a){return function(d,b){return a.create(b).finalize(d)}},_createHmacHelper:function(a){return function(d,b){return h.HMAC.create(a,b).finalize(d)}}});var h=f.algo={};return f}(Math);
(function(){var q=CryptoJS,i=q.lib.WordArray;q.enc.Base64={stringify:function(f){var l=f.words,i=f.sigBytes,n=this._map;f.clamp();for(var f=[],m=0;m<i;m+=3)for(var s=(l[m>>>2]>>>24-8*(m%4)&255)<<16|(l[m+1>>>2]>>>24-8*((m+1)%4)&255)<<8|l[m+2>>>2]>>>24-8*((m+2)%4)&255,o=0;4>o&&m+0.75*o<i;o++)f.push(n.charAt(s>>>6*(3-o)&63));if(l=n.charAt(64))for(;f.length%4;)f.push(l);return f.join("")},parse:function(f){var l=f.length,r=this._map,n=r.charAt(64);n&&(n=f.indexOf(n),-1!=n&&(l=n));for(var n=[],m=0,s=0;s<
l;s++)if(s%4){var o=r.indexOf(f.charAt(s-1))<<2*(s%4),p=r.indexOf(f.charAt(s))>>>6-2*(s%4);n[m>>>2]|=(o|p)<<24-8*(m%4);m++}return i.create(n,m)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
(function(q){function i(e,h,a,d,b,c,g){e=e+(h&a|~h&d)+b+g;return(e<<c|e>>>32-c)+h}function f(e,h,a,d,b,c,g){e=e+(h&d|a&~d)+b+g;return(e<<c|e>>>32-c)+h}function l(e,h,a,d,b,c,g){e=e+(h^a^d)+b+g;return(e<<c|e>>>32-c)+h}function r(e,h,a,d,b,c,g){e=e+(a^(h|~d))+b+g;return(e<<c|e>>>32-c)+h}var n=CryptoJS,m=n.lib,s=m.WordArray,m=m.Hasher,o=n.algo,p=[];(function(){for(var e=0;64>e;e++)p[e]=4294967296*q.abs(q.sin(e+1))|0})();o=o.MD5=m.extend({_doReset:function(){this._hash=s.create([1732584193,4023233417,
2562383102,271733878])},_doProcessBlock:function(e,h){for(var a=0;16>a;a++){var d=h+a,b=e[d];e[d]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360}for(var d=this._hash.words,b=d[0],c=d[1],g=d[2],k=d[3],a=0;64>a;a+=4)16>a?(b=i(b,c,g,k,e[h+a],7,p[a]),k=i(k,b,c,g,e[h+a+1],12,p[a+1]),g=i(g,k,b,c,e[h+a+2],17,p[a+2]),c=i(c,g,k,b,e[h+a+3],22,p[a+3])):32>a?(b=f(b,c,g,k,e[h+(a+1)%16],5,p[a]),k=f(k,b,c,g,e[h+(a+6)%16],9,p[a+1]),g=f(g,k,b,c,e[h+(a+11)%16],14,p[a+2]),c=f(c,g,k,b,e[h+a%16],20,p[a+3])):48>a?(b=
l(b,c,g,k,e[h+(3*a+5)%16],4,p[a]),k=l(k,b,c,g,e[h+(3*a+8)%16],11,p[a+1]),g=l(g,k,b,c,e[h+(3*a+11)%16],16,p[a+2]),c=l(c,g,k,b,e[h+(3*a+14)%16],23,p[a+3])):(b=r(b,c,g,k,e[h+3*a%16],6,p[a]),k=r(k,b,c,g,e[h+(3*a+7)%16],10,p[a+1]),g=r(g,k,b,c,e[h+(3*a+14)%16],15,p[a+2]),c=r(c,g,k,b,e[h+(3*a+5)%16],21,p[a+3]));d[0]=d[0]+b|0;d[1]=d[1]+c|0;d[2]=d[2]+g|0;d[3]=d[3]+k|0},_doFinalize:function(){var e=this._data,h=e.words,a=8*this._nDataBytes,d=8*e.sigBytes;h[d>>>5]|=128<<24-d%32;h[(d+64>>>9<<4)+14]=(a<<8|a>>>
24)&16711935|(a<<24|a>>>8)&4278255360;e.sigBytes=4*(h.length+1);this._process();e=this._hash.words;for(h=0;4>h;h++)a=e[h],e[h]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360}});n.MD5=m._createHelper(o);n.HmacMD5=m._createHmacHelper(o)})(Math);
(function(){var q=CryptoJS,i=q.lib,f=i.Base,l=i.WordArray,i=q.algo,r=i.EvpKDF=f.extend({cfg:f.extend({keySize:4,hasher:i.MD5,iterations:1}),init:function(f){this.cfg=this.cfg.extend(f)},compute:function(f,m){for(var i=this.cfg,o=i.hasher.create(),p=l.create(),e=p.words,h=i.keySize,i=i.iterations;e.length<h;){a&&o.update(a);var a=o.update(f).finalize(m);o.reset();for(var d=1;d<i;d++)a=o.finalize(a),o.reset();p.concat(a)}p.sigBytes=4*h;return p}});q.EvpKDF=function(f,l,i){return r.create(i).compute(f,
l)}})();
CryptoJS.lib.Cipher||function(q){var i=CryptoJS,f=i.lib,l=f.Base,r=f.WordArray,n=f.BufferedBlockAlgorithm,m=i.enc.Base64,s=i.algo.EvpKDF,o=f.Cipher=n.extend({cfg:l.extend(),createEncryptor:function(c,a){return this.create(this._ENC_XFORM_MODE,c,a)},createDecryptor:function(c,a){return this.create(this._DEC_XFORM_MODE,c,a)},init:function(c,a,b){this.cfg=this.cfg.extend(b);this._xformMode=c;this._key=a;this.reset()},reset:function(){n.reset.call(this);this._doReset()},process:function(c){this._append(c);return this._process()},
finalize:function(c){c&&this._append(c);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(){return function(c){return{encrypt:function(a,k,j){return("string"==typeof k?b:d).encrypt(c,a,k,j)},decrypt:function(a,k,j){return("string"==typeof k?b:d).decrypt(c,a,k,j)}}}}()});f.StreamCipher=o.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var p=i.mode={},e=f.BlockCipherMode=l.extend({createEncryptor:function(c,a){return this.Encryptor.create(c,
a)},createDecryptor:function(c,a){return this.Decryptor.create(c,a)},init:function(c,a){this._cipher=c;this._iv=a}}),p=p.CBC=function(){function c(c,a,g){var b=this._iv;b?this._iv=q:b=this._prevBlock;for(var d=0;d<g;d++)c[a+d]^=b[d]}var a=e.extend();a.Encryptor=a.extend({processBlock:function(a,g){var b=this._cipher,d=b.blockSize;c.call(this,a,g,d);b.encryptBlock(a,g);this._prevBlock=a.slice(g,g+d)}});a.Decryptor=a.extend({processBlock:function(a,g){var b=this._cipher,d=b.blockSize,e=a.slice(g,g+
d);b.decryptBlock(a,g);c.call(this,a,g,d);this._prevBlock=e}});return a}(),h=(i.pad={}).Pkcs7={pad:function(c,a){for(var b=4*a,b=b-c.sigBytes%b,d=b<<24|b<<16|b<<8|b,e=[],h=0;h<b;h+=4)e.push(d);b=r.create(e,b);c.concat(b)},unpad:function(c){c.sigBytes-=c.words[c.sigBytes-1>>>2]&255}};f.BlockCipher=o.extend({cfg:o.cfg.extend({mode:p,padding:h}),reset:function(){o.reset.call(this);var c=this.cfg,a=c.iv,c=c.mode;if(this._xformMode==this._ENC_XFORM_MODE)var b=c.createEncryptor;else b=c.createDecryptor,
this._minBufferSize=1;this._mode=b.call(c,this,a&&a.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var a=f.CipherParams=l.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),p=(i.format={}).OpenSSL={stringify:function(a){var b=
a.ciphertext,a=a.salt;return(a?r.create([1398893684,1701076831]).concat(a).concat(b):b).toString(m)},parse:function(c){var c=m.parse(c),b=c.words;if(1398893684==b[0]&&1701076831==b[1]){var d=r.create(b.slice(2,4));b.splice(0,4);c.sigBytes-=16}return a.create({ciphertext:c,salt:d})}},d=f.SerializableCipher=l.extend({cfg:l.extend({format:p}),encrypt:function(c,b,d,j){var j=this.cfg.extend(j),e=c.createEncryptor(d,j),b=e.finalize(b),e=e.cfg;return a.create({ciphertext:b,key:d,iv:e.iv,algorithm:c,mode:e.mode,
padding:e.padding,blockSize:c.blockSize,formatter:j.format})},decrypt:function(a,b,d,e){e=this.cfg.extend(e);b=this._parse(b,e.format);return a.createDecryptor(d,e).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),i=(i.kdf={}).OpenSSL={execute:function(c,b,d,e){e||(e=r.random(8));c=s.create({keySize:b+d}).compute(c,e);d=r.create(c.words.slice(b),4*d);c.sigBytes=4*b;return a.create({key:c,iv:d,salt:e})}},b=f.PasswordBasedCipher=d.extend({cfg:d.cfg.extend({kdf:i}),
encrypt:function(a,b,e,j){j=this.cfg.extend(j);e=j.kdf.execute(e,a.keySize,a.ivSize);j.iv=e.iv;a=d.encrypt.call(this,a,b,e.key,j);a.mixIn(e);return a},decrypt:function(a,b,e,j){j=this.cfg.extend(j);b=this._parse(b,j.format);e=j.kdf.execute(e,a.keySize,a.ivSize,b.salt);j.iv=e.iv;return d.decrypt.call(this,a,b,e.key,j)}})}();
(function(){var q=CryptoJS,i=q.lib.BlockCipher,f=q.algo,l=[],r=[],n=[],m=[],s=[],o=[],p=[],e=[],h=[],a=[];(function(){for(var b=[],c=0;256>c;c++)b[c]=128>c?c<<1:c<<1^283;for(var d=0,k=0,c=0;256>c;c++){var j=k^k<<1^k<<2^k<<3^k<<4,j=j>>>8^j&255^99;l[d]=j;r[j]=d;var f=b[d],i=b[f],q=b[i],t=257*b[j]^16843008*j;n[d]=t<<24|t>>>8;m[d]=t<<16|t>>>16;s[d]=t<<8|t>>>24;o[d]=t;t=16843009*q^65537*i^257*f^16843008*d;p[j]=t<<24|t>>>8;e[j]=t<<16|t>>>16;h[j]=t<<8|t>>>24;a[j]=t;d?(d=f^b[b[b[q^f]]],k^=b[b[k]]):d=k=1}})();
var d=[0,1,2,4,8,16,32,64,128,27,54],f=f.AES=i.extend({_doReset:function(){for(var b=this._key,c=b.words,g=b.sigBytes/4,b=4*((this._nRounds=g+6)+1),k=this._keySchedule=[],j=0;j<b;j++)if(j<g)k[j]=c[j];else{var f=k[j-1];j%g?6<g&&4==j%g&&(f=l[f>>>24]<<24|l[f>>>16&255]<<16|l[f>>>8&255]<<8|l[f&255]):(f=f<<8|f>>>24,f=l[f>>>24]<<24|l[f>>>16&255]<<16|l[f>>>8&255]<<8|l[f&255],f^=d[j/g|0]<<24);k[j]=k[j-g]^f}c=this._invKeySchedule=[];for(g=0;g<b;g++)j=b-g,f=g%4?k[j]:k[j-4],c[g]=4>g||4>=j?f:p[l[f>>>24]]^e[l[f>>>
16&255]]^h[l[f>>>8&255]]^a[l[f&255]]},encryptBlock:function(a,c){this._doCryptBlock(a,c,this._keySchedule,n,m,s,o,l)},decryptBlock:function(b,c){var d=b[c+1];b[c+1]=b[c+3];b[c+3]=d;this._doCryptBlock(b,c,this._invKeySchedule,p,e,h,a,r);d=b[c+1];b[c+1]=b[c+3];b[c+3]=d},_doCryptBlock:function(a,c,d,e,f,h,l,i){for(var p=this._nRounds,m=a[c]^d[0],n=a[c+1]^d[1],o=a[c+2]^d[2],q=a[c+3]^d[3],r=4,s=1;s<p;s++)var u=e[m>>>24]^f[n>>>16&255]^h[o>>>8&255]^l[q&255]^d[r++],v=e[n>>>24]^f[o>>>16&255]^h[q>>>8&255]^
l[m&255]^d[r++],w=e[o>>>24]^f[q>>>16&255]^h[m>>>8&255]^l[n&255]^d[r++],q=e[q>>>24]^f[m>>>16&255]^h[n>>>8&255]^l[o&255]^d[r++],m=u,n=v,o=w;u=(i[m>>>24]<<24|i[n>>>16&255]<<16|i[o>>>8&255]<<8|i[q&255])^d[r++];v=(i[n>>>24]<<24|i[o>>>16&255]<<16|i[q>>>8&255]<<8|i[m&255])^d[r++];w=(i[o>>>24]<<24|i[q>>>16&255]<<16|i[m>>>8&255]<<8|i[n&255])^d[r++];q=(i[q>>>24]<<24|i[m>>>16&255]<<16|i[n>>>8&255]<<8|i[o&255])^d[r++];a[c]=u;a[c+1]=v;a[c+2]=w;a[c+3]=q},keySize:8});q.AES=i._createHelper(f)})();
define("crypto", (function (global) {
    return function () {
        var ret, fn;
        return ret || global.CryptoJS;
    };
}(this)));

define('confidentiality_encryption/Confidential', [
    "backbone",
    "crypto"
],function(
    Backbone, 
    CryptoJS
) {
  var Confidential = Backbone.Model.extend(
  /** @lends Confidential.prototype */
  {
    /**
     * @class Confidential makes it possible to generate pass phrases (one per
     *        corpus) to encrypt and decrypt confidential data points. The
     *        confidential data is stored encrypted, and can only be decrypted
     *        if one has the corpus' secret key, or if one is logged into the
     *        system with their user name and password. This allows the corpus
     *        to be shared with anyone, with out worrying about confidential
     *        data or consultant stories being publically accessible. We are
     *        using the AES cipher algorithm.
     * 
     * The Advanced Encryption Standard (AES) is a U.S. Federal Information
     * Processing Standard (FIPS). It was selected after a 5-year process where
     * 15 competing designs were evaluated.
     * 
     * <a href="http://code.google.com/p/crypto-js/">More information on
     * CryptoJS</a>
     * 
     * @description
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function() {
      OPrime.debug("Initializing confidentiality module");

//      var encryptedMessage = this.encrypt("hi this is a longer message.");
//      console.log("encrypted" + encryptedMessage);
//
//      var decryptedMessage = this.decrypt(encryptedMessage);
////      console.log("decrypted:" + decryptedMessage);
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
      
    },
    fillWithDefaults : function(){
      if (this.get("secretkey") == "This should be a top secret pass phrase.") {
        this.set("secretkey", this.secretKeyGenerator());
      }
    },
    defaults : {
      secretkey : "This should be a top secret pass phrase."
    },    
    decryptedMode : false,
    turnOnDecryptedMode : function(callback){
      this.decryptedMode = false;
      if(typeof callback == "function"){
        callback();
      }
    },
    turnOnDecryptedMode : function(callback){
      var self = this;
      if(!this.decryptedMode){
        if(window.appView){
          window.appView.authView.showQuickAuthenticateView( function(){
            //This happens after the user has been authenticated. 
            self.decryptedMode = true;
            if(typeof callback == "function"){
              callback();
            }
          });
        }
      }
    },
    // Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    },
    /**
     * Encrypt accepts a string (UTF8) and returns a CryptoJS object, in base64
     * encoding so that it looks like a string, and can be saved as a string in
     * the corpus.
     * 
     * @param message
     *          A UTF8 string
     * @returns Returns a base64 string prefixed with "confidential" so that the
     *          views can choose to not display the entire string for the user.
     */
    encrypt : function(message) {
      var result = CryptoJS.AES.encrypt(message, this.get("secretkey"));
      // return the base64 version to save it as a string in the corpus
      return "confidential:" + btoa(result);

    },
    
    /**
     * Decrypt uses this object's secret key to decode its parameter using the
     * AES algorithm.
     * 
     * @param encrypted
     *          A base64 string prefixed (or not) with the word "confidential"
     * @returns Returns the encrypted result as a UTF8 string.
     */
    decrypt : function(encrypted) {
      var resultpromise = encrypted;
      if(!this.decryptedMode){
        var confid = this;
        this.turnOnDecryptedMode(function(){
          encrypted = encrypted.replace("confidential:", "");
          // decode base64
          encrypted = atob(encrypted);
          resultpromise =  CryptoJS.AES.decrypt(encrypted, confid.get("secretkey")).toString(
              CryptoJS.enc.Utf8);
          return resultpromise;
        });
      }else{
        encrypted = encrypted.replace("confidential:", "");
        // decode base64
        encrypted = atob(encrypted);
        resultpromise =  CryptoJS.AES.decrypt(encrypted, this.get("secretkey")).toString(
            CryptoJS.enc.Utf8);
        return resultpromise;
      }
    },
    
    /**
     * The secretkeygenerator uses a "GUID" like generation to create a string
     * for the secret key.
     * 
     * @returns {String} a string which is likely unique, in the format of a
     *          Globally Unique ID (GUID)
     */
    secretKeyGenerator : function() {
      var S4 = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4()
          + S4() + S4());
    }
  });

  return Confidential;

});

define('hotkey/HotKey',[
    "backbone"
] ,function(
    Backbone
) {
  var HotKey = Backbone.Model.extend(
  /** @lends HotKey.prototype */
  {
    /**
     * @class A HotKey is a keyboard shortcut that uses one key (or a
     *        combination thereof) which allows users to execute a command
     *        without using a mouse, a menu, etc.
     * 
     * @description The initialize function probably checks to see if any
     *              hotkeys exist and creates a new one if there are none.
     * 
     * @extends Backbone.Model
     * @constructs
     */

    // This is the constructor. It is called whenever you make a new
    // HotKey.
    initialize : function() {
      // this.bind('error', function(model, error) {
      // // TODO Handle validation errors
      // });

    },

    defaults : {
      firstKey : "",
      secondKey : "",
      functiontocall : function() {},
      description : ""
    },
    
    // Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return HotKey;
});
var OPrime = OPrime || {};

OPrime.debugMode = false;
/*
 * Android touchdb for OPrime runs on port 8128, so if the app is running on
 * port 8128 it is likely in a touchdb (either in the android app or in a
 * browser)
 */
OPrime.runFromTouchDBOnAndroidInLocalNetwork = function() {
  return window.location.port == 8128;
};

/**
 * The address of the TouchDB-Android database on the Android.
 */
OPrime.touchUrl = "http://localhost:8128/";

/**
 * The address of the PouchDB database on the browser.
 */
OPrime.pouchUrl = "idb://";

OPrime.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";

OPrime.debug = function(message, message2, message3, message4) {
  if (navigator.appName == 'Microsoft Internet Explorer') {
    return;
  }
  if (this.debugMode) {
    console.log(message);

    if (message2) {
      console.log(message2);
    }
    if (message3) {
      console.log(message3);
    }
    if (message4) {
      console.log(message4);
    }
  }
};

OPrime.bug = function(message) {
  alert(message);
};

OPrime.warn = function(message) {
  alert(message);
};

/*
 * Declare functions for PubSub
 */
OPrime.publisher = {
  subscribers : {
    any : []
  },
  subscribe : function(type, fn, context) {
    type = type || 'any';
    fn = typeof fn === "function" ? fn : context[fn];

    if (typeof this.subscribers[type] === "undefined") {
      this.subscribers[type] = [];
    }
    this.subscribers[type].push({
      fn : fn,
      context : context || this
    });
  },
  unsubscribe : function(type, fn, context) {
    this.visitSubscribers('unsubscribe', type, fn, context);
  },
  publish : function(type, publication) {
    this.visitSubscribers('publish', type, publication);
  },
  visitSubscribers : function(action, type, arg, context) {
    var pubtype = type || 'any';
    var subscribers = this.subscribers[pubtype];
    if (!subscribers || subscribers.length == 0) {
      OPrime.debug(pubtype + ": There were no subscribers.");
      return;
    }
    var i;
    var maxUnsubscribe = subscribers ? subscribers.length - 1 : 0;
    var maxPublish = subscribers ? subscribers.length : 0;

    if (action === 'publish') {
      // count up so that older subscribers get the message first
      for (i = 0; i < maxPublish; i++) {
        if (subscribers[i]) {
          // TODO there is a bug with the subscribers they are getting lost, and
          // it is trying to call fn of undefiend. this is a workaround until we
          // figure out why subscribers are getting lost. Update: i changed the
          // loop to count down and remove subscribers from the ends, now the
          // size of subscribers isnt changing such that the subscriber at index
          // i doesnt exist.
          subscribers[i].fn.call(subscribers[i].context, arg);
        }
      }
      OPrime.debug('Visited ' + subscribers.length + ' subscribers.');

    } else {

      // count down so that subscribers index exists when we remove them
      for (i = maxUnsubscribe; i >= 0; i--) {
        try {
          if (!subscribers[i].context) {
            OPrime
                .debug("This subscriber has no context. should we remove it? "
                    + i);
          }
          if (subscribers[i].context === context) {
            var removed = subscribers.splice(i, 1);
            OPrime.debug("Removed subscriber " + i + " from " + type, removed);
          } else {
            OPrime.debug(type + " keeping subscriber " + i,
                subscribers[i].context);
          }
        } catch (e) {
          OPrime.debug("problem visiting Subscriber " + i, subscribers)
        }
      }
    }
  }
};
OPrime.makePublisher = function(o) {
  var i;
  for (i in OPrime.publisher) {
    if (OPrime.publisher.hasOwnProperty(i)
        && typeof OPrime.publisher[i] === "function") {
      o[i] = OPrime.publisher[i];
    }
  }
  o.subscribers = {
    any : []
  };
};

/**
 * http://www.w3schools.com/js/js_cookies.asp name of the cookie, the value of
 * the cookie, and the number of days until the cookie expires.
 * 
 * @param c_name
 * @param value
 * @param exdays
 */
OPrime.setCookie = function(c_name, value, exdays) {
  if (value) {
    localStorage.setItem(c_name, value);
  } else {
    localStorage.removeItem(c_name);
  }
  // var exdate = new Date();
  // exdate.setDate(exdate.getDate() + exdays);
  // var c_value = escape(value)
  // + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
  // document.cookie = c_name + "=" + c_value;
};
OPrime.getCookie = function(c_name) {
  return localStorage.getItem(c_name);
  // var i, x, y, ARRcookies = document.cookie.split(";");
  // for (i = 0; i < ARRcookies.length; i++) {
  // x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
  // y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
  // x = x.replace(/^\s+|\s+$/g, "");
  // if (x == c_name) {
  // return unescape(y);
  // }
  // }
};

OPrime.isAndroidApp = function() {
  // Development tablet navigator.userAgent:
  // Mozilla/5.0 (Linux; U; Android 3.0.1; en-us; gTablet Build/HRI66)
  // AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13
  // this.debug("The user agent is " + navigator.userAgent);
  return navigator.userAgent.indexOf("OfflineAndroidApp") > -1;
};

if (OPrime.isAndroidApp()) {
  var debugOrNot = Android.isD();
  console.log("Setting debug mode to the Android's mode: " + debugOrNot);
  // OPrime.debugMode = debugOrNot;
};

OPrime.isAndroid4 = function() {
  return navigator.userAgent.indexOf("Android 4") > -1;
};

OPrime.isChromeApp = function() {
  return window.location.href.indexOf("chrome-extension") > -1;
};

OPrime.isCouchApp = function() {
  return window.location.href.indexOf("_design/pages") > -1;
};

OPrime.isTouchDBApp = function() {
  return window.location.href.indexOf("localhost:8128") > -1;
};

/**
 * If not running offline on an android or in a chrome extension, assume we are
 * online.
 * 
 * @returns {Boolean} true if not on offline Android or on a Chrome Extension
 */
OPrime.onlineOnly = function() {
  return !this.isAndroidApp() && !this.isChromeApp();
};

OPrime.getVersion = function(callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', 'manifest.json');
  xmlhttp.onload = function(e) {
    var manifest = JSON.parse(xmlhttp.responseText);
    callback(manifest.version);
  };
  xmlhttp.send(null);
};

/*
 * JavaScript Pretty Date Copyright (c) 2011 John Resig (ejohn.org) Licensed
 * under the MIT and GPL licenses.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
// modified by FieldDB team to take in Greenwich time which is what we are using
// for our time stamps so that users in differnt time zones will get real times,
// not strangely futureistic times
// we have been using JSON.stringify(new Date()) to create our timestamps
// instead of unix epoch seconds (not sure why we werent using unix epoch), so
// this function is modified from the original in that it expects dates that
// were created using
// JSON.stringify(new Date())
OPrime.prettyDate = function(time) {
  if (!time) {
    return undefined;
  }
  time = time.replace(/"/g, "");
  var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " "));
  var greenwichtimenow = JSON.stringify(new Date()).replace(/"/g, "");
  var greenwichdate = new Date((greenwichtimenow || "").replace(/-/g, "/")
      .replace(/[TZ]/g, " "));
  var diff = ((greenwichdate.getTime() - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
    return undefined;
  }

  return day_diff == 0
      && (diff < 60 && "just now" || diff < 120 && "1 minute ago"
          || diff < 3600 && Math.floor(diff / 60) + " minutes ago"
          || diff < 7200 && "1 hour ago" || diff < 86400
          && Math.floor(diff / 3600) + " hours ago") || day_diff == 1
      && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31
      && Math.ceil(day_diff / 7) + " weeks ago";
};
OPrime.prettyTimestamp = function(timestamp) {
  var date = new Date(timestamp);
  var greenwichtimenow = new Date();
  var diff = ((greenwichtimenow.getTime() - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0) {
    return;
  }

  if (day_diff >= 31) {
    return Math.ceil(day_diff / 30) + " months ago";
  }

  if (day_diff >= 548) {
    return Math.ceil(day_diff / 365) + " years ago";
  }

  return day_diff == 0
      && (diff < 60 && "just now" || diff < 120 && "1 minute ago"
          || diff < 3600 && Math.floor(diff / 60) + " minutes ago"
          || diff < 7200 && "1 hour ago" || diff < 86400
          && Math.floor(diff / 3600) + " hours ago") || day_diff == 1
      && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31
      && Math.ceil(day_diff / 7) + " weeks ago";
};

/*
 * Audio functions
 */
OPrime.playAudioFile = function(divid, audioOffsetCallback, callingcontext) {
  this.debug("Playing Audio File and subscribing to audio completion.")
  var audiourl = document.getElementById(divid).getAttribute("src")
  if (!callingcontext) {
    callingcontext = window;
  }
  var callingcontextself = callingcontext;
  if (!audioOffsetCallback) {
    audioOffsetCallback = function(message) {
      OPrime.debug("In audioOffsetCallback: " + message);
      OPrime.hub.unsubscribe("playbackCompleted", null, callingcontextself);
    }
  }
  this.hub.unsubscribe("playbackCompleted", null, callingcontextself);
  this.hub.subscribe("playbackCompleted", audioOffsetCallback,
      callingcontextself);

  if (this.isAndroidApp()) {
    this.debug("Playing Audio via Android:" + audiourl + ":");
    Android.playAudio(audiourl);
  } else {
    this.debug("Playing Audio via HTML5:" + audiourl + ":");
    document.getElementById(divid).removeEventListener('ended',
        OPrime.audioEndListener);
    OPrime.debug("\tRemoved previous endaudio event listeners for " + audiourl);
    document.getElementById(divid).addEventListener('ended',
        OPrime.audioEndListener);
    document.getElementById(divid).play();
  }
}
OPrime.audioEndListener = function() {
  var audiourl = this.getAttribute("src")
  OPrime.debug("End audio ", audiourl);
  OPrime.hub.publish('playbackCompleted', audiourl);
};
OPrime.pauseAudioFile = function(divid, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  var callingcontextself = callingcontext;
  OPrime.hub.unsubscribe("playbackCompleted", null, callingcontextself);

  if (this.isAndroidApp()) {
    this.debug("Pausing Audio via Android");
    Android.pauseAudio();
  } else {
    this.debug("Pausing Audio via HTML5");
    document.getElementById(divid).pause();
    if (document.getElementById(divid).currentTime > 0.05) {
      document.getElementById(divid).currentTime = document
          .getElementById(divid).currentTime - 0.05;
    }

  }
}
OPrime.stopAudioFile = function(divid, callback, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  var callingcontextself = callingcontext;
  OPrime.hub.unsubscribe("playbackCompleted", null, callingcontextself);

  if (this.isAndroidApp()) {
    this.debug("Stopping Audio via Android");
    Android.stopAudio();
  } else {
    this.debug("Stopping Audio via HTML5");
    document.getElementById(divid).pause();
    document.getElementById(divid).currentTime = 0;
  }
  if (typeof callback == "function") {
    callback();
  }
}
OPrime.playingInterval = false;
OPrime.playIntervalAudioFile = function(divid, startime, endtime, callback) {
  startime = parseFloat(startime, 10);
  endtime = parseFloat(endtime, 10);
  if (this.isAndroidApp()) {
    this.debug("Playing Audio via Android from " + startime + " to " + endtime);
    startime = startime * 1000;
    endtime = endtime * 1000;
    var audiourl = document.getElementById(divid).getAttribute("src")
    Android.playIntervalOfAudio(audiourl, startime, endtime);
  } else {
    this.debug("Playing Audio via HTML5 from " + startime + " to " + endtime);
    document.getElementById(divid).pause();
    document.getElementById(divid).currentTime = startime;
    OPrime.debug("Cueing audio to "
        + document.getElementById(divid).currentTime);
    document.getElementById(divid).play();
    OPrime.playingInterval = true;
    document.getElementById(divid).addEventListener("timeupdate", function() {
      if (this.currentTime >= endtime && OPrime.playingInterval) {
        OPrime.debug("CurrentTime: " + this.currentTime);
        this.pause();
        OPrime.playingInterval = false; /*
                                         * workaround for not being able to
                                         * remove events
                                         */
      }
    });
  }
  if (typeof callback == "function") {
    callback();
  }
}
OPrime.captureAudio = function(resultfilename, callbackRecordingStarted,
    callbackRecordingCompleted, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  /*
   * verify completed callback and subscribe it to audioRecordingCompleted
   */
  var callingcontextself = callingcontext;
  if (!callbackRecordingCompleted) {
    callbackRecordingCompleted = function(message) {
      OPrime.debug("In callbackRecordingCompleted: " + message);
      OPrime.hub.unsubscribe("audioRecordingCompleted", null,
          callingcontextself);
    };
  }
  this.hub.unsubscribe("audioRecordingCompleted", null, callingcontextself);
  this.hub.subscribe("audioRecordingCompleted", callbackRecordingCompleted,
      callingcontextself);

  /*
   * verify started callback and subscribe it to
   * audioRecordingSucessfullyStarted
   */
  if (!callbackRecordingStarted) {
    callbackRecordingStarted = function(message) {
      OPrime.debug("In callbackRecordingStarted: " + message);
      OPrime.hub.unsubscribe("audioRecordingSucessfullyStarted", null,
          callingcontextself);
    };
  }
  this.hub.unsubscribe("audioRecordingSucessfullyStarted", null,
      callingcontextself);
  this.hub.subscribe("audioRecordingSucessfullyStarted",
      callbackRecordingStarted, callingcontextself);

  /* start the recording */
  if (this.isAndroidApp()) {
    this.debug("Recording Audio via Android");
    Android.startAudioRecordingService(resultfilename);
    // the android will publish if its successfully stopped, and that it
    // completed
  } else {
    this.debug("Recording Audio via HTML5: " + resultfilename);
    alert("Recording audio only works on Android, because it has a microphone, and your computer might not.\n\n Faking that it was sucessful")
    // fake publish it was sucessfully started
    this.hub.publish('audioRecordingSucessfullyStarted', resultfilename);
  }

};
OPrime.stopAndSaveAudio = function(resultfilename, callbackRecordingStopped,
    callingcontext) {

  /*
   * verify started callback and subscribe it to
   * audioRecordingSucessfullyStarted
   */
  var callingcontextself = callingcontext;
  if (!callbackRecordingStopped) {
    callbackRecordingStopped = function(message) {
      OPrime.debug("In callbackRecordingStopped: " + message);
      OPrime.hub.unsubscribe("audioRecordingSucessfullyStopped", null,
          callingcontextself);
    };
  }
  this.hub.unsubscribe("audioRecordingSucessfullyStopped", null,
      callingcontextself);
  this.hub.subscribe("audioRecordingSucessfullyStopped",
      callbackRecordingStopped, callingcontextself);

  /* start the recording */
  if (this.isAndroidApp()) {
    this.debug("Stopping Recording Audio via Android");
    Android.stopAudioRecordingService(resultfilename);
    // the android will publish if its successfully started
  } else {
    this.debug("Stopping Recording Audio via HTML5: " + resultfilename);
    alert("Recording audio only works on Android, because it has a microphone, and your computer might not.\n\n Faking that stopped and saved sucessfully")
    // fake publish it was sucessfully started
    resultfilename = "chime.mp3"
    this.hub.publish('audioRecordingSucessfullyStopped', resultfilename);
    // fake publish it finished
    this.hub.publish('audioRecordingCompleted', resultfilename);
  }

};
/*
 * Camera functions
 */
OPrime.capturePhoto = function(resultfilename, callbackPictureCaptureStarted,
    callbackPictureCaptureCompleted, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  /*
   * verify completed callback and subscribe it to audioRecordingCompleted
   */
  var callingcontextself = callingcontext;
  if (!callbackPictureCaptureStarted) {
    callbackPictureCaptureStarted = function(message) {
      OPrime.debug("In callbackPictureCaptureStarted: " + message);
      OPrime.hub.unsubscribe("pictureCaptureSucessfullyStarted", null,
          callingcontextself);
    };
  }
  if (!callbackPictureCaptureCompleted) {
    callbackPictureCaptureCompleted = function(message) {
      OPrime.debug("In callbackPictureCaptureCompleted: " + message);
      OPrime.hub.unsubscribe("pictureCaptureSucessfullyCompleted", null,
          callingcontextself);
    };
  }
  /*
   * unsubscribe this context from the chanel incase the user calls it many
   * times on teh same item, only fire the last event
   */
  this.hub.unsubscribe("pictureCaptureSucessfullyStarted", null,
      callingcontextself);
  this.hub.unsubscribe("pictureCaptureSucessfullyCompleted", null,
      callingcontextself);
  /* subscribe the caller's functions to the channels */
  this.hub.subscribe("pictureCaptureSucessfullyStarted",
      callbackPictureCaptureStarted, callingcontextself);
  this.hub.subscribe("pictureCaptureSucessfullyCompleted",
      callbackPictureCaptureCompleted, callingcontextself);

  /* start the picture taking */
  if (this.isAndroidApp()) {
    this.debug("Starting picture capture via Android");
    Android.takeAPicture(resultfilename);
    // the android will publish if its successfully started and completed
  } else {
    this.debug("Starting picture capture via HTML5: " + resultfilename);
    alert("Taking a picture only works on Android, because it has a camera, and your computer might not.\n\n Faking that taken a picture and saved sucessfully");
    // fake publish it was sucessfully started
    resultfilename = "happyface.png";
    this.hub.publish('pictureCaptureSucessfullyStarted', resultfilename);
    this.hub.publish('pictureCaptureSucessfullyCompleted', resultfilename);
  }
};

/*
 * Initialize the debugging output, taking control from the Android side.
 */
OPrime.debug("Intializing OPrime Javascript library. \n" + "The user agent is "
    + navigator.userAgent);

if (OPrime.isAndroidApp()) {
  if (!Android.isD()) {
    this.debugMode = false;
    this.debug = function() {
    };
  } else {
    this.debugMode = true;
  }
}

OPrime.userEncryptionToken = function() {
  return "topsecretuserencryptiontokenfortestingTODOchangethis";
};

OPrime.getConnectivityType = function(callingcontextself, callback) {
  this.hub.unsubscribe("connectivityType", null, callingcontextself);
  /* subscribe the caller's functions to the channels */
  this.hub.subscribe("connectivityType", callback, callingcontextself);

  /* Fire command which will publish the connectivity */
  if (OPrime.isAndroidApp()) {
    OPrime.debug("This is an Android.");
    Android.getConectivityType();
  } else {
    OPrime.hub.publish('connectivityType', 'Probably Online');
  }
};

OPrime.getHardwareInfo = function(callingcontextself, callback) {
  this.hub.unsubscribe("hardwareDetails", null, callingcontextself);
  /* subscribe the caller's functions to the channels */
  this.hub.subscribe("hardwareDetails", callback, callingcontextself);

  /* Fire command which will publish the connectivity */
  if (OPrime.isAndroidApp()) {
    OPrime.debug("This is an Android.");
    Android.getHardwareDetails();
  } else {
    OPrime.hub.publish('hardwareDetails', {
      name : 'Browser',
      model : navigator.userAgent,
      identifier : 'TODOgetMACAddress'
    });
  }
};
OPrime.useUnsecureCouchDB = function() {
  if (OPrime.isAndroidApp()) {
    /*
     * TODO if later when TouchDB has secure databases, we can use a secure
     * TouchDB, return false
     */
    return true;
  }
  if (OPrime.runFromTouchDBOnAndroidInLocalNetwork()
      && window.location.origin.indexOf("chrome-extension") != 0) {
    return true;
  }
  return false;
};

OPrime.checkToSeeIfCouchAppIsReady = function(urlIsCouchAppReady,
    readycallback, failcallback) {
  if (readycallback) {
    OPrime.checkToSeeIfCouchAppIsReadyreadycallback = readycallback;
  }
  if (!$) {
    OPrime.bug("Can't check if DB is ready.");
    console
        .warn("Can't check if DB is ready, checkToSeeIfCouchAppIsReady function depends on JQuery at the moment...");
    return;
  }
  $
      .ajax({
        type : 'GET',
        url : urlIsCouchAppReady,
        data : {},
        beforeSend : function(xhr) {
          // alert("before send" + JSON.stringify(xhr));
          xhr.setRequestHeader('Accept', 'application/json');
        },
        complete : function(e, f, g) {
          console.log(e, f, g);
          // alert("Completed contacting the server.");
        },
        success : function(serverResults) {
          console.log("serverResults" + JSON.stringify(serverResults));
          alert("Your database is ready.");
          if (typeof readycallback == "function") {
            readycallback();
          }
        },// end successful fetch
        error : function(response) {
          // alert("Error contacting the server.");

          console.log("error response." + JSON.stringify(response));
          // alert("error response." + JSON.stringify(response));

          if (response.responseText) {
            if (response.responseText.indexOf("<html") >= 0) {
              localStorage.setItem("urlIsCouchAppReady", urlIsCouchAppReady);
              alert("Your database is ready.");
              if (typeof OPrime.checkToSeeIfCouchAppIsReadyreadycallback == "function") {
                OPrime.checkToSeeIfCouchAppIsReadyreadycallback();
              }
              // window.location.replace(urlIsCouchAppReady);
              return;
            }
            var error = JSON.parse(response.responseText);
            if (error.error == "unauthorized") {
              alert("CouchDB ready but you need to get a session token, this can only happen when you are online.");
            } else {
              alert("Waiting for database to be created...");
              // Loop every 2 sec waiting for the database to load
            }
          }
          window.setTimeout(failcallback, 2000);

          // $("#user-welcome-modal").modal("show");

        },
        dataType : "json"
      });

};

OPrime.sum = function(list) {
  var result = 0;
  for (value in list) {
    result += list[value];
  }
  return result;
};

OPrime.mean = function(list) {
  return OPrime.sum(list) / list.length;
};

OPrime.standardDeviation = function(list) {
  var totalVariance = 0;
  var mean = OPrime.mean(list);
  for ( var i in list) {
    totalVariance += Math.pow(list[i] - mean, 2);
  }
  return Math.sqrt(totalVariance / list.length);
};

/*
 * Initialize pub sub
 */
OPrime.hub = {};
OPrime.makePublisher(OPrime.hub);

define("libs/OPrime", function(){});

define('user/UserMask',[ 
    "backbone",
    "libs/OPrime"
], function(
    Backbone
) {
  var UserMask = Backbone.Model.extend(
  /** @lends UserMask.prototype */
  {
    /**
     * @class A mask of a user which can be saved along with the corpus. It is
     *        generally just a username and gravatar but could be more depending
     *        on what the user allows to be public.
     * 
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      OPrime.debug("UserMask init", this.toJSON());
      
    },
    /**
     * backbone-couchdb adaptor set up
     */
    
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/users",
    
    defaults : {
      gravatar :  "user/user_gravatar.png"
    },
    
    changePouch : function(pouchname, callback) {
      if(!pouchname){
        pouchname = this.get("pouchname");
        if(pouchname == undefined){
          pouchname = window.app.get("corpus").get("pouchname");
        }
      }
      if(OPrime.isCouchApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }
      
      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + pouchname : OPrime.pouchUrl + pouchname);
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    /**
     * this function makes it possible to save the UserMask with a
     * hardcoded id, it uses pouch's API directly for the first save, and then backbone/pouch save for the rest
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      OPrime.debug("Saving the UserMask");
      var self = this;
      this.changePouch(null, function(){
        
        if(OPrime.isCouchApp()){
          if(self.get("pouchname")){
            self.unset("pouchname");
          }
          self.save();
          if(typeof successcallback == "function"){
            successcallback();
          }
          return;
        }
        
        self.pouch(function(err,db){
//          self.set("id", this.id); //TODO might not be necessary
          var modelwithhardcodedid = self.toJSON();
//          modelwithhardcodedid._id = this.id; //this is set by authentication when it first creates the usermask
          if(! modelwithhardcodedid._id){
            if(modelwithhardcodedid.id){
              modelwithhardcodedid._id = modelwithhardcodedid.id; //this is set by authentication when it first creates the usermask
            }else{
              OPrime.debug("Trying to save user mask too early, before it has an _id. not saving...but pretending it worked", modelwithhardcodedid);
              if(typeof successcallback == "function"){
                successcallback();
              }
              return;
              OPrime.debug("bug: the user mask doesnt have an _id, it wont save properly, trying to take the id from the user "+window.app.get("authentication").get("userPrivate").id);
              modelwithhardcodedid._id = window.app.get("authentication").get("userPrivate").id;
            }
          }
          
          db.put(modelwithhardcodedid, function(err, response) {
            if(err){
              OPrime.debug("UserMask put error", err);
              if(err.status == "409"){
                  //find out what the rev is in the database by fetching
                  self.fetch({
                    success : function(model, response) {
                      OPrime.debug("UserMask fetch revision number success, after getting a Document update conflict", response);
                      
                      modelwithhardcodedid._rev = self.get("_rev");
                      OPrime.debug("Usermask old version", self.toJSON());
                      OPrime.debug("Usermask replaced with new version", modelwithhardcodedid );
                      
                      db.put(modelwithhardcodedid, function(err, response) {
                        if(err){
                          OPrime.debug("UserMask put error, even after fetching the version number",err);
                          if(typeof failurecallback == "function"){
                            failurecallback();
                          }
                        }else{
                          OPrime.debug("UserMask put success, after fetching its version number and overwriting it", response);
                          //this happens on subsequent save into pouch of this usermask's id
                          if(typeof successcallback == "function"){
                            successcallback();
                          }
                        }
                      });
                      
                    },
                    //fetch error
                    error : function(e) {
                      OPrime.debug('UserMask fetch error after trying to resolve a conflict error' + JSON.stringify(err));
                      if(typeof failurecallback == "function"){
                        failurecallback();
                      }
                    }
                  });
              }else{
                OPrime.debug('UserMask put error that was not a conflict' + JSON.stringify(err));
                //this is a real error, not a conflict error
                if(typeof failurecallback == "function"){
                  failurecallback();
                }
              }
            //this happens on the first save into pouch of this usermask's id
            }else{
              OPrime.debug("UserMask put success", response);
              if(typeof successcallback == "function"){
                successcallback();
              }
            }
          });
        });
      });      
    }
  });

  return UserMask;
});
define('user/Users',
    ["backbone",
     "user/UserMask"],
    function(Backbone, UserMask) {
  
  var Users = Backbone.Collection.extend(
      
    /** @lends Users.prototype */ 
        
    {
      /**
       * @class A collection of user masks (used mostly for permissions groups)

       * @description
       * 
       * @extends Backbone.Model
       * 
       * @constructs
       * 
       */
      
      /**
       * backbone-couchdb adaptor set up
       */
      db : {
        view : "users",
        changes : false,
        filter : Backbone.couch_connector.config.ddoc_name + "/users"
      },
      // The couchdb-connector is capable of mapping the url scheme
      // proposed by the authors of Backbone to documents in your database,
      // so that you don't have to change existing apps when you switch the sync-strategy
      url : "/users",
      // The messages should be ordered by date
      comparator : function(doc){
        return doc.get("_id");
      },
      
      internalModels: UserMask,
      model: UserMask
  
  }); 
  
  return Users; 
  
}); 

define('permission/Permission',[
    "backbone",
    "user/Users"
], function(
    Backbone,
    Users
) {
  var Permission = Backbone.Model.extend(
  /** @lends Permission.prototype 	*/
  {
    /**
     * @class The permission class specifies which user (User, Consultant or Bot)
     *        can do what action to what component in a given corpus. 
     *        The specification needs three arguments: User, Verb, Object 
     *       
     *        
     * @property {UserGeneric} user This is userid or username 
     * @property {String} verb Verb is the action permitted: 
     * 				admin: corpus admin. admin can handle permission of other users 
     *				read: can read 
     *				addNew: can add/create new datum etc. 
     *				edit: can edit/change the content of datum etc., including delete datum which is basically just changing datum states  
     *				comment: can comment on datum etc. 
     *				export: can export datum etc. 
     * @property {String} object Object is sub-component of the corpus to which 
     *	     	    the action is directed: 
     *				corpus: corpus and corpus details (description etc.) 
     *				datum: datums in the corpus including their states 
     *				session: sessions in the corpus 
     *				datalist: datalists in the corpus  
     * 
     * @extends Backbone.Model
     * @constructs
     */
    intialize : function() {
    },
  
    defaults : {
//      users: Users,
//      role: "", //admin, writer, reader
//      pouchname: "",
    },
    
    // Internal models: used by the parse function
    internalModels : {
      users: Users
    },
    saveAndInterConnectInApp : function(callback){
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return Permission;
});
define('insert_unicode/InsertUnicode',	[
    "backbone"
], function(
    Backbone
) {	
	var InsertUnicode = Backbone.Model.extend(		
	/** @lends InsertUnicode.prototype */ 	
	{
	  /**
	   * @class InsertUnicode allows a user to use IPA symbols, characters other than Roman alphabets, etc.. 
	   * 		Users can add new symbols. Added symbols are saved and stored, and will show up next time the user 
	   * 		opens InsertUnicode box. 
	   * 
	   * @description Initialize function 
	   * 
	   * @extends Backbone.Model
	   * 
	   * @constructs
	   */ 
  	initialize: function(){
  	}, 
  	
  	defaults : {
  	  symbol : "", 
  	  tipa : "",
  	  useCount : 0
  	},
  	// Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
    
	}); 

	return InsertUnicode;
	
});
define('insert_unicode/InsertUnicodes',[ "backbone", 
         "insert_unicode/InsertUnicode"
      ], function(Backbone, InsertUnicode) {
  var InsertUnicodes = Backbone.Collection.extend(

      /** @lends InsertUnicodes.prototype  */

      {
        /**
         * @class InsertUnicodes is a set of unicode symbols. 
         * 
         * @extends InsertUnicode.Collection
         * @constructs
         * 
         */  
        initialize: function() {
          this.bind('error', function(model, error) {
            // TODO Handle validation errors
          });
          
        },
        internalModels: InsertUnicode,
        model: InsertUnicode,
        fill : function(){
          
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɐ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɑ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɒ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɓ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ɔ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɕ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɖ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɗ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɘ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ə"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɚ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ɛ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɜ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɝ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɞ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɟ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɠ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɡ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɢ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ɣ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɤ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ɥ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ɦ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɧ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɨ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɩ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɪ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ɫ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɬ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɮ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɭ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɯ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɰ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɱ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɲ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɳ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɴ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɵ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɶ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɷ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɸ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɹ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɺ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɻ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɼ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɽ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɾ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ɿ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʀ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʁ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʂ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ʃ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʄ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʅ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʆ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʇ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʈ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʉ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʊ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʋ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʌ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʍ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʎ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʏ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʐ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʑ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ʒ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʓ"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "ʔ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʕ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʖ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʗ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʘ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʙ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʚ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʛ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʜ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʝ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʞ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʟ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʠ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʡ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʢ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʣ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʤ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʥ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʦ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʧ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʨ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʩ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʪ"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ʫ"}));
        this.add(new InsertUnicode({tipa: "\lambda", symbol:  "λ "}));
        this.add(new InsertUnicode({tipa: "\alpha", symbol:  "α "}));
        this.add(new InsertUnicode({tipa: "\beta", symbol:  "β "}));
        this.add(new InsertUnicode({tipa: "\forall", symbol:  "∀"}));
        this.add(new InsertUnicode({tipa: "\exists", symbol:  "∃"}));
        
        
        
//
//        this.add(new InsertUnicode({tipa: "", symbol:  "γ "}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "δ "}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ε "}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ζ "}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "η "}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "θ "}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "ι "}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "κ "}));
        
        
        
        
        this.add(new InsertUnicode({tipa: "", symbol:  "∄"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "∅"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "∆"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "∇"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "∈"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "∉"}));
        
        this.add(new InsertUnicode({tipa: "", symbol:  "∋"}));
        this.add(new InsertUnicode({tipa: "", symbol:  "∌"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "∍"}));
        
//        this.add(new InsertUnicode({tipa: "", symbol:  "≁"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≂"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≃"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≄"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≅"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≆"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≇"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≈"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≉"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≊"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≋"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≌"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≍"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≎"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≏"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≐"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≑"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≒"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≓"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≔"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≕"}));
        
//        this.add(new InsertUnicode({tipa: "", symbol:  "≤"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≥"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≦"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≧"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≨"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≩"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≪"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≫"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≬"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≭"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≮"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≯"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≰"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≱"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≲"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≳"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "≴"}));
        
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊂"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊃"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊄"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊅"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊆"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊇"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊈"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊉"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊊"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊋"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊌"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊍"}));
//        this.add(new InsertUnicode({tipa: "", symbol:  "⊎"}));
        }
      });


  return InsertUnicodes;
});

define('user/UserPreference',[
    "backbone",
    "insert_unicode/InsertUnicode",
    "insert_unicode/InsertUnicodes"
], function(
    Backbone,
    InsertUnicode,
    InsertUnicodes
) {
  var UserPreference = Backbone.Model.extend(
  /** @lends UserPreference.prototype */
  {
    /**
     * @class Hold preferences for users like the skin of the app
     * 
     * @property {int} skin This is user's preferred skin.
     * @property {int} numVisibleDatum The number of Datum visible at the time on
     * the Datum*View's.
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      OPrime.debug("USER PREFERENCE init");
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      if(this.get("unicodes") == undefined){
        this.set("unicodes", new InsertUnicodes());
      }//end if to set unicode
      if(this.get("unicodes").models.length == 0){
        this.get("unicodes").fill();
      }
    },
    defaults : {
      skin : "",
      numVisibleDatum : 2, //Use two as default so users can see minimal pairs
      transparentDashboard: "false",
      alwaysRandomizeSkin : "true",
      numberOfItemsInPaginatedViews : 10
    },
    
    // Internal models: used by the parse function
    internalModels : {
      unicodes : InsertUnicodes
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
    
  });

  return UserPreference;
});

define('user/UserGeneric',[ 
    "backbone", 
    "hotkey/HotKey",
    "permission/Permission",
    "user/UserPreference",
    "user/UserMask",
    "libs/OPrime"
], function(
    Backbone,
    HotKey,
    Permission,
    UserPreference,
    UserMask
) {
  var UserGeneric = Backbone.Model.extend(
  /** @lends UserGeneric.prototype */
  {
    /**
     * @class A generic user has a repository and permission groups
     *        (read, write, admin). It can not login.
     * 
     * @property {String} username This is a username used when login.
     * @property {String} password This is a password used when login. It should be secure (containing 1 digit, 1 uppercase) because it is what protects the confidentiality of the corpus.
     * @property {String} email This is user's email
     * @property {String} gravatar This is user's gravatar
     * @property {String} researchInterest This is user's field of
     *           interest (eg. semantics etc)
     * @property {String} affiliation This is user's affiliation
     * @property {String} description This user's description
     * @property {String} subtitle This user's subtitle
     * @property {Array} corpuses The corpus connections of the corpuses owned by
     *           this user
     * @property {Array} dataLists The datalist IDs of the datalists owned
     *           by this user.
     * @property {UserPreference} prefs This is where we'll have things like
     *           background/skin.
     * 
     * @description The initialize function probably checks to see if
     *              the user is existing or new and creates a new
     *              account if it is new.
     * 
     * @extends Backbone.Model
     * @constructs
     */

    // This is the constructor. It is called whenever you make a new
    // User.
    initialize : function() {
      OPrime.debug("USERGENERIC init");

    },
      
    // Internal models: used by the parse function
    internalModels : {
      prefs : UserPreference,
      permissions : Permission, //TODO this needs to become plural
      hotkeys : HotKey, //TODO this needs to become plural
      publicSelf : UserMask
    },

    addCurrentCorpusToUser : function(){
      var cc = window.app.get("corpus").get("couchConnection");
      if(window.app.get("corpus").id != undefined){
        cc.corpusid =  window.app.get("corpus").id;
        this.get("corpuses").push(cc);
      }else{
        window.appView.toastUser("The corpus has no id, cant add it to the user.","alert-danger","Bug!");
      }
    },
    saveAndInterConnectInApp : function(callback){
      //TODO override in derived classes?
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return UserGeneric;
});
define('user/User',[
    "backbone",
    "hotkey/HotKey",
    "user/UserGeneric",
    "user/UserPreference",
    "libs/OPrime"
], function(
    Backbone, 
    HotKey,
    UserGeneric,
    UserPreference
) {
  var User = UserGeneric.extend(
  /** @lends User.prototype */
  {
    /**
     * @class User extends from UserGeneric. It inherits the same attributes as UserGeneric but can 
     * login. 
     * 
     * @property {String} firstname The user's first name. 
     * @property {String} lastname The user's last name.
     * @property {Array} teams This is a list of teams a user belongs to. 
     * @property {Array} sessionHistory 
     * @property {Permission} permissions This is where permissions are specified (eg. read only; add/edit data etc.)   
     *
     * @description The initialize function probably checks to see if the user is existing or new and creates a new account if it is new. 
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function(attributes) {
      OPrime.debug("USER init");
      User.__super__.initialize.call(this, attributes);
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
      this.bind("change", this.checkPrefsChanged, this);
    },
    fillWithDefaults : function(){
      // If there is no prefs, create a new one
      if (!this.get("prefs")) {
        this.set("prefs", new UserPreference({filledWithDefaults : true }));
      }
      
      // If there is no hotkeys, create a new one
      if (!this.get("hotkeys")) {
        this.set("hotkeys", new HotKey({filledWithDefaults : true }));//TODO this needs to become plural when hotkeys get implemented
      }
    },
    defaults : {
      // Defaults from UserGeneric
      username : "",
      password : "",
      email : "",
      gravatar : "user/user_gravatar.png",
      researchInterest : "",
      affiliation : "",
      description : "",
      subtitle : "",
      corpuses : [],
      dataLists : [],
      mostRecentIds : {},
      // Defaults from User
      firstname : "",
      lastname : "",
      teams : [],
      sessionHistory : []
    },

    /**
     * The subtitle function returns user's first and last names. 
     */
    subtitle: function () {
    	if (this.get("firstname") == undefined) {
        this.set("firstname","");
      }
      
      if (this.get("lastname") == undefined) {
        this.set("lastname","");
      }
      
      return this.get("firstname") + " " + this.get("lastname");
    },
    checkPrefsChanged : function(){
      try{
        window.appView.userPreferenceView.model = this.get("prefs");
        window.appView.userPreferenceView.render();
      }catch(e){
        
      }
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return User;
});
define('authentication/Authentication',[
    "backbone", 
    "confidentiality_encryption/Confidential",
    "user/User",
    "user/UserMask",
    "libs/OPrime" 
], function(
    Backbone, 
    Confidential,
    User,
    UserMask
) {
  var Authentication = Backbone.Model.extend(
  /** @lends Authentication.prototype */
  {
    /**
     * @class The Authentication Model handles login and logout and
     *        authentication locally or remotely. *
     * 
     * @property {User} user The user is a User object (User, Bot or Consultant)
     *           which is logged in and viewing the app with that user's
     *           perspective. To check whether some data is
     *           public/viewable/editable the app.user should be used to verify
     *           the permissions. If no user is logged in a special user
     *           "public" is logged in and used to calculate permissions.
     * @property {Boolean} staleAuthentication TODO Describe staleAuthentication.
     * @property {String} state The current state of the Authentication is either
     *           "renderLoggedIn" (if the user is not the public user) or "renderLoggedOut" (if the user is the public user).
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      OPrime.debug("AUTHENTICATION INIT");
      this.bind('error', function(model, error) {
        OPrime.debug("Error in Authentication  : " + error);
      });
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      if(!this.get("confidential")){
        this.set("confidential", new Confidential({filledWithDefaults : true}));
        this.get("confidential").decryptedMode = true;
        if(OPrime.getCookie("token")){
          this.get("confidential").set("secretkey", OPrime.getCookie("token")); //TODO store the token somewhere safer
        }else{
          //do nothing, wait until you use the token
//          this.logout();
//          return;
        }
      }
    },
    defaults : {
      username : localStorage.getItem("username"),
      state : "loggedOut"
    },
    
    // Internal models: used by the parse function
    internalModels : {
      userPrivate : User,
      userPublic : UserMask,
      confidential :  Confidential
    },

    staleAuthentication: true,
    
    /**
     * Contacts local or remote server to verify the username and password
     * provided in the user object. Upon success, calls the callback with the
     * user.
     * 
     * @param user A user object to verify against the authentication database
     * @param callback A callback to call upon sucess.
     */
    authenticate : function(user, successcallback, failcallback) {
      var dataToPost = {};
      dataToPost.username = user.get("username");
      dataToPost.password = user.get("password");
      if(this.get("userPrivate") != undefined){
        //if the same user is re-authenticating, include their details to sync to the server.
        if(user.get("username") == this.get("userPrivate").get("username") && user.get("username") != "public"){
          dataToPost.syncDetails = "true";
          dataToPost.syncUserDetails = JSON.parse(JSON.stringify(this.get("userPrivate").toJSON()));
          delete dataToPost.syncUserDetails._rev;
        }
        //TODO what if they log out, when they have change to their private data that hasnt been pushed to the server, the server will overwrite their details. should we automatically check here, or should we make htem a button when they are authetnticated to test if they ahve lost their prefs etc?
      }
      var self= this;
      var authUrl = user.get("authUrl");
      $.ajax({
        type : 'POST',
        url : authUrl + "/login",
        data : dataToPost,
        success : function(serverResults) {
          if (serverResults.userFriendlyErrors != null) {
            try{
              window.appView.toastUser(serverResults.userFriendlyErrors.join("<br/>") + " " + OPrime.contactUs, "alert-danger","Login errors:");
            }catch(e){
              OPrime.debug(e);
            }
            if (typeof failcallback == "function") {
              failcallback(serverResults.userFriendlyErrors.join("<br/>"));
            }
            if (typeof successcallback == "function") {
              successcallback(null, serverResults.userFriendlyErrors); // tell caller that the user failed to
              // authenticate
            }
          } else if (serverResults.user != null) {
            
            this.staleAuthentication = false;

            if(OPrime.isTouchDBApp()){
              /* if on android, turn on replication. */
              var db = dataToPost.username + "-firstcorpus";
              var dbServer = serverResults.user.corpuses[0].domain;
              if(serverResults.user.mostRecentIds && serverResults.user.mostRecentIds.couchConnection && serverResults.user.mostRecentIds.couchConnection.pouchname ){
                db = serverResults.user.mostRecentIds.couchConnection.pouchname;
                dbServer = serverResults.user.mostRecentIds.couchConnection.domain;
              }
              Android.setCredentialsAndReplicate(db, username, password, dbServer);
            } 
            
            self.saveServerResponseToUser(serverResults, successcallback);
          }
        },//end successful login
        error: function(e){
          OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying).", e);
          if(window.appView){
            window.appView.toastUser("There was an error in contacting the authentication server to confirm your identity. " + OPrime.contactUs, "alert-danger","Connection errors:");
          }

          if (typeof failcallback == "function") {
            failcallback("There was an error in contacting the authentication server to confirm your identity. Maybe you're offline?");
          }
        },
        dataType : ""
      });     
    },
    
    logout : function(){
      localStorage.removeItem("username");
      localStorage.removeItem("mostRecentDashboard");
      localStorage.removeItem("mostRecentCouchConnection");
      localStorage.removeItem("encryptedUser","confidential:VTJGc2RHVmtYMStBTDBmMVN3NVVxRldWdWVXcXBBODJuMmxicThPN0hUSmlRYkFCclRwSXFxYVNtV2o5WFdnYkhOR2JlTVEyRjZoSnRobG4rczArdWVmbXl1K1JMaDZCY1NpVGZGTTRubm02azhGZVlhQWxwMkZGZzFVeEhONVZ2UDFicHkwU1l1azVEc0VNOHRpWEZhL0wwdThiNmd2OVhyNUVMU1UxdERPZmpLc0MxR29CUjBxejQ1QTU1c0s0QmdoempIS052YlJlYTRWVVNiTC9SeGNXeFU4eGN6NUp1Z3FQVjlJOTBPeS83ckNBNlZCdVdGYWhYU0ZzYXJhMm14NVN1dE82Yjk1enpaaitTci9CV0pKZWNXbklTNkRyRVlmYmczcGRXemVlcFMwUGRKY0NMRmhGNHp3aEpTNjBxRHU5Si9KUzNTR2dadEJaYWkyd0p2NExpdG9kOXB4YkNIYXQvR21hMTg3QnZFbkhqZmZMazQvZURySkwvTGxkRUUwTGZsdzg2VWduNnZpS3ZFOElWT1RPaXZIbFUzTEdqOFJWYTZrd2dPM3J2ci9EY2dKb24vUkxwUXBrVkZVdUlEektLeXN0WG0rSFQvSEtoZFVQQVdNdTNEWXdUcDI3SUM1NVMyNW5tQ3ZaM1FTeUxiOFk2SWQ5Q0x2dFk4d0ZQRTZVRjdqNnpEem1IRHN2QVBjU0xuQ2k3RGJPWG9BUTFqeFRpald0WW1pSkJ6WXIwNHFFb0xIMk5pN2hjaThiemFCN0Vva0t1b0Vpbm9wbGxGazBseTlkNUtEWE1ma1JncFFYWGNEaUxrQmR3YnhneThaSjlRT0Fqc0kzQXRPQndRUUJMNkVmbTZRUWg5OGFDZWRMVmxFWXQwV2VKSmhCSEJqMDlqcE9qcnkzNUVPMktTU2EwK0lTU0drN1pYd1RWci9vbGlBZHZ4TzNaWGFsWjZMMTNaUWJreU5PWVlXVlU5akJOeTNlYmFaY0NiUTdSL2tNNjFzMVZ2VjJBQmF0NFNKeXJKZkIrbTFSSC9lOE1zU3ppWng0aVZGMzhzOWZWQVV5ZFpUZUpabVM4NVEzNWlDWHpKbkVmcFJLOHFEWGdueFdxTHZtemxkZERXOVNoLzBkdjlneFNKZ05IY08xbU1aUFp0RzErMEVuNUtqbDlLZFovZGhPTGtibmVTdktTRXFZcDhvZnRNbFIzdVlxMXFoQVQ2bjNPQ3FoRmQ4Q3R4YUxTajhNaHBMeFVseEdCNjZvNkNUN2JOMk1ZbGZNV0RycG9Tak9XMUVZZGovN0lrREdVdEZsVDF4SWtIcmVYNlJsNWRQSzVLdTQrbUdGSHI4RkNDZGVINlF1M1FyTGNKR3dJY0tSTW9xYStaRndYU2gvTW1RQ1oyc3VTdVVzSkJIcmg3TFRzei9uY2pGZXZJSmdqb3hZczY3bkxMZmM4QkVrc3R5ZnNkYlJWZlRkeG9ZVitaTC9DeDFFdXlPU1pKSjZBTG9iVytlaEhxMVNFSVRHUEFhMk5RdEN6NlNrYlR6QmJtSCt5bjkzMGlwSDRUSUF1M0l3ME0xRVhrUDVCWVU5bjF0VWxXaUxBdllUVUV6OHBVenpiTUpmOGNtVTB1NWlCOFFZb1hmTW5UL2wwbk1JUm1KT1A1S3BOME9RSEZORWNmb0hmY3dScEl6ZlNVeEUvcXFTV1N3cHhqRXh5aHVEZWllcXBhNlVBbGM3RitTS1pHc21VeTRmUFA5UjMxNy92UEhHakgrWStnMEVIUmN3NUdiY1lRT3ZTMkNSdzl6bXNZL2NQUlFEbzQ4Q2hHL2VzTEhTTzJ1aTkzcURSNHI0aEw4OXRCYXE2REJiaWJSZ1dvWUs0aFdpVG50TGtZd1Z1MGExQkVDZkpsMEZWR0xpemJIalMvek5VSDdtVWh1QWhjZzc3OU0yZGNrTWhaTmZsMC9STWRqcE9aYUpESlMwbkdhTjRNZFZuY3BDZ202TWQ3c0xVcDhWUWlucGEvWGlxbXpVMG9qekpYczRxVTJ5Z0R1a1IrdnZBenAvaDhFeTUzM0NpY2paamdIS0s4a0IrU0NZQ1BaSENOSWhoMVhFVE9Od2tUbzIrVitGL0JtRGVLQWd6TWJta08xKzJ5eG9tYTJqL2E1YWgreUx1VXFNMTlJVWVINUg2cjZmL0QwZmN5RUsrRGZ0NzRhUGFUU01FYitxRFBEc1NDNVZCZ0JoRTJSa2loM3dHQVUwVTEyNU83NTVaekpMOUM3eFRyOUt5SWxjT1VrMzREamwvNkRzWmw5NzZLc1ZOV0tlaHpJSVVNVzBSSVgxTjJ4aXRoTVJVVkpodlU3OUlzT2UvWWlMZER5OFFRcHRpc214dS95ZGRlQyt2Z1BFMFdWb2xKVmprbU1HT0RMNC9YbEZkZFpncG9tMWowRkpqZnRPUHpJbElvSkwvYUVHR0puK3E2em1SZGlwcjk3Tkp3RkxUNmFUN3V4UjdMWmk2cVZxQjFmZkN3VTJVRWVVQWFJZUovQTlYZjgzTnptK1Yxb1BTSDZFSXVXZzFzVm42UEtyL3JlM2Vscks5YitpU08yeWdOTkxsb2plK0EvMlRmc0J3dmFxMThuaTFKeTh6RXVlL2E1a1krOStnSkdOQThsR3BLRUVXbEF1UFFlWDVobUR3MXNsMTJXMUtmYWc1UFRNOGFyQy9LL0FjVzltQUlFTXFpWVl6WmZJM25jUzI0MFByQ1BFRDFFQW9IMDdjbUZQQ1VycW5MRmxKZjl6blJIUmU2NmpHVjQ0SGNOcnZhSGZxMVRRQytaY056ckFxblN1ZC9wWVNDNHhLeGVoeWF4M2xDdzNsbzR0LzhlNHZVZWxwVFpjcUtOaDdXL0p0YlpwNkJrV2JmQldjc21ETEozcC9qM3ZDaG1rcXV0eWxxd0VCS3U1YnluamlrRDlFZEd3SDVwbURRQmsrQ0xoLzhXY0NveE9sT3dMV2EvTUY0VVdnQTlmOHdCUjV1T2VVMUcrUzFjSzBqKzRDbTltc2ZzbnNrZGlCQUVqdjIxbTQ5YituUEZVRkkyYURqUHdFL0Y4RmtTbFRJc1ZuK2hQVmVlMVFPVzFxU0tzZDdHUU1pNWtzSU5nNEp2ZnloMjVZaEwzdmR5VkpJTjhWdXRmQWV4aUhEZUMvbW5qcjh6Z3hkMS9Tb3FCZTluTWJTUUxCQXVlM0hZbXBSNWdBWllFcUdENmRIK0dtUURzQzJCSjVwakZEd1V0MG05ZU5KR0VTdERLZmxZUDJrTE1ReEc5a2FmVmt1SUk4bEMvZVhZNEpYWnR3Q0o4L1hKUVJ6SStQOXJHclpDYWU4Qk9qbDdwcVhkazBISnhVUUFtRkhFc0w1S0NNdWpiT0JEL1FKK25QMldYNXJib2YydWY3MUNNZ2ZaT3FFalFkSmZZblNveDlWQnFJTXFsOVh4R0lHL0RqcEttYXpmV2hneFMwb09DakRPTldKZnRYTk5FUDN5MWJaY0dhdnl0OFVnaklBa3pLRVJjNGhkaUY2ZktoRjhyN1Nhc2JyS3J6OWxHU25FWEhMTEUvcnFyVkIvS2JQLzRTRVRyR0RuZXJUZkJXeVVmd25PTzJjaFNLNmkrQmxReDgrcm5naVdlUFBzZ2ZPQlpHUDFFMWZGSjlZb3JVbnl5YnM4WHBZZDhhaXhLWTRCZndiQ2l5Mk55MXpwSDNDNE1HL0dsZWlIYi81TW9vSERkeVlTa0g4YmxHSm0zeC9mNi9VcEVJQ05LZGRVaEtkenR5Uy9YRG9jT2pUVlNnMGFadm5rMFoybU5VOSswTHVDWENNTkRyZzUvUjZWdlV6U2VhRWtPMjRQVnZiRHFIRXRTUVV0dUNqdDZDMlVaV3NkYnIySTNaVW16Y1cxeTFDQWUzS2lMT2xTU1c1dE9sc2ZLZ3FDMGxnN2VXZmZWeGdvMHlZMU5GbFhSQ3pWazVNT2tIYldSVzUrSDZxUWFaMERvWXVySHZlaVZETGNvNTl2Y3JJbFlvcDlQV0wyaE1ENEhiWGdaTzhMYzU5aUEvTzR0aUZMQm5sUXN0MjNLOWM3cUJHUG5hNVdjcU5zMTJWcHI4bXhrUDRJSzNXL1AwZEtVM2VpSnFTbG9DUUZTS0JFR3JTUGdnVm9QOEdSRVU1cXJlcnVkZzZFbTZYTlgzN1pnYWZoa2J2WWd2TmFtbDdScEpBQ3V6aDc4Q25sZGVya0pQWHJoRXFZbG9LOStpZUF5N05uemMwaU5oSVNZdGhuU2g2WDNXUllXS3BEaWdvbzRtME5zYUgraE51MExBWmZ2QjZNcVpTY2RxMkx0YnozdkdrbHZMSW9wcjlCTzRDNXRkZHFPWUg4VXFub28xdFBMSUNIb3djUG1ydHU3K1ZzL2wwK05NV0hxVWlJL3B2UUV6TVJjMStud3E2cUlZY3lVajc3NFU3VitNMVY1VzFuempYTnlZc0hOVmErRTZGMVJhazd5MkVvYmJhak5POGxVaFBqaEZ4UlhKcWVwd0NHTDM5dkJOUlRnNDl5NldXOWRjNkV5L29vNkdJRk9WWlpLUWdud1R1dktlZ2UyaWpnPQ==");
      /* keep the user's help count*/
//      localStorage.removeItem("helpShownCount");
//      localStorage.removeItem("helpShownTimestamp");
    
      //Destropy cookies, and load the public user
      OPrime.setCookie("username", undefined, -365);
      OPrime.setCookie("token", undefined, -365);
      
      this.loadPublicUser();
    },
    /**
     * This function parses the server response and injects it into the authentication's user public and user private
     * 
     */
    saveServerResponseToUser : function(serverResults, callbacksave){
      OPrime.debug("saveServerResponseToUser");

      var renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedIn";
      if(serverResults.user.username == "public"){
        renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedOut";
      }
      this.set("state", renderLoggedInStateDependingOnPublicUserOrNot);

      // Over write the public copy with any (new) username/gravatar
      // info
      if (serverResults.user.publicSelf == null) {
        // if the user hasnt already specified their public self, then
        // put in a username and gravatar,however they can add more
        // details like their affiliation, name, research interests
        // etc.
        serverResults.user.publicSelf = {};
        serverResults.user.publicSelf.username = serverResults.user.username;
        serverResults.user.publicSelf.gravatar = serverResults.user.gravatar;
        serverResults.user.publicSelf.authUrl = serverResults.user.authUrl;
        serverResults.user.publicSelf.id = serverResults.user._id; //this will end up as an attribute
        serverResults.user.publicSelf._id = serverResults.user._id; //this will end up as an attribute
//        serverResults.user.publicSelf.pouchname = serverResults.user.corpuses[0].pouchname;
      }
      
      if (this.get("userPublic") == undefined) {
        this.set("userPublic", new UserMask(serverResults.user.publicSelf));
      }else{
        this.get("userPublic").set(serverResults.user.publicSelf);
      }
      this.get("userPublic")._id = serverResults.user._id;

      if (this.get("userPrivate") == undefined) {
        this.set("userPrivate", new User({filledWithDefaults: true}));
      }
      var u = this.get("userPrivate");
      u.id = serverResults.user._id; //set the backbone id to be the same as the mongodb id
      //set the user AFTER setting his/her publicself if it wasnt there already
      /*
       * Handle if the user got access to new corpora
       */
      if(serverResults.user.newCorpusConnections){
        if(window.appView){
          window.appView.toastUser("You have have been added to a new corpus team by someone! Click on <a data-toggle='modal' href='#user-modal'> here </a> to see the list of corpora to which you have access.","alert-success","Added to corpus!");
        }
        for(var x in serverResults.user.newCorpusConnections){
          if(_.pluck(serverResults.user.corpuses,"pouchname").indexOf(serverResults.user.newCorpusConnections[x].pouchname) == -1){
            serverResults.user.corpuses.push(serverResults.user.newCorpusConnections[x]);
          }
        }
        delete serverResults.user.newCorpusConnections;
      }
      
      u.set(u.parse(serverResults.user)); //might take internal elements that are supposed to be a backbone model, and override them
      if(window.appView){
        window.appView.associateCurrentUsersInternalModelsWithTheirViews();
      }
      /* Set up the pouch with the user's most recent couchConnection if it has not already been set up */
      window.app.changePouch(serverResults.user.mostRecentIds.couchConnection);

//    self.get("userPublic").changePouch(data.user.corpuses[0].pouchname);
      // self.get("userPublic").save(); //TODO save this when there is
      // no problem with pouch
//      OPrime.debug(serverResults.user);
      
      OPrime.setCookie("username", serverResults.user.username, 365);
      OPrime.setCookie("token", serverResults.user.hash, 365);
      this.get("confidential").set("secretkey", serverResults.user.hash);
      this.saveAndEncryptUserToLocalStorage();
      if (typeof callbacksave == "function") {
        callbacksave("true"); //tell caller that the user succeeded to authenticate
      }
//    if(window.appView){
//        if(! this.get("userPublic").id){
//          this.get("userPublic").saveAndInterConnectInApp();
//        }else{
//          window.appView.addBackboneDoc(this.get("userPublic").id);
//          window.appView.addPouchDoc(this.get("userPublic").id);
//        }
//      }
    },
    loadEncryptedUser : function(encryptedUserString, callbackload){
      OPrime.debug("loadEncryptedUser");
      

      /*
       * If the encryptedUserString is not set, this triggers a
       * logout which triggers a login of the public user
       */
      if (!encryptedUserString) {
        this.logout();
        return;
      }
      /*
       * If there is currently no token to decrypt this user, log them out.
       */
      if(!OPrime.getCookie("token")){
        this.logout();
        return;
      }
      
      var u = JSON.parse(this.get("confidential").decrypt(encryptedUserString));
      var data = {};
      data.user = u;
      this.saveServerResponseToUser(data, callbackload);
    },
    
    loadPublicUser : function(callbackload){
      var mostRecentPublicUser = localStorage.getItem("mostRecentPublicUser") || OPrime.publicUserStaleDetails();
      mostRecentPublicUser = JSON.parse(mostRecentPublicUser);
      for(var x in mostRecentPublicUser){
        localStorage.setItem(x, mostRecentPublicUser[x]);
      }
      window.location.replace("index.html");
    },
    
    savePublicUserForOfflineUse: function(){
      var mostRecentPublicUser =  {
        token : "",
        encryptedUser : "",
        username : ""
      };
      for(var x in mostRecentPublicUser){
        mostRecentPublicUser[x] = localStorage.getItem(x);
      }
      localStorage.setItem("mostRecentPublicUser", JSON.stringify(mostRecentPublicUser));
    },
    
    saveAndEncryptUserToLocalStorage : function(callbacksaved){
      OPrime.debug("saveAndEncryptUserToLocalStorage");
      var u = this.get("confidential").encrypt(JSON.stringify(this.get("userPrivate").toJSON()));
      localStorage.setItem("encryptedUser", u); 
      if(window.appView){
        window.appView.addSavedDoc(this.get("userPrivate").id);
        window.appView.toastUser("Sucessfully saved user details.","alert-success","Saved!");
      }
      this.get("userPublic").save(null, {
        success : function(model, response) {
          OPrime.debug('User Mask saved ' + model.id);
          if(typeof callbacksaved == "function"){
            callbacksaved();
          }
        },error : function(e,f,g) {
          OPrime.debug(e,f,g);
          OPrime.debug('User Mask save error ' + f.reason);
          if(typeof callbacksaved == "function"){
            callbacksaved();
          }
        }
      });
      
    },
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      this.saveAndEncryptUserToLocalStorage(successcallback);
    },
    /**
     * This function uses the quick authentication view to get the
     * user's password and authenticate them. The authenticate process
     * brings down the user from the server, and also gets their sesson
     * token from couchdb before calling the callback.
     * 
     * @param callback
     */
    syncUserWithServer : function(callback){
      window.appView.authView.showQuickAuthenticateView(null, null, function(){
        //This happens after the user has been authenticated. 
        if(typeof callback == "function"){
          callback();
        }
      });
    },
    fetchListOfUsersGroupedByPermissions : function(successcallback, failcallback){
      var dataToPost = {};
      var authUrl = "";
      if(this.get("userPrivate") != undefined){
        //Send username to limit the requests so only valid users can get a user list
        dataToPost.username = this.get("userPrivate").get("username");
        dataToPost.couchConnection = window.app.get("corpus").get("couchConnection");
        if(!dataToPost.couchConnection.path){
          dataToPost.couchConnection.path ="";
          window.app.get("corpus").get("couchConnection").path = "";
        }
        authUrl = this.get("userPrivate").get("authUrl");
      }else{
        return;
      }
      var self= this;
      $.ajax({
        type : 'POST',
        url : authUrl + "/corpusteam",
        data : dataToPost,
        success : function(serverResults) {
          if (serverResults.userFriendlyErrors != null) {
            try{
              window.appView.toastUser(serverResults.userFriendlyErrors.join("<br/>") 
                  , "alert-warning","Error connecting to populate corpus permissions:");
            }catch(e){
              OPrime.debug(e);
            }
            if (typeof failcallback == "function") {
              failcallback(serverResults.userFriendlyErrors.join("<br/>"));
            }
          } else if (serverResults.users != null) {
            if (typeof successcallback == "function") {
              serverResults.users.timestamp = Date.now();
              localStorage.setItem(dataToPost.pouchname+"Permissions", JSON.stringify(serverResults.users));
              successcallback(serverResults.users); 
            }
          }
        },//end successful fetch
        error: function(e){
          OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying) (or server might have crashed before replying).", e);

          if (typeof failcallback == "function") {
            failcallback("There was an error in contacting the authentication server to get the list of users on your corpus team. Maybe you're offline?");
          }
        },
        dataType  : ""
      }); 
    },
    addCorpusRoleToUser : function(role, userToAddToCorpus, successcallback, failcallback){
      var self = this;
      $("#quick-authenticate-modal").modal("show");
      if( this.get("userPrivate").get("username") == "lingllama" ){
        $("#quick-authenticate-password").val("phoneme");
      }
      window.hub.subscribe("quickAuthenticationClose",function(){
       
        //prepare data and send it
        var dataToPost = {};
        var authUrl = "";
        if(this.get("userPrivate") != undefined){
          //Send username to limit the requests so only valid users can get a user list
          dataToPost.username = this.get("userPrivate").get("username");
          dataToPost.password = $("#quick-authenticate-password").val();
          dataToPost.couchConnection = window.app.get("corpus").get("couchConnection");
          if(!dataToPost.couchConnection.path){
            dataToPost.couchConnection.path ="";
            window.app.get("corpus").get("couchConnection").path = "";
          }
          dataToPost.roles = [role];
          dataToPost.userToAddToRole = userToAddToCorpus.username;
          
          authUrl = this.get("userPrivate").get("authUrl");
        }else{
          return;
        }
        $.ajax({
          type : 'POST',
          url : authUrl + "/addroletouser",
          data : dataToPost,
          success : function(serverResults) {
            if (serverResults.userFriendlyErrors != null) {
              OPrime.debug("User "+userToAddToCorpus.username+" not added to the corpus as "+role);
              if (typeof failcallback == "function") {
                failcallback(serverResults.userFriendlyErrors.join("<br/>"));
              }
            } else if (serverResults.roleadded != null) {
              OPrime.debug("User "+userToAddToCorpus.username+" added to the corpus as "+role);
              if (typeof successcallback == "function") {
                successcallback(userToAddToCorpus); 
              }
            }
          },//end successful fetch
          error: function(e){
            OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying).", e);

            if (typeof failcallback == "function") {
              failcallback("There was an error in contacting the authentication server to add "+userToAddToCorpus.username+" on your corpus team. Maybe you're offline?");
            }
          },
          dataType : ""
        }); 
        //end send call
        
        //Close the modal
        $("#quick-authenticate-modal").modal("hide");
        $("#quick-authenticate-password").val("");
        window.hub.unsubscribe("quickAuthenticationClose", null, this); 
      }, self);
    }
    
  });

  return Authentication;
});

define('comment/Comment', [
    "backbone",
    "user/UserMask"
], function(
    Backbone,
    UserMask
) {
	var Comment = Backbone.Model.extend(
  /** @lends Comment.prototype */
  {
    /**
     * @class Comments allow users to collaborate between each other and take
     *        note of important things, issues to be fixed, etc. These can
     *        appear on datum, sessions corpora, and dataLists. Comments can
     *        also be edited and removed.
     * 
     * @property {String} text Describe text here.
     * @property {Number} username Describe username here.
     * @property {Date} timestamp Describe timestamp here.
     * 
     * @description Initialize function has a timestamp and a username and waits
     *              until text is entered.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      
      var t = JSON.stringify(new Date());
      if(!this.get("timestamp")){
        this.set("timestamp", new Date(JSON.parse(t)));
        this.set("gravatar", window.appView.authView.model.get("userPublic").get("gravatar"));
        this.set("username", window.appView.authView.model.get("userPublic").get("username"));
      }
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      
    },
    defaults : {
      text : "",
      username: ""
    },
    
    // Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    },

    /**
     * The remove function removes a comment.
     */
    remove : function() {
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    },
    /**
     * The edit function allows users to edit a comment.
     * 
     * @param {String}
     *          newtext Takes new text and replaces old one.
     * 
     */
    edit : function(newtext) {
      this.set("text", newtext);
    }
    
  });

  return Comment;
});
define('comment/Comments', [ "backbone",
          "comment/Comment",
          "libs/OPrime"
], function(Backbone, Comment) {
  var Comments = Backbone.Collection.extend(

  /** @lends Comments.prototype  */

  {
    /**
     * @class Comments is a collection of the model Comment. 
     * 
     * @extends Comment.Collection
     * @constructs
     * 
     */
    initialize : function() {
    },
    
    internalModels : Comment,
    model: Comment,
    
    
//    clone : function() {
//        var newCollection = new Comments();
//        
//        for (var i = 0; i < this.length; i++) {
//          newCollection.push(new Comment(this.models[i].toJSON())); 
//        }
//        
//        return newCollection;
//      }
    
  });

  return Comments;
});

define('activity/Activity',[ 
    "backbone",
    "user/UserMask" 
], function(
    Backbone, 
    UserMask
) {
  var Activity = Backbone.Model.extend(
  /** @lends Activity.prototype */
  {
    /**
     * @class The Activity is a record of the user's activity during one
     *        session, i.e. it might say "Edward LingLlama added 30 datums in Na
     *        Dene Corpus" This is so that users can see their history and teams
     *        can view teammate's contributions.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      OPrime.debug("ACTIVITY init: ");

      if(!this.get("user")) {
        this.set("user", window.app.get("authentication").get("userPublic"));
//        if(!this.get("pouchname")) {
//          this.set("pouchname", window.app.get("authentication").get("userPrivate").get("activityCouchConnection").pouchname);
//        }
      }
      if(!this.get("timestamp")){
        this.set("timestamp", Date.now() );
        this.set("dateModified", JSON.stringify(new Date()) );
      }
      if( !this.get("teamOrPersonal")){
         this.set("teamOrPersonal","personal");
      }
//      if(this.isNew()){
//        this.saveAndInterConnectInApp();
//      }
    },
    /**
     * backbone-couchdb adaptor set up
     */
    
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/activities",
    
    defaults : {
//      verbs : [ "added", "modified", "commented", "checked", "tagged", "uploaded" ],
//      verb : "added",
//      directobject : "an entry",
//      indirectobject : "with Consultant-SJ",
//      context : "via Android/ Offline Chrome App" ,
//      link: "https:/www.fieldlinguist.com"
//      timestamp: timestamp
    },
    
    // Internal models: used by the parse function
    model : {
      user : UserMask
    },
    changePouch : function(pouchname, callback) {
      if(!pouchname){
        if( this.get("teamOrPersonal") == "personal"){
          if(this.get("user").get("username") ==  window.app.get("authentication").get("userPublic").get("username")){
            pouchname = window.app.get("authentication").get("userPrivate").get("activityCouchConnection").pouchname;
            this.set("pouchname", pouchname);
          }else{
            alert("Bug in setting the pouch for this activity, i can only save activities from the current logged in user, not other users");
            return;
          }
        }else{
          try{
            pouchname = window.app.get("currentCorpusTeamActivityFeed").get("couchConnection").pouchname;
            this.set("pouchname", pouchname);
          }catch(e){
            alert("Bug in setting the pouch for this activity, i can only save activities for the current corpus team.");
            return;
          }

        }
      }
      
      
      if(OPrime.isCouchApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }
      
      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + pouchname : OPrime.pouchUrl + pouchname);
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     * 
     * - Adds the Activity to the corpus if it is in the right corpus, and wasnt already there
     * - Adds the Activity to the user if it wasn't already there
     * - Adds an activity to the logged in user with diff in what the user changed. 
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(activsuccesscallback, activfailurecallback){
      OPrime.debug("Saving the Activity");
      var self = this;
      if(! this.isNew()){
        OPrime.debug('Activity doesnt need to be saved.');
        if(typeof activsuccesscallback == "function"){
          activsuccesscallback();
        }
        return;
      }
      //save via pouch
      this.changePouch(null, function(){
        self.save(null, {
          success : function(model, response) {
            OPrime.debug('Activity save success');

            if(typeof activsuccesscallback == "function"){
              activsuccesscallback();
            }
          },
          error : function(e) {
            if(typeof activfailurecallback == "function"){
              activfailurecallback();
            }else{
              alert('Activity save error' + e);
            }
          }
        });
      });
      
    }
    
  });
   

  return Activity;
});

define('datum/DatumField',[
    "backbone"
], function(
    Backbone
) {
  var DatumField = Backbone.Model.extend(
  /** @lends DatumField.prototype */
  {
    /**
     * @class The datum fields are the fields in the datum and session models.
     *        They can be freely added and should show up in the datum view
     *        according to frequency.
     * 
     * @property size The size of the datum field refers to the width of the
     *           text area. Some of them, such as the judgment one will be very
     *           short, while others context can be infinitely long.
     * @property label The label that is associated with the field, such as
     *           Utterance, Morphemes, etc.
     * @property value This is what the user will enter when entering data into
     *           the data fields.
     * @property mask This allows users to mask fields for confidentiality.
     * @property shouldBeEncrypted This is whether the field is masked or not.
     * @property help This is a pop up that tells other users how to use the
     *           field the user has created.
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      
    },

    defaults : {
      label : "",
      value : "",
      mask : "",
      encrypted : "",
      shouldBeEncrypted : "",
      help : "Put your team's data entry conventions here (if any)..."
    },
    
    // Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    },
   

    /**
     * Called before set and save, checks the attributes that the
     * user is attempting to set or save. If the user is trying to
     * set a mask on an encrypted datum field that should be encrypted, the only time they can do this is if the data is
     * in tempEncryptedVisible, with decryptedMode on.
     * 
     * @param attributes
     */
    validate: function(attributes) {

//      if(attributes.mask){
//        if(attributes.shouldBeEncrypted != "checked" ){
//          //user can modify the mask, no problem.
//        }else if(attributes.encrypted != "checked" ){
//          //user can modify the mask, no problem.
//        }else if( attributes.encrypted == "checked" &&
////            attributes.tempEncryptedVisible == "checked"  &&
//            attributes.shouldBeEncrypted == "checked" &&
//              window.app.get("corpus").get("confidential").decryptedMode ){
//          //user can modify the mask, no problem.
//        }else if( attributes.mask != this.get("mask") ){
//          return "The datum is presently encrypted, the mask cannot be set by anything other than the model itself.";
//        }
//      }
//      if( attributes.value ){
//        
//        if(this.get("value") && this.get("value").indexOf("confidential") == 0){
//          return "Cannot modify the value of a confidential datum field directly";
//        }
//        
//        if(attributes.shouldBeEncrypted != "checked" ){
//          //user can modify the value, no problem.
//        }else if(attributes.encrypted != "checked" ){
//          //user can modify the value, no problem.
//        }else if( attributes.encrypted == "checked" &&
////            attributes.tempEncryptedVisible == "checked"  &&
//            attributes.shouldBeEncrypted == "checked" &&
//              window.app.get("corpus").get("confidential").decryptedMode ){
//          //the user/app can modify the value, no problem.
//        }else if( attributes.value != this.get("value") ){
//          return "The value cannot be set by anything other than the model itself, from a mask.";
//        }
//      }
    },
    
    /**
     * In the case of the datumfield, if the datum
     * field is not encrypted, then the mask and value are essentially the same.
     * If however the datum is supposed to be encrypted, the value needs to
     * start with confidential, and the mask should be xxxx representign
     * words/morphemes which are allowed to be shown.
     * http://stackoverflow.com/questions/11315844/what-is-the-correct-way-in-backbone-js-to-listen-and-modify-a-model-property
     * 
     * @param key
     * @param value
     * @param options
     * @returns
     */
    set: function(key, value, options) {
      var attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key == null) {
        attributes = key;
        options = value;
      } else {
        attributes = {};
        attributes[key] = value;
      }

      options = options || {};
      // do any other custom property changes here
      
      /*
       * Copy the mask, value and shouldBeEncrypted and encrypted from the object if it is not being set.
       */
      if(attributes.mask == undefined && this.get("mask")){
        attributes.mask = this.get("mask");
      }
      if(attributes.value == undefined && this.get("value")){
        attributes.value = this.get("value");
      }
      if(attributes.shouldBeEncrypted == undefined && this.get("shouldBeEncrypted")){
        attributes.shouldBeEncrypted = this.get("shouldBeEncrypted");
      }
      if(attributes.encrypted == undefined && this.get("encrypted")){
        attributes.encrypted = this.get("encrypted");
      }
      
      if( (attributes.mask && attributes.mask != "") ){
        
        if( attributes.shouldBeEncrypted != "checked" ){
          //Don't do anything special, this field doesnt get encrypted when the data is confidential
          attributes.value = attributes.mask;
        }else if( attributes.encrypted != "checked" ){
          //Don't do anything special, this datum isn't confidential
          attributes.value = attributes.mask;
          
          
        /*
         * A, B, C, D: If we are supposed to be encrypted, and we are encrypted, but we want to let the user see the data to change it.
         * 
         */
        }else if( window.app.get("corpus").get("confidential").decryptedMode ){

          /*
           * A: If it wasn't encrypted, encrypt the value, and leave the mask as the original value for now,
           * can happen when the user clicks on the lock button for the first time. 
           */
          if( attributes.mask.indexOf("confidential:") != 0 && window.appView ){
//          attributes.mask = attributes.mask;//leave mask open
            //save the mask encrpyted as the new value, this is triggered when the user modifies the data 
            attributes.value = window.app.get("corpus").get("confidential").encrypt(attributes.mask);
          /*
           * B: A strange case which is used by the Datum Save function, to trigger the mask into the xxx version of the current value that it will be saved in the data base with xxx.
           */
          }else if( attributes.mask.indexOf("confidential:") == 0 && window.appView ){
            attributes.mask = this.mask(window.app.get("corpus").get("confidential").decrypt(this.get("value")));
            attributes.value = this.get("value"); //don't let the user modify the value.
          }

          /*
           * C & D: this should never be called since the value is supposed to come from the mask only.
           */

          /*
           * C: If the value wasn't encrypted, encrypt the value, and leave the mask as the original value since we are in decryptedMode
           */
          if( attributes.value && attributes.value.indexOf("confidential") != 0 && window.appView ){
//          attributes.mask = attributes.mask;//leave mask open
            attributes.value = window.app.get("corpus").get("confidential").encrypt(attributes.mask);
          /*
           * D: If the value was encrypted, there is some sort of bug, leave the value as it was, decrypt it and put it in to the mask since we are in decryptedMode
           */
          }else if( attributes.value && attributes.value.indexOf("confidential") == 0 && window.appView ){
            // If it was encrypted, turn the mask into the decrypted version of the current value so the user can see it.
            //this might get called at the same time as the first mask if above
            attributes.mask = window.app.get("corpus").get("confidential").decrypt(this.get("value"));
            attributes.value = this.get("value"); //don't let the user modify the value.
          }

          /*
           * E, F, G, H: If we are supposed to be encrypted and we are encrypted, but we are not in decrypted mode.
           */
        }else {

          //Don't let the user take off encryption if they are not in decryptedMode
          if( this.get("encrypted") == "checked" ){
            if( true && attributes.encrypted != "checked" && !window.app.get("corpus").get("confidential").decryptedMode ){
              attributes.encrypted = "checked";
            }
          }
          
          /*
           * E: A strange case which is used by the Datum Save function, to trigger the mask into the xxx version of the current value that it will be saved in the data base with xxx.
           *  (Same as B above)
           */
          if( attributes.mask && attributes.mask.indexOf("confidential") == 0 && window.appView ){
            attributes.mask = this.mask(window.app.get("corpus").get("confidential").decrypt(this.get("value")));
            attributes.value = this.get("value"); //don't let the user modify the value.
          /*
           * F: If the value is encrypted, then the mask is probably set, don't let the user change anything since they shouldn't be able to see the data anyway.s
           */
          }else{
            //Don't let user change value of confidential or mask: see validate function
            attributes.mask = this.get("mask");
            attributes.value = this.get("value");
          }
          
          /*
           * G: If the data is not encrypted, encrypt it and mask it in the mask. This might be called the first time a user clicks on the lock to first encrypts the value.
           * (Similar to C above, except that we mask the mask)
           */
          if( attributes.value && attributes.value.indexOf("confidential") != 0 && window.appView ){
            attributes.mask = this.mask(this.get("value"));//use value to make mask
            attributes.value = window.app.get("corpus").get("confidential").encrypt(this.get("value"));
          /*
           * H: If the value is encrypted, then the mask is probably set, don't let the user change anything since they shouldn't be able to see the data anyway.s
           */
          }else{
            //Don't let user change value of confidential or mask: see validate function
            attributes.mask = this.get("mask");
            attributes.value = this.get("value");
          }
        }
      }else{
//        alert("The datum field has no mask, there is a bug somewhere.");
//        attributes.value ="";
//        attributes.mask = "";
      }
      return Backbone.Model.prototype.set.call( this, attributes, options ); 
    },
    mask : function(stringToMask){
      return stringToMask.replace(/[A-Za-z]/g, "x");
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return DatumField;
});

define('datum/DatumFields',[ 
         "backbone", 
         "datum/DatumField",
         "libs/OPrime"
], function(
         Backbone,
         DatumField) {
  var DatumFields = Backbone.Collection.extend(
  /** @lends DatumFields.prototype */
  {
    /**
     * @class Collection of Datum Field
     * 
     * @description The initialize function 
     * 
     * @extends Backbone.Collection
     * @constructs
     */
    initialize : function() {
    },
    internalModels : DatumField,
    model : DatumField,
    
    /** 
     * Gets a copy DatumFields containing new (not references) DatumFields objects
     * containing the same attributes.
     * 
     * @return The cloned DatumFields.
     */
    clone : function() {
      var newCollection = new DatumFields();
      
      for (var i = 0; i < this.length; i++) {
        newCollection.push(new DatumField(this.models[i].toJSON())); 
      }
      
      return newCollection;
    }

  });

  return DatumFields;
});
define('datum/DatumState',[ 
    "backbone", 
    "user/UserMask" 
], function(
    Backbone,
    UserMask
) {
  var DatumState = Backbone.Model.extend(
  /** @lends DatumState.prototype */
  {
    /**
     * @class The datum state lets the fieldlinguists assign their own state
     *        categories to data (ie check with consultant, check with x,
     *        checked, checked and wrong, hidden, deleted), whatever state they
     *        decide. They an make each state have a color so that the team can
     *        see quickly if there is something that needs to be done with that
     *        data. We also added an optional field, Consultant that they can use
     *        to say who they want to check with in case they have mulitple
     *        consultants and the consultants have different grammaticality
     *        judgements. When users change the state of the datum, we will add
     *        a note in the datum's comments field so that the history of its
     *        state is kept in an annotated format.
     * 
     * @description The initialize function The datum state creates a new state
     *              object with the state set to the default (for example,
     *              checked)
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
    },
    
    defaults : {
//      state : "Checked",
      color : "",
//      consultant : UserMask,//TODO comment out htis line when we confirm that state is working
      showInSearchResults : "checked",
      selected : ""
    },
    
    // Internal models: used by the parse function
    internalModels : {
      consultant : UserMask
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return DatumState;
});
define('datum/DatumStates',[ 
    "backbone", 
    "datum/DatumState"
], function(
    Backbone,
    DatumState
) {
  var DatumStates = Backbone.Collection.extend(
  /** @lends DatumStates.prototype */
  {
    /**
     * @class Collection of Datum State
     * 
     * @description The initialize function 
     * 
     * @extends Backbone.Collection
     * @constructs
     */
    initialize : function() {
    },
    internalModels : DatumState,

    model : DatumState,
    
    /** 
     * Gets a copy DatumStates containing new (not references) DatumStates objects
     * containing the same attributes.
     * 
     * @return The cloned DatumFields.
     */
    clone : function() {
      var newCollection = new DatumStates();
      
      for (var i = 0; i < this.length; i++) {
        newCollection.push(new DatumState(this.models[i].toJSON())); 
      }
      
      return newCollection;
    }
  });

  return DatumStates;
});
define('audio_video/AudioVideo',[ 
    "backbone" 
], function(
    Backbone
) {
  var AudioVideo = Backbone.Model.extend(
  /** @lends AudioVideo.prototype */
  {
    /**
     * @class AudioVideo models allows a user to add audio and video files.
     * 
     * @description Initialize function
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     */
    initialize : function() {
    },
    
    defaults : {
      URL : "",
//      filename : "",
      type: "audio" //or video
    },
    
    // Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return AudioVideo;
});
define('datum/Datums',[
    "backbone",
    "datum/Datum"
], function(
    Backbone, 
    Datum
) {
    var Datums = Backbone.Collection.extend(
    /** @lends Datums.prototype */
    {
       /**
        * @class A collection of Datums.
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
         this.model = Datum;
       },
       /**
        * backbone-couchdb adaptor set up
        */
       db : {
         view : "datums",
         changes : false,
         filter : Backbone.couch_connector.config.ddoc_name + "/datums"
       },
       // The couchdb-connector is capable of mapping the url scheme
       // proposed by the authors of Backbone to documents in your database,
       // so that you don't have to change existing apps when you switch the sync-strategy
       url : "/datums",
       // The messages should be ordered by date
//       comparator : function(doc){
//         return doc.get("timestamp");
//       },
       
       internalModels : Datum,

       model: Datum,

       fetchDatums : function(suces, fail){
         this.fetch({
           error : function(model, xhr, options) {
             OPrime.debug("There was an error loading your datums.");
             console.log(model,xhr,options);
             OPrime.bug("There was an error loading your datums.");
             if(typeof fail == "function"){
               fail();
             }
           },
           success : function(model, response, options) {
             console.log("Datums fetched ", model,response,options);
             if (response.length == 0) {
               OPrime.bug("You have no datums");
             }
             if(typeof suces == "function"){
               suces();
             }
           }
         });
       }
    });
    
    return Datums;
});
define('datum/DatumTag', [
    "backbone"
], function(
    Backbone
) {
  var DatumTag = Backbone.Model.extend(
  /** @lends DatumTag.prototype */
  {
    /**
     * @class The DatumTag allows the user to label data with grammatical tags
     *        i.e. passive, causative. This is useful for searches.
     * 
     * @description The initialize function brings up a field in which the user
     *              can enter tags.
     * @constructs
     */
    initialize : function() {
    },
    
    // Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return DatumTag;
});

define('datum/DatumTags',[
    "backbone",
    "datum/DatumTag"
], function(
    Backbone, 
    DatumTag
) {
  var DatumTags = Backbone.Collection.extend(
  /** @lends Datums.prototype */
  {
    /**
     * @class A collection of Datum tags
     *
     * @extends Backbone.Collection
     * @constructs
     */
    initialize: function() {
    },
    internalModels : DatumTag,

    model: DatumTag
  });
  
  return DatumTags;
});
define('user/Consultant', [ 
    "backbone", 
    "user/UserMask" 
], function(
    Backbone,
    UserMask
) {
  var Consultant = UserMask.extend(
  /** @lends Consultant.prototype */
  {
    /**
     * @class A consultant is a type of user. It has the same information as a user plus extra,
     * but we want some info (e.g. first & last name, date of birth) to be kept confidential. Consultant's gravatar should 
     * be locked to default unless he/she wants to be public. 
     * It also has permissions about the level of access to the data (read only, add/edit). 
     * 
     *  
     * @property {String} consultantcode This is to keep the confidentiality of the consultant (like a participant code in a survey). 
     * @property {String} birthDate This is consultant's date of birth, to be kept confidential
     * @property {String} language This is consultant's language 
     * @property {String} dialect This is consultant's dialect 
     * 
     * @description The initialize function probably checks to see if the user is existing and create a new account if it is new. 
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function(attributes) {
      Consultant.__super__.initialize.call(this, attributes);

      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    
    fillWithDefaults : function(){
      this.set("consultantcode" , "");
//      this.set("birthDate", "");
      this.set("language", "");
      this.set("dialect", "");
    },
    
    internalModels : {
      // There are no nested models
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return Consultant;
}); 




define('user/Team',[
    "backbone",
    "hotkey/HotKey",
    "user/UserGeneric",
    "permission/Permission",
    "user/UserPreference",
    "libs/OPrime"
], function(
    Backbone, 
    HotKey,
    UserGeneric,
    Permission,
    UserPreference
) {
  var Team = UserGeneric.extend(
  /** @lends Team.prototype */
  {
    /**
     * @class Team extends from UserGeneric. It inherits the same attributes as UserGeneric but can 
     * login. 
     * 
     * @description The initialize function probably checks to see if the user is existing or new and creates a new account if it is new. 
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function(attributes) {
      UserGeneric.__super__.initialize.call(this, attributes);
      
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
      this.bind("change", this.checkPrefsChanged, this);
    },
    fillWithDefaults : function(){
      // If there is no prefs, create a new one
      if (!this.get("prefs")) {
        this.set("prefs", new UserPreference());
      }
      
      // If there is no permissions, create a new one
      if (!this.permissions) {
        this.permissions = new Permissions();
      }
      
      // If there is no hotkeys, create a new one
      if (!this.get("hotkeys")) {
        this.set("hotkeys", new HotKey());//TODO this needs to become plural
      }
    },
    defaults : {
      // Defaults from UserGeneric
      username : "",
      password : "",
      email : "",
      gravatar : "user/user_gravatar.png",
      researchInterest : "",
      affiliation : "",
      description : "",
      subtitle : "",
      corpuses : [],
      dataLists : [],
      mostRecentIds : {},
      // Defaults from User
      firstname : "",
      lastname : "",
      teams : [],
      sessionHistory : []
    },

    /**
     * The subtitle function returns user's first and last names. 
     */
    subtitle: function () {
      if (this.get("firstname") == undefined) {
        this.set("firstname","");
      }
      
      if (this.get("lastname") == undefined) {
        this.set("lastname","");
      }
      
      return this.get("firstname") + " " + this.get("lastname");
    },
    checkPrefsChanged : function(){
      try{
        window.appView.userPreferenceView.model = this.get("prefs");
        window.appView.userPreferenceView.render();
      }catch(e){
        
      }
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return Team;
});
define('datum/Session',[
    "backbone",
    "comment/Comment",
    "comment/Comments",
    "datum/DatumField",
    "datum/DatumFields",
    "user/Consultant",
    "user/Team",
    "user/User",
], function(
    Backbone,
    Comment,
    Comments,
    DatumField,
    DatumFields,
    Consultant,
    Team,
    User
) {
  var Session = Backbone.Model.extend(
  /** @lends Session.prototype */
  {
    /**
     * @class The Session widget is the place where information which is generally 
     * shared by many datum (due to being part of an elicitiation session)
     * @property {Number} sessionID The session ID is an automatically generated
     *           number which will uniquely identify the session.
     * @property {String} user The user is the person inputting the data for
     *           that session.
     * @property {String} team The team is the team that the user belongs to.
     * @property {String} consultant The consultant is the native speaker of the
     *           language under investigation that has verified the data in the
     *           session.
     * @property {String} language The language is the language under
     *           investigation in the particular session.
     * @property {String} languageFamily The language family is an attribute
     *           which users can use to group languages.
     * @property {String} dialect The dialect specifies the dialect of the
     *           language under investigation.
     * @property {String} date The date is the date that the data was elicited.
     * @property {String} goal The goal is the particular linguistic goal that
     *           the researcher was pursuing during that session.
     * 
     *  new DatumField({
            label : "user",
            shouldBeEncrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "consultants",
            shouldBeEncrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "language",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This is the langauge (or language family) if you would like to use it."
          }),
          new DatumField({
            label : "dialect",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "You can use this field to be as precise as you would like about the dialect of this session."
          }),
          new DatumField({
            label : "dateElicited",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This is the date in which the session took place."
          }),
          new DatumField({
            label : "dateSEntered",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This is the date in which the session was entered."
          }),
          new DatumField({
            label : "goal",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "This describes the goals of the session."
          }),  
     * 
     * 
     * 
     * @description The initialize function brings up a page in which the user
     *              can fill out the details corresponding to the session. These
     *              details will be linked to each datum submitted in the
     *              session.
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function() {
      OPrime.debug("SESSION init");
      
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      // If there are no comments, give it a new one
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      if(!this.get("sessionFields") || this.get("sessionFields").length == 0){
        if(window.app && window.app.get("corpus") && window.app.get("corpus").get("sessionFields")){
          this.set("sessionFields", window.app.get("corpus").get("sessionFields").clone());
        }else{
          OPrime.debug("Not creating sessions fields");
        }
      }
      this.get("sessionFields").where({label: "user"})[0].set("mask", app.get("authentication").get("userPrivate").get("username") );
      this.get("sessionFields").where({label: "consultants"})[0].set("mask", "XY");
      this.get("sessionFields").where({label: "goal"})[0].set("mask", "Change this session goal to the describe your first elicitiation session.");
      this.get("sessionFields").where({label: "dateSEntered"})[0].set("mask", new Date());
      this.get("sessionFields").where({label: "dateElicited"})[0].set("mask", "Change this to a time period or date for example: Spring 2013 or Day 2 Ling 489 or Nov 23 2012.");
      
    },
    /**
     * backbone-couchdb adaptor set up
     */
    
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/sessions",
    
    // Internal models: used by the parse function
    internalModels : {
      sessionFields : DatumFields,
      comments : Comments
    },
    
  //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function(commentstring) {
      var m = new Comment({
        "text" : commentstring,
     });
      
      this.get("comments").add(m);
      window.appView.addUnsavedDoc(this.id);
      
      var goal = this.get("sessionFields").where({label: "goal"})[0].get("mask");
      
      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-calendar'></i> "+goal+"</a>",
            teamOrPersonal : "team",
            context : " via Offline App."
          });
      
      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-calendar'></i> "+goal+"</a>",
            teamOrPersonal : "personal",
            context : " via Offline App."
          });
    },
    changePouch : function(pouchname, callback) {
      if(!pouchname){
        pouchname = this.get("pouchname");
      }
      if(OPrime.isCouchApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }
      
      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + pouchname : OPrime.pouchUrl + pouchname);
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     * 
     * - Adds the session to the corpus if it is in the right corpus, and wasnt already there
     * - Adds the session to the user if it wasn't already there
     * - Adds an activity to the logged in user with diff in what the user changed. 
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      OPrime.debug("Saving the Session");
      var self = this;
      var newModel = true;
      if(this.id){
        newModel = false;
      }else{
        this.set("dateCreated",JSON.stringify(new Date()));
      }
      //protect against users moving sessions from one corpus to another on purpose or accidentially
      if(window.app.get("corpus").get("pouchname") != this.get("pouchname")){
        if(typeof failurecallback == "function"){
          failurecallback();
        }else{
          alert('Session save error. I cant save this session in this corpus, it belongs to another corpus. ' );
        }
        return;
      }
      var oldrev = this.get("_rev");
      this.set("dateModified", JSON.stringify(new Date()));
      this.set("timestamp", Date.now());
      this.changePouch(null,function(){
        self.save(null, {
          success : function(model, response) {
            OPrime.debug('Session save success');
            var goal = model.get("sessionFields").where({label: "goal"})[0].get("mask");
            var differences = "#diff/oldrev/"+oldrev+"/newrev/"+response._rev;
            //TODO add privacy for session goals in corpus
//            if(window.app.get("corpus").get("keepSessionDetailsPrivate")){
//              goal = "";
//              differences = "";
//            }
            if(window.appView){
              window.appView.toastUser("Sucessfully saved session: "+ goal,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "updated";
            verbicon = "icon-pencil";
            if(newModel){
              verb = "added";
              verbicon = "icon-plus";
            }
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-calendar",
                  directobject : "<a href='#session/"+model.id+"'>"+goal+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "team",
                  context : " via Offline App."
                });
            
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-calendar",
                  directobject : "<a href='#session/"+model.id+"'>"+goal+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "personal",
                  context : " via Offline App."
                });
            
            /*
             * make sure the session is visible in this corpus
             */
            var previousversionincorpus = window.app.get("corpus").sessions.get(model.id);
            if( previousversionincorpus == undefined ){
              window.app.get("corpus").sessions.unshift(model);
            }else{
                window.app.get("corpus").sessions.remove(previousversionincorpus);
                window.app.get("corpus").sessions.unshift(model);
            }
              window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = model.id;
            //make sure the session is in the history of the user
            if(window.app.get("authentication").get("userPrivate").get("sessionHistory").indexOf(model.id) == -1){
              window.app.get("authentication").get("userPrivate").get("sessionHistory").unshift(model.id);
            }
//            window.appView.addUnsavedDoc(window.app.get("authentication").get("userPrivate").id);
            window.app.get("authentication").saveAndInterConnectInApp();

            if(typeof successcallback == "function"){
              successcallback();
            }
          },
          error : function(e, f, g) {
            OPrime.debug("Session save error", e, f, g);
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('Session save error: ' + f.reason);
            }
          }
        });
      });
    },
    /**
     * Accepts two functions success will be called if sucessfull,
     * otherwise it will attempt to render the current session views. If
     * the session isn't in the current corpus it will call the fail
     * callback or it will alert a bug to the user. Override the fail
     * callback if you don't want the alert.
     * 
     * @param successcallback
     * @param failurecallback
     */
    setAsCurrentSession : function(successcallback, failurecallback){
      if( window.app.get("corpus").get("pouchname") != this.get("pouchname") ){
        if (typeof failurecallback == "function") {
          failurecallback();
        }else{
          alert("This is a bug, cannot load the session you asked for, it is not in this corpus.");
        }
        return;
      }else{
        if (window.app.get("currentSession").id != this.id ) {
          window.app.set("currentSession", this); //This results in a non-identical session in the currentsession with the one live in the corpus sessions collection.
//          window.app.set("currentSession", app.get("corpus").sessions.get(this.id)); //this is a bad idea too, use above instead

        }
        window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = this.id;
        window.app.get("authentication").saveAndInterConnectInApp(); //saving users is cheep

        if(window.appView) {
          window.appView.setUpAndAssociateViewsAndModelsWithCurrentSession(function() {
            if (typeof successcallback == "function") {
              successcallback();
            }else{
              window.appView.currentSessionReadView.format = "leftSide";
              window.appView.currentSessionReadView.render();
              window.appView.toastUser("Sucessfully connected all views up to session: "+ this.id, "alert-success", "Connected!");
//            window.appView.renderEditableSessionViews("leftSide");
//            window.appView.renderReadonlySessionViews("leftSide");
            }
          });
        }else{
          if (typeof successcallback == "function") {
            successcallback();
          }
        }
      }
    },
    /**
     * Validation functions will verify that the session ID is unique and
     * that the consultant,users, and teams are all correspond to people in
     * the system.
     * 
     * @param {Object}
     *          attributes The set of attributes to validate.
     * 
     * @returns {String} The validation error, if there is one. Otherwise,
     *          doesn't return anything.
     */
    validate: function(attributes) {
      // TODO Validation on the attributes. Returning a String counts as an error.
      // We do need to validate some of these attributes, but not sure how they would work. I think they need for loops.
      
        //for (user not in users) {
      //    return "user must be in the system.";
      // }
       //for (team not in teams) {
      //    return "team must be in the system.";
      // }
       //if (consultant not in consultants ) {
      //    return "consultant must be in the system.";
      // }
    }
  });
  return Session;
});
define('datum/Datum',[ 
    "backbone",
    "audio_video/AudioVideo", 
    "comment/Comment",
    "comment/Comments",
    "datum/Datums", 
    "datum/DatumField", 
    "datum/DatumFields", 
    "datum/DatumState", 
    "datum/DatumStates",
    "datum/DatumTag",
    "datum/DatumTags",
    "datum/Session",
    "libs/OPrime"
], function(
    Backbone, 
    AudioVideo, 
    Comment,
    Comments,
    Datums,
    DatumField, 
    DatumFields,
    DatumState, 
    DatumStates,
    DatumTag,
    DatumTags,
    Session
) {
  var Datum = Backbone.Model.extend(
  /** @lends Datum.prototype */
  {
    /**
     * @class The Datum widget is the place where all linguistic data is
     *        entered; one at a time.
     * 
     * @property {DatumField} utterance The utterance field generally
     *           corresponds to the first line in linguistic examples that can
     *           either be written in the language's orthography or a
     *           romanization of the language. An additional field can be added
     *           if the language has a non-roman script.
     * @property {DatumField} gloss The gloss field corresponds to the gloss
     *           line in linguistic examples where the morphological details of
     *           the words are displayed.
     * @property {DatumField} translation The translation field corresponds to
     *           the third line in linguistic examples where in general an
     *           English translation. An additional field can be added if
     *           translations into other languages is needed.
     * @property {DatumField} judgement The judgement is the grammaticality
     *           judgement associated with the datum, so grammatical,
     *           ungrammatical, felicitous, unfelicitous etc.
     * @property {AudioVisual} audioVideo Datums can be associated with an audio or video
     *           file.
     * @property {Session} session The session provides details about the set of
     *           data elicited. The session will contain details such as date,
     *           language, consultant etc.
     * @property {Comments} comments The comments is a collection of comments
     *           associated with the datum, this is meant for comments like on a
     *           blog, not necessarily notes, which can be encoded in a
     *           field.(Use Case: team discussing a particular datum)
     * @property {DatumTags} datumtags The datum tags are a collection of tags
     *           associated with the datum. These are made completely by the
     *           user.They are like blog tags, a way for the user to make
     *           categories without make a hierarchical structure, and make
     *           datum easier for search.
     * @property {Date} dateEntered The date the Datum was first saved.
     * @property {Date} dateModified The date the Datum was last saved.
     * 
     * @description The initialize function brings up the datum widget in small
     *              view with one set of datum fields. However, the datum widget
     *              can contain more than datum field set and can also be viewed
     *              in full screen mode.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      // Initially, the first datumState is selected
//      if (this.get("datumStates") && (this.get("datumStates").models.length > 0)) {
//        this.get("datumStates").models[0].set("selected", "selected");
//      }
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
   // If there's no audioVideo, give it a new one.
      if (!this.get("audioVideo")) {
        this.set("audioVideo", new AudioVideo());
      }
      
      // If there are no comments, give it a new one
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      
      // If there are no datumTags, give it a new one
      if (!this.get("datumTags")) {
        this.set("datumTags", new DatumTags());
      }
      
      if(!this.get("datumFields") || this.get("datumFields").length == 0){
        this.set("datumFields", window.app.get("corpus").get("datumFields").clone());
      }
    },
    /**
     * backbone-couchdb adaptor set up
     */
    
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/datums",
    
    
    // Internal models: used by the parse function
    internalModels : {
      datumFields : DatumFields,
      audioVideo : AudioVideo,
      session : Session,
      comments : Comments,
      datumStates : DatumStates,
      datumTags : DatumTags
    },

    changePouch : function(pouchname, callback) {
      if(!pouchname){
        pouchname = this.get("pouchname");
        if(pouchname == undefined){
          pouchname = window.app.get("corpus").get("pouchname");
        }
      }
      
      if(OPrime.isCouchApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }
      if (this.pouch == undefined) {
        this.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + pouchname : OPrime.pouchUrl + pouchname);
      }
      if (typeof callback == "function") {
        callback();
      }
    },
    
    /**
     * Gets all the DatumIds in the current Corpus sorted by their date.
     * 
     * @param {Function} callback A function that expects a single parameter. That
     * parameter is the result of calling "pages/by_date". So it is an array
     * of objects. Each object has a 'key' and a 'value' attribute. The 'key'
     * attribute contains the Datum's dateModified and the 'value' attribute contains
     * the Datum itself.
     */
    getMostRecentIdsByDate : function(callback) {
      var self = this;
      
      if(OPrime.isCouchApp()){
        //TODO this might be producing the error on line  815 in backbone.js       model = new this.model(attrs, options);
        var tempDatums = new Datums();
        tempDatums.model = Datum;
        tempDatums.fetch({
          limit: 2,
          error : function(model, xhr, options) {
            OPrime.bug("There was an error loading your datums.");
            if(typeof callback == "function"){
              callback([]);
            }
          },
          success : function(model, response, options) {
//            if (response.length >= 1) {
//              callback([response[0]._id], [response[1]._id]);
              callback(response);
//            }
          }
        });
        return;
      }
      
      
      try{
        this.changePouch(this.get("pouchname"),function(){
          self.pouch(function(err, db) {
            db.query("pages/by_date", {reduce: false}, function(err, response) {
              
              if(err){
                if(window.toldSearchtomakebydateviews){
                  OPrime.debug("Told pouch to make by date views once, apparently it didnt work. Stopping it from looping.");
                  return;
                }
                /*
                 * Its possible that the pouch has no by date views, create them and then try searching again.
                 */
                window.toldSearchtomakebydateviews = true;
                window.app.get("corpus").createPouchView("pages/by_date", function(){
                  window.appView.toastUser("Initializing your corpus' sort items by date functions for the first time.","alert-success","Sort:");
                  self.getMostRecentIdsByDate(callback);
                });
                return;
              }
              
              if ((!err) && (typeof callback == "function"))  {
                OPrime.debug("Callback with: ", response.rows);
                callback(response.rows);
              }
            });
          });
        });
        
      }catch(e){
//        appView.datumsEditView.newDatum();
        appView.datumsEditView.render();
        alert("Couldnt show the most recent datums "+JSON.stringify(e));
        
      }
    },
    
    searchByQueryString : function(queryString, callback) {
      var self = this;
      try{
        //http://support.google.com/analytics/bin/answer.py?hl=en&answer=1012264
        window.pageTracker._trackPageview('/search_results.php?q='+queryString); 
      }catch(e){
        OPrime.debug("Search Analytics not working.");
      }
      
      // Process the given query string into tokens
      var queryTokens = self.processQueryString(queryString);
      var doGrossKeywordMatch = false;
      if(queryString.indexOf(":") == -1){
        doGrossKeywordMatch = true;
        queryString = queryString.toLowerCase().replace(/\s/g,"");
      }
      
      if(OPrime.isCouchApp()){

      // run a custom map reduce
//        var mapFunction = function(doc) {
//          if(doc.collection != "datums"){
//            return;
//          }
//          var fields  = doc.datumFields;
//          var result = {};
//          for(var f in fields){
//            if(fields[f].label == "gloss"){
//              result.gloss = fields[f].value;
//            }else if(fields[f].label == "morphemes"){
//              result.morphemes = fields[f].value;
//            }else if(fields[f].label == "judgement"){
//              result.judgement = fields[f].value;
//            }
//          }
//          emit( result,  doc._id );
//        };
//        $.couch.db(this.get("pouchname")).query(mapFunction, "_count", "javascript", {
        //use the get_datum_fields view
        $.couch.db(this.get("pouchname")).view("pages/get_datum_fields", {
          success: function(response) {
            OPrime.debug("Got "+response.length+ "datums to check for the search query locally client side.");
            var matchIds = [];
//            console.log(response);
            for (i in response.rows) {
              var thisDatumIsIn = self.isThisMapReduceResultInTheSearchResults(response.rows[i], queryString, doGrossKeywordMatch, queryTokens);
              // If the row's datum matches the given query string
              if (thisDatumIsIn) {
                // Keep its datum's ID, which is the value
                matchIds.push(response.rows[i].value);
              }
            }
            
            if(typeof callback == "function"){
              //callback with the unique members of the array
              callback(_.unique(matchIds));
//              callback(matchIds); //loosing my this in SearchEditView
            }
          },
          error: function(status) {
            console.log("Error quering datum",status);
          },
          reduce: false
        });

        return;
      }
        
      
      
      try{
        this.changePouch(this.get("pouchname"), function() {
          self.pouch(function(err, db) {
            db.query("pages/get_datum_fields", {reduce: false}, function(err, response) {
              var matchIds = [];
              
              if (!err) {
               
                // Go through all the rows of results
                for (i in response.rows) {
                  var thisDatumIsIn = self.isThisMapReduceResultInTheSearchResults(response.rows[i], queryString, doGrossKeywordMatch, queryTokens);
                  // If the row's datum matches the given query string
                  if (thisDatumIsIn) {
                    // Keep its datum's ID, which is the value
                    matchIds.push(response.rows[i].value);
                  }
                }
              }else{
                if(window.toldSearchtomakeviews){
                  OPrime.debug("Told search to make views once, apparently it didnt work. Stopping it from looping.");
                  return;
                }
                /*
                 * Its possible that the corpus has no search views, create them and then try searching again.
                 */
                window.appView.toastUser("Initializing your search functions for the first time." +
                		" Search in LingSync is pretty powerful, " +
                		" in fact if you're the power user type you can write your " +
                		"own data extracting/filtering/visualization queries using " +
                		" <a href='http://www.kchodorow.com/blog/2010/03/15/mapreduce-the-fanfiction/' target='_blank'>MapReduce.</a>","alert-success","Search:");
                window.toldSearchtomakeviews = true;
                var previousquery = queryString;
                window.app.get("corpus").createPouchView("pages/get_datum_fields", function(){
                  window.appView.searchEditView.search(previousquery);
                });
              }
              if(typeof callback == "function"){
                //callback with the unique members of the array
                callback(_.unique(matchIds));
//                callback(matchIds); //loosing my this in SearchEditView
              }
            });
          });
        });
      }catch(e){
        alert("Couldnt search the data, if you sync with the server you might get the most recent search index.");
      }
    },
    isThisMapReduceResultInTheSearchResults : function(keyValuePair, queryString, doGrossKeywordMatch, queryTokens){
      
      
      var thisDatumIsIn = false;
      // If the query string is null, include all datumIds
      if(queryString.trim() == ""){
        thisDatumIsIn = true;
      }else if(doGrossKeywordMatch){
          if(JSON.stringify(keyValuePair.key).toLowerCase().replace(/\s/g,"").indexOf(queryString) > -1){
            thisDatumIsIn = true;
          }
      }else{
        
        // Determine if this datum matches the first search criteria
        thisDatumIsIn = this.matchesSingleCriteria(keyValuePair.key, queryTokens[0]);
        
        // Progressively determine whether the datum still matches based on
        // subsequent search criteria
        for (var j = 1; j < queryTokens.length; j += 2) {
          if (queryTokens[j] == "AND") {
            // Short circuit: if it's already false then it continues to be false
            if (!thisDatumIsIn) {
              break;
            }
            
            // Do an intersection
            thisDatumIsIn = thisDatumIsIn && this.matchesSingleCriteria(keyValuePair.key, queryTokens[j+1]);
          } else {
            // Do a union
            thisDatumIsIn = thisDatumIsIn || this.matchesSingleCriteria(keyValuePair.key, queryTokens[j+1]);
          }
        }
      }
      return thisDatumIsIn;
      
    },
    /**
     * Determines whether the given object to search through matches the given
     * search criteria.
     * 
     * @param {Object} objectToSearchThrough An object representing a datum that
     * contains (key, value) pairs where the key is the datum field label and the
     * value is the datum field value of that attribute.
     * @param {String} criteria The single search criteria in the form of a string
     * made up of a label followed by a colon followed by the value that we wish
     * to match.
     * 
     * @return {Boolean} True if the given object matches the given criteria.
     * False otherwise.
     */
    matchesSingleCriteria : function(objectToSearchThrough, criteria) {
      var delimiterIndex = criteria.indexOf(":");
      var label = criteria.substring(0, delimiterIndex);
      var value = criteria.substring(delimiterIndex + 1);
      /* handle the fact that "" means grammatical, so if user asks for  specifically, give only the ones wiht empty judgemnt */
      if(label == "judgement" && value.toLowerCase() == "grammatical"){
        if(!objectToSearchThrough[label]){
          return true;
        }
      }
//      if(!label || !value){
//        return false;
//      }
      return objectToSearchThrough[label] && (objectToSearchThrough[label].toLowerCase().indexOf(value.toLowerCase()) >= 0);
    },
    
    /**
     * Process the given string into an array of tokens where each token is
     * either a search criteria or an operator (AND or OR). Also makes each
     * search criteria token lowercase, so that searches will be case-
     * insensitive.
     * 
     * @param {String} queryString The string to tokenize.
     * 
     * @return {String} The tokenized string
     */
    processQueryString : function(queryString) {      
      // Split on spaces
      var queryArray = queryString.split(" ");
      
      // Create an array of tokens out of the query string where each token is
      // either a search criteria or an operator (AND or OR).
      var queryTokens = [];
      var currentString = "";
      for (i in queryArray) {
        var currentItem = queryArray[i].trim();
        if (currentItem.length <= 0) {
          break;
        } else if ((currentItem == "AND") || (currentItem == "OR")) {
          queryTokens.push(currentString);
          queryTokens.push(currentItem);
          currentString = "";
        } else if (currentString) {
          /* toLowerCase introduces a bug in search where camel case fields loose their capitals, then cant be matched with fields in the map reduce results */
          currentString = currentString + " " + currentItem;//.toLowerCase();  
        } else {
          currentString = currentItem;//.toLowerCase();
        }
      }
      queryTokens.push(currentString);
      
      return queryTokens;
    },
    
    /**
     * Clone the current Datum and return the clone. The clone is put in the current
     * Session, regardless of the origin Datum's Session. //TODO it doesn tlook liek this is the case below:
     * 
     * @return The clone of the current Datum.
     */
    clone : function() {
      // Create a new Datum based on the current Datum
      var datum = new Datum({
        audioVideo : new AudioVideo(this.get("audioVideo").toJSON(), {parse: true}),
        comments : new Comments(this.get("comments").toJSON(), {parse: true}),
        dateEntered : this.get("dateEntered"),
        dateModified : this.get("dateModified"),
        datumFields : new DatumFields(this.get("datumFields").toJSON(), {parse: true}),
        datumStates : new DatumStates(this.get("datumStates").toJSON(), {parse: true}),
        datumTags : new DatumTags(this.get("datumTags").toJSON(), {parse: true}),
        pouchname : this.get("pouchname"),
        session: this.get("session")
      });

      return datum;
    },
    updateDatumState : function(selectedValue){
      console.log("Asking to change the datum state to "+selectedValue); 
      
      try{
        this.get("datumStates").where({selected : "selected"})[0].set("selected", "");
        this.get("datumStates").where({state : selectedValue})[0].set("selected", "selected");
      }catch(e){
        Utils.debug("problem getting color of datum state, probaly none are selected.",e);
      }
      console.log("done"); 

//      this.save();
      //TODO save it
    },
    /**
     * The LaTeXiT function automatically mark-ups an example in LaTeX code
     * (\exg. \"a) and then copies it on the export modal so that when the user
     * switches over to their LaTeX file they only need to paste it in.
     * 
     * We did a poll on Facebook among EGGers, and other linguists we know and
     * found that Linguex was very popular, and GB4E, so we did the export in
     * GB4E.
     */
    laTeXiT : function(showInExportModal) {
      utterance = this.get("datumFields").where({label: "utterance"})[0].get("mask");
      morphemes = this.get("datumFields").where({label: "morphemes"})[0].get("mask");
      gloss = this.get("datumFields").where({label: "gloss"})[0].get("mask");
      translation= this.get("datumFields").where({label: "translation"})[0].get("mask");
      var result = "\n \\begin{exe} "
            + "\n \\ex " + utterance + 
            + "\n\t \\gll " + morphemes + " \\\\"
            + "\n\t" + gloss + " \\\\"
            + "\n\t\\trans `" + translation + "'"
            + "\n\\end{exe}\n\n";
      if (showInExportModal != null) {
        $("#export-type-description").html(" as LaTeX (GB4E)");
        $("#export-text-area").val($("#export-text-area").val() + result);
      }
      return result;
    },
    
    /**
     * This function simply takes the utterance gloss and translation and puts
     * them out as plain text so the user can do as they wish.
     */
    exportAsPlainText : function(showInExportModal) {
      var header = _.pluck(this.get("datumFields").toJSON(), "label");
      var fields = _.pluck(this.get("datumFields").toJSON(), "mask");
      var result = fields.join("\n");
      
      if(showInExportModal != null){
        $("#export-type-description").html(" as text (Word)");
        $("#export-text-area").val(
            $("#export-text-area").val() + result
        );
      }
      return result;
    },
    
    /**
     * This takes as an argument the order of fields and then creates a row of csv.
     */
    exportAsCSV : function(showInExportModal, orderedFields, printheader) {
      if (orderedFields == null) {
        orderedFields = ["judgement","utterance","morphemes","gloss","translation"];
      }
      judgement = this.get("datumFields").where({label: "judgement"})[0].get("mask");
      morphemes = this.get("datumFields").where({label: "morphemes"})[0].get("mask");
      utterance= this.get("datumFields").where({label: "utterance"})[0].get("mask");
      gloss = this.get("datumFields").where({label: "gloss"})[0].get("mask");
      translation= this.get("datumFields").where({label: "translation"})[0].get("mask");
      var resultarray =  [judgement,utterance,morphemes,gloss,translation];
      var result = '"' + resultarray.join('","') + '"\n';
      if (printheader) {
        var header = '"' + orderedFields.join('","') + '"';
        result = header + "\n" + result;
      }
      if (showInExportModal != null) {
        $("#export-type-description").html(" as CSV (Excel, Filemaker Pro)");
        $("#export-text-area").val(
            $("#export-text-area").val() + result);
      }
      return result;
    },
    
    /**
     * Encrypts the datum if it is confidential
     * 
     * @returns {Boolean}
     */
    encrypt : function() {
      this.set("confidential", true);
      this.get("datumFields").each(function(dIndex){
        dIndex.set("encrypted", "checked");
      });
      //TODO scrub version history to get rid of all unencrypted versions.
      this.saveAndInterConnectInApp(window.app.router.renderDashboardOrNot, window.app.router.renderDashboardOrNot);
    },
    
    /**
     * Decrypts the datum if it was encrypted
     */
    decrypt : function() {
      this.set("confidential", false);

      this.get("datumFields").each(function(dIndex){
        dIndex.set("encrypted", "");
      });
    },
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     * 
     * - Adds the datum to the top of the default data list in the corpus if it is in the right corpus
     * - Adds the datum to the datums container if it wasnt there already
     * - Adds an activity to the logged in user with diff in what the user changed. 
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      OPrime.debug("Saving a Datum");
      var self = this;
      var newModel = true;
      if(this.id){
        newModel = false;
      }else{
        this.set("dateEntered", JSON.stringify(new Date()));
      }
      //protect against users moving datums from one corpus to another on purpose or accidentially
      if(window.app.get("corpus").get("pouchname") != this.get("pouchname")){
        if(typeof failurecallback == "function"){
          failurecallback();
        }else{
          alert('Datum save error. I cant save this datum in this corpus, it belongs to another corpus. ' );
        }
        return;
      }
      //If it was decrypted, this will save the changes before we go into encryptedMode
      
      this.get("datumFields").each(function(dIndex){
        //Anything can be done here, it is the set function which does all the work.
        dIndex.set("value", dIndex.get("mask"));
      });
      
      // Store the current Session, the current corpus, and the current date
      // in the Datum
      this.set({
        "pouchname" : window.app.get("corpus").get("pouchname"),
        "dateModified" : JSON.stringify(new Date()),
        "timestamp" : Date.now(),
        "jsonType" : "Datum"
      });
      if(!this.get("session")){
        this.set("session" , window.app.get("currentSession")); 
        Util.debug("Setting the session on this datum to the current one.");
      }else{
        OPrime.debug("Not setting the session on this datum.");
      }
      window.app.get("corpus").set("dateOfLastDatumModifiedToCheckForOldSession", JSON.stringify(new Date()) );
      
      var oldrev = this.get("_rev");
      /*
       * For some reason the corpus is getting an extra state that no one defined in it. 
       * this gets rid of it when we save. (if it gets in to a datum)
       */
      try{
        var ds = this.get("datumStates").models;
        for (var s in ds){
          if(ds[s].get("state") == undefined){
            this.get("datumStates").remove(ds[s]);
          }
        }
      }catch(e){
        OPrime.debug("Removing empty states work around failed some thing was wrong.",e);
      }
      
      this.changePouch(null,function(){
        self.save(null, {
          success : function(model, response) {
            OPrime.debug('Datum save success');
            var utterance = model.get("datumFields").where({label: "utterance"})[0].get("mask");
            var differences = "#diff/oldrev/"+oldrev+"/newrev/"+response._rev;
            //TODO add privacy for datum goals in corpus
//            if(window.app.get("corpus").get("keepDatumDetailsPrivate")){
//              utterance = "";
//              differences = "";
//            }
            if(window.appView){
              window.appView.toastUser("Sucessfully saved datum: "+ utterance,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "updated";
            verbicon = "icon-pencil";
            if(newModel){
              verb = "added";
              verbicon = "icon-plus";
            }
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon: verbicon,
                  directobject : "<a href='#corpus/"+model.get("pouchname")+"/datum/"+model.id+"'>"+utterance+"</a> ",
                  directobjecticon : "icon-list",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "team",
                  context : " via Offline App."
                });
            
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon: verbicon,
                  directobject : "<a href='#corpus/"+model.get("pouchname")+"/datum/"+model.id+"'>"+utterance+"</a> ",
                  directobjecticon : "icon-list",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "personal",
                  context : " via Offline App."
                });
//            /*
//             * If the current data list is the default
//             * list, render the datum there since is the "Active" copy
//             * that will eventually overwrite the default in the
//             * corpus if the user saves the current data list
//             */
//            var defaultIndex = window.app.get("corpus").datalists.length - 1;
//            if(window.appView.currentEditDataListView.model.id == window.app.get("corpus").datalists.models[defaultIndex].id){
//              //Put it into the current data list views
//              window.appView.currentPaginatedDataListDatumsView.collection.remove(model);//take it out of where it was, 
//              window.appView.currentPaginatedDataListDatumsView.collection.unshift(model); //and put it on the top. this is only in the default data list
//              //Put it into the ids of the current data list
//              var positionInCurrentDataList = window.app.get("currentDataList").get("datumIds").indexOf(model.id);
//              if(positionInCurrentDataList != -1){
//                window.app.get("currentDataList").get("datumIds").splice(positionInCurrentDataList, 1);
//              }
//              window.app.get("currentDataList").get("datumIds").unshift(model.id);
//              window.appView.addUnsavedDoc(window.app.get("currentDataList").id);
//            }else{
//              /*
//               * Make sure the datum is at the top of the default data list which is in the corpus,
//               * this is in case the default data list is not being displayed
//               */
//              var positionInDefaultDataList = window.app.get("corpus").datalists.models[defaultIndex].get("datumIds").indexOf(model.id);
//              if(positionInDefaultDataList != -1 ){
//                //We only reorder the default data list datum to be in the order of the most recent modified, other data lists can stay in the order teh usr designed them. 
//                window.app.get("corpus").datalists.models[defaultIndex].get("datumIds").splice(positionInDefaultDataList, 1);
//              }
//              window.app.get("corpus").datalists.models[defaultIndex].get("datumIds").unshift(model.id);
//              window.app.get("corpus").datalists.models[defaultIndex].needsSave  = true;
//              window.appView.addUnsavedDoc(window.app.get("corpus").id);
//            }
            /*
             * Also, see if this datum matches the search datalist, and add it to the top of the search list
             */
            if($("#search_box").val() != ""){
              //TODO check this
              var datumJson = model.get("datumFields").toJSON()
              var datumAsDBResponseRow = {};
              for (var x in datumJson){ 
                datumAsDBResponseRow[datumJson[x].label] = datumJson[x].mask;
              }
              var queryTokens = self.processQueryString($("#search_box").val());
              var thisDatumIsIn = self.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[0]);

              for (var j = 1; j < queryTokens.length; j += 2) {
                if (queryTokens[j] == "AND") {
                  // Short circuit: if it's already false then it continues to be false
                  if (!thisDatumIsIn) {
                    break;
                  }

                  // Do an intersection
                  thisDatumIsIn = thisDatumIsIn && model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j+1]);
                } else {
                  // Do a union
                  thisDatumIsIn = thisDatumIsIn || model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j+1]);
                }
              }
              if (thisDatumIsIn) {
                // Insert the datum at the top of the search datums collection view
                window.appView.searchEditView.searchPaginatedDataListDatumsView.collection.remove(model);//take it out of where it was, 
                window.appView.searchEditView.searchPaginatedDataListDatumsView.collection.unshift(model);
                //Do the same to the datumids in the search data list itself
                var positioninsearchresults = window.appView.searchEditView.searchDataListView.model.get("datumIds").indexOf(model.id);
                if(positioninsearchresults != -1){
                  window.appView.searchEditView.searchDataListView.model.get("datumIds").splice(positioninsearchresults, 1);
                }
                window.appView.searchEditView.searchDataListView.model.get("datumIds").unshift(model.id);
              }
            }//end of if search is open and running for Alan
            

            //dont need to save the user every time when we change a datum.
//            window.app.get("authentication").saveAndInterConnectInApp();

            if(typeof successcallback == "function"){
              successcallback();
            }
          },
          error : function(e, f, g) {
            OPrime.debug("Datum save error", e, f, g)
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('Datum save error: ' + f.reason);
            }
          }
        });
      });
    },
    /**
     * Accepts two functions success will be called if sucessfull,
     * otherwise it will attempt to render the current datum views. If
     * the datum isn't in the current corpus it will call the fail
     * callback or it will alert a bug to the user. Override the fail
     * callback if you don't want the alert.
     * 
     * @param successcallback
     * @param failurecallback
     * @deprecated
     */
    setAsCurrentDatum : function(successcallback, failurecallback){
      console.warn("Using deprected method setAsCurrentDatum.");
//      if( window.app.get("corpus").get("pouchname") != this.get("pouchname") ){
//        if (typeof failurecallback == "function") {
//          failurecallback();
//        }else{
//          alert("This is a bug, cannot load the datum you asked for, it is not in this corpus.");
//        }
//        return;
//      }else{
//        if (window.appView.datumsEditView.datumsView.collection.models[0].id != this.id ) {
//          window.appView.datumsEditView.datumsView.prependDatum(this);
//          //TODO might not need to do it on the Read one since it is the same model?
//        }
//        if (typeof successcallback == "function") {
//          successcallback();
//        }
//      }
    }
  });

  return Datum;
});

define('data_list/DataList',[ 
    "backbone", 
    "datum/Datum",
    "comment/Comment",
    "comment/Comments"
], function(
    Backbone, 
    Datum,
    Comment,
    Comments
) {
  var DataList = Backbone.Model.extend(
  /** @lends DataList.prototype */
  {
    /**
     * @class The Data List widget is used for import search, to prepare handouts and to share data on the web.
     * 
     * @description 
     * 
     * @property {String} title The title of the Data List.
     * @property {String} dateCreated The date that this Data List was created.
     * @property {String} description The description of the Data List.
     * @property {Array<String>} datumIds An ordered list of the datum IDs of the
     *   Datums in the Data List.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      OPrime.debug("DATALIST init");
      
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      // If there are no comments, give it a new one
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      
      if (!this.get("dateCreated")) {
        this.set("dateCreated", (new Date()).toDateString());
      }
    },
    /**
     * backbone-couchdb adaptor set up
     */
    
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/datalists",
    
    defaults : {
      title : "Untitled Data List",
      description : "",
      datumIds : []
    },
    
    // Internal models: used by the parse function
    internalModels : {
      comments: Comments
    },

  //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function(commentstring) {
      var m = new Comment({
        "text" : commentstring,
     });
      
      this.get("comments").add(m);
      window.appView.addUnsavedDoc(this.id);
      
      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-pushpin'></i> "+this.get('title')+"</a>",
            teamOrPersonal : "team",
            context : " via Offline App."
          });
      
      window.app.addActivity(
         {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-pushpin'></i> "+this.get('title')+"</a>",
            teamOrPersonal : "personal",
            context : " via Offline App."
          });
    },
    changePouch : function(pouchname, callback) {
      if(!pouchname){
        pouchname = this.get("pouchname");
        if(pouchname == undefined){
          pouchname = window.app.get("corpus").get("pouchname");
        }
      }
      if(OPrime.isCouchApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }
      
      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + pouchname : OPrime.pouchUrl + pouchname);
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    getAllAudioAndVideoFiles : function(datumIdsToGetAudioVideo, callback){
      if(!datumIdsToGetAudioVideo){
        datumIdsToGetAudioVideo = this.get("datumIds");
      }
      if(datumIdsToGetAudioVideo.length == 0){
        datumIdsToGetAudioVideo = this.get("datumIds");
      }
      var audioVideoFiles = [];
      
      OPrime.debug("DATA LIST datumIdsToGetAudioVideo " +JSON.stringify(datumIdsToGetAudioVideo));
      for(var id in datumIdsToGetAudioVideo){
        var obj = new Datum({pouchname: app.get("corpus").get("pouchname")});
        obj.id  = datumIdsToGetAudioVideo[id];
        var thisobjid = id;
        obj.changePouch(window.app.get("corpus").get("pouchname"), function(){
          obj.fetch({
            success : function(model, response) {
              audioVideoFiles.push(model.get("audioVideo").get("URL"));
              
              if(thisobjid == datumIdsToGetAudioVideo.length - 1){
                if(typeof callback == "function"){
                  callback(audioVideoFiles);
                }
              }
            }
          });
        });
        
      }
    },

    applyFunctionToAllIds : function(datumIdsToApplyFunction, functionToAppy, functionArguments){
      if(!datumIdsToApplyFunction){
        datumIdsToApplyFunction = this.get("datumIds");
      }
      if(datumIdsToApplyFunction.length == 0){
        datumIdsToApplyFunction = this.get("datumIds");
      }
      if(!functionToAppy){
        functionToAppy = "laTeXiT";
      }
      if(!functionArguments){
//        functionArguments = true; //leave it null so that the defualts will apply in the Datum call
      }
      OPrime.debug("DATA LIST datumIdsToApplyFunction " +JSON.stringify(datumIdsToApplyFunction));
      for(var id in datumIdsToApplyFunction){
        /* look for the datum in the datum loaded in the view, and use that one rather than re-opening the datum */
//        var indexInCurrentPaginatedDataListDatums = _.pluck(window.appView.currentPaginatedDataListDatumsView.collection.models, "id").indexOf(datumIdsToApplyFunction[id]);
//        window.appView.currentPaginatedDataListDatumsView._childViews[indexInCurrentPaginatedDataListDatums].model[functionToAppy](functionArguments);

        
        /* this code re-opens the datum, but if its already in the child views, ths is  unnecesary */
        var obj = new Datum({pouchname: app.get("corpus").get("pouchname")});
        obj.id  = datumIdsToApplyFunction[id];
        obj.changePouch(window.app.get("corpus").get("pouchname"), function(){
          obj.fetch({
            success : function(model, response) {
              model[functionToAppy](functionArguments);
            } 
          });
        });
        
      }
    },
    
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     * 
     * - Adds the dataList to the corpus if it is in the right corpus, and wasnt already there
     * - Adds the dataList to the user if it wasn't already there
     * - Adds an activity to the logged in user with diff in what the user changed. 
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      OPrime.debug("Saving the DataList");
      var self = this;
//      var idsInCollection = [];
//      for(d in this.datumCollection.models){
//        idsInCollection.push( this.datumCollection.models[d] );
//      }
//      this.set("datumIds", idsInCollection);
      var newModel = true;
      if(this.id){
        newModel = false;
      }else{
        this.set("dateCreated",JSON.stringify(new Date()));
      }
      
      //protect against users moving dataLists from one corpus to another on purpose or accidentially
      if(window.app.get("corpus").get("pouchname") != this.get("pouchname")){
        if(typeof failurecallback == "function"){
          failurecallback();
        }else{
          alert('DataList save error. I cant save this dataList in this corpus, it belongs to another corpus. ' );
        }
        return;
      }
      var oldrev = this.get("_rev");
      this.set("dateModified", JSON.stringify(new Date()));
      this.set("timestamp", Date.now());

      this.changePouch(null, function(){
        self.save(null, {
          success : function(model, response) {
            OPrime.debug('DataList save success');
            var title = model.get("title");
            var differences = "#diff/oldrev/"+oldrev+"/newrev/"+response._rev;
            //TODO add privacy for dataList in corpus
//            if(window.app.get("corpus").get("keepDataListDetailsPrivate")){
//              title = "";
//              differences = "";
//            }
            if(window.appView){
              window.appView.toastUser("Sucessfully saved data list: "+ title,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "updated";
            verbicon = "icon-pencil";
            if(newModel){
              verb = "added";
              verbicon = "icon-plus";
            }
            
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-pushpin",
                  directobject : "<a href='#data/"+model.id+"'>"+title+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "team",
                  context : " via Offline App."
                });
            
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-pushpin",
                  directobject : "<a href='#data/"+model.id+"'>"+title+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "personal",
                  context : " via Offline App."
                });
            
            window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = model.id;

            /*
             * Make sure the data list is visible in this corpus
             */
            var previousversionincorpus = window.app.get("corpus").datalists.get(model.id);
            if(previousversionincorpus == undefined ){
              window.app.get("corpus").datalists.unshift(model);
            }else{
              window.app.get("corpus").datalists.remove(previousversionincorpus);
              window.app.get("corpus").datalists.unshift(model);
            }
            
            //make sure the dataList is in the history of the user
            if(window.app.get("authentication").get("userPrivate").get("dataLists").indexOf(model.id) == -1){
              window.app.get("authentication").get("userPrivate").get("dataLists").unshift(model.id);
//              window.app.get("authentication").saveAndInterConnectInApp();
            }

            if(typeof successcallback == "function"){
              successcallback();
            }
          },
          error : function(e, f, g) {
            OPrime.debug("DataList save error", e, f, g);
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('DataList save error: ' + f.reason);
            }
          }
        });
      });
    },
    /**
     * Accepts two functions success will be called if successful,
     * otherwise it will attempt to render the current dataList views. If
     * the dataList isn't in the current corpus it will call the fail
     * callback or it will alert a bug to the user. Override the fail
     * callback if you don't want the alert.
     * 
     * @param successcallback
     * @param failurecallback
     */
    setAsCurrentDataList : function(successcallback, failurecallback){
      if( window.app.get("corpus").get("pouchname") != this.get("pouchname") ){
        if (typeof failurecallback == "function") {
          failurecallback();
        }else{
          alert("This is a bug, cannot load the dataList you asked for, it is not in this corpus.");
        }
        return;
      }else{
        if (window.app.get("currentDataList").id != this.id ) {
          //remove reference between current dataList and the model  TODO check this..
//          delete window.app.attributes.currentDataList; //this seems to delte the datalist from the corpus too. :(
//          window.app.attributes.currentDataList = this; //trying to get backbone not to notice we are switching the current data list.
          window.app.set("currentDataList", this); //This results in a non-identical copy in the currentDatalist, it doesn't change when the one in the corpus changes. 
//          window.app.set("currentDataList", app.get("corpus").datalists.get(this.id)); //this pulls the datalist from the corpus which might not be the most recent version. instead we will trust the pouch one above.
        }
        window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = this.id;
        window.app.get("authentication").saveAndInterConnectInApp();
        if(window.appView) {
          window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function() {
            if (typeof successcallback == "function") {
              successcallback();
            }
          });
        }else{
          if (typeof successcallback == "function") {
            successcallback();
          }
        }
      }
    }
  });

  return DataList;
});

define('data_list/DataLists',[
    "backbone",
    "data_list/DataList"
], function(
    Backbone, 
    DataList
) {
    var DataLists = Backbone.Collection.extend(
    /** @lends DataLists.prototype */
    {
       /**
        * @class A collection of DataLists
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       /**
        * backbone-couchdb adaptor set up
        */
       db : {
         view : "datalists",
         changes : false,
         filter : Backbone.couch_connector.config.ddoc_name + "/datalists"
       },
       // The couchdb-connector is capable of mapping the url scheme
       // proposed by the authors of Backbone to documents in your database,
       // so that you don't have to change existing apps when you switch the sync-strategy
       url : "/datalists",
       // The messages should be ordered by date
       comparator : function(doc){
         return doc.get("timestamp");
       },
       
       internalModels : DataList,
       model : DataList,
       
       fetchDatalists : function(suces, fail){
         this.fetch({
           error : function(model, xhr, options) {
             OPrime.debug("There was an error loading your sessions.");
             console.log(model,xhr,options);
             OPrime.bug("There was an error loading your sessions.");
             if(typeof fail == "function"){
               fail();
             }
           },
           success : function(model, response, options) {
             console.log("Datalists fetched ",model,response,options);
             if (response.length == 0) {
               OPrime.bug("You have no sessions, TODO creating a new one...");
             }
             if(typeof suces == "function"){
               suces();
             }
           }
         });
         
       }
       
    });
    
    return DataLists;
});

define('user/Consultants',[
    "backbone",
    "user/UserMask"],
function(
    Backbone, 
    UserMask
) {  
  var Consultants = Backbone.Collection.extend(   
  /** @lends Consultants.prototype */ 
  {
    /**
     * @class  Consultants is a collection of user masks so that only public details get saved into items. 

     * @description
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function() {
    },
    
    model: UserMask,
  }); 
  
  return Consultants;
}); 

define('lexicon/LexiconNode',[
    "backbone"
], function(
    Backbone
) {  
  var LexiconNode = Backbone.Model.extend(   
  /** @lends LexiconNode.prototype */ 
  {
    /**
     * @class Lexicon Node is key value pair with an index of related datum. It allows the search to index
     *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
     * 
     * @description
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function() {
    },
    
    defaults: {
      morpheme: "",
      allomorphs: [],
      gloss: "",
      value: 0,
      data: []  
    },
    
    // Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    }
  }); 
  
  return LexiconNode; 
  
}); 

define("lexicon/LexiconNodes", 
    ["backbone",
     "lexicon/LexiconNode"],
    function(Backbone, LexiconNode) {
  
  var LexiconNodes = Backbone.Collection.extend(
      
    /** @lends LexiconNodes.prototype */ 
        
    {
      /**
       * @class Lexicon Nodes is a collection of lexicon nodes is key value pair with an index of related datum. 
       * 
       * @description
       * 
       * @extends Backbone.Model
       * 
       * @constructs
       * 
       */
      internalModels : LexiconNode,
      model : LexiconNode,
    /*
     * if want to do versioning on nodes, or if we want to do something
     * special with all the similar nodes. most likely this will be
     * unnecesary since the data from the server is the most accurate? but
     * no, it is pure data, the user might have corrected it at some point.
     * we should store the corrections somewhere so they can be replayed on
     * the training data results. this might be an interesting measure of
     * accuracy/ usability if the number of correctiones reduces propoortial
     * to the nnumber of nodes.
     */
    //    defaultOptions : {unique: true, concatSimilarNodes: true},
    //if just want normal use of nodes, ie add duplicates if the user syncs or loads the lexicon again. this is a bad idea.
    //defaultOptions : {unique: false, concatSimilarNodes: false},
    //if want to take the most recent node only
    defaultOptions : {unique: true, concatSimilarNodes: false},
    
    //https://github.com/documentcloud/backbone/pull/808
    add : function(model, options) {
//    	console.log("Overriding add");
        options = options || this.defaultOptions;
        model = this._prepareModel(model, options);
        if (!model) return false;
        if (options.unique) {
          //If it is already known to pouch or backbone dont add it
//          var already = this.getByCid(model) || this.get(model.id);
          //If there is a node with the same morpheme, gloss, don't add it.
          var already = this.where({morpheme: model.get("morpheme"), gloss: model.get("gloss")});
          if (already.length > 0) {
//            console.log("This morpheme gloss pair already existed", already, model.toJSON());
            if(options.concatSimilarNodes){
              //Update the node's value (but put a copy of its local value in too)
              var similarNode = this.where({morpheme: model.get("morpheme"), gloss: model.get("gloss")})[0];
              model.set("valueLocalOld", similarNode.get("value"));
              //TODO do some correction logic here if the user has corrected this node?
            }
            //put the new models info into the existing member of the collection
            OPrime.debug("Updating ", already[0].toJSON(), " to ", model.toJSON());
            already[0].set(model.toJSON());
            return; //don't throw error, just happily return 
//            throw new Error(["Can't add the same model to a set twice", already.id]);
          }
        }
        this._byId[model.id] = model;
        this._byCid[model.cid] = model;
        var index = options.at != null ? options.at :
                    this.comparator ? this.sortedIndex(model, this.comparator) :
                    this.length;
        this.models.splice(index, 0, model);
        model.bind('all', this._onModelEvent);
        this.length++;
        options.index = index;
        if (!options.silent) model.trigger('add', model, this, options);
        return model;
      }

   

  
  }); 
  
  return LexiconNodes; 
  
}); 

define('lexicon/Lexicon',[
    "backbone",
		"lexicon/LexiconNode",
		"lexicon/LexiconNodes"
], function(
    Backbone, 
    LexiconNode, 
    LexiconNodes
) {	
	var Lexicon = Backbone.Model.extend(	
	/** @lends Lexicon.prototype */
	{
		/**
		 * @class Lexicon is directed graph (triple store) between morphemes and
		 *        their allomorphs and glosses. It allows the search to index
		 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
		 * 
		 * @description
		 * 
		 * @extends Backbone.Model
		 * 
		 * @constructs
		 * 
		 */
		initialize : function(){
		},
		
		// Internal models: used by the parse function
    internalModels : {
      lexiconNodes : LexiconNodes
    },
    /**
     * Overwrite/build the lexicon from the corpus server if it is there, saves
     * the results to local storage so they can be reused offline.
     * 
     * @param pouchname
     * @param callback
     */
    buildLexiconFromCouch : function(pouchname, callback){
      var self = this;
      var couchConnection = app.get("corpus").get("couchConnection");
      var couchurl = couchConnection.protocol+couchConnection.domain+":"+couchConnection.port  +couchConnection.path+"/";

      $.ajax({
        type : 'GET',
        url : couchurl+pouchname+"/_design/lexicon/_view/create_triples?group=true",
        success : function(results) {
          if (! self.get("lexiconNodes")){
            self.set("lexiconNodes", new LexiconNodes());
          }
          localStorage.setItem(pouchname+"lexiconResults", results);
          var lexiconTriples = JSON.parse(results).rows;
          for (triple in lexiconTriples) {
            self.get("lexiconNodes").add(new LexiconNode({
              morpheme : lexiconTriples[triple].key.morpheme,
              allomorphs : [ lexiconTriples[triple].key.morpheme ],
              gloss : lexiconTriples[triple].key.gloss,
              value : lexiconTriples[triple].value
            }));
          }
          if (typeof callback == "function"){
            callback();
          }
        },// end successful response
        dataType : ""
      });
    },
    /**
     * Overwrite/build the lexicon from local storage if it is there.
     * 
     * @param pouchname
     * @param callback
     */
    buildLexiconFromLocalStorage  : function(pouchname, callback){
      var results = localStorage.getItem(pouchname+"lexiconResults");
      if(!results){
        return;
      }
      if (! this.get("lexiconNodes")){
        this.set("lexiconNodes", new LexiconNodes());
      }
      var lexiconTriples = JSON.parse(results).rows;
      for(triple in lexiconTriples){
        this.get("lexiconNodes").add(new LexiconNode({morpheme: lexiconTriples[triple].key.morpheme , allomorphs: [lexiconTriples[triple].key.morpheme], gloss: lexiconTriples[triple].key.gloss, value: lexiconTriples[triple].value}));
      }
      if (typeof callback == "function"){
        callback();
      }
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
    
	}); 
	
	return Lexicon;
}); 

define('permission/Permissions',[
    "backbone",
    "permission/Permission"
], function(
    Backbone, 
    Permission
) {
    var Permissions = Backbone.Collection.extend(
    /** @lends Permissions.prototype */
    {
       /**
        * @class A collection of Permissions 
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       internalModels: Permission,
       model: Permission
    });
    
    return Permissions;
});
define('datum/Sessions',[
    "backbone",
    "datum/Session"
], function(
    Backbone, 
    Session
) {
    var Sessions = Backbone.Collection.extend(
    /** @lends Sessions.prototype */
    {
       /**
        * @class A collection of Sessions Probably will be used in the fullscreen corpus view.
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       
       /**
        * backbone-couchdb adaptor set up
        */
       db : {
         view : "sessions",
         changes : false,
         filter : Backbone.couch_connector.config.ddoc_name + "/sessions"
       },
       // The couchdb-connector is capable of mapping the url scheme
       // proposed by the authors of Backbone to documents in your database,
       // so that you don't have to change existing apps when you switch the sync-strategy
       url : "/sessions",
       // The messages should be ordered by date
       comparator : function(doc){
         return doc.get("timestamp");
       },
       
       internalModels : Session,

       model: Session,
       
       fetchSessions : function(suces, fail){
         this.fetch({
           error : function(model, xhr, options) {
             OPrime.debug("There was an error loading your sessions.");
             console.log(model,xhr,options);
             OPrime.bug("There was an error loading your sessions.");
             if(typeof fail == "function"){
               fail();
             }
           },
           success : function(model, response, options) {
             console.log("Sessions fetched ", model,response,options);
             if (response.length == 0) {
               OPrime.bug("You have no sessions, TODO creating a new one...");
             }
             if(typeof suces == "function"){
               suces();
             }
           }
         });
       }
    });
    
    return Sessions;
});
var Glosser = Glosser || {};
Glosser.currentCorpusName = "";
Glosser.downloadPrecedenceRules = function(pouchname, callback){
  var couchConnection = app.get("corpus").get("couchConnection");
  var couchurl = couchConnection.protocol+couchConnection.domain+":"+couchConnection.port +couchConnection.path+"/";

  $.ajax({
    type : 'GET',
    url : couchurl + pouchname
        + "/_design/get_precedence_rules_from_morphemes/_view/precedence_rules?group=true",
    success : function(rules) {
      // Parse the rules from JSON into an object
      rules = JSON.parse(rules);
      localStorage.setItem(pouchname+"precendenceRules", JSON.stringify(rules.rows));

      // Reduce the rules such that rules which are found in multiple source
      // words are only used/included once.
      var reducedRules = _.chain(rules.rows).groupBy(function(rule) {
        return rule.key.x + "-" + rule.key.y;
      }).value();
      
      // Save the reduced precedence rules in localStorage
      localStorage.setItem(pouchname+"reducedRules", JSON.stringify(reducedRules));
      Glosser.currentCorpusName = pouchname;
      if(typeof callback == "function"){
        callback();
      }
    },
    error : function(e) {
      console.log("error getting precedence rules:", e);
    },
    dataType : ""
  });
}
/**
 * Takes in an utterance line and, based on our current set of precendence
 * rules, guesses what the morpheme line would be. The algorithm is
 * very conservative.
 * 
 * @param {String} unparsedUtterance The raw utterance line.
 *
 * @return {String} The guessed morphemes line. 
 */
Glosser.morphemefinder = function(unparsedUtterance) {
  var potentialParse = '';
  
  // Get the precedence rules from localStorage
  var rules = localStorage.getItem(Glosser.currentCorpusName+"reducedRules");
  
  var parsedWords = [];
  if (rules) {
    // Parse the rules from JSON into an object
    rules = JSON.parse(rules);

    // Divide the utterance line into words
    var unparsedWords = unparsedUtterance.trim().split(/ +/);
    
    for (var word in unparsedWords) {
      // Add the start/end-of-word character to the word
      unparsedWords[word] = "@" + unparsedWords[word] + "@";

      // Find the rules which match in local precedence
      var matchedRules = [];
      for (var r in rules) {
        if (unparsedWords[word].indexOf(r.replace(/-/, "")) >= 0) {
          matchedRules.push({
            r : rules[r]
          })
        }
      }

      // Attempt to find the longest template which the matching rules can
      // generate from start to end
      var prefixtemplate = [];
      prefixtemplate.push("@");
      for (var i = 0; i < 10; i++) {
        if (prefixtemplate[i] == undefined) {
          break;
        }
        for (var j in matchedRules) {
          if (prefixtemplate[i] == matchedRules[j].r[0].key.x) {
            if (prefixtemplate[i + 1]) { // ambiguity (two potential following
                                          // morphemes)
              prefixtemplate.pop();
              break;
            } else {
              prefixtemplate[i + 1] = matchedRules[j].r[0].key.y;
            }
          }
        }
      }

      // If the prefix template hit ambiguity in the middle, try from the suffix
      // in until it hits ambiguity
      var suffixtemplate = [];
      if (prefixtemplate[prefixtemplate.length - 1] != "@" || prefixtemplate.length == 1) {
        // Suffix:
        suffixtemplate.push("@")
        for (var i = 0; i < 10; i++) {
          if (suffixtemplate[i] == undefined) {
            break;
          }
          for (var j in matchedRules) {
            if (suffixtemplate[i] == matchedRules[j].r[0].key.y) {
              if (suffixtemplate[i + 1]) { // ambiguity (two potential
                                            // following morphemes)
                suffixtemplate.pop();
                break;
              } else {
                suffixtemplate[i + 1] = matchedRules[j].r[0].key.x;
              }
            }
          }
        }
      }
      
      // Combine prefix and suffix templates into one regular expression which
      // can be tested against the word to find a potential parse.
      // Regular expressions will look something like
      //    (@)(.*)(hall)(.*)(o)(.*)(wa)(.*)(n)(.*)(@)
      var template = [];
      template = prefixtemplate.concat(suffixtemplate.reverse())
      for (var slot in template) {
        template[slot] = "(" + template[slot] + ")";
      }
      var regex = new RegExp(template.join("(.*)"), "");
    
      // Use the regular expression to find a guessed morphemes line
      potentialParse = unparsedWords[word]
          .replace(regex, "$1-$2-$3-$4-$5-$6-$7-$8-$9") // Use backreferences to parse into morphemes
          .replace(/\$[0-9]/g, "")// Remove any backreferences that weren't used
          .replace(/@/g, "")      // Remove the start/end-of-line symbol
          .replace(/--+/g, "-")   // Ensure that there is only ever one "-" in a row
          .replace(/^-/, "")      // Remove "-" at the start of the word
          .replace(/-$/, "");     // Remove "-" at the end of the word
      OPrime.debug("Potential parse of " + unparsedWords[word].replace(/@/g, "")
          + " is " + potentialParse);
          
      parsedWords.push(potentialParse);
    }
  }
  
  return parsedWords.join(" ");
}
Glosser.toastedUserToSync = false;
Glosser.toastedUserToImport = 0;
Glosser.glossFinder = function(morphemesLine){
  //Guess a gloss
  var morphemeGroup = morphemesLine.split(/ +/);
  var glossGroups = [];
  if(! window.app.get("corpus")){
    return "";
  }
  if(! window.app.get("corpus").lexicon.get("lexiconNodes")){
    var corpusSize = 31; //TODO get corpus size another way. // app.get("corpus").datalists.models[app.get("corpus").datalists.models.length-1].get("datumIds").length;
    if(corpusSize > 30 && !Glosser.toastedUserToSync){
      Glosser.toastedUserToSync = true;
      window.appView.toastUser("You probably have enough data to train an autoglosser for your corpus.\n\nIf you sync your data with the team server then editing the morphemes will automatically run the auto glosser.","alert-success","Sync to train your auto-glosser:");
    }else{
      Glosser.toastedUserToImport ++;
      if(Glosser.toastedUserToImport % 10 == 1 && corpusSize < 30){
        window.appView.toastUser("You have roughly "+corpusSize+" datum saved in your pouch, if you have around 30 datum, then you have enough data to train an autoglosser for your corpus.","alert-info","AutoGlosser:");
      }
    }
    return "";
  }
  var lexiconNodes = window.app.get("corpus").lexicon.get("lexiconNodes");
  for (var group in morphemeGroup) {
    var morphemes = morphemeGroup[group].split("-");
    var glosses = [];
    for (var m in morphemes) {
      // Take the first gloss for this morpheme
      var matchingNode = _.max(lexiconNodes.where({morpheme: morphemes[m]}), function(node) { return node.get("value"); });
//      console.log(matchingNode);
      var gloss = "?";   // If there's no matching gloss, use question marks
      if (matchingNode) {
        gloss = matchingNode.get("gloss");
      }
      glosses.push(gloss);
    }
    
    glossGroups.push(glosses.join("-"));
  }
  
  // Replace the gloss line with the guessed glosses
  return glossGroups.join(" ");
}
/**
 * Takes as a parameters an array of rules which came from CouchDB precedence rule query.
 * Example Rule: {"key":{"x":"@","relation":"preceeds","y":"aqtu","context":"aqtu-nay-wa-n"},"value":2}
 */
Glosser.generateForceDirectedRulesJsonForD3 = function(rules, pouchname) {
  if(!pouchname){
    pouchname = Glosser.currentCorpusName;
  }
  if(!rules){
    rules = localStorage.getItem(pouchname+"precendenceRules");
    if(rules){
      rules = JSON.parse(rules);
    }
  }
  if(!rules ){
    return;
  }
  /*
   * Cycle through the precedence rules, convert them into graph edges with the morpheme index in the morpheme array as the source/target values
   */
  morphemeLinks = [];
  morphemes = [];
  for ( var i in rules) {
    var xpos = morphemes.indexOf(rules[i].key.x);
    if (xpos < 0) {
      morphemes.push(rules[i].key.x);
      xpos = morphemes.length - 1;
    }
    var ypos = morphemes.indexOf(rules[i].key.y);
    if (ypos < 0) {
      morphemes.push(rules[i].key.y);
      ypos = morphemes.length - 1;
    }
    if (rules[i].key.y != "@") {
      morphemeLinks.push({
        source : xpos,
        target : ypos,
        value : 1 //TODO use the context counting to get a weight measure
      });
    }
  }
  
  /*
   * Build the morphemes into nodes and color them by their morpheme length, could be a good measure of outliers
   */
  var morphemenodes = [];
  for (m in morphemes) {
    morphemenodes.push({
      name : morphemes[m],
      group : morphemes[m].length
    });
  }
  
  /*
   * Create the JSON required by D3
   */
  var rulesGraph = {};
  rulesGraph.links = morphemeLinks;
  rulesGraph.nodes = morphemenodes;
  Glosser.rulesGraph = rulesGraph;
  
  return rulesGraph;
}
Glosser.saveAndInterConnectInApp = function(callback){
  
  if(typeof callback == "function"){
    callback();
  }
}
/*
 * Some sample D3 from the force-html.html example
 * 
 */
//Glosser.rulesGraph = Glosser.rulesGraph || {};
Glosser.visualizeMorphemesAsForceDirectedGraph = function(rulesGraph, divElement, pouchname){

  if(pouchname){
    Glosser.currentCorpusName = pouchname;
  }else{
    throw("Must provide corpus name to be able to visualize morphemes");
  }
  if(!rulesGraph){
    rulesGraph = Glosser.rulesGraph;
    if(rulesGraph){
      if(rulesGraph.links.length == 0){
        rulesGraph = Glosser.generateForceDirectedRulesJsonForD3();
      }
    }else{
      rulesGraph = Glosser.generateForceDirectedRulesJsonForD3();
    }
  }
  if(!rulesGraph){
    return;
  }
  if( Glosser.rulesGraph.links.length == 0 ){
    return;
  }
 json = rulesGraph;
  var width = 800,
  height = 300;

  var color = d3.scale.category20();
  
  var x = d3.scale.linear()
     .range([0, width]);
   
  var y = d3.scale.linear()
       .range([0, height - 40]);
  
  var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);
  
  var svg = d3.select("#corpus-precedence-rules-visualization-fullscreen").append("svg")
    .attr("width", width)
    .attr('title', "Morphology Visualization for "+ pouchname)
    .attr("height", height);
  
  var titletext = "Explore the precedence relations of morphemes in your corpus";
  if(rulesGraph.nodes.length < 3){
    titletext = "Your morpheme visualizer will appear here after you have synced.";
  }
  //A label for the current year.
  var title = svg.append("text")
    .attr("class", "vis-title")
    .attr("dy", "2em")
    .attr("dx", "2em")
//    .attr("transform", "translate(" + x(1) + "," + y(1) + ")scale(-1,-1)")
    .text(titletext);
  
  var tooltip = null;
  
  //d3.json("./libs/rules.json", function(json) {
  force
      .nodes(json.nodes)
      .links(json.links)
      .start();
  
  var link = svg.selectAll("line.link")
      .data(json.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });
  
  var node = svg.selectAll("circle.node")
      .data(json.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .on("mouseover", function(d) {
        tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "visible")
        .style("color","#fff")
        .text(d.name)
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
      })
      .call(force.drag);
  
  node.append("title")
      .text(function(d) { return d.name; });
  
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
  //});
};
define("glosser/Glosser", function(){});

define('corpus/CorpusMask',[ 
    "backbone",
    "activity/Activity",
    "comment/Comment",
    "comment/Comments",
    "confidentiality_encryption/Confidential",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumState",
    "datum/DatumStates",
    "data_list/DataList",
    "data_list/DataLists",
    "user/Consultants",
    "lexicon/Lexicon",
    "permission/Permission",
    "permission/Permissions",
    "datum/Session",
    "datum/Sessions",
    "user/User",
    "glosser/Glosser",
    "libs/OPrime"
], function(
    Backbone, 
    Activity,
    Comment, 
    Comments,
    Confidential,
    DatumField,
    DatumFields, 
    DatumState,
    DatumStates,
    DataList,
    DataLists,
    Consultants,
    Lexicon,
    Permission,
    Permissions,
    Session,
    Sessions,
    User
) {
  var CorpusMask = Backbone.Model.extend(
  /** @lends CorpusMask.prototype */
  {
    /**
     * @class The CorpusMask is saved as corpusmask in the Couch repository, it is the publicly visible version of a corpus. By default it just says private but lets users see the data lists and sessions.
     * 
     * 
     * @property {String} title This is used to refer to the corpus, and
     *           what appears in the url on the main website eg
     *           http://fieldlinguist.com/LingLlama/SampleFieldLinguisticsCorpus
     * @property {String} description This is a short description that
     *           appears on the corpus details page
     * @property {String} remote The git url of the remote eg:
     *           git@fieldlinguist.com:LingLlama/SampleFieldLinguisticsCorpus.git
     *           
     * @property {Consultants} consultants Collection of consultants who contributed to the corpus
     * @property {DatumStates} datumstates Collection of datum states used to describe the state of datums in the corpus 
     * @property {DatumFields} datumfields Collection of datum fields used in the corpus
     * @property {Sessions} sessions Collection of sessions that belong to the corpus
     * @property {DataLists} datalists Collection of data lists created under the corpus
     * @property {Permissions} permissions Collection of permissions groups associated to the corpus 
     * 
     *           
     * @property {Glosser} glosser The glosser listens to
     *           orthography/utterence lines and attempts to guess the
     *           gloss.
     * @property {Lexicon} lexicon The lexicon is a list of morphemes,
     *           allomorphs and glosses which are used to index datum, and
     *           also to gloss datum.
     * 
     * @description The initialize function probably checks to see if
     *              the corpus is new or existing and brings it down to
     *              the user's client.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {

      this.datalists =  new DataLists();
      this.sessions =  new Sessions();

      //Hard code this corpus' id so that it will be findable without an id if one knows the corpus name
      this.set("id", "corpus");
      /* Upgrade to version 1.38 */
      if(this.get("corpusId")){
        var corpusid = this.get("corpusid")
        this.set("corpusid", corpusid);
        this.unset("corpusId");
      }
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      //TODO use these states to show what is public and what is not.
      if(!this.get("datumStates")){
        this.set("datumStates", new DatumStates());
      }//end if to set datumStates
      
      //Keeping all items since this seems okay for public viewing/searching if the user wants to let the public see it. 
      if(!this.get("datumFields")){
        this.set("datumFields", new DatumFields(
            [ 
                                               new DatumField({
                                                 label : "judgement",
                                                 size : "3",
                                                 shouldBeEncrypted: "",
                                                 userchooseable: "disabled",
                                                 help: "Use this field to establish your team's gramaticality/acceptablity judgements (*,#,? etc)"
                                               }),
                                               new DatumField({
                                                 label : "utterance",
                                                 shouldBeEncrypted: "checked",
                                                 userchooseable: "disabled",
                                                 help: "Use this as Line 1 in your examples for handouts (ie, either Orthography, or phonemic/phonetic representation)"
                                               }),
                                               new DatumField({
                                                 label : "morphemes",
                                                 shouldBeEncrypted: "checked",
                                                 userchooseable: "disabled",
                                                 help: "This line is used to determine the morpheme segmentation to generate glosses, it also optionally can show up in your LaTeXed examples if you choose to show morpheme segmentation in addtion ot line 1, gloss and translation."
                                               }),
                                               new DatumField({
                                                 label : "gloss",
                                                 shouldBeEncrypted: "checked",
                                                 userchooseable: "disabled",
                                                 help: "This line appears in the gloss line of your LaTeXed examples, we reccomend Leipzig conventions (. for fusional morphemes, - for morpehem boundaries etc) The system uses this line to partially help you in glossing. "
                                               }),
                                               new DatumField({
                                                 label : "translation",
                                                 shouldBeEncrypted: "checked",
                                                 userchooseable: "disabled",
                                                 help: "Use this as your primary translation. It does not need to be English, simply a language your team is comfortable with. If your consultant often gives you multiple languages for translation you can also add addtional translations in the customized fields. For example, your Quechua informants use Spanish for translations, then you can make all Translations in Spanish, and add an additional field for English if you want to generate a handout containing the datum. "
                                               })
                                               ]
            ));
      }//end if to set datumFields
      
      //Removed goal and consultants by default, keeping language and dialect since these seem okay to make public
      if(!this.get("sessionFields")){
        this.set("sessionFields", new DatumFields([ 
                                                   new DatumField({
                                                     label : "dialect",
                                                     shouldBeEncrypted: "",
                                                     userchooseable: "disabled",
                                                     help: "You can use this field to be as precise as you would like about the dialect of this session."
                                                   }),
                                                   new DatumField({
                                                     label : "language",
                                                     shouldBeEncrypted: "",
                                                     userchooseable: "disabled",
                                                     help: "This is the langauge (or language family) if you would like to use it."
                                                   }),
                                                   new DatumField({
                                                     label : "dateElicited",
                                                     shouldBeEncrypted: "",
                                                     userchooseable: "disabled",
                                                     help: "This is the date in which the session took place."
                                                   }),
                                                   new DatumField({
                                                     label : "user",
                                                     shouldBeEncrypted: "",
                                                     userchooseable: "disabled"
                                                   }),
                                                   new DatumField({
                                                     label : "dateSEntered",
                                                     shouldBeEncrypted: "",
                                                     userchooseable: "disabled",
                                                     help: "This is the date in which the session was entered."
                                                   }),
                                                   ]));
        
      }//end if to set sessionFields
      
      
      // If there are no comments, create models
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
     
      if (!this.permissions) {
        this.permissions = new Permissions();
      }
    },
    /**
     * backbone-couchdb adaptor set up
     */
    
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/corpuses",
    
    defaults : {
      title : "Private Corpus",
      titleAsUrl :"PrivateCorpus",
      description : "The details of this corpus are not public.",
//      consultants : Consultants,
//      datumStates : DatumStates,
//      datumFields : DatumFields, 
//      sessionFields : DatumFields,
//      searchFields : DatumFields,
//      couchConnection : JSON.parse(localStorage.getItem("mostRecentCouchConnection")) || OPrime.defaultCouchConnection()
    },
    loadPermissions: function(){
      //TODO decide if we need this method in a corpus mask
    },
    /**
     * this resets the titleAsUrl to match the title, this means if the usr changes the title, their corpu has high chances of not being unique.
     * 
     * @param key
     * @param value
     * @param options
     * @returns
     */
    set: function(key, value, options) {
      var attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key == null) {
        attributes = key;
        options = value;
      } else {
        attributes = {};
        attributes[key] = value;
      }

      options = options || {};
      // do any other custom property changes here
      if(attributes.title){
        attributes.titleAsUrl = attributes.title.toLowerCase().replace(/[!@#$^&%*()+=-\[\]\/{}|:<>?,."'`; ]/g,"_");//this makes the accented char unnecessarily unreadable: encodeURIComponent(attributes.title.replace(/ /g,"_"));
      }
      return Backbone.Model.prototype.set.call( this, attributes, options ); 
    },
    // Internal models: used by the parse function
    internalModels : {
      //removed confidential because we dont want the token to end up in a corpusmask, if it does, then the corpusmask wont be able to parse anyway.
      consultants : Consultants,
      datumStates : DatumStates,
      datumFields : DatumFields, 
      sessionFields : DatumFields,
      searchFields : DatumFields,
//      sessions : Sessions, 
//      dataLists : DataLists, 
      permissions : Permissions,
      comments: Comments
    },
//    glosser: new Glosser(),//DONOT store in attributes when saving to pouch (too big)
    lexicon: new Lexicon(),//DONOT store in attributes when saving to pouch (too big)
    changePouch : function(couchConnection, callback) {
      if (couchConnection == null || couchConnection == undefined) {
        couchConnection = this.get("couchConnection");
      }else{
        this.set("couchConnection", couchConnection);
      }
      
      if(OPrime.isCouchApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }
      if (this.pouch == undefined) {
        this.pouch = Backbone.sync
        .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl
            + couchConnection.pouchname : OPrime.pouchUrl
            + couchConnection.pouchname);
      }

      if (typeof callback == "function") {
        callback();
      }
    }, 
    /**
     * this function makes it possible to save the CorpusMask with a
     * hardcoded id, it uses pouch's API directly
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      OPrime.debug("Saving the CorpusMask");
      var self = this;
      self.set("id","corpus");
      self.set("_id","corpus");
      this.set("timestamp", Date.now());
      
      this.changePouch(null, function(){
        if(OPrime.isCouchApp()){
          self.save();
          if(typeof successcallback == "function"){
            successcallback();
          }
          return;
        }
        self.pouch(function(err,db){
          var modelwithhardcodedid = self.toJSON();
          modelwithhardcodedid._id = "corpus";
          db.put(modelwithhardcodedid, function(err, response) {
            OPrime.debug(response);
            if(err){
              OPrime.debug("CorpusMask put error", err);
              if(err.status == "409"){
                //find out what the rev is in the database by fetching
                self.fetch({
                  success : function(model, response) {
                    OPrime.debug("CorpusMask fetch revision number success, after getting a Document update conflict", response);

                    modelwithhardcodedid._rev = self.get("_rev");
                    OPrime.debug("CorpusMask old version", self.toJSON());
                    OPrime.debug("CorpusMask replaced with new version", modelwithhardcodedid );

                    db.put(modelwithhardcodedid, function(err, response) {
                      if(err){
                        OPrime.debug("CorpusMask put error, even after fetching the version number",err);
                        if(typeof failurecallback == "function"){
                          failurecallback();
                        }
                      }else{
                        OPrime.debug("CorpusMask put success, after fetching its version number and overwriting it", response);
                        //this happens on subsequent save into pouch of this CorpusMask's id
                        if(typeof successcallback == "function"){
                          successcallback();
                        }
                      }
                    });

                  },
                  //fetch error
                  error : function(e) {
                    OPrime.debug('CorpusMask fetch error after trying to resolve a conflict error' + JSON.stringify(err));
                    if(typeof failurecallback == "function"){
                      failurecallback();
                    }
                  }
                });
              }else{
                OPrime.debug('CorpusMask put error that was not a conflict' + JSON.stringify(err));
                //this is a real error, not a conflict error
                if(typeof failurecallback == "function"){
                  failurecallback();
                }
              }
            }else{
              if(typeof successcallback == "function"){
                successcallback();
              }else{
                OPrime.debug("CorpusMask save success", response);
              }
            }
          });
        });
      });      
    },
    /**
     * this function makes it possible to save the CorpusMask with a
     * hardcoded id, it uses pouch's API directly
     */
    updateToPouch : function(){
      alert("Bug: the corpusmask updatetopouch method is deprecated!");
      var self = this;
      this.changePouch(null, function(){

        if(OPrime.isCouchApp()){
          self.save();
          if(typeof successcallback == "function"){
            successcallback();
          }
          return;
        }

        self.pouch(function(err,db){
          var modelwithhardcodedid = self.toJSON();
          modelwithhardcodedid._id = "corpus";
          db.put(modelwithhardcodedid, function(err, response) {
            OPrime.debug(response);
          });
        });
      });
    },
    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more/better monolingual data.
     * 
     * @param pouchname
     * @param callback
     */
    buildMorphologicalAnalyzerFromTeamServer : function(pouchname, callback){
      if(!pouchname){
        this.get("pouchname");
      }
      if(!callback){
        callback = null;
      }
      Glosser.downloadPrecedenceRules(pouchname, callback);
    },
    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more/better monolingual data.
     * 
     * @param pouchname
     * @param callback
     */
    buildLexiconFromTeamServer : function(pouchname, callback){
      if(!pouchname){
        this.get("pouchname");
      }
      if(!callback){
        callback = null;
      }
      this.lexicon.buildLexiconFromCouch(pouchname,callback);
    }
  });
    
  return CorpusMask;
});

define('corpus/Corpus',[ 
    "backbone",
    "comment/Comment",
    "comment/Comments",
    "corpus/CorpusMask",
    "confidentiality_encryption/Confidential",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumState",
    "datum/DatumStates",
//    "text!/_view/datalists",
//    "text!/_view/sessions",
    "data_list/DataList",
    "data_list/DataLists",
    "user/Consultants",
    "lexicon/Lexicon",
    "permission/Permission",
    "permission/Permissions",
    "datum/Session",
    "datum/Sessions",
    "user/Team",
    "user/User",
    "user/Users",
    "user/UserMask",
    "glosser/Glosser",
    "libs/OPrime"
], function(
    Backbone, 
    Comment, 
    Comments,
    CorpusMask,
    Confidential,
    DatumField,
    DatumFields, 
    DatumState,
    DatumStates,
//    forcingdataliststoloadearly,
//    forcingsessionstoloadearly,
    DataList,
    DataLists,
    Consultants,
    Lexicon,
    Permission,
    Permissions,
    Session,
    Sessions,
    Team,
    User,
    Users,
    UserMask
) {
  var Corpus = Backbone.Model.extend(
  /** @lends Corpus.prototype */
  {
    /**
     * @class A corpus is like a git repository, it has a remote, a title
     *        a description and perhaps a readme When the user hits sync
     *        their "branch" of the corpus will be pushed to the central
     *        remote, and we will show them a "diff" of what has
     *        changed.
     * 
     * The Corpus may or may not be a git repository, so this class is
     * to abstract the functions we would expect the corpus to have,
     * regardless of how it is really stored on the disk.
     * 
     * 
     * @property {String} title This is used to refer to the corpus, and
     *           what appears in the url on the main website eg
     *           http://fieldlinguist.com/LingLlama/SampleFieldLinguisticsCorpus
     * @property {String} description This is a short description that
     *           appears on the corpus details page
     * @property {String} remote The git url of the remote eg:
     *           git@fieldlinguist.com:LingLlama/SampleFieldLinguisticsCorpus.git
     *           
     * @property {Consultants} consultants Collection of consultants who contributed to the corpus
     * @property {DatumStates} datumstates Collection of datum states used to describe the state of datums in the corpus 
     * @property {DatumFields} datumfields Collection of datum fields used in the corpus
     * @property {ConversationFields} conversationfields Collection of conversation-based datum fields used in the corpus
     * @property {Sessions} sessions Collection of sessions that belong to the corpus
     * @property {DataLists} datalists Collection of data lists created under the corpus
     * @property {Permissions} permissions Collection of permissions groups associated to the corpus 
     * 
     *           
     * @property {Glosser} glosser The glosser listens to
     *           orthography/utterence lines and attempts to guess the
     *           gloss.
     * @property {Lexicon} lexicon The lexicon is a list of morphemes,
     *           allomorphs and glosses which are used to index datum, and
     *           also to gloss datum.
     * 
     * @description The initialize function probably checks to see if
     *              the corpus is new or existing and brings it down to
     *              the user's client.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      OPrime.debug("CORPUS INIT");
      
      this.datalists =  new DataLists();
      this.sessions =  new Sessions();

      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
      this.bind("change:publicCorpus", this.changeCorpusPublicPrivate, this);

//      var couchConnection = this.get("couchConnection");
//      if(!couchConnection){
//        couchConnection = JSON.parse(localStorage.getItem("mostRecentCouchConnection"));
//        if(!localStorage.getItem("mostRecentCouchConnection")){
//          alert("Bug, need to take you back to the users page.");
//        }
//        this.set("couchConnection", couchConnection);
//      }
//      this.pouch = Backbone.sync
//      .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl
//        + couchConnection.pouchname : OPrime.pouchUrl
//        + couchConnection.pouchname);
      
    },
    loadOrCreateCorpusByPouchName : function(pouchname, sucessloadingorCreatingcallback){
      var corpusself = this;
      if(!this.get("publicSelf")){
        this.set("publicSelf", new CorpusMask({
          "pouchname" : pouchname
        }));
      }
      var c = this.get("publicSelf");
      this.get("publicSelf").id = "corpus";
      c.changePouch({pouchname: pouchname},function(){
        c.fetch({
          success : function(model, response, options) {
            OPrime.debug("Success fetching corpus' public self: ", model, response, options);
            if(!model.get("corpusid")){
              corpusself.fillWithDefaults(sucessloadingorCreatingcallback);
              return;
            }
            corpusself.id = model.get("corpusid");
            corpusself.changePouch({pouchname: pouchname}, function(){
              //fetch only after having setting the right pouch which is what changePouch does.
              corpusself.fetch({
                success : function(model) {
                  OPrime.debug("Corpus fetched successfully", model);
                  $(".spinner-status").html("Loading Datalist...");
                  corpusself.makeSureCorpusHasADataList(function(){
                    corpusself.datalists.at(0).setAsCurrentDataList(function(){
                      $(".spinner-status").html("Datalist loaded.");
                    });
                    $(".spinner-status").html("Loading Elicitation Session...");
                    corpusself.makeSureCorpusHasASession(function(){
                      corpusself.sessions.at(0).setAsCurrentSession(function(){
                        $(".spinner-status").html("Session loaded.");
                        if(typeof sucessloadingorCreatingcallback == "function"){
                          sucessloadingorCreatingcallback();
                        }
                      });
                      
                      //end success to create new data list
                    },function(){
                      alert("Failed to create a session. ");
                    });//end failure to create new data list
                    //end success to create new data list
                  },function(){
                    alert("Failed to create a datalist. ");
                  });//end failure to create new data list

                },
                error : function(model, xhr, options) {
                  $(".spinner-status").html("Downloading Corpus...");

                  OPrime.debug("Error fetching corpus  : ", model, xhr, options);
                  if(corpusself.islooping){
                    OPrime.bug("Couldn't download this corpus to this device. There was an error replicating corpus..."+e);
                    return;
                  }
                  corpusself.islooping = true;
                  OPrime.bug("Trying to download this corpus to this device one more time..."+xhr.reason);
                  corpusself.loadOrCreateCorpusByPouchName(pouchname, sucessloadingorCreatingcallback);
                }
              });
            });
          },
          error : function(model, xhr, options) {
            $(".spinner-status").html("Creating Corpus...");

            OPrime.debug("Error fetching corpus mask : ", model, xhr, options);
            OPrime.bug("Error fetching your corpus' public view..."+xhr.reason);
            corpusself.get("publicSelf").fillWithDefaults();
            corpusself.get("publicSelf").set("couchConnection", corpusself.get("couchConnection"));
            corpusself.get("publicSelf").set("pouchname", corpusself.get("pouchname"));
            corpusself.fillWithDefaults(sucessloadingorCreatingcallback);
          }
        });
      });
    },
    fetchPublicSelf : function(){
      try{
        var corpusself = this;
        if(!this.get("publicSelf")){
          this.set("publicSelf", new CorpusMask());
        }
        this.get("publicSelf").id = "corpus";
        this.get("publicSelf").fetch({sucess: function(model, response, options){
          OPrime.debug("Success fetching corpus' public self: ", model, response, options);
        }, error: function(model, xhr, options){
          OPrime.debug("Error fetching corpus mask : ", model, xhr, options);
          corpusself.get("publicSelf").fillWithDefaults();
          corpusself.get("publicSelf").set("couchConnection", corpusself.get("couchConnection"));
          corpusself.get("publicSelf").set("pouchname", corpusself.get("pouchname"));
        }});
      }catch(e){
        OPrime.bug("");
      }
    },
    fillWithDefaults : function(donefillingcallback){
      if(!this.get("confidential")){
        this.set("confidential", new Confidential({filledWithDefaults : true}) );
      }
      
      if(!this.get("publicSelf")){
        this.set("publicSelf", new CorpusMask({
          "filledWithDefaults" : true,
          "couchConnection" : this.get("couchConnection"),
          "pouchname" : this.get("pouchname")
        }));
      }
      
      if(!this.get("publicCorpus")){
        this.set("publicCorpus", "Private");
      }
      
      if( !this.get("datumStates") || this.get("datumStates").length == 0 ){
        this.set("datumStates", new DatumStates([ 
          new DatumState({
            state : "Checked",
            color : "success",
            selected: "selected"
          }),
          new DatumState({
            state : "To be checked",
            color : "warning"
          }),
          , new DatumState({
            state : "Deleted",
            color : "important",
            showInSearchResults:  ""
          }),
        ]));
      }//end if to set datumStates
      
      if(!this.get("datumFields") || this.get("datumFields").length == 0){
        this.set("datumFields", new DatumFields([ 
          new DatumField({
            label : "judgement",
            size : "3",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "Grammaticality/acceptability judgement (*,#,?, etc). Leaving it blank can mean grammatical/acceptable, or you can choose a new symbol for this meaning."
          }),
          new DatumField({
            label : "utterance",
            shouldBeEncrypted: "checked",
            userchooseable: "disabled",
            help: "Unparsed utterance in the language, in orthography or transcription. Line 1 in your LaTeXed examples for handouts. Sample entry: amigas"
          }),
          new DatumField({
            label : "morphemes",
            shouldBeEncrypted: "checked",
            userchooseable: "disabled",
            help: "Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s"
          }),
          new DatumField({
            label : "gloss",
            shouldBeEncrypted: "checked",
            userchooseable: "disabled",
            help: "Metalanguage glosses of each individual morpheme (above). Used by the system to help gloss, in combination with morphemes (above). Line 2 in your LaTeXed examples. We recommend Leipzig conventions (. for fusional morphemes, - for morpheme boundaries etc)  Sample entry: friend-fem-pl"
          }),
          new DatumField({
            label : "translation",
            shouldBeEncrypted: "checked",
            userchooseable: "disabled",
            help: "Free translation into whichever language your team is comfortable with (e.g. English, Spanish, etc). You can also add additional custom fields for one or more additional translation languages and choose which of those you want to export with the data each time. Line 3 in your LaTeXed examples. Sample entry: (female) friends"
          }),
          new DatumField({
            label : "tags",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "Comma seperated tags for this datum."
          }),
          new DatumField({
            label : "validationStates",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "Has the datum been checked with a language consultant, is it to be checked, deleted or any combination of these. You can create new states for your corpus."
          })
        ]));
      }//end if to set datumFields
      
      if(!this.get("conversationFields") || this.get("conversationFields").length == 0 ){
          this.set("conversationFields", new DatumFields([ 
            new DatumField({
              label : "speakers",
              shouldBeEncrypted: "checked",
              userchooseable: "disabled",
              help: "Use this field to keep track of who your speaker is. You can use names, initials, or whatever your consultants prefer."
            }),
            new DatumField({
                label : "modality",
                shouldBeEncrypted: "",
                userchooseable: "disabled",
                help: "Use this field to indicate if this is a voice or gesture tier, or a tier for another modality."
            })
          ]));
        }
      
      if(!this.get("sessionFields") || this.get("sessionFields").length == 0){
        this.set("sessionFields", new DatumFields([ 
           new DatumField({
             label : "goal",
             shouldBeEncrypted: "",
             userchooseable: "disabled",
             help: "The goals of the session."
           }),  
          new DatumField({
            label : "consultants",
            shouldBeEncrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "dialect",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "The dialect of this session (as precise as you'd like)."
          }),
          new DatumField({
            label : "language",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "The language (or language family), if desired."
          }),
          new DatumField({
            label : "dateElicited",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "The date when the session took place."
          }),
          new DatumField({
            label : "user",
            shouldBeEncrypted: "",
            userchooseable: "disabled"
          }),
          new DatumField({
            label : "dateSEntered",
            shouldBeEncrypted: "",
            userchooseable: "disabled",
            help: "The date when the session data was entered."
          }),
        ]));
        
      }//end if to set sessionFields
      
      
      // If there are no comments, create models
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
//      this.loadPermissions();
      
      if(typeof donefillingcallback == "function"){
        donefillingcallback();
      }
    },
    /**
     * backbone-couchdb adaptor set up
     */
    
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/private_corpuses",
    
    
    loadPermissions: function(doneLoadingPermissions){
      if (!this.get("team")){
        //If app is completed loaded use the user, otherwise put a blank user
        if(window.appView){
          this.set("team", window.app.get("authentication").get("userPublic"));
//          this.get("team").id = window.app.get("authentication").get("userPublic").id;
        }else{
//          this.set("team", new UserMask({pouchname: this.get("pouchname")}));
        }
      }
      
      var corpusself = this;
      // load the permissions in from the server.
      window.app.get("authentication").fetchListOfUsersGroupedByPermissions(function(users){
        var typeaheadusers =  [];
        for(var user in users.notonteam ){
          if(users.notonteam[user].username){
            typeaheadusers.push(users.notonteam[user].username);
          }else{
            OPrime.debug("This user is invalid", users.notonteam[user]);
          }
        }
        typeaheadusers = JSON.stringify(typeaheadusers);
        var potentialusers = users.allusers || [];
        corpusself.permissions = new Permissions();
        
        var admins = new Users();
        corpusself.permissions.add(new Permission({
          users : admins,
          role : "admin",
          typeaheadusers : typeaheadusers,
          potentialusers : potentialusers,
          pouchname: corpusself.get("pouchname")
        }));
        
        var writers = new Users();
        corpusself.permissions.add(new Permission({
          users: writers, 
          role: "writer",
          typeaheadusers : typeaheadusers,
          potentialusers : potentialusers,
          pouchname: corpusself.get("pouchname")
        }));
        
        var readers = new Users();
        corpusself.permissions.add(new Permission({
          users: readers,
          role: "reader",
          typeaheadusers : typeaheadusers,
          potentialusers : potentialusers,
          pouchname: corpusself.get("pouchname")
        }));
        
        if(users.admins && users.admins.length > 0){
          for ( var u in users.admins) {
            if(!users.admins[u].username){
              continue;
            }
            var user = {"username" : users.admins[u].username};
            if(users.admins[u].gravatar){
              user.gravatar = users.admins[u].gravatar;
            }
            admins.models.push(new UserMask(user));
          }
        }
        if(users.writers && users.writers.length > 0){
          for ( var u in users.writers) {
            if(!users.writers[u].username){
              continue;
            }
            var user = {"username" : users.writers[u].username};
            if(users.writers[u].gravatar){
              user.gravatar = users.writers[u].gravatar;
            }
            writers.models.push(new UserMask(user));
          }
        }
        if(users.readers && users.readers.length > 0){
          for ( var u in users.readers) {
            if(!users.readers[u].username){
              continue;
            }
            var user = {"username" : users.readers[u].username};
            if(users.readers[u].gravatar){
              user.gravatar = users.readers[u].gravatar;
            }
            readers.models.push(new UserMask(user));
          }
        }
        //Set up the typeahead for the permissions edit
        
        if(typeof doneLoadingPermissions == "function"){
          doneLoadingPermissions();
        }
      });
      
    },
    
    defaults : {
      title : "Untitled Corpus",
      titleAsUrl :"UntitledCorpus",
      description : "This is an untitled corpus, created by default. Change its title and description by clicking on the pencil icon ('edit corpus').",
//      confidential :  Confidential,
//      consultants : Consultants,
//      datumStates : DatumStates,
//      datumFields : DatumFields,
//      conversationFields : DatumFields,
//      sessionFields : DatumFields,
//      searchFields : DatumFields,
//      couchConnection : JSON.parse(localStorage.getItem("mostRecentCouchConnection")) || OPrime.defaultCouchConnection()
    },
    
    // Internal models: used by the parse function
    internalModels : {
      confidential :  Confidential,
      consultants : Consultants,
      datumStates : DatumStates,
      datumFields : DatumFields, 
      conversationFields : DatumFields,
      sessionFields : DatumFields,
      searchFields : DatumFields,
//      sessions : Sessions, 
//      dataLists : DataLists, 
      publicSelf : CorpusMask,
      comments: Comments,
      team: UserMask
    },
    //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function(commentstring) {
      var m = new Comment({
        "text" : commentstring,
     });
      
      this.get("comments").add(m);
      window.appView.addUnsavedDoc(this.id);
      
      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <i class='icon-cloud'></i><a href='#corpus/"+this.id+"'>this corpus</a>",
            teamOrPersonal : "team",
            context : " via Offline App."
          });
      
      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <i class='icon-cloud'></i><a href='#corpus/"+this.id+"'>"+this.get('title')+"</a>",
            teamOrPersonal : "personal",
            context : " via Offline App."
          });
    },
    newSession : function() {
      $("#new-session-modal").modal("show");
      //Save the current session just in case
      var self = this;
      window.app.get("currentSession").saveAndInterConnectInApp(function(){
        //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
        window.appView.sessionNewModalView.model = new Session({
          comments : new Comments(),
          pouchname : self.get("pouchname"),
          sessionFields : window.app.get("currentSession").get("sessionFields").clone()
        });
        window.appView.sessionNewModalView.render();
      });
    },
    /* 
     */
    newCorpus : function(){
      $("#new-corpus-modal").modal("show");
      //Save the current session just in case
      this.saveAndInterConnectInApp();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      var attributes = JSON.parse(JSON.stringify(this.attributes));
      // Clear the current data list's backbone info and info which we shouldnt clone
      attributes._id = undefined;
      attributes._rev = undefined;
      /*
       * WARNING this might not be a good idea, if you find strange side
       * effects in corpora in the future, it might be due to this way
       * of creating (duplicating) a corpus. However with a corpus it is
       * a good idea to duplicate the permissions and settings so that
       * the user won't have to redo them.
       */
      attributes.title = this.get("title")+ " copy";
      attributes.titleAsUrl = this.get("titleAsUrl")+"Copy";
      attributes.description = "Copy of: "+this.get("description");
//      attributes.sessionFields = new DatumFields(attributes.sessionFields);
      attributes.pouchname = this.get("pouchname")+"copy";
      attributes.couchConnection.pouchname = this.get("pouchname")+"copy";
//      attributes.dataLists = [];
//      attributes.sessions = [];
      attributes.comments = [];
      attributes.publicSelf = {filledWithDefaults: true};
      attributes.team = window.app.get("authentication").get("userPublic").toJSON();
      //clear out search terms from the new corpus's datum fields
      for(var x in attributes.datumFields){
        attributes.datumFields[x].mask = "";
        attributes.datumFields[x].value = "";
      }
      //clear out search terms from the new corpus's conversation fields
      for(var x in attributes.conversationFields){
        attributes.conversationFields[x].mask = "";
        attributes.conversationFields[x].value = "";
      }
      //clear out search terms from the new corpus's session fields
      for(var x in attributes.sessionFields){
        attributes.sessionFields[x].mask = "";
        attributes.sessionFields[x].value = "";
      }
      window.appView.corpusNewModalView.model = new Corpus();
      //be sure internal models are parsed and built.
      window.appView.corpusNewModalView.model.set(window.appView.corpusNewModalView.model.parse(attributes));
      window.appView.corpusNewModalView.render();
    },
    newCorpusSimple : function(){
      $("#new-corpus-modal").modal("show");
      //Save the current session just in case
      this.saveAndInterConnectInApp();
      var attributes = {};
      attributes.title = this.get("title")+ " copy";
      attributes.titleAsUrl = this.get("titleAsUrl")+"Copy";
      attributes.pouchname = this.get("pouchname")+"copy";
      attributes.couchConnection.pouchname = this.get("pouchname")+"copy";
      attributes.publicSelf = {};
      attributes.team = window.app.get("authentication").get("userPublic").toJSON();
      
      window.appView.corpusNewModalView.model = new Corpus();
      window.appView.corpusNewModalView.model.set(window.appView.corpusNewModalView.model.parse(attributes));
      window.appView.corpusNewModalView.render();
    },
    
//    glosser: new Glosser(),//DONOT store in attributes when saving to pouch (too big)
    lexicon: new Lexicon(),//DONOT store in attributes when saving to pouch (too big)
    changePouch : function(couchConnection, callback) {
      if (couchConnection == null || couchConnection == undefined) {
        couchConnection = this.get("couchConnection");
      }
      if(!couchConnection){
        OPrime.debug("Cant change corpus's couch connection");
        return;
      }
      
//      if(this.syncBeforeChangePouch){
//        window.app.get("authentication").syncUserWithServer(function(){
//          if(typeof callback == "function"){
//            callback();
//          }
//        });
//        OPrime.bug("You have to be online and login before you can create a new Corpus.");
//        delete this.syncBeforeChangePouch;
//        return;
//      }
      
      if(OPrime.isCouchApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }
      
      if (this.pouch == undefined) {
        this.pouch = Backbone.sync
        .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl
            + couchConnection.pouchname : OPrime.pouchUrl
            + couchConnection.pouchname);
      }

      if (typeof callback == "function") {
        callback();
      }
    }, 
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     * 
     * - Adds the corpus to the corpus if it is in the right corpus, and wasn't already there
     * - Adds the corpus to the user if it wasn't already there
     * - Adds an activity to the logged in user with diff in what the user changed. 
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      OPrime.debug("Saving the Corpus");
      var self = this;
      var newModel = false;
      if(!this.id){
        /*
         * If this is a new corpus, and we are not in it's database, ask the server to create the databse and loop until it is created, then save it.
         */
        newModel = true;
        this.syncBeforeChangePouch = true;
        var potentialpouchname = this.get("pouchname");
        if(!this.get("pouchname")){
          potentialpouchname = this.get("team").get("username")
          +"-"+this.get("title").replace(/[^a-zA-Z0-9-._~ ]/g,"") ;
          this.set("pouchname", potentialpouchname) ;
        }
        if(!this.get("couchConnection")){
          this.get("couchConnection").pouchname = this.get("team").get("username")
          +"-"+this.get("title").replace(/[^a-zA-Z0-9-._~ ]/g,"") ;
        }
        if(OPrime.isCouchApp()){
          if(window.location.href.indexOf(potentialpouchname) > -1){
            this.syncBeforeChangePouch = false;
          }
        }
        /* faking the date of last datum to avoid having a old session pop up */
        this.set("dateOfLastDatumModifiedToCheckForOldSession", JSON.stringify(new Date()) );
        
        delete this.get("couchConnection").corpusid;
        //make sure the corpus is in the history of the user to trigger the server to create the database before we go further
        var pouches = _.pluck(window.app.get("authentication").get("userPrivate").get("corpuses"), "pouchname");
        if(pouches.indexOf(potentialpouchname) == -1){
          window.app.get("authentication").get("userPrivate").get("corpuses").unshift(this.get("couchConnection"));
        }
//        window.app.get("authentication").get("userPrivate").set("mostRecentIds", {});
//        window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = "";
//        window.app.get("authentication").get("userPrivate").get("mostRecentIds").couchConnection = this.get("couchConnection");
        if(this.syncBeforeChangePouch){
          var newCorpusToBeSaved = this;
          window.app.get("authentication").syncUserWithServer(function(){
            
            /*
             * Redirect the user to their user page, being careful to use their (new) database if they are in a couchapp (not the database they used to register/create this corpus)
             */
            var optionalCouchAppPath = "";
            if(OPrime.isCouchApp()){
              optionalCouchAppPath = "/"+potentialpouchname+"/_design/pages/";
            }
            OPrime.checkToSeeIfCouchAppIsReady(optionalCouchAppPath+"corpus.html", function(){
//              OPrime.bug("Attempting to save the new corpus in its database.");
              try{
                Backbone.couch_connector.config.db_name = potentialpouchname;
              }catch(e){
                OPrime.debug("Couldn't set the database name off of the pouchame.");
              }
              newCorpusToBeSaved.changePouch(null, function(){
                alert("Saving new corpus.");
                newCorpusToBeSaved.save(null, {
                  success : function(model, response) {
                    model.get("publicSelf").set("corpusid", model.id);
                    window.app.get("authentication").get("userPrivate").set("mostRecentIds", {});
                    window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = model.id;
                    model.get("couchConnection").corpusid = model.id;
                    window.app.get("authentication").get("userPrivate").get("mostRecentIds").couchConnection = model.get("couchConnection");
                    window.app.get("authentication").get("userPrivate").get("corpuses")[0] = model.get("couchConnection");

                    var sucessorfailcallbackforcorpusmask = function(){
                      window.app.get("authentication").saveAndInterConnectInApp(function(){
                        alert("Saved corpus in your user.");
                        window.location.replace(optionalCouchAppPath+ "user.html#/corpus/"+potentialpouchname+"/"+model.id);
                      });
                    };
                    model.get("publicSelf").saveAndInterConnectInApp(sucessorfailcallbackforcorpusmask, sucessorfailcallbackforcorpusmask);
                    
                  },error : function(e,f,g) {
                    alert('New Corpus save error ' + f.reason);
                  }
                });
              });
            }, OPrime.checkToSeeIfCouchAppIsReady);
            
          });
          OPrime.debug("Contacting the server to ask it to make a new database for you...");
          return;
        }
        
      }else{
        this.get("couchConnection").corpusid = this.id;
        if(!this.get("couchConnection").path){
          this.get("couchConnection").path = "";
        }
      }
      var oldrev = this.get("_rev");
      
      /*
       * For some reason the corpus is getting an extra state that no one defined in it. this gets rid of it when we save.
       */
      try{
        var ds = this.get("datumStates").models;
        for (var s in ds){
          if(ds[s].get("state") == undefined){
            this.get("datumStates").remove(ds[s]);
          }
        }
      }catch(e){
        OPrime.debug("Removing empty states work around failed some thing was wrong.",e);
      }
      
      this.set("timestamp", Date.now());
      
      this.changePouch(null,function(){
        self.save(null, {
          success : function(model, response) {
            OPrime.debug('Corpus save success');
            var title = model.get("title");
            var differences = "#diff/oldrev/"+oldrev+"/newrev/"+response._rev;
            //TODO add privacy for corpus in corpus
//            if(window.app.get("corpus").get("keepCorpusDetailsPrivate")){
//              title = "";
//              differences = "";
//            }
            //save the corpus mask too
            var publicSelfMode = model.get("publicSelf");
            publicSelfMode.set("corpusid", model.id);
            if(publicSelfMode.changePouch){
              publicSelfMode.changePouch( model.get("couchConnection"), function(){
                publicSelfMode.saveAndInterConnectInApp();
              });
            }
            
            if(window.appView){
              window.appView.toastUser("Sucessfully saved corpus: "+ title,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "updated";
            verbicon = "icon-pencil";
            if(newModel){
              verb = "added";
              verbicon = "icon-plus";
            }
            var teamid = model.get("team").id; //Works if UserMask was saved
            if(!teamid){
              teamid = model.get("team")._id; //Works if UserMask came from a mongodb id
              if(!teamid){
                if(model.get("team").get("username") == window.app.get("authentication").get("userPrivate").get("username")){
                  teamid = window.app.get("authentication").get("userPrivate").id; //Assumes the user private and team are the same user...this is dangerous
                }
              }
              /**
               * The idea of the masks in the activity
               * is that the teams/users can make a
               * public activity feed, which they create
               * a special widget user for, and if the
               * widget user asks for activities, the
               * map reduce function returns only the
               * masks, whcih means that the original
               * activities are protected. so if the
               * activity is soemthing that you might
               * want to appear in a really public feed,
               * then add a mask to it, and it will
               * automatically appear. this can probably
               * be done for all activities later. Right
               * now its only in the syncing aspect so
               * at least we can test the map reduce
               * function.
               */
              window.app.addActivity(
                  {
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  });
              window.app.addActivity(
                  {
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>this team</a>",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>this team</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  });
            }else{
              window.app.addActivity(
                  {
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>"+teamid+"</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  });
              window.app.addActivity(
                  {
                    verb : "<a href='"+differences+"'>"+verb+"</a> ",
                    verbmask : verb,
                    verbicon : verbicon,
                    directobject : "<a href='#corpus/"+model.id+"'>"+title+"</a>",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>this team</a>",
                    indirectobject : "owned by <a href='#user/"+teamid+"'>this team</a>",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  });
            }
            model.get("couchConnection").corpusid = model.id;
            //make sure the corpus is updated in the history of the user
            var pouches = _.pluck(window.app.get("authentication").get("userPrivate").get("corpuses"), "pouchname");
            var oldconnection = pouches.indexOf(model.get("couchConnection").pouchname);
            if(oldconnection != -1){
              window.app.get("authentication").get("userPrivate").get("corpuses").splice(oldconnection, 1);
            }
            window.app.get("authentication").get("userPrivate").get("corpuses").unshift(model.get("couchConnection"));
            
            if(newModel){
              
              self.makeSureCorpusHasADataList(function(){
                self.makeSureCorpusHasASession(function(){
                  //save the internal models go to the user dashboard to to load the corpus into the dashboard
                  self.save(null, {
                    success : function(model, response) {
                      window.app.get("authentication").saveAndInterConnectInApp(function(){
                        
                      });
                    },error : function(e,f,g) {
                      alert('New Corpus save error' + f.reason);
                    }
                  });

                  //end success to create new session
                },function(e){
                  alert("Failed to create a session. "+e);
                });//end failure to create new session
                //end success to create new data list
              },function(){
                alert("Failed to create a datalist. "+e);
              });//end failure to create new data list
              
             
            }else{
              //if an existing corpus
              window.app.get("authentication").saveAndInterConnectInApp();
              if(typeof successcallback == "function"){
                successcallback();
              }
            }
          },
          error : function(model, response, options) {
            OPrime.debug("Corpus save error", model, response, options);
//            if(response && response.reason && response.reason == "unauthorized"){
//              alert('Corpus save error: ' + response.reason);
//              window.app.get("authentication").syncUserWithServer(function(){
//              
//              });
//            }

            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
            }
          }
        });
      });
    },
    makeSureCorpusHasADataList : function(sucess, failure){
      if(!this.datalists){
        this.datalists = new DataLists();
      }
      if(this.datalists.length > 0){
        if (typeof sucess == "function"){
          sucess();
          return;
        }
      }
      
      var self = this;
      this.datalists.fetch({
        error : function(model, xhr, options) {
          OPrime.bug("There was an error loading your datalists.");
          console.log(model,xhr,options);
          OPrime.bug("There was an error loading your datalists.");
        },
        success : function(model, response, options) {
          if (response.length > 0) {
            if(typeof sucess == "function"){
              sucess();
            }else{
              OPrime.debug('the corpus has datalists');
            }
          }else{
            OPrime.debug("You have no datalists, creating a new one...");
          //create the first datalist for this corpus.
            var dl = new DataList({
              filledWithDefaults: true,
              pouchname : self.get("pouchname")
              }); //MUST be a new model, other wise it wont save in a new pouch.
            dl.set({
              "title" : "Default Datalist - Empty",
              "dateCreated" : (new Date()).toDateString(),
              "description" : "The app comes with a default datalist which is empty. " +
              "Once you have data in your corpus, you can create a datalist using Search. Imported data will also show up as a datalist. " +
              "Datalists can be used to create handouts, export to LaTeX, or share with collaborators.",
              "pouchname" : self.get("pouchname")
            });
            dl.set("dateCreated",JSON.stringify(new Date()));
            dl.set("dateModified", JSON.stringify(new Date()));
            if(!OPrime.isCouchApp()){
              dl.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + self.get("pouchname") : OPrime.pouchUrl + self.get("pouchname"));
            }
            dl.save(null, {
              success : function(model, response) {
                window.app.get("authentication").get("userPrivate").get("dataLists").unshift(model.id);
                self.datalists.unshift(model);
                
                if(typeof sucess == "function"){
                  sucess();
                }else{
                  OPrime.debug('DataList save success' + model.id);
                }
              },
              error : function(e) {
                if(typeof failure == "function"){
                  failure();
                }else{
                  OPrime.debug('DataList save error' + e);
                }
              }
            });
          }
        }
      });
    },
    
    makeSureCorpusHasASession : function(suces, fail){
      if(!this.sessions){
        this.sessions = new Sessions();
      }
      if(this.sessions.length > 0){
        if (typeof suces == "function"){
          suces();
          return;
        }
      }
      var self = this;
      this.sessions.fetch({
        error : function(model, xhr, options) {
          
          OPrime.debug("There was an error loading your sessions.");
          console.log(model,xhr,options);
          OPrime.bug("There was an error loading your sessions.");
          
        },
        success : function(model, response, options) {
          if (response.length > 0) {
            if(typeof suces == "function"){
              suces();
            }else{
              OPrime.debug('the corpus has sessions');
            }
          }else{
            OPrime.debug("You have no sessions, creating a new one...");
            var s = new Session({
              sessionFields : self.get("sessionFields").clone(),
              filledWithDefaults: true,
              pouchname : self.get("pouchname")
            }); //MUST be a new model, other wise it wont save in a new pouch.
            s.set("dateCreated",JSON.stringify(new Date()));
            s.set("dateModified", JSON.stringify(new Date()));
            
            if(!OPrime.isCouchApp()){
              s.pouch = Backbone.sync.pouch(OPrime.isAndroidApp() ? OPrime.touchUrl + self.get("pouchname") : OPrime.pouchUrl + self.get("pouchname"));
            }
            s.save(null, {
              success : function(model, response) {
                window.app.get("authentication").get("userPrivate").get("sessionHistory").unshift(model.id);
                self.sessions.unshift(model);

                if(typeof suces == "function"){
                  suces();
                }else{
                  OPrime.debug('Session save success' + model.id);
                }
              },
              error : function(e) {
                if(typeof fail == "function"){
                  fail();
                }else{
                  OPrime.debug('Session save error' + e);
                }
              }
            });
          }
        }
      });
    },
    /**
     * If more views are added to corpora, add them here
     * @returns {} an object containing valid map reduce functions
     * TODO: add conversation search to the get_datum_fields function
     */
    validCouchViews : function(){
      return {
        "pages/by_date" : {
          map: function(doc) {if (doc.dateModified) {emit(doc.dateModified, doc);}}
        },
        "pages/get_datum_fields" : {
          map : function(doc) {if ((doc.datumFields) && (doc.session)) {var obj = {};for (i = 0; i < doc.datumFields.length; i++) {if (doc.datumFields[i].mask) {obj[doc.datumFields[i].label] = doc.datumFields[i].mask;}}if (doc.session.sessionFields) {for (j = 0; j < doc.session.sessionFields.length; j++) {if (doc.session.sessionFields[j].mask) {obj[doc.session.sessionFields[j].label] = doc.session.sessionFields[j].mask;}}}emit(obj, doc._id);}}
        }
      };
    },
    createPouchView: function(view, callbackpouchview){
      if(!window.validCouchViews){
        window.validCouchViews = this.validCouchViews();
      }
      var viewparts = view.split("/");
      if(viewparts.length != 2){
        console.log("Warning "+view+ " is not a valid view name.");
        return;
      }
      var corpusself = this;
      if(!this.get("couchConnection")){
        return;
      }
      if(OPrime.isCouchApp()){
        //TODO make the view in couchdb
        if(typeof callbackpouchview == "function"){
          callbackpouchview();
        }
        return;
      }
      
      this.changePouch(null, function() {
        corpusself.pouch(function(err, db) {
          var modelwithhardcodedid = {
              "_id": "_design/"+viewparts[0],
              "language": "javascript",
              "views": {
//                "by_id" : {
//                      "map": "function (doc) {if (doc.dateModified) {emit(doc.dateModified, doc);}}"
//                  }
              }
           };
          modelwithhardcodedid.views[viewparts[1]] = {map : window.validCouchViews[view].map.toString()};
          if(window.validCouchViews[view].reduce){
            modelwithhardcodedid.views[viewparts[1]].reduce =  window.validCouchViews[view].reduce.toString();
          }

          console.log("This is what the doc will look like: ", modelwithhardcodedid);
          db.put(modelwithhardcodedid, function(err, response) {
            OPrime.debug(response);
            if(err){
              OPrime.debug("The "+view+" view couldn't be created.");
            }else{
              
              OPrime.debug("The "+view+" view was created.");
              if(typeof callbackpouchview == "function"){
                callbackpouchview();
              }
              
              
            }
          });
        });
      });
      
    },
    /**
     * Accepts two functions success will be called if successful,
     * otherwise it will attempt to render the current corpus views. If
     * the corpus isn't in the current corpus it will call the fail
     * callback or it will alert a bug to the user. Override the fail
     * callback if you don't want the alert.
     * 
     * @param successcallback
     * @param failurecallback
     */
    setAsCurrentCorpus : function(successcallback, failurecallback){
      //TODO think about how to switch corpuses... maybe take the most recent session and data list and set those at the same time, it should be okay.
//      if( window.app.get("corpus").get("pouchname") != this.get("pouchname") ){
//        if (typeof failurecallback == "function") {
//          failurecallback();
//        }else{
//          alert("This is a bug, cannot load the corpus you asked for, it is not in this corpus. This will make the app reload.");
//        }
//        return;
//    }else{
      if (window.app.get("corpus").id != this.id ) {
        window.app.set("corpus", this);
      }
      window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = this.id;
      window.app.get("authentication").get("userPrivate").get("mostRecentIds").couchConnection = this.get("couchConnection");
      window.app.get("authentication").saveAndInterConnectInApp();

      //If there is no view, we are done.
      if(! window.appView){
        successcallback();
        return;
      }

      if(window.appView){
        window.appView.setUpAndAssociateViewsAndModelsWithCurrentCorpus(function() {
          if (typeof successcallback == "function") {
            successcallback();
          }else{
            window.appView.toastUser("Sucessfully connected all views up to corpus: "+ this.id,"alert-success","Connected!");
//          window.appView.renderEditableCorpusViews();
//          window.appView.renderReadonlyCorpusViews();
          }
        });
      }else{
        if (typeof successcallback == "function") {
          successcallback();
        }
      }
    },
    /**
     * Synchronize the server and local databases. First to, then from.
     */
    replicateCorpus : function(couchConnection, successcallback, failurecallback) {
      var self = this;
      this.replicateToCorpus(couchConnection, function(){
        
        //if to was successful, call the from.
        self.replicateFromCorpus(couchConnection, successcallback, failurecallback );
        
      },function(){
        alert("Replicate to corpus failure");
        if(typeof fromcallback == "function"){
          fromcallback();
        }
      });
    },
    /**
     * Synchronize to server and from database.
     */
    replicateToCorpus : function(couchConnection, replicatetosuccesscallback, failurecallback) {
      var self = this;
      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      if(OPrime.isCouchApp()){
        if(typeof replicatetosuccesscallback == "function"){
          replicatetosuccesscallback();
        }
        return;
      }
      
      this.changePouch(couchConnection, function(){
        self.pouch(function(err, db) {
          var couchurl = couchConnection.protocol+couchConnection.domain;
          if(couchConnection.port != null){
            couchurl = couchurl+":"+couchConnection.port;
          }
          couchurl = couchurl +couchConnection.path+"/"+ couchConnection.pouchname;
          
          db.replicate.to(couchurl, { continuous: false }, function(err, response) {
            OPrime.debug("Replicate to " + couchurl);
            OPrime.debug(response);
            OPrime.debug(err);
            if(err){
              if(typeof failurecallback == "function"){
                failurecallback();
              }else{
                alert('Corpus replicate to error' + JSON.stringify(err));
                OPrime.debug('Corpus replicate to error' + JSON.stringify(err));
              }
            }else{
              OPrime.debug("Corpus replicate to success", response);
              window.appView.allSyncedDoc();
              window.app.addActivity(
                  {
                    verb : "uploaded",
                    verbmask : "uploaded",
                    verbicon : "icon-arrow-up",
                    directobject : "<a href='#corpus/"+self.id+"'>"+self.get('title')+"</a> (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "to the team server",
                    indirectobjectmask : "to its team server",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  });
              window.app.addActivity(
                  {
                    verb : "uploaded",
                    verbmask : "uploaded",
                    verbicon : "icon-arrow-up",
                    directobject : "<a href='#corpus/"+self.id+"'>"+self.get('title')+"</a> (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "to the team server",
                    indirectobjectmask : "to its team server",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  });
              
              

              if(typeof replicatetosuccesscallback == "function"){
                replicatetosuccesscallback();
              }
            }
          });
        });
      });
    },
    /**
     * Synchronize from server to local database.
     */
    replicateFromCorpus : function(couchConnection, successcallback, failurecallback) {
      var self = this;
      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      
      if(OPrime.isCouchApp()){
        if(typeof successcallback == "function"){
          successcallback();
        }
        return;
      }
      
      this.changePouch(couchConnection, function(){
        self.pouch(function(err, db) {
          var couchurl = couchConnection.protocol+couchConnection.domain;
          if(couchConnection.port != null){
            couchurl = couchurl+":"+couchConnection.port;
          }
          couchurl = couchurl  +couchConnection.path+"/"+ couchConnection.pouchname;
          
          
          //We can leave the to and from replication async, and make two callbacks. 
          db.replicate.from(couchurl, { continuous: false }, function(err, response) {
            OPrime.debug("Replicate from " + couchurl);
            OPrime.debug(response);
            OPrime.debug(err);
            if(err){
              if(typeof failurecallback == "function"){
                failurecallback();
              }else{
                alert('Corpus replicate from error' + JSON.stringify(err));
                OPrime.debug('Corpus replicate from error' + JSON.stringify(err));
              }
            }else{
              OPrime.debug("Corpus replicate from success", response);

              //This was a valid connection, lets save it into localstorage.
//              localStorage.setItem("mostRecentCouchConnection",JSON.stringify(couchConnection));
              
              if(typeof successcallback == "function"){
                successcallback();
              }
              window.app.addActivity(
                  {
                    verb : "downloaded",
                    verbmask : "downloaded",
                    verbicon : "icon-arrow-down",
                    directobject : "<a href='#corpus/"+self.id+"'>"+self.get('title')+"</a>  (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "from the team server",
                    indirectobjectmask : "from its team server",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "team"
                  });
              window.app.addActivity(
                  {
                    verb : "downloaded",
                    verbmask : "downloaded",
                    verbicon : "icon-arrow-down",
                    directobject : "<a href='#corpus/"+self.id+"'>"+self.get('title')+"</a> (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    directobjectmask : "a corpus",
                    directobjecticon : "icon-cloud",
                    indirectobject : "from the team server",
                    indirectobjectmask : "from its team server",
                    context : " via Offline App.",
                    contextmask : "",
                    teamOrPersonal : "personal"
                  });

              // Get the corpus' current precedence rules
              self.buildMorphologicalAnalyzerFromTeamServer(self.get("pouchname"));
              
              // Build the lexicon
              self.buildLexiconFromTeamServer(self.get("pouchname"));
            }
          });
        });
        
      });
    },
    
    /**
     * Log the user into their corpus server automatically using cookies and post so that they can replicate later.
     * "http://localhost:5984/_session";
     * 
     * References:
     * http://guide.couchdb.org/draft/security.html
     * 
     * @param username this can come from a username field in a login, or from the User model.
     * @param password this comes either from the UserWelcomeView when the user logs in, or in the quick authentication view.
     * @param callback A function to call upon success, it receives the data back from the post request.
     */
    logUserIntoTheirCorpusServer : function(couchConnection, username, password, succescallback, failurecallback) {
      //TODO move this code to the app version of this function
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = this.get("couchConnection");
      }
      
      /* if on android, turn on replication and dont get a session token */
      if(OPrime.isTouchDBApp()){
        Android.setCredentialsAndReplicate(couchConnection.pouchname,
            username, password, couchConnection.domain);
        OPrime
        .debug("Not getting a session token from the users corpus server " +
            "since this is touchdb on android which has no rights on iriscouch, and also has no tokens.");
        if (typeof succescallback == "function") {
          succescallback();
        }
        return;
      }
      
      
      var couchurl = couchConnection.protocol + couchConnection.domain;
      if (couchConnection.port != null) {
        couchurl = couchurl + ":" + couchConnection.port;
      }
      if(!couchConnection.path){
        couchConnection.path = "";
//        this.get("couchConnection").path = "";
      }
      couchurl = couchurl  + couchConnection.path + "/_session";
      var corpusloginparams = {};
      corpusloginparams.name = username;
      corpusloginparams.password = password;
      $.ajax({
        type : 'POST',
        url : couchurl ,
        data : corpusloginparams,
        success : function(serverResults) {
          if(window.appView){
            window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
          }
          
          /* if in chrome extension, or offline, turn on replication */
          if(OPrime.isChromeApp()){
            //TODO turn on pouch and start replicating and then redirect user to their user page(?)
          }
          
          if (typeof succescallback == "function") {
            succescallback(serverResults);
          }
        },
        error : function(serverResults){
          window.setTimeout(function(){
            //try one more time 5 seconds later 
            $.ajax({
              type : 'POST',
              url : couchurl ,
              success : function(serverResults) {
                if(window.appView){
                  window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
                }
                if (typeof succescallback == "function") {
                  succescallback(serverResults);
                }
              },
              error : function(serverResults){
                if(window.appView){
                  window.appView.toastUser("I couldn't log you into your corpus. What does this mean? " +
                      "This means you can't upload data to train an auto-glosser or visualize your morphemes. " +
                      "You also can't share your data with team members. If your computer is online and you are" +
                      " using the Chrome Store app, then this probably the side effect of a bug that we might not know about... please report it to us :) " +OPrime.contactUs+
                      " If you're offline you can ignore this warning, and sync later when you're online. ","alert-danger","Offline Mode:");
                }
                if (typeof failurecallback == "function") {
                  failurecallback("I couldn't log you into your corpus.");
                }
                OPrime.debug(serverResults);
                window.app.get("authentication").set("staleAuthentication", true);
              }
            });
          }, 5000);
        }
      });
    },
    validate: function(attrs){
      if(attrs.publicCorpus){
        if(attrs.publicCorpus != "Public"){
          if(attrs.publicCorpus != "Private"){
            return "Corpus must be either Public or Private"; //TODO test this.
          }
        }
      }
    },
    set: function(key, value, options) {
      var attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key == null) {
        attributes = key;
        options = value;
      } else {
        attributes = {};
        attributes[key] = value;
      }

      options = options || {};
      // do any other custom property changes here
      if(attributes.title){
        attributes.titleAsUrl = attributes.title.toLowerCase().replace(/[!@#$^&%*()+=-\[\]\/{}|:<>?,."'`; ]/g,"_");//this makes the accented char unnecessarily unreadable: encodeURIComponent(attributes.title.replace(/ /g,"_"));
      }
      return Backbone.Model.prototype.set.call( this, attributes, options ); 
    },
    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus in case there is a master corpus with
     * more/better monolingual data.
     * 
     * @param pouchname
     * @param callback
     */
    buildMorphologicalAnalyzerFromTeamServer : function(pouchname, callback){
      if(!pouchname){
        this.get("pouchname");
      }
      if(!callback){
        callback = null;
      }
      Glosser.downloadPrecedenceRules(pouchname, callback);
    },
    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more/better monolingual data.
     * 
     * @param pouchname
     * @param callback
     */
    buildLexiconFromTeamServer : function(pouchname, callback){
      if(!pouchname){
        this.get("pouchname");
      }
      if(!callback){
        callback = null;
      }
      this.lexicon.buildLexiconFromCouch(pouchname,callback);
    },
    
    /**
     * This function takes in a pouchname, which could be different
     * from the current corpus incase there is a master corpus wiht
     * more representative datum 
     * example : https://ifielddevs.iriscouch.com/lingllama-cherokee/_design/pages/_view/get_frequent_fields?group=true
     * 
     * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
     * 
     * If a url is passed, it contacts the server for fresh info. 
     * 
     * @param pouchname
     * @param callback
     */
    getFrequentDatumFields : function(jsonUrl, pouchname, callback){
      if(!jsonUrl){
        /* if we have already asked the server in this session, return */
        if(this.frequentDatumFields){
          if(typeof callback == "function"){
            callback(this.frequentDatumFields);
          }
          return;
        }
        var couchConnection = this.get("couchConnection");
        var couchurl = couchConnection.protocol+couchConnection.domain;
        if(couchConnection.port != null){
          couchurl = couchurl+":"+couchConnection.port;
        }
        if(!pouchname){
          pouchname = couchConnection.pouchname;
          /* if the user has overriden the frequent fields, use their preferences */
          if(this.get("frequentDatumFields")){
            if(typeof callback == "function"){
              callback(this.get("frequentDatumFields"));
            }
            return;
          }
        }
        jsonUrl = couchurl +couchConnection.path+"/"+ pouchname+ "/_design/pages/_view/get_frequent_fields?group=true";
      }
     
      var self = this;
      $.ajax({
        type : 'GET',
        url : jsonUrl,
        data : {},
        beforeSend : function(xhr) {
          /* Set the request header to say we want json back */
          xhr.setRequestHeader('Accept', 'application/json');
        },
        complete : function(e, f, g) {
          /* do nothing */
          OPrime.debug(e, f, g);
        },
        success : function(serverResults) {
          console.log("serverResults"
              + JSON.stringify(serverResults));

          var counts = _.pluck(serverResults.rows, "value");
          OPrime.debug(counts);
          var frequentFields = [];
          try{
            var totalDatumCount = serverResults.rows[(_.pluck(
                serverResults.rows, "key").indexOf("datumTotal"))].value;
            
            for ( var field in serverResults.rows) {
              if(serverResults.rows[field].key == "datumTotal"){
                continue;
              }
              if (serverResults.rows[field].value / totalDatumCount * 100 > 50) {
                OPrime.debug("Considering "+ serverResults.rows[field].key+ " as frequent (in more than 50% of datum) : "+ serverResults.rows[field].value / totalDatumCount * 100 );
                frequentFields.push( serverResults.rows[field].key );
              }
            }
          }catch(e){
            OPrime.debug("There was a problem extracting the frequentFields, instead using defaults : ",e);
            frequentFields = ["judgement","utterance","morphemes","gloss","translation"];
          }
          if(frequentFields == []){
            frequentFields = ["judgement","utterance","morphemes","gloss","translation"];
          }
          self.frequentDatumFields = frequentFields;
          if (typeof callback == "function") {
            callback(frequentFields);
          }
        },// end successful fetch
        error : function(response) {
          OPrime
          .debug("There was a problem getting the frequent datum fields, using defaults."
              + JSON.stringify(response));
          if (typeof callback == "function") {
            callback(["judgement","utterance","morphemes","gloss","translation"]);
          }
          
          //end error 
        },
          dataType : "json"
        });
    },
    changeCorpusPublicPrivate : function(){
//      alert("TODO contact server to change the public private of the corpus");
    }
  });
    
  return Corpus;
});

define('user/UserRouter',[ 
    "backbone",
    "corpus/Corpus",
    "user/User",
    "libs/OPrime"
], function(
    Backbone,
    Corpus,
    User
) {
  var UserRouter = Backbone.Router.extend(
  /** @lends UserRouter.prototype */
  {
    /**
     * @class Routes URLs to handle the user dashboard. Mostly just
     *        shows the user a list of their corpora so they can switch
     *        between corpora.
     * 
     * @extends Backbone.Router
     * @constructs
     */
    initialize : function() {
    },

    routes : {
      "corpus/:pouchname/:id"           : "showCorpusDashboard", 
      "corpus/:pouchname/"              : "guessCorpusIdAndShowDashboard", 
      "corpus/:pouchname"               : "guessCorpusIdAndShowDashboard", 
      "login/:pouchname"                : "showQuickAuthenticateAndRedirectToDatabase",
      "render/:render"                  : "showDashboard",
      ""                                : "showDashboard"
    },
    
    /**
     * Displays the dashboard view of the user loaded in authentication
     * 
     */
    showDashboard : function(renderOrNot) {
      OPrime.debug("In showDashboard: " );
//      $("#user-modal").modal("show");

    },
    /**
     * Displays the dashboard view of the user loaded in authentication
     * 
     */
    showFullscreenUser : function() {
      OPrime.debug("In showFullscreenUser: " );
    },
    showQuickAuthenticateAndRedirectToDatabase : function(pouchname){
      window.app.set("corpus", new Corpus()); 
      window.app.get("authentication").syncUserWithServer(function(){
        var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(pouchname);
        window.location.replace(optionalCouchAppPath+"corpus.html");
    });
    },
    guessCorpusIdAndShowDashboard : function(pouchname){
//      if(pouchname == "new"){
//        alert("Creating a new corpus and direct you to its dashboard...");
//
//        try{
//          Backbone.couch_connector.config.db_name = window.app.get("authentication").get("userPrivate").get("corpuses").pouchname;
//        }catch(e){
//          OPrime.debug("Couldn't set the database name off of the pouchame.");
//        }
//        
//        var c = new Corpus();
//        c.set({
//          "title" : window.app.get("authentication").get("userPrivate").get("username") + "'s Corpus",
//          "description": "This is your first Corpus, you can use it to play with the app... When you want to make a real corpus, click New : Corpus",
//          "team" : window.app.get("authentication").get("userPublic"),
//          "couchConnection" : window.app.get("authentication").get("userPrivate").get("corpuses")[0],
//          "pouchname" : window.app.get("authentication").get("userPrivate").get("corpuses").pouchname
//        });
//        //This should trigger a redirect to the users page, which loads the corpus, and redirects to the corpus page.
//        c.saveAndInterConnectInApp();
//        
//        return;
//      }
      
      try{
        Backbone.couch_connector.config.db_name = pouchname;
      }catch(e){
        OPrime.debug("Couldn't set the database name off of the pouchame.");
      }
      
      var c = new Corpus();
      c.set({
        "pouchname" : pouchname
      });
      c.id = "corpus";
      c.changePouch({pouchname: pouchname},function(){
        c.fetch({
          success : function(model) {
            OPrime.debug("Corpus fetched successfully", model);
            var corpusidfromCorpusMask = model.get("corpusid");
            /* Upgrade to version 1.38 */
            if(!corpusidfromCorpusMask){
              corpusidfromCorpusMask = model.get("corpusId");
            }
            if(corpusidfromCorpusMask){
              window.app.router.showCorpusDashboard(pouchname, corpusidfromCorpusMask);
            }else{
              OPrime.bug("There was a problem loading this corpus.");
              /* TODO get the id of the only corpus in the database */
            }
          },
          error : function(e, x, y ) {
            OPrime.debug("Problem opening the dashboard ", e, x, y);
            var reason = "";
            if(x){
              reason = x.reason;
            }
            OPrime.debug("There was a potential problem opening your dashboard." + reason);
          }
        });
      });
    },
    
    /**
     * Loads the requested corpus, and redirects the user to the corpus dashboard 
     * 
     * @param {String}
     *          pouchname The name of the corpus this datum is from.
     */
    showCorpusDashboard : function(pouchname, corpusid) {
      OPrime.debug("In showFullscreenCorpus: " );
      
      /*
       * If the corpusid is not specified, then try to guess it by re-routing us to the guess function
       */
      if(!corpusid){
        window.app.router.navigate("corpus/"+pouchname, {trigger: true});

        return;
      }
      if(pouchname){
        try{
          Backbone.couch_connector.config.db_name = pouchname;
        }catch(e){
          OPrime.debug("Couldn't set the database name off of the pouchame.");
        }
      }

      var self = this;
      var c = new Corpus();
      c.set({
        "pouchname" : pouchname
      });
      c.id = corpusid;
      c.changePouch({pouchname: pouchname}, function(){
        //fetch only after having setting the right pouch which is what changePouch does.
        c.fetch({
          success : function(model) {
            OPrime.debug("Corpus fetched successfully", model);

            c.makeSureCorpusHasADataList(function(){
              c.makeSureCorpusHasASession(function(){
                self.loadCorpusDashboard(model);
                //end success to create new data list
              },function(){
                alert("Failed to create a session. ");
              });//end failure to create new data list
              //end success to create new data list
            },function(){
              alert("Failed to create a datalist. ");
            });//end failure to create new data list

          },
          error : function(e, x, y ) {
            console.log(e);
            console.log(x);
            console.log(y);
            if(self.islooping){
              return;
            }
            
            self.bringCorpusToThisDevice(c, function(){
              alert("Downloaded this corpus to this device. Attempting to load the corpus dashboard.");
              self.showCorpusDashboard(pouchname, corpusid);
              self.islooping = true;

            }, function(e){
              alert("Couldn't download this corpus to this device. There was an error replicating corpus..."+e);
            });

          }
        });
      });


    },
    loadCorpusDashboard: function(c){
      var mostRecentIds = {
          corpusid : c.id,
          datalistid : c.datalists.models[0].id,
          sessionid : c.sessions.models[0].id,
          couchConnection : c.get("couchConnection")
        };
        console.log("mostRecentIds", mostRecentIds);
        window.app.get("authentication").get("userPrivate").set("mostRecentIds", mostRecentIds);
        window.app.get("authentication").saveAndInterConnectInApp(function(){
          var optionalCouchAppPath= "";
          if(c.get("couchConnection").pouchname){
             optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(c.get("couchConnection").pouchname);
          }
          window.location.replace(optionalCouchAppPath+"corpus.html");
          return;
        });
    },
    bringCorpusToThisDevice : function(corpus, callback) {
      for (var x in window.app.get("authentication").get("userPrivate").get("corpuses")){
        if(window.app.get("authentication").get("userPrivate").get("corpuses")[x].pouchname == corpus.get("pouchname")){
          corpus.set("couchConnection", window.app.get("authentication").get("userPrivate").get("corpuses")[x]);
          window.app.set("corpus",corpus);
          window.app.get("authentication").staleAuthentication = true;
          window.app.get("authentication").syncUserWithServer(function(){
            corpus.replicateFromCorpus(null, callback);
          });
          break;
        }
      }
    }
    
  });

  return UserRouter;
});

define('corpus/Corpuses',[ 
         "backbone", 
         "corpus/CorpusMask"
], function(
         Backbone,
         CorpusMask) {
  var Corpuses = Backbone.Collection.extend(
  /** @lends Corpuses.prototype */
  {
    /**
     * @class Collection of Corpuses in the form of CorpusMasks (normally
     *        referred to as Corpora, but using Backbone conventions a regular
     *        plural means a collection.)
     * 
     * @description Nothing happens in the initialization.
     * 
     * @extends Backbone.Collection
     * @constructs
     */
    initialize : function() {
    },
    
    /**
     * backbone-couchdb adaptor set up
     */
    db : {
      view : "corpuses",
      changes : false,
      // If you don't know what filters are in CouchDB, then read it up here:
      // <a href="http://guide.couchdb.org/draft/notifications.html#filters">http://guide.couchdb.org/draft/notifications.html#filters</a>
      // Look up how the filter works in `chat_example/filters/private_messages.js`.
      // IMPORTANT: see `filters/messages.js` to see how to retrieve remove events
      filter : Backbone.couch_connector.config.ddoc_name + "/corpuses"
    },
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/corpuses",
    // The messages should be ordered by date
    comparator : function(doc){
      return doc.get("timestamp");
    },
    
    
    internalModels : CorpusMask,
    model : CorpusMask,
    constructCollectionFromArray : function(arrayOfCorpora){
      this.constructCollectionFromArrayOnServer(arrayOfCorpora);
    },
    constructCollectionFromArrayOnServer : function(arrayOfCorpora){
      OPrime.debug(arrayOfCorpora);
      this.reset();
      var self = this;
      for(c in arrayOfCorpora){
        var couchConnection = arrayOfCorpora[c];
        var couchurl = couchConnection.protocol + couchConnection.domain;
        if (couchConnection.port != null) {
          couchurl = couchurl + ":" + couchConnection.port;
        }
        couchurl = couchurl +couchConnection.path +"/"+ couchConnection.pouchname+"/corpus";
        
        var corpuse = new CorpusMask({
          title : "",
          pouchname : couchConnection.pouchname
        });
        corpuse.corpusid = couchConnection.corpusid;
        self.unshift(corpuse);
        

        /*
         * if we want to fetch the corpus's title from the server: (if
         * the corpus is private, it will just say private corpus which
         * we expect to be the normal case, therefore not usefull to
         * show it.
         */
//        $.ajax({
//          type : 'GET',
//          url : couchurl ,
//          success : function(data) {
//            OPrime.debug("Got data back from the server about this corpus: ", data);
//            var corpus = new CorpusMask(JSON.parse(data));
//            corpus.corpusid = arrayOfCorpora[thisc].corpusid;
//            self.unshift(corpus);
//          },
//          error : function(data){
//            OPrime.debug("Got error back from the server about this corpus: ", data);
//            var corpuse = new CorpusMask({
//                  title : "We need to make sure you're you before showing you the latest details (click the sync button).",
//                  pouchname : arrayOfCorpora[thisc].pouchname
//                });
//            corpuse.corpusid = arrayOfCorpora[thisc].corpusid;
//            self.unshift(corpuse);
//          }
//        });
      }
    },
    constructCollectionFromArrayLocally : function(arrayOfCorpora){
      //TODO look in the pouchdb's instead
    }
  });

  return Corpuses;
});
define('corpus/CorpusLinkView',[ 
    "backbone", 
    "handlebars", 
    "corpus/CorpusMask",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars, 
    CorpusMask
) {
  var CorpusLinkView = Backbone.View.extend(
  /** @lends CorpusLinkView.prototype */
  {
    /**
     * @class This is the corpus linkview. It contains only as CorpusMask and is a much reduced version of the CorpusReadView
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      OPrime.debug("CORPUS LINK init: " );
   
      // If the model's title changes, chances are its a new corpus, re-render its internal models.
      this.model.bind('change:title', function(){
        this.render();
      }, this);
      
    },
    events : {
    },
    
    /**
     * The underlying model of the CorpusLinkView is a Corpus.
     */    
    model : CorpusMask,

    /**
     * The Handlebars template rendered as the CorpusLinkLinkView.
     */
    templateLink: Handlebars.templates.corpus_read_link,
    
    /**
     * Renders the CorpusLinkView and all of its child Views.
     */
    render : function() {
      OPrime.debug("CORPUS LINK render: ");

      if (this.model == undefined) {
        OPrime.debug("\tCorpusMask model was undefined.");
        return this;
      }
      var jsonToRender = this.model.toJSON();
      jsonToRender.corpusid = this.model.corpusid;
//      try{
//        jsonToRender.username = this.model.get("team").get("username");
//      }catch(e){
//        OPrime.debug("Problem getting the username of the corpus' team");
//      }

      $(this.el).html(this.templateLink(jsonToRender));

      return this;
    }
  });

  return CorpusLinkView;
});
define('app/UpdatingCollectionView',[ 
    "backbone",
], function(Backbone) {
var UpdatingCollectionView = Backbone.View.extend({
    initialize : function(options) {
      _(this).bindAll('add', 'remove');

      if (!options.childViewConstructor)
        throw "no child view constructor provided";
      if (!options.childViewTagName)
        throw "no child view tag name provided";

      this._childViewConstructor = options.childViewConstructor;
      this._childViewTagName = options.childViewTagName;
      this._childViewFormat = options.childViewFormat || null;
      this._childViewClass = options.childViewClass || "";

      this._childViews = [];

      if(this.collection && this.collection.each){
        this.collection.each(this.add);
        this.collection.bind('add', this.add);
        this.collection.bind('remove', this.remove);
      }else{
        OPrime.bug("The collection was not a backbone collection...");
      }

    },
    
    tagName: "ul",
    
    add : function(model, collection, options) {
      var childView = new this._childViewConstructor({
        tagName : this._childViewTagName,
        className : this._childViewClass,
        model : model
      });
      
      if (this._childViewFormat) {
        childView.format = this._childViewFormat;
      }
      
      if(options == undefined || options == null){
        options = {};
        options.index = 1;
      }
      // Add to the top of the list
      if (options.index == 0) {
        this._childViews.unshift(childView);
  
        if (this._rendered) {
          $(this.el).prepend(childView.render().el);
        }
      // Add to the bottom of the list
      } else {
        this._childViews.push(childView);
  
        if (this._rendered) {
          $(this.el).append(childView.render().el);
        }
      }
    },

    remove : function(model) {
      var viewToRemove = _(this._childViews).select(function(cv) {
        return cv.model === model;
      })[0];
      this._childViews = _(this._childViews).without(viewToRemove);

      if (this._rendered)
        $(viewToRemove.el).remove();
    },

    render : function() {
      var that = this;
      this._rendered = true;

      $(this.el).empty();

      _(this._childViews).each(function(childView) {
        $(that.el).append(childView.render().el);
        childView.delegateEvents();
      });

      return this;
    }
  });
  return UpdatingCollectionView;
});
define('user/UserReadView',[ 
    "backbone", 
    "handlebars", 
    "corpus/Corpus",
    "corpus/Corpuses",
    "corpus/CorpusLinkView",
    "user/User",
    "app/UpdatingCollectionView",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars, 
    Corpus,
    Corpuses,
    CorpusLinkView,
    User,
    UpdatingCollectionView
) {
  var UserReadView = Backbone.View.extend(
  /** @lends UserReadView.prototype */
  {
    /**
     * @class The layout of a single User. This view is used in the comments
     *        , it is also embedable in the UserEditView.
     *        
     * @property {String} format Must be set when the view is initialized. Valid
     *           values are "link" "modal" "fullscreen" and "public"
     * 
     * @description Starts the UserView.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      OPrime.debug("USER READ VIEW init: ");
//      this.model.bind('change:gravatar', this.render, this); //moved back to init moved from initialze to here, ther is a point in app loading when userpublic is an object not a backbone object
      this.changeViewsOfInternalModels();

    },
    
    events : {
      "click .edit-user-profile" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        if(this.format == "modal"){
          window.appView.modalEditUserView.render();
        }else if(this.format == "public"){
          if(window.appView.publicEditUserView.model.get("username") == window.app.get("authentication").get("userPrivate").get("username") ){
            window.appView.publicEditUserView.render();
          }
        }else{
          $(this.el).find(".icon-edit").hide();
        }
      },
      "click .view-public-profile" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        $("#user-modal").modal("hide");
        window.app.router.showFullscreenUser(this.model.id);
      }
     },
    /**
     * The underlying model of the UserReadView is a User.
     */
    model : User,
    
    classname : "user",
    
    /**
     * The Handlebars template rendered as the UserReadLinkView.
     */
    linkTemplate : Handlebars.templates.user_read_link,
    
    /**
     * The Handlebars template rendered as the UserReadModalView.
     */
    modalTemplate : Handlebars.templates.user_read_modal,
    
    /**
     * The Handlebars template rendered as the UserReadFullscreenView.
     */
    fullscreenTemplate : Handlebars.templates.user_read_fullscreen,
    
    /**
     * Renders the UserReadView.
     */
    render : function() {
      
//      OPrime.debug("USER render: ");
      if (this.model == undefined) {
        OPrime.debug("\User model was undefined");
        return this;
      }
//      OPrime.debug("\tRendering user: " + this.model.get("username"));

      if (this.format == "fullscreen") {
        OPrime.debug("USER READ FULLSCREEN render: ");

        this.setElement($("#user-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        $(this.el).find(".locale_User_Profile").html(Locale.get("locale_Private_Profile"));

        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      } else if (this.format == "modal") {
        OPrime.debug("USER READ MODAL render: ");

        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(this.model.toJSON()));
        
        //localization for user edit modal
        $(this.el).find(".locale_Edit_User_Profile_Tooltip").attr("title",Locale.get("locale_Edit_User_Profile_Tooltip"));
        $(this.el).find(".locale_View_Public_Profile_Tooltip").html(Locale.get("locale_View_Public_Profile_Tooltip"));
        $(this.el).find(".locale_Private_Profile_Instructions").html(Locale.get("locale_Private_Profile_Instructions"));
        $(this.el).find(".locale_Close").html(Locale.get("locale_Close"));
        $(this.el).find(".locale_User_Profile").html(Locale.get("locale_Private_Profile"));


        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      } else if (this.format == "link") {
        OPrime.debug("USER READ LINK render: ");

        $(this.el).html(this.linkTemplate(this.model.toJSON()));
        
        //localization for link view
        $(this.el).find(".locale_View_Profile_Tooltip").attr("title",Locale.get("locale_View_Profile_Tooltip"));

      } else if (this.format == "public") {
        OPrime.debug("USER READ PUBLIC render: ");

        this.setElement($("#public-user-page"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        //localize the public user page
        $(this.el).find(".locale_Edit_Public_User_Profile").attr("title",Locale.get("locale_Edit_Public_User_Profile"));
        $(this.el).find(".locale_User_Profile").html(Locale.get("locale_Public_Profile"));

     // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      }else{
        throw("The UserReadView doesn't know what format to display, you need to tell it a format");
      }
      
      if(this.format != "link"){
        //localization for all except link

        $(this.el).find(".locale_Gravatar").html(Locale.get("locale_Gravatar"));
        $(this.el).find(".locale_Email").html(Locale.get("locale_Email"));
        $(this.el).find(".locale_Research_Interests").html(Locale.get("locale_Research_Interests"));
        $(this.el).find(".locale_Affiliation").html(Locale.get("locale_Affiliation"));
        $(this.el).find(".locale_Description").html(Locale.get("locale_Description"));
        $(this.el).find(".locale_Corpora").html(Locale.get("locale_Corpora"));
      }

      return this;
    },
    
    changeViewsOfInternalModels : function(){
      //Create a CommentReadView      TODO add comments to users
//      this.commentReadView = new UpdatingCollectionView({
//        collection           : this.model.get("comments"),
//        childViewConstructor : CommentReadView,
//        childViewTagName     : 'li'
//      });
    //Create a CommentReadView     
      this.corpusesReadView = new UpdatingCollectionView({
        collection : new Corpuses(),
        childViewConstructor : CorpusLinkView,
        childViewTagName : 'li'
      });
      this.corpusesReadView.collection.constructCollectionFromArray(this.model
          .get("corpuses"))
    }
  });

  return UserReadView;
});
define('authentication/AuthenticationEditView',[
    "backbone", 
    "handlebars",
    "authentication/Authentication", 
    "corpus/Corpus",
    "confidentiality_encryption/Confidential",
    "user/User", 
    "user/UserMask",
    "user/UserReadView",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars, 
    Authentication,
    Corpus,
    Confidential,
    User, 
    UserMask,
    UserReadView
) {
  var AuthenticationEditView = Backbone.View.extend(
  /** @lends AuthenticationEditView.prototype */
  {
    /**
     * @class This is the login logout surface.
     * 
     * @description Starts the Authentication and initializes all its children. 
     * This is where the dropdown menu for user related stuff is housed.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      OPrime.debug("AUTH EDIT init: " + this.el);
      
    //   Create a Small  UserReadView of the user's public info which will appear on the user drop down.
      this.userView = new UserReadView({
         model: this.model.get("userPublic")
      });
      this.userView.format = "link";
      this.userView.setElement($("#user-quickview"));
      
      // Any time the Authentication model changes, re-render
      this.model.bind('change:state', this.render, this);
      this.model.get("userPublic").bind('change', this.render, this);
      
      //save the version of the app into this view so we can use it when we create a user.
      var self = this;
      OPrime.getVersion(function (ver) { 
        self.appVersion = ver;
      });
      
    },

    /**
     * The underlying model of the AuthenticationEditView is an Authentication
     */    
    model : Authentication,

    /**
     * The userView is a child of the AuthenticationEditView.
     */
    userView : UserReadView,
    
    /**
     * Events that the AuthenticationEditView is listening to and their handlers.
     */
    events : {
      "click .logout" : "logout",
      "click .show-login-modal": function(e){
//        if(e){
//          e.stopPropagation();
//          e.preventDefault();
//        }
        $("#login_modal").show("modal");
      },
      
      "keyup .registerusername" : function(e) {
        var code = e.keyCode || e.which;
        // code == 13 is the enter key
        if ((code == 13) && (this.$el.find(".registerusername").val().trim() != "YourNewUserNameGoesHere")) {
          this.$el.find(".potentialUsername").html( $(".registerusername").val().trim());
          this.$el.find(".confirm-password").show();
          this.$el.find(".registerpassword").focus();
        }
      },
      "click .new-user-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        if (this.$el.find(".registerusername").val().trim() != "YourNewUserNameGoesHere") {
          this.$el.find(".potentialUsername").html( $(".registerusername").val().trim());
          this.$el.find(".confirm-password").show();
          this.$el.find(".registerpassword").focus();
        }
      },
      "click .register-new-user" : "registerNewUser",
      "keyup .registeruseremail" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.registerNewUser();
        }
      },
      "click .register-twitter" : function() {
        window.location.href = OPrime.authUrl+"/auth/twitter";
      },
      "click .register-facebook" : function() {
        window.location.href = OPrime.authUrl+"/auth/facebook";
      },
      "click .sync-lingllama-data" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        console.log("hiding user welcome, syncing lingllama");
        this.syncUser("lingllama","phoneme", OPrime.authUrl);
      },
      "click .registerusername" : function(e) {
        e.target.select();
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        return false;
      },
      "click .registerpassword" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        return false;
      },
      "click .to-confirm-password" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        return false;
      },
      "click .registeruseremail" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        return false;
      }
    },
    
    /**
     * The Handlebars template rendered as the AuthenticationEditView.
     */
    template : Handlebars.templates.authentication_edit_embedded,
    userTemplate : Handlebars.templates.user_read_link,
    
    /**
     * Renders the AuthenticationEditView and all of its child Views.
     */
    render : function() {
      OPrime.debug("AUTH EDIT render: " + this.el);
      if (this.model == undefined) {
        OPrime.debug("Auth model was undefined, come back later.");
        return this;
      }

      if(this.model.get("userPublic") != undefined){
        this.model.set( "gravatar", this.model.get("userPublic").get("gravatar") );
        this.model.set( "username", this.model.get("userPublic").get("username") );
      }
      // Display the AuthenticationEditView
      this.setElement($("#authentication-embedded"));
      $(this.el).html(this.template(this.model.toJSON()));

      if (this.model.get("state") == "renderLoggedIn") {
        $("#logout").show();
        $("#login_form").hide();
        $("#login_register_button").hide();

        if(this.model.get("userPublic") != undefined){
          OPrime.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        }else{
          $("#user-quickview").html('<i class="icons icon-user icon-white">');
        }
        //localization
        $(this.el).find(".locale_Log_Out").html(Locale.get("locale_Log_Out"));

        
      } else {
        $("#logout").hide();
        $("#login_form").show();
        $("#login_register_button").show();
        $("#loggedin_customize_on_auth_dropdown").hide();

        if(this.model.get("userPublic") != undefined){
          OPrime.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        }else{
          $("#user-quickview").html('<i class="icons icon-user icon-white">');
        }
        //localization
        $(this.el).find(".locale_Close_and_login_as_LingLlama").html(Locale.get("locale_Close_and_login_as_LingLlama"));
        $(this.el).find(".locale_Close_and_login_as_LingLlama_Tooltip").attr("title", Locale.get("locale_Close_and_login_as_LingLlama_Tooltip"));
        
        $(this.el).find(".locale_Log_In").html(Locale.get("locale_Log_In"));
        $(this.el).find(".locale_Create_a_new_user").html(Locale.get("locale_Create_a_new_user"));
        $(this.el).find(".locale_New_User").text(Locale.get("locale_New_User"));
        $(this.el).find(".locale_Confirm_Password").text(Locale.get("locale_Confirm_Password"));
        $(this.el).find(".locale_Sign_in_with_password").text(Locale.get("locale_Sign_in_with_password"));

        var mostLikelyAuthUrl = "LingSync.org";
        if (window.location.origin.indexOf("prosody.linguistics.mcgill") >= 0) {
          mostLikelyAuthUrl = "McGill ProsodyLab";
        } else if (window.location.origin.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
          mostLikelyAuthUrl = "McGill ProsodyLab";
        } else if (window.location.origin.indexOf("ifielddevs.iriscouch.com") >= 0) {
          mostLikelyAuthUrl = "LingSync Testing";
        } else if (window.location.origin.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
          mostLikelyAuthUrl = "LingSync Testing";
        } else if (window.location.origin.indexOf("localhost:8128") >= 0) {
        } else if (window.location.origin.indexOf("localhost") >= 0) {
          mostLikelyAuthUrl = "Localhost";
        }
        
        //Production ocmdknddgpmjngkhcbcofoogkommjfoj
        
        $(".welcomeauthurl").val(mostLikelyAuthUrl);
        
      }

      //localization
      $(this.el).find(".locale_Private_Profile").html(Locale.get("locale_Private_Profile"));
      $(this.el).find(".locale_An_offline_online_fieldlinguistics_database").html(Locale.get("locale_An_offline_online_fieldlinguistics_database"));
      
      $(this.el).find(".locale_User_Settings").html(Locale.get("locale_User_Settings"));
      $(this.el).find(".locale_Keyboard_Shortcuts").html(Locale.get("locale_Keyboard_Shortcuts"));
      $(this.el).find(".locale_Corpus_Settings").html(Locale.get("locale_Corpus_Settings"));
      $(this.el).find(".locale_Terminal_Power_Users").html(Locale.get("locale_Terminal_Power_Users"));
      
      return this;
    },
    
    /**
     * Logout removes the stringified user and the username from local storage,
     * and then authenticates public into the app.
     */
    logout : function() {
      this.model.logout();
    },
    
    /**
     * Login tries to get the username and password from the user interface, and
     * calls the view's authenticate function.
     */
    login : function() {
      OPrime.debug("LOGIN");
      this.authenticate(document.getElementById("username").value, 
          document.getElementById("password").value,
          document.getElementById("authUrl").value
      );
    },
    
    /**
     * Notes: LingLlama's user comes from his time after his PhD and before his
     * foray into the industry. This is when he started getting some results for
     * "phoneme" around 1910. For a similar use of historical users see Morgan
     * Blamey and Tucker the Technician at blamestella.com
     * https://twitter.com/#!/tucker1927
     */
    loadSample : function(appidsIn) {      
    //  alert("loading sample");

    },
    
    /**
     * Authenticate accepts a username and password, creates a simple user, and
     * passes that user to the authentication module for real authentication
     * against a server or local database. The Authenticate function also sends a
     * callback which will render views once the authentication server has
     * responded. If the authentication result is null, it can flash an error to
     * the user and then logs in as public.
     * 
     * @param username {String} The username to authenticate.
     * @param password {String} The password to authenticate.
     */
    authenticate : function(username, password, authUrl, sucescallback, failcallback, corpusloginsuccesscallback, corpusloginfailcallback) {
      
      // Temporarily keep the given's credentials
      var tempuser = new User({
        username : username,
        password : password,
        authUrl : authUrl
      });

      var whattodoifcouchloginerrors = function(){
      //If the user has an untitled corpus, there is a high chance that their dashboard didn't load because they cant sync with couch but they do have their first local ones, attempt to look it up in their user, and laod it.
        if(app.get("corpus").get("title").indexOf("Untitled Corpus") >= 0){
          if(self.model.get("userPrivate").get("mostRecentIds") == undefined){
            //do nothing because they have no recent ids
            alert("Bug: User does not have most recent ids, Cant show your most recent dashbaord.");
            window.location.href = "#render/true";
          }else{
            /*
             *  Load their last corpus, session, datalist etc
             */
            var appids = self.model.get("userPrivate").get("mostRecentIds");
            window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids);
          }
        }
        if(typeof corpusloginfailcallback == "function"){
          corpusloginfailcallback();
        }else{
          OPrime.debug('no corpusloginfailcallback was defined');

        }
      };
      
      var self = this;
      this.model.authenticate(tempuser, function(success) {
        if (success == null) {
//          alert("Authentication failed. Authenticating as public."); //TODO cant use this anymore as a hook
//          self.authenticateAsPublic();
          return;
        }
        if(username == "public"){
          self.model.savePublicUserForOfflineUse();
        }
        var couchConnection = self.model.get("userPrivate").get("corpuses")[0]; //TODO make this be the last corpus they edited so that we re-load their dashboard, or let them chooe which corpus they want.
        window.app.get("corpus").logUserIntoTheirCorpusServer(couchConnection, username, password, function(){
          if(typeof corpusloginsuccesscallback == "function"){
            OPrime.debug('Calling corpusloginsuccesscallback');
            corpusloginsuccesscallback();
          }else{
            OPrime.debug('no corpusloginsuccesscallback was defined');
          }
          //Replicate user's corpus down to pouch
          window.app.get("corpus").replicateFromCorpus(couchConnection, function(){
            if(self.model.get("userPrivate").get("mostRecentIds") == undefined){
              //do nothing because they have no recent ids
              alert("Bug: User does not have most recent ids, Cant show your most recent dashbaord.");
              window.location.href = "#render/true";
            }else{
              /*
               *  Load their last corpus, session, datalist etc, 
               *  only if it is not the ones already most recently loaded.
               */
              var appids = self.model.get("userPrivate").get("mostRecentIds");
              var visibleids = {};
              if(app.get("corpus")){
                visibleids.corpusid = app.get("corpus").id;
              }else{
                visibleids.corpusid = "";
              }
              if(app.get("currentSession"))  {
                visibleids.sessionid = app.get("currentSession").id;
              }else{
                visibleids.sessionid = "";
              }
              if(app.get("currentDataList")){
                visibleids.datalistid = app.get("currentDataList").id;
              }else{
                visibleids.datalistid = "";
              }
              if( ( appids.sessionid != visibleids.sessionid ||  appids.corpusid != visibleids.corpusid || appids.datalistid != visibleids.datalistid) ){
                OPrime.debug("Calling loadBackboneObjectsByIdAndSetAsCurrentDashboard in AuthenticationEditView");
                if(window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard){
                  window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids);
                }else{
                  console.log("Trying to fetch the corpus and redirect you to the corpus dashboard.");
                  window.app.router.showCorpusDashboard(couchConnection.pouchame, app.get("corpus").id);
                }
              }
            }                    
          }); 
        }, whattodoifcouchloginerrors);
        
        
        var renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedIn";
        if(self.model.get("userPrivate").get("username") == "public"){
          renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedOut";
        }
        // Save the authenticated user in our Models
        self.model.set({
          gravatar : self.model.get("userPrivate").get("gravatar"),
          username : self.model.get("userPrivate").get("username"),
          state : renderLoggedInStateDependingOnPublicUserOrNot
        });
        if(typeof sucescallback == "function"){
          sucescallback();
        }
      }, failcallback);
    },
    
    /**
     * ShowQuickAuthentication view popups up a password entry view.
     * This is used to unlock confidential datum, or to unlock dangerous settings
     * like removing a corpus. It is also used if the user hasn't confirmed their
     * identity in a while.
     */
    showQuickAuthenticateView : function(authsuccesscallback, authfailurecallback, corpusloginsuccesscallback, corpusloginfailcallback) {
      var self = this;
      window.hub.unsubscribe("quickAuthenticationClose", null, this); 
      if( this.model.get("userPrivate").get("username") == "lingllama" ){
        / * Show the quick auth but fill in the password, to simulate a user */
        $("#quick-authenticate-modal").modal("show");
        var preKnownPassword = "phoneme";
        $("#quick-authenticate-password").val(preKnownPassword);
        window.hub.subscribe("quickAuthenticationClose",function(){
          window.appView.authView.authenticate("lingllama"
              , "phoneme"
              , window.app.get("authentication").get("userPrivate").get("authUrl") 
              , authsuccesscallback
              , authfailurecallback
              , corpusloginsuccesscallback
              , corpusloginfailcallback );
          $("#quick-authenticate-modal").modal("hide");
          $("#quick-authenticate-password").val("");
          window.hub.unsubscribe("quickAuthenticationClose", null, this); //TODO why was this off, this si probably why we were getting lots of authentications
        }, self);
      }else if (this.model.get("userPrivate").get("username") == "public"){
        / * Dont show the quick auth, just authenticate */
        window.appView.authView.authenticate("public"
            , "none"
            , window.app.get("authentication").get("userPrivate").get("authUrl") 
            , authsuccesscallback
            , authfailurecallback
            , corpusloginsuccesscallback
            , corpusloginfailcallback );
      }else {
        $("#quick-authenticate-modal").modal("show");
        window.hub.subscribe("quickAuthenticationClose",function(){
          window.appView.authView.authenticate(window.app.get("authentication").get("userPrivate").get("username")
              , $("#quick-authenticate-password").val() 
              , window.app.get("authentication").get("userPrivate").get("authUrl")
              , authsuccesscallback
              , authfailurecallback
              , corpusloginsuccesscallback
              , corpusloginfailcallback );
          $("#quick-authenticate-modal").modal("hide");
          $("#quick-authenticate-password").val("");
          window.hub.unsubscribe("quickAuthenticationClose", null, this);//TODO why was this off, this si probably why we were getting lots of authentications
        }, self);
      }
    },

    registerNewUser : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      $(".register-new-user").attr("disabled", "disabled");

      OPrime.debug("Attempting to register a new user: " );
      var dataToPost = {};
      $(".registerusername").val( $(".registerusername").val().trim().toLowerCase().replace(/[^0-9a-z]/g,"") );
      dataToPost.email = $(".registeruseremail").val().trim();
      dataToPost.username = $(".registerusername").val().trim().toLowerCase().replace(/[^0-9a-z]/g,"");
      dataToPost.password = $(".registerpassword").val().trim();
      dataToPost.authUrl = OPrime.authUrl;
      dataToPost.appVersionWhenCreated = this.appVersion;
      //Send a pouchname to create
      var corpusConnection = OPrime.defaultCouchConnection();
      corpusConnection.pouchname = "firstcorpus";
      dataToPost.corpuses = [corpusConnection];
      dataToPost.mostRecentIds = {};
      dataToPost.mostRecentIds.couchConnection = JSON.parse(JSON.stringify(corpusConnection));
      dataToPost.mostRecentIds.couchConnection.pouchname = dataToPost.username+"-"+dataToPost.mostRecentIds.couchConnection.pouchname;
      var activityConnection = OPrime.defaultCouchConnection();
      activityConnection.pouchname = dataToPost.username+"-activity_feed";
      dataToPost.activityCouchConnection = activityConnection;
      dataToPost.gravatar = "user/user_gravatar.png";
     
      if (dataToPost.username != ""
        && (dataToPost.password == $(".to-confirm-password").val().trim())
        && dataToPost.email != "") {
        OPrime.debug("User has entered an email and the passwords match. ");
        
        $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server to prepare your first corpus/database for you...</p> <progress max='100'> <strong>Progress: working...</strong>" );
        $(".welcome-screen-alerts").addClass("alert-success");
        $(".welcome-screen-alerts").show();
        $(".welcome-screen-alerts").removeClass("alert-error");
        $(".register-new-user").addClass("disabled");
        $(".register-new-user").attr("disabed","disabled");
        
        /*
         * Contact the server and register the new user
         */
        $.ajax({
          type : 'POST',
          url : dataToPost.authUrl + "/register",
          data : dataToPost,
          success : function(serverResults) {
            if (serverResults.userFriendlyErrors != null) {
              $(".welcome-screen-alerts").html(serverResults.userFriendlyErrors.join("<br/>")+" "+OPrime.contactUs );
              $(".welcome-screen-alerts").show();
            } else if (serverResults.user) {

              localStorage.removeItem("username");
              localStorage.removeItem("mostRecentDashboard");
              localStorage.removeItem("mostRecentCouchConnection");
              localStorage.removeItem("encryptedUser");
            
              //Destropy cookies, and load the public user
              OPrime.setCookie("username", undefined, -365);
              OPrime.setCookie("token", undefined, -365);
              
//              var auth  = new Authentication({filledWithDefaults: true});
              var auth = new Authentication({
                "confidential" : new Confidential({
                  secretkey : serverResults.user.hash
                }),
                "userPrivate" : new User(serverResults.user)
              });

              OPrime.setCookie("username", serverResults.user.username, 365);
              OPrime.setCookie("token", serverResults.user.hash, 365);
              var u = auth.get("confidential").encrypt(JSON.stringify(auth.get("userPrivate").toJSON()));
              localStorage.setItem("encryptedUser", u);

              /*
               * Redirect the user to their user page, being careful to use their (new) database if they are in a couchapp (not the database they used to register/create this corpus)
               */
              var potentialpouchname = serverResults.user.corpuses[0].pouchname;
              var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(potentialpouchname);
              OPrime.checkToSeeIfCouchAppIsReady(optionalCouchAppPath+"corpus.html", function(){
                window.app.logUserIntoTheirCorpusServer(serverResults.user.corpuses[0], dataToPost.username, dataToPost.password, function(){
                  try{
                    Backbone.couch_connector.config.db_name = potentialpouchname;
                  }catch(e){
                    OPrime.debug("Couldn't set the database name off of the pouchame.");
                  }
                  var newCorpusToBeSaved = new Corpus({
                    "filledWithDefaults" : true,
                    "title" : serverResults.user.username + "'s Corpus",
                    "description": "This is your first Corpus, you can use it to play with the app... When you want to make a real corpus, click New : Corpus",
                    "team" : new UserMask({username: dataToPost.username}),
                    "couchConnection" : serverResults.user.corpuses[0],
                    "pouchname" : serverResults.user.corpuses[0].pouchname,
                    "dateOfLastDatumModifiedToCheckForOldSession" : JSON.stringify(new Date())
                  });

                  newCorpusToBeSaved.changePouch(null, function(){
                    alert("Saving new corpus.");
                    newCorpusToBeSaved.save(null, {
                      success : function(model, response) {
                        model.get("publicSelf").set("corpusid", model.id);
                        auth.get("userPrivate").set("mostRecentIds", {});
                        auth.get("userPrivate").get("mostRecentIds").corpusid = model.id;
                        model.get("couchConnection").corpusid = model.id;
                        auth.get("userPrivate").get("mostRecentIds").couchConnection = model.get("couchConnection");
                        auth.get("userPrivate").get("corpuses")[0] = model.get("couchConnection");
                        var u = auth.get("confidential").encrypt(JSON.stringify(auth.get("userPrivate").toJSON()));
                        localStorage.setItem("encryptedUser", u);
                        
                        var sucessorfailcallbackforcorpusmask = function(){
                          alert("Saved corpus in your user.");
                          window.location.replace(optionalCouchAppPath+ "user.html#/corpus/"+potentialpouchname+"/"+model.id);
                        };
                        model.get("publicSelf").saveAndInterConnectInApp(sucessorfailcallbackforcorpusmask, sucessorfailcallbackforcorpusmask);

                      },error : function(e,f,g) {
                        alert('New Corpus save error ' + f.reason);
                      }
                    });
                  });
                });
              }, OPrime.checkToSeeIfCouchAppIsReady);

            }
          },//end successful registration
          dataType : "",
          error : function(e,f,g){
            OPrime.debug("Error registering user", e,f,g);
            $(".welcome-screen-alerts").html(
                " Something went wrong, that's all we know. Please try again or report this to us if it does it again:  " + OPrime.contactUs);
            $(".welcome-screen-alerts").addClass("alert-error");
            $(".welcome-screen-alerts").removeClass("alert-success");
            $(".welcome-screen-alerts").show();
            $(".register-new-user").removeClass("disabled");
            $(".register-new-user").removeAttr("disabled");

          }
        });
      } else{
        OPrime.debug("User has not entered good info. ");
          $(".welcome-screen-alerts").html("Your passwords don't seem to match. " + OPrime.contactUs );
          $(".welcome-screen-alerts").show();
          $(".register-new-user").removeClass("disabled");
          $(".register-new-user").removeAttr("disabled");

      }
    },
    /**
     * This function manages all the data flow from the auth server and
     * corpus server to get the app to load in the right order so that
     * all the models and views are loaded, and tied together
     * 
     * @param username
     * @param password
     */
    syncUser : function(username, password, authUrl){
      console.log("hiding user login, syncing users data");
      var dataToPost = {username: username, password: password};

      $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server...</p> <progress max='100'> <strong>Progress: working...</strong>" );
      $(".welcome-screen-alerts").addClass("alert-success");
      $(".welcome-screen-alerts").removeClass("alert-error");
      $(".welcome-screen-alerts").show();
      
      /*
       * Contact the server and register the new user
       */
      $.ajax({
        type : 'POST',
        url : authUrl + "/login",
        data : dataToPost,
        success : function(serverResults) {
          if (serverResults.userFriendlyErrors != null) {
            $(".welcome-screen-alerts").html(serverResults.userFriendlyErrors.join("<br/>")+" "+OPrime.contactUs );
            $(".welcome-screen-alerts").removeClass("alert-success");
            $(".welcome-screen-alerts").addClass("alert-error");
            $(".welcome-screen-alerts").show();
            
          } else if (serverResults.user) {
            $(".welcome-screen-alerts").html("Attempting to sync your data to this device...</p> <progress max='100'> <strong>Progress: working...</strong>" );
            $(".welcome-screen-alerts").show();
            
            localStorage.removeItem("username");
            localStorage.removeItem("mostRecentDashboard");
            localStorage.removeItem("mostRecentCouchConnection");
            localStorage.removeItem("encryptedUser");
            localStorage.removeItem("helpShownCount");
            localStorage.removeItem("helpShownTimestamp");
          
            //Destroy cookies, and load the public user
            OPrime.setCookie("username", undefined, -365);
            OPrime.setCookie("token", undefined, -365);
            
            var auth  = new Authentication({filledWithDefaults: true});
            auth.set("userPrivate", new User(serverResults.user)); 
            OPrime.setCookie("username", serverResults.user.username, 365);
            OPrime.setCookie("token", serverResults.user.hash, 365);
            auth.get("confidential").set("secretkey", serverResults.user.hash);
            var u = auth.get("confidential").encrypt(JSON.stringify(auth.get("userPrivate").toJSON()));
            localStorage.setItem("encryptedUser", u);

            /*
             * Redirect the user to their user page, being careful to use their most recent database if they are in a couchapp (not the database they used to login to this corpus)
             */
            var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(serverResults.user.mostRecentIds.couchConnection.pouchname);
            app.get("corpus").logUserIntoTheirCorpusServer(serverResults.user.mostRecentIds.couchConnection, dataToPost.username, dataToPost.password, function(){
                window.location.replace(optionalCouchAppPath+"corpus.html");
            });
          }
        },//end successful login
        dataType : "",
        error : function(e,f,g){
          OPrime.debug("Error syncing user", e,f,g);
          $(".welcome-screen-alerts").html(
              " Something went wrong, that's all we know. Please try again or report this to us if it does it again:  " + OPrime.contactUs);
          $(".welcome-screen-alerts").addClass("alert-error");
          $(".welcome-screen-alerts").removeClass("alert-success");
          $(".welcome-screen-alerts").show();
        }
      });
      
    }
  });

  return AuthenticationEditView;
});
define('hotkey/HotKeyEditView',[
    "backbone", 
    "handlebars", 
    "hotkey/HotKey"
], function(Backbone, Handlebars, HotKey) {
    var HotKeyEditView = Backbone.View.extend(
    /** @lends HotKeyEditView.prototype */
    {
        /**
         * @class HotKeyEditView
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : HotKey,

        classname : "hot_key_edit",

        template: Handlebars.templates.hot_key_edit_modal,
    
        render : function() {
//            $(this.el).html(this.template(this.model.toJSON()));
            
         // Display the HotKeyEditView
            this.setElement($("#hotkey-settings-modal")); 
            $(this.el).html(this.template(this.model.toJSON()));
           
            //localization
            $(this.el).find(".locale_Keyboard_Shortcuts").html(Locale.get("locale_Keyboard_Shortcuts"));
            $(this.el).find(".locale_Actions").html(Locale.get("locale_Actions"));
            $(this.el).find(".locale_Navigation").html(Locale.get("locale_Navigation"));
            $(this.el).find(".locale_Datum_Status_Checked").html(Locale.get("locale_Datum_Status_Checked"));
            $(this.el).find(".locale_Next_Datum").html(Locale.get("locale_Next_Datum"));
            $(this.el).find(".locale_New_Datum").html(Locale.get("locale_New_Datum"));
            $(this.el).find(".locale_Previous_Datum").html(Locale.get("locale_Previous_Datum"));
            $(this.el).find(".locale_New_Session").html(Locale.get("locale_New_Session"));
            $(this.el).find(".locale_Search").html(Locale.get("locale_Search"));
            $(this.el).find(".locale_Close").html(Locale.get("locale_Close"));
            $(this.el).find(".locale_Save").html(Locale.get("locale_Save"));
//
//            $(document).bind('keydown', 'ctrl+j', function() {
//                alert('You found the hotkey!');
//            });
      
            
            return this;
        }, 
        
        
        
        
    });
    
  

    return HotKeyEditView;
}); 

define('user/UserPreferenceEditView',[
    "backbone", 
    "handlebars", 
    "user/UserPreference",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars, 
    UserPreference
) {
  var UserPreferenceEditView = Backbone.View.extend(
  /** @lends UserPreferenceEditView.prototype */
  {
    // TODO comment this class I think initially, hotkeys were gonna go in here and how they aren't in here so now I'm not sure what else is supposed to go in here.
    /**
     * @class UserPreferenceEditView This is where the option to  change the background is.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      OPrime.debug("USER PREFERENCE VIEW init");
      this.model.bind("change:skin", this.renderSkin, this);
          
//      this.model.bind("change", this.render, this);
    },
    /**
     * The underlying model of the UserPreferenceEditView is a UserPreference.
     */
    model : UserPreference,
    
    /**
     * Events that the UserPreferenceEditView is listening to and their handlers.
     */
    events:{
      "click .change-skin" : "nextSkin",
      "change .num_datum_dropdown" : "updateNumVisibleDatum",
      "click .randomize-backgound" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        if(this.model.get("alwaysRandomizeSkin") == "true"){
          this.model.set("alwaysRandomizeSkin","false");
          $(this.el).find(".randomize-backgound").removeClass("btn-success");
        }else{
          this.model.set("alwaysRandomizeSkin","true");
          $(this.el).find(".randomize-backgound").addClass("btn-success");
          this.randomSkin();
        }
        this.savePrefs();
      },
      "click .transparent-dashboard" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        if(this.model.get("transparentDashboard") == "true"){
          this.model.set("transparentDashboard", "false");
          $(this.el).find(".transparent-dashboard").removeClass("btn-success");
          this.makeDashboardOpaque();
        }else{
          this.model.set("transparentDashboard", "true");
          $(this.el).find(".transparent-dashboard").addClass("btn-success");
          this.makeDashboardTransparent();
        }
        this.savePrefs();
      }
    },
 
    /**
     * The Handlebars template rendered as the UserPreferenceEditView.
     */
    template: Handlebars.templates.user_preference_edit_modal,

    render : function() {
      OPrime.debug("USERPREFERENCE render: " + this.el);
      if (this.model != undefined) {
        // Display the UserPreferenceEditView
        this.setElement($("#user-preferences-modal"));
        $(this.el).html(this.template(this.model.toJSON()));
        this.$el.find(".num_datum_dropdown").val(this.model.get("numVisibleDatum"));
        
        
        if(this.model.get("alwaysRandomizeSkin") == "true"){
          $(this.el).find(".randomize-backgound").addClass("btn-success");
          this.randomSkin();
        }else{
          $(this.el).find(".randomize-backgound").removeClass("btn-success");
        }
        
        if(this.model.get("transparentDashboard") == "true"){
          $(this.el).find(".transparent-dashboard").addClass("btn-success");
          this.makeDashboardTransparent();
        }else{
          $(this.el).find(".transparent-dashboard").removeClass("btn-success");
          this.makeDashboardOpaque();
        }
        
        if (this.model.get("skin") == "") {
          this.randomSkin();
        }else{
          this.renderSkin();
        }
        
      }
      //localization
      $(this.el).find(".locale_User_Settings").html(Locale.get("locale_User_Settings"));
      $(this.el).find(".locale_Skin").html(Locale.get("locale_Skin"));
      $(this.el).find(".locale_Change_Background").html(Locale.get("locale_Change_Background"));
      $(this.el).find(".locale_Background_on_Random").html(Locale.get("locale_Background_on_Random"));
      $(this.el).find(".locale_Transparent_Dashboard").html(Locale.get("locale_Transparent_Dashboard"));
      $(this.el).find(".locale_Number_Datum").html(Locale.get("locale_Number_Datum"));
      $(this.el).find(".locale_Close").html(Locale.get("locale_Close"));  
      return this;
    },
    
    /**
     * The index into the skins array that is the current skin.
     */
    currentSkin : 0,
   
    
    /*
     * Available backgrounds 
     */
    skins : [
       "user/skins/bamboo_garden.jpg",
       "user/skins/llama_wool.jpg" , 
       "user/skins/yellow.jpg" , 
       "user/skins/machu_picchu.jpg",
       "user/skins/machu_picchu2.jpg",
       "user/skins/white.jpg" , 
       "user/skins/prague.jpg",
       "user/skins/salcantay.jpg",
       "user/skins/stairs.jpg",
       "user/skins/stone_figurines.jpg",
//       "user/skins/libre_office.png",
       "user/skins/temple.jpg",
       "user/skins/weaving.jpg",
       "user/skins/purple.jpg" , 
       "user/skins/sunset.jpg",
       "user/skins/window.jpg",
       "user/skins/Ceske_Krumlov.jpg",
       "user/skins/black.jpg" , 
       "user/skins/stbasil.jpg",
     ],
     
    /**
     * Change to the next skin in the array of skins.
     */
    nextSkin : function() {
      this.currentSkin = (this.currentSkin + 1) % this.skins.length;
      this.model.set("skin", this.skins[this.currentSkin]);
      this.savePrefs();
    },
    
    randomSkin : function() {
      this.currentSkin = Math.floor(Math.random() * this.skins.length);
      this.model.set("skin", this.skins[this.currentSkin]);
    },
    
    renderSkin : function() {
      //if it is not already the skin, change it
      if(document.body.style.backgroundImage.indexOf(this.model.get("skin")) == -1){
        document.body.style.backgroundImage = "url(" + this.model.get("skin") + ")";
      }
      $(this.el).find(".user-pref-skin-filename").html(this.model.get("skin"));

    },
    
    updateNumVisibleDatum : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.model.set("numVisibleDatum", this.$el.find(".num_datum_dropdown").val());
      this.savePrefs();
    },
    makeDashboardTransparent : function(){
      var headtg = document.getElementsByTagName('head')[0];
      if (!headtg) {
          return;
      }
      
      var oldlink = document.getElementsByTagName("link").item(5);
      
      var newlink = document.createElement('link');
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", "app/app_transparent.css");
 
      headtg.replaceChild(newlink, oldlink);
    },
    makeDashboardOpaque : function(){
      var headtg = document.getElementsByTagName('head')[0];
      if (!headtg) {
          return;
      }
      
      var oldlink = document.getElementsByTagName("link").item(5);
      
      var newlink = document.createElement('link');
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", "app/app_opaque.css");
 
      headtg.replaceChild(newlink, oldlink);
    },
    savePrefs: function(){
      OPrime.debug("Saving preferences into encrypted user.");
      window.app.get("authentication").saveAndInterConnectInApp();
    }
  });
  
  return UserPreferenceEditView;
}); 

define('user/UserEditView',[
    "backbone", 
    "handlebars", 
    "corpus/Corpus",
    "corpus/Corpuses",
    "corpus/CorpusLinkView",
    "user/User",
    "app/UpdatingCollectionView",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars, 
    Corpus,
    Corpuses,
    CorpusLinkView,
    User,
    UpdatingCollectionView
) {
  var UserEditView = Backbone.View.extend(
  /** @lends UserEditView.prototype */
  {
    /**
     * @class The UserEditView shows information about the user, normal
     *        information such as username, research interests affiliations etc,
     *        but also a list of their corpora which will allow their friends to
     *        browse their corpora, and also give them a quick way to navigate
     *        between corpora.
     *  
     * @property {String} format Must be set when the view is initialized. Valid
     *           values are "modal" and "fullscreen".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      OPrime.debug("USER EDIT VIEW init: " + this.el);

      this.changeViewsOfInternalModels();

    },

    /**
     * The underlying model of the UserEditView is a User, or a UserMask.
     */
//    model : User,
    
    /**
     * Events that the UserEditView is listening to and their handlers.
     */
    events : {
      "click #close_user_profile" : function() {
        console.log("hiding user profile");
        this.$el.modal("hide");
      },
      "click .save-user-profile" : "saveProfile",
      "blur .gravatar" : "updateGravatar",
      "click .icon-book" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.showReadVersion();
        
      },
      "click .edit-public-user-profile" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }        
        $("#user-modal").modal("hide");
        window.app.router.showFullscreenUser();
        window.appView.publicEditUserView.render();
      }

    },

    /**
     * The corpusesView is a child of the CorpusView.
     */
//    corpusesView : CorpusesView, //TODO put this in as an updating collection

    /**
     * The Handlebars template rendered as the UserModalEditView
     */
    modalTemplate : Handlebars.templates.user_edit_modal,
    
    /** 
     * The Handlebars template rendered as the UserFullscreenEditView
     */
    fullscreenTemplate : Handlebars.templates.user_edit_fullscreen,

    /**
     * Renders the UserEditView depending on its format.
     */
    render : function() {
//      OPrime.debug("USER render: " + this.el);

      if (this.model == undefined) {
        OPrime.debug("\User model was undefined");
        return this;
      }
      if (this.format == "fullscreen") {
        OPrime.debug("USER EDIT FULLSCREEN render: " + this.el);

        this.setElement($("#user-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        //localization for public user edit fullscreen
        $(this.el).find(".locale_Public_Profile_Instructions").html(Locale.get("locale_Public_Profile_Instructions"));
        $(this.el).find(".locale_User_Profile").html(Locale.get("locale_Private_Profile"));

        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      } else if(this.format == "modal") {
        OPrime.debug("USER EDIT MODAL render: " + this.el);

        this.setElement($("#user-modal"));
        $(this.el).html(this.modalTemplate(this.model.toJSON()));
        
        //localization for user edit modal
        $(this.el).find(".locale_Edit_Public_User_Profile").html(Locale.get("locale_Edit_Public_User_Profile"));
        $(this.el).find(".locale_Private_Profile_Instructions").html(Locale.get("locale_Private_Profile_Instructions"));
        $(this.el).find(".locale_Close").html(Locale.get("locale_Close"));
        $(this.el).find(".locale_User_Profile").html(Locale.get("locale_Private_Profile"));

        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      }else if (this.format == "public") {
        OPrime.debug("USER EDIT PUBLIC render: " + this.el);

        this.setElement($("#public-user-page"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        //localization for public user edit fullscreen
        $(this.el).find(".locale_Public_Profile_Instructions").html(Locale.get("locale_Public_Profile_Instructions"));
        $(this.el).find(".locale_User_Profile").html(Locale.get("locale_Public_Profile"));

        // Display the CorpusesReadView
        this.corpusesReadView.el = $(this.el).find('.corpuses');
        this.corpusesReadView.render();
        
        
      }
      //localization
      $(this.el).find(".locale_Show_Readonly").attr("title", Locale.get("locale_Show_Readonly"));
    

      $(this.el).find(".locale_Gravatar").html(Locale.get("locale_Gravatar"));
      $(this.el).find(".locale_Gravatar_URL").html(Locale.get("locale_Gravatar_URL"));
      $(this.el).find(".locale_Firstname").html(Locale.get("locale_Firstname"));
      $(this.el).find(".locale_Lastname").html(Locale.get("locale_Lastname"));
      $(this.el).find(".locale_Email").html(Locale.get("locale_Email"));
      $(this.el).find(".locale_Research_Interests").html(Locale.get("locale_Research_Interests"));
      $(this.el).find(".locale_Affiliation").html(Locale.get("locale_Affiliation"));
      $(this.el).find(".locale_Description").html(Locale.get("locale_Description"));
      $(this.el).find(".locale_Corpora").html(Locale.get("locale_Corpora"));
      $(this.el).find(".locale_Save").html(Locale.get("locale_Save"));


      return this;
    },
    saveProfile : function(){
      OPrime.debug("Saving user");
      
      this.model.set("firstname", $(this.el).find(".firstname").val());
      this.model.set("lastname", $(this.el).find(".lastname").val());
      this.model.set("email", $(this.el).find(".email").val());
      this.model.set("researchInterest", $(this.el).find(".researchInterest").val());
      this.model.set("affiliation", $(this.el).find(".affiliation").val());
      this.model.set("description", $(this.el).find(".description").val());
      this.model.set("gravatar", $(this.el).find(".gravatar").val());
      
      //It is the private self
      if(this.format =="modal"){
        window.app.get("authentication").saveAndEncryptUserToLocalStorage();
        window.app.addActivity(
            {
              verb : "modified",
              directobject : "your private profile",
              indirectobject : "",
              teamOrPersonal : "personal",
              context : "via Offline App"
            });
        window.app.addActivity(
            {
              verb : "modified",
              directobject : "<a href='#user/"+this.model._id+"'>their profile</a>",
              indirectobject : "",
              teamOrPersonal : "team",
              context : "via Offline App"
            });
      }else{
        //It is the public self
        window.app.get("authentication").get("userPrivate").set("publicSelf", this.model);
        this.model.saveAndInterConnectInApp(function(){
          window.app.get("authentication").saveAndEncryptUserToLocalStorage();
        });
        
        window.app.addActivity(
            {
              verb : "modified",
              directobject : "<a href='#user/"+this.model._id+"'>your public profile</a>",
              indirectobject : "",
              teamOrPersonal : "personal",
              context : "via Offline App"
            });
        window.app.addActivity(
            {
              verb : "modified",
              directobject : "<a href='#user/"+this.model._id+"'>their profile</a>",
              indirectobject : "",
              teamOrPersonal : "team",
              context : "via Offline App"
            });
      }
      
      window.appView.toastUser("Sucessfully saved your profile.","alert-success","Saved!");

      this.showReadVersion();
    },
    showReadVersion : function(){
      if(this.format == "modal"){
        window.appView.modalReadUserView.render();
//        $("#user-modal").modal("hide");
      }else{
        window.appView.publicReadUserView.render();
      }
    },
    updateGravatar : function(){
      this.model.set("gravatar", $(this.el).find(".gravatar").val());
      $(this.el).find(".gravatar").attr("src",$(this.el).find(".gravatar").val());
    },
    changeViewsOfInternalModels : function(){
      //Create a CommentReadView      TODO add comments to users
//      this.commentReadView = new UpdatingCollectionView({
//        collection           : this.model.get("comments"),
//        childViewConstructor : CommentReadView,
//        childViewTagName     : 'li'
//      });
    //Create a CommentReadView     
      this.corpusesReadView = new UpdatingCollectionView({
        collection : new Corpuses(),
        childViewConstructor : CorpusLinkView,
        childViewTagName : 'li'
      });
      this.corpusesReadView.collection.constructCollectionFromArray(this.model
          .get("corpuses"))
    }
  });

  return UserEditView;
}); 
define('user/UserAppView',
    [ "backbone", 
      "handlebars", 
      "user/UserApp", 
      "user/UserRouter",
        "authentication/Authentication",
        "authentication/AuthenticationEditView", 
        "corpus/Corpus",
        "corpus/CorpusMask", 
        "hotkey/HotKey", 
        "hotkey/HotKeyEditView",
        "user/UserPreference", 
        "user/UserPreferenceEditView", 
        "user/User",
        "user/UserEditView", 
        "user/UserReadView", 
        "libs/OPrime" ],
    function(
        Backbone, 
        Handlebars, 
        UserApp, 
        UserRouter, 
        Authentication,
        AuthenticationEditView, 
        Corpus, 
        CorpusMask, 
        HotKey, 
        HotKeyEditView,
        UserPreference, 
        UserPreferenceEditView, 
        User, 
        UserEditView,
        UserReadView) {
      var UserAppView = Backbone.View
          .extend(
          /** @lends UserAppView.prototype */
          {
            /**
             * @class The main layout of the users dashboard, it shows the nav
             *        bar, authentication menu and the user's profile where they
             *        can select which corpus they want to open.
             * 
             * @description Starts the application and initializes all its
             *              children.
             * 
             * @extends Backbone.View
             * @constructs
             */
            initialize : function() {
              OPrime.debug("APPVIEW init: " + this.el);

              this.setUpAndAssociateViewsAndModelsWithCurrentUser();
            },

            /*
             * This function assures that whatever views on the dashboard that
             * are coming from the user, are reassociated. it is currently after
             * the user is synced from the server. (which happens when the user
             * authenticates so that if they were logged into another computer
             * the can get their updated preferences.
             */
            associateCurrentUsersInternalModelsWithTheirViews : function(
                callback) {
              this.userPreferenceView.model = this.authView.model.get(
                  "userPrivate").get("prefs");
              this.userPreferenceView.model.bind("change:skin",
                  this.userPreferenceView.renderSkin, this.userPreferenceView);


              this.hotkeyEditView.model = this.authView.model
                  .get("userPrivate").get("hotkeys");
              // TODO the hotkeys are probably not associate dbut because they
              // are not finished, they cant be checked yet

              if (typeof callback == "function") {
                callback();
              }
            },
            setUpAndAssociateViewsAndModelsWithCurrentUser : function(callback) {
              // Create an AuthenticationEditView
              this.authView = new AuthenticationEditView({
                model : this.model.get("authentication")
              });

              /*
               * Set up the five user views
               */
              this.fullScreenEditUserView = new UserEditView({
                model : this.model.get("authentication").get("userPrivate")
              });
              this.fullScreenEditUserView.format = "fullscreen";

              this.fullScreenReadUserView = new UserReadView({
                model : this.model.get("authentication").get("userPrivate")
              });
              this.fullScreenReadUserView.format = "fullscreen";
              
             
              this.modalEditUserView = new UserEditView({
                model : this.model.get("authentication").get("userPrivate")
              });
              this.modalEditUserView.format = "modal";

              this.modalReadUserView = new UserReadView({
                model : this.model.get("authentication").get("userPrivate")
              });
              this.modalReadUserView.format = "modal";

              // Create a UserPreferenceEditView
              this.userPreferenceView = new UserPreferenceEditView({
                model : this.authView.model.get("userPrivate").get("prefs")
              });

              // Create a HotKeyEditView
              this.hotkeyEditView = new HotKeyEditView({
                model : this.authView.model.get("userPrivate").get("hotkeys")
              });

              if (typeof callback == "function") {
                callback();
              }
            },

            /**
             * The underlying model of the UserAppView is an App.
             */
            model : UserApp,

            /**
             * Events that the UserAppView is listening to and their handlers.
             */
            events : {
              "click #quick-authentication-okay-btn" : function(e) {
                window.hub.publish("quickAuthenticationClose", "no message");
              },
              "click .icon-home" : function(e) {
                if(e){
                  e.stopPropagation();
                  e.preventDefault();
                }   
                window.location.href = "#render/true";
              },
              "click .save-dashboard" : function() {
                window.app.saveAndInterConnectInApp();
              },
              "click .sync-everything" : "replicateDatabases",
            /*
             * These functions come from the top search template, it is renderd
             * by seacheditview whenever a search is renderd, but its events
             * cannot be handled there but are easily global events that can be
             * controlled by teh appview. which is also responsible for many
             * functions on the navbar
             */

            },

            /**
             * The Handlebars template rendered as the UserAppView.
             */
            template : Handlebars.templates.user_app,

            /**
             * Renders the UserAppView and all of its child Views.
             */
            render : function() {
              OPrime.debug("APPVIEW render: " + this.el);
              if (this.model != undefined) {

                // Display the UserAppView
                this.setElement($("#app_view"));
                $(this.el).html(this.template(this.model.toJSON()));
              
              //The authView is the dropdown in the top right corner which holds all the user menus
                this.authView.render();
                this.userPreferenceView.render();
                this.hotkeyEditView.render();//.showModal();
                this.renderReadonlyUserViews();

              //put the version into the terminal, and into the user menu
                OPrime.getVersion(function (ver) { 
                  $(".fielddb-version").html(ver);
                });
                $(".corpus-settings").addClass("hidden");
                $(".power-users-link").addClass("hidden");
                
                $(this.el).find(".locale_We_need_to_make_sure_its_you").html(Locale.get("locale_We_need_to_make_sure_its_you"));
                $(this.el).find(".locale_Password").html(Locale.get("locale_Password"));
                $(this.el).find(".locale_Yep_its_me").text(Locale.get("locale_Yep_its_me"));
                
              }
              return this;
            },

            /**
             * Save current state, synchronize the server and local databases.
             * 
             * If the corpus connection is currently the default, it attempts to
             * replicate from to the users' last corpus instead.
             */
            replicateDatabases : function(callback) {
              var self = this;
              this.model
                  .saveAndInterConnectInApp(function() {
                    // syncUserWithServer will prompt for password, then run the
                    // corpus replication.
                    self.model
                        .get("authentication")
                        .syncUserWithServer(
                            function() {
                              var corpusConnection = self.model.get("corpus")
                                  .get("couchConnection");
                              if (self.model.get("authentication").get(
                                  "userPrivate").get("corpuses").pouchname != "default"
                                  && app.get("corpus").get("couchConnection").pouchname == "default") {
                                corpusConnection = self.model.get(
                                    "authentication").get("userPrivate").get(
                                    "corpuses")[0];
                              }
                              self.model.get("corpus").replicateCorpus(
                                  corpusConnection, callback);
                            });
                  });
            }
            , // Display User Views
            renderEditableUserViews : function(userid) {
              this.fullScreenEditUserView.render();
              this.modalEditUserView.render();
            },
            renderReadonlyUserViews : function(userid) {
              this.fullScreenReadUserView.render();
              this.modalReadUserView.render();
            },
            addSavedDoc : function(){
              //Do nothing
            },
            toastUser : function(){
              //Do nothing
            }
          });

      return UserAppView;
    });

/**
 * @license RequireJS text 1.0.8 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint regexp: true, plusplus: true, sloppy: true */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false, location: false */

(function () {
    var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = [];

    define('text',[],function () {
        var text, fs;

        text = {
            version: '1.0.8',

            strip: function (content) {
                //Strips <?xml ...?> declarations so that external SVG and XML
                //documents can be added to a document without worry. Also, if the string
                //is an HTML document, only the part inside the body tag is returned.
                if (content) {
                    content = content.replace(xmlRegExp, "");
                    var matches = content.match(bodyRegExp);
                    if (matches) {
                        content = matches[1];
                    }
                } else {
                    content = "";
                }
                return content;
            },

            jsEscape: function (content) {
                return content.replace(/(['\\])/g, '\\$1')
                    .replace(/[\f]/g, "\\f")
                    .replace(/[\b]/g, "\\b")
                    .replace(/[\n]/g, "\\n")
                    .replace(/[\t]/g, "\\t")
                    .replace(/[\r]/g, "\\r");
            },

            createXhr: function () {
                //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
                var xhr, i, progId;
                if (typeof XMLHttpRequest !== "undefined") {
                    return new XMLHttpRequest();
                } else if (typeof ActiveXObject !== "undefined") {
                    for (i = 0; i < 3; i++) {
                        progId = progIds[i];
                        try {
                            xhr = new ActiveXObject(progId);
                        } catch (e) {}

                        if (xhr) {
                            progIds = [progId];  // so faster next time
                            break;
                        }
                    }
                }

                return xhr;
            },

            /**
             * Parses a resource name into its component parts. Resource names
             * look like: module/name.ext!strip, where the !strip part is
             * optional.
             * @param {String} name the resource name
             * @returns {Object} with properties "moduleName", "ext" and "strip"
             * where strip is a boolean.
             */
            parseName: function (name) {
                var strip = false, index = name.indexOf("."),
                    modName = name.substring(0, index),
                    ext = name.substring(index + 1, name.length);

                index = ext.indexOf("!");
                if (index !== -1) {
                    //Pull off the strip arg.
                    strip = ext.substring(index + 1, ext.length);
                    strip = strip === "strip";
                    ext = ext.substring(0, index);
                }

                return {
                    moduleName: modName,
                    ext: ext,
                    strip: strip
                };
            },

            xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

            /**
             * Is an URL on another domain. Only works for browser use, returns
             * false in non-browser environments. Only used to know if an
             * optimized .js version of a text resource should be loaded
             * instead.
             * @param {String} url
             * @returns Boolean
             */
            useXhr: function (url, protocol, hostname, port) {
                var match = text.xdRegExp.exec(url),
                    uProtocol, uHostName, uPort;
                if (!match) {
                    return true;
                }
                uProtocol = match[2];
                uHostName = match[3];

                uHostName = uHostName.split(':');
                uPort = uHostName[1];
                uHostName = uHostName[0];

                return (!uProtocol || uProtocol === protocol) &&
                       (!uHostName || uHostName === hostname) &&
                       ((!uPort && !uHostName) || uPort === port);
            },

            finishLoad: function (name, strip, content, onLoad, config) {
                content = strip ? text.strip(content) : content;
                if (config.isBuild) {
                    buildMap[name] = content;
                }
                onLoad(content);
            },

            load: function (name, req, onLoad, config) {
                //Name has format: some.module.filext!strip
                //The strip part is optional.
                //if strip is present, then that means only get the string contents
                //inside a body tag in an HTML string. For XML/SVG content it means
                //removing the <?xml ...?> declarations so the content can be inserted
                //into the current doc without problems.

                // Do not bother with the work if a build and text will
                // not be inlined.
                if (config.isBuild && !config.inlineText) {
                    onLoad();
                    return;
                }

                var parsed = text.parseName(name),
                    nonStripName = parsed.moduleName + '.' + parsed.ext,
                    url = req.toUrl(nonStripName),
                    useXhr = (config && config.text && config.text.useXhr) ||
                             text.useXhr;

                //Load the text. Use XHR if possible and in a browser.
                if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                    text.get(url, function (content) {
                        text.finishLoad(name, parsed.strip, content, onLoad, config);
                    });
                } else {
                    //Need to fetch the resource across domains. Assume
                    //the resource has been optimized into a JS module. Fetch
                    //by the module name + extension, but do not include the
                    //!strip part to avoid file system issues.
                    req([nonStripName], function (content) {
                        text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                        parsed.strip, content, onLoad, config);
                    });
                }
            },

            write: function (pluginName, moduleName, write, config) {
                if (buildMap.hasOwnProperty(moduleName)) {
                    var content = text.jsEscape(buildMap[moduleName]);
                    write.asModule(pluginName + "!" + moduleName,
                                   "define(function () { return '" +
                                       content +
                                   "';});\n");
                }
            },

            writeFile: function (pluginName, moduleName, req, write, config) {
                var parsed = text.parseName(moduleName),
                    nonStripName = parsed.moduleName + '.' + parsed.ext,
                    //Use a '.js' file name so that it indicates it is a
                    //script that can be loaded across domains.
                    fileName = req.toUrl(parsed.moduleName + '.' +
                                         parsed.ext) + '.js';

                //Leverage own load() method to load plugin value, but only
                //write out values that do not have the strip argument,
                //to avoid any potential issues with ! in file names.
                text.load(nonStripName, req, function (value) {
                    //Use own write() method to construct full module value.
                    //But need to create shell that translates writeFile's
                    //write() to the right interface.
                    var textWrite = function (contents) {
                        return write(fileName, contents);
                    };
                    textWrite.asModule = function (moduleName, contents) {
                        return write.asModule(moduleName, fileName, contents);
                    };

                    text.write(pluginName, nonStripName, textWrite, config);
                }, config);
            }
        };

        if (text.createXhr()) {
            text.get = function (url, callback) {
                var xhr = text.createXhr();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function (evt) {
                    //Do not explicitly handle errors, those should be
                    //visible via console output in the browser.
                    if (xhr.readyState === 4) {
                        callback(xhr.responseText);
                    }
                };
                xhr.send(null);
            };
        } else if (typeof process !== "undefined" &&
                 process.versions &&
                 !!process.versions.node) {
            //Using special require.nodeRequire, something added by r.js.
            fs = require.nodeRequire('fs');

            text.get = function (url, callback) {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            };
        } else if (typeof Packages !== 'undefined') {
            //Why Java, why is this so awkward?
            text.get = function (url, callback) {
                var encoding = "utf-8",
                    file = new java.io.File(url),
                    lineSeparator = java.lang.System.getProperty("line.separator"),
                    input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                    stringBuffer, line,
                    content = '';
                try {
                    stringBuffer = new java.lang.StringBuffer();
                    line = input.readLine();

                    // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                    // http://www.unicode.org/faq/utf_bom.html

                    // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                    // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                    if (line && line.length() && line.charAt(0) === 0xfeff) {
                        // Eat the BOM, since we've already found the encoding on this file,
                        // and we plan to concatenating this buffer with others; the BOM should
                        // only appear at the top of a file.
                        line = line.substring(1);
                    }

                    stringBuffer.append(line);

                    while ((line = input.readLine()) !== null) {
                        stringBuffer.append(lineSeparator);
                        stringBuffer.append(line);
                    }
                    //Make sure we return a JavaScript string and not a Java string.
                    content = String(stringBuffer.toString()); //String
                } finally {
                    input.close();
                }
                callback(content);
            };
        }

        return text;
    });
}());

define('text!locales/en/messages.json',[],function () { return '{\n  "application_title" : {\n    "message" : "LingSync beta",\n    "description" : "The title of the application, displayed in the web store."\n  },\n  "application_description" : {\n    "message" : "An on/offline fieldlinguistics database app which adapts to its user\'s I-Language.",\n    "description" : "The description of the application, displayed in the web store."\n  },\n  "locale_Close_and_login_as_LingLlama" : {\n    "message" : "Login as LingLlama",\n    "description" : "button"\n  },\n  "locale_Close_and_login_as_LingLlama_Tooltip" : {\n    "message" : "You can log in as LingLlama to explore the app pre-populated with data. There are also comments left by users to explain what widgets are for and how you can use them. If you\'re new to LingSync this is a great place to start after watching the videos. ",\n    "description" : "tooltip"\n  },\n  "locale_Username" : {\n    "message" : "Username:"\n  },\n  "locale_Password" : {\n    "message" : "Password:"\n  },\n  "locale_Sync_my_data_to_this_computer" : {\n    "message" : "Sync my data to this device"\n  },\n  "locale_Welcome_to_FieldDB" : {\n    "message" : "Welcome to LingSync!"\n  },\n  "locale_An_offline_online_fieldlinguistics_database" : {\n    "message" : "LingSync is a free, open source project developed collectively by field linguists and software developers to make a modular, user-friendly app which can be used to collect, search and share data, both online and offline."\n  },\n  "locale_Welcome_Beta_Testers" : {\n    "message" : "<p>Welcome Beta Testers! Please sit back with a cup of tea and <a target=\'top\' href=\'https://www.youtube.com/embed/videoseries?list=PL984DA79F4B314FAA\'>watch this play list before you begin testing LingSync</a>. Leave us notes, bugs, comments, suggestions etc in the Contact Us/Bug Report form in the User Menu. Your feedback helps us prioritize what to fix/implement next!</p>"\n  },\n  "locale_Welcome_Screen" : {\n    "message" : "<p>Curious what this is? <a target=\'top\' href=\'https://www.youtube.com/embed/videoseries?list=PL984DA79F4B314FAA\'>You can watch this play list to find out.</a>. You can find help and more info in the top right menu of the Corpus Dashboard.</p>"\n  },\n  "locale_Create_a_new_user" : {\n    "message" : "Register"\n  },\n  "locale_What_is_your_username_going_to_be" : {\n    "message" : "What is your username going to be?"\n  },\n  "locale_Confirm_Password" : {\n    "message" : "Confirm Password:"\n  },\n  "locale_Sign_in_with_password" : {\n    "message" : "Register"\n  },\n  "locale_Warning" : {\n    "message" : "Warning!"\n  },\n  "locale_Instructions_to_show_on_dashboard" : {\n    "comment" : "<p>Welcome! This is your Corpus dashboard. On the left side, there are Corpus and Elicitation Session quick-views, both of which you    can make full screen by clicking the icon on the top right corner. Full    screen shows you details of the Corpus and Elicitation Session. If this   is your first time seeing this message, you should change your corpus   title and description by clicking <i class=\' icon-edit\'></i>. You can hover over any    icon to see what the icon does. You should also change your session goals     and date for your first elicitation session.</p>    <p>For more help text, videos and userguide, click the <span class=\'caret\'></span> on the top right corner of the app.     To more information about what a \'Corpus\' is, click <i class=\' icon-cogs resize-full\'></i>.     It will show the corpus settings, which contains explanations of each component of a \'Corpus.\'</p>    <p>This is the first draft of these instructions. Please help us make this better. <a href=\'https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ\' target=\'_new\'>Contact us</a> </p>",\n    "message" : "<p>Welcome! This is your Corpus dashboard. If this is your first time seeing this message, please do the following: </p> <p><b>Corpus</b> On the left side, there is Corpus quick-view. Edit your corpus title and description by clicking <i class=\' icon-edit\'></i>. To see what Corpus consists of, click <i class=\' icon-cogs resize-full\'></i>. </p> <p><b>Elicitation Session</b> Below the Corpus quick-view, there is Elicitation Session quick-view. Edit the goal and date for your first elicitation session by clicking <i class=\' icon-edit\'></i>. Click <i class=\' icon icon-resize-full\'></i> to see more details of Elicitation Session. </p> <p> You can hover over any icon to see what the icon does. For more help text, videos and userguide, click the <span class=\'caret\'></span> on the top right corner of the app. </p> <p>This is the first draft of these instructions. Please help us make this better. <a href=\'https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ\' target=\'_new\'>Contact us</a> </p>"\n    \n  },\n  "locale_elicitation_sessions_explanation" : {\n    "message" : "<p>Like in the real world, an Elicitation Session can have a variety of forms. For example: a 1 hour session with a language consultant, a 3 hour field methods class with several speakers, an extended conversation or narrative, or data from a file import. </p> <p>You can describe various aspects of an Elicitation Session such as date, goal/topic, consultant(s), etc. by clicking the <i class=\'icons icon-edit\'></i> icon in Dashboard view. For additional options, click on the <i class=\'icon-calendar\'></i> icon beside the session name in the list below.</p> <p>Any description you enter will be displayed in the list of Elicitation Sessions below to help you identify them. This information will also be automatically copied into every Datum that is associated with the Session, so that you can search for individual Datum by date, consultant, dialect, etc. </p>"\n  },\n  "locale_datalists_explanation" : {\n    "message" : "<p>A Datalist is a collection of Datum that you put together for some reason. Some examples are: making a handout, sharing data with someone, exporting into another program, or simply keeping track of similar Datum for your research.</p> <p> Creating a Datalist is like making a bookmark to a set of custom search results. First, do a search for whatever you want the Datalist to be about. Then, if you don\'t want some of the results to be included in the Datalist, click the <i class=\'icon-remove-sign\'></i> icon by any Datum to remove it. Finally, edit the title and description, and click the save button to create the Datalist.</p> <p>You can see your Datalists on the left side of your dashboard (click plus/minus to expand/minimize) or in the list below (double-click on a title to view details). </p><p>To see all your data, do a search with nothing in the search bar. If you have over 200 Datum in your corpus, this can be pretty slow, so you may prefer to search for a subset. In general, a Datalist with more than 100 Datum will take a few seconds to load.</p> <p> In the Datalist view, the Datum will appear in the colour of their current state (i.e. Checked with a consultant, To be checked, Deleted etc). You can make new states in the Datum State Settings on this page. </p>"\n  },\n  "locale_permissions_explanation" : {\n    "message" : "<p>Permissions are where you give other people access to your corpus.</p><p>To add another LingSync user, you need to know their username. Click the <i class=\'icons icon-edit\'></i> icon at the top right and then come back to Permissions and click the \'See current team members\' button. You can then add users by typing in their username by the appropriate group.</p> <p>Admins can add other people to any group but not do anything with the data unless they are also writers/readers.</p> <p>Writers can enter new data, add comments, change Datum State from \'to be checked to \'checked\' etc, but not see data that is already entered. </p><p>Readers can see data that is already entered in the app but not edit or comment on it. </p><p>If you want someone to be able to both enter data and see existing data, add them as both a writer and a reader.</p><p>If you want to make your corpus public and findable on Google as recommended by EMLED data management best practices, type \'Public\' in the \'Public or Private\' field below.</p><p>You can, and should, encrypt any Datum containing sensitive information by clicking the <i class=\' icon-unlock\'></i> button at the bottom of the Datum. Encrypted Datums are shown as \'xxx xx xx xx\' to all users, including on the web. If you want to see the contents of a confidential Datum, click on the <i class=\'icon-eye-open\'></i> and enter your password. This will make the Datum visible for 10 minutes.</p>"\n  },\n  "locale_datum_fields_explanation" : {\n    "message" : "<p>Datum Fields are fields where you can add information about your Datum. There fields are automatically detected when you import data, so if you have data already, you should import it to save you time configuring your corpus. </p> <p>By default, the app comes with 4 fields which it uses to create inter-linearized glosses (the pretty view which you are used to seeing in books and handouts). You can add any number of fields (we have tested using over 400 fields). </p> <p>In the Datum Edit view, the fields that are used most frequently in your corpus will automatically appear when you open a Datum, and you can click on <i class=\'icon-list-alt\'> </i> to see the rare fields. </p><p>The fields in your corpus (shown below) are automatically available in search. You can choose to encrypt particular fields (e.g. utterance). If you mark a Datum as confidential, the encrypted fields will be encrypted in the database and masked from the user as \'xxx xx xxxxx\'. For example, you may choose to not encrypt a lambda calculus field or a grammatical notes field, as these are usually purely a linguistic formalism and may not transmit any personal information which your consultants would like to keep confidential. </p><p> Each Datum Field has a help convention, which is the text you see below. Use this to help everyone remember what information goes in which field. Anyone who can enter data in your corpus can see these help conventions by clicking the <i class=\'icon-question-sign\'></i> next to the Datum Field label in the Datum Edit view. </p><p>You can edit the help text by clicking <i class=\'icons icon-edit\'></i> icon at the top right. These help conventions are also exported as a README.txt when you export your data, as recommended by EMELD data management best practices. </p>"\n  },\n    "locale_conversation_fields_explanation" : {\n    "message" : "<p>Conversation Fields are fields which where you can add information about your Conversation. As defaults the conversation comes with 2 fields (audio and speakers), and each turn of the conversation (each Datum within it) comes with the usual 4 default datum fields.  You can add any number of fields here if they are relevant to the WHOLE conversation (ex: location, context, world knowledge, sociolinguistic variables).  The conversation fields in your corpus (shown below) are automatically available in the search. You can choose to encrypt particular fields (e.g. utterance). If you mark a Conversation as confidential, the encrypted fields will be encrypted in the database and masked from the user as \'xxx xx xxxxx\'. For example, you may choose to not encrypt a \'location\' field, but instead choose to encrypt a \'world knowledge\' field as it may contain sensitive personal information which consultants would not want public. Each Conversation field can have a help convention, which is the text you see below. Your team members can see these help/conventions by clicking the <i class=\'icon-question-sign\'></i> next to the Conversation field label in the Conversation Edit view. These help conventions are also exported as a README.txt when you export your data, as recommended by EMELD data management best practices. </p>"\n  },\n  "locale_datum_states_explanation" : {\n    "message" : "<p>Datum States are used to keep track of whether the data is valid or invalid, for example, \'Checked\' with a consultant, \'To be checked\', \'Deleted\' etc. </p> <p>Datum States can be as detailed as you choose. You can create your own Datum States for your own corpus to help you manage your team\'s data validation workflow (e.g. \'To be checked with Sophie,\' \'Checked with Gladys\').  You can assign colours to your Datum States, which will appear as the background colour of the Datum in any Datalist. </p> <p> If you flag a Datum as Deleted it won\'t show up in search results anymore, but a Datum in a corpus is never really deleted. It remains in the database complete with its change history so that you can review it at a later date. (In future we might add a button to allow users to \'empty the trash\' and mass-delete old Datum from the system.) </p> "\n  },\n   "locale_advanced_search_explanation" : {\n    "message" : "<p>Search errs on the side of including more results, rather than missing anything. </p> <p>For example, you can type \'nay\' and search will find the morphemes \'onay\', \'naya\' etc. </p> <p>Search automatically creates a temporary list of data. If you enter new matching data, it will be added automatically this can be a handy way to see the data you have entered recently, as you enter data.. If you want to keep the list of data, click Save and a new DataList will be created. </p> <p>For now, search is offline, running on your device, but we would eventually like to have a more advanced search that works online, sorts results better, and could let you search for minimal pairs using features.</p>"\n   },\n  "locale_New_User" : {\n    "message" : "New User"\n  },\n  "locale_Activity_Feed_Your" : {\n    "message" : "Your Activity Feed"\n  },\n  "locale_Activity_Feed_Team" : {\n    "message" : "Corpus Team Activity Feed"\n  },\n  "locale_Refresh_Activities" : {\n    "message" : "Refresh activity feed to bring it up-to-date."\n  },\n  "locale_Need_save" : {\n    "message" : " Need save:"\n  },\n  "locale_60_unsaved" : {\n    "message" : "<strong>60% unsaved.</strong>"\n  },\n  "locale_Recent_Changes" : {\n    "message" : "Recent Changes:"\n  },\n  "locale_Need_sync" : {\n    "message" : "Need sync:"\n  },\n  "locale_Differences_with_the_central_server" : {\n    "message" : "Differences with the central server:"\n  },\n  "locale_to_beta_testers" : {\n    "message" : "These messages are here to communicate to users what the app is doing. We will gradually reduce the number of messages as the app becomes more stable. <p>You can close these messages by clicking on their x.</p>"\n  },\n  "locale_We_need_to_make_sure_its_you" : {\n    "message" : "We need to make sure it\'s you..."\n  },\n  "locale_Yep_its_me" : {\n    "message" : "Yep, it\'s me"\n  },\n  "locale_Log_Out" : {\n    "message" : "Log Out"\n  },\n  "locale_Log_In" : {\n    "message" : "Log In"\n  },\n  "locale_User_Settings" : {\n    "message" : "User Settings"\n  },\n  "locale_Keyboard_Shortcuts" : {\n    "message" : "Keyboard Shortcuts"\n  },\n  "locale_Corpus_Settings" : {\n    "message" : "Corpus Settings"\n  },\n  "locale_Terminal_Power_Users" : {\n    "message" : "Power Users Backend"\n  },\n  "locale_New_Datum" : {\n    "message" : "New Datum"\n  },\n  "locale_New_menu" : {\n    "message" : "New"\n  },\n  "locale_New_Conversation" : {\n  \t"message" : "New Conversation"\n  },\n  "locale_New_Data_List" : {\n    "message" : "New Data List"\n  },\n  "locale_New_Session" : {\n    "message" : "New Session"\n  },\n  "locale_New_Corpus" : {\n    "message" : "New Corpus"\n  },\n  "locale_Data_menu" : {\n    "message" : "Data"\n  },\n  "locale_Import_Data" : {\n    "message" : "Import Data"\n  },\n  "locale_Export_Data" : {\n    "message" : "Export Data"\n  },\n  "locale_All_Data" : {\n  \t"message" : "All Data"\n  },\n  "locale_Save" : {\n    "message" : "Save"\n  },\n  "locale_Title" : {\n    "message" : "Title:"\n  },\n  "locale_Description" : {\n    "message" : "Description:"\n  },\n  "locale_Sessions_associated" : {\n    "message" : "Elicitation Sessions associated with this corpus"\n  },\n  "locale_Datalists_associated" : {\n    "message" : "Datalists associated with this corpus"\n  },\n  "locale_Permissions_associated" : {\n    "message" : "Permissions associated with this corpus"\n  },\n  "locale_Datum_field_settings" : {\n    "message" : "Datum Field Settings"\n  },\n  "locale_Conversation_field_settings" : {\n    "message" : "Conversation Field Settings"\n  },\n  "locale_Encrypt_if_confidential" : {\n    "message" : "Encrypt if confidential:"\n  },\n  "locale_Help_Text" : {\n    "message" : "Help Text:"\n  },\n  "locale_Add" : {\n    "message" : "Add"\n  },\n  "locale_Datum_state_settings" : {\n    "message" : "Datum State Settings"\n  },\n  "locale_Green" : {\n    "message" : "Green"\n  },\n  "locale_Orange" : {\n    "message" : "Orange"\n  },\n  "locale_Red" : {\n    "message" : "Red"\n  },\n  "locale_Blue" : {\n    "message" : "Blue"\n  },\n  "locale_Teal" : {\n    "message" : "Teal"\n  },\n  "locale_Black" : {\n    "message" : "Black"\n  },\n  "locale_Default" : {\n    "message" : "Default"\n  },\n  "locale_Elicitation_Session" : {\n    "message" : "Elicitation Session"\n  },\n  "locale_Export" : {\n    "message" : "Export"\n  },\n  "locale_Actions" : {\n    "message" : "Actions"\n  },\n  "locale_Navigation" : {\n    "message" : "Navigation"\n  },\n  "locale_Datum_Status_Checked" : {\n    "message" : "Mark Datum status as checked/verified with language consultant"\n  },\n  "locale_Next_Datum" : {\n    "message" : "Next Datum"\n  },\n  "locale_Previous_Datum" : {\n    "message" : "Previous Datum"\n  },\n  "locale_Data_Entry_Area" : {\n    "message" : "Data Entry Area <small>(1-5 datum)</small>"\n  },\n  "locale_Search" : {\n    "message" : "Type your search query, or hit enter to see all data"\n  },\n  "locale_View_Profile_Tooltip" : {\n    "message" : "Click to view user\'s page"\n  },\n  "locale_View_Public_Profile_Tooltip" : {\n    "message" : "View/edit your public user\'s page"\n  },\n  "locale_Edit_User_Profile_Tooltip" : {\n    "message" : "Click to edit your user profile"\n  },\n  "locale_Public_Profile_Instructions" : {\n    "message" : "This is your public user\'s page. You can edit it to change/remove information. This is what your team members can see when they click on your gravatar. All of this information (including your gravatar) can be different from the information in your private profile."\n  },\n  "locale_Private_Profile_Instructions" : {\n    "message" : "This is your private profile."\n  },\n  "locale_Edit_Public_User_Profile" : {\n    "message" : "Edit my public user\'s page"\n  },\n  "locale_Close" : {\n    "message" : "Close"\n  },\n  "locale_New_Corpus_Instructions" : {\n    "message" : "Edit the fields below to create a new corpus, or push ESC to enter more data in the current corpus"\n  },\n  "locale_New_Corpus_Warning" : {\n    "message" : " The New Corpus functionality still needs more testing, this message will disappear when New Corpus is not experimental."\n  },\n  "locale_Cancel" : {\n    "message" : "Cancel"\n  },\n  "locale_Next" : {\n    "message" : "Next"\n  },\n  "locale_Show" : {\n    "message" : "Show"\n  },\n  "locale_per_page" : {\n    "message" : "per page"\n  },\n  "locale_New_Session_Instructions" : {\n    "message" : "<p>Edit the fields below to create a new elicitation session, or push ESC to enter more data in the current session.</p>"\n  },\n  "locale_Consultants" : {\n    "message" : "Consultant(s):"\n  },\n  "locale_Goal" : {\n    "message" : "Goal:"\n  },\n  "locale_When" : {\n    "message" : "When:"\n  },\n  "locale_Save_And_Import" : {\n    "message" : "Save and Finish Importing"\n  },\n  "locale_Import" : {\n    "message" : "Import"\n  },\n  "locale_percent_completed" : {\n    "message" : "% completed."\n  },\n  "locale_Import_Instructions" : {\n    "comment" : " <ol> <li>Type, or Drag and drop a file/text (csv, txt, tabbed, xml, text, eaf, sf) to the area indicated below.</li> <li>(Edit/type in the text area to correct information as needed.)</li> <li>Associate your corpus\'s existing default data fields with the appropriate columns by either dragging the colored datum fields, or by typing in the column header input box .</li> <li>Type in any other column headings that you want to keep in your data, the app will automatically add these to the corpus\' default datum fields. This means that you can search through them to locate your data. Each row in the table will be come a \'datum\' in your corpus database.</li> <li>Click on the Attempt Import button at any time to see what your data will look like in a interlinear glossed data list.</li> <li>Review the interlinear glossed data list which appears on the left to see if the import looks good.</li> <li>(Continue to edit the table cells as needed, click Attempt Import and review data list as many times as you would like until the import looks correct).</li> <li>When satisfied with the data list, click Save and your data will be imported into your corpus. A new elicitation session will be created using the date modified of the file you imported (if you want, you can edit this session later to add a more accurate goal discussing why the file was originally created), a new data list will also be created which contains all these data since it is likely that you grouped this data together into a file for a reason in the first place. You can find the resulting new default datum fields, session, and data list in your Corpus Settings page.</li><li>(Click on the home button to do something else while it imports your data in the background.)</li> </ol>", \n    "message" : "Everyone\'s data is different. <a href=\'http://www.facebook.com/LingSyncApp\'>You might know some fellow users who might be able to help you import yours: </a>"\n  }, \n  "locale_Import_First_Step" : {\n    "message" : "<p>Step 1: Drag & drop, copy-paste or type your data into the text area. You can edit the data inside the text area.</p>"\n  },\n    "locale_Import_Second_Step" : {\n    "message" : "<p>Step 2: Drag and drop or type the field names in column headers. Edit data in the table as needed.</p>"\n  },\n  "locale_Import_Third_Step" : {\n    "message" : "<p>Step 3: The imported data will look like this. Edit in the table or the text area above as needed. Edit the datalist title and description, and the eliciation session section before finishing import. </p>"\n  },\n  "locale_Drag_Fields_Instructions" : {\n    "message" : "<p>Drag (or type) the coloured datum fields to the column headings which match. Type in any additional column headings which you would like to keep as datum fields. The columns will become default datum fields in your corpus database and will also become fields that you can search through to locate your data. Each row will become a \'datum\' in your corpus database.</p>"\n  },\n  "locale_Add_Extra_Columns" : {\n    "message" : "Insert Extra Columns"\n  },\n  "locale_Attempt_Import" : {\n    "message" : "Preview Import"\n  },\n  "locale_LaTeX_Code" : {\n    "message" : "LaTeX Code:"\n  },\n  "locale_Unicode_Instructions" : {\n    "message" : "By default this is also a keyboard shortcut to type this character in a datum field. To customize the shortcut:"\n  },\n  "locale_Remove_Unicode" : {\n    "message" : "Remove Unicode"\n  },\n  "locale_Unicode" : {\n    "message" : "Unicode"\n  },\n  "locale_Drag_and_Drop" : {\n    "message" : "<small>Drag and Drop</small>"\n  },\n  "locale_AND" : {\n    "message" : "AND"\n  },\n  "locale_OR" : {\n    "message" : "OR"\n  },\n  "locale_Advanced_Search" : {\n    "message" : "Advanced Search"\n  },\n  "locale_Advanced_Search_Tooltip" : {\n    "message" : "Advanced Search allows you to use your corpus-wide datum fields or session details to search for datum, using either AND or OR with substring match."\n  },\n  "locale_User_Profile" : {\n    "message" : "User Profile"\n  },\n  "locale_Private_Profile" : {\n    "message" : "User Profile"\n  },\n  "locale_Public_Profile" : {\n    "message" : "Public Profile"\n  },\n  "locale_Email" : {\n    "message" : "Email:"\n  },\n  "locale_Research_Interests" : {\n    "message" : "Research Interests:"\n  },\n  "locale_Affiliation" : {\n    "message" : "Affiliation:"\n  },\n  "locale_Corpora" : {\n    "message" : "Corpora:"\n  },\n  "locale_Gravatar" : {\n    "message" : "Gravatar"\n  },\n  "locale_Gravatar_URL" : {\n    "message" : "Gravatar URL:"\n  },\n  "locale_Firstname" : {\n    "message" : "First name:"\n  },\n  "locale_Lastname" : {\n    "message" : "Last name:"\n  },\n  "locale_Skin" : {\n    "message" : "Skin:"\n  },\n  "locale_Background_on_Random" : {\n    "message" : "Background on Random"\n  },\n  "locale_Transparent_Dashboard" : {\n    "message" : "Transparent Dashboard"\n  },\n  "locale_Change_Background" : {\n    "message" : "Change Background"\n  },\n  "locale_Number_Datum" : {\n    "message" : "Number of Datum to appear at a time:"\n  },\n  "locale_Help_Text_Placeholder" : {\n    "message" : "Put a help text or your team data entry conventions for this field here (optional)."\n  },\n  "locale_Add_Placeholder" : {\n    "message" : "Add...."\n  },\n  "locale_Datalist_Description" : {\n    "message" : "You can use Datalists to create handouts or to prepare for sessions with consultants, or to share with collaborators."\n  },\n  "locale_Add_Tag" : {\n    "message" : "New Tag..."\n  },\n  "locale_Drag_and_Drop_Placeholder" : {\n    "message" : "Drag and drop, copy-paste or type your data here."\n  },\n  "locale_Paste_Type_Unicode_Symbol_Placeholder" : {\n    "message" : "Paste/type unicode symbol"\n  },\n  "locale_TIPA_shortcut" : {\n    "message" : "TIPA/keyboard shortcut"\n  },\n  "locale_Show_Activities" : {\n    "message" : "Show Activities"\n  },\n  "locale_Hide_Activities" : {\n    "message" : "Hide Activities"\n  },\n  "locale_Show_Dashboard" : {\n    "message" : "Show dashboard with data entry form"\n  },\n  "locale_Save_on_this_Computer" : {\n    "message" : "Save on this device."\n  },\n  "locale_Sync_and_Share" : {\n    "message" : "Sync and share with team"\n  },\n  "locale_Show_Readonly" : {\n    "message" : "Show read only"\n  },\n  "locale_Show_Fullscreen" : {\n    "message" : "Show full screen"\n  },\n  "locale_Add_New_Datum_Field_Tooltip" : {\n    "message" : "Add new datum field"\n  },\n  "locale_Add_New_Conversation_Field_Tooltip" : {\n    "message" : "Add new conversation field"\n  },\n  "locale_Add_New_Datum_State_Tooltip" : {\n    "message" : "Add new datum state"\n  },\n  "locale_Show_in_Dashboard" : {\n    "message" : "Show in dashboard"\n  },\n  "locale_Edit_corpus" : {\n    "message" : "Edit Corpus"\n  },\n  "locale_Show_corpus_settings" : {\n    "message" : "Show Corpus Settings"\n  },\n  "locale_Drag_and_Drop_Audio_Tooltip" : {\n    "message" : "Drag and drop audio over the audio player to attach an audio file. Drag and drop option for YouTube videos coming soon."\n  },\n  "locale_Play_Audio" : {\n    "message" : "Play audio"\n  },\n  "locale_Play_Audio_checked" : {\n    "message" : "Play audio of checked items"\n  },\n  "locale_Remove_checked_from_datalist_tooltip" : {\n    "message" : "Remove checked datum from this data list (they will still be in the corpus). "\n  },\n  "locale_Plain_Text_Export_Tooltip" : {\n    "message" : "Export as plain text/Copy to clipboard"\n  },\n  "locale_Plain_Text_Export_Tooltip_checked" : {\n    "message" : "Export as plain text/Copy checked items to clipboard"\n  },\n  "locale_Duplicate" : {\n    "message" : "Duplicate datum to create a minimal pair"\n  },\n  "locale_Encrypt" : {\n    "message" : "Make this datum confidential"\n  },\n  "locale_Encrypt_checked" : {\n    "message" : "Make checked items confidential"\n  },\n  "locale_Decrypt_checked" : {\n    "message" : "Remove confidentiality from checked items (Warning: this will save them as decrypted in the database). If you just want to unmask them so you can edit edit them, click on the eye instead."\n  },\n  "locale_Decrypt" : {\n    "message" : "Remove confidentiality from this datum (Warning: this will save it as decrypted in the database). If you just want to unmask it so you can edit edit it, click on the eye instead."\n  },\n  "locale_Show_confidential_items_Tooltip" : {\n    "message" : "Unmask confidential/encrypted data so that it can be edited and read for the next 10 minutes."\n  },\n  "locale_Hide_confidential_items_Tooltip" : {\n    "message" : "Return to masked view of confidential/encrypted data"\n  },\n  "locale_Edit_Datalist" : {\n    "message" : "Edit Data List"\n  },\n  "locale_Export_checked_as_LaTeX" : {\n    "message" : "Export checked as LaTeX"\n  },\n  "locale_Export_checked_as_CSV" : {\n    "message" : "Export checked as CSV"\n  },\n  "locale_Hide_Datalist" : {\n    "message" : "Hide datalist"\n  },\n  "locale_Show_Datalist" : {\n    "message" : "Show datalist"\n  },\n  "locale_Edit_Datum" : {\n    "message" : "Edit Datum"\n  },\n  "locale_See_Fields" : {\n    "message" : "Hide/Show infrequent fields"\n  },\n  "locale_Add_Tags_Tooltip" : {\n    "message" : "Add a tag to this datum. Tags can be used to categorize datum, count how many datum of each tag you have, and search datum."\n  },\n  "locale_Edit_Session" : {\n    "message" : "Edit Session"\n  },\n  "locale_Show_Unicode_Palette" : {\n    "message" : "Show Unicode Palette"\n  },\n  "locale_Hide_Unicode_Palette" : {\n    "message" : "Hide Unicode Palette"\n  },\n  "locale_Add_new_symbol" : {\n    "message" : "Add new symbol"\n  },\n  "locale_Public_or_Private" : {\n    "message" : "Public or Private:"\n  },\n  "locale_Insert_New_Datum" : {\n    "message" : "Insert a new datum on top of the dashboard center"\n  },\n  "locale_LaTeX" : {\n    "message" : "Export datum as LaTeX"\n  },\n  "locale_CSV_Tooltip" : {\n    "message" : "Export datum as CSV"\n  },\n  "locale_of" : {\n    "message" : "of"\n  },\n  "locale_pages_shown" : {\n    "message" : "pages shown"\n  },\n  "locale_More" : {\n    "message" : "More"\n  }\n}\n';});

define('user/UserApp',[
    "backbone", 
    "authentication/Authentication", 
    "corpus/Corpus",
    "user/UserAppView",
    "user/UserRouter",
    "confidentiality_encryption/Confidential",
    "user/User",
    "user/UserMask",
    "text!locales/en/messages.json",
    "libs/OPrime"
], function(
    Backbone, 
    Authentication, 
    Corpus,
    UserAppView,
    UserRouter,
    Confidential,
    User,
    UserMask,
    LocaleData

) {
  var UserApp = Backbone.Model.extend(
  /** @lends UserApp.prototype */
  {
    /**
     * @class The UserApp handles the loading of the user page (login, welcome etc). 
     * 
     * @property {Authentication} authentication The auth member variable is an
     *           Authentication object permits access to the login and logout
     *           functions, and the database of users depending on whether the
     *           app is online or not. The authentication is the primary way to access the current user.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      OPrime.debug("USERAPP INIT");

      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      // If there's no authentication, create a new one
      if (!this.get("authentication")) {
        this.set("authentication", new Authentication({filledWithDefaults: true}));
      }

      /*
       * Start the pub sub hub
       */
      window.hub = {};
      OPrime.makePublisher(window.hub);

      /*
       * Check for user's cookie and the dashboard so we can load it
       */
      var username = OPrime.getCookie("username");
      if (username == null && username == "") {
        // new user, take them to the index which can handle new users.
        window.location.replace('index.html');
      }
      window.Locale = {};
      window.Locale.get = function(message) {
        return window.Locale.data[message].message;
      };
      if (LocaleData) {
        window.Locale.data = JSON.parse(LocaleData);
      } else {
        console.log("Locales did not load.");
        window.Locale.get = function(message) {
          return "";
        };
      }

      window.app = this;
      var appself = this;
      OPrime.debug("Loading encrypted user");
      var u = localStorage.getItem("encryptedUser");
      if(!u){
        window.location.replace("index.html");
        return;
      }
      appself.get("authentication").loadEncryptedUser(u, function(success, errors){
        if(success == null){
//        alert("Bug: We couldn't log you in."+errors.join("\n") + " " + OPrime.contactUs);  
//        OPrime.setCookie("username","");
//        OPrime.setCookie("token","");
//        localStorage.removeItem("encryptedUser");
//        window.location.replace('index.html');
          return;
        }else{
          window.appView = new UserAppView({model: appself}); 
          window.appView.render();
          appself.router = new UserRouter();
          Backbone.history.start();
        }
      });
    },
    /*
     * This will be the only time the app should open the pouch.
     */
    changePouch : function(couchConnection, callback) {
      if (!couchConnection || couchConnection == undefined) {
        console.log("App.changePouch couchConnection must be supplied.");
        return;
      } else {
        console.log("App.changePouch setting couchConnection: ", couchConnection);
        this.set("couchConnection", couchConnection);
      }

      if(OPrime.isCouchApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }

      if (this.pouch == undefined) {
        // this.pouch = Backbone.sync.pouch("https://localhost:6984/"
        // + couchConnection.pouchname);
        this.pouch = Backbone.sync
        .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl
            + couchConnection.pouchname : OPrime.pouchUrl
            + couchConnection.pouchname);
      }
      if (typeof callback == "function") {
        callback();
      }
    },
    addActivity : function(jsonActivity) {
      OPrime.debug("There is no activity feed in the user app, not saving this activity.", jsonActivity);
//    if (backBoneActivity.get("teamOrPersonal") == "team") {
//    window.app.get("currentCorpusTeamActivityFeed").addActivity(backBoneActivity);
//    } else {
//    window.app.get("currentUserActivityFeed").addActivity(backBoneActivity);
//    }
    },
    /**
     * Log the user into their corpus server automatically using cookies and post so that they can replicate later.
     * "http://localhost:5984/_session";
     * 
     * References:
     * http://guide.couchdb.org/draft/security.html
     * 
     * @param username this can come from a username field in a login, or from the User model.
     * @param password this comes either from the UserWelcomeView when the user logs in, or in the quick authentication view.
     * @param callback A function to call upon success, it receives the data back from the post request.
     */
    logUserIntoTheirCorpusServer : function(couchConnection, username, password, succescallback, failurecallback) {
      //TODO move this code to the app version of this function
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = this.get("couchConnection");
      }
      
      /* if on android, turn on replication and dont get a session token */
      if(OPrime.isTouchDBApp()){
        Android.setCredentialsAndReplicate(couchConnection.pouchname,
            username, password, couchConnection.domain);
        OPrime
        .debug("Not getting a session token from the users corpus server " +
            "since this is touchdb on android which has no rights on iriscouch, and also has no tokens.");
        if (typeof succescallback == "function") {
          succescallback();
        }
        return;
      }
      
      
      var couchurl = couchConnection.protocol + couchConnection.domain;
      if (couchConnection.port != null) {
        couchurl = couchurl + ":" + couchConnection.port;
      }
      if(!couchConnection.path){
        couchConnection.path = "";
//        this.get("couchConnection").path = "";
      }
      couchurl = couchurl  + couchConnection.path + "/_session";
      var corpusloginparams = {};
      corpusloginparams.name = username;
      corpusloginparams.password = password;
      $.ajax({
        type : 'POST',
        url : couchurl ,
        data : corpusloginparams,
        success : function(serverResults) {
          if(window.appView){
            window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
          }
          
          /* if in chrome extension, or offline, turn on replication */
          if(OPrime.isChromeApp()){
            //TODO turn on pouch and start replicating and then redirect user to their user page(?)
          }
          
          if (typeof succescallback == "function") {
            succescallback(serverResults);
          }
        },
        error : function(serverResults){
          window.setTimeout(function(){
            //try one more time 5 seconds later 
            $.ajax({
              type : 'POST',
              url : couchurl ,
              success : function(serverResults) {
                if(window.appView){
                  window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
                }
                if (typeof succescallback == "function") {
                  succescallback(serverResults);
                }
              },
              error : function(serverResults){
                if(window.appView){
                  window.appView.toastUser("I couldn't log you into your corpus. What does this mean? " +
                      "This means you can't upload data to train an auto-glosser or visualize your morphemes. " +
                      "You also can't share your data with team members. If your computer is online and you are" +
                      " using the Chrome Store app, then this probably the side effect of a bug that we might not know about... please report it to us :) " +OPrime.contactUs+
                      " If you're offline you can ignore this warning, and sync later when you're online. ","alert-danger","Offline Mode:");
                }
                if (typeof failurecallback == "function") {
                  failurecallback("I couldn't log you into your corpus.");
                }
                OPrime.debug(serverResults);
                window.app.get("authentication").set("staleAuthentication", true);
              }
            });
          }, 5000);
        }
      });
    },
    
    render: function(){
      $("#user-fullscreen").html("list of corpora goes here");
      return this;
    },
    router : UserRouter,
  });
  return UserApp;
});

console.log("Loading Webservices info");
/* Extends the OPrime class */
var OPrime = OPrime || {};


OPrime.websiteUrl = "https://wwwdev.fieldlinguist.com:3182";
OPrime.authUrl = "https://authdev.fieldlinguist.com:3183";
OPrime.audioUrl = "https://audiodev.fieldlinguist.com:3184";
OPrime.lexiconUrl = "https://lexicondev.fieldlinguist.com:3185";
OPrime.corpusUrl = "https://corpusdev.fieldlinguist.com:3186";
OPrime.activityUrl = "https://activitydev.fieldlinguist.com:3187";
OPrime.widgetUrl = "https://widgetdev.fieldlinguist.com:3188";

/*
 * Use the current app's chrome url, assuming if its a dev, they will have their
 * own url that is not from the market, and if its a bleeding edge user, they
 * will have the market one. In both cases it is save to return the
 * window.location.href but this code is added to be clear that there is also a
 * bleeding edge url for users.
 */
OPrime.chromeClientUrl = function(){
  if (window.location.origin != "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa"){
    return window.location.origin;
  }else{
    return "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa";
  }
};
  
/*
 * This function is the same in all webservicesconfig, now any couchapp can
 * login to any server, and register on the corpus server which matches its
 * origin.
 */
OPrime.defaultCouchConnection = function() {
  var localhost = {
      protocol : "https://",
      domain : "localhost",
      port : "6984",
      pouchname : "default",
      path : ""
  };
  var testing = {
      protocol : "https://",
      domain : "ifielddevs.iriscouch.com",
      port : "443",
      pouchname : "default",
      path : ""
  }; 
  var production = {
      protocol : "https://",
      domain : "corpus.lingsync.org",
      port : "443",
      pouchname : "default",
      path : ""
  };
  var mcgill = {
      protocol : "https://",
      domain : "prosody.linguistics.mcgill.ca",
      port : "443",
      pouchname : "default",
      path : "/corpus"
  };
  
  /*
   * If its a couch app, it can only contact databases on its same origin, so
   * modify the domain to be that origin. the chrome extension can contact any
   * authorized server that is authorized in the chrome app's manifest
   */
  var connection = production;
  if (OPrime.isCouchApp()) {
    if (window.location.origin.indexOf("lingsync.org") >= 0) {
      connection = production;
      OPrime.authUrl = "https://auth.lingsync.org";
    } else if (window.location.origin.indexOf("authdev.fieldlinguist.com") >= 0) {
      connection = testing;
      OPrime.authUrl = "https://authdev.fieldlinguist.com:3183";
    } else if (window.location.origin.indexOf("prosody.linguistics.mcgill") >= 0) {
      connection = mcgill;
      OPrime.authUrl = "https://prosody.linguistics.mcgill.ca/auth";
    } else if (window.location.origin.indexOf("localhost") >= 0) {
      connection = localhost;
      OPrime.authUrl = "https://localhost:3183";
    }    
  }
  return connection;
};


OPrime.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";

OPrime.publicUserStaleDetails = function() {
  return JSON.stringify({
    token : "$2a$10$TpNxdbXtDQuFGBYW5BfnA.F7D0PUftrH1W9ERS7IdxkDdM.k7A5oy",
    encryptedUser : "confidential:VTJGc2RHVmtYMSsrMjk1UmdHbUJocU5sRHpsSUFGZkk2U3hCSWxEYkNrZCsvWHJyWTMyZUhwL3A0bmpKWU9sSnk2ZTFBRHB0RkQ2ZUtkVTBocEwxQnhTMHRNeW9JOWc0WUhpLzFzdFRNRFpHc1dEd1ZPdlMvTkdPK2h2akl3WVhGQ3JlYWtOTHc3T21QRHE2ZWo0SnQ1UjNqcGpYODlXRkI5alY1Yng2b0ZqYnRVWUhzZUlPRnIxYTdRSXJRdkNuSHlKWFV3ZTl2MmFnRktTOXdUc2pUbUw3SDEvd1lMMFhNQmJldzlPSTFnS0E0TXhzZ1dwa2xLcjNkZzE3endkMFN3RWlLQmowTDY4Vk1TMFpQNXgwZW5BdUdlM2tmcDZpNkxhYm82bjRsdTJmbEF3Y005Zmc3UVNqOUVXSGZiWGxNTFFWRXp1VlJzT2ZXa1J6b1Nvd3NDKzN0WWwrTmRZTUZ0WE9wTTRGTHpYSmM0bStPWkUwaGw5eHpDNVRvOC96R2F3MTR1MU9veEdydkpOQi9mSUNFVnhTb3diU3hqZFI0aU41V1h1UEhwSTlQTndERjdQYVM5QjYwM2N6UURPUWRibXcvM1p6ZXJEVHcvKzdrb01MNVRuUThxNGJYR09UQXFHNVlFVG84d2l2aUhqaE5XelZUYVhmc21KRlo4WXhCRmNlZjZCS0RESlkxZ0dWRGY0QlNMRjNqbkYrZDhFUTV3eHFCZTZ6Yk5XblkzSVF1SmNWMW8rcElVR1FNUlBVemp4My9aT3VxM2tjRzB0Q3VycEU1RWhSb1REQXVxZ0dlQTk3NThXUkZ4S3BiaEpNZmk3VCtKZ28wcXUyZHNwaDdTQzZ5bFNtY3MrcHI1UldZYVNXZldJS0gxanAzNlFDaDZrTE9ySmxHN1ZTUWF6NUU5NERCN3I4ZS8yUHZOamNtUVVoUG1OR3JCd0dlend6YTNvWitPT0R6OTJWNURWKzkwWWd4L0kvNWxOcmdaeVZBT1NVaDJUZkJiMVAwYzhxbDFzTDBiTVVVWlZJNERDVTVyeCtrTlhtTElTdW5OTmZIMWNMZkxIUVRjekU0Q1pIOW9SN0FWYTdtY01rSDN1SHRaMDVGbUFnSnhrMHFOYldGR2dKQW9jRHBxMFZlRUN0bjFKQjFrODMvS1laOWdKeUw2SjZsVzRYVjFUVzhPbi9rak1ONXlzdUdDNHRodDVCNitNWjdjb24zYVJ4b2FjRGU2dmhsZ0NwVE5jOHFqVmdkNDcvNk9TMUtPODBMSWZabytYMzVyZUJFb3FSK3RMRkxuVFpYMVlJU2h1OGJHd0JZSlpvUGI2TStIV3VpS0w4VmlCYVpOR0NhY0t4OEZISktmZGdRaDUxS2thOWdDbzdsNzdJTkh4TDB5Yit4alNvYXlyVi9oUmNZSHoxR0hSRGJpQm8rVmUxWjN3ZmxtTGczdmdONDFTdWEyYUtzMnZTVW9oenNyYWZ0QnZvYTRUckE3bUs0ZkNmWFM0d1JZMmRFMEtpUEgrSE1ZdXlOamZXYmpibFMyMlJ6ZFBuYlprMldnREpIeVAvc3U1SWpyeUFhMklwMXJSeVhZcXZEVGVqeHh2NVlPT25EK3VOcGVqT2JaVXhTVGNyQVNXSkFENXNzemdobnVTTjA1b0d5V2FtelRidVZ1YWhpcG4yRlE1OXVEUWE4Z0xVK3NFckpTdnJJNGxpWnlkUVBxb0V5WERHTUFNcy9hcTZJaGVaQWpKeVhmWUpsSHVteHhPMm0zazN6U0lCNjZLalRONVBJZE9IUit1MGVqeS85RE5Ic0I2d2pWcUhDNzBWaDZBc29VaUhxQktTQzcxdU40d1pXWW81MDlaUkhkSDhpU0JjWkFPcllXcHpvMFRacnF3WUxkZmx3WGdhYmNxUEdOeFhXTEQ2eGNEUTVxODdkdTE3WHdkRno0SEYrMnduRFhsWkF2VXVDQzd6ajFLOURZNG9oejdCeStpb1UwRUYxbEI3NUpIMFZyb2hjLzV0TGFxY1czY0hTVm9WQjNwZlM5Z2VNYmt5VkorcnVpeFYxYUYva3B1Tm1NU1BXOU9oRW9GOVkvV0VNVmJSMUdyY1BiVlU5akRGRW5vMUtNZkt3R3NCQTFxNENLUGkvcXA2ajNtT3BWSG5aUEV4blBQKzhlTXRGM1VZZCtHYlpad2IyUVh2WTRhMVVIeGRmMlN1aE5VM0hIdVQ2WWczK1Zoam1GR0R6OFNLVEQvcXVDSGIyVmxjR3VIYjl2b2RiOGpCdXVsb09QaTNCOFdsWGM0ZmNBb2JtT1VkbUppa1ZSUWVLVHYrTmpxVGVlUUNzWUJPSWFUMHY2Sjg2WkM1dmlSOGlnSlNzbXFOUFVXd1dHVjRvUzg0Z1lyQmliNTlBcjhzYUFFenpWRTZYOFVMNVNOOUErZCtWK3FRVFBEb1RmL1lWRStJTlpXTW55dGc4cGRlVDlibEx2Vk5OemV4TEVYVlNIdnVvRWN0eEhMd29lV1dLTDhLeUxNRE90bExmUWpzcGkvZ3hnc0NHbnlpbGZhWGUxYVVjNGp0QVdUSW82U0Q3S2NFKzBEeGpzM3JUdzhQdzV1VFNDNFlVVXZ1ZisyaDlrZzR3UnEzeGRrWDNwWjRjM251VlNpOVBMYlR5bS9yWjJHbHN2RERKenZBdE8xRGlldW5FTGdJKzEyTWdoTDZUUi81aFp3endLYXBWM2IzbFlpdVJhNkg4RnFveUxVYW1pdE44aG84SVpHNHMxcVg5a3hURFViTk03SEJQNzFaNUUrbTd5R0c0a0lXdmRuUnRwekJqSGpjb0JodlFCL0k4dW51VFNVclhyVGJuNzdSbEZWcDRFNFdoZmhUb1RVR2dLbEs3MTBLWXJMSmpybE5zdWxaUFAxckFXeXRlZlhTRVdMVFg3ejNrLzVGMkQyaWNxbVQ4UEIvTnNYL1ZoK1F1eTlxM0hOeFk1TngwN1VGSTZJTE1iU3h1c1doRytJSEJBUlhXUXA1ckd0U29jUnJxcmprbytoSEVXZGhMZzdxRVdPRGdWSzVmc2d5SVVCMTRsVFM0Z1IwRWZvTlpHVDhRZGhiYURObTNNdStyWkZ6R09FSHZnVWU0aXViYUxNTCtDaUNBVXRycHFvc29IYk4xK0ZadkhiQUozaE9SYU1uRUxZQlgxOEZ6N2hpQitDdmdHby9TWFZBT1UrWFlubm85ZUNzdEZqLzhwK1h5QU40b3dEdnQra0RGWlJVa3laQWF6WktiRjYwa2pyajBYY1pjMzM1QVZWVDFoYnFzNmVBR0xKeVdHbXhBbEJZbjV5QnZ1dkFRTkRES3dENlVwT2grdmpsRjRFVGRLSkVDcEZMK3kzWXVGaHNTOHpQYnhERlF4OEVkTE8wNEFVWDM2ZEppTXZ6TDJiK2hiQy9vS1lnSzRQOCsxU2tkNy9BME5YaStpdy8wMWtpMXZwMW5yL1h4RHlJaWtuMCtxTitWakZOeG9JdDkrRStYOGxTdUx6YXlLaEJyWHRqYVpXVy9mZ2h6V2lZbEVNYnI3VjE3Yll4ckRlUlRiZU83QmpvcHFQUmloYjF4VXpSMUluWGwwNktuWUdTOG5UVkNIaFRqTWQydVlXODRNL1FYeTluTE02UmJUa0QxQTY5YWdqMytDVVFTQzZTempQL2FScXdNMWxxNndIVUVpL1FEUllrU3kvSEdDV3dmdVhzTnYydDNQcXh4bjFHY3ovKzB6SUdsNnZwUnJLSU5iUURZMWtIYThJUExMcFhXSFJEMWVkQUxidjlxVXVqOXRybkI0dmF3NGROR0RqVzZmdndXT08vY0ZFNzlGNUdtd1NHb0cyQS9NeU5YSGRIdlZqbkpnZlJaNFRvc1hobFNhZ1ZIUVNYYUZacFB3b2NYM0VVSk5Lc2tkWE9QeUJET3RIUHJsUnAzTW9jZnVOZ3dNV0xBOXFhOTk5QXpKYmQzc1o1OU42WUZTai9TQzVHUkFvbE9FR0ovY3BtSFcyc0RpaHRvUWpUTFEyVG5XQmFhTncxZUE0dW0zQVVMUjZjUk44S2syNkxsaFY2cXJTZjMwc3JacGovalpGeU5ZTlYvNVV5a3V2WU1QV2tKY3NTeUx3WW51Qi81SkRGMy91NU1FQ1Y2UVpKNGlQazVGVm5NcjQwdmpIV2RoVlFUQWIvN0xmWUI0VncxcXBtckxGNTg4N3g0Zk0vRUdxanBHMjVpNXh0cmQ1WWFFSjFCZnFRdXk4bVY5NkdVWi8xTzlUSzBlZk5PdlQ2MEJyMUNjUnBBa0xEZ1NURFlJMUM0TGNWaU8zVlNDMTN2TWlhaU9mZmRjRklDYldwQ1p3Tk1hanNscVB0dzNadXNMdXF0WngzT29TNnB2T1ptdVpSeFFOUFFWSE9rVnVLQmlOYi9WY2xQSGZRaStQZjl2VEF3Qk14QjVoTmtKMzN4R3MyK2JvK0JDdWduclR3TTRQTjBxeWhZbXNXMDMxdDQ2ZHRjWlNDT1hvUExCUUtQUDBJWkU3U2NXeUUzTHBFa2xrOWZRWnFydkNQbmFxb2VkYjRQRFdoMUVJcklKMisxd1FUZmYwUkYvNkJ2d016U1ZWamx1bGY4eTU2K0k4dHRseVpoWjhPME96bGFUR1BqN0JCSk03MHVvVjRaVjlkN2E2bUhmelhKUkNzZFg3Z3A3cTJ1aFN5YmFMa2lkcXBhdXYrdE1HZ2hRdEpUS1ZQQzZvSDIvTTdoeFpvNnBsUnptL3I0YU90MGFFOUVPN1NTUy9SQ0FYMXpnLzFwa3BFQkdMbktpT0lNcTJscGRjdjh3PT0=",
    username : "public"
  });
};

OPrime.guessCorpusUrlBasedOnWindowOrigin = function(dbname) {
  var optionalCouchAppPath = "";
  if(OPrime.isCouchApp()){
    var corpusURL = window.location.origin;
    if (corpusURL.indexOf("lingsync.org") >= 0) {
      corpusURL = "https://corpus.lingsync.org";
    } else if (corpusURL.indexOf("authdev.fieldlinguist.com") >= 0) {
      corpusURL = "https://ifielddevs.iriscouch.com";
    } else if (corpusURL.indexOf("prosody.linguistics.mcgill") >= 0) {
      corpusURL = "https://prosody.linguistics.mcgill.ca/corpus";
    } else if (corpusURL.indexOf("localhost") >= 0) {
      // use the window origin
    }
    optionalCouchAppPath = corpusURL+"/"+dbname+"/_design/pages/";
  }
  return optionalCouchAppPath;
};
define("libs/webservicesconfig_devserver", function(){});

if (window.location.origin != "localhost") {
  if (window.location.protocol == "http:") {
    window.location.replace(window.location.href.replace("http", "https"));
  }
}

//Set the RequireJS configuration
require.config({
  paths : {
    /* Bootstrap user interface javascript files */
    "bootstrap" : "libs/bootstrap/js/bootstrap.min",

    "crypto" : "libs/Crypto_AES",

    /* jQuery and jQuery plugins */
    "jquery" : "libs/jquery",

    /* Handlebars html templating libraries and compiled templates */
    "compiledTemplates" : "libs/compiled_handlebars",
    "handlebars" : "libs/handlebars.runtime",

    /* Backbone Model View Controller framework and its plugins and dependencies */
    "underscore" : "libs/underscore",
    "backbonejs" : "libs/backbone",
    "jquery-couch" : "libs/backbone_couchdb/jquery.couch",
    "backbone" : "libs/backbone_couchdb/backbone-couchdb",

    "terminal" : "libs/terminal/terminal",

    "text" : "libs/text",

    "xml2json" : "libs/xml2json",

    "oprime" : "libs/OPrime",
    "webservicesconfig" : "libs/webservicesconfig_devserver"
  },
  shim : {
    
    "xml2json" : {
      deps : [ "jquery" ],
      exports : "X2JS"
    },
    
    "oprime" : {
      exports : "OPrime"
    },
    "webservicesconfig" : {
      deps : [ "oprime" ],
      exports : "OPrime"
    },
    
    "underscore" : {
      exports : "_"
    },

    "jquery" : {
      exports : "$"
    },
    
    "jquery-couch" : {
      deps : [ "jquery" ],
      exports : "$"
    },

    "bootstrap" : {
      deps : [ "jquery-couch" ],
      exports : "bootstrap"
    },
    
    "backbonejs" : {
      deps : [ "underscore", "bootstrap" ],
      exports : "Backbone"
    },
    "backbone" : {
      deps : [ "backbonejs", "jquery-couch", "compiledTemplates" ],
      exports : "Backbone"
    },

    "handlebars" : {
      deps : [ "backbonejs", "jquery" ],
      exports : "Handlebars"
    },
    "compiledTemplates" : {
      deps : [ "handlebars" ],
      exports : "Handlebars"
    },
    
    "crypto" : {
      exports : "CryptoJS"
    },
    
    "terminal" : {
      deps : [ "bootstrap", "jquery" ],
      exports : "Terminal"
    }

  }
});

//Initialization
require([ 
      "user/UserApp",  
      "backbone",
      "libs/webservicesconfig_devserver"
      ], function(
          App,
          forcingpouchtoloadearly
      ) {
  
  try{
    var pieces = window.location.pathname.replace(/^\//,"").split("/");
    var pouchName = pieces[0];
    //Handle McGill server which runs out of a virtual directory
    if(pouchName == "corpus"){
      pouchName = pieces[1];
    }
    Backbone.couch_connector.config.db_name = pouchName;
  }catch(e){
    OPrime.debug("Couldn't set the databse name off of the url.");
  }
  
  
  window.app = new App({filledWithDefaults: true});
});


//// Initialization
//require([
//    "user/UserApp",
//    "user/UserAppView",
//    "user/UserRouter",
//    "compiledTemplates",
//    "backbone",
//    "backbone_pouchdb",
//    "libs/webservicesconfig_devserver",
//    "libs/OPrime"
//], function(
//    UserApp,
//    UserAppView,
//    UserRouter,
//    compiledTemplates,
//    Backbone,
//    forcingpouchtoloadonbackboneearly
//) {
//  
//  /*
//   * Start the pub sub hub
//   */
//  window.hub = {};
//  OPrime.makePublisher(window.hub);
// 
//  /*
//   * Check for user's cookie and the dashboard so we can load it
//   */
//  var username = OPrime.getCookie("username");
//  if (username != null && username != "") {
//
//    window.app = new UserApp();
//    var auth = window.app.get("authentication");
//    var u = localStorage.getItem("encryptedUser");
//    auth.loadEncryptedUser(u, function(success, errors){
//      if(success == null){
//        alert("Bug: We couldnt log you in."+errors.join("<br/>") + " " + OPrime.contactUs);  
//        OPrime.setCookie("username","");
//        document.location.href='index.html';
//        return;
//      }else{
////        alert("We logged you in." + OPrime.contactUs);  
//        window.appView = new UserAppView({model: window.app}); 
//        window.appView.render();
//        app.router = new UserRouter();
//        Backbone.history.start();
//      }
//    });
//    
//  } else {
//    // new user, let them register or login as themselves or lingllama
//    document.location.href='index.html';
//  }
//  
//});

define("user_online_dashboard", function(){});
