import { getClientById } from "@/features/client/actions/client.action";
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
import { notFound } from "next/navigation";

export const generateMetadata = combineWithParentMetadata({
  title: "Importer un schéma",
  description: "Importer un schéma électrique",
});

export default async function ImportCircuitPage(
  props: PageProps<"/orgs/[orgSlug]/clients/[clientId]/circuits/import">
) {
  const params = await props.params;
  const org = await getRequiredCurrentOrgCache();
  const client = await getClientById(params.clientId, org.id);

  if (!client) {
    notFound();
  }

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Importer un schéma</LayoutTitle>
        <LayoutDescription>
          Importez un schéma électrique au format PDF pour {client.name}.
        </LayoutDescription>
      </LayoutHeader>
      <LayoutContent>
        <PdfImportForm orgSlug={params.orgSlug} clientId={params.clientId} />
      </LayoutContent>
    </Layout>
  );
}
