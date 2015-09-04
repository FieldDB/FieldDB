# Activity

Activities are simple objects which represent who `user` did `verb` what `directobject`, to what `indirectobject`, in which application `context`. 

Activities are useful for users to remember what they were doing last time they were working in the app. Often we cylce between working on publications, teaching, grading and collecting data so sometimes it can be 6 months before we return to our database.

Activities are also useful for teams to catch up on what has happened in their corpus since they last opened it. They can see what other user have worked on, and do follow ups. They can also learn about new features by seeing other users have done something they havent done before. 

<img src="https://cloud.githubusercontent.com/assets/196199/6282469/527dc6b2-b908-11e4-8790-4df19acbd163.png"  height="300" />

![screen shot 2014-09-15 at 3 46 55 pm](https://cloud.githubusercontent.com/assets/196199/4277848/c0c6a28c-3d12-11e4-9ac0-3f3a464bed7d.png)

## Demos which you can break point

You can see [LingLlama's activity feed](https://corpus.lingsync.org/lingllama-communitycorpus-activity_feed/_design/activities/activity_feed.html#/user/lingllama/corpus/lingllama-communitycorpus) in action. NOTE: You need to be logged in in order to open this link.

## Videos

MaryEllen talks about activity feeds at 00:12 in this video

https://youtu.be/lxU5Hf9vn1E?t=12s

## Usage

You can use Activities via the `fielddb` bower package.

```bash
$ bower install fielddb --save
```
In which case all examples below would be prefixed with FieldDB
eg `FieldDB.Activity` or `FieldDB.Activities`.


You can use Activities via browserify and/or node.js

```bash
$ npm install fielddb --save
```

```javascript
var Activity = require("fielddb/api/activity/Activity").Activity;
var Activities = require("fielddb/api/activity/Activities").Activities;

```

## Examples

Create an Activity:
 
Most of the data models know how to create activities like edit, create, delete, comment so you dont have to create activies often. 

If there is a global app open and a user logged in, the app is able to figure out who did the activity, and will add the user, timestamp, location, hardware and software info for you.

```javascript
var activity = new FieldDB.Activity({
  verb: "modified",
  directobject: "noqata",
  context: " via my ultra awesome other app"
});

```

If you want to add the user yourself, you can specify the users username and gravatar.

```javascript
var activity = new FieldDB.Activity({
  user: {
    username: "hi",
    gravatar: "yo"
  },
  verb: "modified",
  directobject: "noqata",
  context: " via my quick and dirty script"
});

```

Save an Activity:

```javascript
activity.save();

```


Open an ActivityFeed:

```javascript
var activityFeed = new FieldDB.Activities({
  corpusUrl: "https://localhost6984",
  dbname: "jenkins-firstcorpus-activity_feed"
});

activityFeed
.fetch()
.then(function(){
  console.log("I have data", activityFeed);
});
```

Add new FieldDB.activites to a a feed:

```javascript
activityFeed.add({
  verb: "logged in",
  verbicon: "icon-check",
  directobjecticon: "icon-user",
  directobject: "",
  indirectobject: "",
  teamOrPersonal: "personal"
});
```

Save unsaved activites in a feed:

```javascript
activityFeed.save();
```

More examples are show in the ["it should do x" Activity specifications](tests/activity/Activity-spec.js).

## Tests

You can find more sample ways to use Activies, and what Activies are supposed to know how to do in the ["it should do x" Activity specifications](tests/activity/Activity-spec.js).

To run the Activity test suite: 

```bash
$ jasmine-node tests/activity
```

## Sample serialized model(s)

With user exerperience tracking:

```javascript
{
  _id: "723a8b707e579087aa36c2e33867e756",
  _rev: "2-5ca7b4bf537a6b4593de4821ce9bb2bb",
  verb: "<a target='_blank' href='#diff/oldrev/1-b5892d1adf5bc6993f32a1324e1aa00e/newrev/2-02f9864401946625848ea80bb17ee398'>modified</a> ",
  verbicon: "icon-pencil",
  directobject: "<a target='_blank' href='#corpus/gina-georgian/datum/723a8b707e579087aa36c2e33867862a'>magram</a> ",
  directobjecticon: "icon-list",
  indirectobject: "in <a target='_blank' href='#corpus/723a8b707e579087aa36c2e33865ebef'>Georgian</a>",
  teamOrPersonal: "team",
  context: " via Offline App.",
  timeSpent: {
    editingTimeSpent: 0,
    editingTimeDetails: [],
    totalTimeSpent: 16.781,
    readTimeSpent: 16.781
  },
  user: {
    username: "gina",
    gravatar: "https://si0.twimg.com/profile_images/1367488873/cesine_reasonably_small.png",
    authUrl: "https://authdev.lingsync.org"
  },
  timestamp: 1394859697719,
  dateModified: "\"2014-03-15T05:01:37.719Z\"",
  appVersion: "1.93.5pdc"
}
```


From a bot:

```javascript
{
  _id: "49e123785049b1a89f49dcc66684d18b",
  _rev: "1-39e627f031e9098bf3b19cd796ba6754",
  verb: "<a target='_blank' href='#diff/oldrev/1-bd62537818124514ce500b38c75f87fd/newrev/1-bd62537818124514ce500b38c75f87fd'>updated</a> ",
  verbicon: "icon-pencil",
  directobjecticon: "icon-list",
  directobject: "<a target='_blank' href='#data/38b751d2a58a13f04a201ac9f902419d'>gen:50:21 taaimaaimmat, sivuurangillusi; uvanga niqiksaqaqtinniaqpatsi qiturngasilu.” taaimaailiuqluni tunnganaqtumik uqautikkanniqpaait maniguqtillugillu.</a> ",
  indirectobject: "in <a target='_blank' href='#corpus/C78E3F31-824E-4B5D-A540-9423AF8AECE5'>Inuktitut</a>",
  teamOrPersonal: "team",
  context: " via Futon Bot.",
  user: {
    gravatar: "968b8e7fb72b5ffe2915256c28a9414c",
    username: "inuktituttransliterationbot",
    _id: "inuktituttransliterationbot",
    collection: "bots",
    firstname: "Inuktitut",
    lastname: "Transliteration Bot",
    email: ""
  },
  timestamp: 1370794522819,
  dateModified: "2013-08-31T01:44:01.563Z"
}

```

From an Android app:

```javascript
{
   "_id": "6081c579-c46a-4b5d-8509-3f1f2c069c1b_rev_3-1c92ba1c862184cb8a873981b5ab57b6",
   "_rev": "1-9c253925338711b34618b107b1efc45b",
   "timestamp": 1396708861000,
   "verb": "viewed",
   "verbicon": "icon-eye",
   "directobject": "<a target='_blank' href='#corpus/anonymous1396552744249-firstcorpus/datum/loadDatum:::723a8b707e579087aa36c2e338ecdb4c'>a datum</a>",
   "directobjecticon": "icon-list",
   "indirectobject": "in Kartuli",
   "context": " via LearnX App.",
   "teamOrPersonal": "personal",
   "user": {
       "username": "anonymous1396552744249",
       "gravatar": ""
   },
   "dateModified": "",
   "appVersion": "1.102.1",
   "ip": "92.54.210.89",
   "deviceName": "samsung google Galaxy Nexus",
   "androidDetails": {
       "action": "loadDatum:::723a8b707e579087aa36c2e338ecdb4c",
       "username": "anonymous1396552744249",
       "urlString": "content://com.github.opensourcefieldlinguistics.fielddb.datum/datums/723a8b707e579087aa36c2e338eb17ec",
       "deviceDetails": "{name: 'Samsun Galaxy Nexus', model: 'Galaxy Nexus', product: 'takju', manufacturer: 'Samsun', appversion: '1.102.1', sdk: '18', osversion: '3.0.72-gfb3c9ac(776638)',device: 'maguro', screen: {height: '1184', width: '720', ratio: '1.0', currentOrientation: 'portrait'}, serial: '014E38590801D010', identifier: 'f9f73de09d97046a', wifiMACaddress: '20:64:32:c4:8d:e9', timestamp: '1396708861743',location:{longitude: '0.0', latitude: '0.0', accuracy: '0.0'} , telephonyDeviceId:'351746053637305'}"
   },
   "originalId": "6081c579-c46a-4b5d-8509-3f1f2c069c1b",
   "originalRev": "3-1c92ba1c862184cb8a873981b5ab57b6"
}

```

More sample serialized data: [sample_data/activity_v2.4.0.json](sample_data/activity_v2.4.0.json)



## JsDOCS

There is also some auto generated documenation which was written when the project first began and is pretty empty: 

http://fielddb.github.io/docs/javascript/Activity.html


## Related Issues

There are quite a few issues in the issue tracker which talk about activities, how they evolved, and what problems/pitfalls the current code tries to solve.

https://github.com/fielddb/fielddb/issues?utf8=✓&q=activity

[#27](https://github.com/FieldDB/FieldDB/issues/27) [#96](https://github.com/FieldDB/FieldDB/issues/96) [#99](https://github.com/FieldDB/FieldDB/issues/99) [#148](https://github.com/FieldDB/FieldDB/issues/148) [#337](https://github.com/FieldDB/FieldDB/issues/337) [#412](https://github.com/FieldDB/FieldDB/issues/412) [#426](https://github.com/FieldDB/FieldDB/issues/426) [#458](https://github.com/FieldDB/FieldDB/issues/458) [#479](https://github.com/FieldDB/FieldDB/issues/479) [#495](https://github.com/FieldDB/FieldDB/issues/495) [#514](https://github.com/FieldDB/FieldDB/issues/514) [#567](https://github.com/FieldDB/FieldDB/issues/567) [#715](https://github.com/FieldDB/FieldDB/issues/715) [#755](https://github.com/FieldDB/FieldDB/issues/755) [#763](https://github.com/FieldDB/FieldDB/issues/763) [#764](https://github.com/FieldDB/FieldDB/issues/764) [#768](https://github.com/FieldDB/FieldDB/issues/768) [#888](https://github.com/FieldDB/FieldDB/issues/888) [#889](https://github.com/FieldDB/FieldDB/issues/889) [#912](https://github.com/FieldDB/FieldDB/issues/912) [#968](https://github.com/FieldDB/FieldDB/issues/968) [#1006](https://github.com/FieldDB/FieldDB/issues/1006) [#1016](https://github.com/FieldDB/FieldDB/issues/1016) [#1033](https://github.com/FieldDB/FieldDB/issues/1033) [#1043](https://github.com/FieldDB/FieldDB/issues/1043) [#1055](https://github.com/FieldDB/FieldDB/issues/1055) [#1067](https://github.com/FieldDB/FieldDB/issues/1067) [#1124](https://github.com/FieldDB/FieldDB/issues/1124) [#1137](https://github.com/FieldDB/FieldDB/issues/1137) [#1166](https://github.com/FieldDB/FieldDB/issues/1166) [#1200](https://github.com/FieldDB/FieldDB/issues/1200) [#1225](https://github.com/FieldDB/FieldDB/issues/1225) [#1227](https://github.com/FieldDB/FieldDB/issues/1227) [#1228](https://github.com/FieldDB/FieldDB/issues/1228) [#1233](https://github.com/FieldDB/FieldDB/issues/1233) [#1235](https://github.com/FieldDB/FieldDB/issues/1235) [#1300](https://github.com/FieldDB/FieldDB/issues/1300) [#1400](https://github.com/FieldDB/FieldDB/issues/1400) [#1541](https://github.com/FieldDB/FieldDB/issues/1541) [#1693](https://github.com/FieldDB/FieldDB/issues/1693) [#1766](https://github.com/FieldDB/FieldDB/issues/1766) [#1951](https://github.com/FieldDB/FieldDB/issues/1951) 

## Known UI 

* [Backbone.js MVC](backbone_client/activity/)
* [Angular.js Activity Feed](angular_client/modules/activity/client)
* [Angular.js Directive](angular_client/modules/core/src/app/components)

