'use strict';

const Promise = require('pinkie-promise');
const nodeUrl = require('url');
const BrowserWindow = require('electron').BrowserWindow;
const openid = require('openid');
const {session} = require('electron');

module.exports = function (config, windowParams) {
  function authenticate(opts) {
    opts = opts || {};

    var rely = new openid.RelyingParty(
      'http://localhost:3000/verify-steam',
      'http://localhost:3000/', // Realm (specifies realm for OpenID authentication)
      true,  // Use stateless verification
      false, // Strict mode
      []     // List of extensions to enable and include
    );

    return new Promise(function (resolve, reject) {
      rely.authenticate('http://steamcommunity.com/openid', false, function (error, providerUrl) {
        const authWindow = new BrowserWindow(windowParams || {'use-content-size': true});

        authWindow.loadURL(providerUrl);
        authWindow.show();

        authWindow.on('closed', () => {
          reject(new Error('window was closed by user'));
        });

        function onCallback(url) {
          var query = nodeUrl.parse(url, true).query;

          if (query['openid.identity'] === undefined) {
            reject(new Error('cannot authenticate through Steam'));
            authWindow.removeAllListeners('closed');
            setImmediate(function () {
              authWindow.close();
            });
          } else {
            resolve({
              response_nonce: query['openid.response_nonce'],
              assoc_handle: query['openid.assoc_handle'],
              identity: query['openid.identity'],
              steam_id: query['openid.identity'].match(/\/id\/(.*$)/)[1],
              sig: query['openid.sig']
            });
            authWindow.removeAllListeners('closed');
            setImmediate(function () {
              authWindow.close();
            });
          }
        }

        authWindow.webContents.on('will-navigate', (event, url) => {
          onCallback(url);
        });

        // This event is deprecated as of electron 3.0. 
        /*authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
          onCallback(newUrl);
        });*/

        // Use this to replace deprecated event above
        session.defaultSession.webRequest.onBeforeRedirect((details, callback) => {
          // twitter
          if(details.redirectURL.toLowerCase().indexOf('twitter') === -1)
          {
            onCallback(details.redirectURL);
          }
        });
      });
    });
  }

  return {
    authenticate: authenticate
  };
};
