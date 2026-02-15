"""
Store Assistant: Smart keyword extraction -> RAG search -> return product IDs (and metadata).
"""

from typing import Dict, List, Optional
from ..rag.retrieval import RetrievalSystem
from ..models.llm_handler import LLMHandler

class StoreAssistant:
    def __init__(self, store_name: str = "TrendsStore"):
        self.store_name = store_name
        self.llm = LLMHandler()
        self.retriever = RetrievalSystem()

    def process_message(self, query: str, use_audio: bool = False) -> str:
        """
        Backwards-compatible wrapper returning just the text response.
        """
        result = self.process_user_message(query, session_id="default_user")
        return result.get("response", "I'm sorry, our team will contact you soon.")

    def process_user_message(self, user_message: str, session_id: str = "guest") -> Dict:
        """
        1. Extract Search Term (using AI).
        2. Find Product IDs (using RAG).
        3. Generate Response (using AI with Persona).
        4. Return IDs  to Frontend.
        """

        # --- STEP 1: SMART EXTRACTION ---
        # Normalize "Jhumka" -> "Earrings"
        search_term = self._extract_search_term(user_message)
        print(f"🕵️ User said: '{user_message}' -> Searching for: '{search_term}'")

        # --- STEP 2: RAG SEARCH ---
        retrieved_docs: List[Dict] = []
        product_ids: List[str] = []
        formatted_products: List[Dict] = []

        # Only search if a valid product keyword was found
        if search_term:
            retrieved_docs = self.retriever.retrieve(search_term, top_k=4)

            for doc in retrieved_docs:
                pid = doc.get("id") or doc.get("product_id")
                if pid:
                    product_ids.append(str(pid))

                if doc.get("type") == "product":
                    formatted_products.append({
                        "id": pid,
                        "name": doc.get("name"),
                        "price": doc.get("price"),
                        "image": doc.get("image"),
                        "category": doc.get("category"),
                        "stock": doc.get("stock"),
                        "rating": doc.get("rating"),
                    })

        # --- STEP 3: GENERATE AI ANSWER ---
        system_prompt = self._get_system_prompt()
        
        # We pass the context to the LLM so it knows what products were found
        ai_response = self.llm.generate_with_context(
            query=user_message,
            context=retrieved_docs,
            system_prompt=system_prompt,
        )

        # --- STEP 4: RETURN TO FRONTEND ---
        return {
            "response": ai_response,
            "product_ids": product_ids,  # Array of IDs for SQL / frontend
            "products": formatted_products,  # Still provide metadata for tiles
            "search_term": search_term,
        }

    def _extract_search_term(self, user_message: str) -> Optional[str]:
        """
        Uses Groq (Llama 3) to normalize queries into standard English product tags.
        Handles Typos, Roman Urdu, and Synonyms.
        """
        prompt = f"""
        TASK: Analyze the user's query and output a single Standard English Product Category.
        
        RULES:
        1. **Translate Roman Urdu/Hindi:** Map local terms to English (e.g., "Kantaa", "Jhumka", "Baliyan" -> "Earrings", "Kapray" -> "Clothes").
        2. **Fix Typos:** (e.g., "earrngs" -> "Earrings", "labtop" -> "Laptop").
        3. **Map Synonyms:** (e.g., "Joggers","sneakers", "Kicks" -> "Shoes").
        4. **Ignore Context:** Ignore "dikhao", "price", "chahiye", "hello", "salam".
        5. **Output:** Return ONLY the English keyword. No sentences.
        
        EXAMPLES:
        - Input: "Bhai koi achi si watch dikhao" -> Output: "Watch"
        - Input: "jhumkay hain apke pas?" -> Output: "Earrings"
        - Input: "kantaa price?" -> Output: "Earrings"
        - Input: "earrngs showing" -> Output: "Earrings"
        - Input: "paon main pehnne wala" -> Output: "Shoes"
        - Input: "Hi how are you" -> Output: "NONE"
        - Input: "Delivery charges kitne hain?" -> Output: "NONE"
        
        INPUT QUERY: "{user_message}"
        OUTPUT:
        """
        try:
            response = self.llm.generate(prompt).strip()
            response = response.replace('"', '').replace("'", "").replace(".", "")
            
            if "NONE" in response.upper() or len(response) > 20:
                return None
                
            return response
        except Exception as e:
            print(f"Extraction Error: {e}")
            return None

    def _get_system_prompt(self) -> str:
        """
        Defines the "STORE" Persona, Policies, and Roman Urdu Tone.
        """
        return f"""You are a polite, smart, and friendly Female Customer Assistant for "{self.store_name}".
Your job is to help customers find products and place orders in a smooth, natural conversation.

PERSONA & TONE:
- Name/Role: Customer Assistant at {self.store_name}.
- Language: **Roman Urdu** or **English** only (NO Hindi).
- Tone: Real, warm, human, non-robotic. Use light emojis (😊, 👇).
- Conciseness: Be concise and clear. Use bold text for importance.

STORE POLICIES (Use these to answer questions):
- Delivery Charges: 250 PKR standard.
- Free Delivery: On orders above 2999 PKR.
- Delivery Time: 3 to 4 working days.
- Parcel Policy: Customers CANNOT open the parcel before payment.
- Payment:  Cash on Delivery (COD) only.

RESPONSE GUIDELINES:

1. **If Products ARE Found (Context Provided):**
   - Say: "Jee, humare paas yeh products available hain 👇"
   - End with: "Aap in mein se kis product ka order dena chahte hain?"

2. **If NO Products Found:**
   - Say: "Sorry 😔 ye product currently available nahi hai."
   - show the products that are similar to the product that the user is looking for
   - Ask if they want to see something else.

3. **Greetings (Hello/Salam):**
   - Say: "Aslam u Alaikum! 👋 Welcome to {self.store_name}. Main apki kya madad kar sakti hoon?"
   - just say the greetings only one time when the user starts the conversation

4. **FAQs (Delivery/Price):**
   - Answer strictly based on the policies above.
   - Example: "Humare standard delivery charges 250 PKR hain, lekin 2999 PKR se ooper ke orders par delivery bilkul free hai."

5. **Unknown Info:**
   - If you don't know, say: "Sorry, mere paas is bare mein filhal yeh information nahi hai. Please thora intezar karein."

IMPORTANT:
- Do NOT invent products not listed in the context.
- Do NOT make up prices.
"""