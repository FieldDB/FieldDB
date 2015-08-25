# Spreadsheet 

An app which was originally a student project, built in a few months using Angular before it came out of beta. Since then this has become the most popular inteface for the app because it is very easy to understand and only offeres a few features which students in a field methods class need. Over time we have updated it to newer versions of angular and a newer architecture using Yeoman but the app remains a student project and is *not following software engineering nor angular best practices* so we dont reccomend basing future apps on the behaviour of this app. 

![screen shot 2015-01-16 at 08 56 53 pm](https://cloud.githubusercontent.com/assets/196199/6282997/7a9048fc-b910-11e4-90f6-709bfa068f1f.png)


## Getting Started

To maintain this app you should first go to the root of the repo and run `$ grunt travis` this will download and compile all dependancies for this app, and run the tests and build the minified version. With out this step you wil only be testing updates to the spreadsheet app, not updates to the entire app. 


```bash
$ cd $FIELDDB_HOME/FieldDB/angular_client/modules/spreadsheet
$ cp apps/scripts/private_services_sample.js apps/scripts/private_services.js
$ npm install
$ grunt serve

```
The final `$ grunt serve` will open up your default browser with this app running so you can begin developing the app. We usually use Chrome as our default browser, and use CMD+Shift+J to open the Chrome developer tools to do break pointing in the app. 

## Customizing the server

In the private_services.js file, replace all instances of "example.org" with the server name that you want to contact on your domain.


## Contributing

_Some default caveats of a [Yeoman](http://yeoman.io/) project: if you edit files in the "dist" subdirectory you will be sadly dissapointed, as they are generated via Grunt. The source code in the "app" subdirectory._

* [Signup for a GitHub account](https://github.com/signup/free) (GitHub is free for OpenSource)
* Click on the "Fork" button to create your own copy.
* Leave us a note in our [issue tracker](https://github.com/OpenSourceFieldlinguistics/FieldDB/issues) to tell us a bit about the bug/feature you want to work on.
* You can [follow the 4 GitHub Help Tutorials](http://help.github.com/) to install and use Git on your computer.
* You can watch the videos on [YouTube dev playlist](https://www.youtube.com/playlist?list=PLUrH6CNxFDrO3zLHtHAMW-8u_v7TSvE-H) and/or in the [Developer's Blog](https://wwwdev.lingsync.org/dev.html) to find out how the codebase works, and to find where is the code that you want to edit. You might also like the [user tutorial screencasts](https://www.youtube.com/playlist?list=PLUrH6CNxFDrMtraL8hTLbLsQwdw1117FT) to see how the app is supposed to behave. Feel free to ask us questions in our [issue tracker](https://github.com/OpenSourceFieldlinguistics/FieldDB/issues), we're friendly and welcome Open Source newbies.
* Edit the code on your computer, commit it referencing the issue #xx you created ($ git commit -m "fixes #xxxx i changed blah blah...") and push to your origin ($ git push origin master).
* Run the tests `$ npm install` and  `$ bower install` and `$ grunt` it should say something like `Done, without errors.` And show how long each step `jshint` `test` `karma:unit` `dist` and `cssmin` took to run. If any of these parts errors, ask us for help in the [issue tracker](https://github.com/OpenSourceFieldlinguistics/FieldDB/issues).
![screen shot 2015-02-20 at 12 02 57 pm](https://cloud.githubusercontent.com/assets/196199/6281705/8294acc2-b8f8-11e4-829e-81f29314a980.png)
* Click on the "Pull Request" button, and leave us a note about what you changed. We will look at your changes and help you bring them into the project!
* Feel the glow of contributing to OpenSource :)


In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using the above command lines.



## Release History

* December 2014 work began on [Dative](https://github.com/jrwdunham/dative) which will hopefully replace this app as the default app
* December 2013 became the default app for field methods groups
* May 2013 launched at the ETI workshop wine and cheese.


## Related apps

If you are interested in the Spreadsheet app, you might be interested in some other  client apps which also use FieldDB.

* The [Prototype](https://chrome.google.com/webstore/detail/lingsync-prototype/eeipnabdeimobhlkfaiohienhibfcfpa)
* The [Psycholinguistics Dashboard](https://github.com/ProjetDeRechercheSurLecriture/DyslexDisorthGame)
* The [Learn X app](https://github.com/opensourcefieldlinguistics/AndroidLanguageLearningClientForFielddb)
* The Android [Elicitation Session Recorder](https://github.com/OpenSourceFieldlinguistics/AndroidFieldDBElicitationRecorder)
* The Android [Speech Recognition Trainer App](https://github.com/batumi/AndroidSpeechRecognitionTrainer)
* The [My Dictionary](https://github.com/OpenSourceFieldlinguistics/DictionaryChromeExtension) Chrome app
* The [Lexicon Browser](https://github.com/OpenSourceFieldlinguistics/FieldDBLexicon)
* The [Word Cloud Visualizer](https://github.com/OpenSourceFieldlinguistics/FieldDBWordCloudChromeApp)

## License
Copyright (c) 2013-2014 FieldDB Contributors
Licensed under the Apache 2.0 license.
