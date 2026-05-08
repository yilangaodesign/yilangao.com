import { useCallback, useEffect, useRef } from "react";

type Point = { x: number; y: number };

interface UseSafeTriangleOptions {
  enabled: boolean;
  submenuRef: React.RefObject<HTMLElement | null>;
  direction?: "right" | "left";
  delay?: number;
  tolerance?: number;
}

/**
 * Amazon's "safe triangle" pattern for submenu hover protection.
 *
 * When a submenu is open and the user moves diagonally toward it,
 * their cursor crosses adjacent parent items. Without protection,
 * each crossing triggers a submenu switch — the "whack-a-mole" bug.
 *
 * This hook tracks the cursor's trajectory via slope analysis between
 * successive positions and the submenu's far edge. If the slopes
 * diverge (cursor is getting closer to the submenu), hover activation
 * is deferred. Otherwise it fires immediately.
 *
 * @see https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown
 */
export function useSafeTriangle({
  enabled,
  submenuRef,
  direction = "right",
  delay = 100,
  tolerance = 75,
}: UseSafeTriangleOptions) {
  const mouseLocs = useRef<Point[]>([]);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      mouseLocs.current = [];
      return;
    }

    function onMouseMove(e: MouseEvent) {
      mouseLocs.current.push({ x: e.clientX, y: e.clientY });
      if (mouseLocs.current.length > 4) {
        mouseLocs.current.shift();
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, []);

  const getActivationDelay = useCallback((): number => {
    if (!submenuRef.current || mouseLocs.current.length < 2) return 0;

    const rect = submenuRef.current.getBoundingClientRect();
    const locs = mouseLocs.current;
    const loc = locs[locs.length - 1];
    const prevLoc = locs[locs.length - 2];

    if (loc.x === prevLoc.x && loc.y === prevLoc.y) return 0;

    const farEdge = direction === "right" ? rect.right : rect.left;
    const upperCorner: Point = { x: farEdge, y: rect.top - tolerance };
    const lowerCorner: Point = { x: farEdge, y: rect.bottom + tolerance };

    function slope(a: Point, b: Point) {
      return (b.y - a.y) / (b.x - a.x);
    }

    const decSlope = slope(loc, upperCorner);
    const incSlope = slope(loc, lowerCorner);
    const prevDecSlope = slope(prevLoc, upperCorner);
    const prevIncSlope = slope(prevLoc, lowerCorner);

    if (decSlope < prevDecSlope && incSlope > prevIncSlope) {
      return delay;
    }

    return 0;
  }, [submenuRef, direction, delay, tolerance]);

  const interceptHover = useCallback(
    (callback: () => void) => {
      if (pendingTimer.current) {
        clearTimeout(pendingTimer.current);
        pendingTimer.current = null;
      }

      if (!enabled) {
        callback();
        return;
      }

      const d = getActivationDelay();

      if (d > 0) {
        pendingTimer.current = setTimeout(() => {
          pendingTimer.current = null;
          const nextD = getActivationDelay();
          if (nextD > 0) {
            interceptHover(callback);
          } else {
            callback();
          }
        }, d);
      } else {
        callback();
      }
    },
    [enabled, getActivationDelay],
  );

  const cancelPending = useCallback(() => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
  }, []);

  return { interceptHover, cancelPending };
}
