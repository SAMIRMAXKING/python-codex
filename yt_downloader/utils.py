"""Utility functions for the YouTube downloader application."""

import json
import os
import threading
import requests
from typing import Dict

HISTORY_FILE = os.path.join(os.path.expanduser("~"), ".yt_downloader_history.json")


def load_history() -> Dict:
    """Load download history from file."""
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {}


def save_history(history: Dict) -> None:
    """Save download history to disk."""
    with open(HISTORY_FILE, "w", encoding="utf-8") as fh:
        json.dump(history, fh, indent=2)


def check_for_updates(current_version: str) -> str:
    """Check remote GitHub for a newer version.

    Returns the latest version string if available, otherwise returns the
    current_version.
    """
    try:
        resp = requests.get(
            "https://raw.githubusercontent.com/example/repo/main/version.txt",
            timeout=5,
        )
        if resp.status_code == 200:
            latest = resp.text.strip()
            if latest != current_version:
                return latest
    except requests.RequestException:
        pass
    return current_version


def threaded(fn):
    """Decorator to run a function in a separate thread."""

    def wrapper(*args, **kwargs):
        thread = threading.Thread(target=fn, args=args, kwargs=kwargs, daemon=True)
        thread.start()
        return thread

    return wrapper
