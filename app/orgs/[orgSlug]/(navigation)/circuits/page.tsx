import { buttonVariants } from "@/components/ui/button";
import { getCircuitsByOrganization } from "@/features/circuit-simulator/actions/circuit.action";
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
import Link from "next/link";

export const generateMetadata = combineWithParentMetadata({
  title: "Circuits",
  description: "Gérer et simuler les circuits électriques",
});

export default async function CircuitsPage(
  props: PageProps<"/orgs/[orgSlug]/circuits">
) {
  const params = await props.params;
  const org = await getRequiredCurrentOrgCache();
  const circuits = await getCircuitsByOrganization(org.id);

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Circuits</LayoutTitle>
        <LayoutDescription>
          Importez et simulez des circuits électriques depuis vos schémas Formelec.
        </LayoutDescription>
      </LayoutHeader>
      <LayoutActions>
        <Link
          href={`/orgs/${params.orgSlug}/circuits/import`}
          className={buttonVariants()}
        >
          Importer un schéma
        </Link>
      </LayoutActions>
      <LayoutContent>
        <CircuitList circuits={circuits} orgSlug={params.orgSlug} />
      </LayoutContent>
    </Layout>
  );
}
