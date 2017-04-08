var config = {
  corpus: {
    url: process.env.CORPUS_URL,
    databases: {
      users: process.env.DBNAME,
    },
  }
};

console.log("Loaded test config");
module.exports = config;
