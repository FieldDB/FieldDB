
/*
 * Can test DOM/UserInterface maniulation times 
 * http://msdn.microsoft.com/en-us/magazine//gg649850.aspx
 */
TestCase("VirtualTimeTest", sinon.testCase({
    "jquery test should animate quickly": function () {
        /*:DOC += */
        var element = jQuery(document.createElement("div"));
        element.animate({ height: "100px" }, 500);
 
        this.clock.tick(510);
 
        assertEquals("100px", element.css("height"));
    }
}));