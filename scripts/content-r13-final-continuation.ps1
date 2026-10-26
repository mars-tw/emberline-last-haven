$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new()
$env:PYTHONIOENCODING = 'utf-8'
$root = (Resolve-Path -LiteralPath '.').Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$out = Join-Path $root 'docs/content/r13'
$prior = Get-Content -Raw -Encoding UTF8 (Join-Path $out 'attempts/check-03.json') | ConvertFrom-Json
$hash = (Get-FileHash -LiteralPath 'dist/index.html' -Algorithm SHA256).Hash.ToLowerInvariant()
if ($prior.indexSha256 -ne $hash) { throw 'Cannot reuse passes from a different build' }
$units = Get-Content -Raw -Encoding UTF8 'docs/evidence/unit-tests.json' | ConvertFrom-Json
if ($units.numPassedTests -ne 270 -or $units.numFailedTests -ne 0) { throw 'Unit suite is not all green' }
$proofPaths = @('docs/evidence/browser.json','docs/evidence/deep-r1-after/receipt.json')
foreach ($round in 1..8) { $proofPaths += "docs/content/r13/regression/r$round/receipt.json" }
foreach ($proofPath in $proofPaths) {
  $proof = Get-Content -Raw -Encoding UTF8 -LiteralPath $proofPath | ConvertFrom-Json
  if ($proof.status -ne 'VERIFIED' -or $proof.indexSha256 -ne $hash) { throw "Earlier phase lacks current-build proof: $proofPath" }
}
$performance = Get-Content -Raw -Encoding UTF8 'docs/evidence/performance.json' | ConvertFrom-Json
if ($performance.status -ne 'VERIFIED') { throw 'Performance phase not green' }
$oldLog = Get-Content -Raw -Encoding UTF8 (Join-Path $out 'attempts/check-03.txt')
foreach ($marker in @('270 passed','VERIFIED: 5 import/export/quota browser cases','VERIFIED R9: actual generation sources','VERIFIED15 marker scenarios')) {
  if (-not $oldLog.Contains($marker)) { throw "Missing earlier executed proof: $marker" }
}
$pkg = Get-Content -Raw -Encoding UTF8 'package.json' | ConvertFrom-Json
$commands = @($pkg.scripts.'test:content' -split ' && ')
$first = [Array]::IndexOf($commands, 'node scripts/content-r9-layout.mjs')
if ($first -lt 0) { throw 'Continuation boundary missing' }
$started = (Get-Date).ToUniversalTime().ToString('o')
$phases = @()
$exitCode = 0
foreach ($command in $commands[$first..($commands.Length - 1)]) {
  if ($command -notmatch '^node (scripts/[a-z0-9-]+\.mjs)$') { throw 'Unsupported command' }
  $scriptPath = $Matches[1]
  "EXECUTED $command" | Out-File -Append -Encoding UTF8 -Width 4096 (Join-Path $out 'check-final-continuation.txt')
  $phaseStart = (Get-Date).ToUniversalTime().ToString('o')
  & node.exe $scriptPath 2>&1 | Out-File -Append -Encoding UTF8 -Width 4096 (Join-Path $out 'check-final-continuation.txt')
  $phaseCode = $LASTEXITCODE
  $phases += [ordered]@{command=$command;exitCode=$phaseCode;startedAt=$phaseStart;completedAt=(Get-Date).ToUniversalTime().ToString('o');indexSha256=$hash}
  if ($phaseCode -ne 0) { $exitCode = $phaseCode; break }
}
if ($exitCode -eq 0) {
  & npm.cmd run audit 2>&1 | Out-File -Append -Encoding UTF8 -Width 4096 (Join-Path $out 'check-final-continuation.txt')
  $exitCode = $LASTEXITCODE
  $phases += [ordered]@{command='npm run audit';exitCode=$exitCode;indexSha256=$hash}
}
if ((Get-FileHash -LiteralPath 'dist/index.html' -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hash) { throw 'Build changed during continuation' }
$result = [ordered]@{
  status=$(if ($exitCode -eq 0) {'VERIFIED'} else {'BLOCKED'})
  command='All npm run check phases; last build, resume at R9 layout after missing output-directory fix'
  mode='phased-same-build-after-old-media-cleanup'
  exitCode=$exitCode
  indexSha256=$hash
  startedAt=$started
  completedAt=(Get-Date).ToUniversalTime().ToString('o')
  earlierPassedPhases=@('test (270)','build','test:e2e','test:edges','test:art','test:perf','test:deep','content-r1 through content-r8','marker-layout (15 scenarios,2369 samples)')
  earlierProofs=$proofPaths
  earlierExecution='docs/content/r13/attempts/check-03.json'
  earlierLog='docs/content/r13/attempts/check-03.txt'
  earlierFailure='R9 geometry assertions ran, but writing layout-matrix.json failed because the relocated output directory did not exist. Added mkdir, changed no assertions or game/build bytes; reran from the R9 layout phase.'
  phases=$phases
  log='docs/content/r13/check-final-continuation.txt'
  concurrentLoad=$true
}
$result | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $out 'execution.json')
$result | ConvertTo-Json -Compress -Depth 10
exit $exitCode
