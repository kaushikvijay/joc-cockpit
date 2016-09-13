(function(){angular.module("template/treeGrid/treeGrid.html",[]).run(["$templateCache",function(a){a.put("template/treeGrid/treeGrid.html",'<div class="table-responsive">\n <table class="table tree-grid table-hover table-bordered">\n   <thead>\n     <tr>\n       <th><a ng-if="expandingProperty.sortable" ng-click="sortBy(expandingProperty)">{{expandingProperty.displayName || expandingProperty.field || expandingProperty}}</a><span ng-if="!expandingProperty.sortable">{{expandingProperty.displayName || expandingProperty.field || expandingProperty}}</span><i ng-if="expandingProperty.sorted" class="{{expandingProperty.sortingIcon}} m-l-sm"></i></th>\n       <th ng-repeat="col in colDefinitions"><a ng-if="col.sortable" ng-click="sortBy(col)">{{col.displayName || col.field}}</a><span ng-if="!col.sortable">{{col.displayName || col.field}}</span><i ng-if="col.sorted" class="{{col.sortingIcon}} "></i></th>\n     </tr>\n   </thead>\n   <tbody>\n     <tr ng-repeat="row in filtered = (tree_rows | searchFor:$parent.filterString:expandingProperty:colDefinitions:true) track by row.branch.uid "\n       ng-class="\'level-\' + {{ row.level }} + (row.branch.selected ? \' active\':\'\')" class="tree-grid-row">\n       <td><a ng-click="user_clicks_branch(row.branch)"><i ng-class="row.tree_icon"\n              ng-click="row.branch.expanded = !row.branch.expanded"\n              class="indented tree-icon"></i></a>               <span ng-if="expandingProperty.cellTemplate" class="indented tree-label"               ng-click="on_user_click(row.branch)" compile="expandingProperty.cellTemplate"></span>              <span  ng-if="!expandingProperty.cellTemplate" class="indented tree-label" ng-click="on_user_click(row.branch)">\n             {{row.branch[expandingProperty.field] || row.branch[expandingProperty]}}</span>\n       </td>\n       <td ng-repeat="col in colDefinitions">\n         <div ng-if="col.cellTemplate" compile="col.cellTemplate" cell-template-scope="col.cellTemplateScope"></div>\n         <div ng-if="!col.cellTemplate">{{row.branch[col.field]}}</div>\n       </td>\n     </tr>\n   </tbody>\n </table>\n <div class="text-center m-t text-uppercase hide text-orange" ng-class="{\'show\': (filtered.length===0 && tree_data.length !==0)}">No data matched</div>\n</div>\n')}]),angular.module("treeGrid",["template/treeGrid/treeGrid.html"]).directive("compile",["$compile",function(a){return{restrict:"A",link:function(b,c,d){b.cellTemplateScope=b.$eval(d.cellTemplateScope),b.$watch(d.compile,function(d){var e=a(d),f=e(b);c.append(f)})}}}]).directive("treeGrid",["$timeout","treegridTemplate",function(a,b){return{restrict:"E",templateUrl:function(a,c){return c.templateUrl||b.getPath()},replace:!0,scope:{treeData:"=",colDefs:"=",expandOn:"=",onSelect:"&",onClick:"&",initialSelection:"@",treeControl:"=",expandTo:"="},link:function(b,c,d){var e,f,g,h,i,j,k,l,m,n,o,p;if(e=function(a){console.log("ERROR:"+a)},d.iconExpand=d.iconExpand?d.iconExpand:"icon-plus fa fa-plus",d.iconCollapse=d.iconCollapse?d.iconCollapse:"icon-minus fa fa-minus",d.iconLeaf=d.iconLeaf?d.iconLeaf:"icon-file",d.sortedAsc=d.sortedAsc?d.sortedAsc:"icon-file m-t-xs fa fa-caret-up",d.sortedDesc=d.sortedDesc?d.sortedDesc:"icon-file m-t-xs fa fa-caret-down",d.expandLevel=d.expandLevel?d.expandLevel:"0",h=parseInt(d.expandLevel,10),!b.treeData)return void alert("No data was defined for the tree, please define treeData!");var q=function(){if(d.expandOn)f=b.expandOn,b.expandingProperty=b.expandOn;else if(b.treeData.length){for(var c=b.treeData[0],e=Object.keys(c),g=0,h=e.length;g<h;g++)if("string"==typeof c[e[g]]){f=e[g];break}f||(f=e[0]),b.expandingProperty=f}};if(q(),d.colDefs)b.colDefinitions=b.colDefs;else if(b.treeData.length){var r=[],s=b.treeData[0],t=["children","level","expanded","icons",f];for(var u in s)t.indexOf(u)===-1&&r.push({field:u});b.colDefinitions=r}j=function(a){var c,d,e,f,g,h;for(c=function(b,d){var e,f,g,h,i;if(a(b,d),null!=b.children){for(h=b.children,i=[],f=0,g=h.length;f<g;f++)e=h[f],i.push(c(e,d+1));return i}},g=b.treeData,h=[],e=0,f=g.length;e<f;e++)d=g[e],h.push(c(d,1));return h},o=null,n=function(c){if(!c)return null!=o&&(o.selected=!1),void(o=null);if(c!==o){if(null!=o&&(o.selected=!1),c.selected=!0,o=c,g(c),null!=c.onSelect)return a(function(){return c.onSelect(c)});if(null!=b.onSelect)return a(function(){return b.onSelect({branch:c})})}},b.on_user_click=function(a){b.onClick&&b.onClick({branch:a})},b.user_clicks_branch=function(a){if(a!==o)return n(a)},b.sortBy=function(a){"asc"===a.sortDirection?(v(b.treeData,a,!0),a.sortDirection="desc",a.sortingIcon=d.sortedDesc):(v(b.treeData,a,!1),a.sortDirection="asc",a.sortingIcon=d.sortedAsc),a.sorted=!0,x(a)};var v=function(a,b,c){a.sort(w(b,c));for(var d=0;d<a.length;d++)v(a[d].children,b,c)},w=function(a,b){var c=b?-1:1;if("custom"===a.sortingType&&"function"==typeof a.sortingFunc)return function(b,d){return a.sortingFunc(b,d)*c};var d=function(b){return null===b[a.field]?"":b[a.field].toLowerCase()};switch(a.sortingType){case"number":d=function(b){return parseFloat(b[a.field])};break;case"date":d=function(b){return new Date(b[a.field])}}return function(a,b){return a=d(a),b=d(b),c*((a>b)-(b>a))}},x=function(a){for(var c=b.colDefinitions.length,d=0;d<c;d++){var e=b.colDefinitions[d];e.field!=a.field&&(e.sorted=!1,e.sortDirection="none")}};return k=function(a){var b;return b=void 0,a.parent_uid&&j(function(c){if(c.uid===a.parent_uid)return b=c}),b},i=function(a,b){var c;if(c=k(a),null!=c)return b(c),i(c,b)},g=function(a){return i(a,function(a){return a.expanded=!0})},b.tree_rows=[],m=function(){q();var a,c,e,g,i,k;for(j(function(a,b){if(!a.uid)return a.uid=""+Math.random()}),j(function(a){var b,c,d,e,f;if(angular.isArray(a.children)){for(e=a.children,f=[],c=0,d=e.length;c<d;c++)b=e[c],f.push(b.parent_uid=a.uid);return f}}),b.tree_rows=[],j(function(a){var b,c;return a.children?a.children.length>0?(c=function(a){return"string"==typeof a?{label:a,children:[]}:a},a.children=function(){var d,e,f,g;for(f=a.children,g=[],d=0,e=f.length;d<e;d++)b=f[d],g.push(c(b));return g}()):void 0:a.children=[]}),a=function(c,e,g){var i,j,k,l,m,n,o;if(null==e.expanded&&(e.expanded=!1),k=e.children&&0!==e.children.length?e.expanded?e.icons&&e.icons.iconCollapse||d.iconCollapse:e.icons&&e.icons.iconExpand||d.iconExpand:e.icons&&e.icons.iconLeaf||d.iconLeaf,e.level=c,b.tree_rows.push({level:c,branch:e,label:e[f],tree_icon:k,visible:g}),null!=e.children){for(n=e.children,o=[],l=0,m=n.length;l<m;l++)i=n[l],j=g&&(e.expanded||e.level<h),o.push(a(c+1,i,j));return o}},i=b.treeData,k=[],e=0,g=i.length;e<g;e++)c=i[e],k.push(a(1,c,!0));return k},b.$watch("treeData",m,!0),on_expandTo_change=function(){angular.isDefined(b.expandTo)&&j(function(c){if(c.expanded=!1,c[f.field]===b.expandTo||c[f]===b.expandTo)return a(function(){return n(c)})})},b.$watch("expandTo",on_expandTo_change,!0),null!=d.initialSelection&&j(function(b){if(b.label===d.initialSelection)return a(function(){return n(b)})}),l=b.treeData.length,j(function(a,b){return a.level=b,a.expanded=a.level<h}),null!=b.treeControl&&angular.isObject(b.treeControl)?(p=b.treeControl,p.expand_all=function(){return j(function(a,b){return a.expanded=!0})},p.collapse_all=function(){return j(function(a,b){return a.expanded=!1})},p.get_first_branch=function(){if(l=b.treeData.length,l>0)return b.treeData[0]},p.select_first_branch=function(){var a;return a=p.get_first_branch(),p.select_branch(a)},p.get_selected_branch=function(){return o},p.get_parent_branch=function(a){return k(a)},p.select_branch=function(a){return n(a),a},p.get_children=function(a){return a.children},p.select_parent_branch=function(a){var b;if(null==a&&(a=p.get_selected_branch()),null!=a&&(b=p.get_parent_branch(a),null!=b))return p.select_branch(b),b},p.add_branch=function(a,c){return null!=a?(a.children.push(c),a.expanded=!0):b.treeData.push(c),c},p.add_root_branch=function(a){return p.add_branch(null,a),a},p.expand_branch=function(a){if(null==a&&(a=p.get_selected_branch()),null!=a)return a.expanded=!0,a},p.collapse_branch=function(a){if(null==a&&(a=o),null!=a)return a.expanded=!1,a},p.get_siblings=function(a){var c,d;if(null==a&&(a=o),null!=a)return c=p.get_parent_branch(a),d=c?c.children:b.treeData},p.get_next_sibling=function(a){var b,c;if(null==a&&(a=o),null!=a&&(c=p.get_siblings(a),l=c.length,b=c.indexOf(a),b<l))return c[b+1]},p.get_prev_sibling=function(a){var b,c;if(null==a&&(a=o),c=p.get_siblings(a),l=c.length,b=c.indexOf(a),b>0)return c[b-1]},p.select_next_sibling=function(a){var b;if(null==a&&(a=o),null!=a&&(b=p.get_next_sibling(a),null!=b))return p.select_branch(b)},p.select_prev_sibling=function(a){var b;if(null==a&&(a=o),null!=a&&(b=p.get_prev_sibling(a),null!=b))return p.select_branch(b)},p.get_first_child=function(a){var b;if(null==a&&(a=o),null!=a&&(null!=(b=a.children)?b.length:void 0)>0)return a.children[0]},p.get_closest_ancestor_next_sibling=function(a){var b,c;return b=p.get_next_sibling(a),null!=b?b:(c=p.get_parent_branch(a),p.get_closest_ancestor_next_sibling(c))},p.get_next_branch=function(a){var b;if(null==a&&(a=o),null!=a)return b=p.get_first_child(a),null!=b?b:b=p.get_closest_ancestor_next_sibling(a)},p.select_next_branch=function(a){var b;if(null==a&&(a=o),null!=a&&(b=p.get_next_branch(a),null!=b))return p.select_branch(b),b},p.last_descendant=function(a){var b;return l=a.children.length,0===l?a:(b=a.children[l-1],p.last_descendant(b))},p.get_prev_branch=function(a){var b,c;if(null==a&&(a=o),null!=a)return c=p.get_prev_sibling(a),null!=c?p.last_descendant(c):b=p.get_parent_branch(a)},p.select_prev_branch=function(a){var b;if(null==a&&(a=o),null!=a&&(b=p.get_prev_branch(a),null!=b))return p.select_branch(b),b}):void 0}}}]).provider("treegridTemplate",function(){var a="template/treeGrid/treeGrid.html";this.setPath=function(b){a=b},this.$get=function(){return{getPath:function(){return a}}}}).filter("searchFor",function(){function a(a,c,d,e){var f=!1,g=!1;d.filterable&&(g=!0,b(a,c,d)&&(f=!0));for(var h=e.length,i=0;i<h;i++){var j=e[i];j.filterable&&(g=!0,b(a,c,j)&&(f=!0))}return!g||f}function b(a,b,c){if("number"===c.sortingType){if(null!=a.branch[c.field]&&parseFloat(a.branch[c.field])===parseFloat(b))return!0}else if(null!=a.branch[c.field]&&a.branch[c.field].toLowerCase().indexOf(b.toLowerCase())!==-1)return!0}return function(b,c,d,e,f){var g=[];if(!c||c.length<3)for(var h=0;h<b.length;h++){var i=b[h];i.visible&&g.push(i)}else for(var j=[],k=0,h=0;h<b.length;h++){for(var i=b[h];k>=i.level;)throwAway=j.pop(),k--;if(j.push(i),k=i.level,a(i,c,d,e)){for(var l=0;l<j.length;l++)ancestor=j[l],ancestor.visible&&(f&&(ancestor.branch.expanded=!0),g.push(ancestor));j=[]}}return g}})}).call(window);
