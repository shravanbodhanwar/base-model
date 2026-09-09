#!/usr/bin/env pwsh
# Start frontend without SWC
$env:NODE_OPTIONS = "--max-old-space-size=2048"
$env:NEXT_SKIP_SWC_MINIFICATION = "true"
$env:NEXT_EXPERIMENTAL_DETECT_NULL_ROUTE = "false"

cd c:\Users\badhe\Desktop\base-model\apps\web
npm run dev
