from pydantic import BaseModel


class GenerateCypher(BaseModel):
    prompt: str

class GetNodeData(BaseModel):
    label: str
    name: str

