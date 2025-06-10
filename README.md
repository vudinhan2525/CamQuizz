# Requirements
 - .NET SDK 9.0 (https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
 - ngrok must be installed and available in PATH. (https://ngrok.com/docs/getting-started/)

# 1. Change directory to BE
```
cd Server/CamQuizzBE
```

# 2. Live Server with ngrok

**Linux**
```
nohup ngrok http 5001 > /dev/null &

sleep 5

NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

sed -i "s|\"NGROK_SERVER\": \".*\"|\"NGROK_SERVER\": \"$NGROK_URL\"|g" appsettings.Development.json

echo "NGROK_SERVER updated to $NGROK_URL in appsettings.Development.json"
```

**Window**
```
Start-Process -NoNewWindow -FilePath "ngrok.exe" -ArgumentList "http 5001"

Start-Sleep -Seconds 5

$ngrokUrl = (Invoke-RestMethod http://localhost:4040/api/tunnels).tunnels[0].public_url

(Get-Content "appsettings.Development.json") -replace '"NGROK_SERVER":\s*".*?"', '"NGROK_SERVER": "' + $ngrokUrl + '"' | Set-Content "appsettings.Development.json"

Write-Output "NGROK_SERVER updated to $ngrokUrl in appsettings.Development.json"

```

# 3. Run Backend Server
```
dotnet run
```

# 4. Run Frontend
