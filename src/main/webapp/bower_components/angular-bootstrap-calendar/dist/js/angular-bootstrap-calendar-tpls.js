!function (n, e) {
    "object" == typeof exports && "object" == typeof module ? module.exports = e(require("angular"), function () {
        try {
            return require("interact.js")
        } catch (n) {
        }
    }(), require("moment")) : "function" == typeof define && define.amd ? define(["angular", "interact", "moment"], e) : "object" == typeof exports ? exports.angularBootstrapCalendarModuleName = e(require("angular"), function () {
        try {
            return require("interact.js")
        } catch (n) {
        }
    }(), require("moment")) : n.angularBootstrapCalendarModuleName = e(n.angular, n.interact, n.moment)
}(this, function (n, e, a) {
    return function (n) {
        function e(t) {
            if (a[t]) return a[t].exports;
            var l = a[t] = {exports: {}, id: t, loaded: !1};
            return n[t].call(l.exports, l, l.exports, e), l.loaded = !0, l.exports
        }

        var a = {};
        return e.m = n, e.c = a, e.p = "", e(0)
    }([function (n, e, a) {
        "use strict";

        function t(n) {
            n.keys().forEach(n)
        }

        a(8);
        var l = a(12), i = {}, d = a(13);
        d.keys().forEach(function (n) {
            var e = n.replace("./", ""), a = "mwl/" + e, t = e.replace(".html", "");
            i[t] = {cacheTemplateName: a, template: d(n)}
        }), n.exports = l.module("mwl.calendar", []).config(["calendarConfig", function (n) {
            l.forEach(i, function (e, a) {
                n.templates[a] || (n.templates[a] = e.cacheTemplateName)
            })
        }]).run(["$templateCache", "$interpolate", function (n, e) {
            l.forEach(i, function (a) {
                if (!n.get(a.cacheTemplateName)) {
                    var t = a.template.replace("{{", e.startSymbol()).replace("}}", e.endSymbol());
                    n.put(a.cacheTemplateName, t)
                }
            })
        }]).name, t(a(23)), t(a(38)), t(a(43))
    }, , , , , , , , function (n, e) {
    }, , , , function (e, a) {
        e.exports = n
    }, function (n, e, a) {
        function t(n) {
            return a(l(n))
        }

        function l(n) {
            return i[n] || function () {
                throw new Error("Cannot find module '" + n + "'.")
            }()
        }

        var i = {
            "./calendar.html": 14,
            "./calendarDayView.html": 15,
            "./calendarHourList.html": 16,
            "./calendarMonthCell.html": 17,
            "./calendarMonthView.html": 19,
            "./calendarSlideBox.html": 20,
            "./calendarWeekView.html": 21,
            "./calendarYearView.html": 22
        };
        t.keys = function () {
            return Object.keys(i)
        }, t.resolve = l, n.exports = t, t.id = 13
    }, function (n, e) {
        n.exports = '<div class="text-center m-t-lg" ng-if="!vm.templatesLoaded " style="height: 50px" > <div class="cssload-loading">Loading....</div> </div><div\n  class="cal-context"\n   ng-if="vm.templatesLoaded">\n\n  <div ng-hide="vm.view!==\'year\'"> <mwl-calendar-year\n    events="vm.events"\n    view-date="vm.viewDate"\n    plan-items="vm.planItems"\n    year-View="vm.yearView"\n view-period="vm.view"   offsets="vm.offsets"\n         on-timespan-click="vm.onTimespanClick"\n        cell-is-open="vm.cellIsOpen"\n    cell-modifier="vm.cellModifier"\n    slide-box-disabled="vm.slideBoxDisabled"\n >\n  </mwl-calendar-year></div>\n\n <div ng-hide="vm.view!==\'month\'"> <mwl-calendar-month\n    events="vm.events"\n    view-date="vm.viewDate"\n    plan-items="vm.planItems"\n  view-period="vm.view"           on-timespan-click="vm.onTimespanClick"\n     cell-is-open="vm.cellIsOpen"\n    cell-modifier="vm.cellModifier"\n    slide-box-disabled="vm.slideBoxDisabled"\n >\n  </mwl-calendar-month></div> <div ng-hide="vm.view!==\'week\'"> <mwl-calendar-week\n    events="vm.events"\n    view-date="vm.viewDate"\n    day-view-start="vm.dayViewStart"\n    day-view-end="vm.dayViewEnd"\n    day-view-split="vm.dayViewSplit"\n     on-timespan-click="vm.onTimespanClick"\n >\n  </mwl-calendar-week></div>\n\n <div ng-hide="vm.view!==\'day\'"> <mwl-calendar-day\n    events="vm.events"\n    view-date="vm.viewDate"\n       on-timespan-click="vm.onTimespanClick"\n    on-date-range-select="vm.onDateRangeSelect"\n    day-view-start="vm.dayViewStart"\n    day-view-end="vm.dayViewEnd"\n    day-view-split="vm.dayViewSplit"\n    >\n  </mwl-calendar-day></div>\n</div>\n'
    }, function (n, e) {
        n.exports = '<div class="cal-week-box cal-all-day-events-box" ng-if="vm.allDayEvents.length > 0">\n  <div class="cal-day-panel clearfix">\n    <div class="row">\n      <div class="col-xs-12">\n        <div class="cal-row-fluid">\n          <div\n            class="cal-cell-6 day-highlight dh-event-{{ event.type }}"\n            data-event-class\n            ng-repeat="event in vm.allDayEvents track by event.$id">\n            <strong>\n              <span ng-bind="event.startsAt | calendarDate:\'datetime\':true"></span>\n              <span ng-if="event.endsAt">\n                - <span ng-bind="event.endsAt | calendarDate:\'datetime\':true"></span>\n              </span>\n            </strong>\n            <a\n              href="javascript:;"\n              class="event-item"\n              ng-bind-html="vm.$sce.trustAsHtml(event.title)">\n            </a>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="cal-day-box">\n  <div class="cal-day-panel clearfix" ng-style="{height: vm.dayViewHeight + \'px\'}">\n\n    <div\n      class="pull-left day-event day-highlight"\n      ng-repeat="event in vm.nonAllDayEvents track by event.$id"\n      ng-class="\'dh-event-\' + event.type + \' \' + event.cssClass"\n      ng-style="{top: event.top + \'px\', left: event.left + 60 + \'px\', height: event.height + \'px\'}"\n    axis="\'xy\'"\n      snap-grid="{y: vm.dayViewEventChunkSize || 30, x: 50}"\n   resize-edges="{top: true, bottom: true}"\n      on-resize="vm.eventResized(event, edge, y / 30)"\n      on-resize-end="vm.eventResizeComplete(event, edge, y / 30)">\n\n      <span class="cal-hours">\n        <span ng-show="event.top == 0"><span ng-bind="(event.tempStartsAt || event.startsAt) | calendarDate:\'day\':true"></span>, </span>\n        <span ng-bind="(event.tempStartsAt || event.startsAt) | calendarDate:\'time\':true"></span>\n      </span>\n      <a href="javascript:;" class="event-item" >\n       </a>\n\n    </div>\n\n  </div>\n\n</div>\n'
    }, function (n, e) {
        n.exports = '<div class="cal-day-panel-hour">\n\n  <div class="cal-day-hour" ng-repeat="hour in vm.hours track by $index">\n\n    <div\n      class="cal-day-hour-part"\n      ng-class="{ \'cal-day-hour-part-selected\': vm.dateRangeSelect &&\n                vm.dateRangeSelect.startDate <= vm.getClickedDate(hour.date, vm.dayViewSplit * $index) &&\n                vm.getClickedDate(hour.date, vm.dayViewSplit * $index) < vm.dateRangeSelect.endDate }"\n      ng-repeat="chunk in vm.hourChunks track by chunk"\n      ng-click="vm.onTimespanClick({calendarDate: vm.getClickedDate(hour.date, vm.dayViewSplit * $index)})"\n        ng-if="!vm.dayWidth">\n      <div class="cal-day-hour-part-time">\n        <strong ng-bind="hour.label" ng-show="$first"></strong>\n      </div>\n    </div>\n\n    <div\n      class="cal-day-hour-part"\n      ng-repeat="chunk in vm.hourChunks track by chunk"\n      ng-if="vm.dayWidth">\n      <div class="cal-day-hour-part-time">\n        <strong ng-bind="hour.label" ng-show="$first"></strong>\n      </div>\n      <div\n        class="cal-day-hour-part-spacer"\n        ng-repeat="dayIndex in [0, 1, 2, 3, 4, 5, 6]"\n        ng-style="{width: vm.dayWidth + \'px\'}"\n      ng-click="vm.onTimespanClick({calendarDate: vm.getClickedDate(hour.date, vm.dayViewSplit * $parent.$index, dayIndex)})"\n        >\n      </div>\n    </div>\n\n  </div>\n\n</div>\n'
    }, function (n, e) {
        n.exports = '<div\n   class="cal-month-day"\n  ng-class="{\n    \'cal-day-outmonth\': !day.inMonth,\n    \'cal-day-inmonth\': day.inMonth,\n    \'cal-day-weekend\': day.isWeekend,\n    \'cal-day-past\': day.isPast,\n    \'cal-day-today\': day.isToday,\n    \'cal-day-future\': day.isFuture,\n    \'cal-day-plan\': day.isPlanData,\n \'cal-day-exclude\': day.isExclude\n }">\n\n <small\n    class="cal-events-num badge badge-important pull-left"\n    ng-show="day.badgeTotal > 0"\n    ng-bind="day.badgeTotal">\n  </small>\n\n  <div style="overflow: auto"><span\n    class="pull-right m-t-xs"\n  data-cal-date\n   ng-bind="day.label">\n </span></div>\n\n <div class="p-l-xs" ng-hide="vm.viewPeriod!==\'month\'" style="overflow: auto;height: 60px"  ><div ng-repeat="hour in day.hours | orderBy:[\'plannedStartTime\',\'orderId\']" class="text-xs" title="{{hour.orderId}}" ><i ng-if="hour.endTime"><i ng-if="!hour.repeat" class="fa fa-clock-o"></i> <div ng-if="hour.repeat"><i class="fa fa-repeat"></i> {{hour.repeat}}</div>{{hour.plannedStartTime | timeformatFilter}} - {{hour.endTime}} </i><i ng-if="!hour.endTime"> {{hour.plannedStartTime | timeformatFilter}}</i> </div></div> <div class="cal-day-tick" ng-show="dayIndex === vm.openDayIndex && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled">\n    <i class="glyphicon glyphicon-chevron-up"></i>\n    <i class="fa fa-chevron-up"></i>\n  </div>\n\n  <div id="cal-week-box" ng-if="$first && rowHovered">\n    <span ng-bind="vm.calendarConfig.i18nStrings.weekNumber.replace(\'{week}\', day.date.clone().add(1, \'day\').isoWeek())"></span>\n  </div>\n\n</div>\n'
    }, function (n, e) {
        n.exports = '<div class="events-list" ng-show="day.events.length > 0">\n  <a\n    ng-repeat="event in day.events | orderBy:\'startsAt\' track by event.$id"\n    href="javascript:;"\n    ng-click="$event.stopPropagation();"\n    class="pull-left event"\n    ng-class="\'event-\' + event.type + \' \' + event.cssClass"\n    ng-mouseenter="vm.highlightEvent(event, true)"\n    ng-mouseleave="vm.highlightEvent(event, false)"\n    tooltip-append-to-body="true"\n    uib-tooltip-html="((event.startsAt | calendarDate:\'time\':true) + (vm.calendarConfig.displayEventEndTimes && event.endsAt ? \' - \' + (event.endsAt | calendarDate:\'time\':true) : \'\') + \' - \' + event.title) | calendarTrustAsHtml"\n  >\n  </a>\n</div>\n'
    }, function (n, e) {
        n.exports = '<div class="cal-row-fluid cal-row-head">\n\n  <div class="cal-cell1" ng-repeat="day in vm.weekDays track by $index" ng-bind="day"></div>\n\n</div>\n<div class="cal-month-box">\n\n  <div\n    ng-repeat="rowOffset in vm.monthOffsets track by rowOffset"\n    ng-mouseenter="rowHovered = true"\n    ng-mouseleave="rowHovered = false">\n    <div class="cal-row-fluid cal-before-eventlist">\n      <div\n        ng-repeat="day in vm.view | calendarLimitTo:7:rowOffset track by $index"\n        ng-init="dayIndex = vm.view.indexOf(day)"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-click="vm.dayClicked(day, false, $event)"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n      </div>\n    </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n     >\n    </mwl-calendar-slide-box>\n\n  </div>\n\n</div>\n'
    }, function (n, e) {
        n.exports = '<div class="cal-slide-box" uib-collapse="vm.isCollapsed" mwl-collapse-fallback="vm.isCollapsed">\n  <div class="cal-slide-content cal-event-list">\n    <ul class="unstyled list-unstyled">\n\n      <li\n        ng-repeat="event in vm.events | orderBy:\'startsAt\' track by event.$id"\n        ng-class="event.cssClass"\n  >\n        <span class="pull-left event" ng-class="\'event-\' + event.type"></span>\n        &nbsp;\n        <a\n          href="javascript:;"\n          class="event-item"\n   >\n          <span ng-bind-html="vm.$sce.trustAsHtml(event.title)"></span>\n          (<span ng-bind="event.startsAt | calendarDate:(isMonthView ? \'time\' : \'datetime\'):true"></span><span ng-if="vm.calendarConfig.displayEventEndTimes && event.endsAt"> - <span ng-bind="event.endsAt | calendarDate:(isMonthView ? \'time\' : \'datetime\'):true"></span></span>)\n        </a>\n\n        <a\n          href="javascript:;"\n          class="event-item-edit"\n              >\n        </a>\n\n        <a\n          href="javascript:;"\n      class="event-item-delete"\n  >\n        </a>\n      </li>\n\n    </ul>\n  </div>\n</div>\n'
    }, function (n, e) {
        n.exports = '<div class="cal-week-box" ng-class="{\'cal-day-box\': vm.showTimes}">\n  <div class="cal-row-fluid cal-row-head">\n\n    <div\n      class="cal-cell1"\n      ng-repeat="day in vm.view.days track by $index"\n      ng-class="{\n        \'cal-day-weekend\': day.isWeekend,\n        \'cal-day-past\': day.isPast,\n        \'cal-day-today\': day.isToday,\n        \'cal-day-future\': day.isFuture}"\n      mwl-element-dimensions="vm.dayColumnDimensions"\n   >\n\n      <span ng-bind="day.weekDayLabel"></span>\n      <br>\n      <small>\n  <span\n    data-cal-date\n   class="pointer"\n          ng-bind="day.dayLabel">\n        </span>\n      </small>\n\n    </div>\n\n  </div>\n\n  <div class="cal-day-panel clearfix" ng-style="{height: vm.showTimes ? (vm.dayViewHeight + \'px\') : \'auto\'}">\n\n     <div class="row">\n      <div class="col-xs-12">\n        <div\n          class="cal-row-fluid"\n          ng-repeat="event in vm.view.events track by event.$id">\n          <div\n            ng-class="\'cal-cell\' + (vm.showTimes ? 1 : event.daySpan) + (vm.showTimes ? \'\' : \' cal-offset\' + event.dayOffset) + \' day-highlight dh-event-\' + event.type + \' \' + event.cssClass"\n            ng-style="{\n              top: vm.showTimes ? ((event.top + 2) + \'px\') : \'auto\',\n              position: vm.showTimes ? \'absolute\' : \'inherit\',\n              width: vm.showTimes ? (vm.dayColumnDimensions.width + \'px\') : \'\',\n              left: vm.showTimes ? (vm.dayColumnDimensions.width * event.dayOffset) + 15 + \'px\' : \'\'\n            }"\n            data-event-class\n      axis="vm.showTimes ? \'xy\' : \'x\'"\n            snap-grid="vm.showTimes ? {x: vm.dayColumnDimensions.width, y: vm.dayViewEventChunkSize || 30} : {x: vm.dayColumnDimensions.width}"\n      resize-edges="{left: true, right: true}"\n            on-resize-end="vm.weekResized(event, edge, x / vm.dayColumnDimensions.width)">\n            <strong ng-bind="(event.tempStartsAt || event.startsAt) | calendarDate:\'time\':true" ng-show="vm.showTimes"></strong>\n            <a\n              href="javascript:;"\n                  class="event-item"\n              ng-bind-html="vm.$sce.trustAsHtml(event.title)"\n              uib-tooltip-html="event.title | calendarTrustAsHtml"\n              tooltip-placement="left"\n              tooltip-append-to-body="true">\n            </a>\n          </div>\n        </div>\n      </div>\n\n    </div>\n\n  </div>\n</div>\n'
    }, function (n, e) {
        n.exports = '<div class="hide text-center m-t-lg" ng-class="{show:!vm.loadingDone}" style="position: absolute; top:50%;z-index:999" > <div class="loading-img1 m-t-lg"></div></div><div class="cal-year-box">\n  <div ng-repeat="rowOffset in [0] track by rowOffset">\n    <div class="row cal-before-eventlist">\n      <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n             ng-init="monthIndex = vm.view.indexOf(vm.view[0])"\n        ng-click="vm.monthClicked(vm.view[0], false, $event)"\n        ng-class="{pointer: vm.view[0].events.length > 0, \'cal-day-today\': vm.view[0].isToday}"\n    ">\n\n        <div\n   class="month-name"\n          data-cal-date\n  ng-bind="vm.view[0].label || \'January\' ">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n      ng-repeat="rowOffset in vm.view[0].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(1,day)"\n   ng-repeat="day in vm.view[0].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n   <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n       >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[0].badgeTotal > 0"\n          ng-bind="vm.view[0].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div>\n   <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n         ng-init="monthIndex = vm.view.indexOf(vm.view[1])"\n        ng-click="vm.monthClicked(vm.view[1], false, $event)"\n        ng-class="{pointer: vm.view[1].events.length > 0, \'cal-day-today\': vm.view[1].isToday}"\n     >\n\n       <div\n   class="month-name"\n          data-cal-date\n   ng-bind="vm.view[1].label || \'February\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n       ng-repeat="rowOffset in vm.view[1].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(2,day)"\n      ng-repeat="day in vm.view[1].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n       >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[1].badgeTotal > 0"\n          ng-bind="vm.view[1].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n ng-init="monthIndex = vm.view.indexOf(vm.view[2])"\n        ng-click="vm.monthClicked(vm.view[2], false, $event)"\n        ng-class="{pointer: vm.view[2].events.length > 0, \'cal-day-today\': vm.view[2].isToday}"\n        >\n\n        <div\n   class="month-name"\n          data-cal-date\n         ng-bind="vm.view[2].label || \'March\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n      ng-repeat="rowOffset in vm.view[2].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n     ng-click="vm.calendarCtrl.dateClicked(3,day)"\n     ng-repeat="day in vm.view[2].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[2].badgeTotal > 0"\n          ng-bind="vm.view[2].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n            ng-init="monthIndex = vm.view.indexOf(vm.view[3])"\n        ng-click="vm.monthClicked(vm.view[3], false, $event)"\n        ng-class="{pointer: vm.view[3].events.length > 0, \'cal-day-today\': vm.view[3].isToday}"\n    >\n\n        <div\n   class="month-name"\n          data-cal-date\n         ng-bind="vm.view[3].label || \'April\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n       ng-repeat="rowOffset in vm.view[3].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(4,day)"\n     ng-repeat="day in vm.view[3].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n    >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[3].badgeTotal > 0"\n          ng-bind="vm.view[3].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div> </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled"\n        >\n    </mwl-calendar-slide-box>\n\n  </div>\n\n<div ng-repeat="rowOffset in [4] track by rowOffset">\n    <div class="row cal-before-eventlist">\n      <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n        ng-init="monthIndex = vm.view.indexOf(vm.view[4])"\n        ng-click="vm.monthClicked(vm.view[4], false, $event)"\n        ng-class="{pointer: vm.view[4].events.length > 0, \'cal-day-today\': vm.view[4].isToday}"\n    >\n\n   <div\n   class="month-name"\n   data-cal-date\n        ng-bind="vm.view[4].label || \'May\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n    ng-repeat="rowOffset in vm.view[4].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(5,day)"\n     ng-repeat="day in vm.view[4].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n     >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[4].badgeTotal > 0"\n          ng-bind="vm.view[4].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div>\n  <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n         ng-init="monthIndex = vm.view.indexOf(vm.view[5])"\n        ng-click="vm.monthClicked(vm.view[5], false, $event)"\n        ng-class="{pointer: vm.view[5].events.length > 0, \'cal-day-today\': vm.view[5].isToday}"\n      >\n\n       <div\n   class="month-name"\n          data-cal-date\n             ng-bind="vm.view[5].label || \'June\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n      ng-repeat="day in vm.weekDays track by $index"\n  ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n   ng-repeat="rowOffset in vm.view[5].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(6,day)"\n     ng-repeat="day in vm.view[5].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n        >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[5].badgeTotal > 0"\n          ng-bind="vm.view[5].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n ng-init="monthIndex = vm.view.indexOf(vm.view[6])"\n        ng-click="vm.monthClicked(vm.view[6], false, $event)"\n        ng-class="{pointer: vm.view[6].events.length > 0, \'cal-day-today\': vm.view[6].isToday}"\n      >\n\n        <div\n   class="month-name"\n          data-cal-date\n            ng-bind="vm.view[6].label || \'July\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n        ng-repeat="rowOffset in vm.view[6].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(7,day)"\n     ng-repeat="day in vm.view[6].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[6].badgeTotal > 0"\n          ng-bind="vm.view[6].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n            ng-init="monthIndex = vm.view.indexOf(vm.view[7])"\n        ng-click="vm.monthClicked(vm.view[7], false, $event)"\n        ng-class="{pointer: vm.view[7].events.length > 0, \'cal-day-today\': vm.view[7].isToday}"\n    >\n\n        <div\n   class="month-name"\n          data-cal-date\n         ng-bind="vm.view[7].label || \'August\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n        ng-repeat="rowOffset in vm.view[7].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(8,day)"\n    ng-repeat="day in vm.view[7].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[7].badgeTotal > 0"\n          ng-bind="vm.view[7].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div> </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled"\n      >\n    </mwl-calendar-slide-box>\n\n  </div>\n\n<div ng-repeat="rowOffset in [8] track by rowOffset">\n    <div class="row cal-before-eventlist">\n      <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n    ng-init="monthIndex = vm.view.indexOf(vm.view[8])"\n        ng-click="vm.monthClicked(vm.view[8], false, $event)"\n        ng-class="{pointer: vm.view[8].events.length > 0, \'cal-day-today\': vm.view[8].isToday}"\n    >\n\n        <div\n   class="month-name"\n          data-cal-date\n        ng-bind="vm.view[8].label || \'September\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n    ng-repeat="rowOffset in vm.view[8].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(9,day)"\n        ng-repeat="day in vm.view[8].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n          >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[8].badgeTotal > 0"\n          ng-bind="vm.view[8].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div>\n   <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n         ng-init="monthIndex = vm.view.indexOf(vm.view[9])"\n        ng-click="vm.monthClicked(vm.view[9], false, $event)"\n        ng-class="{pointer: vm.view[9].events.length > 0, \'cal-day-today\': vm.view[9].isToday}"\n  >\n\n       <div\n   class="month-name"\n          data-cal-date\n            ng-bind="vm.view[9].label || \'October\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n    ng-repeat="rowOffset in vm.view[9].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(10,day)"\n       ng-repeat="day in vm.view[9].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n     >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[9].badgeTotal > 0"\n          ng-bind="vm.view[9].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n ng-init="monthIndex = vm.view.indexOf(vm.view[10])"\n        ng-click="vm.monthClicked(vm.view[10], false, $event)"\n        ng-class="{pointer: vm.view[10].events.length > 0, \'cal-day-today\': vm.view[10].isToday}"\n    >\n\n        <div\n   class="month-name"\n          data-cal-date\n             ng-bind="vm.view[10].label || \'November\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n   ng-repeat="rowOffset in vm.view[10].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(11,day)"\n    ng-repeat="day in vm.view[10].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[10].badgeTotal > 0"\n          ng-bind="vm.view[10].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n            ng-init="monthIndex = vm.view.indexOf(vm.view[11])"\n        ng-click="vm.monthClicked(vm.view[11], false, $event)"\n        ng-class="{pointer: vm.view[11].events.length > 0, \'cal-day-today\': vm.view[11].isToday}"\n    >\n\n        <div\n   class="month-name"\n          data-cal-date\n          ng-bind="vm.view[11].label || \'December\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n       ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n     ng-repeat="rowOffset in vm.view[11].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(12,day)"\n     ng-repeat="day in vm.view[11].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n          >\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[11].badgeTotal > 0"\n          ng-bind="vm.view[11].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div> </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled"\n     >\n    </mwl-calendar-slide-box>\n\n  </div>\n\n</div>\n\n'
    }, function (n, e, a) {
        function t(n) {
            return a(l(n))
        }

        function l(n) {
            return i[n] || function () {
                throw new Error("Cannot find module '" + n + "'.")
            }()
        }

        var i = {
            "./mwlCalendar.js": 24,
            "./mwlCalendarDay.js": 25,
            "./mwlCalendarMonth.js": 27,
            "./mwlCalendarSlideBox.js": 28,
            "./mwlCalendarWeek.js": 29,
            "./mwlCalendarYear.js": 30,
            "./mwlCollapseFallback.js": 31,
            "./mwlDateModifier.js": 32,
            "./mwlElementDimensions.js": 36
        };
        t.keys = function () {
            return Object.keys(i)
        }, t.resolve = l, n.exports = t, t.id = 23
    }, function (n, e, a) {
        "use strict";
        var t = a(12);
        t.module("mwl.calendar").controller("MwlCalendarCtrl", ["$scope", "$rootScope", "$log", "$timeout", "$attrs", "$locale", "moment", "calendarTitle", "calendarHelper", function (n, e, a, l, i, d, s, o, c) {
            function r() {
                if (v.viewDate) {
                    o[v.view] && t.isDefined(i.viewTitle) && (v.viewTitle = o[v.view](v.viewDate));
                    var e = s(v.viewDate), a = !0;
                    m.clone().startOf(v.view).isSame(e.clone().startOf(v.view)) && !m.isSame(e) && v.view === w && (a = !1), m = e, w = v.view, a && l(function () {
                        n.$broadcast("calendar.refreshView")
                    })
                }
            }

            var v = this;
            v.events = v.events || [], v.changeView = function (n, e) {
                v.view = n, v.viewDate = e
            }, v.dateClicked = function (n, a) {
                e.$broadcast("calendarDayClicked", {month: n, day: a, year: v.viewTitle})
            };
            var m = s(v.viewDate), w = v.view;
            c.loadTemplates().then(function () {
                v.templatesLoaded = !0;
                n.$watchGroup(["vm.viewDate", "vm.view", "vm.cellIsOpen", function () {
                    return s.locale() + d.id
                }], function () {
                    r()
                }), n.$watch("vm.planItems", function (e) {
                    e && (0 == e.length ? r() : v.viewDate && n.$broadcast("calendar.refreshView"))
                }, !0)
            }).catch(function (n) {
                a.error("Could not load all calendar templates", n)
            })
        }]).directive("mwlCalendar", ["calendarConfig", function (n) {
            return {
                templateUrl: n.templates.calendar,
                restrict: "E",
                scope: {
                    events: "=",
                    planItems: "=",
                    view: "=",
                    viewTitle: "=?",
                    viewDate: "=",
                    cellIsOpen: "=?",
                    slideBoxDisabled: "=?",
                    onTimespanClick: "&",
                    onDateRangeSelect: "&?",
                    onViewChangeClick: "&",
                    cellModifier: "&",
                    dayViewStart: "@",
                    dayViewEnd: "@",
                    dayViewSplit: "@"
                },
                controller: "MwlCalendarCtrl as vm",
                bindToController: !0
            }
        }])
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").controller("MwlCalendarDayCtrl", ["$scope", "$sce", "moment", "calendarHelper", function (n, e, a, t) {
            var l = this;
            l.$sce = e, n.$on("calendar.refreshView", function () {
                l.dayViewSplit = l.dayViewSplit || 30, l.dayViewHeight = t.getDayViewHeight(l.dayViewStart, l.dayViewEnd, l.dayViewSplit);
                var n = t.getDayView(l.events, l.viewDate, l.dayViewStart, l.dayViewEnd, l.dayViewSplit);
                l.allDayEvents = n.filter(function (n) {
                    return n.allDay
                }), l.nonAllDayEvents = n.filter(function (n) {
                    return !n.allDay
                })
            })
        }]).directive("mwlCalendarDay", ["calendarConfig", function (n) {
            return {
                templateUrl: n.templates.calendarDayView,
                restrict: "E",
                require: "^mwlCalendar",
                scope: {
                    events: "=",
                    viewDate: "=",
                    onTimespanClick: "=",
                    onDateRangeSelect: "=",
                    dayViewStart: "=",
                    dayViewEnd: "=",
                    dayViewSplit: "="
                },
                controller: "MwlCalendarDayCtrl as vm",
                bindToController: !0
            }
        }])
    }, function (n, e, a) {
        "use strict"
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").controller("MwlCalendarMonthCtrl", ["$scope", "moment", "calendarHelper", "calendarConfig", "$timeout", "$filter", function (n, e, a, t, l, i) {
            var d = this;
            d.calendarConfig = t, d.openRowIndex = null, n.$on("calendar.refreshView", function () {
                d.weekDays = a.getWeekDayNames(), d.view = a.getMonthView(d.events, d.viewDate, d.cellModifier, d.planItems, "month");
                var n = Math.floor(d.view.length / 7);
                d.monthOffsets = [];
                for (var t = 0; n > t; t++) d.monthOffsets.push(7 * t);
                d.cellIsOpen && null === d.openRowIndex && (d.openDayIndex = null, d.view.forEach(function (n) {
                    n.inMonth && e(d.viewDate).startOf("day").isSame(n.date) && d.dayClicked(n, !0)
                }))
            }), d.dayClicked = function (n, e, a) {
                if (e || (d.onTimespanClick({
                    calendarDate: n.date.toDate(),
                    calendarCell: n,
                    $event: a
                }), !a || !a.defaultPrevented)) {
                    d.openRowIndex = null;
                    var t = d.view.indexOf(n);
                    t === d.openDayIndex ? (d.openDayIndex = null, d.cellIsOpen = !1) : (d.openDayIndex = t, d.openRowIndex = Math.floor(t / 7), d.cellIsOpen = !0)
                }
            }, d.highlightEvent = function (n, e) {
                d.view.forEach(function (a) {
                    (delete a.highlightClass, e) && (a.events.indexOf(n) > -1 && (a.highlightClass = "day-highlight dh-event-" + n.type))
                })
            }
        }]).directive("mwlCalendarMonth", ["calendarConfig", function (n) {
            return {
                templateUrl: n.templates.calendarMonthView,
                restrict: "E",
                require: "^mwlCalendar",
                scope: {
                    events: "=",
                    viewDate: "=",
                    viewPeriod: "=",
                    planItems: "=",
                    cellIsOpen: "=",
                    onTimespanClick: "=",
                    cellModifier: "=",
                    slideBoxDisabled: "="
                },
                controller: "MwlCalendarMonthCtrl as vm",
                link: function (n, e, a, t) {
                    n.vm.calendarCtrl = t
                },
                bindToController: !0
            }
        }])
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").controller("MwlCalendarSlideBoxCtrl", ["$sce", "$scope", "$timeout", "calendarConfig", function (n, e, a, t) {
            var l = this;
            l.$sce = n, l.calendarConfig = t, l.isCollapsed = !0, e.$watch("vm.isOpen", function (n) {
                a(function () {
                    l.isCollapsed = !n
                })
            })
        }]).directive("mwlCalendarSlideBox", ["calendarConfig", function (n) {
            return {
                restrict: "E",
                templateUrl: n.templates.calendarSlideBox,
                replace: !0,
                controller: "MwlCalendarSlideBoxCtrl as vm",
                require: ["^?mwlCalendarMonth", "^?mwlCalendarYear"],
                link: function (n, e, a, t) {
                    n.isMonthView = !!t[0], n.isYearView = !!t[1]
                },
                scope: {isOpen: "=", events: "="},
                bindToController: !0
            }
        }])
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").controller("MwlCalendarWeekCtrl", ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", function (n, e, a, t, l) {
            var i = this;
            i.showTimes = l.showTimesOnWeekView, i.$sce = e, n.$on("calendar.refreshView", function () {
                i.dayViewSplit = i.dayViewSplit || 30, i.dayViewHeight = t.getDayViewHeight(i.dayViewStart, i.dayViewEnd, i.dayViewSplit), i.showTimes ? i.view = t.getWeekViewWithTimes(i.events, i.viewDate, i.dayViewStart, i.dayViewEnd, i.dayViewSplit) : i.view = t.getWeekView(i.events, i.viewDate)
            }), i.weekResized = function (n, e, t) {
                var l = a(n.startsAt), i = a(n.endsAt);
                "start" === e ? l.add(t, "days") : i.add(t, "days")
            }, i.tempTimeChanged = function (n, e) {
                var t = e * i.dayViewSplit;
                n.tempStartsAt = a(n.startsAt).add(t, "minutes").toDate()
            }
        }]).directive("mwlCalendarWeek", ["calendarConfig", function (n) {
            return {
                templateUrl: n.templates.calendarWeekView,
                restrict: "E",
                require: "^mwlCalendar",
                scope: {
                    events: "=",
                    viewDate: "=",
                    dayViewStart: "=",
                    dayViewEnd: "=",
                    dayViewSplit: "=",
                    onTimespanClick: "="
                },
                controller: "MwlCalendarWeekCtrl as vm",
                link: function (n, e, a, t) {
                    n.vm.calendarCtrl = t
                },
                bindToController: !0
            }
        }])
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").controller("MwlCalendarYearCtrl", ["$scope", "moment", "calendarHelper", "calendarConfig", "$filter", function (n, e, a, t, l) {
            var i = this;
            i.calendarConfig = t, i.openMonthIndex = null, i.openRowIndex = null, n.$on("calendar.refreshView", function () {
                if ("year" === i.viewPeriod) {
                    if (!i.viewDate) return;
                    i.loadingDone = !1, i.view = [], i.weekDays = a.getWeekDayNames(), i.view = a.getYearView(i.events, i.viewDate, i.cellModifier), i.yearCount = 0;
                    var n = i.viewDate,
                        t = (l("date")(new Date, "yyyy-MM-dd"), l("date")(i.viewDate, "yyyy-MM-dd"), i.viewDate.getMonth());
                    i.view.forEach(function (e) {
                        n.setMonth(i.yearCount), i.monthView = a.getMonthView(i.events, n, i.cellModifier, i.planItems, "year");
                        var t = Math.floor(i.monthView.length / 7);
                        i.monthOffsets = [];
                        for (var l = 0; t > l; l++) i.monthOffsets.push(7 * l);
                        i.view[i.yearCount].monthData = i.monthView, i.view[i.yearCount].monthOffsets = i.monthOffsets, i.yearCount++
                    }), i.viewDate.setMonth(t), i.cellIsOpen && null === i.openMonthIndex && null === i.openRowIndex && (i.openMonthIndex = null, i.openDayIndex = null, i.view.forEach(function (n) {
                        e(i.viewDate).startOf("month").isSame(n.date) && i.monthClicked(n, !0)
                    }), i.view.forEach(function (n) {
                        n.inMonth && e(i.viewDate).startOf("day").isSame(n.date) && i.dayClicked(n, !0)
                    })), i.loadingDone = !0
                }
            }), i.monthClicked = function (n, e, a) {
                if (e || (i.onTimespanClick({
                    calendarDate: n.date.toDate(),
                    calendarCell: n,
                    $event: a
                }), !a || !a.defaultPrevented)) {
                    i.openRowIndex = null;
                    var t = i.view.indexOf(n);
                    t === i.openMonthIndex ? (i.openMonthIndex = null, i.cellIsOpen = !1) : (i.openMonthIndex = t, i.openRowIndex = Math.floor(t / 4), i.cellIsOpen = !0)
                }
            }
        }]).directive("mwlCalendarYear", ["calendarConfig", function (n) {
            return {
                templateUrl: n.templates.calendarYearView,
                restrict: "E",
                require: "^mwlCalendar",
                scope: {
                    events: "=",
                    viewDate: "=",
                    planItems: "=",
                    yearView: "=",
                    offsets: "=",
                    viewPeriod: "=",
                    cellIsOpen: "=",
                    onTimespanClick: "=",
                    cellModifier: "=",
                    slideBoxDisabled: "="
                },
                controller: "MwlCalendarYearCtrl as vm",
                link: function (n, e, a, t) {
                    n.vm.calendarCtrl = t
                },
                bindToController: !0
            }
        }])
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").controller("MwlCollapseFallbackCtrl", ["$scope", "$attrs", "$element", function (n, e, a) {
            n.$watch(e.mwlCollapseFallback, function (n) {
                n ? a.addClass("ng-hide") : a.removeClass("ng-hide")
            })
        }]).directive("mwlCollapseFallback", ["$injector", function (n) {
            return n.has("uibCollapseDirective") ? {} : {restrict: "A", controller: "MwlCollapseFallbackCtrl"}
        }])
    }, function (n, e, a) {
        "use strict";
        var t = a(12);
        t.module("mwl.calendar").controller("MwlDateModifierCtrl", ["$element", "$attrs", "$scope", "moment", function (n, e, a, l) {
            function i() {
                t.isDefined(e.setToToday) ? d.date = new Date : t.isDefined(e.increment) ? d.date = l(d.date).add(1, d.increment).toDate() : t.isDefined(e.decrement) && (d.date = l(d.date).subtract(1, d.decrement).toDate()), a.$apply()
            }

            var d = this;
            n.bind("click", i), a.$on("$destroy", function () {
                n.unbind("click", i)
            })
        }]).directive("mwlDateModifier", function () {
            return {
                restrict: "A",
                controller: "MwlDateModifierCtrl as vm",
                scope: {date: "=", increment: "=", decrement: "="},
                bindToController: !0
            }
        })
    }, function (n, e, a) {
        "use strict"
    }, function (n, e, a) {
        "use strict"
    }, function (n, e, a) {
        "use strict"
    }, function (n, e, a) {
        "use strict";
        var t = a(12);
        t.module("mwl.calendar").controller("MwlElementDimensionsCtrl", ["$element", "$scope", "$parse", "$attrs", "$window", function (n, e, a, l, i) {
            function d() {
                a(l.mwlElementDimensions).assign(e, {
                    width: n[0].offsetWidth,
                    height: n[0].offsetHeight
                }), e.$applyAsync()
            }

            var s = t.element(i);
            s.bind("resize", d), d(), e.$on("$destroy", function () {
                s.unbind("resize", d)
            })
        }]).directive("mwlElementDimensions", function () {
            return {restrict: "A", controller: "MwlElementDimensionsCtrl"}
        })
    }, function (n, e, a) {
        "use strict"
    }, function (n, e, a) {
        function t(n) {
            return a(l(n))
        }

        function l(n) {
            return i[n] || function () {
                throw new Error("Cannot find module '" + n + "'.")
            }()
        }

        var i = {"./calendarDate.js": 39, "./calendarLimitTo.js": 40, "./calendarTrustAsHtml.js": 42};
        t.keys = function () {
            return Object.keys(i)
        }, t.resolve = l, n.exports = t, t.id = 38
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").filter("calendarDate", ["calendarHelper", "calendarConfig", function (n, e) {
            function a(a, t, l) {
                return !0 === l && (t = e.dateFormats[t]), n.formatDate(a, t)
            }

            return a.$stateful = !0, a
        }])
    }, function (n, e, a) {
        "use strict";
        var t = a(12);
        t.module("mwl.calendar").filter("calendarLimitTo", ["limitToFilter", function (n) {
            return t.version.minor >= 4 ? n : function (n, e, a) {
                return e = Math.abs(Number(e)) === 1 / 0 ? Number(e) : parseInt(e), isNaN(e) ? n : (t.isNumber(n) && (n = n.toString()), t.isArray(n) || t.isString(n) ? (a = 0 > (a = !a || isNaN(a) ? 0 : parseInt(a)) && a >= -n.length ? n.length + a : a, e >= 0 ? n.slice(a, a + e) : 0 === a ? n.slice(e, n.length) : n.slice(Math.max(0, a + e), a)) : n)
            }
        }])
    }, function (n, e, a) {
        "use strict"
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").filter("calendarTrustAsHtml", ["$sce", function (n) {
            return function (e) {
                return n.trustAsHtml(e)
            }
        }])
    }, function (n, e, a) {
        function t(n) {
            return a(l(n))
        }

        function l(n) {
            return i[n] || function () {
                throw new Error("Cannot find module '" + n + "'.")
            }()
        }

        var i = {
            "./calendarConfig.js": 44,
            "./calendarHelper.js": 45,
            "./calendarTitle.js": 46,
            "./interact.js": 47,
            "./moment.js": 49
        };
        t.keys = function () {
            return Object.keys(i)
        }, t.resolve = l, n.exports = t, t.id = 43
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").constant("calendarConfig", {
            allDateFormats: {
                moment: {
                    date: {
                        hour: "ha",
                        day: "D MMM",
                        month: "MMMM",
                        weekDay: "ddd",
                        time: "HH:mm",
                        datetime: "MMM D, h:mm a"
                    },
                    title: {day: "dddd D MMMM, YYYY", week: "Week {week} of {year}", month: "MMMM YYYY", year: "YYYY"}
                }
            },
            get dateFormats() {
                return this.allDateFormats[this.dateFormatter].date
            },
            get titleFormats() {
                return this.allDateFormats[this.dateFormatter].title
            },
            dateFormatter: "moment",
            displayEventEndTimes: !1,
            showTimesOnWeekView: !1,
            displayAllMonthEvents: !1,
            i18nStrings: {weekNumber: "Week {week}"},
            templates: {}
        })
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").factory("calendarHelper", ["$q", "$templateRequest", "dateFilter", "moment", "calendarConfig", "$filter", function (n, e, a, t, l, i) {
            function d(n, e) {
                if ("moment" === l.dateFormatter) return t(n).format(e);
                throw new Error("Unknown date formatter: " + l.dateFormatter)
            }

            function s(n, e, a) {
                if (!a) return a;
                var l = t(e).diff(t(n));
                return t(a).add(l)
            }

            function o(n, e, a) {
                var l = t(n.start), i = t(n.end), d = t(a);
                if (e) {
                    switch (e) {
                        case"year":
                            l.set({year: d.year()});
                            break;
                        case"month":
                            l.set({year: d.year(), month: d.month()});
                            break;
                        default:
                            throw new Error("Invalid value (" + e + ") given for recurs on. Can only be year or month.")
                    }
                    i = s(n.start, l, i)
                }
                return {start: l, end: i}
            }

            function c(n, e, a) {
                e = t(e), a = t(a);
                var l = o({start: n.startsAt, end: n.endsAt || n.startsAt}, n.recursOn, e), i = l.start, d = l.end;
                return i.isAfter(e) && i.isBefore(a) || d.isAfter(e) && d.isBefore(a) || i.isBefore(e) && d.isAfter(a) || i.isSame(e) || d.isSame(a)
            }

            function r(n, e, a) {
                return n.filter(function (n) {
                    return console.log("e " + n), c(n, e, a)
                })
            }

            function v(n, e) {
                for (var a = t(e).startOf("week"), i = t(e).endOf("week"), s = a.clone(), c = [], v = t().startOf("day"); c.length < 7;) c.push({
                    weekDayLabel: d(s, l.dateFormats.weekDay),
                    date: s.clone(),
                    dayLabel: d(s, l.dateFormats.day),
                    isPast: s.isBefore(v),
                    isToday: s.isSame(v),
                    isFuture: s.isAfter(v),
                    isWeekend: [0, 6].indexOf(s.day()) > -1
                }), s.add(1, "day");
                return {
                    days: c, events: r(n, a, i).map(function (n) {
                        var e, l = t(a).startOf("day"), d = t(i).startOf("day"), s = o({
                            start: t(n.startsAt).startOf("day"),
                            end: t(n.endsAt || n.startsAt).startOf("day")
                        }, n.recursOn, l), c = s.start, r = s.end;
                        return e = c.isBefore(l) || c.isSame(l) ? 0 : c.diff(l, "days"), r.isAfter(d) && (r = d), c.isBefore(l) && (c = l), n.daySpan = t(r).diff(c, "days") + 1, n.dayOffset = e, n
                    })
                }
            }

            function m(n, e, a, l, i) {
                var d = t(a || "00:00", "HH:mm").hours(), s = t(l || "23:00", "HH:mm").hours(), o = 60 / i * 30,
                    v = t(e).startOf("day").add(d, "hours"), m = t(e).startOf("day").add(s + 1, "hours"),
                    w = (s - d + 1) * o, f = o / 60, h = [];
                return r(n, t(e).startOf("day").toDate(), t(e).endOf("day").toDate()).map(function (n) {
                    if (t(n.startsAt).isBefore(v) ? n.top = 0 : n.top = t(n.startsAt).startOf("minute").diff(v.startOf("minute"), "minutes") * f - 2, t(n.endsAt || n.startsAt).isAfter(m)) n.height = w - n.top; else {
                        var e = n.startsAt;
                        t(n.startsAt).isBefore(v) && (e = v.toDate()), n.endsAt ? n.height = t(n.endsAt).diff(t(e), "minutes") * f : n.height = 30
                    }
                    return n.top - n.height > w && (n.height = 0), n.left = 0, n
                }).filter(function (n) {
                    return n.height > 0
                }).map(function (n) {
                    var e = !0;
                    return h.forEach(function (a, t) {
                        var l = !0;
                        a.filter(function (n) {
                            return !n.allDay
                        }).forEach(function (e) {
                            (c(n, e.startsAt, e.endsAt || e.startsAt) || c(e, n.startsAt, n.endsAt || n.startsAt)) && (l = !1)
                        }), l && e && (e = !1, n.left = 150 * t, h[t].push(n))
                    }), e && (n.left = 150 * h.length, h.push([n])), n
                })
            }

            return {
                getWeekDayNames: function () {
                    for (var n = [], e = 0; 7 > e;) n.push(d(t().weekday(e++), l.dateFormats.weekDay));
                    return n
                }, getYearView: function (n, e, a) {
                    for (var i = [], s = (p = "year", r(n, t(h = e).startOf(p), t(h).endOf(p))), o = t(e).startOf("year"), c = 0; 12 > c;) {
                        var v = o.clone(), m = r(s, v, v.clone().endOf("month")), w = {
                            label: d(v, l.dateFormats.month),
                            isToday: v.isSame(t().startOf("month")),
                            events: m,
                            date: v,
                            badgeTotal: (f = m, f.filter(function (n) {
                                return !1 !== n.incrementsBadgeTotal
                            }).length)
                        };
                        a({calendarCell: w}), i.push(w), o.add(1, "month"), c++
                    }
                    var f, h, p;
                    return i
                }, getMonthView: function (n, e, a, l, d) {
                    for (var s = t(e).startOf("month").clone().startOf("week"), o = t(e).endOf("month").endOf("week"), c = [], r = t().startOf("day"); s.isBefore(o);) {
                        var v = s.month() === t(e).month(), m = !1, w = i("date")(new Date(s.clone()), "yyyy-MM-dd"),
                            f = [], h = 1;
                        for (var p in l) moment(l[p].plannedStartTime).format("YYYY-MM-DD") == w && ("month" == d && f.push(l[p]), m = !0) && (h = "orange" == l[p].color ? 0 : 1);
                        var g = {
                            label: s.date(),
                            date: s.clone(),
                            hours: f,
                            inMonth: v,
                            isPlanData: m,
                            isExclude: !h,
                            isPast: r.isAfter(s),
                            isToday: r.isSame(s),
                            isFuture: r.isBefore(s),
                            isWeekend: [0, 6].indexOf(s.day()) > -1
                        };
                        a({calendarCell: g}), c.push(g), s.add(1, "day")
                    }
                    return c
                }, getWeekView: v, getDayView: m, getWeekViewWithTimes: function (n, e, a, l, i) {
                    var d = v(n, e), s = [];
                    return d.days.forEach(function (n) {
                        var e = m(d.events.filter(function (e) {
                            return t(e.startsAt).startOf("day").isSame(t(n.date).startOf("day"))
                        }), n.date, a, l, i);
                        s = s.concat(e)
                    }), d.events = s, d
                }, getDayViewHeight: function (n, e, a) {
                    var l = t(n || "00:00", "HH:mm"), i = 60 / a * 30;
                    return (t(e || "23:00", "HH:mm").diff(l, "hours") + 1) * i + 2
                }, adjustEndDateFromStartDiff: s, formatDate: d, loadTemplates: function () {
                    var a = Object.keys(l.templates).map(function (n) {
                        var a = l.templates[n];
                        return e(a)
                    });
                    return n.all(a)
                }, eventIsInPeriod: c
            }
        }])
    }, function (n, e, a) {
        "use strict";
        a(12).module("mwl.calendar").factory("calendarTitle", ["moment", "calendarConfig", "calendarHelper", function (n, e, a) {
            return {
                day: function (n) {
                    return a.formatDate(n, e.titleFormats.day)
                }, week: function (a) {
                    return e.titleFormats.week.replace("{week}", n(a).isoWeek()).replace("{year}", n(a).startOf("week").format("YYYY"))
                }, month: function (n) {
                    return a.formatDate(n, e.titleFormats.month)
                }, year: function (n) {
                    return a.formatDate(n, e.titleFormats.year)
                }
            }
        }])
    }, function (n, e, a) {
        "use strict";
        var t, l = a(12);
        try {
            t = a(48)
        } catch (n) {
            t = null
        }
        l.module("mwl.calendar").constant("interact", t)
    }, function (n, a) {
        if (void 0 === e) {
            var t = new Error('Cannot find module "undefined"');
            throw t.code = "MODULE_NOT_FOUND", t
        }
        n.exports = e
    }, function (n, e, a) {
        "use strict";
        var t = a(12), l = a(50);
        l.locale("en_gb", {week: {dow: 1}}), t.module("mwl.calendar").constant("moment", l)
    }, function (n, e) {
        n.exports = a
    }])
});
