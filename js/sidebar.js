(function () {
    sidebar = {
        //Sidebar states
        created: false,
        expanded: true,
        dataLoaded: false,

        //Sidebar div object
        div: null,

        //Sidebar contents
        emailDataLinked: "",
        sugarSenderRecord: null,
        sugarRelatedRecords: [],
        sugarMatchingRecords: [],

        /**
         * Load side bar
         */
        load: function () {
            if (!sidebar.created) sidebar.create();
            var mailID = gmail.getId();
            if (!utility.isEmpty(mailID)) {
                if (mailID !== gmail.id) {
                    gmail.id = mailID;
                    gmail.userEmail = gmail.getUserEmailFromDOM();
                    sidebar.open();
                }
            } else {
                gmail.id = "";
                sidebar.close();
            }
        },

        /**
         * Create side bar
         */
        create: function () {
            sidebar.div = document.createElement('div');
            sidebar.div.id = "_sugarSidebar";
            document.body.appendChild(sidebar.div);
            sidebar.created = true;
        },

        /**
         * Open side bar
         */
        open: function () {
            sidebar.div.innerHTML = sidebar.ui.draw();
            sidebar.div.style.cssText = "\
                position: absolute;\
                top: 108px;\
                right: -250px;\
                height: 100%;\
                width: 270px;\
                overflow: hidden;\
                z-index: 2;\
            ";
            sidebar.dataLoaded = false;
            sidebar.setPosition();
            sidebar.initializeExpandCollapse();
            chrome.storage.sync.get('sugarSidebar', function (items) {
                try {
                    sidebar.expanded = JSON.parse(items.sugarSidebar).expanded;
                } catch (err) {
                }
                if (!sidebar.expanded) sidebar.collapse();
                else sidebar.expand();
            });
        },

        /**
         * Close side bar
         */
        close: function () {
            sidebar.div.innerHTML = "";
            sidebar.div.style.cssText = "\
                position: absolute;\
                top: 108px;\
                right: 0px;\
                height: 0px;\
                width: 0px;\
		        overflow: hidden;\
	        ";
        },

        /**
         * Expand side bar
         */
        expand: function () {
            sidebar.expanded = true;
            sidebar.saveSidebarStateToChromeStorage();
            sidebar.div.style.right = "15px";
            sidebar.get("_sugarExpandCollapseImage").src = chrome.extension.getURL("img/collapse.png");
            if (!sidebar.dataLoaded) sidebar.loadData();
        },

        /**
         * Collapse side bar
         */
        collapse: function (noSave) {
            sidebar.expanded = false;
            if (!noSave) sidebar.saveSidebarStateToChromeStorage();
            sidebar.div.style.right = "-250px";
            sidebar.get("_sugarExpandCollapseImage").src = chrome.extension.getURL("img/expand.png");
        },

        /**
         * Save sidebar state
         */
        saveSidebarStateToChromeStorage: function () {
            var sugarSidebar = JSON.stringify({
                'expanded': sidebar.expanded
            });
            chrome.storage.sync.set({
                'sugarSidebar': sugarSidebar
            });
        },

        /**
         * Load side bar data
         */
        loadData: function () {
            sidebar.dataLoaded = true;
            if (gmail.isNotPrimaryAccount()) {
                //Alternate method - Try to get gmail details from DOM
                //Using this to get email details for secondary signed-in gmail accounts
                //Because, google apps script always work as the primary logged in user
                //Not a reliable method - can break if google changes gmail dom
                //Depending on GMail.js lib - https://github.com/KartikTalwar/gmail.js
                //Continue looking for another better way
                gmail.getDetailsFromDOMAndLoadSidebarData();
            } else {
                app.getEmailDetailsAndLoadSidebarData();
            }
        },

        /**
         * Load sidebar data
         */
        writeData: function () {
            sidebar.initializeSugarMenu();
            app.populateEmailRelatedData();
            sidebar.showSugarSearch();
            app.populateMatchingSugarData();
            sidebar.showUserPicture();
        },

        /**
         * Update side bar position
         */
        setPosition: function () {
            var top = 108;
            sidebar.div.style.top = top + "px";
            sidebar.div.style.height = document.body.offsetHeight - top - 10 + "px";
        },

        /**
         * Get handle to an HTML element by id
         */
        get: function (id) {
            return document.getElementById(id);
        },

        /**
         * Initialize Expand / Collapse
         */

        _click_sugarExpandCollapseLink: function () {
            if (sidebar.expanded) sidebar.collapse();
            else sidebar.expand();
        },

        initializeExpandCollapse: function () {
            //Expand / Collapse link
            var sugarExpandCollapseLink = sidebar.get("_sugarExpandCollapseLink");
            if (!sugarExpandCollapseLink.clickEventAdded) {
                sugarExpandCollapseLink.addEventListener("click", sidebar._click_sugarExpandCollapseLink, false);
                sugarExpandCollapseLink.clickEventAdded = true;
            }
        },

        /**
         * Initialize Sugar Menu
         */

        _click_sugarMenuLink: function (e) {
            menu.toggle("_sugarDropDownMenu", e);
        },

        _click_sugarAddContactsToSugarMenuButton: function () {
            ga.reportPageView("Menu/AddContactsToSugar");
            sidebar.hideSugarSettings();
            sidebar.showAddContactToSugar();
        },

        _click_sugarSettingsMenuButton: function () {
            ga.reportPageView("Menu/Settings");
            sugar.openSettings();
        },

        _click_sugarAboutMenuButton: function () {
            ga.reportPageView("Menu/About");
            alert(app.name() + '\n'
                + 'Version: ' + app.version() + '\n'
                + 'Copyright © 2013 SugarCRM, Inc.' + '\n\n'
                + messages.get("About_LanguageProvidedBy") + '\n\n'
                + 'Gmail is a trademark of Google Inc. Use of this trademark is subject to Google Permissions.'
            );
        },

        initializeSugarMenu: function () {
            //Menu open link
            var sugarMenuLink = sidebar.get("_sugarMenuLink");
            if (!sugarMenuLink.clickEventAdded) {
                sugarMenuLink.addEventListener("click", sidebar._click_sugarMenuLink, false);
                sugarMenuLink.clickEventAdded = true;
            }
            //Add contacts to Sugar - drop down menu
            var sugarAddContactsToSugarMenuButton = sidebar.get("_sugarAddContactsToSugarMenuButton");
            if (!sugarAddContactsToSugarMenuButton.clickEventAdded) {
                sugarAddContactsToSugarMenuButton.addEventListener("click", sidebar._click_sugarAddContactsToSugarMenuButton, false);
                sugarAddContactsToSugarMenuButton.clickEventAdded = true;
            }
            //Settings link
            var sugarSettingsMenuButton = sidebar.get("_sugarSettingsMenuButton");
            if (!sugarSettingsMenuButton.clickEventAdded) {
                sugarSettingsMenuButton.addEventListener("click", sidebar._click_sugarSettingsMenuButton, false);
                sugarSettingsMenuButton.clickEventAdded = true;
            }
            //About link
            var sugarAboutMenuButton = sidebar.get("_sugarAboutMenuButton");
            if (!sugarAboutMenuButton.clickEventAdded) {
                sugarAboutMenuButton.addEventListener("click", sidebar._click_sugarAboutMenuButton, false);
                sugarAboutMenuButton.clickEventAdded = true;
            }
        },

        /**
         * Initialize Meta data fix button
         */

        _click_sugarMetadataFixButton: function () {
            ga.reportPageView("MetadataFix");
            sidebar.hideMetadataFix();
            sugar.saveSettings();
        },

        initializeMetadataFixButton: function () {
            var sugarMetadataFixButton = sidebar.get("_sugarMetadataFixButton");
            if (!sugarMetadataFixButton.clickEventAdded) {
                sugarMetadataFixButton.addEventListener("click", sidebar._click_sugarMetadataFixButton, false);
                sugarMetadataFixButton.clickEventAdded = true;
            }
        },

        /**
         * Initialize Permission buttons
         */

        _click_sugarAllowAccessButton: function () {
            ga.reportPageView("AllowAccess");
            gmail.openPermissionDialog();
        },

        _click_sugarRefreshAfterAllowAccessButton: function () {
            ga.reportPageView("RefreshAfterAllowAccess");
            sidebar.hideSugarPermission();
            sidebar.loadData();
        },

        initializePermissionButtons: function () {
            //Allow access button
            var sugarAllowAccessButton = sidebar.get("_sugarAllowAccessButton");
            if (!sugarAllowAccessButton.clickEventAdded) {
                sugarAllowAccessButton.addEventListener("click", sidebar._click_sugarAllowAccessButton, false);
                sugarAllowAccessButton.clickEventAdded = true;
            }
            //Refresh button
            var sugarRefreshAfterAllowAccessButton = sidebar.get("_sugarRefreshAfterAllowAccessButton");
            if (!sugarRefreshAfterAllowAccessButton.clickEventAdded) {
                sugarRefreshAfterAllowAccessButton.addEventListener("click", sidebar._click_sugarRefreshAfterAllowAccessButton, false);
                sugarRefreshAfterAllowAccessButton.clickEventAdded = true;
            }
        },

        /**
         * Initialize Settings form
         */

        _click_sugarSaveSettingsButton: function () {
            if (sidebar.get("_sugarSettings_URL").value.trim() == "") {
                alert(messages.get("SettingsDialog_URLValidationMessage"));
                sidebar.get("_sugarSettings_URL").focus();
                return;
            }
            if (sidebar.get("_sugarSettings_UserName").value.trim() == "") {
                alert(messages.get("SettingsDialog_LoginValidationMessage"));
                sidebar.get("_sugarSettings_UserName").focus();
                return;
            }
            if (sidebar.get("_sugarSettings_Password").value.trim() == "") {
                alert(messages.get("SettingsDialog_LoginValidationMessage"));
                sidebar.get("_sugarSettings_Password").focus();
                return;
            }
            sugar.URL = sidebar.get("_sugarSettings_URL").value.trim();
            if (sugar.URL.charAt(sugar.URL.length - 1) != "/") sugar.URL += "/";
            sugar.USER_NAME = sidebar.get("_sugarSettings_UserName").value.trim();
            sugar.PASSWORD = sidebar.get("_sugarSettings_Password").value.trim();
            ga.reportPageView("SaveSettings");
            sugar.saveSettings();
        },

        _click_sugarCancelSettingsButton: function () {
            sidebar.hideSugarSettings();
        },

        initializeSettingsForm: function () {
            //Set field values
            sidebar.get("_sugarSettings_URL").value = sugar.URL;
            sidebar.get("_sugarSettings_UserName").value = sugar.USER_NAME;
            sidebar.get("_sugarSettings_Password").value = sugar.PASSWORD;
            //Save settings button
            var sugarSaveSettingsButton = sidebar.get("_sugarSaveSettingsButton");
            if (!sugarSaveSettingsButton.clickEventAdded) {
                sugarSaveSettingsButton.addEventListener("click", sidebar._click_sugarSaveSettingsButton, false);
                sugarSaveSettingsButton.clickEventAdded = true;
            }
            //Cancel button
            var sugarCancelSettingsButton = sidebar.get("_sugarCancelSettingsButton");
            if (!sugarCancelSettingsButton.clickEventAdded) {
                sugarCancelSettingsButton.addEventListener("click", sidebar._click_sugarCancelSettingsButton, false);
                sugarCancelSettingsButton.clickEventAdded = true;
            }
        },

        /**
         * Initialize Sugar Search combo and button
         */

        _click_sugarSearchButton: function () {
            ga.reportPageView("Search");
            app.populateMatchingSugarData();
        },

        initializeSugarSearch: function () {
            //Module selection combo box
            var sugarSearchModule = sidebar.get("_sugarSearchModule");
            if (!sugarSearchModule.optionsAdded) {
                for (var i = 0; i < metadata.MODULES.length; i++) {
                    var opt = document.createElement("option");
                    sugarSearchModule.options.add(opt);
                    opt.text = metadata.getModuleLabel(metadata.MODULES[i].module);
                    opt.value = metadata.MODULES[i].module;
                    //if (metadata.MODULES[i].module === "Contacts") sugarSearchModule.selectedIndex = i;
                }
                sugarSearchModule.optionsAdded = true;
            }
            //Search button
            var sugarSearchButton = sidebar.get("_sugarSearchButton");
            if (!sugarSearchButton.clickEventAdded) {
                sugarSearchButton.addEventListener("click", sidebar._click_sugarSearchButton, false);
                sugarSearchButton.clickEventAdded = true;
            }
        },

        /**
         * Get search text
         */
        getSearchText: function () {
            return sidebar.get("_sugarSearchField").value;
        },

        /**
         * Get search module
         */
        getSearchModule: function () {
            var sugarSearchModule = sidebar.get("_sugarSearchModule");
            return sugarSearchModule.options[sugarSearchModule.selectedIndex].value;
        },

        /**
         * Initialize Link email button
         */

        _click_sugarLinkEmailButton: function () {
            var sugarrecords = document.getElementsByName("_sugarRecords");
            var parentRecords = [];
            for (var i = 0; i < sugarrecords.length; i++) {
                if (sugarrecords[i].checked) {
                    parentRecords.push(sugarrecords[i].value);
                }
            }
            if (parentRecords.length == 0) {
                alert("Please select one or more Sugar record(s)");
            } else {
                ga.reportPageView("LinkEmail");
                app.linkEmailToSugar(parentRecords);
            }
        },

        initializeLinkEmailButton: function () {
            var sugarLinkEmailButton = sidebar.get("_sugarLinkEmailButton");
            if (!sugarLinkEmailButton.clickEventAdded) {
                sugarLinkEmailButton.addEventListener("click", sidebar._click_sugarLinkEmailButton, false);
                sugarLinkEmailButton.clickEventAdded = true;
            }
        },

        /**
         * Initialize Add Contact to sugar button
         */

        _click_sugarAddContactsToSugarButton: function () {
            ga.reportPageView("AddContactsToSugar");
            sidebar.hideSugarSettings();
            sidebar.showAddContactToSugar();
        },

        initializeAddContactsToSugarButton: function () {
            var sugarAddContactsToSugarButton = sidebar.get("_sugarAddContactsToSugarButton");
            if (!sugarAddContactsToSugarButton.clickEventAdded) {
                sugarAddContactsToSugarButton.addEventListener("click", sidebar._click_sugarAddContactsToSugarButton, false);
                sugarAddContactsToSugarButton.clickEventAdded = true;
            }
        },

        /**
         * Initialize Add Contact to Sugar form
         */

        _reset_sugarRecord_fields: function () {
            var sugarAddContactToSugarPerson = sidebar.get("_sugarAddContactToSugarPerson");
            var value = sugarAddContactToSugarPerson.options[sugarAddContactToSugarPerson.selectedIndex].value;
            sidebar.get("_sugarRecord_first_name").value = utility.parseEmail(value).firstname;
            sidebar.get("_sugarRecord_last_name").value = utility.parseEmail(value).lastname;
            sidebar.get("_sugarRecord_account_name").value = "";
            sidebar.get("_sugarRecord_title").value = "";
            sidebar.get("_sugarRecord_email1").value = utility.parseEmail(value).email;
            sidebar.get("_sugarRecord_phone_work").value = "";
            sidebar.get("_sugarRecord_phone_mobile").value = "";
        },

        _onkeydown_sugarRecord_account_name: function () {
            selection.show(this, "Accounts");
        },

        _click_sugarSaveContactToSugarButton: function () {
            if (sidebar.get("_sugarRecord_last_name").value.trim() == "") {
                alert(messages.get("PersonFormDialog_LastNameValidationMessage"));
                sidebar.get("_sugarRecord_last_name").focus();
                return;
            }
            if (sidebar.get("_sugarRecord_email1").value.trim() == "") {
                alert(messages.get("PersonFormDialog_EmailValidationMessage"));
                sidebar.get("_sugarRecord_email1").focus();
                return;
            }
            ga.reportPageView("SaveContactToSugar");
            app.saveContactToSugar();
        },

        _click_sugarCancelContactToSugarButton: function () {
            sidebar.hideAddContactToSugar();
        },

        initializeAddContactToSugarForm: function () {
            //Populate emails
            var sugarAddContactToSugarPerson = sidebar.get("_sugarAddContactToSugarPerson");
            if (!sugarAddContactToSugarPerson.optionsAdded) {
                for (var i = 0; i < gmail.allEmails.length; i++) {
                    var opt = document.createElement("option");
                    sugarAddContactToSugarPerson.options.add(opt);
                    var name = utility.parseEmail(gmail.allEmails[i]).fullname.trim();
                    opt.text = (!utility.isEmpty(name)) ? name : gmail.allEmails[i];
                    opt.value = gmail.allEmails[i];
                }
                sugarAddContactToSugarPerson.selectedIndex = 0;
                //Set on change for person selection
                sugarAddContactToSugarPerson.addEventListener("change", function () {
                    sidebar._reset_sugarRecord_fields();
                }, false);
                sugarAddContactToSugarPerson.optionsAdded = true;
            }
            //Set default field values
            sidebar._reset_sugarRecord_fields();
            //Module selection combo box
            var sugarAddContactToSugarModule = sidebar.get("_sugarAddContactToSugarModule");
            if (!sugarAddContactToSugarModule.optionsAdded) {
                var modules = ["Contacts", "Leads"];
                for (i = 0; i < modules.length; i++) {
                    opt = document.createElement("option");
                    sugarAddContactToSugarModule.options.add(opt);
                    opt.text = metadata.getModuleSingularLabel(modules[i]);
                    opt.value = modules[i];
                }
                sugarAddContactToSugarModule.optionsAdded = true;
            }
            //Account selection
            var sugarRecord_account_name = sidebar.get("_sugarRecord_account_name");
            if (!sugarRecord_account_name.keydownEventAdded) {
                sugarRecord_account_name.addEventListener("keydown", sidebar._onkeydown_sugarRecord_account_name, false);
                sugarRecord_account_name.keydownEventAdded = true;
            }
            //Save button
            var sugarSaveContactToSugarButton = sidebar.get("_sugarSaveContactToSugarButton");
            if (!sugarSaveContactToSugarButton.clickEventAdded) {
                sugarSaveContactToSugarButton.addEventListener("click", sidebar._click_sugarSaveContactToSugarButton, false);
                sugarSaveContactToSugarButton.clickEventAdded = true;
            }
            //Cancel button
            var sugarCancelContactToSugarButton = sidebar.get("_sugarCancelContactToSugarButton");
            if (!sugarCancelContactToSugarButton.clickEventAdded) {
                sugarCancelContactToSugarButton.addEventListener("click", sidebar._click_sugarCancelContactToSugarButton, false);
                sugarCancelContactToSugarButton.clickEventAdded = true;
            }
        },

        /**
         * Display email data
         */
        displayEmailData: function () {
            sidebar.get("_emailData").innerHTML = sidebar.emailDataLinked;
        },

        /**
         * Clear email data
         */
        clearEmailData: function () {
            sidebar.emailDataLinked = "";
            sidebar.get("_emailData").innerHTML = "";
        },

        /**
         * Display sugar Sender record
         */
        displaySugarSenderRecord: function (record) {
            sidebar.get("_sugarSenderRecord").innerHTML += sidebar.sugarSenderRecordHTML(record) + "<br>";
            sidebar.get("_sugarSenderRecord").style.display = "block";
        },

        /**
         * Clear sugar Sender record
         */
        clearSugarSenderRecord: function () {
            sidebar.sugarSenderRecord = null;
            sidebar.get("_sugarSenderRecord").innerHTML = "";
            sidebar.get("_sugarSenderRecord").style.display = "none";
        },

        /**
         * Display sugar Related record
         */
        displaySugarRelatedRecord: function (record) {
            sidebar.get("_sugarRelatedRecords").innerHTML += sidebar.sugarRecordHTML(record, false, true);
            sidebar.get("_sugarRelatedRecords").style.display = "block";
        },

        /**
         * Clear sugar related records
         */
        clearSugarRelatedRecords: function () {
            sidebar.sugarRelatedRecords = [];
            sidebar.get("_sugarRelatedRecords").innerHTML = "<b>" + messages.get("Sidebar_RelatedSugarRecords") + "</b><br>";
            sidebar.get("_sugarRelatedRecords").style.display = "none";
        },

        /**
         * Display sugar matching record
         */
        displaySugarMatchingRecord: function (record) {
            sidebar.get("_sugarMatchingRecords").innerHTML += sidebar.sugarRecordHTML(record, true, true)
                + '<div class = "_sugarLinkedRecords" id = "_sugarLinkedRecords_' + record.id + '"></div>';
            sidebar.get("_sugarMatchingRecords").style.display = "block";
        },

        /**
         * Clear sugar matching records
         */
        clearSugarMatchingRecords: function () {
            sidebar.sugarMatchingRecords = [];
            sidebar.get("_sugarMatchingRecords").innerHTML = "<b>" + messages.get("Sidebar_MatchingSugarRecords") + "</b><br>";
            sidebar.get("_sugarMatchingRecords").style.display = "none";
        },

        /**
         * Display a child record linked to a matching record
         */
        displaySugarLinkedRecord: function (record, parentId) {
            sidebar.get("_sugarLinkedRecords_" + parentId).innerHTML += sidebar.sugarRecordHTML(record, true, true);
        },

        /**
         * HTML for a Sugar sender record
         */
        sugarSenderRecordHTML: function (record) {
            var id = record.id;
            var module = record._module;
            var fields = app.listDisplayFields(module);
            var picture = sidebar.sugarRecordPicture(module, id, true);
            var name = record[fields[0]];
            var recordLink = '<a href = "' + sugar.URL + '#' + module + '/' + id + '" target = "_blank" title="Click to open the record from Sugar">' + name + '</a>';
            return '\
                <table border = "0" width = "100%" cellpadding = "2" cellspacing = "0" style = "overflow-x: hidden;">\
                    <tr>\
                        <td align = "left" valign = "top">\
                            ' + picture + '\
                        </td>\
                        <td class = "_SugarSenderRecord" align = "left" valign = "top" width = "100%">\
                            <b>' + messages.get("Sidebar_SenderRecord") + '</b><br>\
                            ' + recordLink + '<br>' + sidebar.sugarRecordDetails(module, record, fields) + '\
                        </td>\
                    </tr>\
                </table>\
             ';
        },

        /**
         * HTML for a Sugar record
         */
        sugarRecordHTML: function (record, includeCheckbox, includePhoto) {
            var id = record.id;
            var module = record._module;
            var fields = app.listDisplayFields(module);
            var picture = (includePhoto) ? sidebar.sugarRecordPicture(module, id, false) : '';
            var checkbox = (includeCheckbox) ? '<input type = "checkbox" name = "_sugarRecords" value = "' + module + '.' + id + '"> ' : '';
            var name = record[fields[0]];
            name = (name.length > 32) ? name.substring(0, 30) + ".." : name;
            var recordLink = '<a href = "' + sugar.URL + '#' + module + '/' + id + '" target = "_blank" title="Click to open the record from Sugar">' + name + '</a>';
            return '\
                <table border = "0" width = "100%" cellpadding = "2" cellspacing = "0" style = "overflow-x: hidden;">\
                    <tr>\
                        <td align = "left" valign = "top">\
                            ' + picture + '\
                        </td>\
                        <td class = "_SugarRecord" align = "left" valign = "top" width = "100%">\
                            ' + checkbox + recordLink + '<br>' + sidebar.sugarRecordDetails(module, record, fields) + '\
                        </td>\
                    </tr>\
                </table>\
             ';
        },

        /**
         * Sugar record picture
         */
        sugarRecordPicture: function (module, id, largePhoto) {
            var pictureSize = (largePhoto) ? "60px" : "27px";
            var pictureHTML = '\
                <img class = _SugarRecordPicture border = "0" width = "' + pictureSize + '" height "' + pictureSize + '" align = "left" \
                src = "' + rest.getPictureURL(module, id) + '" \
                onerror = "if (this.parentElement) {this.parentElement.innerHTML = \'' + module.substring(0, 2) + '\';}"\
                >\
                ';
            return '\
                <div class = "_SugarRecordNoPicture" style = "width: ' + pictureSize + '; height: ' + pictureSize + '; background-color: ' + sidebar.sugarRecordNoPictureBgColor(module) + ';">' + pictureHTML + '</div>';
        },

        /**
         * Color to show if no picture for a record (same as in Sugar UI)
         */
        sugarRecordNoPictureBgColor: function (module) {
            switch (module) {
                case "Contacts":
                    return "#245a09";
                case "Leads":
                    return "#448fec";
                case "Prospects":
                    return "#7d0e4b";
                case "Accounts":
                    return "#37880e";
                case "Opportunities":
                    return "#7115ce";
                case "Cases":
                    return "#b81213";
                case "Bugs":
                    return "#e61718";
                default:
                    return "#177de3";
            }
        },

        /**
         * Record details to show in second line of list
         */
        sugarRecordDetails: function (module, record, fields) {
            switch (module) {
                case "Opportunities":
                    if (utility.isEmpty(metadata.CURRENCY_SYMBOL)) sidebar.showMetadataFix();
                    return record[fields[1]] + ', ' + ((!utility.isEmpty(record['currency_symbol'])) ? record['currency_symbol'] : metadata.CURRENCY_SYMBOL) + Math.round(record['amount']);
                default:
                    return (fields.length >= 3) ? record[fields[1]] + ', ' + record[fields[2]] : record[fields[1]];
            }
        },

        /**
         * Show user picture from Sugar
         */
        showUserPicture: function () {
            sidebar.get("_sugarUserPicture").src = rest.getPictureURL("Users", sugar.USER_ID);
            sidebar.get("_sugarUserPicture").title = sugar.USER_NAME;
            sidebar.get("_sugarUserPicture").onerror = function () {
                this.src = chrome.extension.getURL("img/blank.png");
            }
        },

        /**
         * Show permission screen
         */
        showSugarPermission: function () {
            sidebar.get("_sugarPermission").style.display = "inline";
            sidebar.initializePermissionButtons();
        },

        /**
         * Hide permission screen
         */
        hideSugarPermission: function () {
            sidebar.get("_sugarPermission").style.display = "none";
        },

        /**
         * Show sugar settings
         */
        showSugarSettings: function () {
            sidebar.get("_sugarSettings").style.display = "inline";
            sidebar.initializeSettingsForm();
        },

        /**
         * Hide sugar settings
         */
        hideSugarSettings: function () {
            sidebar.get("_sugarSettings").style.display = "none";
        },

        /**
         * Show Metadata fix
         */
        showMetadataFix: function () {
            sidebar.get("_sugarMetadataFix").style.display = "inline";
            sidebar.initializeMetadataFixButton();
        },

        /**
         * Hide Metadata fix
         */
        hideMetadataFix: function () {
            sidebar.get("_sugarMetadataFix").style.display = "none";
        },

        /**
         * Show Add Contacts to Sugar
         */
        showAddContactsToSugar: function () {
            sidebar.get("_sugarAddContactsToSugar").style.display = "inline";
            sidebar.initializeAddContactsToSugarButton();
        },

        /**
         * Hide Add Contacts to Sugar
         */
        hideAddContactsToSugar: function () {
            sidebar.get("_sugarAddContactsToSugar").style.display = "none";
        },

        /**
         * Show sugar Search
         */
        showSugarSearch: function () {
            sidebar.get("_sugarSearch").style.display = "inline";
            sidebar.initializeSugarSearch();
        },

        /**
         * Show sugar link
         */
        showSugarLinkEmail: function () {
            sidebar.get("_sugarLinkEmail").style.display = "inline";
            sidebar.initializeLinkEmailButton();
        },

        /**
         * Hide sugar link
         */
        hideSugarLinkEmail: function () {
            sidebar.get("_sugarLinkEmail").style.display = "none";
        },

        /**
         * Show Add Contact to Sugar form
         */
        showAddContactToSugar: function () {
            sidebar.get("_sugarAddContactToSugar").style.display = "inline";
            sidebar.initializeAddContactToSugarForm();
        },

        /**
         * Hide Add Contact to Sugar form
         */
        hideAddContactToSugar: function () {
            sidebar.get("_sugarAddContactToSugar").style.display = "none";
        },

        /**
         * Show progress
         */
        showProgress: function () {
            sidebar.get("_sugarShowProgress").style.display = "inline";
        },

        /**
         * Hide progress
         */
        hideProgress: function () {
            sidebar.get("_sugarShowProgress").style.display = "none";
        },

        /**
         * Display error messages in status pane
         */
        displayError: function (message) {
            sidebar.get("_sugarErrorPane").innerText = message;
        },

        /**
         * Display status messages in status pane
         */
        displayStatus: function (message) {
            sidebar.get("_sugarStatusPane").innerText = message;
        }
    };
})();
