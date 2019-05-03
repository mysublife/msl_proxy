require("dotenv").config();

const fs = require("fs");
const http = require("http");
const https = require("https");
const httpProxy = require("http-proxy");

const proxy = new httpProxy.createProxyServer();

const httpServer = http.createServer((req, res) => {
  res.writeHead(301,
    {Location: "https://" + req.headers.host + req.url}
  );
  res.end();
});

const httpsServer = https.createServer({
    key: fs.readFileSync(process.env.PATH_TO_KEY),
    cert: fs.readFileSync(process.env.PATH_TO_CRT)
  },
  (req, res) => {
    proxy.web(req, res, {"target": process.env.PROXY_TARGET_WEB}, (e) => {
      console.error(e);
    });
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
      target = process.env.PROXY_TARGET_WS_CHAT_PRIVATE;
      break;
    case "/ws/chat_public/":
      target = process.env.PROXY_TARGET_WS_CHAT_PUBLIC;
      break;
  }

  if (!target) {
    return;
  }

  proxy.ws(req, socket, head, {"target": target}, (e) => {
    console.error(e);
  });
});

httpServer.listen(process.env.PORT_HTTP);
httpsServer.listen(process.env.PORT_HTTPS);
