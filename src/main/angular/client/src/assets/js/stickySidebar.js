!function (s) {
  s.fn.stickySidebar = function (i) {
    var e = s.extend({subHeaderSelector: ".sub-header", sidebarTopMargin: 20}, i), t = function () {
      var i = s(this), t = s(e.subHeaderSelector).height();
      95 != t ? 121 == t ? i.addClass("sticky").css("top", 216) : i.addClass("sticky").css("top", e.sidebarTopMargin) : i.addClass("sticky").css("top", 190)
    };
    return this.each(function () {
      s(window).on("scroll", s.proxy(t, this)), s(window).on("resize", s.proxy(t, this)), s.proxy(t, this)()
    })
  }
}(jQuery);