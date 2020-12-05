$(document).ready(() => {
    bindScroll();
});

function bindScroll() {
    $(window).on("scroll", function () {
    const elements = $(".animate");
    for (let idx = 0; idx < elements.length; idx++) {
        let element = elements[idx];
        if (!element.hasAttribute("data-animate"))
        return

        const scrollPos = $(window).height() + $(window).scrollTop();
        const elementTopPos = $(element).offset().top;
        const elementHeight = $(element).height();

        if (scrollPos > elementTopPos + .5 * elementHeight) {
            const animType = $(element).attr("data-animate");
            $(element).addClass(animType);
        }
    }
    });
}