# Improved Kiosk Migration Script
# Properly converts TypeScript to JavaScript with all necessary fixes

$ErrorActionPreference = "Continue"

# Function to properly convert TypeScript to JavaScript
function Convert-TStoJS-Proper {
    param(
        [string]$sourceFile,
        [string]$targetFile
    )
    
    Write-Host "Converting: $sourceFile" -ForegroundColor Cyan
    
    if (!(Test-Path $sourceFile)) {
        Write-Host "  Source file not found, skipping..." -ForegroundColor Yellow
        return
    }
    
    # Read the file
    $content = Get-Content $sourceFile -Raw
    
    # 1. Fix imports - change from '../' to '../../' for components and store
    $content = $content -replace "from '\.\./components/", "from '../../components/kiosk/"
    $content = $content -replace "from '\.\./store/useStore'", "from '../../store/useKioskStore'"
    
    # 2. Change useStore to useKioskStore
    $content = $content -replace "useStore", "useKioskStore"
    
    # 3. Fix react-router import
    $content = $content -replace "from 'react-router'", "from 'react-router-dom'"
    
    # 4. Remove type imports
    $content = $content -replace "import type \{[^\}]+\} from [^;]+;", ""
    $content = $content -replace ", type \w+", ""
    $content = $content -replace "import \{ type [^\}]+\}", ""
    
    # 5. Remove interface and type declarations (multiline)
    $content = $content -replace "(?s)export interface \w+\s*\{[^\}]*\}\s*", ""
    $content = $content -replace "(?s)interface \w+\s*\{[^\}]*\}\s*", ""
    $content = $content -replace "(?s)export type \w+\s*=[^;]+;\s*", ""
    $content = $content -replace "(?s)type \w+\s*=[^;]+;\s*", ""
    
    # 6. Remove type annotations from function parameters
    $content = $content -replace "(\w+):\s*React\.\w+<[^>]+>", '$1'
    $content = $content -replace "(\w+):\s*\w+\[\]", '$1'
    $content = $content -replace "(\w+):\s*\w+", '$1'
    
    # 7. Remove return type annotations
    $content = $content -replace "(\))\s*:\s*[^{=]+(\{)", '$1 $2'
    $content = $content -replace "(\))\s*:\s*[^{=]+(\s*=>)", '$1$2'
    
    # 8. Remove generic type parameters
    $content = $content -replace "<\w+(\[\])?(\s*\|\s*\w+)*>", ""
    
    # 9. Remove 'as ServiceType' and similar type assertions
    $content = $content -replace "\s+as\s+\w+", ""
    
    # 10. Update navigation paths to include /kiosk prefix
    $content = $content -replace "navigate\('\/(?!kiosk)", "navigate('/kiosk/"
    
    # 11. Clean up multiple empty lines
    $content = $content -replace "(\r?\n){3,}", "`r`n`r`n"
    
    # Create target directory if it doesn't exist
    $targetDir = Split-Path $targetFile -Parent
    if (!(Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    # Write to target
    $content | Set-Content $targetFile -NoNewline
    Write-Host "  ✓ Converted successfully" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Kiosk TypeScript to JavaScript Migration" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Convert all screens
Write-Host "`n[1/3] Converting Screens..." -ForegroundColor Yellow
$screens = @(
    "LoginRegister.tsx",
    "DepartmentVerification.tsx",
    "OTPVerification.tsx",
    "Dashboard.tsx",
    "ViewBills.tsx",
    "PayBill.tsx",
    "Receipt.tsx",
    "RegisterComplaint.tsx",
    "TrackComplaint.tsx",
    "NewConnection.tsx",
    "TrackNewConnection.tsx",
    "WaterTankerBooking.tsx",
    "AdminDashboard.tsx"
)

foreach ($screen in $screens) {
    $source = "kiosk\src\screens\$screen"
    $target = "src\pages\kiosk\$($screen -replace '\.tsx$', '.jsx')"
    Convert-TStoJS-Proper -sourceFile $source -targetFile $target
}

# Convert remaining components
Write-Host "`n[2/3] Converting Components..." -ForegroundColor Yellow
$components = @(
    "ElectricityDashboard.tsx",
    "GasDashboard.tsx",
    "WaterDashboard.tsx",
    "MunicipalDashboard.tsx"
)

foreach ($component in $components) {
    $source = "kiosk\src\components\$component"
    $target = "src\components\kiosk\$($component -replace '\.tsx$', '.jsx')"
    Convert-TStoJS-Proper -sourceFile $source -targetFile $target
}

# Convert remaining services
Write-Host "`n[3/3] Converting Services..." -ForegroundColor Yellow
$services = @(
    "complaints.service.ts",
    "connections.service.ts"
)

foreach ($service in $services) {
    $source = "kiosk\src\services\api\$service"
    $target = "src\services\api\$($service -replace '\.ts$', '.js')"
    Convert-TStoJS-Proper -sourceFile $source -targetFile $target
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✓ Migration Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review converted files for any remaining TypeScript syntax"
Write-Host "2. Add routes to App.jsx for all pages"
Write-Host "3. Test the application"
Write-Host "`nNote: Some complex TypeScript patterns may need manual review.`n"
