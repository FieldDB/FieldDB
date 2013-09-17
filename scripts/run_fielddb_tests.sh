#! /bin/bash

# Run the api unit tests too
grunt nodeunit


# Turn on a simple server to be used to proxy so that the tests are not run from a file url  
./scripts/web-server.js &


# Use a simple server to serve the test files, and turn on access to remote urls and no web security  
phantomjs --proxy=127.0.0.1:8071 --local-to-remote-url-access=yes --web-security=no tests/libs/jasmine-reporters/test/phantomjs-testrunner.js http://127.0.0.1:8071/tests/SpecRunner.html 


# TODO none of these lines will let the phantomjs to hit the corpus webservice, despite being correct. Maybe the phantomjs-testrunner.js is getting in the way?
# phantomjs --proxy=127.0.0.1:8071 --local-to-remote-url-access=yes --web-security=no tests/libs/jasmine-reporters/test/phantomjs-testrunner.js tests/SpecRunner.html 
# phantomjs --proxy=127.0.0.1:8071 --web-security=no tests/libs/jasmine-reporters/test/phantomjs-testrunner.js tests/SpecRunner.html 
# phantomjs --proxy=127.0.0.1:8071 --local-to-remote-url-access=yes  tests/libs/jasmine-reporters/test/phantomjs-testrunner.js tests/SpecRunner.html 
# phantomjs --proxy=127.0.0.1:8071 --local-to-remote-url-access=yes --web-security=no tests/libs/jasmine-reporters/test/phantomjs-testrunner.js http://127.0.0.1:8071/tests/SpecRunner.html 
# phantomjs --proxy=127.0.0.1:8071 --web-security=no tests/libs/jasmine-reporters/test/phantomjs-testrunner.js http://127.0.0.1:8071/tests/SpecRunner.html 
# phantomjs --proxy=127.0.0.1:8071 --local-to-remote-url-access=yes  tests/libs/jasmine-reporters/test/phantomjs-testrunner.js http://127.0.0.1:8071/tests/SpecRunner.html 
