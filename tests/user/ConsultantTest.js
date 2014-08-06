var Consultant = require("../../api/user/Consultant").Consultant;

describe("as an Consultant, I want to set up my Consultant info", function() {

  xit("should set an consultant code", function() {
    var consultant = new Consultant();
    consultant.anonymousCode = "C.M.B.";
    expect(consultant.anonymousCode).toEqual("C.M.B.");
  });

  xit("should set consultant's date of birth", function() {
    var consultant = new Consultant();
    expect(consultant.dateOfBirth).toEqual(undefined);
    consultant.dateOfBirth = "January 1, 1900";
    expect(consultant.dateOfBirth).toEqual("January 1, 1900");
  });

  xit("should set consultant's language", function() {
    var consultant = new Consultant();
    consultant.languages = "Cat";
    expect(consultant.languages).toEqual("Cat");
  });

  xit("should set consultant's dialect", function() {
    var consultant = new Consultant();
    consultant.dialect = "Cat";
    expect(consultant.dialect).toEqual("Cat");
  });

  xit("should not bleed defaults", function() {
    var consultant = new Consultant();
    consultant.username = "tilohash";
    expect(consultant.username).toEqual("tilohash");

    var consultant = new Consultant(Consultant.defaults);
    expect(consultant.speakerFields.username.value).toEqual('');
  });

  xit("should not let the user have the username in the anonymousCode", function() {
    var consultant = new Consultant();
    consultant.username = "tilohash";
    expect(consultant.username).toEqual("tilohash");
    consultant.anonymousCode = "tilohashelse";
    expect(consultant.anonymousCode).toEqual("");
    expect(consultant.bugMessage).toEqual("Cannot set the anonymous code to contain any part of the user\'s actual username, this would potentially breach their confidentiality.");
  });

  it("should encrypt the consultant's username", function() {
    // console.log(Consultant.defaults);
    var consultant = new Consultant(JSON.parse(JSON.stringify(Consultant.defaults)));
    consultant.debugMode = true;
    expect(consultant.username).toEqual(undefined);
    consultant.anonymousCode = "TH";
    expect(consultant.confidential.secretkey).toEqual("TH");
    expect(consultant.username).toEqual(undefined);

    consultant.username = "tilohash";
    expect(consultant.username).toEqual("TH");
    expect(consultant.speakerFields.username.value).toEqual("TH");
    expect(consultant.speakerFields.username._encryptedValue).toContain("confidential:");
  });

  it("should mask the consultant's username", function() {
    // console.log(Consultant.defaults);
    var consultant = new Consultant(JSON.parse(JSON.stringify(Consultant.defaults)));
    consultant.anonymousCode = "TH";
    consultant.confidentiality = "generalize";
    consultant.username = "tilohash";
    expect(consultant.speakerFields.confidentiality.value).toEqual("generalize");

    expect(consultant.username).toEqual("A native speaker");
    expect(consultant.speakerFields.username.mask).toEqual("A native speaker");
    expect(consultant.speakerFields.username.value).toEqual("A native speaker");
  });

});
