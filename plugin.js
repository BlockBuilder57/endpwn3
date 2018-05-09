/*

    EndPwn3 System Plugin
    
    Copyright 2018 EndPwn Project
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    https://github.com/endpwn/

*/

var internal = {

    print: function (str) {
        console.log(`%c[EndPwn3]%c ` + str, 'font-weight:bold;color:#0cc', '');
    }

}

exports = {

    preload: function () {

        window.reload = () => { app.relaunch(); app.exit(); };
        window.endpwn = {

            // uninstaller
            uninstall: function () {
                $api.ui.showDialog({
                    title: 'EndPwn: confirm uninstallation',
                    body: 'Are you sure you want to remove EndPwn from your client? You can reinstall it at any time.',
                    confirmText: 'Yes', cancelText: 'No',

                    onConfirm: () => {

                        var data = $api.data;

                        $api.settings.set('WEBAPP_ENDPOINT');
                        $api.settings.set('WEBAPP_PATH');

                        reload();

                    },
                    onCancel: () => console.log('<3')
                });
            },

            // endpwn customizer supporting code
            customizer: {

                // fallback data
                data: {
                    guilds: [],
                    devs: [],
                    bots: [],
                    users: {}
                },

                update: function () {
                    // fetch goodies.json
                    internal.print('fetching EndPwn Cutomizer data from server...');
                    fetch('https://endpwn.cathoderay.tube/goodies.json?_=' + Date.now())
                        .then(x => x.json())
                        .then(r => endpwn.customizer.data = r);
                },

                init: function () {

                    // prevent doublecalling
                    endpwn.customizer.init = undefined;

                    // apply custom discrims/bot tags/badges/server verif from EndPwn Customizer (endpwn.cathoderay.tube)
                    internal.print('initializing EndPwn Cutomizer...');

                    // refetch customizer stuff every half hour
                    setInterval(endpwn.customizer.update, 1800000);
                    endpwn.customizer.update();

                    // add the endpwn dev badge to the class obfuscation table
                    wc.findFunc('profileBadges:"profileBadges')[0].exports['profileBadgeEndpwn'] = 'profileBadgeEndPwn';

                    // apply the css for endpwn dev badges
                    var badgecss = document.createElement("style");
                    badgecss.type = "text/css";
                    badgecss.innerHTML = ".profileBadgeEndPwn{background-image:url(https://dr1ft.xyz/sigma_solid.svg);background-position:center;background-repeat:no-repeat;width:16px;height:16px;cursor:pointer}";
                    document.body.appendChild(badgecss);

                    // hook getUser() so we can apply custom discrims/bot tags/badges
                    $api.util.wrapAfter(
                        "wc.findCache('getUser')[0].exports.getUser",

                        x => {

                            if (x === undefined || x === null) return;

                            if (endpwn.customizer.data.bots.contains(x.id)) x.bot = true;
                            if (endpwn.customizer.data.users[x.id] !== undefined) x.discriminator = endpwn.customizer.data.users[x.id];
                            if (endpwn.customizer.data.devs.contains(x.id)) x.flags += x.flags & 4096 ? 0 : 4096;

                            return x;
                        }
                    );

                    // make sure devs' badges actually render
                    $api.events.hook('USER_PROFILE_MODAL_FETCH_SUCCESS', x => { if (endpwn.customizer.data.devs.contains(x.user.id)) x.user.flags += x.user.flags & 4096 ? 0 : 4096; })

                    // hook getGuild() so we can verify servers
                    $api.util.wrapAfter(
                        "wc.findCache('getGuild')[0].exports.getGuild",

                        x => {

                            if (x === undefined || x === null) return;

                            if (endpwn.customizer.data.guilds.contains(x.id)) x.features.add('VERIFIED');

                            return x;
                        }
                    );

                }

            }

        };

        // fetch the changelog
        internal.print('retrieving changelog...');
        fetch('https://endpwn.github.io/changelog.md?_=' + Date.now()).then(r => r.text()).then(l => {
            var data = l.split(';;');
            window.endpwn.changelog = {
                date: data[0],
                body: data[1]
            };
        });

        // early init payload
        document.addEventListener('ep-prepared', () => {

            // disable that obnoxious warning about not pasting shit in the console
            internal.print('disabling self xss warning...');
            $api.util.findFuncExports('consoleWarning').consoleWarning = e => { };

            // fuck sentry
            internal.print('fucking sentry...');
            var sentry = wc.findCache('_originalConsoleMethods')[0].exports;
            window.console = Object.assign(window.console, sentry._originalConsoleMethods); // console
            sentry._wrappedBuiltIns.forEach(x => x[0][x[1]] = x[2]); // other stuff
            sentry._breadcrumbEventHandler = () => () => { }; // break most event logging
            sentry.captureBreadcrumb = () => { }; // disable breadcrumb logging

        });

    },

    replacements: {
        //'#([0-9]{4})': '#(.{1,4})',
        //'return t.hasFlag(H.UserFlags.STAFF)': 'return t.hasFlag(4096)&&r.push({tooltip:"EndPwn Developer",onClick:function(){return window.open("https://endpwn.github.io/","_blank")},class:"endpwn"}),t.hasFlag(H.UserFlags.STAFF)'
        'key:"changeLog",get:function(){return E}': 'key:"changeLog",get:function(){if(!E.injected){E.injected=1;E.date=E.date<=window.endpwn.changelog.date?window.endpwn.changelog.date:E.date;E.body=window.endpwn.changelog.body+"\\n\\n"+E.body}return E}'
    },

    start: function () {

        // disable analytics
        internal.print('disabling analytics...');
        $api.util.findFuncExports("AnalyticEventConfigs").default.track = () => { };

        // enable experiments
        internal.print('enabling experiments menu...');
        $api.util.findFuncExports('isDeveloper').__defineGetter__('isDeveloper', () => true);

        endpwn.customizer.init();

        // check for epapi updates
        if ($api.lite || !fs.existsSync($api.data + '/DONTUPDATE'))
            (function () {

                internal.print('checking for EPAPI updates...');

                // fetch the latest build of epapi
                fetch('https://endpwn.github.io/epapi/epapi.js?_=' + Date.now()).then(x => x.text()).then(x => {

                    // check the version
                    if (kparse(x).version > $api.version) {

                        // if the version on the server is newer, pester the user
                        $api.ui.showDialog({

                            title: 'EndPwn3: EPAPI Update Available',
                            body: 'An update to EPAPI has been released. It is recommended that you restart your client in order to gain access to new features and maintain compatibility.',
                            confirmText: 'Restart Now', cancelText: 'Later',

                            // user pressed "Restart Now"
                            onConfirm: () => {

                                // refresh the page if we're running in a browser, reboot the app if we're running outside of lite mode
                                reload();

                            },

                            // they pressed "Later", for some reason
                            onCancel: () => {

                                // bother them again in 6 hrs (* 60 min * 60 sec * 1000 ms)
                                setTimeout(arguments.callee, 6 * 60 * 60 * 1000);

                            }

                        });

                    }
                    else setTimeout(arguments.callee, 6 * 60 * 60 * 1000);

                });

            })();

    }

}