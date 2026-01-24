import { getClientById } from "@/features/client/actions/client.action";
import { ClientForm } from "@/features/client/components/client-form";
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
  title: "Modifier le client",
  description: "Modifier les informations du client",
});

export default async function EditClientPage(
  props: PageProps<"/orgs/[orgSlug]/clients/[clientId]/edit">
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
        <LayoutTitle>Modifier {client.name}</LayoutTitle>
        <LayoutDescription>
          Modifier les informations du client.
        </LayoutDescription>
      </LayoutHeader>
      <LayoutContent>
        <ClientForm
          orgSlug={params.orgSlug}
          mode="edit"
          defaultValues={{
            id: client.id,
            name: client.name,
            email: client.email ?? "",
            phone: client.phone ?? "",
            address: client.address ?? "",
            notes: client.notes ?? "",
          }}
        />
      </LayoutContent>
    </Layout>
  );
}
