(function () {
    sidebar.ui = {
        /**
         * URL to report issue
         */
        reportIssueURL: function () {
            return "https://docs.google.com/forms/d/14pXKjJW43K7JfrAov2clcnaRH32B9xbARdm5ta_WC1w/viewform?entry.1048185915&entry.1545195729=" + app.version();
        },

        /**
         * Side bar HTML
         */
        draw: function () {
            return '\
            <table border= "0" height = "100%" width = "100%" cellpadding = "0" cellspacing = "0">\
                <tr height = "40px">\
                    <!--START : Sidebar Expand / Collapse -->\
                    <td rowspan = "2" valign = "middle">' + sidebar.ui.sidebarExpandCollapsePane() + '</td>\
                    <!--END : Sidebar Expand / Collapse -->\
                    <!--START : Sidebar Header / Menu -->\
                    <td valign = "top">' + sidebar.ui.sidebarHeaderMenuPane() + '</td>\
                    <!--END : Sidebar Header / Menu-->\
                </tr>\
                <tr>\
                    <!--START : Sidebar contents-->\
                    <td id = "_sugarSidebarMain" width = "100%">\
                        <table border= "0" height = "100%" width = "100%" cellpadding = "0" cellspacing = "0">\
                            <tr height = "19px"><td valign = "top">' + sidebar.ui.sidebarProgressPane() + '</td></tr>\
                            <tr height = "100%"><td valign = "top">' + sidebar.ui.sidebarContentsPane() + '</td></tr>\
                            <tr height = "15px"><td align = center>' + sidebar.ui.sidebarErrorPane() + '</td></tr>\
                            <tr height = "15px"><td align = center>' + sidebar.ui.sidebarStatusPane() + '</td></tr>\
                            <tr height = "20px"><td align = center bgcolor = "#E5E5E5">\
                                <div id = "_sugarIssueOrSuggestion"><b>' + messages.get("Sidebar_FoundAnIssue") + '</b><br><a href = "' + sidebar.ui.reportIssueURL() + '" target = "_blank">' + messages.get("Sidebar_IssueLetUsKnow") + '</a></div>\
                            </td></tr>\
                        </table>\
                    </td>\
                    <!--END : Sidebar contents-->\
                </tr>\
            </table>\
	        ';
        },

        /**
         * Side bar Expand / Collapse pane
         */
        sidebarExpandCollapsePane: function () {
            return ('\
            <a id = "_sugarExpandCollapseLink" href = "javascript:void()">\
            <img id = "_sugarExpandCollapseImage" border = "0" align = "top" src = "' + chrome.extension.getURL("img/collapse.png") + '"></a>\
            ');
        },

        /**
         * Side bar header and menu pane
         */
        sidebarHeaderMenuPane: function () {
            return ('\
            <table border = "0" height = "100%" width = "100%" cellpadding = "0" cellspacing = "0">\
                <tr>\
                    <td id = "_sugarHeader_Logo" align = "left" valign = "top" width = "30px">\
                        <!--START : Sugar Cube-->\
                        <img align = "left" border = "0" align = "top" src = "' + chrome.extension.getURL("img/sugarcube.png") + '">\
                        <!--END : Sugar Cube-->\
                    </td>\
                    <td id = "_sugarHeader_EmailData" align = "left" valign = "top" width = "150px">\
                        <!--START : Email data-->\
                        <div id = "_emailData"></div>\
                        <!--END : Email data-->\
                    </td>\
                    <td id = "_sugarHeader_User" align = "right" valign = "top" width = "40px">\
                        <!--START : User picture-->\
                        <img id = "_sugarUserPicture" border = "0" align = "top" width = "30" height = "30" src = "' + chrome.extension.getURL("img/blank.png") + '">\
                        <!--END : User picture-->\
                    </td>\
                    <td id = "_sugarHeader_Menu" align = "center" valign = "top" width = "30px">\
                        <!--START : Menu Link-->\
                        <a id = "_sugarMenuLink" href = "javascript:void()">\
                        <img border = "0" align = "top" src = "' + chrome.extension.getURL("img/topmenuarrow.png") + '">\
                        </a>\
                        <!--END : Menu Link-->\
                    </td>\
                </tr>\
            </table>\
            <!--START : Drop down menu-->\
            <div id = "_sugarDropDownMenu">\
                <li><a href = "javascript:void()" id = "_sugarAddContactsToSugarMenuButton">' + messages.get("SugarMenu_AddContactsToSugar") + '</a></li>\
                <li><a href = "javascript:void()" id = "_sugarSettingsMenuButton">' + messages.get("SugarMenu_Settings") + '</a></li>\
                <li><a href = "javascript:void()" id = "_sugarAboutMenuButton">' + messages.get("SugarMenu_About") + '</a></li>\
            </div>\
            <!--END : Drop down menu-->\
            ');
        },

        /**
         * Side bar progress pane
         */
        sidebarProgressPane: function () {
            return ('\
            <div id = "_sugarShowProgress" style = "display: none">\
                <img align = "top" border = "0" src = "' + chrome.extension.getURL("img/loading.gif") + '">\
            <div>\
            ');
        },

        /**
         * Side bar contents div
         */
        sidebarContentsPane: function () {
            return ('\
            <div id = "_sugarContentsPane">\
                <!--START : Metadata fix-->\
                <div id = "_sugarMetadataFix" style = "display: none">' + sidebar.ui.sidebarMetadataFix() + '</div>\
                <!--END : Metadata fix-->\
                <!--START : Permission button-->\
                <div id = "_sugarPermission" style = "display: none">' + sidebar.ui.sidebarPermission() + '</div>\
                <!--END : Permission button-->\
                <!--START : Settings form-->\
                <div id = "_sugarSettings" style = "display: none">' + sidebar.ui.sidebarSettingsForm() + '</div>\
                <!--END : Settings form-->\
                <!--START : Create Sugar record form-->\
                <div id = "_sugarAddContactToSugar" style = "display: none">' + sidebar.ui.sidebarAddContactToSugarForm() + '</div>\
                <!--END : Create Sugar record form-->\
                <!--START : Sugar Sender record-->\
                <div id = "_sugarSenderRecord"></div>\
                <!--END : Sugar Sender record-->\
                <!--START : Sugar Related records-->\
                <div id = "_sugarRelatedRecords"></div>\
                <!--END : Sugar Related records-->\
                <!--START : Sugar search-->\
                <div id = "_sugarSearch" style = "display: none">' + sidebar.ui.sidebarSearch() + '</div>\
                <!--END : Sugar search-->\
                <!--START : Sugar Matching records-->\
                <div id = "_sugarMatchingRecords"></div>\
                <!--END : Sugar Matching records-->\
                <!--START : Link email-->\
                <div id = "_sugarLinkEmail" style = "display: none">' + sidebar.ui.sidebarLinkEmail() + '</div>\
                <!--END : Link email-->\
                <!--START : Add Contacts to Sugar-->\
                <div id = "_sugarAddContactsToSugar" style = "display: none">' + sidebar.ui.sidebarAddContactsToSugar() + '</div>\
                <!--END : Add Contacts to Sugar-->\
			</div>\
			');
        },

        /**
         * Metadata fix
         */
        sidebarMetadataFix: function () {
            return '\
            <img border = "0" src = "' + chrome.extension.getURL("img/attention.png") + '"> ' + messages.get("Metadata_Outdated") + ' \
            <br><a id = "_sugarMetadataFixButton" href = "javascript:void()">' + messages.get("Metadata_ClickToFix") + '</a>\
            <br><br>\
            ';
        },

        /**
         * Permission
         */
        sidebarPermission: function () {
            return '\
            <b>' + messages.get("Sidebar_NeedPermission") + '</b>\
            <br>\
            (' + messages.get("Sidebar_RefreshMessage") + ')\
            <br>\
            <a id = "_sugarAllowAccessButton"  class = "_sugarButton" href = "javascript:void()">' + messages.get("Sidebar_AllowAccess") + '</a> \
            <a id = "_sugarRefreshAfterAllowAccessButton"  class = "_sugarButton" href = "javascript:void()">' + messages.get("Sidebar_Refresh") + '</a>\
            ';
        },

        /**
         * Settings form
         */
        sidebarSettingsForm: function () {
            return '\
            <b>' + messages.get("SettingsDialog_Title") + '</b>\
            <table border = "0" width = "100%" cellpadding = "3" cellspacing = "0">\
                <tr><td>' + messages.get("SettingsDialog_SugarURL") + ' </td><td><input type = "text" id = "_sugarSettings_URL"></td></tr>\
                <tr><td>' + messages.get("SettingsDialog_Username") + ' </td><td><input type = "text" id = "_sugarSettings_UserName"></td></tr>\
                <tr><td>' + messages.get("SettingsDialog_Password") + ' </td><td><input type = "password" id = "_sugarSettings_Password"></td></tr>\
                <tr>\
                    <td colspan = "2">\
                        <a id = "_sugarSaveSettingsButton"  class = "_sugarButton" href = "javascript:void()">' + messages.get("SettingsDialog_SaveSettings") + '</a> \
                        <a id = "_sugarCancelSettingsButton"  class = "_sugarButton" href = "javascript:void()">' + messages.get("SettingsDialog_Cancel") + '</a">\
                    </td>\
                </tr>\
            </table>\
            <br>\
            ';
        },

        /**
         * Add Contacts to Sugar
         */
        sidebarAddContactsToSugar: function () {
            return '\
            <a id = "_sugarAddContactsToSugarButton"  class = "_sugarButton" href = "javascript:void()">' + messages.get("SugarMenu_AddContactsToSugar") + '</a>\
            ';
        },

        /**
         * Add Contact to Sugar form
         */
        sidebarAddContactToSugarForm: function () {
            return '\
            <table border = "0" width = "100%" cellpadding = "3" cellspacing = "0">\
                <tr><td><b>' + messages.get("PersonFormDialog_Title") + '</b></td><td><select id = "_sugarAddContactToSugarModule"></select></td></tr>\
                <tr><td>' + messages.get("PersonFormDialog_SelectOne") + ' </td><td><select id = "_sugarAddContactToSugarPerson" style = "width:125px"></select></td></tr>\
                <tr><td>' + messages.get("PersonFormDialog_FirstName") + ' </td><td><input type = "text" id = "_sugarRecord_first_name" style = "width:125px"></td></tr>\
                <tr><td>' + messages.get("PersonFormDialog_LastName") + ' </td><td><input type = "text" id = "_sugarRecord_last_name" style = "width:125px"></td></tr>\
                <tr><td>' + messages.get("PersonFormDialog_AccountName") + ' </td><td><input type = "text" id = "_sugarRecord_account_name" style = "width:125px"><div id = "_sugarRecord_account_name_selection" class = "_sugarSelection"></div></td></tr>\
                <tr><td>' + messages.get("PersonFormDialog_JobTitle") + ' </td><td><input type = "text" id = "_sugarRecord_title" style = "width:125px"></td></tr>\
                <tr><td>' + messages.get("PersonFormDialog_Email") + ' </td><td><input type = "text" id = "_sugarRecord_email1" style = "width:125px"></td></tr>\
                <tr><td>' + messages.get("PersonFormDialog_OfficePhone") + ' </td><td><input type = "text" id = "_sugarRecord_phone_work" style = "width:125px"></td></tr>\
                <tr><td>' + messages.get("PersonFormDialog_MobilePhone") + ' </td><td><input type = "text" id = "_sugarRecord_phone_mobile" style = "width:125px"></td></tr>\
                <tr><td colspan = "2"><label><input type = "checkbox" id ="_sugarAddContactToSugarLinkEmail" checked> ' + messages.get("PersonFormDialog_LinkEmail") + '</label></td></tr>\
                <tr>\
                    <td colspan = "2">\
                        <a id = "_sugarSaveContactToSugarButton"  class = "_sugarButton" href = "javascript:void()">' + messages.get("PersonFormDialog_Submit") + '</a> \
                        <a id = "_sugarCancelContactToSugarButton"  class = "_sugarButton" href = "javascript:void()">' + messages.get("PersonFormDialog_Cancel") + '</a>\
                    </td>\
                </tr>\
            </table>\
            <br>\
            ';
        },

        /**
         * Search
         */
        sidebarSearch: function () {
            return '\
            <table border = "0" width = "100%" cellpadding = "0" cellspacing = "0">\
                <tr height = "6"><td><td></tr>\
                <tr><td>\
                    <select id = "_sugarSearchModule"></select>\
                    <input type = "text" id = "_sugarSearchField" size = "10">\
                    <a id = "_sugarSearchButton"  class = "_sugarButton" href = "javascript:void()">' + messages.get("Sidebar_Search") + '</a>\
                </td></tr>\
                <tr height = "6"><td><td></tr>\
            </table>\
            ';
        },

        /**
         * Link Email
         */
        sidebarLinkEmail: function () {
            return '\
            <a id = "_sugarLinkEmailButton"  class = "_sugarButton" href = "javascript:void()">' + messages.get("Sidebar_LinkEmail") + '</a>\
            ';
        },

        /**
         * Side bar error pane
         */
        sidebarErrorPane: function () {
            return '<div id = "_sugarErrorPane"></div>';
        },

        /**
         * Side bar status pane
         */
        sidebarStatusPane: function () {
            return '<div id = "_sugarStatusPane"></div>';
        }
    };
})();
