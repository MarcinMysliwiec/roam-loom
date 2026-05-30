import { AccountSettingsLayout } from "@saas/settings/components/AccountSettingsLayout";
import type { PropsWithChildren } from "react";

export default async function OrgAccountSettingsLayout({
	children,
	params,
}: PropsWithChildren<{
	params: Promise<{ organizationSlug: string }>;
}>) {
	const { organizationSlug } = await params;

	return (
		<AccountSettingsLayout
			basePath={`/app/${organizationSlug}/account/settings`}
		>
			{children}
		</AccountSettingsLayout>
	);
}
