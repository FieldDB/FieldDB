require(["HelloWorld"], function (HelloWorld) {
	
	describe("HelloWorldTest", function () {
		it("should return hello world!", function () {
			expect(HelloWorld()).toEqual("hello world!");
		});
	});
	
});