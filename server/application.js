// TODO: Fix certificate error
// TODO: Add redirect from HTTP to proper URL in HTTPS

require("dotenv").config();

const fs = require("fs");
const http = require("http");
const https = require("https");
const httpProxy = require("http-proxy");

//
// Setup our server to proxy standard HTTP requests
//
const proxy = new httpProxy.createProxyServer({
  target: {
    host: "localhost",
    port: 80
  },
  ssl: {
    key: fs.readFileSync(process.env.PATH_TO_KEY),
    cert: fs.readFileSync(process.env.PATH_TO_CRT)
  }
});

const proxyServer = https.createServer(function (req, res) {
  console.log("Proxying web");
  proxy.web(req, res);
});

/*
var timeout;
fs.watch(process.env.PATH_TO_CRT, () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    proxyServer._sharedCreds.context.setCert(fs.readFileSync(process.env.PATH_TO_CRT));
    proxyServer._sharedCreds.context.setKey(fs.readFileSync(process.env.PATH_TO_KEY));
  }, 1000);
});*/

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on("upgrade", function (req, socket, head) {
  proxy.ws(req, socket, head);
});

proxyServer.listen(process.env.PORT);
