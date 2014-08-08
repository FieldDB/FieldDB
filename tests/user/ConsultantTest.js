var Consultant = require("../../api/user/Consultant").Consultant;


describe("as an Consultant, I want to set up my Consultant info", function() {
  var mockcorpus;

  beforeEach(function() {
    mockcorpus = {
      confidential: {
        secretkey: 'keyfromcorpus'
      }
    };
  });
  describe("Construction", function(){

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
      expect(consultant.fields.anonymousCode.value).toEqual('');
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
    expect(consultant.dateOfBirth).toEqual(undefined);
    consultant.dateOfBirth = "January 1, 1900";
    expect(consultant.dateOfBirth).toEqual("xxxxxxx x, xxxx");
  });

  it("should set consultant's language", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential
    });
    expect(consultant.languages).toEqual(undefined);
    consultant.languages = "Cat";
    expect(consultant.languages).toEqual("Cat");
  });

  it("should set consultant's dialect", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential
    });
    expect(consultant.dialect).toEqual(undefined);
    consultant.dialect = "Cat";
    expect(consultant.dialect).toEqual("Cat");
  });

});


describe("as an Consultant, I want my privacy to be prtotected", function() {
  var mockcorpus;

  beforeEach(function() {
    mockcorpus = {
      confidential: {
        secretkey: 'keyfromcorpus'
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
    expect(consultant.fields.username.value).toEqual('');
  });

  it("should show anonymous code if user is anonymous and their anonymous code has been set", function() {
    var consultant = new Consultant({
      confidential: mockcorpus.confidential
    });
    consultant.username = "tilohash";
    consultant.anonymousCode = "TH";
    expect(consultant.username).toEqual("TH");

    consultant = new Consultant(Consultant.prototype.defaults);
    expect(consultant.fields.username.value).toEqual('');
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

});
