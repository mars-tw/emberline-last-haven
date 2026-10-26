$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$env:PYTHONIOENCODING = 'utf-8'
$root = (Get-Location).Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$out = Join-Path $root 'docs/content/r12'
$started = (Get-Date).ToUniversalTime().ToString('o')
& npm.cmd run check 2>&1 | Out-File -Encoding UTF8 -Width 4096 -FilePath (Join-Path $out 'check-output.txt')
$code = $LASTEXITCODE
$result = [ordered]@{
  status = $(if ($code -eq 0) {'EXECUTED'} else {'BLOCKED'})
  command = 'npm run check'
  mode = 'single-invocation'
  exitCode = $code
  startedAt = $started
  completedAt = (Get-Date).ToUniversalTime().ToString('o')
  indexSha256 = (Get-FileHash -LiteralPath (Join-Path $root 'dist/index.html') -Algorithm SHA256).Hash.ToLowerInvariant()
  log = 'docs/content/r12/check-output.txt'
  concurrentLoad = $true
}
$result | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $out 'execution.json')
$result | ConvertTo-Json -Compress
exit $code
