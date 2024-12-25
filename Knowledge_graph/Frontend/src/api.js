import { generateUUID } from "./utils";

const baseUrl = "http://localhost:8000";

export const sendMessage = async (message) => {
  try {
    const response = await fetch(`${baseUrl}/get_graph_data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "prompt": message }),
    }).then(res => res.json());
    if (response.status !== "success") {
      if (response.cypher_query) {
        return {
          id: generateUUID(),
          role: "assistant",
          content: response.cypher_query,
          type: "error"
        }
      }
      throw new Error("Something went wrong");
    }

    const cytoscapeElements = [];
    response["data"].forEach(item => {
      const objectKeys = Object.keys(item);

      if (objectKeys.length === 1) {
        const skill = item[objectKeys[0]];
        const label = skill?.name;
        cytoscapeElements.push({
          data: {
            id: label,
            label: label,
            description: skill?.description,
            url: skill?.url,
          }
        });
        return null;
      }

      if (objectKeys.length === 2) {
        const target = item["query_skill"];
        const sources = item["similar_skills"];

        cytoscapeElements.push({
          data: {
            id: target,
            label: target,
          }
        });

        sources.forEach(source => {
          cytoscapeElements.push(...[
            {
              data: {
                source: source,
                target: target,
                label: "SIMILAR_TO",
              }
            },
            {
              data: {
                id: source,
                label: source,
              }
            },
          ]);
        });
        return null;
      }

      if (objectKeys.length === 3) {
        const relation = item["relation"];
        const source = item["parent"];
        const target = item["child"];

        const sourceLabel = source?.data?.name;
        const targetLabel = target?.data?.name;

        cytoscapeElements.push(...[
          {
            data: {
              id: sourceLabel,
              label: sourceLabel,
              description: source?.data?.description,
              group: source?.label,
            }
          },
          {
            data: {
              id: targetLabel,
              label: targetLabel,
              description: target?.data?.description,
              group: target?.label,
            }
          },
          {
            data: {
              source: sourceLabel,
              target: targetLabel,
              label: relation,
            }
          },
        ]);
        return null;
      }

      console.error("Unknow data structure", item, objectKeys);
      return null;
    });

    return {
      id: generateUUID(),
      role: "assistant",
      content: response["summary_result"],
      type: "visualization",
      visualData: {
        cypher_query: response["cypher_query"],
        elements: cytoscapeElements,
      }
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getNodeDetails = async (name, label) => {
  const response = await fetch(`${baseUrl}/get_node_detail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "name": name, "label": label }),
  }).then(res => res.json());
  const nodeData = response.node_data;
  const keys = Object.keys(nodeData);
  return nodeData[keys[0]] || {};
};
