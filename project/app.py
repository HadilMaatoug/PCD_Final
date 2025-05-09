from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
load_dotenv() #take the enviremnemt variables from .env
import streamlit as st
from langchain_core.messages import HumanMessage , AIMessage
st.set_page_config(page_title="HR Assisatnt ")
#---import the function from utils.py----
from utils import interact_until_fields_complete
import json
#initialize our chat history variable
if "chat_history" not in st.session_state:
    st.session_state.chat_history=[]

st.title("HR Assistant")

# Initialize the chat history variable (check localStorage for saved history)
#if "chat_history" not in st.session_state:
    # Check if there is chat history stored in localStorage
 #   chat_history = st.experimental_get_query_params().get("chat_history", None)
  #  if chat_history:
   #     st.session_state.chat_history = json.loads(chat_history[0])  # Load chat history from query params (localStorage)
    #else:
     #   st.session_state.chat_history = []


# get response
def get_response(query, chat_history):
    human_message = HumanMessage(content=query)
    response = interact_until_fields_complete( human_message)
    return response

#conversation
for message in st.session_state.chat_history:
    if isinstance(message, HumanMessage):
        with st.chat_message("Human"):
            st.markdown(message.content)
    else:
        with st.chat_message("AI"):
            st.markdown(message.content)       

# user input 
user_query = st.chat_input("Your message")
if user_query is not None and user_query != "":
    st.session_state.chat_history.append(HumanMessage(user_query))
    with st.chat_message("Human"):
        st.markdown(user_query)

    ai_response = get_response(user_query, st.session_state.chat_history)
    with st.chat_message("AI"):
        st.markdown(ai_response)

    st.session_state.chat_history.append(AIMessage(ai_response))    
    # Save the updated chat history to localStorage
    # st.experimental_set_query_params(chat_history=json.dumps([message.content for message in st.session_state.chat_history]))
    # JavaScript to save the chat history to localStorage
    # JavaScript to save the chat history to localStorage
    chat_history_json = json.dumps([message.content for message in st.session_state.chat_history])
    js_code = f"""
    <script>
    if (typeof(Storage) !== "undefined") {{
        localStorage.setItem("chat_history", '{chat_history_json}');
    }} else {{
        alert("Local Storage is not supported on this browser.");
    }}
    </script>
    """
    st.components.v1.html(js_code)

# JavaScript to load the chat history from localStorage when the page loads
load_js_code = """
<script>
if (typeof(Storage) !== "undefined") {
    let savedHistory = localStorage.getItem("chat_history");
    if (savedHistory) {
        const history = JSON.parse(savedHistory);
        // Send the loaded history to the Streamlit app
        window.parent.postMessage({type: 'load_history', history: history}, '*');
    }
}
</script>
"""
st.components.v1.html(load_js_code)

# Capture the loaded history and update session_state
# Listen for messages from the JavaScript side and update chat history
st.markdown("""
<script>
window.addEventListener("message", function(event) {
    if (event.data.type === 'load_history') {
        const history = event.data.history;
        // Send the history back to Streamlit using the query parameters
        const historyParam = encodeURIComponent(JSON.stringify(history));
        window.location.href = "?history=" + historyParam;
    }
});
</script>
""", unsafe_allow_html=True)

# Update chat history if the `history` query parameter is present
if 'history' in st.query_params:
    history_data = json.loads(st.query_params['history'])
    if history_data:
        st.session_state.chat_history = [HumanMessage(msg) if i % 2 == 0 else AIMessage(msg) for i, msg in enumerate(history_data)]