"""Entry point for the YouTube Downloader application."""

import sys

from PyQt5.QtWidgets import QApplication

from yt_downloader.ui import MainWindow


def main() -> None:
    """Run the application."""
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
