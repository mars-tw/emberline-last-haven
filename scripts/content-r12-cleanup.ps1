$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$root = (Resolve-Path -LiteralPath '.').Path
if ((Split-Path -Leaf $root) -ne 'apocalypse-anthology') { throw 'Wrong workspace' }
$planPath = Join-Path $root 'docs/content/r12/cleanup-plan.json'
$plan = Get-Content -Raw -Encoding UTF8 -LiteralPath $planPath | ConvertFrom-Json
if ([IO.Path]::GetFullPath($plan.workspace).TrimEnd('\') -ne $root.TrimEnd('\')) { throw 'Plan belongs to another workspace' }
$targets = @()
# Validate the entire explicit list before the first deletion. No recursive removal.
foreach ($row in $plan.delete) {
  if ($row.path -notmatch '^docs/(content/r([1-9]|1[01])/|evidence/)' -or $row.path -match '^docs/evidence/content-r12/' -or $row.path -match '(^|/)\.\.(/|$)' -or $row.path -notmatch '\.(png|jpe?g|webp|gif|mp4|webm)$') { throw "Out-of-scope path: $($row.path)" }
  $path = [IO.Path]::GetFullPath((Join-Path $root $row.path))
  if (-not $path.StartsWith(($root + '\docs\'), [StringComparison]::OrdinalIgnoreCase)) { throw "Escaped workspace: $path" }
  $item = Get-Item -LiteralPath $path
  if ($item.PSIsContainer -or $item.Length -ne $row.bytes) { throw "Changed target: $path" }
  & git ls-files --error-unmatch -- $row.path *> $null
  if ($LASTEXITCODE -ne 0) { throw "Untracked file is protected: $path" }
  if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $row.sha256) { throw "Hash changed: $path" }
  $targets += $path
}
foreach ($path in $targets) { Remove-Item -LiteralPath $path }
foreach ($path in $targets) { if (Test-Path -LiteralPath $path) { throw "Deletion not verified: $path" } }
$plan.status = 'EXECUTED'
$plan | Add-Member -NotePropertyName executedAt -NotePropertyValue ((Get-Date).ToUniversalTime().ToString('o'))
$plan | Add-Member -NotePropertyName method -NotePropertyValue 'Native PowerShell Remove-Item -LiteralPath per verified tracked file; no recursive operation'
$plan | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $root 'docs/content/r12/cleanup-result.json')
[ordered]@{status='EXECUTED';deletedFiles=$targets.Count;releaseBytes=$plan.releaseBytes;retainedFiles=$plan.retainedFiles} | ConvertTo-Json -Compress
