$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ((Get-Content -LiteralPath (Join-Path $taskRoot '.acqpath-distribution-root') -Raw).Trim() -ne 'acqpath-distribution-v1') { throw 'WRONG_WORKSPACE' }
$toolsDir = Join-Path $taskRoot '.tools'
New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
$headers = @{ 'User-Agent' = 'AcqPathDistribution'; Accept = 'application/vnd.github+json' }
foreach ($spec in @(
    @{ Repo = 'cli/cli'; Name = 'gh'; Asset = '^gh_[0-9.]+_windows_amd64.zip$'; Binary = 'bin/gh.exe' },
    @{ Repo = 'gitleaks/gitleaks'; Name = 'gitleaks'; Asset = '^gitleaks_[0-9.]+_windows_x64.zip$'; Binary = 'gitleaks.exe' }
)) {
    $release = Invoke-RestMethod -Uri ('https://api.github.com/repos/' + $spec.Repo + '/releases/latest') -Headers $headers
    $asset = @($release.assets | Where-Object { $_.name -match $spec.Asset })
    if ($asset.Count -ne 1 -or $asset[0].digest -notmatch '^sha256:[a-f0-9]{64}$') { throw ('OFFICIAL_CHECKSUM_REQUIRED_' + $spec.Name) }
    $archive = Join-Path $toolsDir $asset[0].name
    Invoke-WebRequest -Uri $asset[0].browser_download_url -OutFile $archive -Headers $headers
    $actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $asset[0].digest.Substring(7)) { throw 'ARCHIVE_CHECKSUM_MISMATCH' }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [IO.Compression.ZipFile]::OpenRead($archive)
    try {
        $entry = @($zip.Entries | Where-Object { $_.FullName -eq $spec.Binary })
        if ($entry.Count -ne 1) { throw 'UNEXPECTED_ARCHIVE_LAYOUT' }
        $binary = Join-Path (Join-Path $toolsDir $spec.Name) $spec.Binary
        New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($binary)) -Force | Out-Null
        if (Test-Path -LiteralPath $binary) { throw 'TOOL_ALREADY_EXISTS_REVIEW_REQUIRED' }
        [IO.Compression.ZipFileExtensions]::ExtractToFile($entry[0], $binary, $false)
    } finally { $zip.Dispose() }
    @{
        repository = $spec.Repo; version = $release.tag_name; asset = $asset[0].name
        archiveSha256 = $actual; binarySha256 = (Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash.ToLowerInvariant()
        installedAt = [DateTime]::UtcNow.ToString('o'); globalPathChanged = $false
    } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $toolsDir ($spec.Name + '.lock.json'))
    Write-Output ($spec.Name + ' installed locally: ' + $release.tag_name)
}
