(function () {
    rest = {
        /**
         * Sugar Rest URL
         */
        sugarRestURL: function () {
            return sugar.URL + "rest/v10/";
        },

        /**
         * API - oauth2/token (Synchronous call)
         * @param username
         * @param password
         * @returns {*}
         */
        loginWithPassword: function (username, password) {
            try {
                var body = JSON.stringify({
                    grant_type: "password",
                    client_id: "sugar",
                    client_secret: "",
                    username: username,
                    password: password,
                    platform: "opi"
                });
                return http.postSync(rest.sugarRestURL() + "oauth2/token", body);
            } catch (err) {
                console.error("loginWithPassword : Error : " + err);
                return null;
            }
        },

        /**
         * API - oauth2/token (Synchronous call)
         * @param refresh_token
         * @returns {*}
         */
        loginWithToken: function (refresh_token) {
            try {
                var body = JSON.stringify({
                    grant_type: "refresh_token",
                    client_id: "sugar",
                    client_secret: "",
                    refresh_token: refresh_token,
                    platform: "opi"
                });
                return http.postSync(rest.sugarRestURL() + "oauth2/token", body);
            } catch (err) {
                console.error("loginWithToken : Error : " + err);
                return null;
            }
        },

        /**
         * API - me
         * @returns {*}
         */
        me: function () {
            try {
                return http.get(rest.sugarRestURL() + "me", sugar.ACCESS_TOKEN);
            } catch (err) {
                console.error("me : Error : " + err);
                return null;
            }
        },

        /**
         * API - metadata
         * @returns {*}
         */
        metadata: function () {
            try {
                return http.get(rest.sugarRestURL() + "metadata?module_filter=Emails&type_filter=modules,currencies", sugar.ACCESS_TOKEN);
            } catch (err) {
                console.error("metadata : Error : " + err);
                return null;
            }
        },

        /**
         * API - lang
         * @param language
         * @returns {*}
         */
        lang: function (language) {
            try {
                return http.get(rest.sugarRestURL() + "lang/" + language, sugar.ACCESS_TOKEN);
            } catch (err) {
                console.error("lang : Error : " + err);
                return null;
            }
        },

        /**
         * API - filter
         * @param module
         * @param filter
         * @param fields
         * @param max_num
         * @returns {*}
         */
        filter: function (module, filter, fields, max_num) {
            try {
                return http.get(rest.sugarRestURL() + module + "/filter?filter=" + filter + "&fields=" + fields + ((!utility.isEmpty(max_num)) ? "&max_num=" + max_num : ""), sugar.ACCESS_TOKEN);
            } catch (err) {
                console.error("filter : Error : " + err);
                return null;
            }
        },

        /**
         * API - search
         * @param modules
         * @param q
         * @param fields
         * @param max_num
         * @returns {*}
         */
        search: function (modules, q, fields, max_num) {
            try {
                return http.get(rest.sugarRestURL() + "search?module_list=" + modules + "&q=" + q + "&fields=" + fields + ((!utility.isEmpty(max_num)) ? "&max_num=" + max_num : ""), sugar.ACCESS_TOKEN);
            } catch (err) {
                console.error("search : Error : " + err);
                return null;
            }
        },

        /**
         * API - module - post (create record)
         * @param module
         * @param record
         * @returns {*}
         */
        create: function (module, record) {
            try {
                return http.post(rest.sugarRestURL() + module, record, sugar.ACCESS_TOKEN);
            } catch (err) {
                console.error("create : Error : " + err);
                return null;
            }
        },

        /**
         * API - module - put (update record)
         * @param module
         * @param id
         * @param record
         * @returns {*}
         */
        update: function (module, id, record) {
            try {
                return http.put(rest.sugarRestURL() + module + "/" + id, record, sugar.ACCESS_TOKEN);
            } catch (err) {
                console.error("update : Error : " + err);
                return null;
            }
        },

        /**
         * API - link - Post (link a record to another)
         * @param module
         * @param id
         * @param link
         * @param linkId
         * @returns {*}
         */
        link: function (module, id, link, linkId) {
            try {
                return http.post(rest.sugarRestURL() + module + "/" + id + "/link/" + link + "/" + linkId, null, sugar.ACCESS_TOKEN);
            } catch (err) {
                console.error("link : Error : " + err);
                return null;
            }
        },

        /**
         * API - link - Get (get linked records)
         * @param module
         * @param id
         * @param link
         * @param fields
         * @returns {*}
         */
        linkGet: function (module, id, link, fields) {
            try {
                return http.get(rest.sugarRestURL() + module + "/" + id + "/link/" + link + "?fields=" + fields, sugar.ACCESS_TOKEN);
            } catch (err) {
                console.error("linkGet : Error : " + err);
                return null;
            }
        },

        /**
         * Get Sugar record picture
         * @returns {string}
         */
        getPictureURL: function (module, id) {
            return rest.sugarRestURL() + module + "/" + id + "/file/picture?format=sugar-html-json&oauth_token=" + sugar.ACCESS_TOKEN;
        }
    };
})();