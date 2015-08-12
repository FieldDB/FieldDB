"use strict";
var Export;
var LanguageDatum;
try {
  /* globals FieldDB */
  if (FieldDB) {
    Export = FieldDB.Export;
    LanguageDatum = FieldDB.LanguageDatum;
  }
} catch (e) {}

Export = Export || require("./../../api/export/Export").Export;
LanguageDatum = LanguageDatum || require("./../../api/datum/LanguageDatum").LanguageDatum;

var sample_1_22_datum = require("./../../sample_data/datum_v1.22.1.json");

describe("Export: as a user I want to export to various formats", function() {
  it("should be able to export into Latex format", function() {
    var datum = new LanguageDatum(sample_1_22_datum[0]);

    var expectedLatexOutput = "\n" +
      "\\begin{exe} \n" +
      "  \\ex [Jaunpa much'a-sqa-mi ka-ni]{Jaunpa much'asqami kani.\n" +
      "  \\gll \\\\\n" +
      "  Juan.gen kiss.pass.? be.1SG.\\\\\n" +
      "  \\trans I was kissed by John.}\n" +
      "\\label{}\n" +
      "  \\begin{description}\n" +
      "    \\item[\\sc{dateElicited}] 5/21/2010\n" +
      "    \\item[\\sc{checkedWithConsultant}] Lucia\n" +
      "    \\item[\\sc{dialect}] Cusco Quechua\n" +
      "  \\end{description}\n" +
      "\\end{exe}\n" +
      "\n";

    var latexGB4E = datum.laTeXiT();
    expect(latexGB4E).toEqual(expectedLatexOutput);
  });

  it("should be able to export into CSV format", function() {
    var datum = new LanguageDatum(sample_1_22_datum[0]);
    var datumCSVheader = datum.exportAsCSV(null, null, "header");
    var datumCSV = datum.exportAsCSV();
    expect(datumCSVheader).toEqual("\"judgement\",\"utterance\",\"morphemes\",\"gloss\",\"translation\",\"dateElicited\",\"notes\",\"checkedWithConsultant\",\"dialect\",\"goal\",\"consultants\",\"language\",\"user\",\"dateSEntered\",\"comments\",\"audioVideo\",\"images\"\n");
    expect(datumCSV).toEqual("\"Jaunpa much'a-sqa-mi ka-ni\",\"Jaunpa much'asqami kani.\",\"\",\"Juan.gen kiss.pass.? be.1SG.\",\"I was kissed by John.\",\"Probably Prior to Saturday, September 15, 2012\",\"\",\"Lucia\",\"\",\"Goal from file import sample_filemaker.csv text/csv - 12641 bytes, last modified: Saturday, September 15, 2012\",\"Unknown\",\"\",\"\",\"\",\"\",\"\",\"\"\n");

    datumCSV = datum.exportAsCSV(null, ["utterance", "comments"]);
    expect(datumCSV).toEqual("\"Jaunpa much'asqami kani.\",\"\"\n");
  });

  it("should be able to export into plain text format", function() {
    var datum = new LanguageDatum(sample_1_22_datum[0]);
    var handoutText = datum.exportAsPlainText();
    expect(handoutText).toEqual("Jaunpa much'a-sqa-mi ka-ni\nJaunpa much'asqami kani.\n\nJuan.gen kiss.pass.? be.1SG.\nI was kissed by John.\n5/21/2010\n\nLucia\nCusco Quechua");
  });

});
