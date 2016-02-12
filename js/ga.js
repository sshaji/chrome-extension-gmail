(function () {
    ga = {
        /**
         * GA globals
         */
        UTM_URL: "https://www.google-analytics.com/__utm.gif",
        UTMHN: "gpi.sugarcrm.com",
        UTMWV: "4.8.1ma",
        trackingId: "UA-38125089-6",

        /**
         * Google Analytics Call
         * Build UTM image URL and send get request
         * @param pageName
         */
        reportPageView: function (pageName) {
            try {
                http.get(ga.buildURL(pageName));
            } catch (err) {
            }
        },

        /**
         * Build GA UTM URL
         * @param pageName
         */
        buildURL: function (pageName) {
            var uniqueVisitorId = ga.uniqueVisitorId();
            var current = ga.currentTimeInMilliseconds();
            var cookie = ga.randomString();
            return ga.UTM_URL
                + "?utmwv=" + ga.UTMWV
                + "&utmac=" + ga.trackingId
                + "&utmp=" + pageName
                + "&utmdt=" + pageName
                + "&utmn=" + ga.randomString()
                + "&utmhn=" + ga.UTMHN
                + "&utmcs=UTF-8"
                + "&utmul=" + messages.locale()
                + "&utmhid=" + ga.randomString()
                + "&utmipn=GPI"
                + "&utmipc=GPI"
                + "&utmfl=" + app.version()
                + "&utmsr=-"
                + "&utmsc=-"
                + "&utmr=-"
                + "&utmcr=1"
                + "&utmje=1"
                + "&utmcc=__utma%3D'" + cookie + "." + uniqueVisitorId + "." + current + "." + current + "." + current + ".2%3B%2B__utmb%3D" + cookie + "%3B%2B__utmc%3D" + cookie + "%3B%2B__utmz%3D" + cookie + "." + current + ".2.2.utmccn%3D(direct)%7Cutmcsr%3D(direct)%7Cutmcmd%3D(none)%3B%2B__utmv%3D" + cookie + "&utmu=DC~";
        },

        /**
         * Generate a unique visitor id
         */
        uniqueVisitorId: function () {
            return (!utility.isEmpty(gmail.userEmail)) ? ga.hashCode(gmail.userEmail) : ga.randomString();
        },

        /**
         * Convert a string to hash code
         */
        hashCode: function (str) {
            var hash = 0;
            if (str.length == 0) return hash;
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        },

        /**
         * Generate a random string
         */
        randomString: function () {
            return Math.random();
        },

        /**
         * Get current time in milliseconds
         */
        currentTimeInMilliseconds: function () {
            var d = new Date();
            return d.getTime();
        }
    };
})();
