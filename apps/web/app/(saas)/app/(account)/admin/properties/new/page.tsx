import { PropertyForm } from "@saas/admin/component/properties/PropertyForm";
import { getAdminPath } from "@saas/admin/lib/links";
import { Button } from "@ui/components/button";
import { ArrowLeftIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NewPropertyPage() {
	const t = await getTranslations();

	return (
		<div>
			<div className="mb-2 flex justify-start">
				<Button variant="link" size="sm" asChild className="px-0">
					<Link href={getAdminPath("/properties")}>
						<ArrowLeftIcon className="mr-1.5 size-4" />
						{t("admin.properties.backToList")}
					</Link>
				</Button>
			</div>
			<PropertyForm />
		</div>
	);
}
