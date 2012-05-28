require([
    "permission/Permission"
], function(Permission) {
    describe("Permission Tests", function() {
        it("should have a read permission by default", function() {
            var permission = new Permission();
            expect(permission.get("type")).toEqual("r");
        });
        
        it("should have a write permission", function() {
            var permission = new Permission();
            permission.set("type","w");
            expect(permission.get("type")).toEqual("w");
        });
    });
});