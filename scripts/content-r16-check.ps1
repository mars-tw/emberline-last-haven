$ErrorActionPreference = 'Stop'
$env:PYTHONIOENCODING = 'utf-8'
$root = (Resolve-Path -LiteralPath '.').Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$dir = Join-Path $root 'docs/content/r16'
$started = (Get-Date).ToUniversalTime().ToString('o')
$ErrorActionPreference = 'Continue'
& npm run check 2>&1 | Out-File -Encoding utf8 -LiteralPath (Join-Path $dir 'check-final-output.txt')
$exitCode = $LASTEXITCODE
$ErrorActionPreference = 'Stop'
[ordered]@{status=$(if($exitCode -eq 0){'VERIFIED'}else{'BLOCKED'});command='npm run check';exitCode=$exitCode;singleInvocation=$true;startedAt=$started;endedAt=(Get-Date).ToUniversalTime().ToString('o');indexSha256=(Get-FileHash -LiteralPath (Join-Path $root 'dist/index.html') -Algorithm SHA256).Hash.ToLowerInvariant();headless=$true;muteAudio=$true;concurrentHost=$true;shippingQualified=$false} | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $dir 'execution-final.json')
Write-Output "npm run check exitCode=$exitCode"
exit $exitCode
