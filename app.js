
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

var app = express();

var publicdir = path.join(__dirname, 'public');

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('trust proxy', true);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	//app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(require('stylus').middleware(publicdir));
	app.use(express.static(publicdir));
});

app.configure('development', function(){
	app.use(express.logger('dev'));
	app.use(express.errorHandler());
});

app.get('/', function (req, res, next) {
	fs.readdir(__dirname + '/public/raw', function (err, files) {
		files.sort();
		res.render('index', {
			fotos: files.map(function (foto) {
				return {image: '/raw/' + foto};
			})
		});
	});
});

if (!module.parent) {
	var port = app.get('port');
	var server = http.createServer(app).listen(port, '127.0.0.1', function () {
		console.log("Express server listening on port %d", port);
	});
}
