param(
    [string]$Title = "Claude Code",
    [string]$Message = "Task completed"
)

try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null

    $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent(
        [Windows.UI.Notifications.ToastTemplateType]::ToastText02
    )

    $textNodes = $template.GetElementsByTagName('text')
    $textNodes.Item(0).AppendChild($template.CreateTextNode($Title)) | Out-Null
    $textNodes.Item(1).AppendChild($template.CreateTextNode($Message)) | Out-Null

    $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Claude Code').Show($toast)
} catch {
    $escapedMsg = $Message -replace '"', ''
    $escapedTitle = $Title -replace '"', ''
    $vbs = "CreateObject(""WScript.Shell"").Popup ""$escapedMsg"",5,""$escapedTitle"",64"
    mshta.exe vbscript:"$vbs"
}
