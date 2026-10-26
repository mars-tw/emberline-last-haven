$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath '.').Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$plan = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'docs/content/r15/cleanup-plan.json') | ConvertFrom-Json
if ([IO.Path]::GetFullPath($plan.workspace).TrimEnd('\') -ne $root.TrimEnd('\')) { throw 'Wrong plan workspace' }
$targets = @()
foreach ($row in $plan.delete) {
  if ($row.path -notmatch '^docs/(content/r([1-9]|1[0-4])/|evidence/)' -or $row.path -match '(^|/)\.\.(/|$)' -or $row.path -notmatch '\.(png|jpe?g|webp|gif|mp4|webm)$') { throw "Out of scope: $($row.path)" }
  $path = [IO.Path]::GetFullPath((Join-Path $root $row.path))
  if (-not $path.StartsWith(($root + '\docs\'), [StringComparison]::OrdinalIgnoreCase)) { throw "Escaped workspace: $path" }
  $item = Get-Item -LiteralPath $path
  if ($item.PSIsContainer -or $item.Length -ne $row.bytes) { throw "Changed target: $path" }
  & git ls-files --error-unmatch -- $row.path *> $null
  if ($LASTEXITCODE -ne 0) { throw "Protected untracked path: $path" }
  if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $row.sha256) { throw "Changed hash: $path" }
  $targets += $path
}
foreach ($path in $targets) { Remove-Item -LiteralPath $path }
foreach ($path in $targets) { if (Test-Path -LiteralPath $path) { throw "Still present: $path" } }
$plan.status = 'EXECUTED'
$plan | Add-Member -NotePropertyName executedAt -NotePropertyValue ((Get-Date).ToUniversalTime().ToString('o'))
$plan | ConvertTo-Json -Depth 15 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $root 'docs/content/r15/cleanup-result.json')
[ordered]@{status='EXECUTED';deletedFiles=$targets.Count;releaseBytes=$plan.releaseBytes;retainedFiles=$plan.retainedFiles} | ConvertTo-Json -Compress
