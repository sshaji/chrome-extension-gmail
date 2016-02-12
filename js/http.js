(function () {
    Deferred.define();
    http = {
        /**
         * Asynchronous Http GET call
         */
        get: function (url, token) {
            return http.asynchronousRequest("GET", url, null, token);
        },

        /**
         * Asynchronous Http POST call
         */
        post: function (url, body, token) {
            return http.asynchronousRequest("POST", url, body, token);
        },

        /**
         * Asynchronous Http PUT call
         */
        put: function (url, body, token) {
            return http.asynchronousRequest("PUT", url, body, token);
        },

        /**
         * Synchronous Http POST call (using for sugar login call)
         */
        postSync: function (url, body) {
            return http.synchronousRequest("POST", url, body);
        },

        /**
         * Http request - asynchronous
         */
        asynchronousRequest: function (method, url, body, token) {
            sidebar.showProgress();
            var d = new Deferred();
            var x = new XMLHttpRequest();
            x.onreadystatechange = function () {
                if (x.readyState == 4) {
                    sidebar.hideProgress();
                    //Success
                    if (x.status == 200) d.call(x);
                    //UnAuthorized - Token expired? - login and retry
                    else if (x.status == 401 && !utility.isEmpty(token)) {
                        if (sugar.checkLogin()) {
                            sidebar.showProgress();
                            token = sugar.ACCESS_TOKEN;
                            x = new XMLHttpRequest();
                            x.open(method, url);
                            if (!utility.isEmpty(token)) x.setRequestHeader('OAuth-Token', token);
                            if (!utility.isEmpty(body)) x.send(body); else x.send();
                            x.onreadystatechange = function () {
                                if (x.readyState == 4) {
                                    sidebar.hideProgress();
                                    if (x.status == 200) d.call(x); else d.fail(x);
                                }
                            };
                        }
                    }
                    //Failure
                    else d.fail(x);
                }
            };
            x.open(method, url);
            if (!utility.isEmpty(token)) x.setRequestHeader('OAuth-Token', token);
            if (!utility.isEmpty(body)) x.send(body); else x.send();
            return d;
        },

        /**
         * Http request - synchronous
         */
        synchronousRequest: function (method, url, body) {
            var x = new XMLHttpRequest();
            x.open(method, url, false);
            if (!utility.isEmpty(body)) x.send(body); else x.send();
            return x;
        }
    };
})();