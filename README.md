# YouTube Downloader

This application allows you to download videos, playlists, or channels from YouTube using a convenient GUI built with **PyQt5**.

## Features
- Download single videos, entire playlists, or channels.
- Select desired quality: 1080p, 720p, 480p, etc.
- Convert downloads to MP3 using ffmpeg.
- Clipboard monitoring for automatic link pasting.
- Pause and resume downloads.
- Download multiple links simultaneously.
- Dark mode support.
- Basic multilingual interface (English and Spanish).
- Automatic update check on startup.
- Download history management.

The code is structured in modules inside the `yt_downloader` package for future extensibility.

## Installation
1. Install Python 3.8 or newer.
2. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure `ffmpeg` is installed and accessible in your system path.

## Usage
Run the application with:
```bash
python main.py
```

## Requirements
See `requirements.txt` for the list of Python packages used.

## Extending
The code is written to allow additional platforms (e.g., Vimeo, Facebook) by adding new classes in `downloader.py`.

## Image Generator Web App

This repository also includes a small FastAPI application for generating images with OpenAI's `gpt-image-1` model. The app exposes a minimal web interface in Arabic that streams the image URL as it becomes available.

### Running the server

1. Create a `.env` file in the project root with your `OPENAI_API_KEY`.
2. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
4. Open `http://localhost:8000` in your browser and enter a prompt in Arabic or English.
