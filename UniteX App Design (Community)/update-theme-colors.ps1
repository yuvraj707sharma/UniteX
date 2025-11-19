# UniteX Theme Color Update Script
# This script updates all Tailwind color classes from old theme to new theme
# Dark Mode: Blue → Orange
# Light Mode: Red → Blue

Write-Host "Starting UniteX Theme Color Update..." -ForegroundColor Cyan
Write-Host ""

$componentsPath = "src/components"
$filesUpdated = 0
$totalReplacements = 0

# Get all .tsx files
$files = Get-ChildItem -Path $componentsPath -Filter *.tsx -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    # Dark Mode: Blue → Orange replacements
    $darkModeReplacements = @{
        'dark:bg-blue-500' = 'dark:bg-orange-600'
        'dark:bg-blue-600' = 'dark:bg-orange-700'
        'dark:hover:bg-blue-500' = 'dark:hover:bg-orange-600'
        'dark:hover:bg-blue-600' = 'dark:hover:bg-orange-700'
        'dark:text-blue-400' = 'dark:text-orange-400'
        'dark:text-blue-500' = 'dark:text-orange-600'
        'dark:text-blue-200' = 'dark:text-orange-200'
        'dark:border-blue-500' = 'dark:border-orange-600'
        'dark:border-blue-500/20' = 'dark:border-orange-600/20'
        'dark:bg-blue-500/10' = 'dark:bg-orange-600/10'
        'dark:bg-blue-500/30' = 'dark:bg-orange-600/30'
        'dark:from-blue-500' = 'dark:from-orange-600'
        'dark:to-blue-600' = 'dark:to-orange-700'
        'dark:group-hover:bg-blue-500/10' = 'dark:group-hover:bg-orange-600/10'
        'dark:focus:ring-blue-500' = 'dark:focus:ring-orange-600'
    }
    
    # Light Mode: Red → Blue replacements
    $lightModeReplacements = @{
        'light:bg-red-50' = 'light:bg-blue-50'
        'light:bg-red-500' = 'light:bg-blue-500'
        'light:bg-red-600' = 'light:bg-blue-600'
        'light:bg-red-700' = 'light:bg-blue-700'
        'light:bg-red-300' = 'light:bg-blue-300'
        'light:hover:bg-red-600' = 'light:hover:bg-blue-600'
        'light:hover:bg-red-700' = 'light:hover:bg-blue-700'
        'light:text-red-500' = 'light:text-blue-500'
        'light:text-red-600' = 'light:text-blue-600'
        'light:text-red-700' = 'light:text-blue-700'
        'light:border-red-200' = 'light:border-blue-200'
        'light:border-red-600' = 'light:border-blue-600'
        'light:from-red-500' = 'light:from-blue-500'
        'light:to-red-600' = 'light:to-blue-600'
        'light:group-hover:bg-red-50' = 'light:group-hover:bg-blue-50'
        'light:focus:ring-red-600' = 'light:focus:ring-blue-600'
    }
    
    # Apply dark mode replacements
    foreach ($old in $darkModeReplacements.Keys) {
        $new = $darkModeReplacements[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $fileReplacements++
        }
    }
    
    # Apply light mode replacements
    foreach ($old in $lightModeReplacements.Keys) {
        $new = $lightModeReplacements[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $fileReplacements++
        }
    }
    
    # Save file if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name) - $fileReplacements replacements" -ForegroundColor Green
        $filesUpdated++
        $totalReplacements += $fileReplacements
    }
}

Write-Host ""
Write-Host "Theme Update Complete!" -ForegroundColor Green
Write-Host "Files Updated: $filesUpdated" -ForegroundColor Yellow
Write-Host "Total Replacements: $totalReplacements" -ForegroundColor Yellow
Write-Host ""