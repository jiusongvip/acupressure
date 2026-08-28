# Fix internal links missing trailing slash in src (trailingSlash: "always" spec)
# Patterns: href="/xxx", href='/xxx', url:"/xxx" or href:"/xxx" (JS objects / data arrays)
# Exclude: assets (contain . like .webp/.css), anchors (#), templates (${), root (/)
$root = "d:\workspace\website\acupressure\src"
$utf8 = New-Object System.Text.UTF8Encoding($false)
$files = Get-ChildItem -Path $root -Recurse -Include *.astro, *.ts
$total = 0

foreach ($f in $files) {
  $content = [System.IO.File]::ReadAllText($f.FullName, $utf8)
  $script:count = 0
  $new = [regex]::Replace($content, '(href="|href=''|\"?(?:url|href|bodyUrl)\"?\s*:\s*")(/[^"'']*)("|'')', {
    param($m)
    $v = $m.Groups[2].Value
    if ($v -match '/$' -or $v -eq '/' -or $v -match '\.' -or $v -match '#' -or $v -match '\$') {
      return $m.Value
    }
    $script:count++
    return $m.Groups[1].Value + $v + '/' + $m.Groups[3].Value
  })
  if ($script:count -gt 0) {
    [System.IO.File]::WriteAllText($f.FullName, $new, $utf8)
    $total += $script:count
    Write-Host "$($f.FullName.Replace($root + '\','')) : +$($script:count)"
  }
}
Write-Host "==== total replaced: $total ===="
