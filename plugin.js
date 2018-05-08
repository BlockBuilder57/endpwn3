/*

    EndPwn3 System Plugin
    
    Copyright 2018 EndPwn Project
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    https://github.com/endpwn/

*/

exports = {

    start: function () {

        window.reload = () => { app.relaunch(); app.exit(); };
        window.endpwn = {

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
            }

        };

    }

}