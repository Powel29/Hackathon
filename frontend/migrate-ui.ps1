$ErrorActionPreference = "Continue"

function Convert-TStoJS-UI {
    param(
        [string]$sourceFile,
        [string]$targetFile
    )
    
    Write-Host "Converting: $sourceFile" -ForegroundColor Cyan
    
    if (!(Test-Path $sourceFile)) {
        Write-Host "  Source file not found, skipping..." -ForegroundColor Yellow
        return
    }
    
    $content = Get-Content $sourceFile -Raw
    
    # Remove "use client" if present (optional, usually good to keep for Next.js but maybe not Vite)
    # Keeping it as it doesn't hurt.

    # 1. Remove type imports
    $content = $content -replace "import type \{[^\}]+\} from [^;]+;", ""
    $content = $content -replace "import \{[^}]+type [^}]+\} from [^;]+;", ""
    
    # 2. Remove interface and type declarations
    # The regex (?s) enables dot-matches-newline mode for multiline removal
    $content = $content -replace "(?s)export interface \w+\s*\{[^\}]*\}\s*", ""
    $content = $content -replace "(?s)interface \w+\s*\{[^\}]*\}\s*", ""
    $content = $content -replace "(?s)export type \w+\s*=[^;]+;\s*", ""
    $content = $content -replace "(?s)type \w+\s*=[^;]+;\s*", ""

    # 3. Remove type annotations from function parameters
    # This is tricky with complex types, doing best effort
    $content = $content -replace ":\s*React\.ReactNode", ""
    $content = $content -replace ":\s*React\.HTMLAttributes<[^>]+>", ""
    $content = $content -replace ":\s*React\.ComponentPropsWithoutRef<[^>]+>", ""
    $content = $content -replace ":\s*React\.ElementRef<[^>]+>", ""
    $content = $content -replace "extends React\.ComponentPropsWithoutRef<[^>]+>", ""
    # Remove generics like <HTMLDivElement>
    $content = $content -replace "<[^>]+>", "" 
    
    # 4. Remove 'as' assertions
    $content = $content -replace " as \w+", ""

    # 5. Fix imports
    # shadcn/ui utils usually import from "@/lib/utils"
    # We need to ensure that path exists or point to relative path
    # Check if we are in components/ui, then relative path to lib is ../../lib/utils
    $content = $content -replace "@/lib/utils", "../../lib/utils"
    
    $targetDir = Split-Path $targetFile -Parent
    if (!(Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    $content | Set-Content $targetFile -NoNewline
    Write-Host "  Converted successfully" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  UI Components Migration" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$currentLocation = Get-Location
$sourceDir = Join-Path $currentLocation "kiosk\src\components\ui"
$targetDir = Join-Path $currentLocation "src\components\ui"
$figmaSource = Join-Path $currentLocation "kiosk\src\components\figma"
$figmaTarget = Join-Path $currentLocation "src\components\figma"

# Ensure directories exist
if (!(Test-Path $sourceDir)) {
    Write-Host "Source directory not found: $sourceDir" -ForegroundColor Red
    exit
}

# 1. Convert UI Components (.tsx -> .jsx)
$tsxFiles = Get-ChildItem -Path $sourceDir -Filter "*.tsx"
foreach ($file in $tsxFiles) {
    if ($file.Name -eq "utils.ts") { continue } # Handle separately
    
    $targetName = $file.Name -replace '\.tsx$', '.jsx'
    $targetPath = Join-Path $targetDir $targetName
    Convert-TStoJS-UI -sourceFile $file.FullName -targetFile $targetPath
}

# 2. Convert UI Utility (.ts -> .js)
$tsFiles = Get-ChildItem -Path $sourceDir -Filter "*.ts"
foreach ($file in $tsFiles) {
    if ($file.Name -eq "utils.ts") { continue } # Skip utils.ts as we have utils.js already
    
    $targetName = $file.Name -replace '\.ts$', '.js'
    $targetPath = Join-Path $targetDir $targetName
    Convert-TStoJS-UI -sourceFile $file.FullName -targetFile $targetPath
}

# 3. Convert Figma Components (.tsx -> .jsx)
if (Test-Path $figmaSource) {
    $figmaFiles = Get-ChildItem -Path $figmaSource -Filter "*.tsx"
    foreach ($file in $figmaFiles) {
        $targetName = $file.Name -replace '\.tsx$', '.jsx'
        $targetPath = Join-Path $figmaTarget $targetName
        Convert-TStoJS-UI -sourceFile $file.FullName -targetFile $targetPath
    }
}

Write-Host "Migration of UI components complete." -ForegroundColor Green
