"""Core download logic for YouTube videos using yt-dlp."""

import os
import subprocess
from typing import Optional

from yt_dlp import YoutubeDL


class YTDLDownloader:
    """Downloader using yt-dlp."""

    def __init__(self, output_dir: str = "downloads"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def _ydl_opts(self, quality: str, audio_only: bool) -> dict:
        opts = {
            "outtmpl": os.path.join(self.output_dir, "%(title)s.%(ext)s"),
            "format": quality,
            "noplaylist": False,
            "quiet": True,
            "progress_hooks": [],
            "continuedl": True,
        }
        if audio_only:
            opts["format"] = "bestaudio/best"
            opts["postprocessors"] = [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ]
        return opts

    def download(self, url: str, quality: str = "best", audio_only: bool = False,
                 progress_hook: Optional[callable] = None) -> None:
        """Download a video or playlist."""
        opts = self._ydl_opts(quality, audio_only)
        if progress_hook:
            opts["progress_hooks"].append(progress_hook)
        with YoutubeDL(opts) as ydl:
            ydl.download([url])

    def download_batch(self, urls, quality: str = "best", audio_only: bool = False,
                       progress_hook: Optional[callable] = None) -> None:
        """Download multiple links sequentially."""
        for url in urls:
            self.download(url, quality, audio_only, progress_hook)

    def threaded_download(self, url: str, quality: str = "best", audio_only: bool = False,
                          progress_hook: Optional[callable] = None):
        """Run download in a background thread."""
        from .utils import threaded

        @threaded
        def _run():
            self.download(url, quality, audio_only, progress_hook)

        return _run()
