exports.apphttpsdomain = "https://localhost:3183";
exports.port = "3183";
exports.httpsOptions = {
    key: fs.readFileSync('ifield_debug.key'),
    cert: fs.readFileSync('ifield_debug.crt')
};
