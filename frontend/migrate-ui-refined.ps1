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

    # 1. Simplify imports first
    # Replace "import * as React" with "import React" (though * as React works too, usually)
    # The previous regex deleted "as React", leaving "import * from 'react'" which is invalid
    $content = $content -replace "import \* as React", "import React"
    
    # 2. Fix imports that might have been broken by aggressive regex
    # The regex `import \{[^}]+type [^}]+\} from [^;]+;` is too aggressive if it matches the whole line
    # Instead, let's just remove "type " inside imports
    $content = $content -replace "import \{([^}]+)type\s+([^}]+)\}", 'import {$1$2}'
    $content = $content -replace ", type ", ", "
    $content = $content -replace "type [^,]+,", "" 
    
    # Cleaning up double commas or leading/trailing commas in imports is hard with regex alone, 
    # but let's try to target specific patterns like "import { type X }" -> "import { }" (empty)
    # or "import { A, type B }" -> "import { A, B }"
    
    # 3. Remove interface and type declarations
    # Use single quotes for regex string to avoid variable expansion issues in PowerShell
    $content = $content -replace '(?s)export interface \w+\s*\{[^\}]*\}\s*', ''
    $content = $content -replace '(?s)interface \w+\s*\{[^\}]*\}\s*', ''
    $content = $content -replace '(?s)export type \w+\s*=[^;]+;\s*', ''
    $content = $content -replace '(?s)type \w+\s*=[^;]+;\s*', ''

    # 4. Cleanup function signatures and props
    # Remove TS generics and type assertions
    $content = $content -replace ':\s*React\.ComponentProps<[^>]+>', ''
    $content = $content -replace ':\s*React\.ComponentPropsWithoutRef<[^>]+>', ''
    $content = $content -replace ':\s*React\.HTMLAttributes<[^>]+>', ''
    $content = $content -replace '& \w+Props', ''
    $content = $content -replace '&\s*\{\s*asChild\?:\s*boolean\s*;?\s*\}', ''
    $content = $content -replace 'asChild\?:\s*boolean', ''
    
    # Remove all type annotations start with :
    # Be careful not to remove object keys in objects, so we target lines that look like props
    # Or just remove anything looking like ": Type" inside function parens?
    # A safer approach for these files is to remove specific known patterns from shadcn
    
    $content = $content -replace ':\s*class-variance-authority@0\.7\.1', '' # Fix specific import issue if any
    
    # Remove the Props definition in function arguments
    # e.g. }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { ... }
    # converting to just }
    
    # Regex to match the complex props type at the end of function args
    $content = $content -replace '\}\s*:\s*[^)]+\)\s*\{', '} ) {'
    
    # 5. Fix specific library imports that are sometimes messed up by copy-paste or specialized naming
    # cva import: "import { cva, type VariantProps } from ..." -> "import { cva } from ..."
    $content = $content -replace 'import \{ cva, type VariantProps \} from "class-variance-authority[^"]+"', 'import { cva } from "class-variance-authority"'
    $content = $content -replace '@radix-ui/react-slot@[\d\.]+', '@radix-ui/react-slot'
    
    # 6. Restore the "return" statement if it was accidentally nuked or malformed
    # The previous output showed empty return () because of aggressive matching probably.
    
    # 7. Utils import fix
    $content = $content -replace "@/lib/utils", "../../lib/utils"
    
    $targetDir = Split-Path $targetFile -Parent
    if (!(Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    $content | Set-Content $targetFile -NoNewline
    Write-Host "  Converted successfully" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  UI Components Migration (Refined)" -ForegroundColor Magenta
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
    if ($file.Name -eq "utils.ts") { continue }
    
    $targetName = $file.Name -replace '\.tsx$', '.jsx'
    $targetPath = Join-Path $targetDir $targetName
    Convert-TStoJS-UI -sourceFile $file.FullName -targetFile $targetPath
}

# 2. Convert UI Utility (.ts -> .js)
$tsFiles = Get-ChildItem -Path $sourceDir -Filter "*.ts"
foreach ($file in $tsFiles) {
    if ($file.Name -eq "utils.ts") { continue }
    
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

Write-Host "Refined migration of UI components complete." -ForegroundColor Green
