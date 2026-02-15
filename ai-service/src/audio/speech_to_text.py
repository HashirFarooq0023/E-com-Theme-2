"""
Speech-to-Text module using Groq Whisper API.
"""

import os
from groq import Groq


class SpeechToText:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def transcribe(self, file_path: str) -> str:
        """Sends audio file to Groq Whisper API."""
        try:
            with open(file_path, "rb") as file:
                transcription = self.client.audio.transcriptions.create(
                    file=(file_path, file.read()),
                    model="whisper-large-v3",
                    response_format="json",
                )
            # The Groq Python client returns an object with a `.text` property
            return getattr(transcription, "text", "") or ""
        except Exception as e:
            print(f"Transcription Error: {e}")
            return ""

