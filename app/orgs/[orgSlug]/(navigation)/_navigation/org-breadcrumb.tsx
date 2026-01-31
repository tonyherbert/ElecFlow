"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";

/**
 * Translation map for path segments
 */
const SEGMENT_LABELS: Record<string, string> = {
  circuits: "Schémas",
  clients: "Clients",
  settings: "Paramètres",
  members: "Membres",
  billing: "Facturation",
  danger: "Zone de danger",
  plan: "Abonnement",
  payment: "Paiement",
  usage: "Utilisation",
  simulate: "Simulation",
  import: "Import",
  new: "Nouveau",
  edit: "Modifier",
};

/**
 * Check if a segment looks like an ID (random string, not a known keyword)
 */
function isIdSegment(segment: string): boolean {
  // Known segments are not IDs
  if (SEGMENT_LABELS[segment]) return false;
  // If it contains only alphanumeric and has no meaning, it's likely an ID
  return /^[a-zA-Z0-9_-]+$/.test(segment) && segment.length >= 6;
}

type BreadcrumbSegment = {
  label: string;
  path: string;
  isLink: boolean;
  isId: boolean;
};

export default function OrgBreadcrumb() {
  const pathname = usePathname();
  const params = useParams();

  const orgSlug = params.orgSlug as string;
  const basePath = `/orgs/${orgSlug}`;

  const segments = useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);
    // Skip "orgs" and orgSlug
    const relevantPaths = paths.slice(2);

    const result: BreadcrumbSegment[] = [];
    let currentPath = basePath;
    let parentSegment = "";
    let isUnderClients = false;

    for (let i = 0; i < relevantPaths.length; i++) {
      const segment = relevantPaths[i];
      const isLast = i === relevantPaths.length - 1;
      currentPath = `${currentPath}/${segment}`;

      // Track if we're under /clients/[id]/
      if (segment === "clients") {
        isUnderClients = true;
      }

      const isId = isIdSegment(segment);

      // Determine if this should be a link
      let isLink = true;

      // Check if this is an ID route that doesn't have its own page
      if (isId) {
        // /circuits/[circuitId] without anything after is not valid (at org level)
        // But /clients/[clientId] is valid
        // And /clients/[clientId]/circuits/[circuitId] is valid
        if (parentSegment === "circuits" && !isUnderClients) {
          // This is /circuits/[circuitId] at org level - not a valid page
          isLink = false;
        }
      }

      // Determine display label
      let label = SEGMENT_LABELS[segment] ?? segment;

      // For IDs, show a cleaner label
      if (isId) {
        // Try to determine what type of ID based on parent
        if (parentSegment === "clients") {
          label = "Client";
        } else if (parentSegment === "circuits") {
          label = "Schéma";
        } else {
          // Truncate long IDs
          label = segment.length > 8 ? `${segment.slice(0, 8)}...` : segment;
        }
      }

      // Last segment is never a link (it's the current page)
      if (isLast) {
        isLink = false;
      }

      result.push({
        label,
        path: currentPath,
        isLink,
        isId,
      });

      parentSegment = segment;
    }

    return result;
  }, [pathname, basePath]);

  // Don't show breadcrumb if we're on the home page
  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="border-border bg-background h-8 rounded-lg border px-3 shadow-sm shadow-black/5">
        <BreadcrumbItem>
          <BreadcrumbLink href={basePath}>
            <Home size={16} strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">Accueil</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.length > 0 && <BreadcrumbSeparator />}
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={segment.path}>
              <BreadcrumbItem>
                {isLast || !segment.isLink ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {segment.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={segment.path}
                    className="flex items-center gap-2"
                  >
                    {segment.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
