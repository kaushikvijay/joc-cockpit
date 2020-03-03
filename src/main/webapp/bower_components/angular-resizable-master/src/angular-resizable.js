angular.module("angularResizable",[]).directive("resizable",function(){var e;return{restrict:"AE",scope:{rDirections:"=",rCenteredX:"=",rCenteredY:"=",rWidth:"=",rHeight:"=",rFlex:"=",rGrabber:"@",rDisabled:"@",rNoThrottle:"="},link:function(t,r,n){var i="flexBasis"in document.documentElement.style?"flexBasis":"webkitFlexBasis"in document.documentElement.style?"webkitFlexBasis":"msFlexPreferredSize"in document.documentElement.style?"msFlexPreferredSize":"flexBasis";t.$watch("rWidth",function(e){r[0].style[t.rFlex?i:"width"]=t.rWidth+"px"}),t.$watch("rHeight",function(e){r[0].style[t.rFlex?i:"height"]=t.rHeight+"px"}),r.addClass("resizable");var o,s,a,l,u,d=window.getComputedStyle(r[0],null),c=t.rDirections||["right"],h=t.rCenteredX?2:1,m=t.rCenteredY?2:1,v=t.rGrabber?t.rGrabber:"<span></span>",p={},g=function(e){p.width=!1,p.height=!1,"x"===u?p.width=parseInt(r[0].style[t.rFlex?i:"width"]):p.height=parseInt(r[0].style[t.rFlex?i:"height"]),p.id=r[0].id,p.evt=e},x=function(e){return e.touches?e.touches[0].clientX:e.clientX},f=function(e){return e.touches?e.touches[0].clientY:e.clientY},b=function(n){var d,c,v="x"===u?a-x(n):a-f(n);switch(l){case"top":d=t.rFlex?i:"height",r[0].style[d]=s+v*m+"px";break;case"bottom":d=t.rFlex?i:"height",r[0].style[d]=s-v*m+"px";break;case"right":d=t.rFlex?i:"width",r[0].style[d]=o-v*h+"px";break;case"left":d=t.rFlex?i:"width",r[0].style[d]=o+v*h+"px"}function b(){t.$emit("angular-resizable.resizing",p)}g(n),t.rNoThrottle?b():(c=b,void 0===e?(e=c,setTimeout(function(){e(),e=void 0},100)):e=c)},y=function(e){g(),t.$emit("angular-resizable.resizeEnd",p),t.$apply(),document.removeEventListener("mouseup",y,!1),document.removeEventListener("mousemove",b,!1),document.removeEventListener("touchend",y,!1),document.removeEventListener("touchmove",b,!1),r.removeClass("no-transition")};c.forEach(function(e){var n=document.createElement("div");n.setAttribute("class","rg-"+e),n.innerHTML=v,r[0].appendChild(n),n.ondragstart=function(){return!1};var i=function(n){"true"===t.rDisabled||1!==n.which&&!n.touches||function(e,n){a="x"==(u="left"===(l=n)||"right"===l?"x":"y")?x(e):f(e),o=parseInt(d.getPropertyValue("width")),s=parseInt(d.getPropertyValue("height")),r.addClass("no-transition"),document.addEventListener("mouseup",y,!1),document.addEventListener("mousemove",b,!1),document.addEventListener("touchend",y,!1),document.addEventListener("touchmove",b,!1),e.stopPropagation&&e.stopPropagation(),e.preventDefault&&e.preventDefault(),e.cancelBubble=!0,e.returnValue=!1,g(e),t.$emit("angular-resizable.resizeStart",p),t.$apply()}(n,e)};n.addEventListener("mousedown",i,!1),n.addEventListener("touchstart",i,!1)})}}});