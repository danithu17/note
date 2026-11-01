Add-Type -AssemblyName System.Drawing

function Draw-ScribbleIcon {
    param(
        [int]$size,
        [string]$outputPath,
        [bool]$isRound = $false,
        [bool]$isForegroundOnly = $false
    )

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if (-not $isForegroundOnly) {
        # Background gradient
        $rect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
        $startColor = [System.Drawing.ColorTranslator]::FromHtml("#2563eb")
        $endColor = [System.Drawing.ColorTranslator]::FromHtml("#7c3aed")
        $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
            [System.Drawing.PointF]::new(0, 0),
            [System.Drawing.PointF]::new($size, $size),
            $startColor,
            $endColor
        )

        if ($isRound) {
            $g.FillEllipse($brush, 0, 0, $size, $size)
        } else {
            # Rounded rect for modern launcher
            $radius = $size * 0.22
            $path = New-Object System.Drawing.Drawing2D.GraphicsPath
            $d = $radius * 2
            $path.AddArc(0, 0, $d, $d, 180, 90)
            $path.AddArc($size - $d, 0, $d, $d, 270, 90)
            $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
            $path.AddArc(0, $size - $d, $d, $d, 90, 90)
            $path.CloseFigure()
            $g.FillPath($brush, $path)
        }

        # Subtle dot grid
        $dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 255, 255, 255))
        $step = $size * 0.2
        $dotRadius = [Math]::Max(1.0, $size * 0.012)
        for ($x = $size * 0.2; $x -le $size * 0.8; $x += $step) {
            for ($y = $size * 0.2; $y -le $size * 0.8; $y += $step) {
                $g.FillEllipse($dotBrush, ($x - $dotRadius), ($y - $dotRadius), ($dotRadius * 2), ($dotRadius * 2))
            }
        }
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }

    # Scale factors: normalize coordinates from 0..100 space
    $sx = $size / 100.0
    $sy = $size / 100.0

    # Ruled underline (Notebook guide)
    $lineColor = if ($isForegroundOnly) { [System.Drawing.ColorTranslator]::FromHtml("#93c5fd") } else { [System.Drawing.ColorTranslator]::FromHtml("#bfdbfe") }
    $linePen = New-Object System.Drawing.Pen $lineColor, ($size * 0.035)
    $linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($linePen, (33 * $sx), (74 * $sy), (73 * $sx), (74 * $sy))

    # Main Scribble flourish (Cubic Bezier curve)
    $scribblePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ($size * 0.065)
    $scribblePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $scribblePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $scribblePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $p1 = [System.Drawing.PointF]::new(32 * $sx, 65 * $sy)
    $c1 = [System.Drawing.PointF]::new(41 * $sx, 46 * $sy)
    $c2 = [System.Drawing.PointF]::new(48 * $sx, 58 * $sy)
    $p2 = [System.Drawing.PointF]::new(54 * $sx, 52 * $sy)

    $c3 = [System.Drawing.PointF]::new(60 * $sx, 46 * $sy)
    $c4 = [System.Drawing.PointF]::new(66 * $sx, 38 * $sy)
    $p3 = [System.Drawing.PointF]::new(73 * $sx, 35 * $sy)

    $g.DrawBezier($scribblePen, $p1, $c1, $c2, $p2)
    $g.DrawBezier($scribblePen, $p2, $c3, $c4, $p3)

    # Golden spark at tip
    $goldBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#facc15"))
    $gr = $size * 0.046
    $g.FillEllipse($goldBrush, (73 * $sx - $gr), (35 * $sy - $gr), ($gr * 2), ($gr * 2))

    # Starlet detail
    $starBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#fef08a"))
    $spX = 78 * $sx
    $spY = 24 * $sy
    $spR = $size * 0.04
    $points = @(
        [System.Drawing.PointF]::new($spX, $spY - $spR),
        [System.Drawing.PointF]::new($spX + $spR * 0.35, $spY - $spR * 0.35),
        [System.Drawing.PointF]::new($spX + $spR, $spY),
        [System.Drawing.PointF]::new($spX + $spR * 0.35, $spY + $spR * 0.35),
        [System.Drawing.PointF]::new($spX, $spY + $spR),
        [System.Drawing.PointF]::new($spX - $spR * 0.35, $spY + $spR * 0.35),
        [System.Drawing.PointF]::new($spX - $spR, $spY),
        [System.Drawing.PointF]::new($spX - $spR * 0.35, $spY - $spR * 0.35)
    )
    $g.FillPolygon($starBrush, $points)

    $g.Dispose()

    $dir = [System.IO.Path]::GetDirectoryName($outputPath)
    if (-not [System.IO.Directory]::Exists($dir)) {
        [System.IO.Directory]::CreateDirectory($dir) | Out-Null
    }

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated: $outputPath ($size x $size)"
}

$densities = @{
    "mdpi"    = @{ icon = 48;  fg = 108 }
    "hdpi"    = @{ icon = 72;  fg = 162 }
    "xhdpi"   = @{ icon = 96;  fg = 216 }
    "xxhdpi"  = @{ icon = 144; fg = 324 }
    "xxxhdpi" = @{ icon = 192; fg = 432 }
}

$baseRes = "E:\A\note\android\app\src\main\res"

foreach ($d in $densities.Keys) {
    $iconSize = $densities[$d].icon
    $fgSize = $densities[$d].fg
    $targetDir = Join-Path $baseRes "mipmap-$d"

    Draw-ScribbleIcon -size $iconSize -outputPath (Join-Path $targetDir "ic_launcher.png")
    Draw-ScribbleIcon -size $iconSize -outputPath (Join-Path $targetDir "ic_launcher_round.png") -isRound $true
    Draw-ScribbleIcon -size $fgSize -outputPath (Join-Path $targetDir "ic_launcher_foreground.png") -isForegroundOnly $true
}

# 512x512 Play Store Asset
Draw-ScribbleIcon -size 512 -outputPath "E:\A\apk\ic_launcher-512.png"
Draw-ScribbleIcon -size 512 -outputPath (Join-Path $baseRes "ic_launcher-playstore.png")
