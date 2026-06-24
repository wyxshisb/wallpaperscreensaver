; Custom NSIS hooks for Wallpaper Screensaver

; Remove the default uninstall welcome page
!define removeDefaultUninstallWelcomePage

; ---------- Install: close running app before installing ----------
!macro customInstall
  ; Try to close the running application gracefully
  nsExec::ExecToStack 'taskkill /IM "WallpaperScreensaver.exe" /F'
  Pop $0
  Pop $1
  Sleep 1500
!macroend

; ---------- Uninstall: confirm and close app ----------
!macro customUnInit
  MessageBox MB_OKCANCEL "Are you sure you want to uninstall Wallpaper Screensaver?" IDOK +2
  Quit
  ; Close running app before uninstalling
  nsExec::ExecToStack 'taskkill /IM "WallpaperScreensaver.exe" /F'
  Pop $0
  Pop $1
  Sleep 1500
!macroend
