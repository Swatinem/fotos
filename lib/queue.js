module.exports = Queue;

function Queue(concurrency) {
	this.concurrency = concurrency || 5;
	this.running = 0;
	this.queue = [];
}

Queue.prototype.start = function Queue_start() {
	var self = this;
	function done() {
		self.running--;
		self.start();
	}
	while (this.queue.length && this.running < this.concurrency) {
		this.queue.shift()(done);
		this.running++;
	}
};

Queue.prototype.push = function Queue_push(fn) {
	this.queue.push(fn);
	this.start();
};
