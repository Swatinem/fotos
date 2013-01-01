module.exports = Preview;

var $ = require('jquery');
var Emitter = require('emitter');

var template = $('.screens .template');
var html = document.querySelector('html');

function Preview(foto) {
	Emitter.call(this);
	this.foto = foto;
	this.elem = $('.container', template.clone().removeClass('template').insertBefore(template));
	$('.img', this.elem).css('background-image', 'url(/thumb/280x210/' + encodeURIComponent(foto.image) + ')');
	this.elem.on('click', function () {
		this.open();
		this.emit('click');
	}.bind(this));
}

Preview.prototype = Object.create(Emitter.prototype);
Preview.prototype.open = function () {
	var offset = this.elem.get(0).parentNode;
	this.elem.css({
		top: (html.scrollTop - offset.offsetTop) + 'px',
		left: (html.scrollLeft - offset.offsetLeft) + 'px',
		width: html.offsetWidth + 'px',
		height: html.offsetHeight + 'px'});
	this.elem.addClass('fullscreen');
}
Preview.prototype.close = function () {
	this.elem.removeClass('fullscreen');
	this.elem.attr('style', '');
}
