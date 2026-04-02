"use client";

import {
  forwardRef,
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import styles from "./NavItem.module.scss";

export interface NavItemChildrenProps extends HTMLAttributes<HTMLDivElement> {
  expanded: boolean;
  children: ReactNode;
}

export const NavItemChildren = forwardRef<HTMLDivElement, NavItemChildrenProps>(
  ({ expanded, children, className, style, ...rest }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(
      expanded ? undefined : 0,
    );
    const isFirstRender = useRef(true);

    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        setHeight(expanded ? undefined : 0);
        return;
      }

      const el = innerRef.current;
      if (!el) return;

      if (expanded) {
        const measured = el.scrollHeight;
        setHeight(0);
        requestAnimationFrame(() => {
          setHeight(measured);
        });
      } else {
        const measured = el.scrollHeight;
        setHeight(measured);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
    }, [expanded]);

    function handleTransitionEnd() {
      if (expanded) setHeight(undefined);
    }

    return (
      <div
        ref={ref}
        role="group"
        className={[styles.childrenContainer, className]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...style,
          height: height === undefined ? "auto" : height,
        }}
        aria-hidden={!expanded}
        onTransitionEnd={handleTransitionEnd}
        {...rest}
      >
        <div ref={innerRef} className={styles.childrenInner}>
          {children}
        </div>
      </div>
    );
  },
);

NavItemChildren.displayName = "NavItemChildren";
