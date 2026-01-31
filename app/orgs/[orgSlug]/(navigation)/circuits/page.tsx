import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCircuitsWithClientByOrganization } from "@/features/circuit-simulator/actions/circuit.action";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { combineWithParentMetadata } from "@/lib/metadata";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import {
  ChevronRight,
  Clock,
  History,
  Plus,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const generateMetadata = combineWithParentMetadata({
  title: "Schémas électriques",
  description: "Tous les schémas électriques de l'organisation",
});

// Group circuits by family (parent or self) and return only the latest version
function groupCircuitsByFamily<
  T extends { id: string; parentCircuitId: string | null; version: number }
>(circuits: T[]) {
  const familyMap = new Map<string, { latest: T; count: number }>();

  for (const circuit of circuits) {
    const familyId = circuit.parentCircuitId ?? circuit.id;

    const existing = familyMap.get(familyId);
    if (!existing) {
      familyMap.set(familyId, { latest: circuit, count: 1 });
    } else {
      existing.count++;
      if (circuit.version > existing.latest.version) {
        existing.latest = circuit;
      }
    }
  }

  return Array.from(familyMap.values());
}

export default async function CircuitsPage(
  props: PageProps<"/orgs/[orgSlug]/circuits">
) {
  const params = await props.params;
  const org = await getRequiredCurrentOrgCache();
  const circuits = await getCircuitsWithClientByOrganization(org.id);

  const groupedCircuits = groupCircuitsByFamily(circuits);
  const unassignedCount = circuits.filter((c) => !c.clientId).length;

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-powered/20 to-powered/5">
            <Zap className="size-7 text-powered" />
          </div>
          <div>
            <LayoutTitle>Schémas électriques</LayoutTitle>
            <LayoutDescription>
              {groupedCircuits.length} schéma
              {groupedCircuits.length !== 1 ? "s" : ""} dans l'organisation
              {unassignedCount > 0 && (
                <span className="text-warning">
                  {" "}
                  · {unassignedCount} non assigné
                  {unassignedCount !== 1 ? "s" : ""}
                </span>
              )}
            </LayoutDescription>
          </div>
        </div>
      </LayoutHeader>
      <LayoutActions>
        <Link
          href={`/orgs/${params.orgSlug}/circuits/import`}
          className={buttonVariants()}
        >
          <Plus className="mr-2 size-4" />
          Importer un schéma
        </Link>
      </LayoutActions>
      <LayoutContent>
        {circuits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 px-6 py-16">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-powered/10">
              <Zap className="size-7 text-powered" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">Aucun schéma</h3>
            <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
              Importez votre premier schéma pour simuler la logique électrique.
            </p>
            <Link
              href={`/orgs/${params.orgSlug}/circuits/import`}
              className={buttonVariants({ className: "mt-6" })}
            >
              <Plus className="mr-2 size-4" />
              Importer un schéma
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groupedCircuits.map(({ latest: circuit, count }) => (
              <Link
                key={circuit.id}
                href={`/orgs/${params.orgSlug}/circuits/${circuit.id}/simulate`}
                className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-powered/15 to-powered/5">
                    <Zap className="size-5 text-powered" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{circuit.name}</span>
                      {count > 1 && (
                        <Badge
                          variant="secondary"
                          className="gap-1 rounded-full px-2 text-xs"
                        >
                          <History className="size-3" />
                          {count} versions
                        </Badge>
                      )}
                      {!circuit.clientId && (
                        <Badge
                          variant="secondary"
                          className="bg-warning/10 text-warning"
                        >
                          Non assigné
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="size-3" />
                        {circuit.receptorCount} récepteur
                        {circuit.receptorCount !== 1 ? "s" : ""}
                      </span>
                      {circuit.clientName && (
                        <>
                          <span className="size-1 rounded-full bg-muted-foreground/30" />
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {circuit.clientName}
                          </span>
                        </>
                      )}
                      <span className="size-1 rounded-full bg-muted-foreground/30" />
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(circuit.updatedAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="hidden bg-powered/10 text-powered sm:flex"
                  >
                    v{circuit.version}
                  </Badge>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </LayoutContent>
    </Layout>
  );
}
