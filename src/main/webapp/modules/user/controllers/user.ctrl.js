/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .controller('LoginCtrl', LoginCtrl)
        .controller('UserProfileCtrl', UserProfileCtrl);


    LoginCtrl.$inject = ['SOSAuth', '$location', '$rootScope', 'UserService', '$window','JobSchedulerService', 'gettextCatalog'];
    function LoginCtrl(SOSAuth, $location, $rootScope, UserService, $window, JobSchedulerService,gettextCatalog) {
        var vm = this;
        vm.user = {};
        vm.rememberMe = false;

        function getSchedulerIds(response) {
            JobSchedulerService.getSchedulerIds().then(function (res) {
                if(res && !res.data) {
                    SOSAuth.setIds(res);
                    SOSAuth.save();
                    getPermissions(response);
                }else{
                    $location.path('/error');
                }
            }, function(err){
                 console.log(err);
                 $location.path('/error');
            });
        }

        function getPermissions() {

            vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);

            UserService.getPermissions(vm.schedulerIds.selected).then(function (permission) {
                SOSAuth.setPermission(permission);
                SOSAuth.save();

                if ($window.sessionStorage.getItem('$SOS$URL') && $window.sessionStorage.getItem('$SOS$URL') != 'null') {

                    $location.path($window.sessionStorage.getItem('$SOS$URL')).search(JSON.parse($window.sessionStorage.getItem('$SOS$URLPARAMS')));
                } else {
                    $location.path('/');
                }
                vm.user = {};
                $rootScope.$broadcast('reloadUser');

            }, function (err) {

            });
        }

        vm.login = function () {

            if (vm.user.username && vm.user.password) {
                $('#loginBtn').text(gettextCatalog.getString("button.processing")+'...');
                vm.isProcessing = true;
                SOSAuth.currentUserData = null;

                UserService.authenticate(
                    vm.user.username,
                    vm.user.password
                ).then(function (response) {
                        if (response && response.isAuthenticated) {
                            SOSAuth.accessTokenId = response.accessToken;
                            SOSAuth.rememberMe = vm.rememberMe;
                            SOSAuth.setUser(response);
                            SOSAuth.save();
                             getSchedulerIds();

                        } else {
                            vm.loginError = 'message.loginError';
                        }
                        $('#loginBtn').text(gettextCatalog.getString("button.logIn"));
                        vm.isProcessing = false;
                    }, function (err) {
                        vm.loginError = 'message.loginError';
                        $('#loginBtn').text(gettextCatalog.getString("button.logIn"));
                        vm.isProcessing = false;
                    });
            }
        };

    }

    UserProfileCtrl.$inject = ['$rootScope', '$window', 'gettextCatalog', "$resource"];
    function UserProfileCtrl($rootScope, $window, gettextCatalog, $resource) {
        var vm = this;

        vm.zones = moment.tz.names();

        vm.perferences = {};

        vm.locales = $rootScope.locales;
        vm.perferences.locale = $rootScope.locale;

        vm.timezone = jstz().timezone_name;
        vm.perferences.zone = $window.localStorage.$SOS$ZONE;
        vm.perferences.dateFormat = $window.localStorage.$SOS$DATEFORMAT;


        vm.setLocale = function () {
            vm.locale = vm.perferences.locale;
            $rootScope.locale = vm.locale;
            $window.localStorage.$SOS$LANG = vm.locale.lang;
            $resource("modules/i18n/language_" + vm.locale.lang + ".json").get(function (data) {
                gettextCatalog.setCurrentLanguage(vm.locale.lang);
                gettextCatalog.setStrings(vm.locale.lang, data);
            });

        };

        vm.setTimeZone = function () {
            $window.localStorage.$SOS$ZONE = vm.perferences.zone;
            $rootScope.$broadcast('reloadDate');
        };

        vm.setDateFormat = function () {
            $window.localStorage.$SOS$DATEFORMAT = vm.perferences.dateFormat;
            $rootScope.$broadcast('reloadDate');
        };


    }

})();
