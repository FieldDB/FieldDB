require(["require/HelloWorld"], function (HelloWorld) {
	
	describe("Require js test", function () {
		it("should return hello world!", function () {
			expect(HelloWorld()).toEqual("hello world!");
		});
	});
	
});
