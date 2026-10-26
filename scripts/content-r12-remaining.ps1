param([ValidateSet('deep','content','audit')][string]$StartAt = 'deep')
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$env:PYTHONIOENCODING = 'utf-8'
$root = (Resolve-Path -LiteralPath '.').Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$dir = Join-Path $root 'docs/content/r12'
$front = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $dir 'front-execution.json') | ConvertFrom-Json
$hash = (Get-FileHash -LiteralPath 'dist/index.html' -Algorithm SHA256).Hash.ToLowerInvariant()
if ($front.status -ne 'VERIFIED' -or $front.indexSha256 -ne $hash) { throw 'Completed front stages do not match this build' }
$phases = @()
$priorPath = Join-Path $dir 'remaining-execution.json'
if (Test-Path -LiteralPath $priorPath) {
  $prior = Get-Content -Raw -Encoding UTF8 -LiteralPath $priorPath | ConvertFrom-Json
  if ($prior.indexSha256 -ne $hash) { throw 'Previous phases belong to a different build' }
  $phases = @($prior.phases)
}
$names = @('deep','content','audit')
$start = [Array]::IndexOf($names,$StartAt)
for ($i=0;$i -lt $start;$i++) {
  if (-not ($phases | Where-Object { $_.name -eq $names[$i] -and $_.exitCode -eq 0 })) { throw "Earlier phase has not passed: $($names[$i])" }
}
$code = 0
for ($i=$start;$i -lt $names.Count;$i++) {
  $name = $names[$i]
  $script = $(if ($name -eq 'audit') {'audit'} else {'test:'+$name})
  $log = Join-Path $dir ($name+'-check-output.txt')
  $ErrorActionPreference = 'Continue'
  & npm.cmd run $script 2>&1 | Out-File -Encoding UTF8 -Width 4096 -FilePath $log
  $code = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ((Get-FileHash -LiteralPath 'dist/index.html' -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hash) { throw 'Build changed during verification' }
  $phases = @($phases | Where-Object name -NE $name) + @([ordered]@{name=$name;command=('npm run '+$script);exitCode=$code;log=('docs/content/r12/'+$name+'-check-output.txt');completedAt=(Get-Date).ToUniversalTime().ToString('o')})
  [ordered]@{status=$(if($code -eq 0){'EXECUTED'}else{'BLOCKED'});indexSha256=$hash;phases=$phases} | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath $priorPath
  if ($code -ne 0) { break }
}
$allPassed = @($names | Where-Object { $n=$_; -not ($phases | Where-Object { $_.name -eq $n -and $_.exitCode -eq 0 }) }).Count -eq 0
$result = [ordered]@{status=$(if($allPassed){'EXECUTED'}else{'BLOCKED'});command='All npm run check stages';mode='phased-same-build';exitCode=$(if($allPassed){0}else{$code});singleInvocationNpmRunCheckExitCode=$front.originalInvocationExitCode;indexSha256=$hash;frontEvidence='docs/content/r12/front-execution.json';remainingEvidence='docs/content/r12/remaining-execution.json';concurrentLoad=$true}
$result | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $dir 'execution.json')
$result | ConvertTo-Json -Compress
exit $result.exitCode
