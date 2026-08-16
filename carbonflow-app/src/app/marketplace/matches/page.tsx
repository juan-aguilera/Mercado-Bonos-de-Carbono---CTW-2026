import { redirect } from "next/navigation";

export default function MarketplaceMatchesPage() {
  redirect("/marketplace?view=matches");
}
