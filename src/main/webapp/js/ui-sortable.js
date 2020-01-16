angular.module("ui.sortable",[]).value("uiSortableConfig",{items:"> [ng-repeat],> [data-ng-repeat],> [x-ng-repeat]"}).directive("uiSortable",["uiSortableConfig","$timeout","$log",function(e,t,n){return{require:"?ngModel",scope:{ngModel:"=",uiSortable:"="},link:function(o,l,r,i){var a,u;function s(e,t){var n="function"==typeof t;return"function"==typeof e&&n?function(){e.apply(this,arguments),t.apply(this,arguments)}:n?t:e}function c(e){var t=e.data("ui-sortable");return t&&"object"==typeof t&&"ui-sortable"===t.widgetFullName?t:null}function d(t,n){return h[t]?("stop"===t&&(n=s(n,function(){o.$apply()}),n=s(n,b)),n=s(h[t],n)):y[t]&&(n=y[t](n)),n||"items"!==t&&"ui-model-items"!==t||(n=e.items),n}function f(e,t,n){angular.forEach(h,function(e,t){t in v||(v[t]=null)});var o,l=null;t&&angular.forEach(t,function(t,n){if(!(e&&n in e)){if(n in g)return void(v[n]="ui-floating"===n?"auto":d(n,void 0));o||(o=angular.element.ui.sortable().options);var r=o[n];r=d(n,r),l||(l={}),l[n]=r,v[n]=r}});return angular.forEach(e,function(e,t){if(t in g)return"ui-floating"!==t||!1!==e&&!0!==e||!n||(n.floating=e),void(v[t]=d(t,e));e=d(t,e),l||(l={}),l[t]=e,v[t]=e}),l}function m(e,t){var n=null;return function(e,t){var n=e.sortable("option","helper");return"clone"===n||"function"==typeof n&&t.item.sortable.isCustomHelperUsed()}(e,t)&&"parent"===e.sortable("option","appendTo")&&(n=u),n}function b(e,t){t.item.sortable._destroy()}function p(e){return e.parent().find(v["ui-model-items"]).index(e)}var v={},g={"ui-floating":void 0,"ui-model-items":e.items},h={receive:null,remove:null,start:null,stop:null,update:null},y={helper:null};function C(){o.$watchCollection("ngModel",function(){t(function(){c(l)&&l.sortable("refresh")},0,!1)}),h.start=function(e,t){if("auto"===v["ui-floating"]){var n=t.item.siblings();c(angular.element(e.target)).floating=/left|right/.test((o=n).css("float"))||/inline|table-cell/.test(o.css("display"))}var o,l=p(t.item);t.item.sortable={model:i.$modelValue[l],index:l,source:t.item.parent(),sourceModel:i.$modelValue,cancel:function(){t.item.sortable._isCanceled=!0},isCanceled:function(){return t.item.sortable._isCanceled},isCustomHelperUsed:function(){return!!t.item.sortable._isCustomHelperUsed},_isCanceled:!1,_isCustomHelperUsed:t.item.sortable._isCustomHelperUsed,_destroy:function(){angular.forEach(t.item.sortable,function(e,n){t.item.sortable[n]=void 0})}}},h.activate=function(e,t){a=l.contents(),u=t.helper;var n=function(e){var t=e.sortable("option","placeholder");if(t&&t.element&&"function"==typeof t.element){var n=t.element();return n=angular.element(n)}return null}(l);if(n&&n.length){var r=function(e,t){var n=v["ui-model-items"].replace(/[^,]*>/g,"");return e.find('[class="'+t.attr("class")+'"]:not('+n+")")}(l,n);a=a.not(r)}var i=t.item.sortable._connectedSortables||[];i.push({element:l,scope:o}),t.item.sortable._connectedSortables=i},h.update=function(e,t){if(!t.item.sortable.received){t.item.sortable.dropindex=p(t.item);var n=t.item.parent();t.item.sortable.droptarget=n;var r=function(e,t){for(var n=null,o=0;o<e.length;o++){var l=e[o];if(l.element[0]===t[0]){n=l.scope;break}}return n}(t.item.sortable._connectedSortables,n);t.item.sortable.droptargetModel=r.ngModel,l.sortable("cancel")}var u=!t.item.sortable.received&&m(l,t);u&&u.length&&(a=a.not(u)),a.appendTo(l),t.item.sortable.received&&(a=null),t.item.sortable.received&&!t.item.sortable.isCanceled()&&o.$apply(function(){i.$modelValue.splice(t.item.sortable.dropindex,0,t.item.sortable.moved)})},h.stop=function(e,t){if(!t.item.sortable.received&&"dropindex"in t.item.sortable&&!t.item.sortable.isCanceled())o.$apply(function(){i.$modelValue.splice(t.item.sortable.dropindex,0,i.$modelValue.splice(t.item.sortable.index,1)[0])});else if((!("dropindex"in t.item.sortable)||t.item.sortable.isCanceled())&&!angular.equals(l.contents(),a)){var n=m(l,t);n&&n.length&&(a=a.not(n)),a.appendTo(l)}a=null,u=null},h.receive=function(e,t){t.item.sortable.received=!0},h.remove=function(e,t){"dropindex"in t.item.sortable||(l.sortable("cancel"),t.item.sortable.cancel()),t.item.sortable.isCanceled()||o.$apply(function(){t.item.sortable.moved=i.$modelValue.splice(t.item.sortable.index,1)[0]})},y.helper=function(e){return e&&"function"==typeof e?function(t,n){var o=n.sortable,l=p(n);n.sortable={model:i.$modelValue[l],index:l,source:n.parent(),sourceModel:i.$modelValue,_restore:function(){angular.forEach(n.sortable,function(e,t){n.sortable[t]=void 0}),n.sortable=o}};var r=e.apply(this,arguments);return n.sortable._restore(),n.sortable._isCustomHelperUsed=n!==r,r}:e},o.$watchCollection("uiSortable",function(e,t){var n=c(l);if(n){var o=f(e,t,n);o&&l.sortable("option",o)}},!0),f(v)}function $(){return(!o.uiSortable||!o.uiSortable.disabled)&&(i?C():n.info("ui.sortable: ngModel not provided!",l),l.sortable(v),$.cancelWatcher(),$.cancelWatcher=angular.noop,!0)}angular.extend(v,g,e,o.uiSortable),angular.element.fn&&angular.element.fn.jquery?($.cancelWatcher=angular.noop,$()||($.cancelWatcher=o.$watch("uiSortable.disabled",$))):n.error("ui.sortable: jQuery should be included before AngularJS!")}}}]);
