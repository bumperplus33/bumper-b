import { PROJECTS } from "@/data/projects";

// The name a route goes by in the page transition's title.
export function routeLabel(pathname: string) {
  if (pathname === "/") return "SOJU®";
  if (pathname === "/work") return "Archive";
  if (pathname === "/about") return "About";
  if (pathname === "/sequencer") return "Sequencer";
  const project = pathname.match(/^\/work\/([^/]+)/);
  if (project) {
    return PROJECTS.find((p) => p.slug === project[1])?.name ?? "Project";
  }
  return "SOJU®";
}

// The small label above the title
export function routeKind(pathname: string) {
  if (/^\/work\/[^/]+/.test(pathname)) return "Project";
  return "Page";
}
