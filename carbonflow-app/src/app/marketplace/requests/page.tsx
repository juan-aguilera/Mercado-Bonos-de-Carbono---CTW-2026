import { redirect } from "next/navigation";

export default function MarketplaceRequestsPage() {
  redirect("/marketplace?view=requests");
}
