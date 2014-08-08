var User = require("../../api/user/UserMask").UserMask;


describe("User ", function() {

  it("should should have username, firstname, lastname, gravatar, email and other options", function() {
    var json = {
      username: "bill",
      gravatar: "67890954367898765",
      anodfunction: function(input) {
        console.log(input);
      }
    };
    var u = new User(json);
    expect(u.username).toEqual(json.username);
    expect(u.firstname).toBeDefined();
    expect(u.lastname).toBeDefined();
    expect(u.gravatar).toEqual(json.gravatar);
    expect(u.email).toBeDefined();
    expect(u.name).toBeDefined();
    expect(u.affiliation).toBeDefined();
    expect(u.researchInterest).toBeDefined();
    expect(u.description).toBeDefined();

    expect(u.toJSON()).toEqual({
      type: 'UserMask',
      username: 'bill',
      gravatar: '67890954367898765',
      firstname: '',
      lastname: '',
      email: '',
      affiliation: '',
      researchInterest: '',
      description: '',
      version: u.version
    });
  });

  it("should have a name constisting of firstname lastname ", function() {
    var u = new User();
    expect(u.name).toBeDefined();

    u.firstname = "Bill";
    u.lastname = "Smith";
    expect(u.name).toEqual("Bill Smith");

    expect(u.toJSON("complete")).toEqual({
      type: 'UserMask',
      username: '',
      dateCreated: u.dateCreated,
      firstname: 'Bill',
      lastname: 'Smith',
      version: u.version,
      dbname: '',
      dateModified: 0
    });
  });

  it("should have an empty or valid email address", function() {
    var u = new User({
      email: "invalidemail@hi"
    });
    expect(u.email).toEqual("");
  });

});
