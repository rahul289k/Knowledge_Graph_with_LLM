from fastapi import FastAPI, APIRouter, status
from fastapi.middleware.cors import CORSMiddleware
from api.api_util_function import generate_cypher, get_gpt_response
from api.data_model import GenerateCypher, GetNodeData
from data_population_neo4j.db_connection import connect_to_neo4j
app = FastAPI()
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)


@router.post("/get_graph_data", status_code=status.HTTP_200_OK)
def get_graph_data(request: GenerateCypher):
    response = {"status": "success", "data": None, 'summary_result': None, 'cypher_query': "", "error": ""}
    try:
        prompt = request.prompt
        cypher_query = generate_cypher(prompt)
        response["cypher_query"] = cypher_query
        conn = connect_to_neo4j()
        with conn.session() as session:
            result = session.run(cypher_query)
            rel_data = []
            non_rel_data = []
            for record in result:
                node_data = record.data()
                if 'r' in node_data:
                    parent = node_data['r'][0]
                    child = node_data['r'][2]
                    parent_type = None
                    child_type = None
                    for key in node_data:
                        if node_data[key] == parent:
                            parent_type = key
                        if node_data[key] == child:
                            child_type = key
                    rel_data.append({
                        "parent": {"data": node_data['r'][0], "label":  parent_type},
                        "relation": node_data['r'][1],
                        "child": {"data": node_data['r'][2], "label":  child_type},
                    })
                else:
                    non_rel_data.append(node_data)
            neo_data = rel_data if rel_data else non_rel_data
            response["data"] = neo_data

            gpt_response = get_gpt_response(neo_data, prompt)
            response["summary_result"] = gpt_response
    except Exception as e:

        response["status"] = "error"
        response["error"] = str(e)
    return response


@router.post("/get_node_detail", status_code=status.HTTP_200_OK)
def get_graph_data(request: GetNodeData):
    response = {"status": "success", "node_data": {}, "error": ""}
    try:
        node = request.name
        label = request.label
        conn = connect_to_neo4j()
        with conn.session() as session:
            result = session.run(f"match ({label.lower()}:{label}) where {label.lower()}.name = '{node}'"
                                 f" return {label.lower()}")
            for record in result:
                response["node_data"] = record.data()
    except Exception as e:
        response["status"] = "error"
        response["error"] = str(e)
    return response

app.include_router(router)

