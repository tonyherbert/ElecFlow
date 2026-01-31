import { getClientsByOrganization } from "@/features/client/actions/client.action";
import {
  getCircuitById,
  getCircuitVersions,
  getCircuitWithClientById,
} from "@/features/circuit-simulator/actions/circuit.action";
import { ClientAssignment } from "@/features/circuit-simulator/components/client-assignment";
import { SimulationPanel } from "@/features/circuit-simulator/components/simulation-panel";
import { VersionSwitcher } from "@/features/circuit-simulator/components/version-switcher";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { combineWithParentMetadata } from "@/lib/metadata";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { notFound } from "next/navigation";

export const generateMetadata = combineWithParentMetadata({
  title: "Simuler le circuit",
  description: "Executer une simulation sur le circuit electrique",
});

export default async function SimulateCircuitPage(
  props: PageProps<"/orgs/[orgSlug]/circuits/[circuitId]/simulate">
) {
  const params = await props.params;
  const org = await getRequiredCurrentOrgCache();

  const [circuit, circuitWithClient, versions, clients] = await Promise.all([
    getCircuitById(params.circuitId, org.id),
    getCircuitWithClientById(params.circuitId, org.id),
    getCircuitVersions(params.circuitId, org.id),
    getClientsByOrganization(org.id),
  ]);

  if (!circuit || !circuitWithClient) {
    notFound();
  }

  return (
    <Layout size="lg">
      <LayoutHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <LayoutTitle>{circuit.name}</LayoutTitle>
          <div className="flex items-center gap-3">
            <ClientAssignment
              circuitId={params.circuitId}
              currentClientId={circuitWithClient.clientId}
              currentClientName={circuitWithClient.clientName}
              clients={clients.map((c) => ({ id: c.id, name: c.name }))}
            />
            <VersionSwitcher
              versions={versions}
              currentId={params.circuitId}
              orgSlug={params.orgSlug}
            />
          </div>
        </div>
        <LayoutDescription>
          Basculez les etats de commande et lancez la simulation pour verifier
          la logique du circuit.
        </LayoutDescription>
      </LayoutHeader>
      <LayoutContent>
        <SimulationPanel circuit={circuit} />
      </LayoutContent>
    </Layout>
  );
}
