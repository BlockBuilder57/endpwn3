/*

    EndPwn3 Stage 2 Payload
    Based on the EndPwn Reference Bootstrap
    
    Copyright 2018 EndPwn Project
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    https://github.com/endpwn/

*/

(() => {

    // abort if we're not currently in the discord app
    if (location.hostname.indexOf('discordapp') == -1 && location.hostname.indexOf('dr1ft.xyz') == -1) return;

    // use the discord native api to require electron and get electron.remote
    var electron = DiscordNative.nativeModules.requireModule('discord_/../electron').remote;
    var fs = electron.require('original-fs');

    // get the data path (where epapi.js should be)
    var ___data = electron.app.getPath('userData').replace(/\\\\/g, "/") + '/';

    // shakily reimplemented of require() intended for loading plugins and EPAPI itself
    function __krequire(path) {
        return eval('(()=>{var exports={};' + fs.readFileSync(___data + path, 'utf8').toString() + ';return exports})()');
    }

    // load EPAPI
    var epapi = __krequire('epapi.js');

    // add window.reload()
    window.reload = () => { app.relaunch(); app.exit(); };

    // call the entrypoint
    epapi.go('bootsyhax-dr1ft', 0, 1);

    window.endpwn = {
        uninstall: function () {
            $api.ui.showDialog({
                title: 'EndPwn: confirm uninstallation',
                body: 'Are you sure you want to remove EndPwn from your client? You can reinstall it at any time.',
                confirmText: 'Yes', cancelText: 'No',

                onConfirm: () => {

                    var data = $api.data;
                    const Buffer = require('buffer').Buffer;

                    // asarpwn
                    function asarinject(sig, inj) {
                        var dirlisting = fs.readdirSync(data);
                        var latestver = dirlisting.filter(d => d.indexOf("0.0.") > -1);

                        if (sig.length != inj.length) {
                            throw 'signature and injection not same size'
                        }
                        var bdata = new Buffer(fs.readFileSync(`${data}/${latestver[latestver.length - 1]}/modules/discord_desktop_core/core.asar`));
                        var index = bdata.indexOf(sig);
                        if (index == -1) {
                            return 0;
                        }
                        bdata.write(inj, index);
                        fs.writeFileSync(`${data}/${latestver[latestver.length - 1]}/modules/discord_desktop_core/core.asar`, bdata);
                        return 1;
                    }

                    asarinject(
                        "var electron=require('electron');var d=electron.remote.app.getPath('userData')+'/crispr.js';if(require('fs').existsSync(d))require(d).go();//",
                        "// App preload script, used to provide a replacement native API now that\n// we turned off node integration.\nvar electron = require('electron'"
                    );

                    $api.settings.set('WEBAPP_ENDPOINT');
                    $api.settings.set('WEBAPP_PATH');

                    reload();

                },
                onCancel: () => console.log('<3')

            });
        }
    };

})();