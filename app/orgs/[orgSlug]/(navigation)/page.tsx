import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getClientsByOrganization } from "@/features/client/actions/client.action";
import { getCircuitsByOrganization } from "@/features/circuit-simulator/actions/circuit.action";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  FileText,
  Plus,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const org = await getRequiredCurrentOrgCache();
  const clients = await getClientsByOrganization(org.id);
  const circuits = await getCircuitsByOrganization(org.id);

  // Calculate stats
  const totalClients = clients.length;
  const totalCircuits = circuits.length;
  const totalReceptors = circuits.reduce((sum, c) => sum + c.receptorCount, 0);

  // Get recent items (last 5)
  const recentClients = clients.slice(0, 5);
  const recentCircuits = circuits.slice(0, 5);

  // Get clients with circuit counts for quick overview
  const activeClients = clients.filter((c) => c.circuitCount > 0).length;

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Zap className="size-7 text-primary" />
          </div>
          <div>
            <LayoutTitle>Tableau de bord</LayoutTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Bienvenue sur ElecFlow · {org.name}
            </p>
          </div>
        </div>
      </LayoutHeader>
      <LayoutActions>
        <Link
          href={`/orgs/${org.slug}/clients/new`}
          className={buttonVariants({ variant: "outline" })}
        >
          <Plus className="mr-2 size-4" />
          Nouveau client
        </Link>
      </LayoutActions>
      <LayoutContent>
        {totalClients === 0 ? (
          <EmptyState orgSlug={org.slug} />
        ) : (
          <div className="flex flex-col gap-8">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                icon={Users}
                label="Clients"
                value={totalClients}
                subValue={`${activeClients} actif${activeClients !== 1 ? "s" : ""}`}
                href={`/orgs/${org.slug}/clients`}
              />
              <StatsCard
                icon={FileText}
                label="Schémas"
                value={totalCircuits}
                subValue={`${totalReceptors} récepteur${totalReceptors !== 1 ? "s" : ""}`}
                color="powered"
              />
              <StatsCard
                icon={Zap}
                label="Récepteurs"
                value={totalReceptors}
                subValue="Total analysés"
                color="primary"
              />
              <QuickActionCard orgSlug={org.slug} />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Recent Clients - Takes 3 columns */}
              <div className="lg:col-span-3">
                <div className="rounded-xl border bg-card">
                  <div className="flex items-center justify-between border-b px-5 py-4">
                    <div>
                      <h2 className="font-semibold">Clients récents</h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Derniers clients modifiés
                      </p>
                    </div>
                    <Link
                      href={`/orgs/${org.slug}/clients`}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Voir tous
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                  <div className="divide-y">
                    {recentClients.map((client) => (
                      <Link
                        key={client.id}
                        href={`/orgs/${org.slug}/clients/${client.id}`}
                        className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-bold text-primary">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="size-3" />
                                {client.circuitCount} schéma
                                {client.circuitCount !== 1 ? "s" : ""}
                              </span>
                              <span className="size-1 rounded-full bg-muted-foreground/30" />
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {new Date(client.updatedAt).toLocaleDateString(
                                  "fr-FR",
                                  { day: "numeric", month: "short" }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {client.circuitCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-powered/10 text-powered"
                            >
                              Actif
                            </Badge>
                          )}
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Circuits - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border bg-card">
                  <div className="border-b px-5 py-4">
                    <h2 className="font-semibold">Derniers schémas</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Activité récente
                    </p>
                  </div>
                  {recentCircuits.length > 0 ? (
                    <div className="divide-y">
                      {recentCircuits.map((circuit) => (
                        <div
                          key={circuit.id}
                          className="flex items-center gap-3 px-5 py-3"
                        >
                          <div className="flex size-8 items-center justify-center rounded-lg bg-powered/10">
                            <Zap className="size-4 text-powered" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {circuit.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {circuit.receptorCount} récepteur
                              {circuit.receptorCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {new Date(circuit.updatedAt).toLocaleDateString(
                              "fr-FR",
                              { day: "numeric", month: "short" }
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50">
                        <FileText className="size-5 text-muted-foreground" />
                      </div>
                      <p className="mt-3 text-sm font-medium">Aucun schéma</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Importez votre premier schéma
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Tips */}
                <div className="mt-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5">
                  <h3 className="font-semibold">Astuce rapide</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Importez vos schémas PDF pour analyser automatiquement la
                    structure des protections et simuler le comportement du
                    circuit.
                  </p>
                  <Link
                    href={`/orgs/${org.slug}/circuits/import`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "mt-4",
                    })}
                  >
                    <Upload className="mr-2 size-3.5" />
                    Importer un schéma
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </LayoutContent>
    </Layout>
  );
}

function StatsCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = "default",
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  subValue: string;
  color?: "default" | "powered" | "primary";
  href?: string;
}) {
  const colorClasses = {
    default: "bg-muted/50 text-muted-foreground",
    powered: "bg-powered/10 text-powered",
    primary: "bg-primary/10 text-primary",
  };

  const content = (
    <div className="flex h-full items-center gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-md">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colorClasses[color]}`}
      >
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{subValue}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}

function QuickActionCard({ orgSlug }: { orgSlug: string }) {
  return (
    <Link
      href={`/orgs/${orgSlug}/circuits/import`}
      className="flex flex-col justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
        <Upload className="size-5 text-primary" />
      </div>
      <div>
        <p className="font-medium">Nouveau schéma</p>
        <p className="text-xs text-muted-foreground">Importer un PDF</p>
      </div>
    </Link>
  );
}

function EmptyState({ orgSlug }: { orgSlug: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 px-6 py-20">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5">
        <Zap className="size-10 text-primary" />
      </div>
      <h2 className="mt-8 text-2xl font-bold">Bienvenue sur ElecFlow</h2>
      <p className="mt-3 max-w-md text-center text-muted-foreground">
        Commencez par créer votre premier client. Les schémas électriques sont
        organisés par client pour faciliter la gestion de vos projets.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={`/orgs/${orgSlug}/clients/new`} className={buttonVariants({ size: "lg" })}>
          <Plus className="mr-2 size-5" />
          Créer un client
        </Link>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <FeatureCard
          step={1}
          title="Créer un client"
          description="Organisez vos schémas par client"
        />
        <FeatureCard
          step={2}
          title="Importer un PDF"
          description="Schéma automatiquement analysé"
        />
        <FeatureCard
          step={3}
          title="Simuler"
          description="Vérifiez la logique du circuit"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
        {step}
      </div>
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
