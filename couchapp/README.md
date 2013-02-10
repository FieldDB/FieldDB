This is the whole FieldDB App Client.

To install this app go to chrome://chrome/extensions, check
'developer mode', then click on 'Load unpacked extensions...' and
select the subfolder _attachments here.

If you get a blank black screen, look at the developer console and if it says

Failed to load resource chrome-extension://chpphlmbdnlddgbhiplfpolgfhpadfip/libs/compiled_handlebars.js

you will need to go to the top level folder (above this folder), do

npm install handlebars

and then

./scripts/build_templates.sh 

(you need to do this only once or every time you change the handlebars)
