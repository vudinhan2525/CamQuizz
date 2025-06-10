# 🚀 CamQuizz – Backend Setup with Ngrok

## 📦 Requirements

- [.NET SDK 9.0](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
- `ngrok` để public server local (không cần cài toàn cục)

---

## 📁 Folder Structure
```
CamQuizz/
├── ngrok-server/
│ └── ngrok.exe # ⚠️ Bạn phải tự tải và đặt vào đây
├── Server/
│ └── CamQuizzBE/
│ └── appsettings.json
├── CamQuizz/ # frontend
│ └── .env 
├── README.md
```

---

## 🔽 Step 1: Tải ngrok

1. Truy cập: https://ngrok.com/download
2. Tải về `ngrok.exe` (Windows) hoặc `ngrok` (Linux/macOS)
3. Giải nén và copy `ngrok.exe` vào`ngrok-server/`** trong project

---

## 🔧 Step 2: Cấu hình Ngrok URL vào appsettings
```powershell
cd CamQuizz/ngrok-server
ngrok http 5001
```
Copy URL ở Forwarding, ví dụ: https://cb1b-2402-800-fde7.ngrok-free.app

Gán giá trị cho ``NGROK_SERVER`` ở ``appsettings.json`` là URL vừa copy

## 🔽 Step 3: Chạy Backend

```powershell
cd Server/CamQuizzBE
dotnet run
```

## 🔽 Step 4: Chuẩn bị biến môi trường cho Frontend

```powershell
cd CamQuizz/CamQuizz
```
Tạo file ``.env`` và copy URL của ngrok trên vào ``API_URL``, ``CLOUDINARY_CLOUD_NAME`` và ``CLOUDINARY_UPLOAD_PRESET`` có trong file zip source code 
```powershell
API_URL=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_UPLOAD_PRESET=""
```
---
## 🔽 Step 5: Chạy Frontend

```powershell
cd CamQuizz/CamQuizz
npm install --legacy-peer-deps
npx expo start -c
```


```