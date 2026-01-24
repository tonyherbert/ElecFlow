import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientById } from "@/features/client/actions/client.action";
import { getCircuitsByClient } from "@/features/circuit-simulator/actions/circuit.action";
import { CircuitList } from "@/features/circuit-simulator/components/circuit-list";
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
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const generateMetadata = combineWithParentMetadata({
  title: "Détails client",
  description: "Voir les détails et circuits du client",
});

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

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>{client.name}</LayoutTitle>
        <LayoutDescription>
          Schémas électriques et informations du client
        </LayoutDescription>
      </LayoutHeader>
      <LayoutActions>
        <Link
          href={`/orgs/${params.orgSlug}/clients/${params.clientId}/circuits/import`}
          className={buttonVariants()}
        >
          Importer un schéma
        </Link>
      </LayoutActions>
      <LayoutContent>
        <div className="flex flex-col gap-6">
          {/* Client Info Card */}
          {(client.email || client.phone || client.address || client.notes) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground flex flex-col gap-2 text-sm">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-4" />
                      <a href={`mailto:${client.email}`} className="hover:underline">
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4" />
                      <a href={`tel:${client.phone}`} className="hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      <span>{client.address}</span>
                    </div>
                  )}
                  {client.notes && (
                    <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                      {client.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Circuits Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              Circuits ({circuits.length})
            </h2>
            <CircuitList
              circuits={circuits}
              orgSlug={params.orgSlug}
              clientId={params.clientId}
            />
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
}
