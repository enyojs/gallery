var fs = require("fs"),
	path = require("path"),
	express = require("express");

var port = 9000;

var docroot = path.resolve(__dirname, "../../../../../");

var server = express.createServer(
	express.errorHandler({showStack: true, dumpExceptions: true})
);


server.use(express.bodyParser());
server.use(express.static(docroot));
server.post("/", function(req, res) {
	var gallery = req.body;
	gallery = JSON.stringify(gallery, null, 4);
	fs.writeFile(path.join(__dirname, "../gallery_manifest.json"), gallery, function(err) {
		if (err) {
			res.send(String(err));
		}
		res.send("ok");
	});
});

server.listen(port);
var loc = __dirname.replace(docroot,"").replace(/\\/g,"/");
console.log("Editor at http://localhost:" + port + loc + "/index.html");
