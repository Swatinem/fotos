module.exports = Overlay;

var $ = require('jquery');
var moment = require('moment');
var Emitter = require('emitter');

function Overlay(options) {
	Emitter.call(this);
	options = options || {};
	this.elem = $(options.elem || '#overlay');
	this.delay = options.delay || 250;
	this.elem.on('click', function (ev) {
		if (ev.target.className === 'bottom-bar' || $(ev.target).parents('.bottom-bar').length)
			return false;
		this.emit('click');
	}.bind(this));
}

Overlay.prototype = Object.create(Emitter.prototype);
Overlay.prototype.isOpen = function () {
	return this.elem.hasClass('show');
};
Overlay.prototype.close = function () {
	this.elem.removeClass('show');
	this.emit('close');
};
Overlay.prototype.open = function (foto) {
	this.populate($('.container:not(.next):not(.prev)', this.elem), foto);
	this.elem.addClass('show');
};
Overlay.prototype.next = function (foto) {
	var current = $('#overlay .container:not(.next):not(.prev)');
	var next = $('#overlay .container.next');
	this.populate(next, foto);
	next.clone().insertAfter(next);
	next.removeClass('next');
	current.addClass('prev');
	setTimeout(function () {
		current.remove();
	}, this.delay);
};
Overlay.prototype.previous = function (foto) {
	var current = $('#overlay .container:not(.next):not(.prev)');
	var prev = $('#overlay .container.prev');
	this.populate(prev, foto);
	prev.clone().insertBefore(prev);
	prev.removeClass('prev');
	current.addClass('next');
	setTimeout(function () {
		current.remove();
	}, this.delay);
};
Overlay.prototype.populate = function (container, foto) {
	$('a.close', container).on('click', function () { this.close(); }.bind(this));
	$('.img', container).css('background-image', 'url(/raw/' + encodeURIComponent(foto.image) + ')');
	$('.original', container).attr({
		href: '/raw/' + foto.image,
		title: 'open original (' + foto.width + '×' + foto.height + ')'});
	$('.description', container).text(foto.description);
	$('.date', container).text(moment.utc(foto.date).format('DD.MM.YYYY HH:mm:ss'));
};

