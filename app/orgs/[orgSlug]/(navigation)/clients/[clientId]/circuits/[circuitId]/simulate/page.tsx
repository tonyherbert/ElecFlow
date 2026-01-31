import {
  getCircuitById,
  getCircuitVersions,
} from "@/features/circuit-simulator/actions/circuit.action";
import { SimulationPanel } from "@/features/circuit-simulator/components/simulation-panel";
import { VersionSwitcher } from "@/features/circuit-simulator/components/simulation-version-dropdown";
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
  props: PageProps<"/orgs/[orgSlug]/clients/[clientId]/circuits/[circuitId]/simulate">
) {
  const params = await props.params;
  const org = await getRequiredCurrentOrgCache();

  const [circuit, versions] = await Promise.all([
    getCircuitById(params.circuitId, org.id),
    getCircuitVersions(params.circuitId, org.id),
  ]);

  if (!circuit) {
    notFound();
  }

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <LayoutTitle>{circuit.name}</LayoutTitle>
          <VersionSwitcher
            versions={versions}
            currentId={params.circuitId}
            orgSlug={params.orgSlug}
            clientId={params.clientId}
          />
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
