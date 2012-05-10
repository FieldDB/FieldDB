
TestCase("UserTest", {
    "test setting user's first name": function() {
    
        var u = new User();
        u.set("firstname", "Bill"); 
        assertEquals("Bill" , u.get("firstname"));
    }
, "test if subtitle is first and last name for humans": function() {
    
    var u = new User();
    u.set("firstname", "Ed"); 
    u.set("lastname", "Sapir");
    assertEquals("Ed Sapir", u.subtitle());
}

,"test for login": function() {
    
    var u = new User();
    u.set("username", "esapir"); 
    u.set("password", "wharf");
    assertTrue( u.login("esapir" , "wharf" ));
}
});