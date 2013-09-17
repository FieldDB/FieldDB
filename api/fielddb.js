/*
/*
 * fieldb-auth
 * https://github.com/OpenSourceFieldlinguistics/FieldDB/issues/milestones?state=closed
 *
 * Copyright (c) 2013 cesine
 * Licensed under the Apache, 2.0 licenses.
 */

'use strict';

exports.test = function(string) {
  var relevantCharacters,
      filteredString,
      reversedString;

  if (typeof string !== 'string') {
    return false;
  }

  relevantCharacters = string.match(/[a-z0-9]/gi);

  if (!relevantCharacters) {
    return false;
  }

  filteredString = relevantCharacters.join('').toLowerCase();
  reversedString = filteredString.split('').reverse().join('');

  return filteredString.length > 0 && filteredString === reversedString;
};