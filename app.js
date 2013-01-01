
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , Directory = require('./lib/directory')
  , Image = require('./lib/image');

var app = express();

var publicdir = path.join(__dirname, 'public');

var options = {
	raw: process.env.RAW || path.join(__dirname, 'public', 'raw'),
	cache: process.env.CACHE || path.join(__dirname, 'public', 'cache')
};

var dir = new Directory('', options);

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
	app.use(require('stylus').middleware(publicdir));
	app.use(express.static(publicdir));
	app.use(express.static(options.cache));
	app.use(app.router);
});

app.get(/^\/raw\/(.*)$/, function (req, res, next) {
	res.sendfile(path.join(options.raw, req.params[0]));
});
app.get(/^\/thumb\/(\d+x?\d+?)\/(.*)/, function (req, res, next) {
	Image.ensureThumbnail(options.raw, options.cache, req.params[0], req.params[1], function (err, img) {
		if (err)
			return next(err);
		res.sendfile(img);
	});
});

app.get('/*', function (req, res, next) {
	fs.exists(path.join(options.raw, req.params[0]), function (exists) {
		if (exists)
			res.render('index');
		else
			next();
	});
});

if (!module.parent) {
	var port = app.get('port');
	var server = http.createServer(app).listen(port, '127.0.0.1', function () {
		console.log("Express server listening on port %d", port);
	});
}
