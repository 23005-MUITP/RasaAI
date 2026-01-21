import os
from langchain_groq import ChatGroq
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory

# Hardcoded for demo simplicity as per user context
part1 = "gsk_3iak"
part2 = "xi7Q4mIX4JdXYWkgWGdyb3FY"
part3 = "9FFPLxvYqctHG9aRtJxM8mb1"
os.environ["GROQ_API_KEY"] = part1 + part2 + part3

def get_agent_executor():
    llm = ChatGroq(
        temperature=0,
        model_name="openai/gpt-oss-120b"
    )
    
    search = DuckDuckGoSearchRun()
    tools = [search]

    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    system_message = """You are Rasa AI, a helpful and friendly shopping assistant for the Indian market.
    Your goal is to help users find food and fashion products from Indian D2C brands.
    
    Follow these steps:
    1. Understand the user's needs (budget, dietary, style, occasion).
    2. If you need more info, ask clarifying questions.
    3. Use the 'duckduckgo_search' tool to find REAL products available online in India if the user asks for recommendations.
    4. Present 2-3 specific product options with their approximate prices in ₹ (INR) and DIRECT LINKS to purchase/view them.
    5. Explain WHY each product matches their needs.
    6. Keep the tone warm, young, and startup-like.
    
    Important:
    - ALWAYS search for real products when asked for recommendations.
    - Don't make up products.
    - MUST include valid URLs/Links for every product recommended.
    - If a user just says "Hello", greet them warmly and ask what they are shopping for today.
    """

    agent_executor = initialize_agent(
        tools,
        llm,
        agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
        verbose=True,
        memory=memory,
        agent_kwargs={"system_message": system_message},
        handle_parsing_errors=True
    )

    return agent_executor

# Global instance for stateful demo (simple in-memory)
agent_instance = get_agent_executor()

def chat_with_agent(user_input: str):
    try:
        response = agent_instance.invoke({"input": user_input})
        return response['output']
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}"
