const { execSync } = require('child_process');

// Check if any non-screensaver window is fullscreen on Windows
function isOtherAppFullscreen() {
  try {
    // Use PowerShell to check if the foreground window is fullscreen
    const script = `
      Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      public class WinCheck {
        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
        [DllImport("user32.dll")]
        public static extern int GetSystemMetrics(int nIndex);
        [StructLayout(LayoutKind.Sequential)]
        public struct RECT { public int Left, Top, Right, Bottom; }
      }
"@
      $hwnd = [WinCheck]::GetForegroundWindow()
      $rect = New-Object WinCheck+RECT
      [void][WinCheck]::GetWindowRect($hwnd, [ref]$rect)
      $screenW = [WinCheck]::GetSystemMetrics(0)
      $screenH = [WinCheck]::GetSystemMetrics(1)
      $winW = $rect.Right - $rect.Left
      $winH = $rect.Bottom - $rect.Top
      $isFS = ($rect.Left -eq 0 -and $rect.Top -eq 0 -and $winW -eq $screenW -and $winH -eq $screenH)
      Write-Output $isFS
    `;
    const result = execSync(`powershell -NoProfile -Command "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
      timeout: 3000,
      windowsHide: true,
    }).toString().trim();
    return result === 'True';
  } catch {
    return false;
  }
}

module.exports = { isOtherAppFullscreen };
