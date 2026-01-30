import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getClientById } from "@/features/client/actions/client.action";
import { getCircuitsByClient } from "@/features/circuit-simulator/actions/circuit.action";
import { CircuitList } from "@/features/circuit-simulator/components/circuit-list";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { combineWithParentMetadata } from "@/lib/metadata";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { FileText, Mail, MapPin, Pencil, Phone, Upload, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const generateMetadata = combineWithParentMetadata({
  title: "Détails client",
  description: "Voir les détails et circuits du client",
});

// Count unique circuit families (not versions)
function countUniqueCircuits(
  circuits: { id: string; parentCircuitId: string | null }[]
) {
  const families = new Set<string>();
  for (const circuit of circuits) {
    families.add(circuit.parentCircuitId ?? circuit.id);
  }
  return families.size;
}

export default async function ClientDetailPage(
  props: PageProps<"/orgs/[orgSlug]/clients/[clientId]">
) {
  const params = await props.params;
  const org = await getRequiredCurrentOrgCache();
  const client = await getClientById(params.clientId, org.id);

  if (!client) {
    notFound();
  }

  const circuits = await getCircuitsByClient(client.id, org.id);
  const uniqueCircuitCount = countUniqueCircuits(circuits);

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center gap-4">
          {/* Client Avatar */}
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold text-primary">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <LayoutTitle>{client.name}</LayoutTitle>
            {/* Contact badges */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Mail className="size-3" />
                  {client.email}
                </a>
              )}
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Phone className="size-3" />
                  {client.phone}
                </a>
              )}
              {client.address && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <MapPin className="size-3" />
                  {client.address}
                </span>
              )}
            </div>
          </div>
        </div>
      </LayoutHeader>
      <LayoutActions>
        <Link
          href={`/orgs/${params.orgSlug}/clients/${params.clientId}/edit`}
          className={buttonVariants({ variant: "outline" })}
        >
          <Pencil className="mr-2 size-4" />
          Modifier
        </Link>
        <Link
          href={`/orgs/${params.orgSlug}/clients/${params.clientId}/circuits/import`}
          className={buttonVariants()}
        >
          <Upload className="mr-2 size-4" />
          Importer un schéma
        </Link>
      </LayoutActions>
      <LayoutContent>
        <div className="flex flex-col gap-6">
          {/* Notes if any */}
          {client.notes && (
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Schémas
                </p>
                <p className="text-2xl font-bold">{uniqueCircuitCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-powered/10">
                <Zap className="size-5 text-powered" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Simulations
                </p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
            <Link
              href={`/orgs/${params.orgSlug}/clients/${params.clientId}/circuits/import`}
              className="hidden items-center gap-4 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4 transition-colors hover:from-primary/10 hover:to-primary/15 lg:flex"
            >
              <div className="flex-1">
                <p className="font-medium">Nouveau schéma</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Importer un PDF
                </p>
              </div>
              <Upload className="size-5 text-primary" />
            </Link>
          </div>

          {/* Circuits Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Schémas électriques</h2>
                {uniqueCircuitCount > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {uniqueCircuitCount}
                  </Badge>
                )}
              </div>
            </div>
            <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
              <CircuitList
                circuits={circuits}
                orgSlug={params.orgSlug}
                clientId={params.clientId}
              />
            </Suspense>
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
}
