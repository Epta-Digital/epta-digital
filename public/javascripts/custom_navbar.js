let navColorOpacity = 0;
let navColorScrollLimit = 100;
let navBarColor = "rgba(4, 4, 4, 0)";

$(document).ready(() => {
    if (!$(".navbar").hasClass("no-fade")) {
        $(".navbar").css("background-color", navBarColor);
        $(window).on("scroll", () => {
            navColorOpacity = $(document).scrollTop() / navColorScrollLimit;
            navBarColor = `rgba(4, 4, 4, ${navColorOpacity})`;
            $(".navbar").css("background-color", navBarColor);
        });
        $(window).scroll();
    }
});

$('.nav-trigger').click(function () {
    $(this).toggleClass('nav-active');
    $(".nav-collapse").fadeToggle();
  });

$(window).resize(() => {
if ($(window).width() > 992)
    $(".nav-collapse").css("display", "flex");
else if ($(".nav-trigger").hasClass("nav-active"))
    $(".nav-collapse").css("display", "block");
else
    $(".nav-collapse").css("display", "none");
});