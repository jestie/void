"""WSL (WSLg) helpers: the parts of Void that have to be done on the Windows side when he runs inside WSL.

WSLg shows Linux windows through a remote-desktop client and passes sound through one PulseAudio input ("RDPSource")
that is always the Windows *default* microphone. So:
  * mics: Linux can't see the Windows mics one by one. We list them from Windows and, when you pick one, make it the
    Windows default recording device (that's what RDPSource records from).
  * on top: WSLg drops the "keep above" hint. A small PowerShell loop pins his window (msrdc's "Void (<distro>)")
    topmost from the Windows side, and re-pins it if it's re-created.
"""
import base64
import os
import shutil
import subprocess
import threading

PS = shutil.which("powershell.exe") or "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"


def is_wsl():
    try:
        return "microsoft" in os.uname().release.lower() and os.path.exists(PS)
    except (AttributeError, OSError):
        return False


def _cmd(script):
    """powershell.exe argv for a multi-line script (encoded: no quoting trouble across the WSL boundary).
    No -ExecutionPolicy Bypass: the policy only governs script files, and SIEMs flag Bypass as an attacker habit."""
    return [PS, "-NoProfile", "-NonInteractive",
            "-EncodedCommand", base64.b64encode(script.encode("utf-16-le")).decode()]


def _ps(script, timeout=20):
    """Run a PowerShell snippet on the Windows side → (ok, output)."""
    try:
        r = subprocess.run(_cmd(script), capture_output=True, text=True, timeout=timeout)
        return r.returncode == 0, (r.stdout or "").replace("\r", "").strip()
    except (OSError, subprocess.TimeoutExpired) as e:
        return False, str(e)


def _q(s):
    return "'" + str(s).replace("'", "''") + "'"


# ---------------------------------------------------------------- microphones
# active capture endpoints straight from the registry: id = what IPolicyConfig wants, label = "Microphone (Webcam C930e)"
_LIST = r"""
$root = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Capture'
Get-ChildItem $root | ForEach-Object {
  if ((Get-ItemProperty $_.PSPath).DeviceState -ne 1) { return }
  $p = Get-ItemProperty (Join-Path $_.PSPath 'Properties')
  $name = $p.'{a45c254e-df1c-4efd-8020-67d146a850e0},2'; $dev = $p.'{b3f8fa53-0004-438e-9003-51a46e139bfc},6'
  "{0.0.1.00000000}." + $_.PSChildName + "`t" + $name + " (" + $dev + ")"
}
"""

# IPolicyConfig: the (undocumented, long-stable) COM interface Windows' own Sound panel uses to set the default device
_SET = r"""
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
[Guid("f8679f50-850a-41cf-9c72-430f290290c8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IPolicyConfig {
  int a(); int b(); int c(); int d(); int e(); int f(); int g(); int h(); int i(); int j();
  [PreserveSig] int SetDefaultEndpoint([MarshalAs(UnmanagedType.LPWStr)] string id, int role);
}
[ComImport, Guid("870af99c-171d-4f9e-af0d-e63df40c2bc9")] class PolicyConfigClient {}
public static class VoidAudio {
  public static int SetDefault(string id) {
    var pc = (IPolicyConfig)new PolicyConfigClient(); int r = 0;
    for (int role = 0; role < 3; role++) r |= pc.SetDefaultEndpoint(id, role);   // console, multimedia, communications
    return r;
  }
}
'@
[VoidAudio]::SetDefault(%s)
"""


def list_mics():
    ok, out = _ps(_LIST)
    if not ok:
        return []
    mics = []
    for ln in out.splitlines():
        if "\t" in ln:
            i, label = ln.split("\t", 1)
            mics.append({"id": "win:" + i, "label": label})
    return sorted(mics, key=lambda m: m["label"].lower())


def set_mic(dev):
    """dev = "win:<endpoint id>" from list_mics → make it the Windows default input. True if Windows took it."""
    if not str(dev or "").startswith("win:"):
        return False
    ok, out = _ps(_SET % _q(dev[4:]))
    return ok and out.strip() == "0"


# ---------------------------------------------------------------- keep on top
# loops on the Windows side: find his window, make it topmost if it isn't (re-created windows get pinned again)
_PIN = r"""
Add-Type -Name W -Namespace VoidPin -MemberDefinition @'
[DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
[DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr h, int i);
'@
$title = %s
# Void closes our input to stop us (or it simply goes away when he does). The raw stream: Console.In's async reads block
$quit = [Console]::OpenStandardInput().ReadAsync((New-Object byte[] 1), 0, 1)
while (-not $quit.IsCompleted) {
  foreach ($p in Get-Process msrdc -ErrorAction SilentlyContinue) {
    $h = $p.MainWindowHandle
    if ($h -ne 0 -and $p.MainWindowTitle -eq $title -and -not ([VoidPin.W]::GetWindowLong($h, -20) -band 8)) {
      [void][VoidPin.W]::SetWindowPos($h, [IntPtr](-1), 0, 0, 0, 0, 0x13)
    }
  }
  Start-Sleep -Seconds 2
}
foreach ($p in Get-Process msrdc -ErrorAction SilentlyContinue) {
  if ($p.MainWindowTitle -eq $title) { [void][VoidPin.W]::SetWindowPos($p.MainWindowHandle, [IntPtr](-2), 0, 0, 0, 0, 0x13) }
}
"""


class OnTop:
    """set(True) starts the pin loop, set(False) stops it and unpins him."""
    _proc = None
    _lock = threading.Lock()

    @classmethod
    def title(cls):
        return f"Void ({os.environ.get('WSL_DISTRO_NAME') or 'Ubuntu'})"

    @classmethod
    def set(cls, on):
        with cls._lock:
            alive = cls._proc and cls._proc.poll() is None
            if on and not alive:
                script = _PIN % _q(cls.title())
                cls._proc = subprocess.Popen(_cmd(script), stdin=subprocess.PIPE,
                                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            elif not on and alive:
                try:
                    cls._proc.stdin.close()             # end of input ends the loop, which then unpins him
                    cls._proc.wait(timeout=8)
                except (OSError, subprocess.TimeoutExpired):
                    cls._proc.kill()
                cls._proc = None
