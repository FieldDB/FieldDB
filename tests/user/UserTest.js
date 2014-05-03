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
      username: 'bill',
      gravatar: '67890954367898765',
      version: 'v2.0.1',
      firstname: '',
      lastname: '',
      email: '',
      affiliation: '',
      researchInterests: '',
      description: ''
    });
  });

  it("should have a name constisting of firstname lastname ", function() {
    var u = new User();
    expect(u.name).toBeDefined();
    
    u.firstname = "Bill";
    u.lastname = "Smith";
    expect(u.name).toEqual("Bill Smith");

    expect(u.toJSON()).toEqual({
      version: 'v2.0.1',
      firstname: 'Bill',
      lastname: 'Smith',
      username: '',
      email: '',
      gravatar: '',
      researchInterests: '',
      affiliation: '',
      description: ''
    });
  });

  it("should have an empty or valid email address", function() {
    var u = new User({
      email: "invalidemail@hi"
    });
    expect(u.email).toEqual("");
  });

});
