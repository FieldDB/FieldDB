# FieldDB JavaScript API

These are the common js files which you can use to build new FieldDB clients, and to help you test your clients to make sure they are contributing to high quality data using EMELD and DataOne best practices. This code comes from the backbone client, where most of the code base was prototyped. 


# Demos which you can break point

* [LexiconBrowser](https://lexicon.lingsync.org) [code](https://github.com/FieldDB/FieldDBLexicon/tree/master/src/app/components/lexicon) in progress
* [Psycholinguistics Dashboard](http://app.phophlo.ca) [code](https://github.com/ProjetDeRechercheSurLecriture/DyslexDisorthGame/tree/master/angular_client) in progress
* [Dative](http://dativebeta.lingsync.org) [code](https://github.com/jrwdunham/dative/tree/master/app/scripts/models) in progress


# Videos 

There are many videos showing the functionality of the models in the context of user interfaces. 

Search on Youtube
https://www.youtube.com/results?search_query=lingsync


# Usage

You can run this codebase in 3 (or more) ways:

## Bower

You can use the fielddb library in any framework or javascript codebase by running bower install.

```bash
$ bower install fielddb --save
```

## Angular

There are angular directives which were built to use provide UI bindings with this codebase in angular. You can use bower to install it. For usage examples see the readme in the [angular_client/modules/core/README.md](https://github.com/FieldDB/FieldDB/tree/master/angular_client/modules/core).

```bash
$ bower install fielddb-angular --save
```
## MontageJS

You can also use these files indiviually in MontageJS, run bower install and then require only the files you need using require().

```bash
$ bower install fielddb --save
```

```js
var FieldDBContextualizer = require("fielddb/api/locales/Contextualizer").Contextualizer;
...
```

## Node.js

Most of these models are built to be shared by FielDB webservices. details to come.

To use this library in node, use npm

```bash
$ npm install fielddb
```


# Base Models

Almost all the models in the system extend either FieldDBObject, or Collection.

FieldDBObjects know how to:

* accept a basic json model, 
* parse its internal models, 
* convert itself into json
* fetch itself from a server (using a declared `.url` or the currently open corpus in the app if one is present)
* save itself to a server and/or client side
* merge other objects into itself
* calculate if its equal-ish to another object
* assign a date created, date modified and app version to itself
* and more... 

You can see more concrete examples in the ["it should do x" FieldDBObject specifications](../tests/FieldDBObject-spec.js) 

Colections know how to:

* add, push, unshift models into themselves, 
* parse new additions into its internal item model, 
* convert itself into json
* save all members of itself to a server and/or client side
* merge other collections/arrays into itself
* calculate if its equal-ish to another object
* find matching items(s)
* fuzzy find matching items(s)
* and more... 

You can see more examples in the ["it should do x" Collection specifications](../tests/Collection-spec.js) 


# Related Issues 


There are quite a few issues in the issue tracker which talk about the data models in the FieldDB Javascript API, how they evolved, and what problems/pitfalls the current code tries to solve.

https://github.com/fielddb/fielddb/issues?utf8=✓&q=docs

[#20](https://github.com/FieldDB/FieldDB/issues/20) [#24](https://github.com/FieldDB/FieldDB/issues/24) [#45](https://github.com/FieldDB/FieldDB/issues/45) [#65](https://github.com/FieldDB/FieldDB/issues/65) [#69](https://github.com/FieldDB/FieldDB/issues/69) [#70](https://github.com/FieldDB/FieldDB/issues/70) [#96](https://github.com/FieldDB/FieldDB/issues/96) [#878](https://github.com/FieldDB/FieldDB/issues/878) [#879](https://github.com/FieldDB/FieldDB/issues/879) [#993](https://github.com/FieldDB/FieldDB/issues/993) [#1083](https://github.com/FieldDB/FieldDB/issues/1083) [#1139](https://github.com/FieldDB/FieldDB/issues/1139) [#1349](https://github.com/FieldDB/FieldDB/issues/1349) [#1398](https://github.com/FieldDB/FieldDB/issues/1398) [#1470](https://github.com/FieldDB/FieldDB/issues/1470) [#2043](https://github.com/FieldDB/FieldDB/issues/2043) [#2069](https://github.com/FieldDB/FieldDB/issues/2069) 


# Examples

You can take a look at the submodules to find concreate examples of how to use each data type etc.

## Activity

[activity/](api/activity/)

## App

[app/](api/app/)

## Audio / Video

[audio_video/](api/audio_video/)

## Authentication

[authentication/](api/authentication/)

## Bot

[bot/](api/bot/)

## Comment

[comment/](api/comment/)

## Confidentiality / Encryption

[confidentiality_encryption/](api/confidentiality_encryption/)

## Corpus

[corpus/](api/corpus/)

## DataList

[data_list/](api/data_list/)

## Datum / Fields / Sessions / Tags / Validation Status / Stimuli / Stimuli-Responses

[datum/](api/datum/)

## Export

[export/](api/export/)

## Glosser

[glosser/](api/glosser/)

## Hotkeys / Keyboard shortcuts

[hotkey/](api/hotkey/)

## Image

[image/](api/image/)

## Import

[import/](api/import/)

## Lexicon

[lexicon/](api/lexicon/)

## Locales / Contextualization

[locales/](api/locales/)

## Map Reduce

[map_reduce/](api/map_reduce/)

## Permission

[permission/](api/permission/)

## Search

[search/](api/search/)

## Unicode

[unicode/](api/unicode/)

## User

[user/](api/user/)
