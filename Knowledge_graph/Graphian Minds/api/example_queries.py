examples = """
# Give skill which belongs to skill category 'Data Science'
MATCH (skill:Skill)-[r:BELONGS_TO_CATEGORY]->(skillcategory:SkillCategory {name: 'Data Science'}) RETURN skill, r
 skillcategory limit 25;
# give Company which has headquarter in 'miami-fort lauderdale area, united states'
MATCH (company:Company)-[:HAS_HEADQUARTER]->(msa:MSA) WHERE msa.name CONTAINS 'united states' RETURN company;
# Fetch all Skill nodes and their relationships to SkillCategory
MATCH (skill:Skill)-[r:BELONGS_TO_CATEGORY]->(skillcategory:SkillCategory) RETURN skill, r, skillcategory limit 50;
# relationships between JobRole and JobFamily
MATCH (jobroler:JobRole)-[r:BELONGS_TO_FAMILY]->(jobfamily:JobFamily) RETURN jobrole, r, jobfamily limit 50;
# relationships between Company and MSA
MATCH (company:Company)-[r:HAS_HEADQUARTER]->(msa:MSA) RETURN company, r, msa limit 100;
# get 5 courses which teaches 'Data Science'
MATCH (course:Course)-[:TEACHES]->(skill:Skill {name: 'Data Science'}) RETURN course limit 5;
# get 10 countries which has region 'Asia'
MATCH (country:Country)-[r:PART_OF_REGION]->(region:Region) WHERE region.name CONTAINS 'Asia' RETURN country, r,
 region LIMIT 10;

---------------------------------------------------------- with where clause---------------------------------

# Give skill which belongs to skill category 'Data Science' and skill category 'Data Scraping'
MATCH (skill:Skill)-[r:BELONGS_TO_CATEGORY]->(skillcategory:SkillCategory) WHERE skillcategory.name IN ['Data Science',
 'Data Scraping']
 RETURN skill, r, skillcategory limit 25;
# give Company which has headquarter in 'united states'
MATCH (company:Company)-[r:HAS_HEADQUARTER]->(msa:MSA) WHERE msa.name CONTAINS 'united states' RETURN company, r ,
 msa limit 50;
# Fetch all Skill nodes and their relationships to SkillCategory where SkillCategory name is 'Data Science'
MATCH (skill:Skill)-[r:BELONGS_TO_CATEGORY]->(skillcategory:SkillCategory {name: 'Data Science'}) RETURN skill, r,
 skillcategory limit 50;

-----------------------similarity search query------------------------

# final all skills similar to 'Deep Learning'
MATCH (skill1:Skill {name: 'Deep Learning'})<-[:TEACHES]-()-[:TEACHES]->(skill2:Skill)
WHERE skill1.name < skill2.name
WITH skill1,skill2, count(*) AS cooccurrences
ORDER BY cooccurrences DESC LIMIT 10
RETURN skill1.name AS query_skill, collect(skill2.name) AS similar_skills


# give all jobroles which requires 'Python' skill
MATCH (jobrole:JobRole)-[r:REQUIRES_SKILL]->(skill:Skill)  WHERE toLower(skill.name) CONTAINS toLower('Python') 
RETURN jobrole, r, skill LIMIT 50

# popular skills for business analyst
MATCH (jobrole:JobRole {name: 'Business Analyst'})-[r:REQUIRES_SKILL]->(skill:Skill) RETURN skill, r, jobrole LIMIT 50

# skills needed for devops jobrole
MATCH (jobrole:JobRole)-[r:REQUIRES_SKILL]->(skill:Skill) WHERE toLower(jobrole.name) CONTAINS toLower('DevOps')
 RETURN skill, r, jobrole LIMIT 50

"""
