import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/card";
import { Button } from "../components/button";
import { ScrollArea } from "../components/scrollarea";

const Notifications = () => {
  return (
    <ScrollArea className="notifications-container h-full">
      <div className="flex flex-col gap-4 mt-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card className="notifications-card w-1/2 mx-auto" key={index}>
            <CardHeader>
              <CardTitle>Abc</CardTitle>
              <CardDescription>def ghi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="text-sm">lmn opq</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>xyz</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea >
  );
}

export default Notifications;
