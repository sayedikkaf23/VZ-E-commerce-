
$(document).ready(function(){
     jQuery(".form-select").select2();

    jQuery(".navbar-toggle").click(function(){
         jQuery("body").toggleClass("sidebar-collapsein");
    });
    jQuery(".sidebar-toggle").click(function(){
         jQuery("body").toggleClass("sidebar-collapsein");
    });
//     jQuery(".menu-sidebar").mouseenter(function(){
//          jQuery("body").addClass("sidebar-collapsein");
//     });
//     jQuery(".menu-sidebar").mouseleave(function(){
//          jQuery("body").removeClass("sidebar-collapsein");
//     });

     jQuery(".dark-light-toggle").click(function(){
          jQuery("body").toggleClass("dark-active");
     });


    
});

document.querySelectorAll('[data-bs-toggle="tooltip"]')
.forEach(tooltip => {
  new bootstrap.Tooltip(tooltip)
})