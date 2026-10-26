param([string]$FromScript = 'scripts/content-r2.mjs')
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new()
$env:PYTHONIOENCODING = 'utf-8'
$root = (Resolve-Path -LiteralPath '.').Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$out = Join-Path $root 'docs/content/r13'
$prior = Get-Content -Raw -Encoding UTF8 (Join-Path $out 'attempts/check-02.json') | ConvertFrom-Json
$hash = (Get-FileHash -LiteralPath 'dist/index.html' -Algorithm SHA256).Hash.ToLowerInvariant()
if ($prior.indexSha256 -ne $hash) { throw 'Earlier passes belong to a different build' }
$log = Get-Content -Raw -Encoding UTF8 (Join-Path $out 'attempts/check-02.txt')
foreach ($marker in @('270 passed','VERIFIED: 5 import/export/quota browser cases','VERIFIED deep R1 controls','VERIFIED R1: 54 checks','VERIFIED R9: actual generation sources')) {
  if (-not $log.Contains($marker)) { throw "Missing earlier success: $marker" }
}
$pkg = Get-Content -Raw -Encoding UTF8 'package.json' | ConvertFrom-Json
$commands = @($pkg.scripts.'test:content' -split ' && ')
if ($commands[0] -ne 'node scripts/content-r1.mjs' -or $commands[1] -ne 'node scripts/content-r2.mjs') { throw 'Unexpected content order' }
$started = (Get-Date).ToUniversalTime().ToString('o')
$phases = @()
$exitCode = 0
$earlierPassed = @('test (270)','build','test:e2e','test:edges','test:art','test:perf','test:deep','content-r1 (54)')
$first = [Array]::IndexOf($commands, ('node ' + $FromScript))
if ($first -lt 1) { throw 'Unsupported continuation boundary' }
if ($first -gt 1) {
  $earlierPassed += 'content-r2 gameplay/receipt/hash/index (r2-index-recovery.json)'
  $recovery = Get-Content -Raw -Encoding UTF8 (Join-Path $out 'attempts/r2-index-recovery.json') | ConvertFrom-Json
  if ($recovery.status -ne 'VERIFIED' -or $recovery.indexSha256 -ne $hash -or $FromScript -ne 'scripts/content-r3.mjs') { throw 'Missing verified R2 boundary' }
}
foreach ($command in $commands[$first..($commands.Length - 1)]) {
  if ($command -notmatch '^node (scripts/[a-z0-9-]+\.mjs)$') { throw 'Unsupported command' }
  $scriptPath = $Matches[1]
  $phaseStart = (Get-Date).ToUniversalTime().ToString('o')
  "EXECUTED $command" | Out-File -Append -Encoding UTF8 -Width 4096 (Join-Path $out 'resume-output.txt')
  & node.exe $scriptPath 2>&1 | Out-File -Append -Encoding UTF8 -Width 4096 (Join-Path $out 'resume-output.txt')
  $phaseCode = $LASTEXITCODE
  $phases += [ordered]@{command=$command;exitCode=$phaseCode;startedAt=$phaseStart;completedAt=(Get-Date).ToUniversalTime().ToString('o');indexSha256=$hash}
  if ($phaseCode -ne 0) { $exitCode = $phaseCode; break }
}
if ($exitCode -eq 0) {
  & npm.cmd run audit 2>&1 | Out-File -Append -Encoding UTF8 -Width 4096 (Join-Path $out 'resume-output.txt')
  $exitCode = $LASTEXITCODE
  $phases += [ordered]@{command='npm run audit';exitCode=$exitCode;indexSha256=$hash}
}
if ((Get-FileHash -LiteralPath 'dist/index.html' -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hash) { throw 'Build changed during continuation' }
$result = [ordered]@{
  status=$(if ($exitCode -eq 0) {'VERIFIED'} else {'BLOCKED'})
  command='All npm run check phases; unchanged build, resume at R2 after exact unit-count metadata fix'
  mode='phased-same-build-after-old-media-cleanup'
  exitCode=$exitCode
  indexSha256=$hash
  startedAt=$started
  completedAt=(Get-Date).ToUniversalTime().ToString('o')
  earlierPassedPhases=$earlierPassed
  earlierExecution='docs/content/r13/attempts/check-02.json'
  earlierLog='docs/content/r13/attempts/check-02.txt'
  earlierFailure='R2 diagnostic expected 263 unit tests; actual all-passing total is 270 after seven new R13 tests. Strict expected value updated to 270. Runtime/build unchanged.'
  phases=$phases
  log='docs/content/r13/resume-output.txt'
  concurrentLoad=$true
}
$result | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $out 'execution.json')
$result | ConvertTo-Json -Compress -Depth 10
exit $exitCode
