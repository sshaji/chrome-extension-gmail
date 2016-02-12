(function () {
    selection = {
        show: function (parentObject, module) {
            var divName = parentObject.id + "_selection";
            selection.createSelection(parentObject, module, divName);
            selection.addCloseListener(divName);
            sidebar.get(divName).style.display = "block";
        },

        close: function (divName) {
            sidebar.get(divName).style.display = "none";
        },

        addCloseListener: function (divName) {
            if (!document.body.getAttribute(divName)) {
                document.body.addEventListener("click", function () {
                    selection.close(divName);
                });
                document.body.setAttribute(divName, true);
            }
        },

        createSelection: function (parentObject, module, divName) {
            var result = null;
            next(function () {
                    var filter = JSON.stringify([
                        {
                            'name': {'$starts': parentObject.value}
                        }
                    ]);
                    return rest.filter(module, filter, "name", 10).next(function (data) {
                        result = data;
                    });
                }
            ).
                next(function () {
                    selection.createSelectionCallBack(result, parentObject, divName);
                });
        },

        createSelectionCallBack: function (result, parentObject, divName) {
            sidebar.get(divName).innerHTML = "";
            try {
                var retrievedValue = JSON.parse(result.responseText);
                var records = retrievedValue.records;
                for (var i = 0; i < records.length; ++i) {
                    sidebar.get(divName).innerHTML += '<a href = "javascript:void()" onclick = \'document.getElementById("' + parentObject.id + '").value = "' + records[i].name + '";\'>' + records[i].name + '</a><br>';
                }
            } catch (err) {
            }
        }
    }
    ;
})
    ();
