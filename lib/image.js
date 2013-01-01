var Emitter = require("events").EventEmitter;
var fs = require('fs');
var path = require('path');
var im = require('imagemagick');
var mkdirp = require('mkdirp');

module.exports = Image;

function Image(cache, options) {
	Emitter.call(this);
	this.options = options;
	if (typeof cache == 'object') {
		this.image = cache.image;
		this.date = cache.date;
		this.width = cache.width;
		this.height = cache.height;
		this.description = cache.description;
		this.modified = cache.modified;
	} else { // typeof == 'string'
		this.image = cache;
	}
	var file = path.join(options.raw, this.image);
	var stat = fs.statSync(file);
	if (!this.modified || this.modified < stat.mtime)
		this.refresh();

	// TODO: this.on('change', this.clearThumbs.bind(this));
}

Image.prototype = Object.create(Emitter.prototype);

Image.prototype.toJSON = function Image_toJSON() {
	return {
		image: this.image,
		date: this.date,
		width: this.width,
		height: this.height,
		description: this.description,
		modified: this.modified
	};
};
Image.prototype.refresh = function Image_refresh() {
	var file = path.join(this.options.raw, this.image);
	var stat = fs.statSync(file);
	im.readMetadata(file, function (err, metadata) {
		if (err)
			return; // FIXME: handle this better!
		var exif = metadata.exif;
		this.date = exif.dateTimeOriginal;
		this.width = exif.exifImageWidth;
		this.height = exif.exifImageLength;
		this.description = exif.imageDescription;
		this.modified = stat.mtime;
		this.emit('change');
	}.bind(this));
};

Image.ensureThumbnail = function (dir, thumbdir, dimensions, file, cb) {
	var srcPath = path.join(dir, file);
	var dstPath = path.join(thumbdir, dimensions, file);
	fs.exists(dstPath, function (exists) {
		if (exists)
			return cb(undefined, dstPath);

		// make sure that the directory exists…
		mkdirp(path.join(thumbdir, dimensions, path.dirname(file)), 0755, function (err) {
			if (err)
				return cb(err);
			dimensions = dimensions.split('x');
			console.log(srcPath, dstPath);
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
