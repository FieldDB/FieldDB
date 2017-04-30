var expect = require("chai").expect;
var getAllCorpora = require("./../../lib/corpora").getAllCorpora;
var specIsRunningTooLong = 15000;
var TOTAL_CORPORA_COUNT = 247;

if (process.env.OFFLINE) {
  TOTAL_CORPORA_COUNT = 2;
}

describe("corpora lib", function() {
  this.timeout(specIsRunningTooLong);

  it("should load", function() {
    expect(getAllCorpora).to.be.defined;
  });

  describe("normal requests", function() {
    it("should return a collection of corpora", function(done) {
      if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
        return this.skip();
      }

      getAllCorpora().then(function(corpora) {
        console.log('total corpora ', corpora);
        expect(corpora.length).to.not.equal(0);
        expect(corpora.length).to.equal(TOTAL_CORPORA_COUNT);
        corpora.map(function(connection) {
          // console.log(connection.gravatar);
          expect(connection.gravatar.length).to.equal(32);
          expect(connection.team.username).to.equal(connection.dbname.split("-")[0]);
          expect(connection.website).to.equal("/" + connection.owner + "/" + connection.dbname);

        });
        done();
      }).fail(done);
    });
  });
});
