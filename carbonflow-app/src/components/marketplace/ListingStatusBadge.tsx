import type { ProjectStatus, PublicationStatus } from "@/lib/marketplace/types";

export function ListingStatusBadge({
  status,
}: {
  status: ProjectStatus | PublicationStatus | string;
}) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-earth-sandy text-primary font-data text-label-caps">
      {status}
    </span>
  );
}
