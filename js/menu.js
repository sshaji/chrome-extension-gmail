(function () {
    menu = {
        Opened: false,
        toggle: function (subMenu, e) {
            e.stopPropagation();
            var menuLayer = sidebar.get(subMenu);
            if (menuLayer.style.display == "none" || menuLayer.style.display == "") {
                menu.show(subMenu);
            } else {
                menu.close(subMenu);
            }
        },

        show: function (subMenu) {
            menu.addCloseListener(subMenu);
            sidebar.get(subMenu).style.display = "block";
            menu.Opened = true;
        },

        close: function (subMenu) {
            sidebar.get(subMenu).style.display = "none";
            menu.Opened = false;
        },

        addCloseListener: function (subMenu) {
            if (!document.body.sugarMenuListenerAdded) {
                document.body.addEventListener("click", function () {
                    if (menu.Opened) {
                        menu.close(subMenu);
                    }
                });
                document.body.sugarMenuListenerAdded = true;
            }
        }
    };
})();
