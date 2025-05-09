import re
from pdfminer.high_level import extract_text
import spacy
import sys
import json

def extract_section(section_key, lines, all_patterns):
    collecting = False
    section_content = []
    pattern = all_patterns[section_key]

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        if re.search(pattern, line_clean, flags=re.IGNORECASE):
            if not collecting:
                collecting = True
                continue
            elif collecting:
                break
        if collecting:
            for other_key, other_pattern in all_patterns.items():
                if other_key != section_key and re.fullmatch(other_pattern, line_clean, flags=re.IGNORECASE):
                    collecting = False
                    break
        if collecting:
            section_content.append(line_clean)

    return "\n".join(section_content)

def add_candidate_data(candidate, data_label, data):
    candidate[data_label] = data
    return candidate


#///////////////////////////////////////////////////
def extract_resume_data(pdf_path):
   


    text = extract_text(pdf_path)
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text)
    lines = text.splitlines()

    section_titles = ["EDUCATION", "EXPERIENCE", "PROJECTS", "AWARDS", "SKILLS"]
    section_patterns = {
        "EDUCATION": r"education",
        "EXPERIENCE": r"(research|professional)?\s*experience",
        "PROJECTS": r"projects?",
        "AWARDS": r"(notable\s*)?awards?",
        "SKILLS": r"skills"
    }

    name = ""
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break

    address = ""
    for ent in doc.ents:
        if ent.label_ in ["GPE", "LOC"]:
            address = ent.text
            break

    phone = re.findall(r'\+123[\d\s\-]{7,}\d', text)
    email = re.findall(r'[\w\.-]+@[\w\.-]+', text)

    candidate = {
        "name": name,
        "phone": phone,
        "email": email,
        "address": address
    }


    for section in section_titles:
        section_data = extract_section(section, lines, section_patterns)
        candidate = add_candidate_data(candidate, section, section_data)

    return candidate


#pdf_path = "C:\\Users\\MSI\\Desktop\\Langchain\\dataCV\\10228751.pdf"  # Double backslashes


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({ "error": "Missing PDF path" }))
        sys.exit(1)

    pdf_path = sys.argv[1]
    try:
        result = extract_resume_data(pdf_path)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({ "error": str(e) }))
        sys.exit(1)



        

