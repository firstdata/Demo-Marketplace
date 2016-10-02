function sticky_relocate() {
  var window_top = $(window).scrollTop();
  var div_top = $('#breadcrumb-anchor').offset().top;
  if (window_top > div_top) {
      $('#breadcrumb').addClass('stick');
      $('#breadcrumb-anchor').height($('#breadcrumb').outerHeight());
  } else {
      $('#breadcrumb').removeClass('stick');
      $('#breadcrumb-anchor').height(0);
  }
}

$(function() {
  $(window).scroll(sticky_relocate);
  sticky_relocate();
});
