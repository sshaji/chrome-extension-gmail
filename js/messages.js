(function () {
    messages = {
        /**
         * Get translation
         */
        get: function (key) {
            try {
                return chrome.i18n.getMessage(key);
            } catch (err) {
                return '!' + key;
            }
        },

        /**
         * Get current locale
         */
        locale: function () {
            var lang = messages.get('@@ui_locale');
            return (!utility.isEmpty(lang)) ? lang : chrome.runtime.getManifest().default_locale;
        }
    };
})();
