 define(["comment/Comment"], function(Comment) {
   "use strict";

   function registerTests() {
     describe("Comment: as a team we want to leave comments to eachother, on everthing.", function() {
       it("should allow users to take note of important things and " + "communicate between each other", function() {
         expect(Comment).toBeDefined();
       });

       it("should show a timestamp and a username by default", function() {
         expect(Comment).toBeDefined();
       });

       it("should be able to be edited", function() {
         expect(Comment).toBeDefined();
       });

       it("should be able to be removed", function() {
         expect(Comment).toBeDefined();
       });

       it("should appear on datum, sessions, corpora, and dataLists", function() {
         expect(Comment).toBeDefined();
       });
     });
   }

   return {
     describe: registerTests
   };
 });
