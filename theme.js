define(function(require, exports, module) {

    // APIs consumed
    main.consumes = [
        "commands", "layout", "layout.preload", "menus", "Plugin", "settings",
        "ui"
    ];

    // APIs provided
    main.provides = ["harvard.cs50.theme"];

    // plugin
    return main;

    /**
     * Implements plugin.
     */
    function main(options, imports, register) {
        var commands = imports.commands;
        var layout = imports.layout;
        var menus = imports.menus;
        var preload = imports["layout.preload"];
        var settings = imports.settings;
        var ui = imports.ui;

        var menuItem = null;

        // whether night mode is on
        var night = false;

        // instantiate plugin
        var plugin = new imports.Plugin("CS50", main.consumes);

        // themes
        var themes = {
            dark: {
                ace: "ace/theme/cloud9_night",
                skin: "flat-dark" // default
            },
            light: {
                ace: "ace/theme/cloud9_day",
                skin: "flat-light" // default
            }
        };

        // when plugin is loaded
        plugin.on("load", function() {
            // create "View/Night Mode" menu item
            menuItem = new ui.item({
                type: "check",
                caption: "ToggleTheme",
                onclick: toggleTheme
            });
            menus.addItemByPath("View/Night Mode", menuItem, 2, plugin);

            // create theme-toggling command
            commands.addCommand({
                exec: toggleTheme,
                group: "CS50",
                name: "toggleTheme"
            }, plugin);

            // update night mode settings initially
            updateNight();

            // update night mode settings on external theme-changing
            settings.on("user/general/@skin", updateNight, plugin);

            // prefetch theme not in use
            var themeToPreload = night ? themes.light.skin : themes.dark.skin;
            preload.getTheme(themeToPreload, function() {});
        });

        plugin.on("unload", function() {
            night = false;
            menuItem = null;
        });

        // register plugin
        register(null, {
            "harvard.cs50.theme": plugin
        });

        /**
         * Sets and updates global variable 'night' to whether night mode is on,
         * and syncs "View/Night Mode" menu item.
         */
        function updateNight() {
            night = settings.get("user/general/@skin").indexOf("dark") !== -1;
            menuItem.setAttribute("checked", night);
        }

        /**
         * Toggles theme from dark to light or from light to dark.
         */
        function toggleTheme() {
            if (night) {
                layout.resetTheme(themes.light.skin, "ace");
                settings.set("user/ace/@theme", themes.light.ace);
            }
            else {
                layout.resetTheme(themes.dark.skin, "ace");
                settings.set("user/ace/@theme", themes.dark.ace);
            }
        }

        plugin.freezePublicAPI({});
    }
});
