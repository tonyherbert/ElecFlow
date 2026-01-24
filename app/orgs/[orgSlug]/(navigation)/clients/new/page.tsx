import { ClientForm } from "@/features/client/components/client-form";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { combineWithParentMetadata } from "@/lib/metadata";

export const generateMetadata = combineWithParentMetadata({
  title: "Nouveau client",
  description: "Créer un nouveau client",
});

export default async function NewClientPage(
  props: PageProps<"/orgs/[orgSlug]/clients/new">
) {
  const params = await props.params;

  return (
    <Layout size="sm">
      <LayoutHeader>
        <LayoutTitle>Nouveau client</LayoutTitle>
        <LayoutDescription>
          Créez un nouveau client pour organiser vos schémas électriques.
        </LayoutDescription>
      </LayoutHeader>
      <LayoutContent>
        <ClientForm orgSlug={params.orgSlug} />
      </LayoutContent>
    </Layout>
  );
}
