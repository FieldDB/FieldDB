'use strict';


// Declare app level module which depends on filters, and services
angular.module('ActivityFeed', ['ActivityFeed.filters', 'ActivityFeed.services', 'ActivityFeed.directives','CouchDBServices', 'OPrime.filters']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: TeamActivityFeedController});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: UserActivityFeedController});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);

/*
 * 
 * http://ilanguage.ca/about/about-ilanguage-lab/fieldlinguistics-web-widgets/
 * 
 * http://www.html5rocks.com/en/tutorials/security/content-security-policy/
 * 
 * Sample widget minified: http://widgets.twimg.com/j/2/widget.js
 * 
 * <![CDATA[
    new Fieldlinguist.Widget({
      version: 2,
      type: 'search',
      search: '#sapir',
      interval: 30000,
      title: 'Team Activity Feed',
      subject: '',
      width: 250,
      height: 300,
      theme: {
        shell: {
          background: '#Fc8',
          color: '#ffffff'
        },
        tweets: {
          background: '#333333',
          color: '#ffffff',
          links: '#Fc8'
        }
      },
      features: {
        scrollbar: false,
        loop: true,
        live: true,
        behavior: 'default'
      }
    }).render().start();
// ]]></script>
*/
