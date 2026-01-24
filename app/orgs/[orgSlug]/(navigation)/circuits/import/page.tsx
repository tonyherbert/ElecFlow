import { PdfImportForm } from "@/features/circuit-simulator/components/pdf-import-form";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { combineWithParentMetadata } from "@/lib/metadata";

export const generateMetadata = combineWithParentMetadata({
  title: "Importer PDF",
  description: "Importer des circuits électriques depuis des schémas PDF Formelec",
});

export default async function ImportCircuitPage(
  props: PageProps<"/orgs/[orgSlug]/circuits/import">
) {
  const params = await props.params;

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Importer un schéma PDF</LayoutTitle>
        <LayoutDescription>
          Importez un schéma électrique au format Formelec pour créer
          automatiquement un circuit vérifiable.
        </LayoutDescription>
      </LayoutHeader>
      <LayoutContent>
        <PdfImportForm orgSlug={params.orgSlug} />
      </LayoutContent>
    </Layout>
  );
}
