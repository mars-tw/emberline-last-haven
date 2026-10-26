param([string]$StartAt = 'content-r2.mjs')
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$env:PYTHONIOENCODING = 'utf-8'
$root = (Resolve-Path -LiteralPath '.').Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$dir = Join-Path $root 'docs/content/r12'
$hash = (Get-FileHash -LiteralPath 'dist/index.html' -Algorithm SHA256).Hash.ToLowerInvariant()
$pkg = Get-Content -Raw -Encoding UTF8 -LiteralPath 'package.json' | ConvertFrom-Json
$names = @($pkg.scripts.'test:content'.Split(@(' && '),[StringSplitOptions]::None) | ForEach-Object {
  if ($_ -notmatch '^node scripts/([a-z0-9-]+\.mjs)$') { throw "Unexpected content command: $_" }
  $Matches[1]
})
$path = Join-Path $dir 'content-modules.json'
$proof = Get-Content -Raw -Encoding UTF8 -LiteralPath $path | ConvertFrom-Json
if ($proof.indexSha256 -ne $hash) { throw 'Previous content proof belongs to another build' }
$records = @($proof.records)
$start = [Array]::IndexOf($names,$StartAt)
if ($start -lt 0) { throw 'Unknown starting script' }
for($i=0;$i -lt $start;$i++) { if(-not($records | Where-Object {$_.name -eq $names[$i] -and $_.exitCode -eq 0})) {throw "Missing passed predecessor: $($names[$i])"} }
$code = 0
for($i=$start;$i -lt $names.Count;$i++) {
  $name = $names[$i]
  $log = Join-Path $dir ($name.Replace('.mjs','')+'-check-output.txt')
  $ErrorActionPreference = 'Continue'
  & node ('scripts/'+$name) 2>&1 | Out-File -Encoding UTF8 -Width 4096 -FilePath $log
  $code = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ((Get-FileHash -LiteralPath 'dist/index.html' -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hash) { throw 'Build changed during content verification' }
  $records = @($records | Where-Object name -NE $name) + @([ordered]@{name=$name;exitCode=$code;log=('docs/content/r12/'+$name.Replace('.mjs','')+'-check-output.txt');completedAt=(Get-Date).ToUniversalTime().ToString('o')})
  [ordered]@{status=$(if($code -eq 0){'EXECUTED'}else{'BLOCKED'});indexSha256=$hash;singleInvocationTestContentExitCode=1;records=$records} | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -LiteralPath $path
  if($code -ne 0){break}
}
$allPassed = @($names | Where-Object {$n=$_; -not($records | Where-Object {$_.name -eq $n -and $_.exitCode -eq 0})}).Count -eq 0
if($allPassed){
  $remainingPath = Join-Path $dir 'remaining-execution.json'
  $remaining = Get-Content -Raw -Encoding UTF8 -LiteralPath $remainingPath | ConvertFrom-Json
  if($remaining.indexSha256 -ne $hash){throw 'Other completed phases belong to another build'}
  $remaining.phases = @($remaining.phases | Where-Object name -NE 'content') + @([ordered]@{name='content';command='All test:content node scripts, same-build segmented';exitCode=0;singleInvocationTestContentExitCode=1;moduleEvidence='docs/content/r12/content-modules.json';completedAt=(Get-Date).ToUniversalTime().ToString('o')})
  $remaining.status='EXECUTED'
  $remaining | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -LiteralPath $remainingPath
}
[ordered]@{status=$(if($allPassed){'VERIFIED'}else{'BLOCKED'});allScripts=$names.Count;completed=@($records | Where-Object exitCode -EQ 0).Count;indexSha256=$hash;exitCode=$code} | ConvertTo-Json -Compress
exit $code
