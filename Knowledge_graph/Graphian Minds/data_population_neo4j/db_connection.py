import os
from neo4j import GraphDatabase

NEO4J_HOST = 'neo4j+ssc://569e015a.databases.neo4j.io'
NEO4J_USERNAME = 'neo4j'
NEO4J_PASSWORD = os.environ.get('NEO4J_PASSWORD')


def connect_to_neo4j():
    driver = GraphDatabase.driver(NEO4J_HOST, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    return driver

