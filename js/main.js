(function () {
    window.onhashchange = function () {
        sidebar.load();
    };

    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            sidebar.load();
        }
    };

    document.onclick = function () {
        if (gmail.isPreviewPane()) sidebar.load();
    };

    window.onresize = function () {
        sidebar.setPosition();
    };
})();