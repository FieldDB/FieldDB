var CORS = require("fielddb/api/CORSNode").CORS;
var fixtures = require("fixturefiles");
var nock = require("nock");
var Q = require("q");

function nockWithSampleData(config) {
  if (!process.env.OFFLINE) {
    return;
  }
  nock.disableNetConnect();
  nock.enableNetConnect("localhost:3182");

  nock(config.lexicon.url)
    .post("/search/lingllama-communitycorpus", {
      "query": /.*/
    }).reply(200, fixtures.search["lingllama-communitycorpus"]);

  nock(config.lexicon.url)
    .post("/search/lingllama-communitycorpus", {
      "query": "morphemes:nay"
    }).reply(200, fixtures.search["lingllama-communitycorpus"]);

  nock(config.lexicon.url)
    .post("/search/lingllama-communitycorpus", {
      "query": "translation:fixing"
    }).reply(200, {
    "took": 2,
    "timed_out": false,
    "_shards": {
      "total": 5,
      "successful": 5,
      "failed": 0
    },
    "hits": {
      "total": 1,
      "max_score": 1,
      "hits": [fixtures.search["lingllama-communitycorpus"].hits.hits[0]]
    }
  });

  nock(config.corpus.url)
    .get(/^.*_design\/activities\/_view\/one-year-weekly$/)
    .query(true)
    .reply(200, fixtures.activity.heatmap.sample);

  nock(config.corpus.url)
    .get("/lingllama-communitycorpus/team")
    .query(true)
    .reply(200, fixtures.team.lingllama);

  nock(config.corpus.url)
    .get("/community-georgian/team")
    .query(true)
    .reply(200, fixtures.team.community);

  nock(config.corpus.url)
    .get("/lingllama-communitycorpus/corpus")
    .query(true)
    .reply(200, fixtures.corpus["lingllama-communitycorpus"]);

  nock(config.corpus.url)
    .get("/lingllama-cherokee/corpus")
    .query(true)
    .reply(200, fixtures.corpus["lingllama-cherokee"]);

  nock(config.corpus.url)
    .get("/lingllama-firstcorpus/corpus")
    .query(true)
    .reply(200, fixtures.corpus["lingllama-firstcorpus"]);

  nock(config.corpus.url)
    .get("/community-georgian/corpus")
    .query(true)
    .reply(200, fixtures.corpus["community-georgian"]);

  nock(config.corpus.url)
    .get("/community-migmaq/corpus")
    .query(true)
    .reply(200, fixtures.corpus["community-migmaq"]);

  nock(config.corpus.url)
    .get("/community-firstcorpus/corpus")
    .query(true)
    .reply(200, fixtures.corpus["community-firstcorpus"]);

  nock(config.corpus.url)
    .get("/lingllama")
    .query(true)
    .reply(200, fixtures.user.lingllama);

  nock(config.corpus.url)
    .get("/community")
    .query(true)
    .reply(200, fixtures.user.community);

  nock(config.corpus.url)
    .get(/.*$/)
    .reply(404, {
      message: 'Not found',
      status: 404
    });

  nock(config.lexicon.url)
    .get(/.*$/)
    .reply(404, {
      message: 'Not found',
      status: 404
    });

  /**
  nock is not working for these
  */
  CORS.makeCORSRequest = function(options) {
    var deferred = Q.defer();
    Q.nextTick(function() {
      if (options.url.includes('_design/activities/_view/one-year-weekly')) {
        return deferred.resolve(fixtures.activity.heatmap.sample);
      }
      if (options.url.includes('lingllama-communitycorpus/team')) {
        return deferred.resolve(fixtures.team.lingllama);
      }
      if (options.url.includes('community-georgian/team')) {
        return deferred.resolve(fixtures.team.community);
      }
      if (options.url.includes('lingllama-communitycorpus/corpus')) {
        return deferred.resolve(fixtures.corpus['lingllama-communitycorpus']);
      }
      if (options.url.includes('lingllama-cherokee/corpus')) {
        return deferred.resolve(fixtures.corpus['lingllama-cherokee']);
      }
      if (options.url.includes('lingllama-firstcorpus/corpus')) {
        return deferred.resolve(fixtures.corpus['lingllama-firstcorpus']);
      }
      if (options.url.includes('community-georgian/corpus')) {
        return deferred.resolve(fixtures.corpus['community-georgian']);
      }
      if (options.url.includes('community-migmaq/corpus')) {
        return deferred.resolve(fixtures.corpus['community-migmaq']);
      }
      if (options.url.includes('community-firstcorpus/corpus')) {
        return deferred.resolve(fixtures.corpus['community-firstcorpus']);
      }
      if (options.url.includes('/lingllama')) {
        return deferred.resolve(fixtures.user.lingllama);
      }
      if (options.url.includes('/community')) {
        return deferred.resolve(fixtures.user.community);
      }

      console.log('Not found Offline: ', options.url)
      return deferred.reject({
        message: 'Not found',
        status: 404
      });
    });
    return deferred.promise;
  }
}

exports.nockWithSampleData = nockWithSampleData;
