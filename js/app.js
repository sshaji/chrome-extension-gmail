(function () {
    app = {
        /**
         * Get product name
         */
        name: function () {
            return chrome.runtime.getManifest().name;
        },

        /**
         * Get product version
         */
        version: function () {
            return chrome.runtime.getManifest().version;
        },

        /**
         * Get GMail details and populate Sugar data related to the email
         */
        getEmailDetailsAndLoadSidebarData: function () {
            try {
                var result = null;
                next(function () {
                    return gmail.getDetails(true).next(function (data) {
                        result = data;
                    });
                }).
                    next(function () {
                        app.getEmailDetailsAndLoadSidebarDataCallBack(result);
                    });
            } catch (err) {
                console.error("getEmailDetailsAndLoadSidebarData : " + err);
            }
        },

        getEmailDetailsAndLoadSidebarDataCallBack: function (result) {
            gmail.from = "";
            gmail.parseDetails(result.responseText);
            if (!utility.isEmpty(gmail.from)) {
                app.populateSidebarData();
            } else {
                gmail.checkPermission();
            }
        },

        /**
         * Populate sidebar data
         */
        populateSidebarData: function () {
            chrome.storage.sync.get('sugarSettings', function (items) {
                try {
                    sugar.readSettings(JSON.parse(items.sugarSettings));
                } catch (err) {
                }
                if (!sugar.checkConnectionSettings()) return;
                metadata.validate();
                sidebar.writeData();
            });
        },

        /**
         * Populate Email related data
         */
        populateEmailRelatedData: function () {
            sidebar.clearEmailData();
            sidebar.hideAddContactsToSugar();
            sidebar.clearSugarSenderRecord();
            sidebar.clearSugarRelatedRecords();
            //Check if the email sender exists in sugar. If yes, display details
            app.searchForSenderInSugar("Contacts");
            //Check if email is already linked. If linked, display related data from Sugar
            var result = null;
            next(function () {
                var filter = JSON.stringify([
                    {
                        'message_id': gmail.id
                    }
                ]);
                return rest.filter("Emails", filter, "id").next(function (data) {
                    result = data;
                });
            }).
                next(function () {
                    app.populateEmailRelatedDataCallBack(result);
                });
        },

        searchForSenderInSugar: function (module) {
            var result = null;
            next(function () {
                var filter = JSON.stringify([
                    {
                        'email_addresses.email_address': utility.parseEmail(gmail.from).email
                    }
                ]);
                return rest.filter(module, filter, app.listDisplayFields(module)).next(function (data) {
                    result = data;
                });
            }).
                next(function () {
                    if (utility.isEmpty(gmail.userEmail) || gmail.userEmail.toLowerCase() != utility.parseEmail(gmail.from).email.toLowerCase()) {
                        app.populateEmailSenderDataCallBack(result, module);
                    }
                });
        },

        populateEmailSenderDataCallBack: function (result, module) {
            try {
                var retrievedValue = JSON.parse(result.responseText);
                var record = retrievedValue.records[0];
                sidebar.sugarSenderRecord = record;
                sidebar.displaySugarSenderRecord(record);
            } catch (err) {
                if (module === "Contacts") {
                    app.searchForSenderInSugar("Leads");
                }
            }
        },

        populateEmailRelatedDataCallBack: function (result) {
            try {
                var retrievedValue = JSON.parse(result.responseText);
                var sugarId = retrievedValue.records[0].id;
                if (!utility.isEmpty(sugarId)) {
                    sidebar.emailDataLinked = '<a href = "' + sugar.URL + '#Emails/' + sugarId + '" target = "_blank" title="Click to open the Email record from Sugar">' + messages.get("Sidebar_EmailLinked") + '</a>';
                    sidebar.displayEmailData();
                    for (var i = 0; i < metadata.MODULES.length; i++) {
                        app.getRelatedSugarData(sugarId, metadata.MODULES[i].module);
                    }
                } else {
                    sidebar.showAddContactsToSugar();
                }
            } catch (err) {
                sidebar.showAddContactsToSugar();
            }
        },

        /**
         * Searching for related records in Sugar
         */
        getRelatedSugarData: function (sugarId, linkModule) {
            sidebar.displayStatus("Searching for related records in Sugar...");
            var result = null;
            next(function () {
                return rest.linkGet("Emails", sugarId, metadata.getLinkName(linkModule), app.listDisplayFields(linkModule)).next(function (data) {
                    result = data;
                });
            }).
                next(function () {
                    app.getRelatedSugarDataCallBack(result, linkModule);
                });
        },

        getRelatedSugarDataCallBack: function (result, linkModule) {
            try {
                var retrievedValue = JSON.parse(result.responseText);
                var records = retrievedValue.records;
                for (var i = 0; i < records.length; ++i) {
                    if (!utility.recordArrayContains(sidebar.sugarRelatedRecords, records[i])) {
                        sidebar.sugarRelatedRecords.push(records[i]);
                        sidebar.displaySugarRelatedRecord(records[i]);
                    }
                }
                sidebar.displayStatus("");
            } catch (err) {
                console.error("getRelatedSugarDataCallBack : Error : " + linkModule + " - " + err);
            }
        },

        /**
         * Populate Sugar data - search
         */
        populateMatchingSugarData: function () {
            sidebar.clearSugarMatchingRecords();
            sidebar.hideSugarLinkEmail();
            if (!utility.isEmpty(sidebar.getSearchText())) {
                app.getSugarDataBySearch(sidebar.getSearchModule(), sidebar.getSearchText());
            } else {
                //Populate Sugar data
                var filterArray = [];
                for (var i = 0; i < gmail.allEmails.length; i++) {
                    filterArray.push({'email_addresses.email_address': utility.parseEmail(gmail.allEmails[i]).email});
                }
                var filter = JSON.stringify([
                    {'$or': filterArray}
                ]);
                var modules = ["Contacts", "Leads", "Prospects", "Accounts"];
                for (i = 0; i < modules.length; i++) {
                    app.getSugarDataByFilter(modules[i], filter);
                }
            }
        },

        /**
         * Get matching records from Sugar using filter
         */
        getSugarDataByFilter: function (module, filter) {
            sidebar.displayStatus("Looking for matching records in Sugar...");
            var result = null;
            next(function () {
                return rest.filter(module, filter, app.listDisplayFields(module)).next(function (data) {
                    result = data;
                });
            }).
                next(function () {
                    app.getSugarDataCallBack(result, false);
                });
        },

        /**
         * Get records from Sugar using full text search
         */
        getSugarDataBySearch: function (module, q) {
            sidebar.displayStatus("Searching for records in Sugar...");
            var result = null;
            next(function () {
                return rest.search(module, q, app.listDisplayFields(module)).next(function (data) {
                    result = data;
                });
            }).
                next(function () {
                    app.getSugarDataCallBack(result, true);
                });
        },

        getSugarDataCallBack: function (result, isFullTextSearch) {
            try {
                var retrievedValue = JSON.parse(result.responseText);
                var records = retrievedValue.records;
                for (var i = 0; i < records.length; ++i) {
                    if (!utility.recordArrayContains(sidebar.sugarRelatedRecords, records[i]) && !utility.recordArrayContains(sidebar.sugarMatchingRecords, records[i])) {
                        sidebar.sugarMatchingRecords.push(records[i]);
                        sidebar.displaySugarMatchingRecord(records[i]);
                        sidebar.showSugarLinkEmail();
                        //if (!isFullTextSearch) {
                        //Get all linked records too
                        app.getLinkedSugarRecords(records[i]._module, records[i].id);
                        //}
                    }
                }
                sidebar.displayStatus("");
            } catch (err) {
                console.error("getSugarDataCallBack : Error : " + err);
            }
        },

        /**
         * Get records linked to a sugar record
         */
        getLinkedSugarRecords: function (module, id) {
            for (var j = 0; j < metadata.MODULES.length; j++) {
                var excludeModules = ["Contacts", "Leads", "Prospects", "Accounts"];
                var linkModule = metadata.MODULES[j].module;
                if (module !== linkModule && !utility.arrayContains(excludeModules, linkModule)) {
                    app.getLinkedSugarData(module, id, linkModule);
                }
            }
        },

        /**
         * Searching for records linked to a sugar record
         */
        getLinkedSugarData: function (module, id, linkModule) {
            var result = null;
            next(function () {
                return rest.linkGet(module, id, metadata.getLinkName(linkModule), app.listDisplayFields(linkModule)).next(function (data) {
                    result = data;
                });
            }).
                next(function () {
                    app.getLinkedSugarDataCallBack(result, linkModule, id);
                });
        },

        getLinkedSugarDataCallBack: function (result, module, parentId) {
            try {
                var retrievedValue = JSON.parse(result.responseText);
                var records = retrievedValue.records;
                for (var i = 0; i < records.length; ++i) {
                    if (!utility.recordArrayContains(sidebar.sugarRelatedRecords, records[i]) && !utility.recordArrayContains(sidebar.sugarMatchingRecords, records[i])) {
                        sidebar.displaySugarLinkedRecord(records[i], parentId);
                    }
                }
            } catch (err) {
                console.error("getLinkedSugarDataCallBack : Error : " + module + " - " + err);
            }
        },

        /**
         * List display fields to get from Sugar
         */
        listDisplayFields: function (module) {
            var fields = [];
            fields.push("name");
            switch (module) {
                case "Contacts":
                case "Leads":
                case "Prospects":
                    fields.push("title");
                    fields.push("account_name");
                    break;
                case "Accounts":
                    fields.push("billing_address_city");
                    fields.push("billing_address_state");
                    break;
                case "Opportunities":
                    fields.push("sales_status");
                    fields.push("amount");
                    fields.push("currency_symbol");
                    break;
                case "Cases":
                    fields.push("case_number");
                    fields.push("status");
                    break;
                case "Bugs":
                    fields.push("bug_number");
                    fields.push("status");
                    break;
                default:
                    fields.push("account_name");
            }
            return fields;
        },

        /**
         * Link email to Sugar
         */
        linkEmailToSugar: function (parentRecords) {
            sidebar.displayStatus("Linking email to Sugar...");
            //Check if email is already linked.
            var result = null;
            next(function () {
                var filter = JSON.stringify([
                    {
                        'message_id': gmail.id
                    }
                ]);
                return rest.filter("Emails", filter, "id").next(function (data) {
                    result = data;
                });
            }).
                next(function () {
                    try {
                        var retrievedValue = JSON.parse(result.responseText);
                        var sugarId = retrievedValue.records[0].id;
                    } catch (err) {
                    }
                    app.archiveEmailToSugar(sugarId, parentRecords);
                });
        },

        /**
         * Archive email and link to parent records
         */
        archiveEmailToSugar: function (sugarId, parentRecords) {
            var record = JSON.stringify({
                from_addr_name: gmail.from,
                to_addrs_names: gmail.to,
                cc_addrs_names: gmail.cc,
                bcc_addrs_names: gmail.bcc,
                name: gmail.subject,
                date_sent: gmail.date,
                description_html: gmail.body,
                message_id: gmail.id,
                status: "archived",
                type: "archived",
                assigned_user_id: sugar.USER_ID,
                team_names: sugar.DEFAULT_TEAMS
            });
            var result = null;
            next(function () {
                if (!utility.isEmpty(sugarId)) {
                    return rest.update("Emails", sugarId, record).next(function (data) {
                        result = data;
                    });
                } else {
                    return rest.create("Emails", record).next(function (data) {
                        result = data;
                    });
                }
            }).
                next(function () {
                    app.archiveEmailToSugarCallBack(result, parentRecords);
                });
        },

        archiveEmailToSugarCallBack: function (result, parentRecords) {
            try {
                var retrievedValue = JSON.parse(result.responseText);
                if (!utility.isEmpty(retrievedValue.id)) {
                    for (var i = 0; i < parentRecords.length; i++) {
                        app.linkEmailToParent(retrievedValue.id, parentRecords[i].split(".")[0], parentRecords[i].split(".")[1]);
                    }
                    app.populateEmailRelatedData();
                    app.populateMatchingSugarData();
                    sidebar.displayStatus("Email linked to Sugar record(s)");
                }
            } catch (err) {
                sidebar.displayError("Failed to link email to sugar : " + err);
            }
        },

        /**
         * Link email to parent
         */
        linkEmailToParent: function (emailId, parentModule, parentId) {
            var result = null;
            next(function () {
                return rest.link("Emails", emailId, metadata.getLinkName(parentModule), parentId).next(function (data) {
                    result = data;
                });
            }).
                next(function () {
                    //do nothing
                });
        },

        /**
         * Save Contact to Sugar
         */
        saveContactToSugar: function () {
            sidebar.displayStatus("Creating Sugar record...");
            var sugarAddContactToSugarModule = sidebar.get("_sugarAddContactToSugarModule");
            var module = sugarAddContactToSugarModule.options[sugarAddContactToSugarModule.selectedIndex].value;
            var accountName = sidebar.get("_sugarRecord_account_name").value;
            //Check if the account already exist in sugar
            //If account exists and creating contact, link it
            var result = null;
            next(function () {
                var filter = JSON.stringify([
                    {
                        'name': accountName
                    }
                ]);
                return rest.filter("Accounts", filter, "id").next(function (data) {
                    result = data;
                });
            }).
                next(function () {
                    try {
                        var retrievedValue = JSON.parse(result.responseText);
                        var accountId = retrievedValue.records[0].id;
                    } catch (err) {
                    }
                    var record = JSON.stringify({
                        first_name: sidebar.get("_sugarRecord_first_name").value,
                        last_name: sidebar.get("_sugarRecord_last_name").value,
                        account_name: accountName,
                        account_id: (module === "Contacts" & !utility.isEmpty(accountId)) ? accountId : "",
                        title: sidebar.get("_sugarRecord_title").value,
                        email1: sidebar.get("_sugarRecord_email1").value,
                        phone_work: sidebar.get("_sugarRecord_phone_work").value,
                        phone_mobile: sidebar.get("_sugarRecord_phone_mobile").value,
                        assigned_user_id: sugar.USER_ID,
                        team_names: sugar.DEFAULT_TEAMS
                    });
                    result = null;
                    next(function () {
                        return rest.create(module, record).next(function (data) {
                            result = data;
                        });
                    }).
                        next(function () {
                            app.saveContactToSugarCallBack(result, module);
                        });
                });
            sidebar.hideAddContactToSugar();
        },

        saveContactToSugarCallBack: function (result, module) {
            try {
                if (sidebar.get("_sugarAddContactToSugarLinkEmail").checked) {
                    var retrievedValue = JSON.parse(result.responseText);
                    if (!utility.isEmpty(retrievedValue.id)) {
                        var parentRecords = [];
                        parentRecords.push(module + "." + retrievedValue.id.toString());
                        app.linkEmailToSugar(parentRecords);
                    }
                } else {
                    app.populateMatchingSugarData();
                    sidebar.displayStatus("Sugar record created");
                }
            } catch (err) {
                console.error("saveContactToSugarCallBack : Error : " + err);
            }
        }
    };
})();