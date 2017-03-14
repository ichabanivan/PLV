import $ from 'jquery';
import jQuery from 'jquery';
// export for others scripts to use
window.$ = $;
window.jQuery = jQuery;

$('.buttons__edit').on('click', function () {
  $('.panel').css('display', 'flex').addClass("fadeInDown animated");
  $('.top').addClass("fadeOut animated");
  $('.save').css('display', 'flex').addClass("fadeInUp animated");
  $('.scan').addClass("fadeOut animated");
});

$('.save__cancel').on('click', function () {
  $('.panel').addClass("slideOutUp animated");
  $('.save').addClass("slideOutDown animated");
  $('.top').removeClass('fadeIn fadeOut').addClass("fadeIn");
  $('.scan').removeClass('fadeIn fadeOut').addClass("fadeIn");

  setTimeout(function () {
    $('.top').removeClass('fadeInDown animated fadeIn');
    $('.scan').removeClass('fadeInUp animated fadeIn');
    $('.panel').removeClass('slideOutUp fadeInDown animated').css('display', 'none');
    $('.save').removeClass('slideOutDown fadeInUp animated').css('display', 'none');
  }, 750);
});