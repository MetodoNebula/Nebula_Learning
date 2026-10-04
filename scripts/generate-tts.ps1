param(
  [string]$Text = 'The cat is under the table.',
  [string]$Output = 'public/assets/listening.wav',
  [string]$VoiceName = 'Microsoft Zira Desktop',
  [int]$Rate = -1
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$directory = Split-Path -Parent $Output
if ($directory) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }

$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $voice = $synthesizer.GetInstalledVoices() |
    Where-Object { $_.VoiceInfo.Name -eq $VoiceName } |
    Select-Object -First 1
  if (-not $voice) {
    $voice = $synthesizer.GetInstalledVoices() |
      Where-Object { $_.VoiceInfo.Culture.Name -eq 'en-US' } |
      Select-Object -First 1
  }
  if (-not $voice) { throw 'No English Windows voice is installed.' }
  $synthesizer.SelectVoice($voice.VoiceInfo.Name)
  $synthesizer.Rate = [Math]::Max(-10, [Math]::Min(10, $Rate))
  $synthesizer.Volume = 100
  $absoluteOutput = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Output))
  $synthesizer.SetOutputToWaveFile($absoluteOutput)
  $synthesizer.Speak($Text)
  Write-Output ("Generated {0} with {1}" -f $Output, $voice.VoiceInfo.Name)
} finally {
  $synthesizer.Dispose()
}
