var picWidth = 120 + 2 * 10;
var containerPadding = 2 * 70;
var delay = 250;

var overlay;

var currentFoto;

$(function () {
	var html = document.querySelector('html');
	overlay = $('#overlay');
	var container = document.querySelector('.screens');

	// create the foto elements:
	var template = $('.screens .template');
	fotos.forEach(function (foto) {
		var el = template.clone().removeClass('template');
		$('img', el).attr('src', foto.image);
		el.data('foto', foto);
		el.insertBefore(template);

		$('.container', el).on('click', function () {
			currentFoto = foto;
			var offset = this.parentNode;
			var el = $(this);
			el.addClass('fullscreen');
			el.css({
				top: (html.scrollTop - offset.offsetTop) + 'px',
				left: (html.scrollLeft - offset.offsetLeft) + 'px',
				width: html.offsetWidth + 'px',
				height: html.offsetHeight + 'px'});
			setTimeout(function () {
				populate($('.container:not(.next):not(.prev)', overlay), foto);
				overlay.addClass('show');
			}, delay);
		});
	});

	function resize() {
		// + 1 for rounding errors on transitions...
		var width = Math.floor((html.offsetWidth - containerPadding) / picWidth) * picWidth + 1;
		container.style.width = width + 'px';
	}
	resize();
	$(window).on('resize', resize);

	// register prev/next handlers
	overlay.on('click', function (ev) {
		if (ev.target.className === 'bottom-bar' || $(ev.target).parents('.bottom-bar').length)
			return false;
		showNext();
	});

	$(document).on('keypress', function (ev) {
		if (!overlay.hasClass('show'))
			return true; // default
		switch (ev.charCode || ev.keyCode) {
			case KeyEvent.DOM_VK_SPACE:
			case KeyEvent.DOM_VK_RIGHT:
			case KeyEvent.DOM_VK_DOWN:
				showNext();
				return false;
			case KeyEvent.DOM_VK_LEFT:
			case KeyEvent.DOM_VK_UP:
				showPrev();
				return false;
			case KeyEvent.DOM_VK_ESCAPE:
				closeOverlay();
				return false;
			default:
				return true; // default
		}
	});
});

function showPrev() {
	var i = fotos.indexOf(currentFoto);
	if (i === 0)
		return;
	var data = currentFoto = fotos[i - 1];

	var current = $('#overlay .container:not(.next):not(.prev)');
	var prev = $('#overlay .container.prev');
	populate(prev, data);
	prev.clone().insertBefore(prev);
	prev.removeClass('prev');
	current.addClass('next');
	setTimeout(function () {
		current.remove();
	}, delay);
}

function showNext() {
	var i = fotos.indexOf(currentFoto);
	if (i === fotos.length - 1)
		return;
	var data = currentFoto = fotos[i + 1];
	
	var current = $('#overlay .container:not(.next):not(.prev)');
	var next = $('#overlay .container.next');
	populate(next, data);
	next.clone().insertAfter(next);
	next.removeClass('next');
	current.addClass('prev');
	setTimeout(function () {
		current.remove();
	}, delay);
}

function closeOverlay() {
	overlay.removeClass('show');
	setTimeout(function () {
		var el = $('.container.fullscreen');
		el.removeClass('fullscreen');
		el.attr('style', '');
	}, delay);
}

function populate(container, data) {
	$('a.close', container).on('click', closeOverlay);
	$('img', container).attr('src', data.image);
	$('.original', container).attr({
		href: data.image,
		title: 'open original (' + data.width + '×' + data.height + ')'});
	$('.description', container).text(data.description);
	$('.date', container).text(data.date);
}
