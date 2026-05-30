import { PropertyForm } from "@saas/admin/component/properties/PropertyForm";
import { getAdminPath } from "@saas/admin/lib/links";
import { apiClient } from "@shared/lib/api-client";
import { Button } from "@ui/components/button";
import { ArrowLeftIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function EditPropertyPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ backTo?: string }>;
}) {
	const { id } = await params;
	const { backTo } = await searchParams;
	const t = await getTranslations();

	const res = await apiClient.admin.properties[":id"].$get({ param: { id } });
	const property = res.ok ? await res.json() : null;

	return (
		<div>
			<div className="mb-2 flex justify-start">
				<Button variant="link" size="sm" asChild className="px-0">
					<Link href={backTo ?? getAdminPath("/properties")}>
						<ArrowLeftIcon className="mr-1.5 size-4" />
						{t("admin.properties.backToList")}
					</Link>
				</Button>
			</div>
			<PropertyForm property={property ?? undefined} />
		</div>
	);
}
