OneNote on Windows 10 is a killer app, especially with touchscreen support. Since I've been using this to take my lecture notes at University,
when I switched back to Linux I had to use the not-feature-complete online version. The feature I missed the most was the ability to
include print-outs of a PDF file. Since the API seems to cover this feature anyway, and Microsoft released a [good demo app](https://github.com/OneNoteDev/OneNoteAPISampleNodejs), I decided to [scratch my own itch](https://github.com/matzipan/node-note/commit/e4b5017f73466c75eb9aaa6e1b06b73d64329961), so I did some adjustments and added Google Drive upload support.

The current application allows you to login via OAuth2 to your Google and Live accounts and then choose a PDF file and select from the destination sections in your OneNote main notebook. It also uploads the PDF file to a Google Drive folder with the same name as the selected OneNote section. The app looks for the Drive folder inside a folder names `Slidedecks` (it doesn't matter if it's in the root of your Drive or not, it will use the search function). This folder name is configurable in `config.js` under `drive.parentFolder`.

### Prerequisites

You need to setup your hosts file and add a host name that will resolve to the IP address where you're running the app (or just upload the app on a server and use the server's host address), as Live and Google's OAuth2 server will need to redirect to that URL to send back the authentication token. On a Windows machine your `hosts` file is located at `C:\Windows\System32\drivers\etc\hosts`, on a Mac at `/private/etc/hosts` and on a Linux machine at `/etc/hosts`.

### Installation

1. Get the app.
3. You'll need to get your [Live OAuth2 app credentials](https://account.live.com/developers/applications/index) and [Google OAuth2 app credentials](https://console.developers.google.com/) and set the appropriate fields in `config.js`. When setting the redirect URI, set it to the domain name of your web site or the host name you have set up in your `hosts` file. The path for Google authentication is `/drive-callback` and for Live authentication is `/live-callback`.
6. `npm install`.
8. `npm start`.
9. The app will now run on port `3000` on your desired host.
10. Enjoy.

## License

Adapted by Zisu Andrei (2016) based on a sample project from Microsoft Corporation (2014). Provided As-is without warranty. Trademarks mentioned here are the property of their owners.
