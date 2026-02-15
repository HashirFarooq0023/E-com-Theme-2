import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


class LLMHandler:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key)
        # Using the smart 70B model
        self.model = "llama-3.3-70b-versatile"

    def generate(self, prompt: str) -> str:
        """Simple completion without external context (used for keyword extraction)."""
        try:
            completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.2,
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"

    def generate_with_context(self, query: str, context: list, system_prompt: str) -> str:
        # 1. Context
        context = context or []
        context_str = "\n".join([item.get("text", "") for item in context])

        # 2. Messages
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": f"CONTEXT (Real Inventory):\n{context_str}"},
            {"role": "user", "content": query},
        ]

        try:
            completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.1,  # Strict for accurate sales
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"