import pandas as pd
from data_population_neo4j.db_connection import connect_to_neo4j
from utils import nested_array_in_batch
driver = connect_to_neo4j()


def push_company_data(data):
    query = """
    UNWIND $data AS row
    MERGE (company:Company {id: row.account_id})
    ON CREATE SET
      company.name = row.account_name,
      company.year_established = toInteger(row.year_established),
      company.about = row.about,
      company.account_type = row.account_type
    WITH row, company
    WHERE row.headquarter IS NOT NULL
    MERGE (location:MSA {name: TRIM(LOWER(row.headquarter))})
    MERGE (company)-[:HAS_HEADQUARTER]->(location)
    """

    with driver.session() as session:
        session.run(query, data=data)


def push_skill_data(data):
    query = """
    UNWIND $data AS row
    MERGE (skill:Skill {name: TRIM(row.skill)})
    ON CREATE SET
      skill.skill_id = row.skill_id,
      skill.description = row.skill_description,
      skill.is_soft_skill = CASE
        WHEN row.is_soft_skill = 'True' THEN true
        ELSE false
      END
    WITH row, skill
    MERGE (category:SkillCategory {name: TRIM(row.skill_category)})
    SET
       category.description = row.description
    MERGE (skill)-[:BELONGS_TO_CATEGORY]->(category)
    """

    with driver.session() as session:
        session.run(query, data=data)


def push_job_role_data(data):
    query = """
    UNWIND $data AS row
    // Create Job Role Node
    MERGE (role:JobRole {name: TRIM(row.role)})
    ON CREATE SET
      role.id = toInteger(row.role_id),
      role.digitization_quotient = row.digitization_quotient,
      role.digitization_quotient_desc = row.digitization_quotient_desc,
      role.description = row.description

    // Create Job Family Node
    WITH row, role
    MERGE (family:JobFamily {name: TRIM(row.family)})

    // Create Occupation Node
    WITH row, role, family
    MERGE (occupation:Occupation {name: TRIM(row.occupation)})

    // Create O*NET Classification Node
    WITH row, role, family, occupation
    WHERE row.onet_code IS NOT NULL
    MERGE (onet:ONETClassification {onet_code: TRIM(row.onet_code)})
    SET
      onet.onet_classification = row.onet_classification,
      onet.onet_link = row.onet_link

    // Link Relationships Between Nodes
    MERGE (role)-[:BELONGS_TO_FAMILY]->(family)
    MERGE (family)-[:PART_OF_OCCUPATION]->(occupation)
    MERGE (role)-[:CLASSIFIED_AS]->(onet)
    """

    with driver.session() as session:
        session.run(query, data=data)


def push_skill_to_job_role_map(data):
    query = """
    UNWIND $data AS row
    MATCH (role:JobRole {name: TRIM(row.job_role)})
    MATCH (skill:Skill {name: TRIM(row.skill)})
    MERGE (role)-[:REQUIRES_SKILL]->(skill)
    """

    with driver.session() as session:
        session.run(query, data=data)


def push_skill_pre_requisite_data(data):
    query = """
    UNWIND $data AS row
    MATCH (skill:Skill {name: TRIM(row.skill)})  
    MATCH (prerequisite:Skill {name: TRIM(row.prerequisite_skill)})
    MERGE (skill)-[:HAS_PREREQUISITE]->(prerequisite)
    """

    with driver.session() as session:
        session.run(query, data=data)


def push_skill_course_map(data):
    query = """
    UNWIND $data AS row
    MATCH (skill:Skill {name: TRIM(row.skill)})
    MERGE (course:Course {name: TRIM(row.course_title)})
    ON CREATE 
    SET course.content_type = row.course_content_type,
        course.url = row.course_url
    MERGE (course)-[:TEACHES]->(skill)
    """

    with driver.session() as session:
        session.run(query, data=data)

# push data entities to neo4j
# ------------------------company data------------------------


load_data = pd.read_csv('/Users/rahulkumar/Downloads/draup_360_companies_data.csv')
data_list_dicts = load_data.to_dict(orient='records')
push_company_data(data_list_dicts)


# -----------------------------skill_data---------------------------------
load_skill_data = pd.read_csv('/Users/rahulkumar/Downloads/skill_soft_skill_core_skill_skill_category.csv')
skill_data_list = load_skill_data.to_dict(orient='records')
push_skill_data(skill_data_list)


# -------------------------------job_role_data---------------------------------
load_job_role_data = pd.read_csv('/Users/rahulkumar/Downloads/job_role_job_family_data.csv')
load_job_role_data.fillna("", inplace=True)
job_role_data_list = load_job_role_data.to_dict(orient='records')
push_job_role_data(job_role_data_list)

# -------------------------------skill_to_job_role_map---------------------------------
load_skill_to_job_role_data = pd.read_csv('/Users/rahulkumar/Downloads/skill_to_job_role_map.csv')
skill_to_job_role_data_list = load_skill_to_job_role_data.to_dict(orient='records')
batch_data = nested_array_in_batch(skill_to_job_role_data_list, 10000)
i = 1
for each_batch in batch_data:
    push_skill_to_job_role_map(each_batch)
    print(f"Batch {i} pushed")
    i += 1


# -------------------------------skill_pre_requisite_data---------------------------------
load_skill_pre_requisite_data = pd.read_csv('/Users/rahulkumar/Downloads/skill_prerequisites.csv')
load_skill_pre_requisite_data.fillna("", inplace=True)
skill_pre_requisite_data_list = load_skill_pre_requisite_data.to_dict(orient='records')
push_skill_pre_requisite_data(skill_pre_requisite_data_list)


# -------------------------------skill_course_map---------------------------------
load_skill_course_data = pd.read_csv('/Users/rahulkumar/Downloads/skill_course_mapping.csv')
load_skill_course_data.fillna("", inplace=True)
skill_course_data_list = load_skill_course_data.to_dict(orient='records')
batch_data = nested_array_in_batch(skill_course_data_list, 10000)
i = 1
for each_batch in batch_data:
    push_skill_course_map(each_batch)
    print(f"Batch {i} pushed")
    i += 1
