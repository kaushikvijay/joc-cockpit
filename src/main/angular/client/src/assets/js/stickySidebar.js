!function (a) {
    a.fn.stickySidebar = function (b) {
        var c = a.extend({subHeaderSelector: ".sub-header", sidebarTopMargin: 20}, b), d = function () {
            let b = a(this), y = $('.scroll-y').position().top + 20;
            if ($('.sub-header-2').height()) {
                y = y - 20;
            }
            y = y - $(window).scrollTop();
            if (y < 1) {
                y = 8;
            }
            b.addClass("sticky").css("top", y);
        }, x = function () {
            let b = a(this);
            b.addClass("sticky").css("top", c.sidebarTopMargin);
        };
        return this.each(function () {
            a(window).on("scroll", a.proxy(d, this)), a(window).on("resize", a.proxy(d, this)), a.proxy(x, this)()
        })
    }
}(jQuery);
