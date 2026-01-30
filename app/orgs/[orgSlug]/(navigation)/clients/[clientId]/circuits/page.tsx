import { redirect } from "next/navigation";

export default async function CircuitsRedirectPage(
  props: PageProps<"/orgs/[orgSlug]/clients/[clientId]/circuits">
) {
  const params = await props.params;
  // Redirect to client page which shows the circuits list
  redirect(`/orgs/${params.orgSlug}/clients/${params.clientId}`);
}
