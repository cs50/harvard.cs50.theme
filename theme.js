define(function(require, exports, module) {

    // APIs consumed
    main.consumes = [
        "commands", "layout", "layout.preload", "menus", "Plugin", "settings", "ui"
    ];

    // APIs provided
    main.provides = ["harvard.cs50.theme"];

    // plugin
    return main;

    /**
     * Implements plugin.
     */
    function main(options, imports, register) {

        // variable to make new item in menu
        var ui = imports.ui;

        // variable to access the menu
        var menus = imports.menus;

        // global variable for menu item
        var menuItem = null;

        // global variable for current theme
        var currentTheme = null;

        // instantiate plugin
        var plugin = new imports.Plugin("CS50", main.consumes);

        // themes
        var themes = {
            dark: {
                ace: "ace/theme/cloud9_night",
                class: "cs50-theme-dark",
                skin: "flat-dark", // default
                skins: ["dark", "dark-gray", "flat-dark"]
            },
            light: {
                ace: "ace/theme/cloud9_day",
                class: "cs50-theme-light",
                skin: "flat-light", // default
                skins: ["light", "light-gray", "flat-light"]
            }
        };

        // when plugin is loaded
        plugin.on("load", function() {

            menuItem = new ui.item({
                type: "check",
                caption: "ToggleTheme",
                onclick: toggleTheme
            });

            menus.addItemByPath("View/Night Mode", menuItem, 2, plugin);

            // register command for button
            imports.commands.addCommand({
                exec: toggleTheme,
                group: "CS50",
                name: "toggleTheme"
            }, plugin);

            // get the current theme
            setTheme();

            // reset global var whenever style changes
            imports.settings.on("user/general/@skin", setTheme, plugin);

            // prefetch theme not in use
            if (currentTheme == themes.dark.class) {
                imports["layout.preload"].getTheme(themes.light.skin, function() {});
            }
            else {
                imports["layout.preload"].getTheme(themes.dark.skin, function() {});
            }
        });

        // register plugin
        register(null, {
            "harvard.cs50.theme": plugin
        });

        /**
         * Sets global var 'currentTheme' to the current theme.
         */
        function setTheme() {
            var skin = imports.settings.get("user/general/@skin");
            if (themes.dark.skins.indexOf(skin) !== -1) {
                currentTheme = themes.dark.class;
            }
            else {
                currentTheme = themes.light.class;
            }
        }

        /**
         * Toggles theme from dark to light or from light to dark.
         */
        function toggleTheme() {
            if (currentTheme === themes.dark.class) {
                imports.layout.resetTheme(themes.light.skin, "ace");
                imports.settings.set("user/ace/@theme", themes.light.ace);
            }
            else {
                imports.layout.resetTheme(themes.dark.skin, "ace");
                imports.settings.set("user/ace/@theme", themes.dark.ace);
            }
        }

        plugin.freezePublicAPI({});
    }
});
