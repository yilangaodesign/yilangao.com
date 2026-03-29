import { getPayloadClient } from "@/lib/payload";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import ExperimentsClient from "./ExperimentsClient";

const FALLBACK_EXPERIMENTS = [
  {
    id: "ascii-shader",
    num: "01",
    title: "ASCII Shader Engine",
    description:
      "Real-time WebGL shader that converts any video feed into dynamic ASCII art. Built with custom GLSL fragment shaders and a character-density mapping algorithm.",
    tags: ["WebGL", "GLSL", "Creative Coding"],
    date: "Mar 2026",
  },
  {
    id: "generative-grid",
    num: "02",
    title: "Generative Grid System",
    description:
      "A procedurally generated layout engine that creates unique editorial compositions on every page load, inspired by Swiss design and computational art.",
    tags: ["Generative Art", "Canvas API", "Typography"],
    date: "Feb 2026",
  },
  {
    id: "spatial-audio",
    num: "03",
    title: "Spatial Audio Visualizer",
    description:
      "3D audio-reactive environment built with Three.js and the Web Audio API. Sound frequency data drives particle behavior, color fields, and camera movement in real time.",
    tags: ["Three.js", "Web Audio", "3D"],
    date: "Jan 2026",
  },
  {
    id: "scroll-physics",
    num: "04",
    title: "Scroll Physics Playground",
    description:
      "An exploration of inertia, spring dynamics, and momentum-based scroll interactions. Each section demonstrates a different physics model driving UI transitions.",
    tags: ["Framer Motion", "Physics", "Interaction"],
    date: "Dec 2025",
  },
  {
    id: "type-morph",
    num: "05",
    title: "Typographic Morphing",
    description:
      "Variable font axes animated through scroll and cursor position. Letterforms continuously morph between weight, width, and optical size in response to user input.",
    tags: ["Variable Fonts", "CSS", "Animation"],
    date: "Nov 2025",
  },
  {
    id: "data-sculpture",
    num: "06",
    title: "Data Sculpture",
    description:
      "Transforms live API data streams into abstract 3D forms. Each data point influences geometry, material, and light — turning numbers into a living sculpture.",
    tags: ["Three.js", "Data Viz", "API"],
    date: "Oct 2025",
  },
];

export default async function ExperimentsPage() {
  let experiments = FALLBACK_EXPERIMENTS;
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "experiments",
      sort: "order",
      limit: 50,
    });

    if (res.docs.length > 0) {
      experiments = res.docs.map((e) => ({
        id: e.slug,
        cmsId: e.id,
        num: e.num,
        title: e.title,
        description: e.description,
        tags: e.tags?.map((t: { tag: string }) => t.tag) ?? [],
        date: e.date,
      }));
    }
  } catch {
    // Payload not connected — use fallback data
  }

  return (
    <>
      <RefreshRouteOnSave />
      <ExperimentsClient experiments={experiments} isAdmin={isAdmin} />
    </>
  );
}
