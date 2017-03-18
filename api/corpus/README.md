# Corpus

Corpora are complex objects which represent the database, its metadata, who can access it, how the data should look in different apps (ie as a field work corpus, as a language learning lesson, as a gamified experiment, as a story book etc).

Corpora are the core construct of the system, they are an extention of a document store with additional fields. Corpora contain other sorts of documents, including Sesssions, DataLists, Datum and more. 

Corpora are also useful for teams to catch up on what has happened in their corpus since they last opened it. They can see what other user have worked on, and do follow ups. They can also learn about new features by seeing other users have done something they havent done before. 


## Demos which you can breakpoint

You can see [LingLlama's corpus](https://corpusdev.example.org/public-firstcorpus/_design/pages/corpus.html) in action by opening the online version of the prototype and clicking on the Customize >> Corpus Settings menu.

<img alt="backbone_corpus1" src="https://cloud.githubusercontent.com/assets/196199/24076214/7dec18be-0c01-11e7-9153-75ef5072eeb7.png"  height="300" > <img alt="backbone_corpus2" src="https://cloud.githubusercontent.com/assets/196199/24076215/7decbddc-0c01-11e7-8237-d9205993c65b.png"  height="300" >


You can also break point view of the corpus details in the [Spreadsheet app](http://app.example.org), you can login or regiser a user, or login as user "lingllama" password "phoneme" and then going to the [corpus settings](http://app.example.org/#/corpussettings). NOTE: If you login as lingllama you will be in non-admin viewing where you wont be able to see the full settings.


<img alt="angular_corpus1" src="https://cloud.githubusercontent.com/assets/196199/24076213/7dec19c2-0c01-11e7-8702-811fe3f22749.png"  height="300" > <img alt="angular_corpus2" src="https://cloud.githubusercontent.com/assets/196199/24076212/7dec0ea0-0c01-11e7-9093-9bf097528528.png"  height="300" >

## Videos

Elise talks briefly about the corpus settings feeds at 7:10 in this video

https://youtu.be/iQ9hWsh1y4Y?t=7m10s

This video shows how to customize the corpus settings in the spreadsheet app 

https://youtu.be/XMl1QmFNRAk.

## Usage

You can use Corpora via the `fielddb` bower package.

```bash
$ bower install fielddb --save
```
In which case all examples below would be prefixed with FieldDB
eg `FieldDB.Corpus` or `FieldDB.Corpora`.


You can use Corpora via browserify and/or node.js

```bash
$ npm install fielddb --save
```

```javascript
var Corpus = require("fielddb/api/corpus/Corpus").Corpus;
var Corpora = require("fielddb/api/corpus/Corpora").Corpora;

```

## Examples

Create an Corpus:
 
The app will create the user's first corpus for them as part of registration, subsequent corpora are created by calling `corpus.newCorpus()` which will clone the settings of the current corpus since most users have similar data structures and data collection procedures for their corpora this cloning helps reduce the number of times the repeat a configuration setup.

If there is a global app open and a user logged in, the app is able to figure out who did the corpus, and will add the team info for you.

```javascript
var corpus = new FieldDB.Corpus({
  title: "à l'infini"
});

// Result:
{
  "fieldDBtype": "Corpus",
  "title": "à l'infini",
  "titleAsUrl": "a_l_infini",
  "dateCreated": 1489873910582,
  "version": "v4.4.22",
  "api": "private_corpora",
  "team": {
    "fieldDBtype": "Team",
    "_id": "team",
    "gravatar": "54b53868cb4d555b804125f1a3969e87",
    "username": "lingllama",
    "version": "v4.4.22"
  }
}

```

Save an Corpus:

```javascript
corpus.save();

```

Open an Corpus:

```javascript
var corpus = new FieldDB.Corpus({
  connection: FieldDB.Connection.defaultConnection(),
  dbname: "jenkins-firstcorpus"
});

corpus
.fetch()
.then(function(){
  console.log("I have metadata", corpus.toJSON());
});
```

Add a user to a corpus:

```
corpus.permissions.fetch().then(function(){
  corpus.permissions.addUser({
    username: 'alexia',
    roles: ['commenter', 'reader', 'searcher']
  });
  return corpus.permissions.save();
});
```

<img alt="add or modify a team member" src="https://cdn.rawgit.com/FieldDB/FieldDB/master/api/corpus/permissions-add.svg" />


Enforce permissions on a resource in a corpus:


<img alt="enforce permissions" src="https://cdn.rawgit.com/FieldDB/FieldDB/master/api/corpus/permissions-enforce.svg" />


More examples are shown in the ["it should do x" Corpus specifications](../../tests/corpus/Corpus-spec.js).

## Tests

You can find more sample ways to use Corpora, and what Corpora are supposed to know how to do in the ["it should do x" Corpus specifications](../../tests/corpus/Corpus-spec.js).

To run the Corpus test suite: 

```bash
$ jasmine-node tests/corpus
```

## Sample serialized model(s)

LingLlama's sample field methods corpus:

```javascript
{
  "_id": "89bc4d7dcc2b1fc9a7bb0f4f4743e705",
  "_rev": "35-72bce1d5a374e455bdf41e08b1edc278",
  "dbname": "lingllama-communitycorpus",
  "connection": {
    "fieldDBtype": "Connection",
    "protocol": "https://",
    "domain": "corpusdev.example.org",
    "port": "443",
    "dbname": "lingllama-communitycorpus",
    "path": "",
    "authUrls": [
      "https://auth.example.org",
      "https://authdev.example.org"
    ],
    "userFriendlyServerName": "example Beta",
    "corpusid": "89bc4d7dcc2b1fc9a7bb0f4f4743e705",
    "corpusUrls": [
      "https://corpus.example.org/lingllama-communitycorpus"
    ],
    "version": "v4.4.22",
    "title": "lingllama-communitycorpus",
    "titleAsUrl": "lingllama-communitycorpus",
    "serverLabel": "beta",
    "brandLowerCase": "example_beta",
    "websiteUrls": [
      "http://example.org"
    ],
    "clientUrls": [],
    "lexiconUrls": [],
    "searchUrls": [],
    "audioUrls": [],
    "activityUrls": [],
    "pouchname": "lingllama-communitycorpus"
  },
  "title": "CommunityCorpus",
  "titleAsUrl": "communitycorpus",
  "description": "This is a corpus which is editable by anyone in the example community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \"graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\" ref: http://nemingha.hubpages.com/hub/History-of-Graffiti",
  "consultants": [],
  "datumStates": [{
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "selected",
    "state": "Checked",
    "consultant": {
      "gravatar": "user/user_gravatar.png"
    }
  }, {
    "color": "warning",
    "showInSearchResults": "checked",
    "selected": "",
    "state": "To be checked",
    "consultant": {
      "gravatar": "user/user_gravatar.png"
    }
  }, {
    "color": "important",
    "showInSearchResults": "",
    "selected": "",
    "state": "Deleted",
    "consultant": {
      "gravatar": "user/user_gravatar.png"
    }
  }, {
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "",
    "state": "CheckedWithSeberina"
  }, {
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "",
    "state": "CheckedWithRicardo"
  }, {
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "",
    "state": "CheckedWithMagda"
  }, {
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "",
    "state": "CheckedWithLucia"
  }, {
    "color": "warning",
    "showInSearchResults": "checked",
    "selected": "",
    "label": "",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Put your team's data entry conventions here (if any)...",
    "state": "ToBeCheckedWithSeberina"
  }],
  "datumFields": [{
    "label": "judgement",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Grammaticality/acceptability judgement (*,#,?, etc). Leaving it blank can mean grammatical/acceptable, or you can choose a new symbol for this meaning.",
    "size": "3",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "utterance",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Unparsed utterance in the language, in orthography or transcription. Line 1 in your LaTeXed examples for handouts. Sample entry: amigas",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "morphemes",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "gloss",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Metalanguage glosses of each individual morpheme (above). Used by the system to help gloss, in combination with morphemes (above). It is Line 2 in your LaTeXed examples. We recommend Leipzig conventions (. for fusional morphemes, - for morpheme boundaries etc)  Sample entry: friend-fem-pl",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "syntacticCategory",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "This optional field is used by the machine to help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of syntactic category tagging you wish. It could be very theoretical like Distributed Morphology (Sample entry: √-GEN-NUM), or very a-theroretical like the Penn Tree Bank Tag Set. (Sample entry: NNS) http://www.ims.uni-stuttgart.de/projekte/CorpusWorkbench/CQP-HTMLDemo/PennTreebankTS.html",
    "showToUserTypes": "machine",
    "userchooseable": "disabled"
  }, {
    "label": "translation",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Free translation into whichever language your team is comfortable with (e.g. English, Spanish, etc). You can also add additional custom fields for one or more additional translation languages and choose which of those you want to export with the data each time. Line 3 in your LaTeXed examples. Sample entry: (female) friends",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "tags",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Tags for constructions or other info that you might want to use to categorize your data.",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "validationStatus",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "For example: To be checked with a language consultant, Checked with Sebrina, Deleted etc...",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "dateElicited",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "This field came from file import ",
    "userchooseable": ""
  }, {
    "label": "notesFromOldDB",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "This field came from file import ",
    "userchooseable": ""
  }, {
    "label": "dialect",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "This field came from file import ",
    "userchooseable": ""
  }, {
    "label": "syntacticTreeLatex",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This optional field is used by the machine to make LaTeX trees and help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of LaTeX Tree package (we use QTree by default) Sample entry: Tree [.S NP VP ]",
    "showToUserTypes": "machine",
    "userchooseable": "disabled"
  }, {
    "label": "enteredByUser",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "The user who originally entered the datum",
    "showToUserTypes": "all",
    "readonly": true,
    "userchooseable": "disabled"
  }, {
    "label": "modifiedByUser",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "An array of users who modified the datum",
    "showToUserTypes": "all",
    "readonly": true,
    "userchooseable": "disabled"
  }, {
    "label": "utterances",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import File(s) uploaded and utterances were extracted.<br/> Downloaded Praat TextGrid which contained a count of roughly 13 syllables and auto detected utterances for _MCMediaFile_p129 The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "tier",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import File(s) uploaded and utterances were extracted.<br/> Downloaded Praat TextGrid which contained a count of roughly 13 syllables and auto detected utterances for _MCMediaFile_p129 The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "speakers",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import File(s) uploaded and utterances were extracted.<br/> Downloaded Praat TextGrid which contained a count of roughly 13 syllables and auto detected utterances for _MCMediaFile_p129 The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "startTime",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import File(s) uploaded and utterances were extracted.<br/> Downloaded Praat TextGrid which contained a count of roughly 13 syllables and auto detected utterances for _MCMediaFile_p129 The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "endTime",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import File(s) uploaded and utterances were extracted.<br/> Downloaded Praat TextGrid which contained a count of roughly 13 syllables and auto detected utterances for _MCMediaFile_p129 The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "modality",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import File(s) uploaded and utterances were extracted.<br/> Downloaded Praat TextGrid which contained a count of roughly 13 syllables and auto detected utterances for _MCMediaFile_p129 The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "audioFileName",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import File(s) uploaded and utterances were extracted.<br/> Downloaded Praat TextGrid which contained a count of roughly 13 syllables and auto detected utterances for _MCMediaFile_p129 The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.",
    "value": "",
    "mask": "",
    "encrypted": ""
  }],
  "conversationFields": [{
    "label": "speakers",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Use this field to keep track of who your speaker is. You can use names, initials, or whatever your consultants prefer.",
    "userchooseable": "disabled"
  }, {
    "label": "modality",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Use this field to indicate if this is a voice or gesture tier, or a tier for another modality.",
    "userchooseable": "disabled"
  }],
  "sessionFields": [{
    "label": "goal",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This describes the goals of the session.",
    "userchooseable": "disabled"
  }, {
    "label": "consultants",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown",
    "userchooseable": "disabled"
  }, {
    "label": "dialect",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "You can use this field to be as precise as you would like about the dialect of this session.",
    "userchooseable": "disabled"
  }, {
    "label": "language",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This is the langauge (or language family) if you would like to use it.",
    "userchooseable": "disabled"
  }, {
    "label": "dateElicited",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This is the date in which the session took place.",
    "userchooseable": "disabled"
  }, {
    "label": "user",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown",
    "userchooseable": "disabled"
  }, {
    "label": "dateSEntered",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This is the date in which the session was entered.",
    "userchooseable": "disabled"
  }, {
    "label": "source",
    "shouldBeEncrypted": "",
    "userMasks": [],
    "help": "This is a comma seperated field of all the speakers who were present for this elicitation session. This field also contains a (hidden) array of consultant masks with more details about the source if they are not anonymous or are actual users of the system. ",
    "userchooseable": "disabled",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "participants",
    "shouldBeEncrypted": "",
    "userMasks": [],
    "help": "This is a comma seperated field of all the people who were present for this elicitation session. This field also contains a (hidden) array of user masks with more details about the people present, if they are not anonymous or are actual users of the system. ",
    "userchooseable": "disabled",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "DateSessionEntered",
    "shouldBeEncrypted": "",
    "userchooseable": "disabled",
    "help": "The date when the elicitation session data was actually entered in the computer (could be different from the dateElicited, especailly if you usually elicit data with an audio recorder and/or a note book).",
    "value": "",
    "mask": "",
    "encrypted": ""
  }],
  "searchFields": [],
  "confidential": {
    "secretkey": "d7a66c33-387b-a7f4-3e99-fc96dbff6585"
  },
  "publicSelf": {
    "title": "CommunityCorpus",
    "titleAsUrl": "communitycorpus",
    "description": "This is a corpus which is editable by anyone in the example community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \"graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\" ref: http://nemingha.hubpages.com/hub/History-of-Graffiti",
    "id": "corpus",
    "datumStates": [],
    "datumFields": [{
      "label": "judgement",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "Use this field to establish your team's gramaticality/acceptablity judgements (*,#,? etc)",
      "size": "3",
      "userchooseable": "disabled"
    }, {
      "label": "utterance",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "Use this as Line 1 in your examples for handouts (ie, either Orthography, or phonemic/phonetic representation)",
      "userchooseable": "disabled"
    }, {
      "label": "morphemes",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "This line is used to determine the morpheme segmentation to generate glosses, it also optionally can show up in your LaTeXed examples if you choose to show morpheme segmentation in addtion ot line 1, gloss and translation.",
      "userchooseable": "disabled"
    }, {
      "label": "gloss",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "This line appears in the gloss line of your LaTeXed examples, we reccomend Leipzig conventions (. for fusional morphemes, - for morpehem boundaries etc) The system uses this line to partially help you in glossing. ",
      "userchooseable": "disabled"
    }, {
      "label": "translation",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "Use this as your primary translation. It does not need to be English, simply a language your team is comfortable with. If your consultant often gives you multiple languages for translation you can also add addtional translations in the customized fields. For example, your Quechua informants use Spanish for translations, then you can make all Translations in Spanish, and add an additional field for English if you want to generate a handout containing the datum. ",
      "userchooseable": "disabled"
    }],
    "sessionFields": [{
      "label": "dialect",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "You can use this field to be as precise as you would like about the dialect of this session.",
      "userchooseable": "disabled"
    }, {
      "label": "language",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "This is the langauge (or language family) if you would like to use it.",
      "userchooseable": "disabled"
    }, {
      "label": "dateElicited",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "This is the date in which the session took place.",
      "userchooseable": "disabled"
    }, {
      "label": "user",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "Put your team's data entry conventions here (if any)...",
      "userchooseable": "disabled"
    }, {
      "label": "dateSEntered",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "This is the date in which the session was entered.",
      "userchooseable": "disabled"
    }],
    "comments": [],
    "_id": "corpus",
    "_rev": "29-a89b5f8eaa2974fae032e8d5f0135854",
    "corpusid": "89bc4d7dcc2b1fc9a7bb0f4f4743e705",
    "timestamp": 1415742716687,
    "collection": "corpuses",
    "terms": {
      "humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
    },
    "license": {
      "title": "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
      "humanReadable": "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
      "link": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    "copyright": "Default: Add names of the copyright holders of the corpus.",
    "termsOfUse": {
      "humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
    },
    "dbname": "lingllama-communitycorpus",
    "connection": {
      "fieldDBtype": "Connection",
      "protocol": "https://",
      "domain": "corpusdev.example.org",
      "port": "443",
      "dbname": "lingllama-communitycorpus",
      "path": "",
      "corpusid": "38b751d2a58a13f04a201ac9f9987454",
      "corpusUrls": [
        "https://corpusdev.example.org/lingllama-communitycorpus"
      ],
      "version": "v2.51.15",
      "pouchname": "lingllama-communitycorpus",
      "title": "lingllama-communitycorpus",
      "titleAsUrl": "lingllama-communitycorpus"
    }
  },
  "publicCorpus": "Public",
  "comments": [{
    "text": "EMELD recommends that  if you are going to make your corpus public, you should put a terms of use. We found a couple of examples for you (here is one in Ling Llamas' community corpus). ",
    "username": "public",
    "timestamp": 1379259372130,
    "gravatar": "968b8e7fb72b5ffe2915256c28a9414c",
    "timestampModified": 1379259372130
  }],
  "dataLists": [{
    "title": "yelling search result",
    "description": "This is the result of searching for : yelling in Sample Quechua Corpus on \"2012-11-03T22:59:21.819Z\"",
    "datumIds": [
      "C0265C7E-8BF4-4638-BD81-387A7550969D",
      "BBF11938-7858-438C-BC92-3770A2CD40BF",
      "A7F832BF-A9A5-429A-B12C-21AB9BAD5D84",
      "B387792B-CD5B-4BB6-96DF-0A4EEAEC4C48",
      "AEC6CAC6-AEEA-46D6-A86D-C8CBD2C8DA21",
      "C76DEEBE-A096-4146-A9FD-2BB7E7A949EC",
      "A82B05B0-81BE-43E0-83C7-BF70BC0D706B",
      "DC5692B0-C9C5-4C9B-BE8B-B20138F1E2B7",
      "4D9E5965-784D-46DE-AB75-2143954700E6",
      "C3B54802-CA9E-47BE-AEBB-62487A19954A",
      "5EF1ADD5-E357-45C2-AEA1-0C2474965C71",
      "0E7196B1-5CF2-4762-B57A-3497A42E768D",
      "7A68F8B7-2EBA-4B84-9806-5E408FF796E2",
      "FAB29A41-A3A1-4F57-9C5A-B38F511974AE",
      "6DE1CE15-2141-40FB-87A1-EA839CB1942E",
      "E4638BE6-D631-44EF-96B5-8AC3AE9CA6C5",
      "DED06FCB-DE06-4049-864B-ADF8EE84BAC9",
      "A5FCABC6-9658-419C-9D42-574DD00B3521",
      "DA86CADB-E9F3-476D-A1F6-33DDB68BF315",
      "72C6E919-FA08-4D5F-831F-74E6067E4F55"
    ],
    "pouchname": "lingllama-firstcorpus",
    "comments": [],
    "dateCreated": "\"2012-11-03T22:59:29.166Z\"",
    "dateModified": "\"2013-01-25T19:40:43.988Z\"",
    "_id": "2472B1B5-F3D1-4F5D-8414-BB6E8D8F8080",
    "_rev": "6-3229f7d5d56ea0291b6bae09c7b586d1"
  }, {
    "title": "morphemes:naya OR gloss:des search result",
    "description": "This is the result of searching for : morphemes:naya OR gloss:des in Sample Quechua Corpus on \"2012-11-03T22:57:29.197Z\"",
    "datumIds": [
      "BBF11938-7858-438C-BC92-3770A2CD40BF",
      "B387792B-CD5B-4BB6-96DF-0A4EEAEC4C48",
      "928656F1-26D4-4895-8981-AB8E252B3A15",
      "C0265C7E-8BF4-4638-BD81-387A7550969D",
      "A7F832BF-A9A5-429A-B12C-21AB9BAD5D84",
      "40E4FCD9-9F7C-4AAA-99EE-FB1596D84B10",
      "47D687E8-7A4E-4C7A-8931-D83DFA8F18AE",
      "AEC6CAC6-AEEA-46D6-A86D-C8CBD2C8DA21",
      "3B3011C1-924A-4375-BD52-770CE41ED9A6",
      "D3929E89-7CDE-4E62-8684-982D7D63CEDC",
      "3414178F-4F64-4F78-9503-371A1A90FAE0",
      "C76DEEBE-A096-4146-A9FD-2BB7E7A949EC",
      "A82B05B0-81BE-43E0-83C7-BF70BC0D706B",
      "DC5692B0-C9C5-4C9B-BE8B-B20138F1E2B7",
      "E9DBD3AF-335C-48B7-91B6-49D7836098EB",
      "37777980-9897-414D-BD85-F4D3333F33F9",
      "537D32A4-EC38-4012-95B0-771592D45591",
      "AF7912FD-82BC-4244-A4C3-F4774DD5EE77",
      "6B9F4CDA-0CD2-4488-877C-9A5E1CF45AA0",
      "FBB74DA7-B2F5-4BA8-B334-1AC4A23364EA",
      "0C1674C6-3CAE-49FC-A0A7-DF11B2BDD2D0",
      "17AC5A6D-A2C9-4F27-B5D0-EB881066BFE1",
      "F6E12B9B-4B35-4EB4-A792-7DF7E6496F95",
      "565DA10C-A360-4C74-B4DF-5FFF8AAEE612",
      "A9FBFD02-9633-4274-AD43-417E35CD688F",
      "1F7F26A2-3EF0-4C19-AD3D-62491B464160",
      "477F119C-F25C-4389-A81A-F6E3010092F1",
      "5EF1ADD5-E357-45C2-AEA1-0C2474965C71",
      "C09692CE-ACB9-4364-83AC-D4365954E05B",
      "CF8D5397-FFFA-4591-AAF0-D26EAE724021",
      "0E7196B1-5CF2-4762-B57A-3497A42E768D",
      "F0DED028-5C6D-4AE4-90A2-6B0E30F8AD0D",
      "89EC9049-B57B-4460-8BF5-46DF3BB434EB",
      "7A68F8B7-2EBA-4B84-9806-5E408FF796E2",
      "D6B578C9-B7E5-4D4D-95A4-7AF074F609EE",
      "FAB29A41-A3A1-4F57-9C5A-B38F511974AE",
      "6DE1CE15-2141-40FB-87A1-EA839CB1942E",
      "E4638BE6-D631-44EF-96B5-8AC3AE9CA6C5",
      "DED06FCB-DE06-4049-864B-ADF8EE84BAC9",
      "DA86CADB-E9F3-476D-A1F6-33DDB68BF315",
      "C5A155BA-AE62-43DE-8B23-FD59F47A6C54",
      "4932288A-16AF-4F90-AF0D-E5CBB024AA4A",
      "7154FCD8-B832-4DE7-A1EF-91BFDAE427F8",
      "8EB624F3-11E1-4274-B95F-36EAA8B96557",
      "41A89A92-3EC0-4364-9D01-B81FCC0D3DE5",
      "CF2C5B10-05DF-4A41-80DF-3055E5382B34",
      "F32AF64B-8014-4181-92B7-F7CCEDBC8398",
      "A101EE49-7E6F-4743-80DE-D7F5DCC74B3B",
      "90ECE65A-40C9-444A-86CF-C5742BB1428A",
      "8B0ADC07-568B-4700-B351-E7A4AC5F8437",
      "72C6E919-FA08-4D5F-831F-74E6067E4F55",
      "CB1A54A0-24D8-46F3-8801-C9B0085DB91D",
      "1C6C6746-687A-4E6B-9F87-6A1B79D9CC17",
      "2D41432C-DA28-47CA-B6CA-DD95B2DF3E25",
      "782CB518-4BF2-467F-A87E-6855B6510214",
      "8D72B09B-9B7F-410C-9F4E-6373BDA0877F",
      "4D3E30B2-83C3-47A3-A866-A9C0A46725CB",
      "E7C340D7-52FC-49CE-8553-EE648AEB4369",
      "BABF1AE9-4099-46A8-B520-F4FAFC7AFE94"
    ],
    "pouchname": "lingllama-firstcorpus",
    "comments": [],
    "dateCreated": "\"2012-11-03T22:57:35.184Z\"",
    "dateModified": "\"2012-11-03T22:58:29.500Z\"",
    "_rev": "2-a5186952948dce406fa4791d0adc88a4",
    "_id": "16953D35-7875-402E-B163-1FCE6F5A431D"
  }],
  "team": {
    "gravatar": "54b53868cb4d555b804125f1a3969e87",
    "username": "lingllama",
    "authUrl": "https://authdev.example.org",
    "id": "lingllama",
    "_id": "team",
    "_rev": "405-da4cb23adc7be1f56b4518c0ba99a3ba",
    "firstname": "",
    "lastname": "",
    "email": "lingllama@example.org",
    "researchInterest": "Memes",
    "affiliation": "http://lingllama.tumblr.com \n      ",
    "description": "Hi! I'm a sample user, anyone can log in as me (my password is phoneme, 'cause I like memes).",
    "dbname": "lingllama-communitycorpus",
    "collection": "users",
    "fieldDBtype": "User",
    "version": "v3.30.15",
    "api": "users",
    "corpora": [],
    "datalists": []
  },
  "dateOfLastDatumModifiedToCheckForOldSession": "\"2017-02-09T07:45:47.483Z\"",
  "timestamp": 1486915962853,
  "collection": "private_corpora",
  "copyright": "Default: Add names of the copyright holders of the corpus.",
  "license": {
    "title": "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
    "humanReadable": "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
    "link": "http://creativecommons.org/licenses/by-sa/3.0/"
  },
  "termsOfUse": {
    "humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
  },
  "searchKeywords": ""
}
```

A research corpus:

```javascript
{
  "_id": "abc",
  "_rev": "75-e7ad32bb81112aed37b77e59fe522e11",
  "dbname": "kata-georgian",
  "connection": {
    "fieldDBtype": "Connection",
    "protocol": "https://",
    "domain": "corpus.example.org",
    "port": "443",
    "dbname": "kata-georgian",
    "path": "",
    "authUrls": [
      "https://auth.example.org",
      "https://authdev.example.org"
    ],
    "userFriendlyServerName": "example.org",
    "corpusid": "abc",
    "serverLabel": "production",
    "brandLowerCase": "example",
    "websiteUrls": [
      "http://example.org"
    ],
    "corpusUrls": [
      "https://corpusdev.example.org/kata-georgian"
    ],
    "version": "v4.16.14",
    "clientUrls": [],
    "lexiconUrls": [],
    "searchUrls": [],
    "audioUrls": [],
    "activityUrls": [],
    "title": "georgian",
    "titleAsUrl": "georgian",
    "pouchname": "kata-georgian"
  },
  "title": "Georgian",
  "titleAsUrl": "georgian",
  "description": "Fieldwork in Batumi Georgia 2014\n\nReferences/Tools:\n\n * Georgian transliterator (but just installing the keyboard seems to work well for typing in Georgian) http://ge.translit.cc/\n * Georgian romanization standards (including ipa) http://en.wikipedia.org/wiki/Romanization_of_Georgian\n * Georgian phrases with audio http://ggdavid.tripod.com/georgia/language/gphrases.htm\n * Georgian Phrases http://www.omniglot.com/language/phrases/georgian.php\n * Georgian Phrases http://mylanguages.org/georgian_phrases.php\n * Phrases and some discussion of pronunciation http://wikitravel.org/en/Georgian_phrasebook\n * http://www.inyourpocket.com/Georgia/Batumi\n * https://www.facebook.com/groups/Georgianwanderers/\n * http://omnestour.ge/travel-info/useful-georgian-phrases\n * Phrases with rather natural audio: http://ilanguages.org/georgian_phrases.php\n * Georgian news: http://www.reportiori.ge/?menuid=1&lang=1\n * Georgian OCR site (have to register but it works after that) http://www.targmne.com/OCR\n * Georgian Classifieds http://gancxadebebi.ge/\n * Georgian Alphabet Practice | Alphabet Training http://alphabettraining.com/mkhedruli-practice",
  "consultants": [],
  "datumStates": [{
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "selected",
    "state": "Checked",
    "consultant": {
      "gravatar": "./../user/user_gravatar.png"
    }
  }, {
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "selected",
    "state": "CheckedWithGirl1",
    "consultant": {
      "gravatar": "7a99d4788fde0ae4e9d74802b25ea26c"
    }
  }, {
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "selected",
    "state": "CheckedWithGirl2",
    "consultant": {
      "gravatar": ""
    }
  }, {
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "selected",
    "state": "CheckedWithGirl3",
    "consultant": {
      "gravatar": "fc8b22935b6ea120f0c65cf995cfe9e3"
    }
  }, {
    "color": "success",
    "showInSearchResults": "checked",
    "selected": "selected",
    "state": "CheckedWithGoogleTranslate",
    "consultant": {
      "gravatar": ""
    }
  }, {
    "color": "warning",
    "showInSearchResults": "checked",
    "selected": "",
    "state": "To be checked",
    "consultant": {
      "gravatar": "./../user/user_gravatar.png"
    }
  }, {
    "color": "important",
    "showInSearchResults": "",
    "selected": "",
    "state": "Deleted",
    "consultant": {
      "gravatar": "./../user/user_gravatar.png"
    }
  }],
  "datumFields": [{
    "label": "judgement",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Grammaticality/acceptability judgement (*,#,?, etc). Leaving it blank can mean grammatical/acceptable, or you can choose a new symbol for this meaning.",
    "size": "3",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "orthography",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "The written form"
  }, {
    "label": "utterance",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Unparsed utterance in the language, in orthography or transcription. Line 1 in your LaTeXed examples for handouts. Sample entry: amigas",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "morphemes",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "gloss",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Metalanguage glosses of each individual morpheme (above). Used by the system to help gloss, in combination with morphemes (above). It is Line 2 in your LaTeXed examples. We recommend Leipzig conventions (. for fusional morphemes, - for morpheme boundaries etc)  Sample entry: friend-fem-pl",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "syntacticCategory",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "This optional field is used by the machine to help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of syntactic category tagging you wish. It could be very theoretical like Distributed Morphology (Sample entry: √-GEN-NUM), or very a-theroretical like the Penn Tree Bank Tag Set. (Sample entry: NNS) http://www.ims.uni-stuttgart.de/projekte/CorpusWorkbench/CQP-HTMLDemo/PennTreebankTS.html",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "syntacticTreeLatex",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "This optional field is used by the machine to make LaTeX trees and help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of LaTeX Tree package (we use QTree by default) Sample entry: Tree [.S NP VP ]",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "translation",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Free translation into whichever language your team is comfortable with (e.g. English, Spanish, etc). You can also add additional custom fields for one or more additional translation languages and choose which of those you want to export with the data each time. Line 3 in your LaTeXed examples. Sample entry: (female) friends",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "tags",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Tags for constructions or other info that you might want to use to categorize your data.",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "validationStatus",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Any number of tags of data validity (replaces DatumStates). For example: ToBeCheckedWithSeberina, CheckedWithRicardo, Deleted etc...",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "enteredByUser",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "The user who orikatally entered the datum",
    "showToUserTypes": "all",
    "readonly": true,
    "userchooseable": "disabled"
  }, {
    "label": "modifiedByUser",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "An array of users who modified the datum",
    "showToUserTypes": "all",
    "readonly": true,
    "userchooseable": "disabled"
  }, {
    "label": "context",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "In what context is the utterance used?"
  }, {
    "label": "speakers",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "This field came from file import ",
    "userchooseable": ""
  }, {
    "label": "modality",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "This field came from file import ",
    "userchooseable": ""
  }, {
    "label": "numberintext",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This is for if this item is part of a larger text."
  }],
  "conversationFields": [{
    "label": "speakers",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Use this field to keep track of who your speaker is. You can use names, initials, or whatever your consultants prefer.",
    "userchooseable": "disabled"
  }, {
    "label": "modality",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Use this field to indicate if this is a voice or gesture tier, or a tier for another modality.",
    "userchooseable": "disabled"
  }],
  "sessionFields": [{
    "label": "goal",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This describes the goals of the session.",
    "userchooseable": "disabled"
  }, {
    "label": "consultants",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown",
    "userchooseable": "disabled"
  }, {
    "label": "dialect",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "You can use this field to be as precise as you would like about the dialect of this session.",
    "userchooseable": "disabled"
  }, {
    "label": "language",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This is the langauge (or language family) if you would like to use it.",
    "userchooseable": "disabled"
  }, {
    "label": "dateElicited",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This is the date in which the session took place.",
    "userchooseable": "disabled"
  }, {
    "label": "user",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown",
    "userchooseable": "disabled"
  }, {
    "label": "dateSEntered",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This is the date in which the session was entered.",
    "userchooseable": "disabled"
  }, {
    "label": "source",
    "shouldBeEncrypted": "",
    "userMasks": [],
    "help": "This is a comma seperated field of all the speakers who were present for this elicitation session. This field also contains a (hidden) array of consultant masks with more details about the source if they are not anonymous or are actual users of the system. ",
    "userchooseable": "disabled",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "participants",
    "shouldBeEncrypted": "",
    "userMasks": [],
    "help": "This is a comma seperated field of all the people who were present for this elicitation session. This field also contains a (hidden) array of user masks with more details about the people present, if they are not anonymous or are actual users of the system. ",
    "userchooseable": "disabled",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "DateSessionEntered",
    "shouldBeEncrypted": "",
    "userchooseable": "disabled",
    "help": "The date when the elicitation session data was actually entered in the computer (could be different from the dateElicited, especailly if you usually elicit data with an audio recorder and/or a note book).",
    "value": "",
    "mask": "",
    "encrypted": ""
  }],
  "searchFields": [],
  "confidential": {
    "secretkey": "blah-blah"
  },
  "publicSelf": {
    "title": "Private Corpus",
    "titleAsUrl": "private_corpus",
    "description": "The details of this corpus are not public.",
    "id": "corpus",
    "datumStates": [],
    "datumFields": [{
      "label": "judgement",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "Use this field to establish your team's gramaticality/acceptablity judgements (*,#,? etc)",
      "size": "3",
      "userchooseable": "disabled"
    }, {
      "label": "utterance",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "Use this as Line 1 in your examples for handouts (ie, either Orthography, or phonemic/phonetic representation)",
      "userchooseable": "disabled"
    }, {
      "label": "morphemes",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "This line is used to determine the morpheme segmentation to generate glosses, it also optionally can show up in your LaTeXed examples if you choose to show morpheme segmentation in addtion ot line 1, gloss and translation.",
      "userchooseable": "disabled"
    }, {
      "label": "gloss",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "This line appears in the gloss line of your LaTeXed examples, we reccomend Leipzig conventions (. for fusional morphemes, - for morpehem boundaries etc) The system uses this line to partially help you in glossing. ",
      "userchooseable": "disabled"
    }, {
      "label": "translation",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "Use this as your primary translation. It does not need to be English, simply a language your team is comfortable with. If your consultant often gives you multiple languages for translation you can also add addtional translations in the customized fields. For example, your Quechua informants use Spanish for translations, then you can make all Translations in Spanish, and add an additional field for English if you want to generate a handout containing the datum. ",
      "userchooseable": "disabled"
    }],
    "sessionFields": [{
      "label": "dialect",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "You can use this field to be as precise as you would like about the dialect of this session.",
      "userchooseable": "disabled"
    }, {
      "label": "language",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "This is the langauge (or language family) if you would like to use it.",
      "userchooseable": "disabled"
    }, {
      "label": "dateElicited",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "This is the date in which the session took place.",
      "userchooseable": "disabled"
    }, {
      "label": "user",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "Put your team's data entry conventions here (if any)...",
      "userchooseable": "disabled"
    }, {
      "label": "dateSEntered",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "This is the date in which the session was entered.",
      "userchooseable": "disabled"
    }],
    "comments": [],
    "_id": "corpus",
    "_rev": "64-c6aefb66c8591a1efeb58e4a442145c7",
    "corpusid": "abc",
    "timestamp": 1423377014003,
    "collection": "corpuses",
    "termsOfUse": {
      "humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
    },
    "license": {
      "title": "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
      "humanReadable": "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
      "link": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    "copyright": "Default: Add names of the copyright holders of the corpus.",
    "dbname": "kata-georgian"
  },
  "publicCorpus": "Private",
  "comments": [],
  "team": {
    "gravatar": "226b903027c34e84f97161ff7f3db1ae",
    "username": "kata",
    "authUrl": "https://auth.example.org",
    "id": "team",
    "_id": "team",
    "_rev": "135-7d682e07b7c36481e7ee73ddc745c6fc",
    "collection": "users",
    "firstname": "",
    "lastname": "",
    "email": "",
    "researchInterest": "No public information available",
    "affiliation": "No public information available",
    "description": "No public information available",
    "dbname": "kata-georgian",
    "subtitle": ""
  },
  "dateOfLastDatumModifiedToCheckForOldSession": "\"2016-04-09T15:48:12.110Z\"",
  "copyright": "Default: Add names of the copyright holders of the corpus.",
  "license": {
    "title": "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
    "humanReadable": "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
    "link": "http://creativecommons.org/licenses/by-sa/3.0/"
  },
  "termsOfUse": {
    "humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
  },
  "timestamp": 1481082738522,
  "collection": "private_corpora",
  "searchKeywords": "goal:Collecting rather random sentence structures using the alphabet book as stimuli"
}
```

Corpus for collecting data via a gamified experiment

```javascript
{
  "_id": "abc",
  "_rev": "9-f8eb5890cb4b38490ac57076e6df2014",
  "pouchname": "kyte-elicitation-fr-ca",
  "couchConnection": {
    "protocol": "https://",
    "domain": "corpus.example.org",
    "port": "443",
    "pouchname": "kyte-elicitation-fr-ca",
    "path": "",
    "authUrl": "https://auth.example.org",
    "userFriendlyServerName": "example.org",
    "corpusid": "abc"
  },
  "title": "Kite Elication game",
  "titleAsUrl": "écoute_-kyte-elicitation",
  "description": "This corpus contains the Quebec French stimuli for creating the Kite Elication game",
  "team": {
    "gravatar": "",
    "username": "",
    "subtitle": "",
    "description": ""
  },
  "replicatedCouchConnections": [],
  "OLAC_export_connections": [],
  "termsOfUse": {
    "humanReadable": "The materials in the corpus may not be used for any purpose. Please contact Dr. Smith if you wish to license these materials."
  },
  "license": {
    "title": "All rights reserved.",
    "link": "http://creativecommons.org/licenses/by-sa/3.0/",
    "humanReadable": "All rights reserved."
  },
  "copyright": "Default: Add names of the copyright holders of the corpus.",
  "dateOfLastDatumModifiedToCheckForOldSession": "\"2014-07-14T14:39:13.593Z\"",
  "confidential": {
    "secretkey": "fa4d8ab7-2f42-45f2-a63f-df33e4f04b8a"
  },
  "publicCorpus": "Private",
  "collection": "private_corpora",
  "comments": [],
  "datumFields": [{
    "label": "judgement",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Grammaticality/acceptability judgement (*,#,?, etc). Leaving it blank can mean grammatical/acceptable, or you can choose a new symbol for this meaning.",
    "size": "3",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "utterance",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Unparsed utterance in the language, in orthography or transcription. Line 1 in your LaTeXed examples for handouts. Sample entry: amigas",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "syntacticCategory",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "This optional field is used by the machine to help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of syntactic category tagging you wish. It could be very theoretical like Distributed Morphology (Sample entry: √-GEN-NUM), or very a-theroretical like the Penn Tree Bank Tag Set. (Sample entry: NNS) http://www.ims.uni-stuttgart.de/projekte/CorpusWorkbench/CQP-HTMLDemo/PennTreebankTS.html",
    "showToUserTypes": "linguist",
    "userchooseable": "disabled"
  }, {
    "label": "tags",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Tags for constructions or other info that you might want to use to categorize your data.",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "validationStatus",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Any number of tags of data validity (replaces DatumStates). For example: ToBeCheckedWithSeberina, CheckedWithRicardo, Deleted etc...",
    "showToUserTypes": "all",
    "userchooseable": "disabled"
  }, {
    "label": "enteredByUser",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "The user who originally entered the datum",
    "readonly": true,
    "showToUserTypes": "readonly",
    "userchooseable": "disabled"
  }, {
    "label": "modifiedByUser",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "An array of users who modified the datum",
    "readonly": true,
    "users": [],
    "showToUserTypes": "readonly",
    "userchooseable": "disabled"
  }, {
    "label": "orthography",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import ",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "CheckedWithMary",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import ",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "startTime",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import ",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "endTime",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import ",
    "value": "",
    "mask": "",
    "encrypted": ""
  }, {
    "label": "audioFileName",
    "shouldBeEncrypted": "checked",
    "userchooseable": "",
    "help": "This field came from file import ",
    "value": "",
    "mask": "",
    "encrypted": ""
  }],
  "conversationFields": [{
    "label": "participants",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "checked",
    "help": "Use this field to keep track of who your speaker/participants are. You can use names, initials, or whatever your consultants prefer.",
    "userchooseable": "disabled"
  }, {
    "label": "modality",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "Use this field to indicate if this is a voice or gesture tier, or a tier for another modality.",
    "userchooseable": "disabled"
  }],
  "sessionFields": [{
    "label": "goal",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "The goals of the elicitation session, it could be why you set up the meeting, or some of the core contexts you were trying to elicit. Sample: collect some anti-passives",
    "userchooseable": "disabled"
  }, {
    "label": "consultants",
    "value": "",
    "mask": "",
    "encrypted": "",
    "userMasks": [],
    "shouldBeEncrypted": "",
    "help": "This is a comma seperated field of all the consultants who were present for this elicitation session. This field also contains a (hidden) array of consultant masks with more details about the consultants if they are not anonymous or are actual users of the system. ",
    "userchooseable": "disabled"
  }, {
    "label": "dialect",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "The dialect of this session (as precise as you'd like).",
    "userchooseable": "disabled"
  }, {
    "label": "language",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "The language (or language family), if desired.",
    "userchooseable": "disabled"
  }, {
    "label": "dateElicited",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "The date when the session took place.",
    "userchooseable": "disabled"
  }, {
    "label": "user",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This is the username of who created this elicitation session. There are other fields contains an array of participants and consultants. ",
    "userchooseable": "disabled"
  }, {
    "label": "participants",
    "value": "",
    "mask": "",
    "encrypted": "",
    "userMasks": [],
    "shouldBeEncrypted": "",
    "help": "This is a comma seperated field of all the people who were present for this elicitation session. This field also contains a (hidden) array of user masks with more details about the people present, if they are not anonymous or are actual users of the system. ",
    "userchooseable": "disabled"
  }, {
    "label": "DateSessionEntered",
    "value": "",
    "mask": "",
    "encrypted": "",
    "shouldBeEncrypted": "",
    "help": "This is the date in which the session was entered.",
    "userchooseable": "disabled"
  }],
  "timestamp": 1427702853643,
  "publicSelf": {
    "title": "Private Corpus",
    "titleAsUrl": "private_corpus",
    "description": "The details of this corpus are not public.",
    "id": "corpus",
    "_id": "corpus",
    "_rev": "8-ef1a9af33053fd0630e31f0c7acd534b",
    "couchConnection": {
      "protocol": "https://",
      "domain": "corpus.example.org",
      "port": "443",
      "pouchname": "kyte-elicitation-fr-ca",
      "path": "",
      "authUrl": "https://auth.example.org",
      "userFriendlyServerName": "example.org"
    },
    "termsOfUse": {
      "humanReadable": "The materials in the corpus may not be used for any purpose. Please contact Dr. Smith if you wish to license these materials."
    },
    "license": {
      "title": "All rights reserved.",
      "link": "http://creativecommons.org/licenses/by-sa/3.0/",
      "humanReadable": "All rights reserved."
    },
    "copyright": "Default: Add names of the copyright holders of the corpus.",
    "pouchname": "kyte-elicitation-fr-ca",
    "datumFields": [{
      "label": "judgement",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "Grammaticality/acceptability judgement of this data.",
      "size": "3",
      "showToUserTypes": "linguist",
      "userchooseable": "disabled"
    }, {
      "label": "gloss",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "Metalanguage glosses of each individual morpheme (morphemes are pieces ofprefix, suffix) Sample entry: friend-fem-pl",
      "showToUserTypes": "linguist",
      "userchooseable": "disabled"
    }, {
      "label": "syntacticCategory",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "This optional field is used by the machine to help with search.",
      "showToUserTypes": "machine",
      "userchooseable": "disabled"
    }, {
      "label": "syntacticTreeLatex",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "checked",
      "help": "This optional field is used by the machine to make LaTeX trees and help with search and data cleaning, in combination with morphemes and gloss (above). Sample entry: Tree [.S NP VP ]",
      "showToUserTypes": "machine",
      "userchooseable": "disabled"
    }, {
      "label": "tags",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "Tags for constructions or other info that you might want to use to categorize your data.",
      "showToUserTypes": "all",
      "userchooseable": "disabled"
    }, {
      "label": "validationStatus",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "Any number of tags of data validity (replaces DatumStates). For example: ToBeCheckedWithSeberina, CheckedWithRicardo, Deleted etc...",
      "showToUserTypes": "all",
      "userchooseable": "disabled"
    }],
    "sessionFields": [{
      "label": "dialect",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "You can use this field to be as precise as you would like about the dialect of this session.",
      "userchooseable": "disabled"
    }, {
      "label": "language",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "This is the langauge (or language family), if you would like to use it.",
      "userchooseable": "disabled"
    }, {
      "label": "dateElicited",
      "value": "",
      "mask": "",
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "This is the date in which the session took place.",
      "userchooseable": "disabled"
    }],
    "comments": [],
    "timestamp": 1427702839182,
    "corpusid": "abc",
    "collection": "corpuses"
  }
}
```


More sample serialized data: [sample_data/corpus_v1.22.1.json](../../sample_data/corpus_v1.22.1.json)


## JsDOCS

There is also some auto generated documenation which was written when the project first began and is pretty empty: 

http://fielddb.github.io/docs/javascript/Corpus.html


## Related Issues

There are quite a few issues in the issue tracker which talk about corpora, how they evolved, and what problems/pitfalls the current code tries to solve.

https://github.com/fielddb/fielddb/issues?q=corpus+sort%3Acreated-asc

[#23](https://github.com/FieldDB/FieldDB/issues/23) [#31](https://github.com/FieldDB/FieldDB/issues/31) [#45](https://github.com/FieldDB/FieldDB/issues/45) [#52](https://github.com/FieldDB/FieldDB/issues/52) [#53](https://github.com/FieldDB/FieldDB/issues/53) [#64](https://github.com/FieldDB/FieldDB/issues/64) [#76](https://github.com/FieldDB/FieldDB/issues/76) [#158](https://github.com/FieldDB/FieldDB/issues/158) [#166](https://github.com/FieldDB/FieldDB/issues/166) [#168](https://github.com/FieldDB/FieldDB/issues/168) [#170](https://github.com/FieldDB/FieldDB/issues/170) [#206](https://github.com/FieldDB/FieldDB/issues/206) [#230](https://github.com/FieldDB/FieldDB/issues/230) [#266](https://github.com/FieldDB/FieldDB/issues/266) [#366](https://github.com/FieldDB/FieldDB/issues/366) [#369](https://github.com/FieldDB/FieldDB/issues/369) [#477](https://github.com/FieldDB/FieldDB/issues/477) [#511](https://github.com/FieldDB/FieldDB/issues/511) [#538](https://github.com/FieldDB/FieldDB/issues/538) [#611](https://github.com/FieldDB/FieldDB/issues/611) [#728](https://github.com/FieldDB/FieldDB/issues/728) [#735](https://github.com/FieldDB/FieldDB/issues/735) [#779](https://github.com/FieldDB/FieldDB/issues/779) [#787](https://github.com/FieldDB/FieldDB/issues/787) [#806](https://github.com/FieldDB/FieldDB/issues/806) [#840](https://github.com/FieldDB/FieldDB/issues/840) [#876](https://github.com/FieldDB/FieldDB/issues/876) [#885](https://github.com/FieldDB/FieldDB/issues/885) [#938](https://github.com/FieldDB/FieldDB/issues/938) [#1065](https://github.com/FieldDB/FieldDB/issues/1065) [#1149](https://github.com/FieldDB/FieldDB/issues/1149) [#1151](https://github.com/FieldDB/FieldDB/issues/1151) [#1176](https://github.com/FieldDB/FieldDB/issues/1176) [#1229](https://github.com/FieldDB/FieldDB/issues/1229) [#1095](https://github.com/FieldDB/FieldDB/issues/1095) [#1230](https://github.com/FieldDB/FieldDB/issues/1230) [#1239](https://github.com/FieldDB/FieldDB/issues/1239) [#1259](https://github.com/FieldDB/FieldDB/issues/1259) [#1279](https://github.com/FieldDB/FieldDB/issues/1279) [#1285](https://github.com/FieldDB/FieldDB/issues/1285) [#1299](https://github.com/FieldDB/FieldDB/issues/1299) [#1327](https://github.com/FieldDB/FieldDB/issues/1327) [#1379](https://github.com/FieldDB/FieldDB/issues/1379) [#1403](https://github.com/FieldDB/FieldDB/issues/1403) [#1420](https://github.com/FieldDB/FieldDB/issues/1420) [#1475](https://github.com/FieldDB/FieldDB/issues/1475) [#1477](https://github.com/FieldDB/FieldDB/issues/1477) [#1480](https://github.com/FieldDB/FieldDB/issues/1480) [#1514](https://github.com/FieldDB/FieldDB/issues/1514) [#1515](https://github.com/FieldDB/FieldDB/issues/1515) [#1524](https://github.com/FieldDB/FieldDB/issues/1524) [#1532](https://github.com/FieldDB/FieldDB/issues/1532) [#1616](https://github.com/FieldDB/FieldDB/issues/1616) [#1734](https://github.com/FieldDB/FieldDB/issues/1734) [#1748](https://github.com/FieldDB/FieldDB/issues/1748) [#2121](https://github.com/FieldDB/FieldDB/issues/2121)
## Known UI 

* [Backbone.js MVC](../../backbone_client/corpus/)
* [Angular.js Directive](../../angular_client/modules/core/src/app/components/corpus)
* [Angular.js partial](../../angular_client/modules/spreadsheet/app/views/corpussettings.html)
* [Jade partial](https://github.com/FieldDB/FieldDBWebServer/blob/master/views/corpus.html)
