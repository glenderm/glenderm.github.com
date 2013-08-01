/**
	Glenderm's Website
	(c) 2011 Adam Schwartz
	(http://polymath.mit.edu)
*/	 

/**
	Utils
*/
var Utils = {
	log: function() {
		if (!location.href.match('localhost')) { return false; }
		for (var i = 0; i < arguments.length; i++) {
			try { console.log(arguments[i]); } catch (e) {}
		}
	},
	parseDec: function(d) {
		return parseInt(d, 10);
	},
	toHumanTime: function(strInMillisecs, sentenceForm) {
		if (!strInMillisecs) { return; }
		var secs = parseInt(parseInt(strInMillisecs / 1000, 10) % 60, 10),
			mins = parseInt(strInMillisecs / (1000 * 60), 10) % 60,
			hrrs = parseInt(strInMillisecs / (1000 * 60 * 60), 10) % 24,
			days = parseInt(strInMillisecs / (1000 * 60 * 60 * 24), 10);
		if (!sentenceForm) {
			if (secs >= 0 && secs <= 9) { secs = '0' + secs; }
			return ((hrrs > 0 ? hrrs + ':' : '') + mins + ':' + secs);
		} else {
			return ((days > 0 ? days + ' days, ' : '') + (hrrs > 0 ? hrrs + ' hours, ' : '') + mins + ' minutes' + (hrrs > 0 ? ',' : '') + ' and ' + secs + ' seconds'); //TODO - fix for plural
		}
	}
};

/**
	Main - Controls main ui, page navigation, ajax, etc.
*/
$(function(){
	var lastHash = false,
		quotes = [],
		quoteOn = false;

	$('#status a').live('click', function(){
		loadPage($(this).attr('href'));
	});

	function loadPage(hash) {
		lastHash = hash;
		var menu = {'home': 0, 'info': 1, 'doctors': 2, 'services': 3, 'contact': 4},
			page = (getPage(hash) || 'home').toLowerCase(),
			subpage = (getSubPage(hash) || 'none').toLowerCase(),
			pagestring = '';
		quoteOn = (page == 'home');
		$('#menu li a').removeClass('current');
		$('#menu li:eq(' + menu[page] + ') a').addClass('current');
		pagestring = subpage === 'none' ? 'www/content/' + page + '.html' : 'www/content/' + page + '/' + subpage + '.html';
		$.ajax({
			url: pagestring,
			dataType: 'html',
			cache: true,
			success: function(data) {
				var html = data.replace(/<script(.|\s)*?\/script>/gi, ''); //just to be safe
				html = html.replace(/<base href(.|\s)*?\/>/gi, ''); //not necessary but makes local debugging easier
				if ($('#body').hasClass('first')) {
					$('#body')
						.removeClass('first')
						.html(html);
					fixThingsAfterAjax();
				} else {
					$('#body').fadeOut('normal', function(){
						$('#body').html(html);
						$('#body').fadeIn('normal');
						fixThingsAfterAjax();
					});
				}
			},
			error: function() {
				location.href = location.href.split('#')[0];
			}
		});
	}

	function getPage(hash) {
		var page = false;
		if (hash && hash.length > 2) {
			page = hash.substr(2).split('/')[0];
		}
		return !/[^A-Za-z\d ]/.test(page) ? page : false;
	}

	function getSubPage(hash) {
		var subpage = false, hashparts;
		if (hash && hash.length > 2) {
			hashparts = hash.substr(2).split('/');
			if (hashparts.length > 1) {
				subpage = hashparts[1];
			}
		}
		return !/[^A-Za-z\d ]/.test(subpage) ? subpage : false;
	}

	function fixHashLinks() {
		$('#menu a:not(".hash_link_processed")').each(function(){
			var a = $(this);
			a.addClass('hash_link_processed');
			if (a.attr('href').substr(0, 2) == '#/') {
				a.click(function(){
					loadPage(a.attr('href'));
				});
			}
		});
	}

	function fixThingsAfterAjax() {
		fixHashLinks();
		$('a.fancy-image').fancybox();
	}

	function checkForHash() {
		var hash = location.hash.toLowerCase() || '#/home';
		if (hash != lastHash) {
			loadPage(hash);
		}
		setTimeout(checkForHash, 200);
	}

	checkForHash();
});