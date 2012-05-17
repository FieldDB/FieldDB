define("bot/Bot",
    [ "use!backbone", 
         "user/User" ], 
    function(Backbone, User) {
  var Bot = User.extend(

      /** @lends Bot.prototype */
      {
        /**
         * @class A bot is a type of user . It has the same information as a user.
         *        It crawls around the database and cleans it. It also has
         *        permissions about the level of access to the data (read only,
         *        add/edit).
         * 
         * @property{String} executable This is the file that will be executed when
         *                   the bot runs.
         * @property{String} output This is the last output from the bot's last run.
         * @property{String} lastRunTime This is the most recent time that the bot
         *                   was active.
         * 
         * 
         * @extends User.Model
         * @constructs
         */

        initialize : function(attributes) {
          Bot.__super__.initialize.call(this, attributes);
          this.set("executable", "");
          this.set("output", "");
          this.set("lastRunTime", "");
        }

      });

  return Bot;
});