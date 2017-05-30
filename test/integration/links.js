var config = require("config");
var crawl = require("crawl");
var fs = require("fs");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var options = {
  maxConcurrency: 3,
  interval: 500,
  scanSubdomains: false,
  respectRobotsTxt: false,
  // maxDepth: 2,
  supportedMimeTypes: [
    /^text\/html/i
  ],
  discoverRegex: [
      /\s(?:href)\s?=\s?(["']).*?\1/ig,
      /\s(?:href)\s?=\s?[^"'\s][^\s>]+/ig,
      /\s?url\((["']).*?\1\)/ig,
      /\s?url\([^"'].*?\)/ig,

      // This could easily duplicate matches above, e.g. in the case of
      // href="http://example.com"
      /https?:\/\/[^?\s><'"]+/ig,

      // function(string) {
      //   console.log(string);
      //   if (/(\.js|\.css)/.test(string)){
      //     return [];
      //   }
      //   return [string];
      // },
    ]
    // discoverRegex: [/.*css$/]
    // discoverRegex: [/^(?:(?!js))$/]
    // discoverRegex: [/\.^(?!gif|jpg|jpeg|tiff|png|js|css)$/i]
};

crawl.crawl(config.public.url, options, function(err, pages) {
  if (err) {
    console.error("An error occured", err);
    return;
  }
  if (!pages || !pages.length) {
    console.log("Your crawl resulted in 0 pages, you might need to remove the public/robots.txt");
  }

  var cleaned = pages.filter(function(page) {
    // exclude .js or .css files
    return page.status >= 400 || !/\.(js|css|png|jpg|ico|m4v)$/.test(page.url);
  }).map(function(page) {
    if (!page.links) {
      return page;
    }
    page.links = page.links.filter(function(link) {
      // exclude links to  .js or .css or image files
      // exclude links which are outside the domain
      return !/\.(js|css|png|jpg|ico|m4v)$/.test(link) && link.indexOf(config.public.url) > -1;
      // return true;
    });
    return page;
  });

  var errors = pages.filter(function(page) {
    return page.status >= 400;
  });

  fs.writeFile("sitemap.json", JSON.stringify(cleaned, null, 2), "utf8", function(err, data) {
    if (err) {
      return console.log(JSON.stringify(cleaned));
    }
    console.log("saved as sitemap.json", data);
  });

  fs.writeFile("site-errors.json", JSON.stringify(errors, null, 2), "utf8", function(err) {
    if (err) {
      return console.log(JSON.stringify(errors));
    }
    console.log("saved as site-errors.json", errors);
    process.exit(errors.length);
  });
});
