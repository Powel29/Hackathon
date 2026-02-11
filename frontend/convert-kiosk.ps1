# Kiosk Migration - Batch Conversion Script
# This script helps convert remaining TypeScript files to JavaScript

# Instructions:
# 1. This is a PowerShell script to help automate the remaining conversions
# 2. Run this from the frontend directory
# 3. Manual review is still needed for complex files

$sourceDir = "kiosk\src"
$targetDir = "src"

# Function to convert TypeScript to JavaScript (basic conversion)
function Convert-TStoJS {
    param(
        [string]$sourceFile,
        [string]$targetFile
    )
    
    Write-Host "Converting: $sourceFile -> $targetFile"
    
    # Read the file
    $content = Get-Content $sourceFile -Raw
    
    # Basic conversions:
    # 1. Remove type imports
    $content = $content -replace "import type \{[^}]+\} from [^;]+;", ""
    
    # 2. Remove interface declarations
    $content = $content -replace "(?s)interface \w+\s*\{[^}]+\}", ""
    $content = $content -replace "(?s)export interface \w+\s*\{[^}]+\}", ""
    
    # 3. Remove type annotations from function parameters
    $content = $content -replace "(\w+):\s*\w+(\s*[,\)])", '$1$2'
    
    # 4. Remove return type annotations
    $content = $content -replace "(\))\s*:\s*[^{]+(\{)", '$1 $2'
    
    # 5. Remove generic type parameters
    $content = $content -replace "<\w+>", ""
    
    # 6. Update imports from '../store/useStore' to '../../store/useKioskStore'
    $content = $content -replace "from '\.\./store/useStore'", "from '../../store/useKioskStore'"
    $content = $content -replace "useStore", "useKioskStore"
    
    # 7. Update component imports to use kiosk folder
    $content = $content -replace "from '\.\./components/(\w+)'", "from '../../components/kiosk/`$1'"
    
    # 8. Update route paths to include /kiosk prefix
    $content = $content -replace "navigate\('\/", "navigate('/kiosk/"
    
    # 9. Change .tsx/.ts extensions in imports to .jsx/.js
    $content = $content -replace "\.tsx'", ".jsx'"
    $content = $content -replace "\.ts'", ".js'"
    
    # Write to target
    $targetDir = Split-Path $targetFile -Parent
    if (!(Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    $content | Set-Content $targetFile -NoNewline
}

# Convert remaining screens
$screens = @(
    "LoginRegister.tsx",
    "DepartmentVerification.tsx",
    "AadhaarLogin.tsx",
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
    $source = Join-Path $sourceDir "screens\$screen"
    $target = Join-Path $targetDir "pages\kiosk\$($screen -replace '\.tsx$', '.jsx')"
    
    if (Test-Path $source) {
        Convert-TStoJS -sourceFile $source -targetFile $target
    }
}

# Convert remaining components
$components = @(
    "ElectricityDashboard.tsx",
    "GasDashboard.tsx",
    "WaterDashboard.tsx",
    "MunicipalDashboard.tsx"
)

foreach ($component in $components) {
    $source = Join-Path $sourceDir "components\$component"
    $target = Join-Path $targetDir "components\kiosk\$($component -replace '\.tsx$', '.jsx')"
    
    if (Test-Path $source) {
        Convert-TStoJS -sourceFile $source -targetFile $target
    }
}

# Convert remaining services
$services = @(
    "complaints.service.ts",
    "connections.service.ts"
)

foreach ($service in $services) {
    $source = Join-Path $sourceDir "services\api\$service"
    $target = Join-Path $targetDir "services\api\$($service -replace '\.ts$', '.js')"
    
    if (Test-Path $source) {
        Convert-TStoJS -sourceFile $source -targetFile $target
    }
}

Write-Host "`nConversion complete! Please review the files manually for:"
Write-Host "1. Complex type annotations that weren't removed"
Write-Host "2. Import paths that need adjustment"
Write-Host "3. Any TypeScript-specific syntax"
Write-Host "`nDon't forget to add routes to App.jsx for the new pages!"
