// FANCY FIELDS
$(document).ready(function() {
    fancyfyFields();
});

// MOBILE THINGS
$('#mobile-menu-toggle').click(function() {
  	$('#mobile-menu').slideToggle();
  	$(this).toggleClass('open');
});

$('#mobile-breadcrumb-toggle').click(function() {
  $('.breadcrumb-inner ul').slideToggle();
  $(this).children('span').toggle();
  $(this).children('i').toggleClass('fa-chevron-down fa-chevron-up');
});

$(window).resize(function() {
  if ($(window).width() >= 800) {
    $('.breadcrumb-inner ul').show();
  }
  else {
    $('.breadcrumb-inner ul').hide();
    $('#mobile-breadcrumb-toggle span').show();
    $('#mobile-breadcrumb-toggle i').addClass('fa-chevron-down').removeClass('fa-chevron-up');
  }
});

// CART
$('#add-to-cart').click(function() {
    $('#cart, #cart-icon').show();
    $('#product-details .column-12').removeClass('column-12').addClass('column-8');
    if ($(window).width() <= 740) {
        $('html, body').animate({
            scrollTop: $("#cart").offset().top - 20
        }, 500);
    }
});
$('#remove-from-cart').click(function() {
    $('#cart, #cart-icon').hide();
    $('#product-details .column-8').removeClass('column-8').addClass('column-12');
});
$('.cart-table-toggle').click(function() {
    $(this).children('i').toggleClass('fa-chevron-down fa-chevron-up');
    $(this).next('.cart-items').toggle();
});

// SIGNUP
// Send code to a different email address.
$('#verify-different-email').click(function() {
    $('#enter-different-email').show();
    $(this).hide();
});
$('#send-different-email').click(function() {
    $('#enter-different-email').hide();
    $('#sent-different-email').show();
});