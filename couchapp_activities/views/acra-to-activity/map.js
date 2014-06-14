function(doc) {
  // var doc = {
  //   _id: "8917961f-0eca-43cc-96c1-0e857cf4b12d",
  //   _rev: "1-8297915b0e766608027cc9750962b239",
  //   USER_EMAIL: "N/A",
  //   SETTINGS_GLOBAL: {
  //     UNLOCK_SOUND: "/system/media/audio/ui/Unlock.ogg",
  //     SET_INSTALL_LOCATION: 0,
  //     WIRELESS_CHARGING_STARTED_SOUND: "/system/media/audio/ui/WirelessChargingStarted.ogg",
  //     WIFI_MAX_DHCP_RETRY_COUNT: 9,
  //     POWER_SOUNDS_ENABLED: 1,
  //     MODE_RINGER: 2,
  //     DOCK_SOUNDS_ENABLED: 0,
  //     ASSISTED_GPS_ENABLED: 1,
  //     CDMA_CELL_BROADCAST_SMS: 1,
  //     CAR_DOCK_SOUND: "/system/media/audio/ui/Dock.ogg",
  //     BLUETOOTH_ON: 0,
  //     DOCK_AUDIO_MEDIA_ENABLED: 1,
  //     WIFI_NETWORKS_AVAILABLE_NOTIFICATION_ON: 1,
  //     WIFI_COUNTRY_CODE: "ge",
  //     USB_MASS_STORAGE_ENABLED: 1,
  //     EMERGENCY_TONE: 0,
  //     LOCK_SOUND: "/system/media/audio/ui/Lock.ogg",
  //     AIRPLANE_MODE_TOGGLEABLE_RADIOS: ["bluetooth", "wifi", "nfc"],
  //     WIFI_SCAN_ALWAYS_AVAILABLE: 1,
  //     WIFI_ON: 1,
  //     DESK_UNDOCK_SOUND: "/system/media/audio/ui/Undock.ogg",
  //     DATA_ROAMING: 0,
  //     DEVICE_PROVISIONED: 1,
  //     AIRPLANE_MODE_RADIOS: ["cell", "bluetooth", "wifi", "nfc", "wimax"],
  //     DESK_DOCK_SOUND: "/system/media/audio/ui/Dock.ogg",
  //     BUGREPORT_IN_POWER_MENU: 0,
  //     DEVELOPMENT_SETTINGS_ENABLED: 1,
  //     WIFI_DISPLAY_ON: 0,
  //     AUTO_TIME_ZONE: 0,
  //     PACKAGE_VERIFIER_ENABLE: 1,
  //     CAR_UNDOCK_SOUND: "/system/media/audio/ui/Undock.ogg",
  //     LOW_BATTERY_SOUND: "/system/media/audio/ui/LowBattery.ogg",
  //     DEFAULT_INSTALL_LOCATION: 0,
  //     WIFI_SLEEP_POLICY: 2,
  //     WIFI_WATCHDOG_ON: 1,
  //     SEND_ACTION_APP_ERROR: 1,
  //     MOBILE_DATA: 1,
  //     PREFERRED_NETWORK_MODE: 0,
  //     INSTALL_NON_MARKET_APPS: 1,
  //     CALL_AUTO_RETRY: 0,
  //     AUTO_TIME: 0,
  //     WIFI_SAVED_STATE: 0,
  //     NETSTATS_ENABLED: 1,
  //     WEB_AUTOFILL_QUERY_URL: "http://android.clients.google.com/proxy/webautofill",
  //     STAY_ON_WHILE_PLUGGED_IN: 0,
  //     AUDIO_SAFE_VOLUME_STATE: 3,
  //     ADB_ENABLED: 1,
  //     AIRPLANE_MODE_ON: 0
  //   },
  //   DEVICE_FEATURES: {},
  //   PHONE_MODEL: "Galaxy Nexus",
  //   SETTINGS_SECURE: {
  //     LOCK_SCREEN_APPWIDGET_IDS: 4,
  //     TOUCH_EXPLORATION_ENABLED: 0,
  //     VOICE_RECOGNITION_SERVICE: "com.google.android.googlequicksearchbox/com.google.android.voicesearch.serviceapi.GoogleRecognitionService",
  //     SCREENSAVER_DEFAULT_COMPONENT: "com.google.android.deskclock/com.android.deskclock.Screensaver",
  //     ACCESSIBILITY_DISPLAY_MAGNIFICATION_ENABLED: 0,
  //     SELECTED_SPELL_CHECKER_SUBTYPE: 0,
  //     ACCESSIBILITY_SCRIPT_INJECTION: 0,
  //     TTS_DEFAULT_LOCALE: "com.acapelagroup.android.tts:eng-USA-Will",
  //     LAST_SETUP_SHOWN: "eclair_1",
  //     MOUNT_PLAY_NOTIFICATION_SND: 1,
  //     LOCK_PATTERN_VISIBLE: 0,
  //     LOCK_PATTERN_ENABLED: 0,
  //     ACCESSIBILITY_SPEAK_PASSWORD: 0,
  //     ALLOW_MOCK_LOCATION: 0,
  //     ACCESSIBILITY_DISPLAY_MAGNIFICATION_SCALE: "2.0",
  //     LOCATION_PROVIDERS_ALLOWED: "network",
  //     BACKUP_ENABLED: 1,
  //     ACCESSIBILITY_SCREEN_READER_URL: "https://ssl.gstatic.com/accessibility/javascript/android/AndroidVox_v1.js",
  //     ANDROID_ID: "f9f73de09d97046a",
  //     USER_SETUP_COMPLETE: 1,
  //     LONG_PRESS_TIMEOUT: 500,
  //     SCREENSAVER_ACTIVATE_ON_SLEEP: 0,
  //     SCREENSAVER_COMPONENTS: "com.google.android.deskclock/com.android.deskclock.Screensaver",
  //     SCREENSAVER_ACTIVATE_ON_DOCK: 1,
  //     LOCK_SCREEN_OWNER_INFO_ENABLED: 0,
  //     ACCESSIBILITY_WEB_CONTENT_KEY_BINDINGS: "0x13=0x01000100; 0x14=0x01010100; 0x15=0x02000001; 0x16=0x02010001; 0x200000013=0x02000601; 0x200000014=0x02010601; 0x200000015=0x03020101; 0x200000016=0x03010201; 0x200000023=0x02000301; 0x200000024=0x02010301; 0x200000037=0x03070201; 0x200000038=0x03000701:0x03010701:0x03020701;",
  //     ACCESSIBILITY_DISPLAY_MAGNIFICATION_AUTO_UPDATE: 1,
  //     MOUNT_UMS_NOTIFY_ENABLED: 1,
  //     SELECTED_SPELL_CHECKER: "com.google.android.inputmethod.latin/com.android.inputmethod.latin.spellcheck.AndroidSpellCheckerService",
  //     DEFAULT_INPUT_METHOD: "com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME",
  //     ENABLED_INPUT_METHODS: ["com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME;-921088104;-354699631", "com.google.android.googlequicksearchbox/com.google.android.voicesearch.ime.VoiceInputMethodService", "com.zl.inputmethod.latin/.LatinIME;1846648426;-921088104;-354699631"],
  //     BACKUP_TRANSPORT: "com.google.android.backup/.BackupTransportService",
  //     MOUNT_UMS_AUTOSTART: 0,
  //     SELECTED_INPUT_METHOD_SUBTYPE: "-921088104",
  //     SPELL_CHECKER_ENABLED: 1,
  //     ENABLED_NOTIFICATION_LISTENERS: "com.sand.airdroid/com.sand.airdroid.services.NotificationService",
  //     SCREENSAVER_ENABLED: 1,
  //     MOUNT_UMS_PROMPT: 1,
  //     ALLOWED_GEOLOCATION_ORIGINS: "http://www.google.co.uk http://www.google.com",
  //     INPUT_METHODS_SUBTYPE_HISTORY: "com.zl.inputmethod.latin/.LatinIME;1846648426:com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME;-921088104:com.jb.gokeyboard/.GoKeyboard;-921088104",
  //     TTS_DEFAULT_SYNTH: "com.acapelagroup.android.tts"
  //   },
  //   INSTALLATION_ID: "c5a58138-a092-45cd-82d5-bb8bb66f8102",
  //   SETTINGS_SYSTEM: {
  //     VOLUME_RING: 5,
  //     TIME_12_24: 24,
  //     HAPTIC_FEEDBACK_ENABLED: 1,
  //     RINGTONE: "content://media/internal/audio/media/53",
  //     SCREEN_OFF_TIMEOUT: 121000,
  //     SCREEN_BRIGHTNESS_MODE: 1,
  //     POINTER_SPEED: 0,
  //     ALARM_ALERT: "content://media/internal/audio/media/13",
  //     VOLUME_BLUETOOTH_SCO: 7,
  //     VOLUME_SYSTEM: 7,
  //     HEARING_AID: 0,
  //     NOTIFICATION_SOUND: "content://media/internal/audio/media/25",
  //     TTY_MODE: 0,
  //     HIDE_ROTATION_LOCK_TOGGLE_FOR_ACCESSIBILITY: 0,
  //     NOTIFICATION_LIGHT_PULSE: 1,
  //     MUTE_STREAMS_AFFECTED: 46,
  //     MEDIA_BUTTON_RECEIVER: "com.estrongs.android.pop/com.estrongs.android.pop.app.AudioPlayerService$MediaButtonReceiver",
  //     ACCELEROMETER_ROTATION: 1,
  //     SOUND_EFFECTS_ENABLED: 1,
  //     DTMF_TONE_TYPE_WHEN_DIALING: 0,
  //     VOLUME_VOICE: 4,
  //     DTMF_TONE_WHEN_DIALING: 1,
  //     VOLUME_ALARM: 6,
  //     SCREEN_BRIGHTNESS: 255,
  //     VOLUME_NOTIFICATION: 5,
  //     USER_ROTATION: 0,
  //     VIBRATE_WHEN_RINGING: 0,
  //     NEXT_ALARM_FORMATTED: "Mon 08:00",
  //     MODE_RINGER_STREAMS_AFFECTED: 166,
  //     VOLUME_MUSIC: 11,
  //     LOCKSCREEN_SOUNDS_ENABLED: 1
  //   },
  //   SHARED_PREFERENCES: {
  //     default: {
  //       acra: {
  //         lastVersionNr: 5
  //       }
  //     }
  //   },
  //   ANDROID_VERSION: 4.3,
  //   PACKAGE_NAME: "com.github.opensourcefieldlinguistics.fielddb.speech.kartuli",
  //   APP_VERSION_CODE: 5,
  //   CRASH_CONFIGURATION: {
  //     hardKeyboardHidden: "HARDKEYBOARDHIDDEN_YES",
  //     orientation: "ORIENTATION_PORTRAIT",
  //     screenLayout: ["SCREENLAYOUT_SIZE_NORMAL", "SCREENLAYOUT_LONG_NO", "SCREENLAYOUT_LAYOUTDIR_LTR"],
  //     keyboard: "KEYBOARD_NOKEYS",
  //     mcc: 282,
  //     locale: "en_US",
  //     densityDpi: 320,
  //     compatSmallestScreenWidthDp: 320,
  //     compatScreenHeightDp: 504,
  //     fontScale: "1.0",
  //     navigationHidden: "NAVIGATIONHIDDEN_YES",
  //     screenWidthDp: 360,
  //     uiMode: ["UI_MODE_TYPE_NORMAL", "UI_MODE_NIGHT_NO"],
  //     screenHeightDp: 567,
  //     userSetLocale: true,
  //     smallestScreenWidthDp: 360,
  //     navigation: "NAVIGATION_NONAV",
  //     seq: 98,
  //     keyboardHidden: "KEYBOARDHIDDEN_NO",
  //     mnc: 1,
  //     touchscreen: "TOUCHSCREEN_FINGER",
  //     compatScreenWidthDp: 320
  //   },
  //   USER_CRASH_DATE: "2014-06-14T14:04:43.000+04:00",
  //   DUMPSYS_MEMINFO: ["Permission Denial: can't dump meminfo from from pid=29683, uid=10118 without permission android.permission.DUMP", ""],
  //   BUILD: {
  //     TIME: 1376434434000,
  //     FINGERPRINT: "google/takju/maguro:4.3/JWR66Y/776638:user/release-keys",
  //     HARDWARE: "tuna",
  //     UNKNOWN: "unknown",
  //     RADIO: "unknown",
  //     BOARD: "tuna",
  //     PRODUCT: "takju",
  //     DISPLAY: "JWR66Y",
  //     USER: "android-build",
  //     HOST: "wpef5.hot.corp.google.com",
  //     DEVICE: "maguro",
  //     TAGS: "release-keys",
  //     MODEL: "Galaxy Nexus",
  //     BOOTLOADER: "PRIMEMD04",
  //     VERSION: {
  //       CODENAME: "REL",
  //       RELEASE: 4.3,
  //       INCREMENTAL: 776638,
  //       SDK_INT: 18,
  //       RESOURCES_SDK_INT: 18,
  //       SDK: 18
  //     },
  //     CPU_ABI: "armeabi-v7a",
  //     CPU_ABI2: "armeabi",
  //     IS_DEBUGGABLE: false,
  //     ID: "JWR66Y",
  //     SERIAL: "014E38590801D010",
  //     MANUFACTURER: "samsung",
  //     BRAND: "google",
  //     TYPE: "user"
  //   },
  //   STACK_TRACE: ["java.lang.Exception: *** User event loadDatum ***", "\tat com.github.opensourcefieldlinguistics.fielddb.lessons.ui.DatumDetailFragment.recordUserEvent(DatumDetailFragment.java:824)", "\tat com.github.opensourcefieldlinguistics.fielddb.lessons.ui.DatumDetailFragment.onCreate(DatumDetailFragment.java:153)", "\tat android.support.v4.app.Fragment.performCreate(Fragment.java:1477)", "\tat android.support.v4.app.FragmentManagerImpl.moveToState(FragmentManager.java:893)", "\tat android.support.v4.app.FragmentManagerImpl.moveToState(FragmentManager.java:1104)", "\tat android.support.v4.app.BackStackRecord.run(BackStackRecord.java:682)", "\tat android.support.v4.app.FragmentManagerImpl.execPendingActions(FragmentManager.java:1467)", "\tat android.support.v4.app.FragmentManagerImpl.executePendingTransactions(FragmentManager.java:472)", "\tat android.support.v4.app.FragmentPagerAdapter.finishUpdate(FragmentPagerAdapter.java:141)", "\tat android.support.v4.view.ViewPager.populate(ViewPager.java:1068)", "\tat android.support.v4.view.ViewPager.populate(ViewPager.java:914)", "\tat android.support.v4.view.ViewPager.onMeasure(ViewPager.java:1436)", "\tat android.view.View.measure(View.java:15848)", "\tat android.view.ViewGroup.measureChildWithMargins(ViewGroup.java:5008)", "\tat android.widget.LinearLayout.measureChildBeforeLayout(LinearLayout.java:1404)", "\tat android.widget.LinearLayout.measureVertical(LinearLayout.java:695)", "\tat android.widget.LinearLayout.onMeasure(LinearLayout.java:588)", "\tat android.view.View.measure(View.java:15848)", "\tat android.view.ViewGroup.measureChildWithMargins(ViewGroup.java:5008)", "\tat android.widget.FrameLayout.onMeasure(FrameLayout.java:310)", "\tat android.view.View.measure(View.java:15848)", "\tat android.view.ViewGroup.measureChildWithMargins(ViewGroup.java:5008)", "\tat com.android.internal.widget.ActionBarOverlayLayout.onMeasure(ActionBarOverlayLayout.java:302)", "\tat android.view.View.measure(View.java:15848)", "\tat android.view.ViewGroup.measureChildWithMargins(ViewGroup.java:5008)", "\tat android.widget.FrameLayout.onMeasure(FrameLayout.java:310)", "\tat com.android.internal.policy.impl.PhoneWindow$DecorView.onMeasure(PhoneWindow.java:2189)", "\tat android.view.View.measure(View.java:15848)", "\tat android.view.ViewRootImpl.performMeasure(ViewRootImpl.java:1905)", "\tat android.view.ViewRootImpl.measureHierarchy(ViewRootImpl.java:1104)", "\tat android.view.ViewRootImpl.performTraversals(ViewRootImpl.java:1284)", "\tat android.view.ViewRootImpl.doTraversal(ViewRootImpl.java:1004)", "\tat android.view.ViewRootImpl$TraversalRunnable.run(ViewRootImpl.java:5481)", "\tat android.view.Choreographer$CallbackRecord.run(Choreographer.java:749)", "\tat android.view.Choreographer.doCallbacks(Choreographer.java:562)", "\tat android.view.Choreographer.doFrame(Choreographer.java:532)", "\tat android.view.Choreographer$FrameDisplayEventReceiver.run(Choreographer.java:735)", "\tat android.os.Handler.handleCallback(Handler.java:730)", "\tat android.os.Handler.dispatchMessage(Handler.java:92)", "\tat android.os.Looper.loop(Looper.java:137)", "\tat android.app.ActivityThread.main(ActivityThread.java:5103)", "\tat java.lang.reflect.Method.invokeNative(Native Method)", "\tat java.lang.reflect.Method.invoke(Method.java:525)", "\tat com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:737)", "\tat com.android.internal.os.ZygoteInit.main(ZygoteInit.java:553)", "\tat dalvik.system.NativeStart.main(Native Method)", ""],
  //   PRODUCT: "takju",
  //   DISPLAY: {
  //     0: {
  //       pixelFormat: 1,
  //       orientation: 0,
  //       height: 1184,
  //       flags: "FLAG_SUPPORTS_PROTECTED_BUFFERS+FLAG_SECURE",
  //       rotation: "ROTATION_0",
  //       width: 720,
  //       name: "Built-in Screen",
  //       rectSize: "[0,0,720,1184]",
  //       currentSizeRange: {
  //         largest: "[1196,1134]",
  //         smallest: "[720,670]"
  //       },
  //       isValid: true,
  //       getSize: "[720,1184]",
  //       getRealSize: "[720,1280]",
  //       refreshRate: 58.981003
  //     }
  //   },
  //   LOGCAT: ["06-14 13:43:43.759 W/ACRA (26461): Could not delete error report : 1402739019000-approved.stacktrace", "06-14 13:43:43.759 I/ACRA (26461): Sending file 1402739020000-approved.stacktrace", "06-14 13:43:43.775 D/ACRA (26461): Connect to https://data.fielddb.org/acra-learnx/_design/acra-storage/_update/report", "06-14 13:43:43.806 D/ACRA (26461): Sending request to https://data.fielddb.org/acra-learnx/_design/acra-storage/_update/report/e8230e81-29ad-40e3-bcb0-de1143cbe364", "06-14 13:43:43.892 D/ACRA (26461): Sending request to https://data.fielddb.org/acra-learnx/_design/acra-storage/_update/report/e8230e81-29ad-40e3-bcb0-de1143cbe364", "06-14 13:43:45.494 D/ACRA (26461): #checkAndSendReports - finish", "06-14 13:43:45.501 D/ACRA (26461): Wait for Toast + worker ended. Kill Application ? false", "06-14 13:43:45.525 W/ACRA (26461): Could not delete error report : 1402739020000-approved.stacktrace", "06-14 13:43:45.525 D/ACRA (26461): #checkAndSendReports - finish", "06-14 13:43:45.564 D/ACRA (26461): Wait for Toast + worker ended. Kill Application ? false", "06-14 13:43:45.775 D/OPrime (26461): Downloading samples ფრაზა", "06-14 13:43:46.783 D/dalvikvm(26461): GC_CONCURRENT freed 2868K, 25% free 16994K/22632K, paused 6ms+13ms, total 77ms", "06-14 13:43:47.408 D/OPrime (26461): Server status code 200", "06-14 13:43:47.408 D/OPrime (26461): Downloading.", "06-14 13:43:47.415 D/OPrime (26461): https://corpus.fielddb.org/_session:::{\"ok\":true,\"name\":\"public\",\"roles\":[\"\",\"computationalfieldworkshop-group_data_entry_tutorial_reader\",\"fielddbuser\",\"gina-inuktitut_reader\",\"mecathcart-impulsatives_reader\",\"community-georgian_reader\",\"mecathcart-impulsatives_commenter\",\"devgina-firstcorpus_reader\",\"lingllama-firstcorpus_reader\",\"public-firstcorpus_commenter\",\"lingllama-communitycorpus_commenter\",\"lingllama-communitycorpus_reader\",\"lingllama-communitycorpus_writer\",\"public-curldemo_admin\",\"public-curldemo_writer\",\"public-curldemo_reader\",\"public-curldemo_commenter\",\"community-migmaq_reader\"]}", "06-14 13:43:47.415 D/OPrime (26461): Contacting server...", "06-14 13:43:47.705 D/OPrime (26461): Server status code 404", "06-14 13:43:47.705 D/OPrime (26461): Downloading.", "06-14 13:43:47.712 D/OPrime (26461): https://corpus.fielddb.org/username-kartuli/_design/learnx/_view/byTag?key=%22SampleData%22:::{\"error\":\"not_found\",\"reason\":\"no_db_file\"}", "06-14 13:43:47.712 D/OPrime (26461): Server replied 404", "06-14 13:43:47.720 D/ACRA (26461): Using default Report Fields", "06-14 13:43:47.876 I/ACRA (26461): READ_LOGS granted! ACRA can include LogCat and DropBox data.", "06-14 13:43:47.900 D/ACRA (26461): Retrieving logcat output...", "06-14 13:43:47.931 D/ACRA (26461): Writing crash report file 1402739027000.stacktrace.", "06-14 13:43:47.939 D/ACRA (26461): About to start ReportSenderWorker from #handleException", "06-14 13:43:47.939 D/ACRA (26461): Mark all pending reports as approved.", "06-14 13:43:47.939 D/ACRA (26461): Looking for error files in /data/data/com.github.opensourcefieldlinguistics.fielddb.speech.kartuli/files", "06-14 13:43:47.939 D/ACRA (26461): Waiting for Toast + worker...", "06-14 13:43:47.947 D/ACRA (26461): #checkAndSendReports - start", "06-14 13:43:47.947 D/ACRA (26461): Looking for error files in /data/data/com.github.opensourcefieldlinguistics.fielddb.speech.kartuli/files", "06-14 13:43:47.947 I/ACRA (26461): Sending file 1402739027000-approved.stacktrace", "06-14 13:43:47.962 D/ACRA (26461): Connect to https://data.fielddb.org/acra-learnx/_design/acra-storage/_update/report", "06-14 13:43:48.080 D/ACRA (26461): Sending request to https://data.fielddb.org/acra-learnx/_design/acra-storage/_update/report/9ad9c7ca-4e6d-49ce-b339-af11ce9d423b", "06-14 13:43:49.665 D/ACRA (26461): #checkAndSendReports - finish", "06-14 13:43:49.744 D/ACRA (26461): Wait for Toast + worker ended. Kill Application ? false", "06-14 14:02:48.158 W/MessageQueue(26461): Handler (android.location.LocationManager$ListenerTransport$1) {422e7cc8} sending message to a Handler on a dead thread", "06-14 14:02:48.158 W/MessageQueue(26461): java.lang.RuntimeException: Handler (android.location.LocationManager$ListenerTransport$1) {422e7cc8} sending message to a Handler on a dead thread", "06-14 14:02:48.158 W/MessageQueue(26461): \tat android.os.MessageQueue.enqueueMessage(MessageQueue.java:309)", "06-14 14:02:48.158 W/MessageQueue(26461): \tat android.os.Handler.enqueueMessage(Handler.java:623)", "06-14 14:02:48.158 W/MessageQueue(26461): \tat android.os.Handler.sendMessageAtTime(Handler.java:592)", "06-14 14:02:48.158 W/MessageQueue(26461): \tat android.os.Handler.sendMessageDelayed(Handler.java:563)", "06-14 14:02:48.158 W/MessageQueue(26461): \tat android.os.Handler.sendMessage(Handler.java:500)", "06-14 14:02:48.158 W/MessageQueue(26461): \tat android.location.LocationManager$ListenerTransport.onLocationChanged(LocationManager.java:218)", "06-14 14:02:48.158 W/MessageQueue(26461): \tat android.location.ILocationListener$Stub.onTransact(ILocationListener.java:58)", "06-14 14:02:48.158 W/MessageQueue(26461): \tat android.os.Binder.execTransact(Binder.java:388)", "06-14 14:02:48.158 W/MessageQueue(26461): \tat dalvik.system.NativeStart.run(Native Method)", "06-14 14:04:19.283 D/ACRA (29651): ACRA is enabled for com.github.opensourcefieldlinguistics.fielddb.speech.kartuli, intializing...", "06-14 14:04:19.306 D/ACRA (29651): Looking for error files in /data/data/com.github.opensourcefieldlinguistics.fielddb.speech.kartuli/files", "06-14 14:04:19.322 D/OPrime (29651): anonymouskartulispeechrec1402738412445", "06-14 14:04:19.330 D/OPrime (29651): Not downloading samples, they are included in the training app", "06-14 14:04:19.423 D/dalvikvm(29651): GC_CONCURRENT freed 175K, 3% free 9181K/9396K, paused 9ms+2ms, total 29ms", "06-14 14:04:19.423 D/dalvikvm(29651): WAIT_FOR_CONCURRENT_GC blocked 13ms", "06-14 14:04:19.423 I/dalvikvm-heap(29651): Grow heap (frag case) to 9.442MB for 464656-byte allocation", "06-14 14:04:19.439 D/dalvikvm(29651): GC_FOR_ALLOC freed <1K, 3% free 9634K/9852K, paused 16ms, total 16ms", "06-14 14:04:19.455 D/dalvikvm(29651): GC_CONCURRENT freed 3K, 3% free 9747K/9968K, paused 2ms+2ms, total 18ms", "06-14 14:04:19.455 D/dalvikvm(29651): WAIT_FOR_CONCURRENT_GC blocked 8ms", "06-14 14:04:19.455 I/dalvikvm-heap(29651): Grow heap (frag case) to 9.995MB for 464656-byte allocation", "06-14 14:04:19.470 D/dalvikvm(29651): GC_CONCURRENT freed 113K, 4% free 10087K/10424K, paused 2ms+1ms, total 18ms", "06-14 14:04:19.470 D/dalvikvm(29651): WAIT_FOR_CONCURRENT_GC blocked 16ms", "06-14 14:04:19.470 D/dalvikvm(29651): WAIT_FOR_CONCURRENT_GC blocked 5ms", "06-14 14:04:19.548 D/libEGL (29651): loaded /vendor/lib/egl/libEGL_POWERVR_SGX540_120.so", "06-14 14:04:19.556 D/libEGL (29651): loaded /vendor/lib/egl/libGLESv1_CM_POWERVR_SGX540_120.so", "06-14 14:04:19.564 D/libEGL (29651): loaded /vendor/lib/egl/libGLESv2_POWERVR_SGX540_120.so", "06-14 14:04:19.642 D/OpenGLRenderer(29651): Enabling debug mode 0", "06-14 14:04:42.900 D/OPrime (29651): Displaying datum in position 0", "06-14 14:04:42.900 D/OPrime (29651): content://com.github.opensourcefieldlinguistics.fielddb.speechrec.kartuli.datum/datums/instructions", "06-14 14:04:42.900 D/OPrime (29651): Displaying datum in position 1", "06-14 14:04:42.908 D/OPrime (29651): content://com.github.opensourcefieldlinguistics.fielddb.speechrec.kartuli.datum/datums/sms1", "06-14 14:04:42.915 D/OPrime (29651): Will get id instructions", "06-14 14:04:42.931 D/ACRA (29651): Using default Report Fields", "06-14 14:04:43.001 D/dalvikvm(29651): GC_CONCURRENT freed 323K, 4% free 10202K/10564K, paused 3ms+3ms, total 23ms", "06-14 14:04:43.244 D/dalvikvm(29651): GC_CONCURRENT freed 324K, 4% free 10279K/10640K, paused 3ms+4ms, total 26ms", "06-14 14:04:43.306 I/ACRA (29651): READ_LOGS granted! ACRA can include LogCat and DropBox data.", "06-14 14:04:43.322 D/ACRA (29651): Retrieving logcat output...", "06-14 14:04:43.361 D/ACRA (29651): Writing crash report file 1402740283000.stacktrace.", "06-14 14:04:43.392 D/dalvikvm(29651): GC_CONCURRENT freed 415K, 5% free 10327K/10812K, paused 3ms+2ms, total 20ms", "06-14 14:04:43.392 D/dalvikvm(29651): WAIT_FOR_CONCURRENT_GC blocked 8ms", "06-14 14:04:43.400 D/ACRA (29651): About to start ReportSenderWorker from #handleException", "06-14 14:04:43.400 D/ACRA (29651): Mark all pending reports as approved.", "06-14 14:04:43.400 D/ACRA (29651): Looking for error files in /data/data/com.github.opensourcefieldlinguistics.fielddb.speech.kartuli/files", "06-14 14:04:43.400 D/ACRA (29651): #checkAndSendReports - start", "06-14 14:04:43.400 D/ACRA (29651): Looking for error files in /data/data/com.github.opensourcefieldlinguistics.fielddb.speech.kartuli/files", "06-14 14:04:43.400 I/ACRA (29651): Sending file 1402740283000-approved.stacktrace", "06-14 14:04:43.400 D/ACRA (29651): Waiting for Toast + worker...", "06-14 14:04:43.439 D/dalvikvm(29651): GC_FOR_ALLOC freed 165K, 5% free 10304K/10812K, paused 18ms, total 18ms", "06-14 14:04:43.439 I/dalvikvm-heap(29651): Grow heap (frag case) to 10.207MB for 116176-byte allocation", "06-14 14:04:43.455 D/dalvikvm(29651): GC_FOR_ALLOC freed 24K, 5% free 10393K/10928K, paused 20ms, total 20ms", "06-14 14:04:43.478 D/dalvikvm(29651): GC_FOR_ALLOC freed <1K, 5% free 10395K/10928K, paused 18ms, total 18ms", "06-14 14:04:43.478 I/dalvikvm-heap(29651): Grow heap (frag case) to 10.628MB for 464656-byte allocation", "06-14 14:04:43.494 D/dalvikvm(29651): GC_FOR_ALLOC freed 0K, 5% free 10849K/11384K, paused 17ms, total 17ms", "06-14 14:04:43.525 D/dalvikvm(29651): GC_CONCURRENT freed 70K, 4% free 10960K/11384K, paused 3ms+3ms, total 31ms", "06-14 14:04:43.533 D/ACRA (29651): Connect to https://data.fielddb.org/acra-learnx/_design/acra-storage/_update/report", "06-14 14:04:43.548 D/OPrime (29651): Prompt for this datum will be instructions", "06-14 14:04:43.572 D/dalvikvm(29651): GC_FOR_ALLOC freed 754K, 9% free 10592K/11588K, paused 17ms, total 17ms", "06-14 14:04:43.587 D/OPrime (29651): Playing prompting context", "06-14 14:04:43.611 D/OPrime (29651): Will get id sms1", "06-14 14:04:43.619 D/ACRA (29651): Using default Report Fields", "06-14 14:04:43.658 D/dalvikvm(29651): GC_CONCURRENT freed 228K, 6% free 10950K/11588K, paused 2ms+4ms, total 42ms", "06-14 14:04:43.759 I/ACRA (29651): READ_LOGS granted! ACRA can include LogCat and DropBox data.", "06-14 14:04:43.775 D/ACRA (29651): Retrieving logcat output...", ""],
  //   APP_VERSION_NAME: "2.4.0",
  //   AVAILABLE_MEM_SIZE: 4873404416,
  //   USER_APP_START_DATE: "2014-06-14T14:04:19.000+04:00",
  //   CUSTOM_DATA: {
  //     action: "{loadDatum : sms1}",
  //     username: "anonymouskartulispeechrec1402738412445",
  //     deviceDetails: "{name: 'Samsun Galaxy Nexus', model: 'Galaxy Nexus', product: 'takju', manufacturer: 'Samsun', appversion: '2.4.0', sdk: '18', osversion: '3.0.72-gfb3c9ac(776638)',device: 'maguro', screen: {height: '1184', width: '720', ratio: '1.0', currentOrientation: 'portrait'}, serial: '014E38590801D010', identifier: 'f9f73de09d97046a', wifiMACaddress: '20:64:32:c4:8d:e9', timestamp: '1402740283625',location:{longitude: '0.0', latitude: '0.0', accuracy: '0.0'} , telephonyDeviceId:'351746053637305'}",
  //     urlString: "content://com.github.opensourcefieldlinguistics.fielddb.speechrec.kartuli.datum/datums/instructions",
  //     dbname: "anonymouskartulispeechrec1402738412445-kartuli",
  //     androidTimestamp: 1402740283624
  //   },
  //   BRAND: "google",
  //   INITIAL_CONFIGURATION: {
  //     hardKeyboardHidden: "HARDKEYBOARDHIDDEN_YES",
  //     orientation: "ORIENTATION_PORTRAIT",
  //     screenLayout: ["SCREENLAYOUT_SIZE_NORMAL", "SCREENLAYOUT_LONG_NO", "SCREENLAYOUT_LAYOUTDIR_LTR"],
  //     keyboard: "KEYBOARD_NOKEYS",
  //     mcc: 282,
  //     locale: "en_US",
  //     densityDpi: 320,
  //     compatSmallestScreenWidthDp: 320,
  //     compatScreenHeightDp: 504,
  //     fontScale: "1.0",
  //     navigationHidden: "NAVIGATIONHIDDEN_YES",
  //     screenWidthDp: 360,
  //     uiMode: ["UI_MODE_TYPE_NORMAL", "UI_MODE_NIGHT_NO"],
  //     screenHeightDp: 567,
  //     userSetLocale: true,
  //     smallestScreenWidthDp: 360,
  //     navigation: "NAVIGATION_NONAV",
  //     seq: 98,
  //     keyboardHidden: "KEYBOARDHIDDEN_NO",
  //     mnc: 1,
  //     touchscreen: "TOUCHSCREEN_FINGER",
  //     compatScreenWidthDp: 320
  //   },
  //   TOTAL_MEM_SIZE: 14311309312,
  //   FILE_PATH: "/data/data/com.github.opensourcefieldlinguistics.fielddb.speech.kartuli/files",
  //   ENVIRONMENT: {
  //     getDownloadCacheDirectory: "/cache",
  //     getSecureDataDirectory: "/data",
  //     getMediaStorageDirectory: "/data/media/0",
  //     getExternalStorageState: "mounted",
  //     getExternalStorageDirectory: "/storage/emulated/0",
  //     getEmulatedStorageObbSource: "/mnt/shell/emulated/obb",
  //     isExternalStorageRemovable: false,
  //     getLegacyExternalStorageObbDirectory: "/storage/emulated/legacy/Android/obb",
  //     isEncryptedFilesystemEnabled: false,
  //     getLegacyExternalStorageDirectory: "/storage/emulated/legacy",
  //     getSystemSecureDirectory: "/data/system",
  //     isExternalStorageEmulated: true,
  //     getRootDirectory: "/system",
  //     getExternalStorageAndroidDataDir: "/storage/emulated/0/Android/data",
  //     getDataDirectory: "/data"
  //   },
  //   REPORT_ID: "8917961f-0eca-43cc-96c1-0e857cf4b12d",
  //   timestamp: "2014-06-14T10:04:16.351Z",
  //   user_ip: "92.54.210.89",
  //   SIGNATURE: {
  //     full: "java.lang.Exception: *** User event loadDatum *** at com.github.opensourcefieldlinguistics.fielddb.lessons.ui.DatumDetailFragment.recordUserEvent(DatumDetailFragment.java:824)",
  //     digest: "java.lang.Exception: *** User event loadDatum *** : \tat com.github.opensourcefieldlinguistics.fielddb.lessons.ui.DatumDetailFragment.recordUserEvent(DatumDetailFragment.java:824)"
  //   },
  //   uptime: 24,
  //   requestHeaders: {
  //     Accept: "text/html,application/xml,application/json,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5",
  //     Authorization: "Basic YWNyYV9yZXBvcnRlcjpxZTg5amF3ZTA5amFsd2VrYQ==",
  //     Connection: "close"

  //   }
  // };
  var utils = {

    digestReport: function(doc) {
      if (doc.USER_CRASH_DATE) {
        var value = {
          user_crash_date: doc.USER_CRASH_DATE,
          android_version: doc.ANDROID_VERSION,
          application_version_name: doc.APP_VERSION_NAME,
          application_package: doc.APPLICATION_PACKAGE
        };
        if (doc.SIGNATURE) {
          value.signature = doc.SIGNATURE;
        } else {
          value.stack_trace = doc.STACK_TRACE;
        }
        if (doc.INSTALLATION_ID) {
          value.installation_id = doc.INSTALLATION_ID;
        }

        value.device = utils.getDevice(doc);

        return value;
      }
    },

    getDevice: function(doc) {
      if (doc.BUILD) {
        if (doc.BUILD.MANUFACTURER) {
          return doc.BUILD.MANUFACTURER + " " + doc.BUILD.BRAND + " " + doc.BUILD.MODEL;
        } else {
          return doc.BUILD.BRAND + " " + doc.BUILD.MODEL;
        }
      } else {
        var value = "";
        if (doc.BRAND) {
          value = doc.BRAND;
        }
        if (doc.PRODUCT) {
          value += " " + doc.PRODUCT;
        }
        if (doc.PHONE_MODEL) {
          value += " " + doc.MODEL;
        }

        return value;
      }
    }
  };

  // CommonJS bindings
  if (typeof(exports) === 'object') {
    exports.digestReport = utils.digestReport;
  };
  var docid = "undefined";
  var oldrev = "undefined";
  var newrev = "undefined";
  var userdbname = "default";
  var teamdbname = "default";
  var username = "default";
  var personalActivity = {
    verb: "default",
    verbicon: "icon-default",
    directobject: "",
    directobjecticon: "icon-list",
    indirectobject: "",
    teamOrPersonal: "personal",
    context: " via LearnX App.",
    timeSpent: {
      editingTimeSpent: 0,
      editingTimeDetails: [],
      totalTimeSpent: 0,
      readTimeSpent: 0
    },
    user: {
      username: "",
      gravatar: ""
    },
    timestamp: 0,
    dateModified: "",
    appVersion: ""
  };
  var teamActivity = {
    verb: "default",
    verbicon: "icon-default",
    directobject: "",
    directobjecticon: "icon-list",
    indirectobject: "",
    teamOrPersonal: "team",
    context: " via LearnX App.",
    timeSpent: {
      editingTimeSpent: 0,
      editingTimeDetails: [],
      totalTimeSpent: 0,
      readTimeSpent: 0
    },
    user: {
      username: "",
      gravatar: ""
    },
    timestamp: 0,
    dateModified: "",
    appVersion: ""
  };
  // var androidCustomData = {
  //   action: "{totalDatumEditsOnPause : [{translation : 2},{gloss : 1}]}",
  //   username: "anonymous1398450847034",
  //   deviceDetails: "{name: 'Ace A100', model: 'A100', product: 'a100_pa_cus1', manufacturer: 'Ace', appversion: '1.102.3', sdk: '15', osversion: '2.6.39.4+(1374574145)',device: 'vangogh', screen: {height: '552', width: '1024', ratio: '1.855072463768116', currentOrientation: 'landscape'}, serial: '20105261615', identifier: '219e143ace5e6e97', wifiMACaddress: '00:08:CA:50:50:63', timestamp: '1398450927746',location:{longitude: '0.0', latitude: '0.0', accuracy: '0.0'} , telephonyDeviceId:'unknown'}",
  //   urlString: "content://com.github.opensourcefieldlinguistics.fielddb.kartuli.datum/datums/723a8b707e579087aa36c2e338eb17ec",
  //   registerUser: "anonymous1398450847034",
  //   androidTimestamp: 1398450927746
  // };
  var androidCustomData = doc.CUSTOM_DATA;
  if (androidCustomData) {
    if (androidCustomData.registerUser || androidCustomData.username) {
      username = androidCustomData.registerUser || androidCustomData.username;
      personalActivity.user.username = androidCustomData.registerUser;
      teamActivity.user.username = androidCustomData.registerUser;
      if (androidCustomData.urlString.indexOf("speechrec.kartuli") > -1) {
        userdbname = personalActivity.user.username + "-kartuli";
        teamdbname = "speechrecognition-kartuli";
        personalActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
        teamActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
        personalActivity.context = " via Kartuli Speech Recognizer";
        teamActivity.context = " via Kartuli Speech Recognizer";
      } else if (androidCustomData.urlString.indexOf("migmaq") > -1) {
        userdbname = personalActivity.user.username + "-migmaq";
        teamdbname = "community-migmaq";
        personalActivity.indirectobject = "in Mig'maq";
        teamActivity.indirectobject = "in Mig'maq";
      } else {
        userdbname = personalActivity.user.username + "-kartuli";
        teamdbname = "community-georgian";
        personalActivity.indirectobject = "in Kartuli";
        teamActivity.indirectobject = "in Kartuli";
      }
    }
    if (androidCustomData && androidCustomData.urlString) {
      docid = androidCustomData.urlString.substring(androidCustomData.urlString.lastIndexOf("/") + 1);
      if (androidCustomData.action && androidCustomData.action.indexOf("totalDatumEditsOnPause") >-1 ) {
        if(androidCustomData.action === "{totalDatumEditsOnPause : []}"){
          return;
        }
        personalActivity.verb = "modified";
        teamActivity.verb = "modified";
        personalActivity.verbicon = "icon-pencil";
        teamActivity.verbicon = "icon-pencil";
      }
      personalActivity.directobject = "<a target='_blank' href='#corpus/" + userdbname + "/datum/" + docid + "'>a datum</a>";
      teamActivity.directobject = "<a target='_blank' href='#corpus/" + teamdbname + "/datum/" + docid + "'>a datum</a>";
    }
    if (androidCustomData.action.indexOf("register") > -1 || androidCustomData.downloadDatums) {
      personalActivity.verb = "logged in";
      teamActivity.verb = "logged in";
      personalActivity.verbicon = "icon-check";
      teamActivity.verbicon = "icon-check";
      personalActivity.directobjecticon = "icon-user";
      teamActivity.directobjecticon = "icon-user";
      personalActivity.directobject = "";
      teamActivity.directobject = "";
    } else
    if (androidCustomData.action.indexOf("download") > -1) {
      var directobject = androidCustomData.action.split(":::");
      personalActivity.verb = "downloaded ";
      teamActivity.verb = "downloaded";
      personalActivity.verbicon = "icon-down";
      teamActivity.verbicon = "icon-down";
      personalActivity.directobjecticon = "icon-file";
      teamActivity.directobjecticon = "icon-file";
      personalActivity.directobject = directobject[1];
      teamActivity.directobject = directobject[1];
    } else
    if (androidCustomData.action.indexOf("capture") > -1) {
      var directobject = androidCustomData.action;
      try {
        directobject = androidCustomData.action.replace("}", "");
        directobject = directobject.substring(directobject.lastIndexOf("/") + 1);
      } catch (e) {
        //couldnt figure out the image
      }
      personalActivity.verb = "added";
      teamActivity.verb = "added";
      personalActivity.verbicon = "icon-plus";
      teamActivity.verbicon = "icon-plus";
      personalActivity.directobjecticon = "icon-camera";
      teamActivity.directobjecticon = "icon-camera";
      if (androidCustomData.action.indexOf("Audio") > -1) {
        personalActivity.verb = "recorded";
        teamActivity.verb = "recorded";
        personalActivity.directobjecticon = "icon-audio";
        teamActivity.directobjecticon = "icon-audio";
      }
      if (androidCustomData.action.indexOf("Video") > -1) {
        personalActivity.verb = "recorded";
        teamActivity.verb = "recorded";
        personalActivity.directobjecticon = "icon-video";
        teamActivity.directobjecticon = "icon-video";
      }
      personalActivity.directobject = directobject;
      teamActivity.directobject = directobject;
    } else
    if (androidCustomData.action.indexOf("loadDatum") > -1) {
      var docid = androidCustomData.action;
      try {
        docid = androidCustomData.action.replace("{loadDatum : ", "").replace("}", "");
      } catch (e) {
        //couldnt figure out the image
      }
      personalActivity.verb = "viewed";
      teamActivity.verb = "viewed";
      personalActivity.verbicon = "icon-eye";
      teamActivity.verbicon = "icon-eye";
      personalActivity.directobjecticon = "icon-list";
      teamActivity.directobjecticon = "icon-list";
      personalActivity.directobject = "<a target='_blank' href='#corpus/" + userdbname + "/datum/" + docid + "'>a datum</a>";
      teamActivity.directobject = "<a target='_blank' href='#corpus/" + teamdbname + "/datum/" + docid + "'>a datum</a>";
    }
    if (androidCustomData.androidTimestamp) {
      personalActivity.timestamp = androidCustomData.androidTimestamp;
      teamActivity.timestamp = androidCustomData.androidTimestamp;
      personalActivity._id = androidCustomData.androidTimestamp;
      teamActivity._id = androidCustomData.androidTimestamp;
    }

  }
  if (doc.APP_VERSION_NAME) {
    personalActivity.appVersion = doc.APP_VERSION_NAME;
    teamActivity.appVersion = doc.APP_VERSION_NAME;
  }
  var deviceName = utils.getDevice(doc);
  personalActivity.deviceName = deviceName;
  teamActivity.deviceName = deviceName;

  personalActivity.androidDetails = doc.CUSTOM_DATA;
  teamActivity.androidDetails = doc.CUSTOM_DATA;
  // try {
  //   var device = JSON.parse(androidCustomData.deviceDetails.replace(/'/g, '"'));
  //   if (device.location && device.location.latitude != 0) {
  //     personalActivity.location = device.location;
  //     teamActivity.location = device.location;
  //   }
  // } catch (e) {
  //   // console.log(e)
  // }
  // try {
  //   var action = JSON.parse(androidCustomData.action);
  //   if (action && action.totalDatumEditsOnPause) {
  //     personalActivity.timespent.totalDatumEditsOnPause = action.totalDatumEditsOnPause;
  //     teamActivity.timespent.totalDatumEditsOnPause = action.totalDatumEditsOnPause;
  //   }
  // } catch (e) {
  //   // console.log(e)
  // }


  if (doc.APP_VERSION_NAME) {
    emit(teamdbname, teamActivity);
    //emit(userdbname, personalActivity);
  }
}
