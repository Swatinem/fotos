var Emitter = require('events').EventEmitter;
var fs = require('fs');
var path = require('path');
var Batch = require('batch');
var Image = require('./image');
var read = fs.readFileSync;
var debug = require('debug')('fotos.js:directory');
var write = fs.writeFileSync;

module.exports = Directory;

function Directory(dir, options) {
	this.options = options;
	this.path = dir;
	this.contents = {directories: [], images: []};
	this.cachefile = this.path.replace('/', '-');
	this.cachefile = path.join(this.options.cache, 'images' + (this.cachefile ? '-' : '') + this.cachefile + '.json');

	try {
		this.contents = JSON.parse(read(this.cachefile, 'utf8'));
	} catch(e) {}
	this.byName = {};
	// resolve the cache into real objects and populate `byName`
	this.contents.directories = this.contents.directories.map(function (dir) {
		dir = new Directory(dir, options);
		this.byName[dir.path] = dir;
		return dir;
	}.bind(this));
	this.contents.images = this.contents.images.map(function (image) {
		image = new Image(image, options);
		image.on('change', this.changed.bind(this));
		this.byName[image.image] = image;
		return image;
	}.bind(this));

	var handleNew = function handleNew(file) {
		debug('added ' + file);
		var stat = fs.statSync(path.join(options.raw, file));
		if (stat.isDirectory()) {
			var dir = new Directory(file, options);
			this.byName[file] = dir;
			this.contents.directories.push(dir);
		} else { // image
			var image = new Image(file, options);
			this.byName[file] = image;
			this.contents.images.push(image);
			image.on('change', this.changed.bind(this));
		}
	}.bind(this);

	var files = fs.readdirSync(path.join(options.raw, this.path));
	files.forEach(function (file) {
		file = path.join(this.path, file);
		if (file in this.byName)
			return; // already cached
		handleNew(file);
	}.bind(this));

	this.watcher = fs.watch(path.join(options.raw, this.path), function (event, file) {
		if (!file) return;
		file = path.join(this.path, file);
		var deleted = !fs.existsSync(path.join(options.raw, file));
		if (file in this.byName) {
			var thing = this.byName[file];
			if (deleted) {
				debug('deleted ' + file);
				var arr = thing.path ? this.contents.directories : this.contents.images;
				var i = arr.indexOf(thing);
				arr.splice(i, 1);
				delete this.byName[file];
				if (thing.delete)
					thing.delete();
			} else {
				debug('modified ' + file);
				// file modified: if its an image, refresh it…
				if (thing.refresh)
					thing.refresh(); // this emits 'change' which we already subscribe
			}
		} else {
			// added a new image or directory
			handleNew(file);
		}
		this.changed();
	}.bind(this));

	this.changed(); // rewrite when reading the directory

	return this;
}

Directory.prototype.toJSON = function Directory_toJSON() {
	return this.path;
};

Directory.prototype.delete = function Directory_delete() {
	this.watcher.close();
	try {
		fs.unlinkSync(this.cachefile);
	} catch (e) {}
};

Directory.prototype.changed = function Directory_changed() {
	this.contents.directories.sort(function (a, b) {
		return a.path == b.path ? 0 : (a.path < b.path) ? -1 : 1;
	});
	this.contents.images.sort(function (a, b) {
		a = path.basename(a.image);
		b = path.basename(b.image);
		return a == b ? 0 : (a < b) ? -1 : 1;
	});
	// TODO: sort…
	write(this.cachefile, JSON.stringify(this.contents));
};
