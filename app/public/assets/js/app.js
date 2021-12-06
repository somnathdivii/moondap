$(document).ready(function () {

  // floting notification closing by close icon
  $(".floating-notification > a").click(function(){
    $(".floating-notification").fadeOut();
  });

  // mobile view right panel opening
  $(".floating-menu li a").click(function(){
    $(".right-menu-screen").addClass("active");
  });

  // mobile view right panel closing
  $(".right-menu-screen .top-close a").click(function(){
    $(".right-menu-screen").removeClass("active");
  });

  if ($(window).width() < 768) {
    rightColumnHeightMobile()
  }
  else {
     rightColumnHeightDesktop()
  }

});

// window resize
$( window ).resize(function() {
  if ($(window).width() < 768) {
    rightColumnHeightMobile()
  }
  else {
     rightColumnHeightDesktop()
  }
});

// right column height desktop
function rightColumnHeightDesktop() {
  var totalColHeight = $(".right-menu-screen").height();
  var docColH = $(".right-menu-screen .top-box").outerHeight();
  // var docColF = $(".right-menu-screen .bottom-box").outerHeight();
  var docColBodyHeight = totalColHeight - docColH;
  $(".right-menu-screen .bottom-box").css('height' , docColBodyHeight - 10);
}

// right column height mobile
function rightColumnHeightMobile() {
  var totalColHeightM = $(window).height();
  // console.log(totalColHeightM);
  var docColHM = $(".right-menu-screen .top-close").outerHeight();
  var docColF = $(".right-menu-screen .top-box").outerHeight();
  var docColBodyHeightM = totalColHeightM - (docColHM + docColF);
  $(".right-menu-screen .bottom-box").css('height' , docColBodyHeightM);
}