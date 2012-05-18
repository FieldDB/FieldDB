require([
    "permission/Permission"
], function(Permission) {
    describe("Permission Tests", function() {
        it("should be read permission", function() {
            var permission = new Permission();
            expect(permission.get("type")).toEqual("r");
        });
        
        it("should be read permission", function() {
            var permission = new Permission();
            expect(permission.get("type")).toEqual("w");
        });
    });
});