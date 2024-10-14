
$(window).scroll(function() {
	var height = $(window).scrollTop();
	if (height > 50) 
	{
		$('html').addClass('sticky');				
	} else {					
		$('html').removeClass('sticky');				
	}							
});	
$(document).ready(function() {				
	$(".scrollToTop").click(function(event) {
		event.preventDefault();					
		$("html, body").animate({ scrollTop: 0 }, "slow");
		return false;				
	});
	
	$('.navbar-toggle').click(function() {
		$("html").toggleClass("menu-show");
	});
	$('.header-menu-overlay').click(function() {
		$("html").removeClass("menu-show");
	});
	$('.sub-menu-toggle').click(function() {
		$(this).parent().toggleClass('submenu_active');
	});
	
});
$( function() {
	$( ".form-select" ).selectmenu();
});
