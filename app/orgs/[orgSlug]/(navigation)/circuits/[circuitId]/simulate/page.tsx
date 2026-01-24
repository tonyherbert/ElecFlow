import { buttonVariants } from "@/components/ui/button";
import { getCircuitById } from "@/features/circuit-simulator/actions/circuit.action";
import { SimulationPanel } from "@/features/circuit-simulator/components/simulation-panel";
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
import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const generateMetadata = combineWithParentMetadata({
  title: "Simuler le circuit",
  description: "Exécuter une simulation sur le circuit électrique",
});

export default async function SimulateCircuitPage(
  props: PageProps<"/orgs/[orgSlug]/circuits/[circuitId]/simulate">
) {
  const params = await props.params;
  const org = await getRequiredCurrentOrgCache();
  const circuit = await getCircuitById(params.circuitId, org.id);

  if (!circuit) {
    notFound();
  }

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Simulation : {circuit.name}</LayoutTitle>
        <LayoutDescription>
          Basculez les états de commande et lancez la simulation pour vérifier la logique du circuit.
        </LayoutDescription>
      </LayoutHeader>
      <LayoutActions>
        <Link
          href={`/orgs/${params.orgSlug}/circuits/${params.circuitId}`}
          className={buttonVariants({ variant: "outline" })}
        >
          <Pencil className="mr-1 h-4 w-4" />
          Modifier
        </Link>
      </LayoutActions>
      <LayoutContent>
        <SimulationPanel circuit={circuit} />
      </LayoutContent>
    </Layout>
  );
}
