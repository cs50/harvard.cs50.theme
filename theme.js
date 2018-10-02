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
        const commands = imports.commands;
        const layout = imports.layout;
        const menus = imports.menus;
        const preload = imports["layout.preload"];
        const settings = imports.settings;
        const ui = imports.ui;

        let menuItem = null;

        // Night mode flag
        let night = false;

        // Instantiate plugin
        const plugin = new imports.Plugin("CS50", main.consumes);

        // Themes
        const themes = {
            dark: {
                ace: "ace/theme/cloud9_night",
                skin: "flat-dark"
            },
            light: {
                ace: "ace/theme/cloud9_day",
                skin: "flat-light" // default
            }
        };

        // When plugin is loaded
        plugin.on("load", () => {
            // Create "View/Night Mode" menu item
            menuItem = new ui.item({
                type: "check",
                caption: "ToggleTheme",
                onclick: toggleTheme
            });

            menus.addItemByPath("View/Night Mode", menuItem, 2, plugin);

            // Create theme-toggling command
            commands.addCommand({
                exec: toggleTheme,
                group: "CS50",
                name: "toggleTheme"
            }, plugin);

            // Update night mode settings initially
            updateNight();

            // Update night mode settings on external theme-changing
            settings.on("user/general/@skin", updateNight, plugin);

            // Prefetch theme not in use
            preload.getTheme(night ? themes.light.skin : themes.dark.skin, () => {});
        });

        plugin.on("unload", () => {
            night = false;
            menuItem = null;
        });

        // Register plugin
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
                settings.set("user/ace/@theme", themes.light.ace);
                layout.resetTheme(themes.light.skin, "ace");
            }
            else {
                settings.set("user/ace/@theme", themes.dark.ace);
                layout.resetTheme(themes.dark.skin, "ace");
            }
        }

        plugin.freezePublicAPI({});
    }
});
