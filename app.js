
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , Directory = require('./lib/directory')
  , Image = require('./lib/image');

var app = express();

var publicdir = path.join(__dirname, 'public');
var rawdir = process.env.RAW || path.join(__dirname, 'public', 'raw');
var thumbdir = process.env.THUMB || path.join(__dirname, 'public', 'thumb');

app.configure('development', function(){
	app.use(express.logger('dev'));
	app.use(express.errorHandler());
});

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

var dir = new Directory(rawdir);

app.get('/', function (req, res, next) {
	dir.getContents(function (err, contents) {
		if (err)
			next(err);
		res.render('index', {
			fotos: contents.images
		});
	});
});
app.get('/raw/:img', function (req, res, next) {
	setTimeout(function () {
		res.sendfile(path.join(rawdir, req.params.img));
	}, 2000);
});
app.get('/thumb/:dimensions(\\d+x?\\d+?)/:img', function (req, res, next) {
	Image.ensureThumbnail(rawdir, thumbdir, req.params.dimensions, req.params.img, function (err, img) {
		if (err)
			return next(err);
		res.sendfile(img);
	});
});

if (!module.parent) {
	var port = app.get('port');
	var server = http.createServer(app).listen(port, '127.0.0.1', function () {
		console.log("Express server listening on port %d", port);
	});
}
