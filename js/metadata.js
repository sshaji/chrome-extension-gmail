(function () {
    metadata = {
        /**
         * Sugar metadata
         */
        MODULES: [],
        LANGUAGE: "",
        CURRENCY_SYMBOL: "",

        /**
         * Get Sugar metadata
         */
        get: function () {
            return rest.metadata();
        },

        /**
         * Get Sugar labels
         */
        getLabels: function () {
            var language = messages.locale();
            //Sugar needs full 5 char language format
            if (language.length == 2) language = language + "_" + language.toUpperCase();
            return rest.lang(language);
        },

        /**
         * Update plugin metadata from latest Sugar metadata
         */
        update: function (metadataResult, langResult) {
            metadata.LANGUAGE = messages.locale();
            metadata.MODULES = [];
            try {
                var sugarLabels = JSON.parse(langResult.responseText);
                var sugarMetadata = JSON.parse(metadataResult.responseText);
                //Get link modules info
                var fields = sugarMetadata.modules.Emails.fields;
                for (var key in fields) {
                    if (fields.hasOwnProperty(key)) {
                        var field = fields[key];
                        if (field.type === "link") {
                            var moduleName = field.module;
                            var linkName = field.name;
                            if (!utility.arrayContains(metadata.ignoreLinks(), linkName)) {
                                try {
                                    var moduleLabel = sugarLabels.app_list_strings.moduleList[moduleName];
                                } catch (err) {
                                    moduleLabel = moduleName;
                                }
                                try {
                                    var moduleSingularLabel = sugarLabels.app_list_strings.moduleListSingular[moduleName];
                                } catch (err) {
                                    moduleSingularLabel = moduleName;
                                }
                                metadata.MODULES.push({module: moduleName, link: linkName, label: moduleLabel, singularLabel: moduleSingularLabel});
                            }
                        }
                    }
                }
                //Get default currency symbol
                metadata.CURRENCY_SYMBOL = sugarMetadata.currencies[-99].symbol;
            } catch (err) {
                console.error("metadata.update : Error : " + err);
            }
        },

        /**
         * Ignore these links in meta-data
         */
        ignoreLinks: function () {
            return [
                "team_link",
                "team_count_link",
                "teams",
                "created_by_link",
                "modified_user_link",
                "assigned_user_link",
                "meetings", "tasks",
                "notes",
                "users" ];
        },

        /**
         * Check if metadata is outdated
         */
        validate: function () {
            if (utility.isEmpty(sugar.USER_ID) || metadata.LANGUAGE != messages.locale()) {
                sidebar.showMetadataFix();
            }
        },

        /**
         * Get link name of a sugar parent module
         */
        getLinkName: function (module) {
            var index = metadata.getIndex(module);
            if (index != -1) {
                return metadata.MODULES[index].link;
            } else {
                sidebar.showMetadataFix();
                return module.toLowerCase();
            }
        },

        /**
         * Get sugar module label
         */
        getModuleLabel: function (module) {
            var index = metadata.getIndex(module);
            if (index != -1) {
                return metadata.MODULES[index].label;
            } else {
                sidebar.showMetadataFix();
                return module;
            }
        },

        /**
         * Get sugar module singular label
         */
        getModuleSingularLabel: function (module) {
            var index = metadata.getIndex(module);
            if (index != -1) {
                return metadata.MODULES[index].singularLabel;
            } else {
                sidebar.showMetadataFix();
                return module;
            }
        },

        /**
         * Get the index of a module in metadata
         */
        getIndex: function (module) {
            for (var i = 0; i < metadata.MODULES.length; i++) {
                if (module === metadata.MODULES[i].module) {
                    return i;
                }
            }
            return -1;
        }
    };
})();