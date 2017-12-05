$(document).ready(function() {
	var base = 'https://www.facebook.com/search/groups/?q=';
	$('body').on('click', 'button', function() {
		chrome.tabs.create({
			url: base + $('input').val()
		});
		return false;
	});
});