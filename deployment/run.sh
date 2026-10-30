#!/bin/sh
# Started by the Lambda Web Adapter; the API listens on $PORT (8080) and the adapter forwards requests to it.
exec node dist/server.js
