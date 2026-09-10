#!/bin/bash
# Double-click to start Sparkle Tables locally
cd "$(dirname "$0")"
PORT=8765
( sleep 1; open "http://localhost:$PORT/" ) &
echo "Sparkle Tables is running at http://localhost:$PORT/  (close this window to stop)"
python3 -m http.server $PORT
