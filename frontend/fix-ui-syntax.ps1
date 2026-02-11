$ErrorActionPreference = "Continue"

function Fix-Syntax-Errors {
    param(
        [string]$targetFile
    )
    
    if (!(Test-Path $targetFile)) {
        return
    }
    
    $content = Get-Content $targetFile -Raw
    
    # Common pattern in Button:
    # }: React.ComponentProps &
    #   VariantProps & {
    #     asChild?: boolean;
    #   }) {
    # This became:
    # } &
    #   VariantProps<typeof buttonVariants> ) {
    
    # We want to replace `} & ... ) {` with `}) {` safely
    
    # Fix Button.jsx and others with similar pattern
    $content = $content -replace "}\s*&\s*VariantProps<[^>]+>\s*\)\s*\{", "}) {"
    
    # Fix BreadcrumbLink and others
    # } ) { -> }) { (cosmetic, but maybe there is a & or | left over)
    $content = $content -replace "\}\s*&\s*\{[^}]+\}\s*\)\s*\{", "}) {"
    
    # Remove any lingering "VariantProps<...>" usage in imports or code
    $content = $content -replace "import \{([^}]+),\s*VariantProps\s*\}", "import {$1}"
    $content = $content -replace ",\s*VariantProps", ""
    
    # Remove any leftover "React.ComponentProps..." in function args if my previous script missed them
    # Because previous script used regex like `:\s*React\.ComponentProps<[^>]+>`, it might fail if it spans lines
    
    # Fix SelectTrigger in Select.jsx
    # ...props
    # } & {
    #   size?: "sm" | "default";
    # }) {
    # Becomes:
    # ...props
    # }) {
    
    $content = $content -replace "\}\s*&\s*\{[^}]+\}\s*\)\s*\{", "}) {"
    
    # General cleanup for leftover typescriptisms at end of props destructuring
    $content = $content -replace "\}\s*&\s*[^)]+\)\s*\{", "}) {"
    
    Set-Content -Path $targetFile -Value $content -NoNewline
    Write-Host "  Fixed syntax in $targetFile" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Fixing Syntax Errors in UI Components" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$targetDir = "src\components\ui"
$files = Get-ChildItem -Path $targetDir -Filter "*.jsx"

foreach ($file in $files) {
    Fix-Syntax-Errors -targetFile $file.FullName
}

Write-Host "Syntax fixes complete." -ForegroundColor Green
