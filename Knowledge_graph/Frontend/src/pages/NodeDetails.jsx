import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ThemeToggle } from "../components/theme-provider";
import { getNodeDetails } from "../api";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/card";

const availableLabels = {
  "skill": "Skill",
  "company": "Company",
  "msa": "MSA",
  "occupation": "Occupation",
  "jobrole": "JobRole",
  "onetclassification": "ONETClassification",
  "skillcategory": "SkillCategory",
  "region": "Region",
  "state": "State",
  "country": "Country",
  "jobfamily": "JobFamily",
  "course": "Course",
}

const NodeDetails = () => {
  const { name, label } = useParams();
  const [nodeDetails, setNodeDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNodeDetails(name, availableLabels[label]).then(data => {
      setNodeDetails(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="mt-10 flex justify-center items-center"><div className="loader" /></div>
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4 flex items-center justify-between ml-auto">
        <ThemeToggle />
      </div>
      <Card className="w-1/2 mx-auto mt-10">
        <CardHeader>
          <CardTitle>{nodeDetails?.name || "No Data"}</CardTitle>
          <CardDescription>{nodeDetails?.description || nodeDetails?.about}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default NodeDetails;
