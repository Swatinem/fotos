var Emitter = require("events").EventEmitter;
var fs = require('fs');
var path = require('path');
var im = require('imagemagick');
var mkdirp = require('mkdirp');

module.exports = Image;

//Image.rawdir = '';
//Image.thumbdir = '';

function Image(dir, file, cb) {
	var self = this;
	self.image = file;
	
	im.readMetadata(path.join(dir, file), function(err, metadata){
		if (err)
			return cb(err);
		var exif = metadata.exif;
		self.date = exif.dateTimeOriginal;
		self.width = exif.exifImageWidth;
		self.height = exif.exifImageLength;
		self.description = exif.imageDescription;
		cb(undefined, self);
	});
}

Image.ensureThumbnail = function (dir, thumbdir, dimensions, file, cb) {
	var srcPath = path.join(dir, file);
	var dstPath = path.join(thumbdir, dimensions, file);
	fs.exists(dstPath, function (exists) {
		if (exists)
			return cb(undefined, dstPath);

		// make sure that the directory exists...
		mkdirp(path.join(thumbdir, dimensions), 0755, function (err) {
			if (err)
				return cb(err);
			dimensions = dimensions.split('x');
			im.resize({
				srcPath: srcPath,
				dstPath: dstPath,
				width: dimensions[0],
				height: dimensions[1] || 0
			}, function (err, stdout, stderr) {
				if (err)
					return cb(err);
				cb(undefined, dstPath);
			});
		});
	});
};
