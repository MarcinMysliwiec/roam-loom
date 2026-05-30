import { getOrganizationMembership } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { PropertyList } from "@saas/admin/component/properties/PropertyList";

export default async function AdminPropertiesPage() {
	const session = await getSession();
	let canManage = session?.user?.role === "admin";

	if (!canManage && session?.session) {
		const activeOrganizationId = (
			session.session as typeof session.session & {
				activeOrganizationId?: string;
			}
		).activeOrganizationId;

		if (activeOrganizationId) {
			const membership = await getOrganizationMembership(
				activeOrganizationId,
				session.user.id,
			);
			canManage = ["owner", "admin"].includes(membership?.role ?? "");
		}
	}

	return <PropertyList canManage={canManage} />;
}
