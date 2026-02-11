$ErrorActionPreference = "Continue"

function Fix-Imports {
    param(
        [string]$targetFile
    )
    
    if (!(Test-Path $targetFile)) {
        return
    }
    
    $content = Get-Content $targetFile -Raw
    
    # 1. Clean up imports from "dependency@version" to just "dependency"
    # match "@radix-ui/react-select@2.1.6" -> "@radix-ui/react-select"
    # match "@radix-ui/react-slot@1.1.2" -> "@radix-ui/react-slot"
    # match "class-variance-authority@0.7.1" -> "class-variance-authority"
    # match "lucide-react@0.487.0" -> "lucide-react"
    
    # Simple regex without complex quotes
    $content = $content -replace '@[\d]+\.[\d]+\.[\d]+"', '"'
    $content = $content -replace "@[\d]+\.[\d]+\.[\d]+'", "'"
    
    # 2. Fix the broken cva import in Button.jsx
    if ($content -match "buttonVariants = cva") {
        if ($content -match 'import \{\} from "class-variance-authority"') {
             $content = $content -replace 'import \{\} from "class-variance-authority"', 'import { cva } from "class-variance-authority"'
        }
    }
    
    Set-Content -Path $targetFile -Value $content -NoNewline
    Write-Host "  Fixed imports in $targetFile" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Fixing Imports in UI Components" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$targetDir = "src\components\ui"
$files = Get-ChildItem -Path $targetDir -Filter "*.jsx"

foreach ($file in $files) {
    Fix-Imports -targetFile $file.FullName
}

Write-Host "Import fixes complete." -ForegroundColor Green
