import React, { useState } from "react";
import { ThemeToggle } from "../components/theme-provider";
import { Tabs, TabsList, TabsTrigger } from "../components/tabs";
import Interface from "./Interface";
import Notifications from "./notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "../components/dropdown";
import { Button } from "../components/button";

const Home = () => {
  const [selectedTab, setSelectedTab] = useState("interface");
  const [view, setView] = useState('graph');

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Tabs defaultValue="interface">
            <TabsList className="grid w-full grid-cols-2 tab-buttons gap-2">
              <TabsTrigger value="interface" onClick={() => setSelectedTab("interface")}>Interface</TabsTrigger>
              <TabsTrigger value="notifications" onClick={() => setSelectedTab("notifications")}>Notifications</TabsTrigger>
            </TabsList>
          </Tabs>
          {selectedTab === "interface" && (<DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">View</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem checked={view === 'graph'} onClick={() => setView('graph')}>
                  <span>Graph</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={view === 'table'} onClick={() => setView('table')}>
                  <span>Table</span>
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      {selectedTab === "interface" && <Interface view={view} />}
      {selectedTab === "notifications" && <Notifications />}
    </div>
  )
}

export default Home;
