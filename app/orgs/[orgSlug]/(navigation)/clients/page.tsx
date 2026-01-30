import { buttonVariants } from "@/components/ui/button";
import { getClientsByOrganization } from "@/features/client/actions/client.action";
import { ClientList } from "@/features/client/components/client-list";
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
import { Plus } from "lucide-react";
import Link from "next/link";

export const generateMetadata = combineWithParentMetadata({
  title: "Clients",
  description: "Gérer vos clients et leurs schémas électriques",
});

export default async function ClientsPage(
  props: PageProps<"/orgs/[orgSlug]/clients">
) {
  const params = await props.params;
  const org = await getRequiredCurrentOrgCache();
  const clients = await getClientsByOrganization(org.id);

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Clients</LayoutTitle>
        <LayoutDescription>
          Gérez vos clients et leurs schémas électriques.
        </LayoutDescription>
      </LayoutHeader>
      <LayoutActions>
        <Link
          href={`/orgs/${params.orgSlug}/clients/new`}
          className={buttonVariants()}
        >
          <Plus className="mr-2 size-4" />
          Nouveau client
        </Link>
      </LayoutActions>
      <LayoutContent>
        <ClientList clients={clients} orgSlug={params.orgSlug} />
      </LayoutContent>
    </Layout>
  );
}
