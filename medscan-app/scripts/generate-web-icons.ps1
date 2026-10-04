# Render the ECG mark in public/icons/medscan.svg to PNG on Windows.
Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path $PSScriptRoot '../public/icons'
foreach ($iconSize in @(192, 512)) {
    $bitmap = New-Object System.Drawing.Bitmap $iconSize, $iconSize
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#075E58'))
    $scale = $iconSize / 512.0
    $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#B4E4D8')), ([single](28 * $scale))
    $pen.StartCap = $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $coordinates = @(@(110,272), @(175,272), @(209,192), @(254,333), @(290,241), @(319,272), @(402,272))
    $points = [System.Drawing.PointF[]]@($coordinates | ForEach-Object {
        New-Object System.Drawing.PointF ([single]($_[0] * $scale)), ([single]($_[1] * $scale))
    })
    try {
        $graphics.DrawLines($pen, $points)
        $bitmap.Save((Join-Path $iconDirectory "icon-$iconSize.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $pen.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}
