$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new()
$env:PYTHONIOENCODING = 'utf-8'
$root = (Resolve-Path -LiteralPath '.').Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$started = (Get-Date).ToUniversalTime().ToString('o')
& npm.cmd run check 2>&1 | Out-File -Encoding UTF8 -Width 4096 -FilePath (Join-Path $root 'docs/content/r13/check-output.txt')
$checkCode = $LASTEXITCODE
$result = [ordered]@{
  status = $(if ($checkCode -eq 0) {'VERIFIED'} else {'BLOCKED'})
  command = 'npm run check'
  mode = 'single-invocation-after-old-media-cleanup'
  exitCode = $checkCode
  startedAt = $started
  completedAt = (Get-Date).ToUniversalTime().ToString('o')
  indexSha256 = (Get-FileHash -LiteralPath (Join-Path $root 'dist/index.html') -Algorithm SHA256).Hash.ToLowerInvariant()
  log = 'docs/content/r13/check-output.txt'
  concurrentLoad = $true
}
$result | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $root 'docs/content/r13/execution.json')
$result | ConvertTo-Json -Compress
exit $checkCode
