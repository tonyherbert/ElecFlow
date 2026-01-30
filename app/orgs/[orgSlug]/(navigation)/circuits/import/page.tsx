import { getClientsByOrganization } from "@/features/client/actions/client.action";
import { PdfImportForm } from "@/features/circuit-simulator/components/pdf-import-form";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { combineWithParentMetadata } from "@/lib/metadata";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";

export const generateMetadata = combineWithParentMetadata({
  title: "Importer un schéma",
  description: "Importer un schéma électrique au format Formelec",
});

export default async function ImportCircuitPage(
  props: PageProps<"/orgs/[orgSlug]/circuits/import">
) {
  const params = await props.params;
  const org = await getRequiredCurrentOrgCache();
  const clientsData = await getClientsByOrganization(org.id);

  // Map to simpler client objects
  const clients = clientsData.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Importer un schéma</LayoutTitle>
        <LayoutDescription>
          Importez un schéma électrique au format Formelec (PDF).
        </LayoutDescription>
      </LayoutHeader>
      <LayoutContent>
        <PdfImportForm orgSlug={params.orgSlug} clients={clients} />
      </LayoutContent>
    </Layout>
  );
}
