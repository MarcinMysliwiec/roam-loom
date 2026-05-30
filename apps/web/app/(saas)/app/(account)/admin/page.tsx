import { AdminDashboard } from "@saas/admin/component/AdminDashboard";
import { getTranslations } from "next-intl/server";

export default async function AdminDashboardPage() {
	const t = await getTranslations();

	return (
		<div>
			<h2 className="mb-6 font-semibold text-2xl">
				{t("admin.dashboard.title")}
			</h2>
			<AdminDashboard />
		</div>
	);
}
