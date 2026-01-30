import { Skeleton } from "@/components/ui/skeleton";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
} from "@/features/page/layout";

export default function ClientDetailLoading() {
  return (
    <Layout>
      <LayoutHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </LayoutHeader>
      <LayoutContent>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </LayoutContent>
    </Layout>
  );
}
