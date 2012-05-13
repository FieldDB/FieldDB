
TestCase("UserTest", {
    "test setting user's first name": function() {
    
        var u = new User();
        u.set("firstname", "Bill"); 
        assertEquals("Bill" , u.get("firstname"));
    }
, "test if subtitle is first and last name for humans": function() {
    
    var u = new User();
    u.set("firstname", "Bill"); 
    u.set("lastname", "Sapir");
    assertEquals("Bill Sapir", u.subtitle());
}

});


