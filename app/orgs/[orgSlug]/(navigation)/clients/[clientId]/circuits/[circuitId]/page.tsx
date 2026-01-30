import { redirect } from "next/navigation";

export default async function CircuitDetailPage(
  props: PageProps<"/orgs/[orgSlug]/clients/[clientId]/circuits/[circuitId]">
) {
  const params = await props.params;
  // Redirect directly to simulate page
  redirect(
    `/orgs/${params.orgSlug}/clients/${params.clientId}/circuits/${params.circuitId}/simulate`
  );
}
