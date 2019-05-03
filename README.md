# .env file should document
```
# Server
PORT_HTTP port to listen for http (will be redirected to https)
PORT_HTTPS port to listen for data

# Certificate
PATH_TO_CRT path to crt
PATH_TO_KEY path to key or pem

# Proxy Targets
PROXY_TARGET_WEB www server and port on http:// (not https)
PROXY_TARGET_WS_CHAT_PRIVATE ws server and port for chat private ws:// (not wss://)
PROXY_TARGET_WS_CHAT_PUBLIC ws server and port for chat public ws:// (not wss://)
```
