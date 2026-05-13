$file = '.\ai.js'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

$replacements = @{
    'ðŸ§' = '🧠'
    'ðŸ'¤' = '👤'
    'ðŸš«' = '🚫'
    'ðŸ"Š' = '📊'
    'ðŸ"' = '📝'
    'ðŸ'¡' = '💡'
    'ðŸ› ï¸' = '🛠️'
    'ðŸ"¦' = '📦'
    'ðŸ"Œ' = '📌'
    'ðŸ—„ï¸' = '🗄️'
    'ðŸ—£ï¸' = '🗣️'
    'ðŸ"‹' = '📋'
    'ðŸ'¬' = '💬'
    'ðŸ"£' = '📣'
    'ðŸ"''' = '📱'
    'ðŸ•¹ï¸' = '🕹️'
    'ðŸ'¾' = '💾'
    'ðŸ—ºï¸' = '🗺️'
    'ðŸ"…' = '📅'
    'ðŸ¤–' = '🤖'
    'ðŸŽ¯' = '🎯'
    'ðŸŽ¨' = '🎨'
    'ðŸŽ®' = '🎮'
    'ðŸ'°' = '💰'
    'ðŸ›' = '🛠️'
}

$replaced = 0
foreach ($old in $replacements.Keys) {
    $new = $replacements[$old]
    while ($content.Contains($old)) {
        $content = $content.Replace($old, $new)
        $replaced++
    }
}

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Replaced $replaced instances"
