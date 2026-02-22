# 🌐 MLN – Personal YouTube Downloader & Offline Media Server

**My Local Net (MLN)** is a lightweight, self-hosted web application for your local network that allows you to:

- Download YouTube videos manually or automatically 📥
- Subscribe to YouTube channels and get new videos downloaded when internet is available 📡
- Watch downloaded videos offline from any device in your home network 📺
- Simple user authentication 🔑
- Basic admin panel 🔒

Perfect for people with slow/unstable internet, data caps, or who want to build their personal offline video archive.

## ℹ️ Features

- Download any YouTube video by URL
- Subscribe to YouTube channels → automatic background downloads of new videos
- Internet connection check before downloading
- Simple username/password authentication
- Watch videos directly in browser
- Admin panel to manage users, subscriptions and videos
- Runs completely locally – no cloud dependency

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Authentication**: JWT
- **Deployment**: Docker

## 📦 Requirements

- Node.js >= 22
- PNPM >= 10
- Docker

## 🚀 Installation

### 🐳 Docker

```bash
docker pull ghcr.io/Cat333t/my-local-net:latest
```

Visit [http://localhost:1337](http://localhost:1337) to start using My Local Net.

### 📂 Local

1. Clone the repository
```bash
git clone https://github.com/Cat333t/my-local-net.git
cd my-local-net
```

2. Install dependencies
```bash
pnpm install
```

3. Run the application
```bash
pnpm start
```

Visit [http://localhost:1337](http://localhost:1337) to start using My Local Net.
Change files in the `client` and `server` directories to update the application.

## 👥 Authors

- [Cat333t](https://github.com/Cat333t)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.