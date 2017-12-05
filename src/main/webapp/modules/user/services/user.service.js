!function () {
    "use strict";
    function e(e) {
        function n() {
            var e = this;
            r.forEach(function (n) {
                e[n] = o(n)
            })
        }

        function t(e, n, t) {
            var o = i + n;
            null == t && (t = ""), e[o] = t
        }

        function o(n) {
            var t = i + n;
            return e.localStorage[t] || e.sessionStorage[t] || null
        }

        var r = ["accessTokenId", "currentUserData", "sessionTimeout", "jobChain", "permission", "scheduleIds"], i = "$SOS$";
        return n.prototype.save = function () {
            var n = this, o = e.sessionStorage;
            r.forEach(function (e) {
                t(o, e, n[e])
            })
        }, n.prototype.setUser = function (e, n) {
            this.accessTokenId = e.accessToken, this.currentUserData = e.user, this.sessionTimeout = e.sessionTimeout, n && (this.permission = JSON.stringify(n))
        }, n.prototype.setPermission = function (e) {
            this.permission = JSON.stringify(e)
        }, n.prototype.setIds = function (e) {
            this.scheduleIds = JSON.stringify(e)
        }, n.prototype.clearUser = function () {
            this.accessTokenId = null, this.currentUserData = null, this.sessionTimeout = null, this.permission = null, this.scheduleIds = null, e.sessionStorage.$SOS$URL = null, e.sessionStorage.$SOS$URLPARAMS = {}
        }, n.prototype.setJobChain = function (n) {
            this.jobChain = n;
            var o = this, r = "jobChain";
            t(e.sessionStorage, r, o[r])
        }, n.prototype.getJobChain = function () {
            return this.jobChain
        }, n.prototype.clearStorage = function () {
            r.forEach(function (n) {
                t(e.sessionStorage, n, null), t(e.localStorage, n, null)
            })
        }, new n
    }

    function n() {
        var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        return {
            encode: function (n) {
                var t, o, r, i, s, c = "", u = "", a = "", f = 0;
                do t = n.charCodeAt(f++), o = n.charCodeAt(f++), u = n.charCodeAt(f++), r = t >> 2, i = (3 & t) << 4 | o >> 4, s = (15 & o) << 2 | u >> 6, a = 63 & u, isNaN(o) ? s = a = 64 : isNaN(u) && (a = 64), c = c + e.charAt(r) + e.charAt(i) + e.charAt(s) + e.charAt(a), t = o = u = "", r = i = s = a = ""; while (f < n.length);
                return c
            }
        }
    }

    function t(e, n, t, o) {
        return {
            logout: function () {
                var t = n.defer(), o = e("security/logout");
                return o.save(function (e) {
                    t.resolve(e)
                }, function (e) {
                    t.reject(e)
                }), t.promise
            }, touch: function () {
                var t = n.defer(), o = e("touch");
                return o.save(function (e) {
                    t.resolve(e)
                }, function (e) {
                    t.reject(e)
                }), t.promise
            }, authenticate: function (e, r) {
                var i = n.defer();
                return t.defaults.headers.common.Authorization = "Basic " + o.encode(e + ":" + r), t.post("security/login").then(function (e) {
                    i.resolve(e.data)
                }, function (e) {
                    i.reject(e)
                }), i.promise
            }, getPermissions: function (t) {
                var o = n.defer(), r = e("security/joc_cockpit_permissions");
                return r.save({jobschedulerId: t}, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, configuration: function (t) {
                var o = n.defer(), r = e("configuration");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, saveConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/save");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, deleteConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/delete");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, shareConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/share");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, privateConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/make_private");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, configurations: function (t) {
                var o = n.defer(), r = e("configurations");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, sharedConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/shared");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, securityConfigurationRead: function (t) {
                var o = n.defer(), r = e("security_configuration/read");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, securityConfigurationWrite: function (t) {
                var o = n.defer(), r = e("security_configuration/write");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, permissions: function (t) {
                var o = n.defer(), r = e("security/permissions");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }
        }
    }

    function o(e, n) {
        return {
            getLogs: function (t) {
                var o = n.defer(), r = e("audit_log");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, comments: function () {
                var t = n.defer(), o = e("audit_log/comments");
                return o.save({}, function (e) {
                    t.resolve(e)
                }, function (e) {
                    t.reject(e)
                }), t.promise
            }
        }
    }

    function authorizationService(UserService, $q, $rootScope, $location,SOSAuth) {
        return {

            permissionModel: {
                permission: {}
            },

            permissionCheck: function (routePath) {
                // we will return a promise .
                var deferred = $q.defer();

                var parentPointer = this;
                if (SOSAuth.permission) {
                    this.permissionModel.permission = JSON.parse(SOSAuth.permission);
                    this.getPermission(this.permissionModel, routePath, deferred);
                } else {
                    var schedulerIds = JSON.parse(SOSAuth.scheduleIds);
                    UserService.getPermissions(schedulerIds.selected).$promise.then(function (response) {
                        parentPointer.permissionModel.permission = response;
                        parentPointer.getPermission(parentPointer.permissionModel, routePath, deferred);
                    });
                }
                return deferred.promise;
            },

            getPermission: function (permissionModel, routePath, deferred) {
                var ifPermissionPassed = false;
                    switch (routePath) {
                        case 'DailyPlan':
                            if (permissionModel.permission.DailyPlan.view.status) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case 'JobChain':
                            if (permissionModel.permission.JobChain.view.status) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case 'Job':
                            if (permissionModel.permission.Job.view.status) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case 'Order':
                            if (permissionModel.permission.Order.view.status) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case 'History':
                            if (permissionModel.permission.History.view) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case 'Resource':
                            if (permissionModel.permission.JobschedulerUniversalAgent.view.status || permissionModel.permission.ProcessClass.view.status || permissionModel.permission.Schedule.view.status || permissionModel.permission.Lock.view.status) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case 'AuditLog':
                            if (permissionModel.permission.AuditLog.view.status) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case 'File Transfer':
                            if (permissionModel.permission.YADE.view.transfers) {
                                ifPermissionPassed = true;
                            }
                            break;
                        case 'ManageAccount':
                            if (permissionModel.permission.JobschedulerMaster.administration.editPermissions) {
                                ifPermissionPassed = true;
                            }
                            break;
                        default:
                            ifPermissionPassed = false;
                    }
                if (!ifPermissionPassed) {
                    if(SOSAuth.scheduleIds && JSON.parse(SOSAuth.scheduleIds))
                        $location.path('/');
                    else
                        $location.path('/error');
                    $rootScope.$on('$locationChangeSuccess', function () {
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }
            }
        };
    }
    angular.module("app").service("SOSAuth", e).service("Base64", n).service("UserService", t).service("AuditLogService", o).factory('authorizationService',authorizationService), e.$inject = ["$window"], t.$inject = ["$resource", "$q", "$http", "Base64"], o.$inject = ["$resource", "$q"],authorizationService.$inject = ["UserService", "$q", "$rootScope", "$location","SOSAuth"];
}();
