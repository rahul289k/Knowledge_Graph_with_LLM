from openai import OpenAI
from retry import retry
from api.example_queries import examples
from constants import api_key

client = OpenAI(api_key=api_key)
system = f"""
You are an assistant with an ability to generate Cypher queries based off example Cypher queries.
Example Cypher queries are: \n {examples} \n
Do not response with any explanation or any other information except the Cypher query.
You do not ever apologize and strictly generate cypher statements based of the provided Cypher examples.
You need to update the database using an appropriate Cypher statement.
Do not provide any Cypher statements that can't be inferred from Cypher examples.

Inform the user when you can't infer the cypher statement due to the lack of context of the conversation and
state what is the missing context.

node are labelled as Skill, Company, MSA, Occupation, JobRole, ONETClassification, SkillCategory, Region, State,
 Country, JobFamily, Course
and relationships are labelled as BELONGS_TO_CATEGORY for Skill to SkillCategory,
BELONGS_TO_FAMILY for JobRole to JobFamily, CLASSIFIED_AS for JobRole to ONETClassification,
HAS_HEADQUARTER for Company to MSA, PART_OF_OCCUPATION for JobFamily to Occupation,
HAS_PREREQUISITE for Skill to Skill, PART_OF_COUNTRY for State to Country, PART_OF_REGION for Country to Region,
REQUIRES_SKILL for JobRole to Skill, TEACHES for Course to Skill
always do contains search for string passed value of entity
always apply limit in query to maximum 50

"""
summary_prompt = """Summarize the following result data of cypher query highlighting data in a brief way,
 without giving any additional information and in way to answer the user question in detailed way: """


@retry(tries=2, delay=5)
def generate_cypher(prompt):
    prompt_text = [{'role': 'user', 'content': prompt}]
    messages = [
                   {"role": "system", "content": system}
               ] + prompt_text
    chat_completion = client.chat.completions.create(
        messages=messages,
        model="gpt-4o",
    )
    response = chat_completion.choices[0].message.content
    if "MATCH" not in response and "{" in response:
        raise Exception(
            "GPT bypassed system message and is returning response based on previous conversation history" + response)
    if "apology" in response:
        response = " ".join(response.split("\n")[1:])
    if "`" in response:
        response = response.split("```")[1].strip("`")
    return response


def get_gpt_response(data, prompt):
    prompt_text = [{'role': 'user', 'content': str(data) + prompt}]
    messages = [
                   {"role": "system", "content": summary_prompt}
               ] + prompt_text
    chat_completion = client.chat.completions.create(
        messages=messages,
        model="gpt-4o",
    )
    response = chat_completion.choices[0].message.content
    if "`" in response:
        response = response.split("```")[1].strip("`")
    return response

