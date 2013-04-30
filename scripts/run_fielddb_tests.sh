#! /bin/bash
. /home/jenkins/.nvm/nvm.sh
nvm use ten
phantomjs $WORKSPACE/tests/libs/jasmine-reporters/test/phantomjs-testrunner.js $WORKSPACE/tests/SpecRunner.html