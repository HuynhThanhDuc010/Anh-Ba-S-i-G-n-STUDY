$ErrorActionPreference = "Stop"

$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Join-Path $appDir "index.html"
$icon = Join-Path $appDir "Anh_Ba_Saigon_Studies.ico"

if (-not (Test-Path $html)) {
    Write-Host "Khong tim thay index.html" -ForegroundColor Red
    pause
    exit 1
}

$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath("Desktop")
$link = Join-Path $desktop "Anh Ba Saigon Studies.lnk"

$shortcut = $ws.CreateShortcut($link)
$shortcut.TargetPath = $html
$shortcut.WorkingDirectory = $appDir

if (Test-Path $icon) {
    $shortcut.IconLocation = "$icon,0"
}

$shortcut.Save()

Write-Host ""
Write-Host "DA TAO SHORTCUT THANH CONG" -ForegroundColor Green
Write-Host $link -ForegroundColor Cyan
Write-Host ""
Write-Host "Neu icon chua doi ngay, ra Desktop va nhan F5."
