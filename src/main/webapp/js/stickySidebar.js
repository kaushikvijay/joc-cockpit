!function(i){i.fn.stickySidebar=function(s){var o=i.extend({subHeaderSelector:".sub-header",sidebarTopMargin:20},s),t=function(){if($(".scroll-y").position()){let s=i(this),o=$(".scroll-y").position().top+20;$(".sub-header-2").height()&&(o-=20),(o-=$(window).scrollTop())<1&&(o=8),s.addClass("sticky").css("top",o)}},n=function(){i(this).addClass("sticky").css("top",o.sidebarTopMargin)};return this.each(function(){i(window).on("scroll",i.proxy(t,this)),i(window).on("resize",i.proxy(t,this)),i.proxy(n,this)()})}}(jQuery);
