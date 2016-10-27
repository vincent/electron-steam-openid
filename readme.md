# electron-steam-openid [![Build Status](https://travis-ci.org/vincent/electron-steam-openid.svg?branch=master)](https://travis-ci.org/vincent/electron-steam-openid)

> A library to handle Steam authentication with OpenID, for your [Electron](http://electron.atom.io) app.


## Install

```
$ npm install --save electron-steam-openid
```


## Usage

```js
const electronSteamAuth = require('electron-steam-openid');

var config = {
  redirectUri: 'http://localhost'
};

app.on('ready', () => {
  const windowParams = {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false
    }
  }

  const steamOpenID = electronSteamAuth(config, windowParams);

  myApiOauth.getAccessToken(options)
    .then(token => {
      // use your token.steam_id
    });
});
```


## API

### electronSteamAuth(config, windowParams)

#### config

Type: `Object`
Sets custom openid.RelyingParty() params

#### windowParams

Type: `Object`

An object that will be used to create the BrowserWindow. Details: [Electron BrowserWindow documention](https://github.com/atom/electron/blob/master/docs/api/browser-window.md)

### Methods

#### getAuthorizationCode(options)

Returns a ```Promise``` that gets resolved with the authorization details of the OpenID authorization request.

## Adapted from

[electron-oauth2](https://github.com/mawie81/electron-oauth2)

## License

MIT
