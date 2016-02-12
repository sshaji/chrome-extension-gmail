(function () {
    sugar = {
        URL: "",
        USER_NAME: "",
        PASSWORD: "",
        USER_ID: "",
        DEFAULT_TEAMS: [],
        ACCESS_TOKEN: "",
        REFRESH_TOKEN: "",

        /**
         * Read settings from chrome storage object and save to globals
         */
        readSettings: function (settingsObject) {
            sugar.URL = settingsObject.SUGAR_URL;
            sugar.USER_NAME = settingsObject.SUGAR_USER_NAME;
            sugar.PASSWORD = settingsObject.SUGAR_PASSWORD;
            sugar.ACCESS_TOKEN = settingsObject.ACCESS_TOKEN;
            sugar.REFRESH_TOKEN = settingsObject.REFRESH_TOKEN;
            if (!utility.isEmpty(settingsObject.SUGAR_USER_ID)) sugar.USER_ID = settingsObject.SUGAR_USER_ID;
            if (!utility.isEmpty(settingsObject.SUGAR_DEFAULT_TEAMS)) sugar.DEFAULT_TEAMS = JSON.parse(settingsObject.SUGAR_DEFAULT_TEAMS);
            if (!utility.isEmpty(settingsObject.SUGAR_METADATA)) metadata.MODULES = JSON.parse(settingsObject.SUGAR_METADATA);
            if (!utility.isEmpty(settingsObject.SUGAR_METADATA_LANGUAGE)) metadata.LANGUAGE = settingsObject.SUGAR_METADATA_LANGUAGE;
            if (!utility.isEmpty(settingsObject.SUGAR_METADATA_CURRENCY_SYMBOL)) metadata.CURRENCY_SYMBOL = settingsObject.SUGAR_METADATA_CURRENCY_SYMBOL;
        },

        /**
         * Check Sugar connection settings
         */
        checkConnectionSettings: function () {
            if (utility.isEmpty(sugar.URL) || utility.isEmpty(sugar.USER_NAME) || utility.isEmpty(sugar.PASSWORD)) {
                sugar.openSettings();
                return false;
            } else {
                return true;
            }
        },

        /**
         * Open Settings form
         */
        openSettings: function () {
            sidebar.hideAddContactToSugar();
            sidebar.showSugarSettings();
        },

        /**
         * Save Sugar connection settings
         */
        saveSettings: function () {
            sugar.ACCESS_TOKEN = "";
            sugar.REFRESH_TOKEN = "";
            sidebar.displayError("");
            if (!sugar.checkLogin()) return;
            //Update user details, labels and metadata - asynchronous calls
            //1. Get User details
            sidebar.displayStatus("Retrieving user details..");
            var userDetailsResult = null;
            next(function () {
                return sugar.getUserDetails().next(function (data) {
                    userDetailsResult = data;
                });
            }).
                next(function () {
                    sugar.getUserDetailsCallBack(userDetailsResult);
                    //2. Get Sugar Labels
                    sidebar.displayStatus("Retrieving labels..");
                    var langResult = null;
                    next(function () {
                        return metadata.getLabels().next(function (data) {
                            langResult = data;
                        });
                    }).
                        next(function () {
                            //3. Get Sugar metadata
                            sidebar.displayStatus("Retrieving metadata..");
                            var metadataResult = null;
                            next(function () {
                                return metadata.get().next(function (data) {
                                    metadataResult = data;
                                });
                            }).
                                next(function () {
                                    sidebar.displayStatus("");
                                    metadata.update(metadataResult, langResult);
                                    sugar.saveSettingsToChromeStorage();
                                    sidebar.hideSugarSettings();
                                    sidebar.open();
                                });
                        });
                });
        },

        /**
         * Save Settings to chrome storage
         */
        saveSettingsToChromeStorage: function () {
            var sugarSettings = JSON.stringify({
                'SUGAR_URL': sugar.URL,
                'SUGAR_USER_NAME': sugar.USER_NAME,
                'SUGAR_PASSWORD': sugar.PASSWORD,
                'ACCESS_TOKEN': sugar.ACCESS_TOKEN,
                'REFRESH_TOKEN': sugar.REFRESH_TOKEN,
                'SUGAR_USER_ID': sugar.USER_ID,
                'SUGAR_DEFAULT_TEAMS': JSON.stringify(sugar.DEFAULT_TEAMS),
                'SUGAR_METADATA': JSON.stringify(metadata.MODULES),
                'SUGAR_METADATA_LANGUAGE': metadata.LANGUAGE,
                'SUGAR_METADATA_CURRENCY_SYMBOL': metadata.CURRENCY_SYMBOL
            });
            chrome.storage.sync.set({
                'sugarSettings': sugarSettings
            });
        },

        /**
         * Validate login
         */
        checkLogin: function () {
            var ret = sugar.login();
            if (ret == 401) {
                sidebar.displayError(messages.get("Message_LoginFailure"));
                return false;
            } else if (ret != 200) {
                sidebar.displayError(messages.get("Message_ConnectionFailure") + " (" + ret + ")");
                return false;
            } else {
                return true;
            }
        },

        /**
         * Login to Sugar - synchronous call - return HTTP status code
         */
        login: function (loginType) {
            sidebar.displayStatus("Connecting to Sugar...");
            try {
                if (utility.isEmpty(loginType) && !utility.isEmpty(sugar.REFRESH_TOKEN)) loginType = "refresh_token";
                var result = null;
                if (loginType == "refresh_token") {
                    result = rest.loginWithToken(sugar.REFRESH_TOKEN);
                } else {
                    result = rest.loginWithPassword(sugar.USER_NAME, sugar.PASSWORD);
                }
                if (result.status == 200) {
                    sidebar.displayStatus("Connected to Sugar");
                    var retrievedValue = JSON.parse(result.responseText);
                    sugar.ACCESS_TOKEN = retrievedValue.access_token.toString();
                    sugar.REFRESH_TOKEN = retrievedValue.refresh_token.toString();
                    sugar.saveSettingsToChromeStorage();
                } else if (loginType == "refresh_token" && result.status == 400) {
                    return sugar.login("password");
                } else {
                    if (result.status != 0) console.error("sugar.login : Error: " + result.statusText);
                }
                return result.status;
            } catch (err) {
                console.error("sugar.login : Error : " + err);
                return 0;
            }
        },

        /**
         * Get Sugar user details
         */
        getUserDetails: function () {
            return rest.me();
        },

        getUserDetailsCallBack: function (result) {
            try {
                var retrievedValue = JSON.parse(result.responseText);
                sugar.USER_ID = retrievedValue.current_user.id.toString();
                sugar.DEFAULT_TEAMS = retrievedValue.current_user.preferences.default_teams;
            } catch (err) {
                console.error("getSugarUserDetailsCallBack : Error : " + err);
            }
        }
    };
})();