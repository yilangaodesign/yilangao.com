"use client";

import { forwardRef, type ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import styles from "./Tabs.module.scss";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={[styles.list, className].filter(Boolean).join(" ")}
    {...props}
  />
));

TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef<
  HTMLButtonElement,
  { children: ReactNode; value: string; className?: string; disabled?: boolean }
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={[styles.trigger, className].filter(Boolean).join(" ")}
    {...props}
  />
));

TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = forwardRef<
  HTMLDivElement,
  { children: ReactNode; value: string; className?: string }
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={[styles.content, className].filter(Boolean).join(" ")}
    {...props}
  />
));

TabsContent.displayName = "TabsContent";
