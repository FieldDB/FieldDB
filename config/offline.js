var CORS = require("fielddb/api/CORS").CORS;
var Q = require("q");

function requestSampleData(config) {
  if (!config.offline) {
    return;
  }
  console.log('mocking requests with sample data', config.offline, process.env.OFFLINE)

  CORS.makeCORSRequest = function(options) {
    var deferred = Q.defer();
    Q.nextTick(function() {

      if (options.url.includes('/search/lingllama-communitycorpus')) {
        return deferred.resolve(require('../test/fixtures/search/lingllama-communitycorpus.json'));
      }
      if (options.url.includes('/search/community-georgian')) {
        return deferred.resolve(require('../test/fixtures/search/community-georgian.json'));
      }

      if (options.url.includes('_design/activities/_view/one-year-weekly')) {
        return deferred.resolve(require('../test/fixtures/activity/heatmap/sample.json'));
      }
      if (options.url.includes('lingllama-communitycorpus/team')) {
        return deferred.resolve(require('../test/fixtures/team/lingllama.json'));
      }
      if (options.url.includes('community-georgian/team')) {
        return deferred.resolve(require('../test/fixtures/team/community.json'));
      }

      if (options.url.includes('lingllama-communitycorpus/corpus')) {
        return deferred.resolve(require('../test/fixtures/corpus/lingllama-communitycorpus.json'));
      }
      if (options.url.includes('lingllama-cherokee/corpus')) {
        return deferred.resolve(require('../test/fixtures/corpus/lingllama-cherokee.json'));
      }
      if (options.url.includes('lingllama-firstcorpus/corpus')) {
        return deferred.resolve(require('../test/fixtures/corpus/lingllama-firstcorpus.json'));
      }
      if (options.url.includes('community-georgian/corpus')) {
        return deferred.resolve(require('../test/fixtures/corpus/community-georgian.json'));
      }
      if (options.url.includes('community-migmaq/corpus')) {
        return deferred.resolve(require('../test/fixtures/corpus/community-migmaq.json'));
      }
      if (options.url.includes('community-firstcorpus/corpus')) {
        return deferred.resolve(require('../test/fixtures/corpus/community-firstcorpus.json'));
      }
      if (options.url.includes('teammatetiger-firstcorpus/corpus')) {
        return deferred.resolve(require('../test/fixtures/corpus/teammatetiger-firstcorpus.json'));
      }

      if (options.url.includes('/lingllama')) {
        return deferred.resolve(require('../test/fixtures/user/lingllama.json'));
      }
      if (options.url.includes('/community')) {
        return deferred.resolve(require('../test/fixtures/user/community.json'));
      }
      if (options.url.includes('/teammatetiger')) {
        return deferred.resolve(require('../test/fixtures/user/teammatetiger.json'));
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

exports.requestSampleData = requestSampleData;
