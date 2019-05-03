// TODO: Add redirect from HTTP to proper URL in HTTPS

require("dotenv").config();

const fs = require("fs");
const http = require("http");
const https = require("https");
const httpProxy = require("http-proxy");

const proxy = new httpProxy.createProxyServer();

const httpsServer = https.createServer({
    key: fs.readFileSync(process.env.PATH_TO_KEY),
    cert: fs.readFileSync(process.env.PATH_TO_CRT)
  },
  (req, res) => {
    proxy.web(req, res, {target: "http://localhost:80"});
});

var timeout;
fs.watch(process.env.PATH_TO_CRT, () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    httpsServer._sharedCreds.context.setCert(fs.readFileSync(process.env.PATH_TO_CRT));
    httpsServer._sharedCreds.context.setKey(fs.readFileSync(process.env.PATH_TO_KEY));
  }, 1000);
});

httpsServer.on("upgrade", function (req, socket, head) {
  if (req.headers.upgrade !== "websocket") {return;}

  let target = null;

  switch (req.url) {
    case "/ws/chat_private/":
      target = "ws://localhost:8090";
      break;
    case "/ws/chat_public/":
      target = "";
      break;
  }

  if (!target) {
    return;
  }

  proxy.ws(req, socket, head, {"target": target});
});

httpsServer.listen(process.env.PORT);


