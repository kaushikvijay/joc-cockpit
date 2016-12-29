/**
 * Created by sourabhagrawal on 26/04/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .filter('fromNow', fromNow)
        .filter('stringToDate', stringToDate)
        .filter('duration', duration)
        .filter('durationFromCurrent', durationFromCurrent)
        .filter('startFrom', startFrom)
        .filter('remainingTime', remainingTime).
        filter('timeDifferenceFilter', timeDifferenceFilter);


    fromNow.$inject =['$window'];
    function fromNow($window) {
        return function (date) {
            if(!date){
                return '-';
            }
            date = moment(date).tz($window.localStorage.$SOS$ZONE);
            return moment(date).fromNow();

        }
    }

    stringToDate.$inject =['$window'];
    function stringToDate($window) {
        return function (date) {
            if(!date) return '-';
            return moment(date).tz($window.localStorage.$SOS$ZONE).format($window.localStorage.$SOS$DATEFORMAT);
        }
    }

    duration.$inject =['$window'];
    function duration($window) {
        return function (d1, d2) {
            if (!d1 || !d2) return '-';

            d1 = moment(d1).tz($window.localStorage.$SOS$ZONE);
            d2 = moment(d2).tz($window.localStorage.$SOS$ZONE);
            var milliseconds = moment(d2).diff(d1);
            if (milliseconds >= 1000) {
                var s = parseInt((milliseconds / 1000) % 60),
                    m = parseInt((milliseconds / (60 * 1000)) % 60),
                    h = parseInt((milliseconds / (1000 * 60 * 60)) % 24),
                    d = parseInt(milliseconds / (1000 * 60 * 60 * 24));

                if (d == 0 && h != 0) {
                    return h + 'h ' + m + 'm ' + s + 's';
                } else if (h == 0 && m != 0) {
                    return m + 'm ' + s + ' s';
                } else if (d == 0 && h == 0 && m == 0) {
                    return s + ' sec';
                } else {
                    return d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
                }
            } else {
                return 'less than a sec';
            }
        }
    }

    durationFromCurrent.$inject =['$window'];
    function durationFromCurrent($window) {
        return function (d1, d2) {
            if (!d1) {
                d1=new Date();
            }
            if (!d2) {
                d2=new Date();
            }

            d1 = moment(d1).tz($window.localStorage.$SOS$ZONE);
            d2 = moment(d2).tz($window.localStorage.$SOS$ZONE);
            var milliseconds = Math.abs(moment(d2).diff(d1));
            if (milliseconds >= 1000) {
                var s = parseInt((milliseconds / 1000) % 60),
                    m = parseInt((milliseconds / (60 * 1000)) % 60),
                    h = parseInt((milliseconds / (1000 * 60 * 60)) % 24),
                    d = parseInt(milliseconds / (1000 * 60 * 60 * 24));

                if (d == 0 && h != 0) {
                    return h + ':'+m+'h';
                } else if (h == 0 && m != 0) {
                    return m +':'+s+ 'min';
                } else if (d == 0 && h == 0 && m == 0) {
                    return s + 'sec';
                } else {
                    if(d>1)
                        return d + 'days';
                    else
                        return d + 'day';
                }
            } else {
                return 'never' ;
            }
        }
    }

    function startFrom() {
        return function (data, start) {
             if(!data) return;
            return data.slice(start);
        }
    }

    remainingTime.$inject =['$window'];
    function remainingTime($window) {
        return function (d1) {

            var d2=new Date();

            d1 = moment(d1).tz($window.localStorage.$SOS$ZONE);
            d2 = moment(d2).tz($window.localStorage.$SOS$ZONE);
            var milliseconds = Math.abs(moment(d2).diff(d1));
            if (milliseconds >= 1000) {
                var s = parseInt((milliseconds / 1000) % 60),
                    m = parseInt((milliseconds / (60 * 1000)) % 60),
                    h = parseInt((milliseconds / (1000 * 60 * 60)) % 24),
                    d = parseInt(milliseconds / (1000 * 60 * 60 * 24));

                if (d == 0 && h != 0) {
                    return h + ':'+m+'h';
                } else if (h == 0 && m != 0) {
                    return m +':'+s+ 'min';
                } else if (d == 0 && h == 0 && m == 0) {
                    return s + 'sec';
                } else {
                    if(d>1)
                        return d + 'days';
                    else
                        return d + 'day';
                }
            } else {
                return 1+' sec' ;
            }
        }
    }

    timeDifferenceFilter.$inject = [];
    function timeDifferenceFilter() {
        return function (date) {

            if (!date) return;
            var time = date,
                timeNow = new Date().getTime(),
                difference = timeNow - time,
                seconds = Math.floor(difference / 1000),
                minutes = Math.floor(seconds / 60),
                hours = Math.floor(minutes / 60),
                days = Math.floor(hours / 24);
            if (days > 1) {
                return days + " days ago";
            } else if (days == 1) {
                return "1 day ago"
            } else if (hours > 1) {
                return hours + " hours ago";
            } else if (hours == 1) {
                return "an hour ago";
            } else if (minutes > 1) {
                return minutes + " minutes ago";
            } else if (minutes == 1) {
                return "a minute ago";
            } else {
                return "a few seconds ago";
            }
        }
    }


})();
