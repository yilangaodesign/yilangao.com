"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import SkillMap from "./SkillMap";
import KnowledgeGraph from "./KnowledgeGraph";
import styles from "./elan-visuals.module.scss";

export default function SystemVisuals() {
  const [graphMounted, setGraphMounted] = useState(false);

  const handleValueChange = useCallback((value: string) => {
    if (value === "graph" && !graphMounted) {
      setGraphMounted(true);
    }
  }, [graphMounted]);

  return (
    <Tabs defaultValue="operations" onValueChange={handleValueChange}>
      <TabsList className={styles.tabList}>
        <TabsTrigger value="operations">Operations + Knowledge</TabsTrigger>
        <TabsTrigger value="graph">Full Graph</TabsTrigger>
      </TabsList>

      <TabsContent value="operations">
        <SkillMap />
      </TabsContent>

      <TabsContent value="graph">
        {graphMounted && <KnowledgeGraph />}
      </TabsContent>
    </Tabs>
  );
}
