define(["import/Import"], function(Import) {
  "use strict";

  function registerTests() {
    describe("Import", function() {

      describe("initialize", function() {
        it("should use default corpus", function() {
          var importer = new Import();
          expect(importer).toBeDefined();
          expect(importer.get("dbname")).toEqual("default");
        });

        it("should use window corpus if available", function() {
          window.app = {
            get: function(key) {
              return this[key];
            },
            corpus: {
              get: function(key) {
                return this[key];
              },
              dbname: "jenkins-firstcorpus",
              datumFields: {
                clone: function(){
                  return []
                }
              }
            }
          };

          var importer = new Import();
          expect(importer).toBeDefined();
          expect(importer.get("dbname")).toEqual("jenkins-firstcorpus");
        });
      });

      describe("As a user I want to import csv", function() {
        it("should detect drag and drop", function() {
          expect(Import).toBeDefined();
        });
      });

      describe("As a user I want to import Word/text examples on three lines", function() {
        it("should detect drag and drop", function() {
          expect(Import).toBeDefined();
        });
      });

      describe("As a user I want to import ELAN XML", function() {
        it("should detect drag and drop", function() {
          expect(Import).toBeDefined();
        });
      });

      describe("As a user I want to import Language Learning XML", function(done) {
        it("should detect xml", function() {
          var importer = new Import();
          var result = importer.importXMl('<xml>', importer, function() {

            expect(importer.rows).toDeepEqual([]);
            done();
          });
        });

      });

      describe("Template", function() {
        beforeEach(function() {
          var d = document.createElement("div");
          d.setAttribute("id", "status");
          document.body.appendChild(d);
          // d.appendChild(this.view.render().el);
        });

        it("has more than one column", function() {
          expect(Import).toBeDefined();
        });

        it("has the filename as the title", function() {
          expect(Import).toBeDefined();
        });
      });
    });

    // describe("Import routes", function() {
    // beforeEach(function() {
    // this.router = new ImportRouter;
    // this.routeSpy = sinon.spy();
    // try {
    // Backbone.history.start({silent:true, pushState:true});
    // } catch(e) {}
    // this.router.navigate("elsewhere");
    // });
    //
    // it("fires the index route with a blank hash", function() {
    // this.router.bind("route:index", this.routeSpy);
    // this.router.navigate("", true);
    // expect(this.routeSpy).toHaveBeenCalledOnce();
    // expect(this.routeSpy).toHaveBeenCalledWith();
    // });
    // });
  }

  return {
    describe: registerTests
  };
});
