$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath '.').Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$dir = Join-Path $root 'docs/content/r15'
$execution = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $dir 'execution-final.json') | ConvertFrom-Json
if ($execution.exitCode -ne 0 -or $execution.status -ne 'VERIFIED') { throw 'Full check must pass before final temp cleanup' }
$targets = @()
foreach ($name in @('execution-front.json','check-front-output.txt','front-verification.json','stage-execution.json')) {
  $path = Join-Path $dir $name
  if (Test-Path -LiteralPath $path) { $targets += $path }
}
$phaseHelper = Join-Path $root 'scripts/content-r15-check-remaining.ps1'
if (Test-Path -LiteralPath $phaseHelper) { $targets += $phaseHelper }
$tempRoot = Join-Path $root '.audit-tmp'
if (Test-Path -LiteralPath $tempRoot) {
  $targets += Get-ChildItem -LiteralPath $tempRoot -Recurse -File | Where-Object { $_.FullName.Substring($tempRoot.Length + 1) -match '^r15[-\\/]' } | ForEach-Object { $_.FullName }
}
# These are this round's copied obsolete bookkeeping, not executable test inputs.
foreach ($name in @('check-final-output.txt','cleanup-plan.json','cleanup-result.json','execution-final.json','historical-test-fixtures.json','post-cleanup-audit.json','post-cleanup-audit.txt','preview-stop.json','secret-scan.json','temp-cleanup-plan.json','temp-cleanup.json','verification.json','visual-review.json')) {
  $path = Join-Path $dir ('regression/r14/' + $name)
  if (Test-Path -LiteralPath $path) { $targets += $path }
}
$targets += Get-ChildItem -LiteralPath (Join-Path $dir 'regression') -Recurse -File -Filter 'failure.txt' | ForEach-Object { $_.FullName }
$generated = 'C:\Users\digimkt\.codex\generated_images\01a15ef1-8f1f-7281-8d89-72bfc5322928\exec-e63e96b3-9e32-4745-914a-2e1701d93fad.png'
$master = Join-Path $root 'docs/art/masters/content-r15/laoxi-duty.png'
if (Test-Path -LiteralPath $generated) {
  if ((Get-FileHash -LiteralPath $generated -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $master -Algorithm SHA256).Hash) { throw 'Generated duplicate differs from retained master' }
  $targets += $generated
}
$rows = @()
foreach ($target in ($targets | Sort-Object -Unique)) {
  $path = [IO.Path]::GetFullPath($target)
  if (-not $path.StartsWith(($root + '\'), [StringComparison]::OrdinalIgnoreCase) -and $path -ne $generated) { throw "Escaped scope: $path" }
  $item = Get-Item -LiteralPath $path
  if ($item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Not a plain owned file: $path" }
  $rows += [ordered]@{path=$path;bytes=$item.Length;sha256=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant();reason='Owned R15 temporary, copied obsolete bookkeeping, or byte-identical generated duplicate'}
}
$bytes = 0L
foreach ($row in $rows) { $bytes += [int64]$row.bytes }
[ordered]@{status='PREPARED';delete=$rows;deleteFiles=$rows.Count;releaseBytes=$bytes} | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $dir 'temp-cleanup-plan.json')
foreach ($row in $rows) { Remove-Item -LiteralPath $row.path }
foreach ($row in $rows) { if (Test-Path -LiteralPath $row.path) { throw "Still present: $($row.path)" } }
$generatedDir = 'C:\Users\digimkt\.codex\generated_images\01a15ef1-8f1f-7281-8d89-72bfc5322928'
$emptyGeneratedDirRemoved = $false
if ((Test-Path -LiteralPath $generatedDir) -and @(Get-ChildItem -Force -LiteralPath $generatedDir).Count -eq 0) {
  if ([IO.Path]::GetFullPath($generatedDir) -ne (Split-Path -Parent $generated)) { throw 'Wrong generated directory' }
  Remove-Item -LiteralPath $generatedDir
  $emptyGeneratedDirRemoved = $true
}
$rebuilt = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $dir 'review-set-rebuild-cleanup.json') | ConvertFrom-Json
$remaining = @(Get-ChildItem -LiteralPath $tempRoot -Recurse -File | Where-Object { $_.FullName.Substring($tempRoot.Length + 1) -match '^r15[-\\/]' }).Count
if ($remaining -ne 0) { throw 'Owned temp remains' }
[ordered]@{status='VERIFIED';deletedFiles=($rows.Count + $rebuilt.deleteFiles);releaseBytes=($bytes + $rebuilt.releaseBytes);finalPurgeFiles=$rows.Count;finalPurgeBytes=$bytes;rebuiltSelectionBytes=$rebuilt.releaseBytes;delete=$rows;rebuiltReviewSelection=$rebuilt;ownedTempRemaining=$remaining;emptyGeneratedDirRemoved=$emptyGeneratedDirRemoved;scope='Measured final cleanup plus the last recorded review-set rebuild. Earlier unmeasured failed-run overwrites are not included. Existing untracked files and other-lane temps remain protected. Browser profiles use Playwright automatic cleanup.'} | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $dir 'temp-cleanup.json')
Write-Output "VERIFIED owned cleanup: $($rows.Count + $rebuilt.deleteFiles) files, $($bytes + $rebuilt.releaseBytes) bytes; remaining=$remaining"
