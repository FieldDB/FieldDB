/*
 * This is a cleaning example.
 *
 * It shows a function which goes through the data, and show the datum where there
 * is probably animacy missing. (in this case, the team's Glossing
 * Conventions state that all Plurals in the nominal domain should be marked for animacy)
 */
function(doc) {
  var convertDatumIntoSimpleObject = function(datum) {
    var obj = {},
      fieldKeyName = "label";

    for (var i = 0; i < datum.datumFields.length; i++) {
      if (datum.datumFields[i].id && datum.datumFields[i].id.length > 0) {
        fieldKeyName = "id"; /* update to version 2.35+ */
      } else {
        fieldKeyName = "label";
      }
      if (datum.datumFields[i].mask) {
        obj[datum.datumFields[i][fieldKeyName]] = datum.datumFields[i].mask;
      }
    }
    if (datum.session.sessionFields) {
      for (var j = 0; j < datum.session.sessionFields.length; j++) {
        if (datum.session.sessionFields[j].id && datum.session.sessionFields[j].id.length > 0) {
          fieldKeyName = "id"; /* update to version 2.35+ */
        } else {
          fieldKeyName = "label";
        }
        if (datum.session.sessionFields[j].mask) {
          obj[datum.session.sessionFields[j][fieldKeyName]] = datum.session.sessionFields[j].mask;
        }
      }
    }
    return obj;
  };

  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    /* If its a datum (datum have datumFields and session) */
    if (doc.datumFields && doc.session) {
      var datum = convertDatumIntoSimpleObject(doc);

      /*
       * if the datum's gloss has PL (if the index of "PL" is greater than
       * negative 1) AND datum's gloss doesn't have a number (if you search it and
       * there is no character position where the digit in the range of zero to
       * nine is negative one, ie not there)
       */
      if (datum.gloss.indexOf("PL") > -1 && datum.gloss.search("[0-9]") === -1) {
        /*
         * Then, show me the datum on the left side in red, and the datum's gloss
         * on the right side in green, that way I can click on it if i want to
         * clean it and edit the data
         */
        emit(datum, datum.gloss);
      }

      /*
       * Here is another way we can see data that are probably missing animacy:
       */

      /*
       * If the datum's gloss has "PL" in it AND the datum's gloss doesn't have
       * "IN.PL" AND it doesn't have "AN.PL"
       */
      if (datum.gloss.indexOf("PL") > -1 && datum.gloss.indexOf("IN.PL") === -1 && datum.gloss.indexOf("AN.PL") === -1) {
        /*
         * show it to me, I probably want to edit it.
         */
        emit(datum, datum.gloss);
      } else {
        // emit("This datum conforms to our glossing conventions!")
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
