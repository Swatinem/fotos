var $ = require('jquery');
var page = require('page');
var Throbber = require('throbber');
var Preloader = require('preloader');
var Overlay = require('./overlay');
var Preview = require('./preview');

var delay = 250;

var html = document.querySelector('html');
var container = document.querySelector('.screens');
var throbberElem = $('#throbber');
var throbber = new Throbber({size: 200, fade: 250, strokewidth: 5, lines: 20}).appendTo(throbberElem.get(0));
var overlay = new Overlay();

// automatic sizing…
var picWidth = 120 + 2 * 10;
var containerPadding = 2 * 70;
function resize() {
	// + 1 for rounding errors on transitions...
	var width = Math.floor((html.offsetWidth - containerPadding) / picWidth) * picWidth + 1;
	container.style.width = width + 'px';
}
resize();
$(window).on('resize', resize);

page('*', function (ctx, next) {

var dir = ctx.path.substr(1).replace('/', '-');

$.getJSON('/images' + (dir ? '-' : '') + dir + '.json', function (json) {

// TODO: this needs to be better
$('<ul/>').html(json.directories.map(function (dir) {
	return '<li><a href="/' + encodeURIComponent(dir) + '">' + dir + '</a></li>';
}).join('')).insertBefore('.screens');

var fotos = json.images;

// TODO: need better async support
var currentFoto;

fotos.forEach(function (foto) {
	foto.preview = new Preview(foto);
	foto.preview.on('click', function () {
		currentFoto = foto;
		var ready = false;
		preload(foto, showImage);
		function showImage() {
			if (!ready) {
				ready = true;
				return;
			}
			throbberElem.hide();
			throbber.stop();
			overlay.open(foto);
		}
		setTimeout(function () {
			throbberElem.show();
			throbber.start();
			showImage();
		}, delay);
	});
});


function neighbors(foto) {
	var i = fotos.indexOf(foto);
	var ret = {};
	if (i > 0)
		ret.previous = fotos[i - 1];
	if (i < fotos.length - 1)
		ret.next = fotos[i + 1];
	return ret;
}

// register prev/next handlers
overlay.on('click', function () {
	next();
}).on('close', function () {
	setTimeout(function () {
		currentFoto.preview.close();
	}, delay);
});

function values(obj) {
	var ret = [];
	Object.keys(obj).forEach(function (key) {
		ret.push(obj[key]);
	});
	return ret;
}
function next() {
	var n = neighbors(currentFoto);
	if (!n.next)
		return;
	currentFoto.preview.close();
	overlay.next(currentFoto = n.next);
	currentFoto.preview.open();
	preload(values(neighbors(currentFoto)));
}
function previous() {
	var n = neighbors(currentFoto);
	if (!n.previous)
		return;
	currentFoto.preview.close();
	overlay.previous(currentFoto = n.previous);
	currentFoto.preview.open();
	preload(values(neighbors(currentFoto)));
}

$(document).on('keypress', function (ev) {
	if (!overlay.isOpen())
		return true; // default
	switch (ev.charCode || ev.keyCode) {
		case KeyEvent.DOM_VK_SPACE:
		case KeyEvent.DOM_VK_RIGHT:
		case KeyEvent.DOM_VK_DOWN:
			next();
			return false;
		case KeyEvent.DOM_VK_LEFT:
		case KeyEvent.DOM_VK_UP:
			previous();
			return false;
		case KeyEvent.DOM_VK_ESCAPE:
			overlay.close();
			return false;
		default:
			return true; // default
	}
});

function preload(fotos, cb) {
	var preloader = new Preloader();
	if (!(fotos instanceof Array))
		fotos = [fotos];
	fotos.forEach(function (foto) {
		preloader.add('/raw/' + foto.image);
	});
	preloader.end(cb || function () {});
}

}); // getJSON

}); // page

page({click: false}); // FIXME: make this work with click: true :-)
