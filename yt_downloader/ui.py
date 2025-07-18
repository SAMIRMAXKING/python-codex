"""PyQt5 graphical user interface for the downloader."""

import os
from typing import List

from PyQt5.QtCore import QTimer, Qt
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import (
    QApplication,
    QComboBox,
    QCheckBox,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListWidget,
    QMessageBox,
    QPushButton,
    QProgressBar,
    QTextEdit,
    QWidget,
    QFileDialog,
)

from .downloader import YTDLDownloader
from .utils import load_history, save_history, check_for_updates

TRANSLATIONS = {
    "en": {
        "url_label": "Video URL(s)",
        "download": "Download",
        "quality": "Quality",
        "audio_only": "Audio Only",
        "history": "History",
        "output": "Output Directory",
        "update": "Update available: {ver}",
    },
    "es": {
        "url_label": "Enlace(s) del video",
        "download": "Descargar",
        "quality": "Calidad",
        "audio_only": "Solo audio",
        "history": "Historial",
        "output": "Carpeta de destino",
        "update": "Actualizaci\u00f3n disponible: {ver}",
    },
}


class MainWindow(QWidget):
    """Main application window."""

    VERSION = "1.0"

    def __init__(self, language: str = "en") -> None:
        super().__init__()
        self.lang = language
        self.downloader = YTDLDownloader()
        self.history = load_history()
        self._setup_ui()
        self._check_update()
        self._setup_clipboard_monitor()

    # --- Internal helpers -------------------------------------------------
    def _tr(self, key: str) -> str:
        return TRANSLATIONS.get(self.lang, TRANSLATIONS["en"]).get(key, key)

    def _setup_ui(self) -> None:
        self.setWindowTitle("YouTube Downloader")
        self.resize(600, 400)
        layout = QGridLayout(self)

        self.url_edit = QTextEdit()
        layout.addWidget(QLabel(self._tr("url_label")), 0, 0)
        layout.addWidget(self.url_edit, 0, 1, 1, 2)

        self.quality_combo = QComboBox()
        self.quality_combo.addItems(["best", "1080p", "720p", "480p"])
        layout.addWidget(QLabel(self._tr("quality")), 1, 0)
        layout.addWidget(self.quality_combo, 1, 1)

        self.audio_chk = QCheckBox(self._tr("audio_only"))
        layout.addWidget(self.audio_chk, 1, 2)

        self.progress = QProgressBar()
        layout.addWidget(self.progress, 2, 0, 1, 3)

        btn_layout = QHBoxLayout()
        self.download_btn = QPushButton(self._tr("download"))
        self.download_btn.clicked.connect(self.start_download)
        btn_layout.addWidget(self.download_btn)

        self.dir_btn = QPushButton("...")
        self.dir_btn.clicked.connect(self.choose_dir)
        btn_layout.addWidget(self.dir_btn)
        layout.addLayout(btn_layout, 3, 0, 1, 3)

        layout.addWidget(QLabel(self._tr("history")), 4, 0)
        self.history_list = QListWidget()
        self.history_list.addItems(self.history.keys())
        layout.addWidget(self.history_list, 5, 0, 1, 3)

    def _update_progress(self, d):
        if d.get("status") == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate")
            if total:
                progress = d.get("downloaded_bytes", 0) / total * 100
                self.progress.setValue(int(progress))
        elif d.get("status") == "finished":
            self.progress.setValue(100)
            QMessageBox.information(self, "Done", "Download finished")

    def _check_update(self):
        latest = check_for_updates(self.VERSION)
        if latest != self.VERSION:
            QMessageBox.information(
                self,
                "Update",
                self._tr("update").format(ver=latest),
            )

    def _setup_clipboard_monitor(self):
        self.clipboard = QApplication.clipboard()
        self.last_clip = ""
        timer = QTimer(self)
        timer.timeout.connect(self._check_clipboard)
        timer.start(1000)
        self._clip_timer = timer

    def _check_clipboard(self):
        text = self.clipboard.text()
        if text.startswith("http") and text != self.last_clip:
            self.url_edit.setPlainText(text)
            self.last_clip = text

    def choose_dir(self):
        path = QFileDialog.getExistingDirectory(self, self._tr("output"))
        if path:
            self.downloader.output_dir = path

    # --- Actions ----------------------------------------------------------
    def start_download(self):
        urls = [u.strip() for u in self.url_edit.toPlainText().splitlines() if u.strip()]
        quality = self.quality_combo.currentText()
        audio = self.audio_chk.isChecked()
        for url in urls:
            self.downloader.threaded_download(url, quality=quality, audio_only=audio,
                                              progress_hook=self._update_progress)
            self.history[url] = {"quality": quality, "audio": audio}
            self.history_list.addItem(url)
        save_history(self.history)

