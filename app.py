"""
Hugging Face Spaces entry point (Gradio SDK, no Docker).

Spaces imports this module and expects a Gradio `demo` at module level.
Models are downloaded from the Hub on startup via huggingface_hub.
"""

from __future__ import annotations

import os

from gradio_app import build_ui, download_and_load_models

# Load pickles once when the Space / process starts
download_and_load_models()
demo = build_ui()

if __name__ == "__main__":
    # SPACE_ID is set automatically on Hugging Face Spaces
    on_spaces = bool(os.getenv("SPACE_ID"))
    if on_spaces:
        demo.launch()
    else:
        demo.launch(server_name="127.0.0.1", server_port=7860, share=False)
