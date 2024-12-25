import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NodeDetails from "./pages/NodeDetails";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/node/:label/:name" element={<NodeDetails />} />
    </Routes>
  )
}

export default App
