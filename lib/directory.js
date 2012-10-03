var Emitter = require("events").EventEmitter;
var fs = require('fs');
var Batch = require('batch');
var Image = require('./image');

module.exports = Directory;

function Directory(path) {
	Emitter.call(this);
	this.path = path;
	this.contents = {subdirectories: [], images: []};
	this.done = false;
	this.refresh();
}

Directory.prototype = Object.create(Emitter.prototype);

Directory.prototype.getContents = function Directory_getContents(fn) {
	if (!this.done)
		this.on('done', fn);
	fn(undefined, this.contents);
};

Directory.prototype.refresh = function Directory_refresh() {
	var self = this;
	fs.readdir(self.path, function (err, files) {
		files.sort();
		var batch = new Batch();
		files.forEach(function (file) {
			batch.push(function (done) {
				new Image(self.path, file, done);
			});
		});
		batch.end(function (err, images) {
			if (err)
				return self.emit('done', err);
			self.contents.images = images;
			self.done = true;
			self.emit('done', undefined, self.contents);
		});
	});
}
