function(head, req) {
  start({
    'headers': {
      'Content-Type': 'text/csv'
    }
  });

  /*  TODO: Use AJAX to retrieve field names*/
  var datum_fields = {'rows':[{'key':{'original':'comments','typed':'comments_t'},'value':26},{'key':{'original':'consultants','typed':'consultants_t'},'value':72},{'key':{'original':'dateElicited','typed':'dateElicited_t'},'value':144},{'key':{'original':'gloss','typed':'gloss_t'},'value':72},{'key':{'original':'goal','typed':'goal_t'},'value':72},{'key':{'original':'morphemes','typed':'morphemes_t'},'value':72},{'key':{'original':'tags','typed':'tags_t'},'value':55},{'key':{'original':'translation','typed':'translation_t'},'value':71},{'key':{'original':'utterance','typed':'utterance_t'},'value':72},{'key':{'original':'validationStatus','typed':'validationStatus_t'},'value':72}]};
  var datumFieldsAsLuceneSchema = [];
  var datumFields = [];

  /*  Rearrange the retrieved data fields into an array, and then send the
  joined array as column headers.*/
  for (var i in datum_fields.rows) {
    datumFieldsAsLuceneSchema.push(datum_fields.rows[i].key.typed);
    datumFields.push(datum_fields.rows[i].key.original);
  }

  send('_id,' + datumFieldsAsLuceneSchema.join(',') + '\\n');

  /*  Now, process each row returned from the original map/reduce in order
  to create data rows for the CSV file.*/
  while (row = getRow()) {

    var rowAsCsv = row.value;
    for (var field = 0; field < datumFields.length; field++) {
      rowAsCsv += ',';
      if (row.key[datumFields[field]]) {
        rowAsCsv += '\"' + row.key[datumFields[field]] + '\"';
      } else {
        rowAsCsv += '';
      }
    }
    send(rowAsCsv + '\\n');
  }
}
