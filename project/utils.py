#---libraries import
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chains import ConversationChain
from langchain.chains import SequentialChain
from langchain_core.messages import HumanMessage
import json
import os
from dotenv import load_dotenv
# --- Load environment variables ---
load_dotenv()

#---initialisation
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=os.environ["GOOGLE_API"],
    temperature=0.6
)

#---Templates
template = """
You are an intelligent HR assistant helping a recruiter complete a job description.
You need to extract these fields:
- Job Title
- Location
- Education Level
- Required Skills
- Years of Experience

Current collected info:
{fields}

Current Input:
{input}

When there are multiple skills or locations mentioned, put them inside a list.
If any field is missing, ask the user for it.
If all fields are present, ask for confirmation with typying "done".
Allow editing any field if the user requests.
If the user greets you greet them back.

"""

template2="""
From the following text:
{text}

Extract only the fields that have been explicitly updated or provided by the user.

Do NOT guess or infer any missing fields. Just return a JSON object .


Only return valid JSON. No explanations. No markdown formatting.
"""

#---Chains SetUp

# first chain 
completion_prompt  = PromptTemplate(
    input_variables=["fields", "input"],
    template=template
)
response_chain=LLMChain(llm=llm,prompt=completion_prompt ,output_key="text")

#////
fields_template=PromptTemplate(input_variables=["text"],
                               template=template2)
fields_chain=LLMChain(llm=llm,prompt=fields_template,output_key="fieldsU")




#---BIG CHAIN

big_chain = SequentialChain(
    chains=[response_chain, fields_chain],
    input_variables=['fields', 'input'],  # Only initial inputs
    output_variables=['text', 'fieldsU'],  # Final outputs
  
)

#initialisation fields
fields = {
    "Job Title": None,
    "Location": None,
    "Education Level": None,
    "Required Skills": None,
    "Years of Experience": None
}


# --- Function to process HumanMessage ---
def interact_until_fields_complete(human_message: HumanMessage):
    global fields
    done = False


    if (human_message.content.lower().strip() != "done"):

        #BIGCHAIN CALL
        output=big_chain({'fields':str(fields) , 'input':human_message.content})
        #to debug perpous
        print(output['fieldsU'])
        fileds2json = output['fieldsU'].strip('```json').strip('```').strip().replace('\n', '')
        fields2= json.loads(fileds2json)
    

        for key in fields2.keys():
            fields[key]=fields2[key]
         #to debug
        for cle, valeur in fields.items():
            print(f"Clé: {cle} => Valeur: {valeur}")    
        print("/n")
        return output['text']
    else:
        fields = {
            "Job Title": None,
            "Location": None,
            "Education Level": None,
            "Required Skills": None,
            "Years of Experience": None
        }
        pdf_links = (
            "We will proceed matching then.\n"
            "Here are 3 candidate profiles for you to download:\n"
            "1. [Candidate 1](http://localhost:8000/dataCV/HR%20cv.pdf)\n"
            "2. [Candidate 2](http://localhost:8000/dataCV/HR2.pdf)\n"
            "3. [Candidate 3](http://localhost:8000/dataCV/HR3.pdf)\n"
        )
        return pdf_links  
        # return "We will proceed matching then.\n"