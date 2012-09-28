
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , im = require('imagemagick')
  , mkdirp = require('mkdirp')
  , Batch = require('batch');

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

app.get('/', function (req, res, next) {
	fs.readdir(rawdir, function (err, files) {
		files.sort();
		var batch = new Batch();
		files.forEach(function (file) {
			batch.push(function (done) {
				// disable metadata reading for now, it completely kills the server
				// by spawning A LOT of child processes in parallel
				//im.readMetadata(path.join(rawdir, file), function(err, metadata){
				//	if (err)
				//		return done(err);
				//	var exif = metadata.exif;
				//	var date = exif.dateTimeOriginal;
				var exif = {};
				var date = undefined;
					done(undefined, {
						image: file,
						date: date,
						width: exif.exifImageWidth,
						height: exif.exifImageLength,
						description: exif.imageDescription
					});
				//});
			});
		});

		batch.end(function (err, images) {
			res.render('index', {
				fotos: images
			});
		});
	});
});
app.get('/raw/:img', function (req, res, next) {
	res.sendfile(path.join(rawdir, req.params.img));
});
app.get('/thumb/:dimensions(\\d+x?\\d+?)/:img', function (req, res, next) {
	var srcPath = path.join(rawdir, req.params.img);
	var dstPath = path.join(thumbdir, req.params.dimensions, req.params.img);
	fs.exists(dstPath, function (exists) {
		if (exists)
			return res.sendfile(dstPath);

		// make sure that the directory exists...
		mkdirp(path.join(thumbdir, req.params.dimensions), 0755, function (err) {
			if (err)
				return next(err);
			var dimensions = req.params.dimensions.split('x');
			im.resize({
				srcPath: srcPath,
				dstPath: dstPath,
				width: dimensions[0],
				height: dimensions[1] || 0
			}, function (err, stdout, stderr) {
				if (err)
					return next(err);
				res.sendfile(dstPath);
			});
		});
	});
});

if (!module.parent) {
	var port = app.get('port');
	var server = http.createServer(app).listen(port, '127.0.0.1', function () {
		console.log("Express server listening on port %d", port);
	});
}
