'use strict';

const Promise = require('pinkie-promise');
const queryString = require('querystring');
const fetch = require('node-fetch');
const objectAssign = require('object-assign');
const nodeUrl = require('url');
const BrowserWindow = require('electron').BrowserWindow;
import openid from 'openid';

module.exports = function (config, windowParams) {

  function getAuthorizationCode(opts) {
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

        authWindow.loadURL(url);
        authWindow.show();

        authWindow.on('closed', () => {
          reject(new Error('window was closed by user'));
        });

        function onCallback(url) {
          var url_parts = nodeUrl.parse(url, true);
          var query = url_parts.query;
          var code = query.code;
          var error = query.error;

          if (error !== undefined) {
            reject(error);
            authWindow.removeAllListeners('closed');
            setImmediate(function () {
              authWindow.close();
            });
          } else if (code) {
            resolve({
              response_nonce: tokens.query['openid.response_nonce'],
              assoc_handle:   tokens.query['openid.assoc_handle'],
              identity:       tokens.query['openid.identity'],
              sig:            tokens.query['openid.sig']
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

        authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
          onCallback(newUrl);
        });
      });
    });
  }

  return {
    getAuthorizationCode: getAuthorizationCode,
  };
};
