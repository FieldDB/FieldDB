var Consultant = require("../../api/user/Consultant").Consultant;


describe("as an Consultant, I want to set up my Consultant info", function() {
  var mockcorpus;

  beforeEach(function() {
    mockcorpus = {
      confidential: {
        secretkey: "keyfromcorpus"
      }
    };
  });
  describe("Construction", function() {

    it("should not bleed defaults", function() {
      var consultant = new Consultant({
        confidential: mockcorpus.confidential,
        fields: Consultant.prototype.defaults.fields
      });
      consultant.anonymousCode = "AA";
      expect(consultant.anonymousCode).toEqual("AA");

      consultant = new Consultant({
        confidential: mockcorpus.confidential,
        fields: Consultant.prototype.defaults.fields
      });
      expect(consultant.fields.anonymousCode.value).toEqual("");
    });

  });

  it("should be of type Consultant", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential
    });
    expect(consultant.type).toEqual("Consultant");
  });

  it("should set an consultant code", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential
    });
    consultant.anonymousCode = "C.M.B.";
    expect(consultant.anonymousCode).toEqual("C.M.B.");
  });

  it("should set consultant's date of birth", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential
    });
    expect(consultant.fields).toBeDefined();
    expect(consultant.dateOfBirth).toBeDefined();
    consultant.dateOfBirth = "January 1, 1900";
    expect(consultant.dateOfBirth).toEqual("xxxxxxx x, xxxx");
  });

});

describe("langauges", function() {
  it("should set consultant's language using a string", function() {
    var consultant = new Consultant({});
    expect(consultant.languages).toEqual("");
    consultant.languages = "English, French, Urdu";
    expect(consultant.languages).toEqual("English, French, Urdu");

    expect(consultant.fields.languages.json.languages).toEqual([{
      iso: "english",
      name: "English",
      nativeName: "English"
    }, {
      iso: "french",
      name: "French",
      nativeName: "French"
    }, {
      iso: "urdu",
      name: "Urdu",
      nativeName: "Urdu"
    }]);
  });

  it("should set consultant's language using a full object", function() {
    var consultant = new Consultant({});
    expect(consultant.languages).toEqual("");
    consultant.languages = {
      "value": "English, French, Urdu",
      "json": {
        "languages": [{
          "language": {
            "ethnologueUrl": "",
            "wikipediaUrl": "",
            "iso": "en",
            "locale": "en",
            "dialect": "en-mtl",
            "englishName": "English",
            "nativeName": "English",
            "alternateNames": ""
          },
          "fluency": {
            "comprehensionFluency": "native",
            "speakingFluency": "native",
            "readingFluency": "native",
            "writingFluency": "native"
          },
          "dates": {
            "start": "birth",
            "end": "present",
            "proportionOfUse": "50%"
          }
        },{
          "language": {
            "ethnologueUrl": "",
            "wikipediaUrl": "",
            "iso": "fr",
            "locale": "fr",
            "dialect": "fr-mtl",
            "englishName": "French",
            "nativeName": "français",
            "alternateNames": ""
          },
          "fluency": {
            "comprehensionFluency": "immersion",
            "speakingFluency": "immersion",
            "readingFluency": "immersion, coursework",
            "writingFluency": "immersion, coursework"
          },
          "dates": {
            "start": 332035200000,
            "end": "present",
            "proportionOfUse": "40%"
          }
        },{
          "language": {
            "ethnologueUrl": "",
            "wikipediaUrl": "",
            "iso": "ur",
            "locale": "ur",
            "dialect": "en-lh",
            "englishName": "Urdu",
            "nativeName": "اردو",
            "alternateNames": "Hindi"
          },
          "fluency": {
            "comprehensionFluency": "immersion",
            "speakingFluency": "immersion",
            "readingFluency": "none",
            "writingFluency": "none"
          },
          "dates": {
            "start": "948326400000",
            "end": "1121817600000",
            "proportionOfUse": "02%"
          }
        }]
      }
    };
    expect(consultant.languages).toEqual("English, French, Urdu");

    expect(consultant.languageOne.language.iso).toEqual("en");
    expect(consultant.languageOne.fluency.comprehensionFluency).toEqual("native");

    expect(consultant.languageTwo.language.iso).toEqual("fr");
    expect(consultant.languageTwo.fluency.comprehensionFluency).toEqual("immersion");

    expect(consultant.languageThree.language.iso).toEqual("ur");
    expect(consultant.languageThree.fluency.comprehensionFluency).toEqual("immersion");

  });


  it("should set consultant's dialects", function() {
    var consultant = new Consultant({});
    expect(consultant.dialects).toEqual("");
    consultant.dialects = "en-ca, fr-qc, ur-lh";
    expect(consultant.dialects).toEqual("en-ca, fr-qc, ur-lh");
    expect(consultant.fields.languages.json.languages).toEqual([{
      iso: "en-ca",
      name: "en-ca",
      nativeName: "en-ca"
    }, {
      iso: "fr-qc",
      name: "fr-qc",
      nativeName: "fr-qc"
    }, {
      iso: "ur-lh",
      name: "ur-lh",
      nativeName: "ur-lh"
    }]);
  });

});


describe("as an Consultant, I want my privacy to be prtotected", function() {
  var mockcorpus;

  beforeEach(function() {
    mockcorpus = {
      confidential: {
        secretkey: "keyfromcorpus"
      }
    };
  });

  it("should encrypt the consultant's username", function() {
    var doc = JSON.parse(JSON.stringify(Consultant.prototype.defaults));
    doc.confidential = mockcorpus.confidential;
    var consultant = new Consultant(doc);
    // consultant.debugMode = true;
    expect(consultant.username).toEqual(undefined);
    consultant.anonymousCode = "TH";
    if (consultant.encryptByCorpus) {
      expect(consultant.confidential.secretkey).toEqual("keyfromcorpus");
    } else {
      expect(consultant.confidential.secretkey).toEqual("TH");
    }
    expect(consultant.username).toEqual(undefined);

    consultant.username = "tilohash";
    expect(consultant.username).toEqual("TH");
    expect(consultant.fields.username.value).toEqual("TH");
    expect(consultant.fields.username._encryptedValue).toContain("confidential:");
  });

  it("should display username if in decryptedMode", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential,
      fields: Consultant.prototype.defaults.fields
    });
    consultant.username = "tilohash";
    consultant.decryptedMode = true;
    expect(consultant.username).toEqual("tilohash");
    expect(consultant.fields.username.value).toEqual("tilohash");
  });


  it("should not let the user have the username in the anonymousCode", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential
    });
    consultant.username = "tilohash";
    expect(consultant.username).toEqual("xxxxxxxx");
    consultant.anonymousCode = "tilohashelse";
    expect(consultant.anonymousCode).toEqual("");
    expect(consultant.bugMessage).toEqual("Cannot set the anonymous code to contain any part of the user\'s actual username, this would potentially breach their confidentiality.");
  });

  it("should show username mask if user is anonymous and their anonymous code hasnt been set", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential
    });
    consultant.username = "tilohash";
    expect(consultant.username).toEqual("xxxxxxxx");

    consultant = new Consultant(Consultant.prototype.defaults);
    expect(consultant.fields.username.value).toEqual("");
  });

  it("should show anonymous code if user is anonymous and their anonymous code has been set", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential
    });
    consultant.username = "tilohash";
    consultant.anonymousCode = "TH";
    expect(consultant.username).toEqual("TH");

    consultant = new Consultant(Consultant.prototype.defaults);
    expect(consultant.fields.username.value).toEqual("");
  });

  it("should mask the consultant's username", function() {
    var doc = JSON.parse(JSON.stringify(Consultant.prototype.defaults));
    doc.confidential = mockcorpus.confidential;
    var consultant = new Consultant(doc);
    consultant.anonymousCode = "TH";
    consultant.confidentiality = "generalize";
    consultant.username = "tilohash";
    expect(consultant.fields.confidentiality.value).toEqual("generalize");

    expect(consultant.username).toEqual("A native speaker");
    expect(consultant.fields.username.mask).toEqual("A native speaker");
    expect(consultant.fields.username.value).toEqual("A native speaker");
  });

  it("should parse an encrypted consultant", function() {
    var doc = {
      _id: "migm740610ea",
      _rev: "1-66d7dcf2ec5756f96705e4c190efbf7b",
      fields: [{
        _id: "firstname",
        labelExperimenters: "Prénom",
        shouldBeEncrypted: true,
        encrypted: true,
        showToUserTypes: "all",
        defaultfield: true,
        help: "The first name of the speaker/participant (optional, encrypted if speaker is anonymous)",
        helpLinguists: "The first name of the speaker/participant (optional, should be encrypted if speaker should remain anonymous)",
        version: "v2.0.1",
        encryptedValue: "confidential:VTJGc2RHVmtYMTljQjh4ZXFtRTBPYm5aUm9WbXdvbTVuSHZFWmMzaU1xQT0=",
        mask: "xxxxxx",
        value: "xxxxxx",
        dateCreated: 0,
        dateModified: 0
      }, {
        _id: "lastname",
        labelExperimenters: "Last name",
        shouldBeEncrypted: true,
        encrypted: true,
        showToUserTypes: "all",
        defaultfield: true,
        help: "The first name of the speaker/participant (optional, encrypted if speaker is anonymous)",
        helpLinguists: "The first name of the speaker/participant (optional, should be encrypted if speaker should remain anonymous)",
        version: "v2.0.1",
        encryptedValue: "confidential:VTJGc2RHVmtYMTljQjh4ZXFtRTBPYm5aUm9WbXdvbTVuSHZFWmMzaU1xQT0=",
        mask: "xxxxxx-xxx",
        value: "xxxxxx-xxx",
        dateCreated: 0,
        dateModified: 0
      }],
      dateCreated: 1407516364440,
      version: "v2.0.1",
      dateModified: 1407516364460
    };
    doc.confidential = mockcorpus.confidential;
    var consultant = new Consultant(doc);

    expect(consultant.firstname).toEqual("xxxxxx");
    expect(consultant.fields.firstname.mask).toEqual("xxxxxx");
    expect(consultant.fields.firstname.value).toEqual("xxxxxx");
    expect(consultant.fields.firstname.encryptedValue).toEqual("confidential:VTJGc2RHVmtYMTljQjh4ZXFtRTBPYm5aUm9WbXdvbTVuSHZFWmMzaU1xQT0=");
    expect(consultant.name).toEqual("xxxxxx xxxxxx-xxx");
  });

});
