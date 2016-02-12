(function () {
    gmail = {
        id: "",
        userEmail: "",
        from: "",
        to: "",
        cc: "",
        bcc: "",
        allEmails: [],
        subject: "",
        date: "",
        body: "",
        error_message: "",
        jsInjected: false,

        /**
         * Google Web app URL to get email details
         */
        emailDetailsURL: function (getAllInfo) {
            return "https://script.google.com/macros/s/AKfycbyLZP_3i1y9wsJlWSsHk8-N2C6uNcdwml3KBe30O-_vzFIPPrc9/exec?mailID=" + gmail.id + ((getAllInfo) ? "&getInfo=all" : "");
        },

        /**
         * URL to request permission
         */
        permissionDialogURL: function () {
            return "https://accounts.google.com/o/oauth2/auth?client_id=706424692666@developer.gserviceaccount.com&redirect_uri=https://script.google.com/oauthcallback&state=ACjPJvGitAHLgAzKem5fT-MqznWWnaS6yrJwxbxJ2gW8dUaoGJQjeXK8FgRKFZmLAr7HtcurnM2gAzVNSYIbIT6j_2EnkSCg36x_6mbbmw&scope=https://mail.google.com/&response_type=code+gsession&access_type=offline&approval_prompt=force";
        },

        /**
         * URL to check permission
         */
        permissionCheckURL: function () {
            return "https://script.google.com/macros/s/AKfycbyLZP_3i1y9wsJlWSsHk8-N2C6uNcdwml3KBe30O-_vzFIPPrc9/exec?testAccess=1&a=" + Math.random();
        },

        /**
         * Get mail id
         */
        getId: function () {
            var hash = location.hash;
            var mailID = "";
            if (!gmail.isList(hash) && !gmail.isSettings(hash) && !gmail.isContacts(hash)) mailID = gmail.getIdFromLocationHash(hash);
            //From location hash, we are always getting the id of first email in a conversation view
            //So, an attempt to get the correct email id from DOM for conversation view
            var id = gmail.getLastEmailIdFromDOM();
            if (utility.isEmpty(id)) {
                id = gmail.getOpenedEmailIdFromDOM();
            }
            if (!utility.isEmpty(id)) {
                //An extra check to make sure the value we get from DOM is really the id
                if ((gmail.isPreviewPane() && gmail.isInbox(hash)) || id.length === mailID.length) mailID = id;
            }
            return mailID;
        },

        /**
         * Get the id of the email from location hash
         */
        getIdFromLocationHash: function (hash) {
            //Split hash by "/"
            var hashSplit = hash.split("/");
            // Get the last item from hash array
            var mailID = hashSplit[hashSplit.length - 1];
            // Check if any arguments
            mailID = (mailID.indexOf("?") >= 0) ? mailID.substring(0, mailID.indexOf("?")) : mailID;
            // Check if alphanumeric
            mailID = (/[^a-zA-Z0-9]/.test(mailID)) ? "" : mailID;
            return mailID;
        },

        /**
         * Check if list
         */
        isList: function (hash) {
            var hashSplit = hash.split("/");
            if ((hash.indexOf("#search") >= 0 || hash.indexOf("#apps") >= 0 || hash.indexOf("#circle") >= 0 || hash.indexOf("#label") >= 0) && hashSplit.length < 3) {
                return true;
            } else return gmail.getIdFromLocationHash(hash).indexOf("#") >= 0;
        },

        /**
         * Check if inbox
         */
        isInbox: function (hash) {
            return hash.indexOf("#inbox") >= 0;
        },

        /**
         * Check if settings
         */
        isSettings: function (hash) {
            return hash.indexOf("#settings") >= 0;
        },

        /**
         * Check if contacts
         */
        isContacts: function (hash) {
            return (hash.indexOf("#contacts") >= 0 || hash.indexOf("#contact") >= 0);
        },

        /**
         * Get GMail details by passing id to google script
         */
        getDetails: function (getAllInfo) {
            return http.get(gmail.emailDetailsURL(getAllInfo));
        },

        /**
         * Parse Gmail details returned by google app script
         */
        parseDetails: function (detailsJSON) {
            try {
                var retrievedValue = JSON.parse(detailsJSON);
                gmail.allEmails = [];
                gmail.from = retrievedValue.from;
                if (!utility.isEmpty(gmail.from)) gmail.allEmails = utility.addUniqueValuesToArray(gmail.allEmails, gmail.from);
                gmail.to = retrievedValue.to;
                if (!utility.isEmpty(gmail.to)) gmail.allEmails = utility.addUniqueValuesToArray(gmail.allEmails, gmail.to);
                gmail.cc = retrievedValue.cc;
                if (!utility.isEmpty(gmail.cc)) gmail.allEmails = utility.addUniqueValuesToArray(gmail.allEmails, gmail.cc);
                gmail.bcc = retrievedValue.bcc;
                if (!utility.isEmpty(gmail.bcc)) gmail.allEmails = utility.addUniqueValuesToArray(gmail.allEmails, gmail.bcc);
                gmail.subject = retrievedValue.subject;
                gmail.date = retrievedValue.date;
                gmail.body = retrievedValue.emailbody;
                gmail.error_message = retrievedValue.message;
            } catch (err) {
            }
        },

        /**
         * Check if permission is needed for google app script
         */
        checkPermission: function () {
            if (gmail.error_message.indexOf("Authorization") > -1) {
                sidebar.showSugarPermission();
            } else {
                var result = null;
                next(function () {
                    return http.get(gmail.permissionCheckURL()).next(function (data) {
                        result = data;
                    });
                }).
                    next(function () {
                        if (result.status == 200 && result.responseText != '"ACCESS GRANTED"') {
                            sidebar.showSugarPermission();
                        } else {
                            //Alternate method - Try to get gmail details from DOM
                            //Using this to get email details for secondary signed-in gmail accounts
                            //Because, google apps script always work as the primary logged in user
                            //Not a reliable method - can break if google changes gmail dom
                            //Depending on GMail.js lib - https://github.com/KartikTalwar/gmail.js
                            //Continue looking for another better way
                            gmail.getDetailsFromDOMAndLoadSidebarData();
                        }
                    });
            }
        },

        /**
         * Check if not the primary signed in google account
         */
        isNotPrimaryAccount: function () {
            var url = location.href;
            if (url.indexOf("/u/") >= 0) {
                if (url.indexOf("/u/0/") == -1) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Open permission dialog
         */
        openPermissionDialog: function () {
            window.open(gmail.permissionDialogURL(), "", "width=500,height=400");
        },

        /**
         * Get gmail details from DOM and load sidebar data
         */
        getDetailsFromDOMAndLoadSidebarData: function (retry) {
            try {
                if (utility.isEmpty(retry)) retry = 1;
                //Retry a maximum of 5 seconds
                if (retry > 10) {
                    //If failed to get data from dom, collapse sidebar
                    sidebar.collapse(true);
                    return;
                }
                gmail.injectDOMReaderJS();
                var injectJS = '(' + function () {
                    try {
                        document.body.setAttribute("_sugarCustomVar_email_data", JSON.stringify(Gmail().get.email_data()));
                    } catch (err) {
                    }
                } + ')();';
                gmail.injectJavascript(injectJS);
                var emailData = document.body.getAttribute("_sugarCustomVar_email_data");
                if (utility.isEmpty(emailData) || emailData == '{}') {
                    //Retry every 0.5 secs if gmail page is not completely loaded
                    setTimeout(function () {
                        gmail.getDetailsFromDOMAndLoadSidebarData(++retry)
                    }, 500);
                } else {
                    gmail.parseDOMDetails(emailData);
                    if (!utility.isEmpty(gmail.from)) {
                        //If data retrieved from dom, populate sidebar data
                        app.populateSidebarData();
                    } else {
                        //If failed to get data from dom, collapse sidebar
                        sidebar.collapse(true);
                    }
                }
            } catch (err) {
                //If failed to get data from dom, collapse sidebar
                sidebar.collapse(true);
            }
        },

        /**
         * Parse Gmail details retrieved from DOM
         */
        parseDOMDetails: function (detailsJSON) {
            try {
                var retrievedValue = JSON.parse(detailsJSON);
                var emailObject = retrievedValue.threads[retrievedValue.last_email];
                gmail.allEmails = [];
                var people_involved = retrievedValue.people_involved;
                for (var i = 0; i < people_involved.length; i++) {
                    gmail.allEmails.push(people_involved[i][0] + "<" + people_involved[i][1] + ">")
                }
                gmail.from = emailObject.from_email;
                gmail.subject = emailObject.subject;
                gmail.date = new Date(emailObject.timestamp).toJSON().toString();
                gmail.body = emailObject.content_html;
            } catch (err) {
            }
        },

        /**
         *  Check if preview pane using injected js
         */
        isPreviewPane: function () {
            try {
                gmail.injectDOMReaderJS();
                var injectJS = '(' + function () {
                    try {
                        document.body.setAttribute("_sugarCustomVar_check.is_preview_pane", Gmail().check.is_preview_pane());
                    } catch (err) {
                    }
                } + ')();';
                gmail.injectJavascript(injectJS);
                return document.body.getAttribute("_sugarCustomVar_check.is_preview_pane") == 'true';
            } catch (err) {
                return false;
            }
        },

        /**
         *  Get Gmail user email using injected js
         */
        getUserEmailFromDOM: function () {
            try {
                gmail.injectDOMReaderJS();
                var injectJS = '(' + function () {
                    try {
                        document.body.setAttribute("_sugarCustomVar_user_email", Gmail().get.user_email());
                    } catch (err) {
                    }
                } + ')();';
                gmail.injectJavascript(injectJS);
                return document.body.getAttribute("_sugarCustomVar_user_email");
            } catch (err) {
                return "";
            }
        },

        /**
         *  Get currently opened conversation email record Id from DOM
         */
        getOpenedEmailIdFromDOM: function () {
            try {
                var items = document.getElementsByClassName('ii gt');
                for (var i = 0; i < items.length; i++) {
                    var mail_id = items[i].getAttribute('class').split(' ')[2];
                    var is_editable = items[i].getAttribute('contenteditable');
                    if (mail_id != 'undefined' && mail_id != undefined) {
                        if (is_editable != 'true') {
                            mail_id = (mail_id.charAt(0) === "m") ? mail_id.substring(1, mail_id.length) : mail_id;
                            return mail_id;
                        }
                    }
                }
                return "";
            } catch (err) {
                return "";
            }
        },

        /**
         *  Get id of the last email in a gmail thread from DOM
         */
        getLastEmailIdFromDOM: function () {
            try {
                gmail.injectDOMReaderJS();
                var injectJS = '(' + function () {
                    try {
                        document.body.setAttribute("_sugarCustomVar_email_ids", Gmail().get.email_ids());
                    } catch (err) {
                    }
                } + ')();';
                gmail.injectJavascript(injectJS);
                var ids = document.body.getAttribute("_sugarCustomVar_email_ids").split(',');
                return ids[ids.length - 1];
            } catch (err) {
                return "";
            }
        },

        /**
         * Inject 2 js files to help read gmail details from DOM
         */
        injectDOMReaderJS: function () {
            try {
                if (!gmail.jsInjected) {
                    var script = document.createElement('script');
                    script.src = chrome.extension.getURL("lib/jquery.js");
                    (document.head || document.documentElement).appendChild(script);
                    //script.parentNode.removeChild(script);
                    script = document.createElement('script');
                    script.src = chrome.extension.getURL("lib/gmail.js");
                    (document.head || document.documentElement).appendChild(script);
                    //script.parentNode.removeChild(script);
                    gmail.jsInjected = true;
                }
            } catch (err) {
            }
        },

        /**
         * Inject javascript to gmail page to execute at the scope of the web page
         */
        injectJavascript: function (injectJS) {
            script = document.createElement('script');
            script.textContent = injectJS;
            (document.head || document.documentElement).appendChild(script);
            script.parentNode.removeChild(script);
        }
    };
})();