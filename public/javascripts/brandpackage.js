const PKG_PRICES = {
    basicPkg: ["&#8358;80,000", "&#8358;140,000", "&#8358;230,000"],
    standardPkg: ["&#8358;230,000", "&#8358;285,000", "&#8358;375,000"],
    premiumPkg: ["&#8358;430,000", "&#8358;535,000", "&#8358;645,000"]
};

let cards = $("#brandpkg .card");
let cardImgs = $("#brandpkg .card-img-top");

function setCardImgPos() {
    for (let idx = 0; idx < cardImgs.length; idx++) {
        let cardImgRect = cardImgs[idx].getBoundingClientRect();
        let cardRect = cards[idx].getBoundingClientRect();
        let yOffset = cardImgRect.height * .1;
        let yDiff = cardRect.y - cardImgRect.y - yOffset;
        let topStr = cardImgs[idx].style.top;
        topStr = topStr.slice(0, topStr.length - 2);
        let topInt = Number(topStr);
        cardImgs[idx].style.top = topInt + yDiff + "px";
    }
}

function setPkgPrice() {
    let pkgName = this.getAttribute("name");
    let pkgSelected = this.value;
    $("#" + pkgName).html(PKG_PRICES[pkgName][pkgSelected]);
}

$(window).resize(setCardImgPos);
$('#brandpkg').on('shown.bs.modal', setCardImgPos);
$('#brandpkg').on('change', 'select', setPkgPrice);