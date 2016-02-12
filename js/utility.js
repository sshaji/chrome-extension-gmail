(function () {
    utility = {
        /**
         * Check if a string is null or empty
         */
        isEmpty: function (str) {
            return !str || 0 === str.length;
        },

        /**
         * Check if an array contains a value
         */
        arrayContains: function (array, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === value) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Check if an record array contains a record
         */
        recordArrayContains: function (array, record) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].id === record.id) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Add values to array if not already exists
         */
        addUniqueValuesToArray: function (array, values) {
            if (values != "") {
                var valuesSplit = values.split(',');
                for (var i = 0; i < valuesSplit.length; i++) {
                    if (!utility.arrayContains(array, valuesSplit[i])) array.push(valuesSplit[i]);
                }
            }
            return array;
        },

        /**
         * Parse an email address to name and email
         */
        parseEmail: function (namemail) {
            var parsedEmail = {};
            parsedEmail.email = namemail.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
            parsedEmail.fullname = namemail.replace(parsedEmail.email, '').replace('<>', '').replace('"', '').trim();
            parsedEmail.firstname = parsedEmail.fullname.split(' ')[0].trim();
            try {
                parsedEmail.lastname = parsedEmail.fullname.split(' ')[1].trim();
            } catch (err) {
                parsedEmail.lastname = '';
            }
            return parsedEmail;
        }
    };
})();