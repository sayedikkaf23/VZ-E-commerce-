jQuery( document ).ready(function() {
    jQuery('.navbar-toggle').click(function(){
        jQuery(' .navbar-toggle').toggleClass('active')
    });

    jQuery('.sidebar_icon').click(function(){
        jQuery('body').toggleClass('menu-hide')
    });
    
    jQuery('.addmore_toggle').click(function(){
        jQuery(' .fileupload_modal').toggleClass('addmore_upload')
    });

    jQuery(".password .pass-show").click(function(){
        jQuery(".password input").attr('type','text')
        jQuery(this).addClass('d-none')
        jQuery('.pass-hide').removeClass('d-none')
    });

    jQuery(".password .pass-hide").click(function(){
        jQuery(".password input").attr('type','password')
        jQuery(this).addClass('d-none')
        jQuery('.pass-show').removeClass('d-none')
    });
});
