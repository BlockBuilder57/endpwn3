/*

    EndPwn Stage 2 Shared
    
    Copyright 2018 EndPwn Project
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    https://github.com/endpwn/

*/

(() => {

    // define this with a default value as a fallback
    var __goodies = {
        guilds: [],
        bots: [],
        users: {}
    };

    function fetchGoodies() {
        // fetch goodies.json
        fetch('https://endpwn.cathoderay.tube/goodies.json?_=' + Date.now())
            .then(x => x.json())
            .then(r => __goodies = r);
    }

    // Fetch goodies now and every half hour
    fetchGoodies();
    setInterval(fetchGoodies, 1800000);

    // early init payload
    document.addEventListener('ep-prepared', () => {

        // fetch the changelog
        fetch('https://endpwn.github.io/changelog.md?_=' + Date.now()).then(r => r.text()).then(l => {

            // we're racing discord's initialization procedures; try and hit a timing sweetspot
            setTimeout(function () {

                try {

                    // get the changelog object
                    var log = $api.util.findFuncExports('changeLog');
                    var data = l.split(';;');

                    // set the date
                    if (log.changeLog.date <= data[0])
                        log.changeLog.date = data[0];

                    // prepend to the changelog body
                    log.changeLog.body = data[1] + '\n\n' + log.changeLog.body;

                }
                catch (e) {

                    // it failed, try again in 10 ms
                    setTimeout(arguments.callee, 100);

                }

            }, 100);

        });

    });

    // post-init payload
    document.addEventListener('ep-ready', () => {

        // hijack the crash handler
        // TODO: make this less ugly
        /*$api.util.findFuncExports('CRASH', 'prototype').prototype.render = function () {

            console.error('*** DISCORD CRASH!!! ***\nLOCKING DISPATCH AND HIJACKING PAGE');

            // disable dispatch(), essentially freezing react
            $api.internal.dispatcher.default.dispatch = () => { };

            // clear css
            $("link[rel='stylesheet']").remove();
            $$("style").forEach(x => x.remove());

            // add a simple style to the body
            $('body').style.color = '#fff';
            $('body').style.backgroundColor = '#000082';
            $('body').style.fontFamily = 'monospace';

            // write our message to app-mount
            $('#app-mount').innerHTML = `<h1>EndPwn: Discord Fatal Error</h1>
<h3>
Something has gone very, very wrong, and Discord has crashed.<br><br>
If this is the first time you've seen this error screen, reload and hope for the best. If this screen appears again, follow these steps:<br><br>
Try removing any new plugins and restarting again. If this solves the problem there may be a bug in a plugin.<br><br>
If problems continue, it's likely that there is a bug in EndPwn or Discord. <a href="https://discord.gg/wXdPNf2" target="_blank" style="color:#0ff">Join the EndPwn Discord server</a> for assistance.<br><br>
Details may be available in the console (Ctrl+Shift+I), but at this level of crash we can't be certain.
</h3>
<button onclick="electron.getCurrentWindow().reload()">Reload</button>
<button onclick="$api.localStorage.set('safemode',1);electron.getCurrentWindow().reload()">Reload in safe mode</button>`;

            // crash whatever was calling render()
            throw 'render abort';

        }*/

        // disable analytics
        $api.util.findFuncExports("AnalyticEventConfigs").default.track = () => { };

        // enable experiments
        $api.util.findFuncExports('isDeveloper').__defineGetter__('isDeveloper', () => true);

        // disable that obnoxious warning about not pasting shit in the console
        $api.util.findFuncExports('consoleWarning').consoleWarning = e => { };

        // apply custom discrims/bot tags from EndPwn Customizer (endpwn.cathoderay.tube)
        $api.util.wrapAfter(
            "wc.findCache('getUser')[0].exports.getUser",

            x => {

                if (x === undefined || x === null) return;

                if (__goodies.bots.contains(x.id)) x.bot = true;
                if (__goodies.users[x.id] !== undefined) x.discriminator = __goodies.users[x.id];

                return x;
            }
        );

        // verify servers directly associated with the endpwn project
        $api.util.wrapAfter(
            "wc.findCache('getGuild')[0].exports.getGuild",

            x => {

                if (x === undefined || x === null) return;

                if (__goodies.guilds.contains(x.id)) x.features.add('VERIFIED');

                return x;
            }
        );

        // check for epapi updates
        if ($api.lite || !fs.existsSync($api.data + '/DONTUPDATE'))
            (function () {

                console.log(`%c[EndPwn]%c checking for EPAPI updates...`, 'font-weight:bold;color:#0cc', '');

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

                });

            })();

    });

})();
