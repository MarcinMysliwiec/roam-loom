import { AccountSettingsLayout } from "@saas/settings/components/AccountSettingsLayout";
import type { PropsWithChildren } from "react";

export default function SettingsLayout({ children }: PropsWithChildren) {
	return (
		<AccountSettingsLayout basePath="/app/settings">
			{children}
		</AccountSettingsLayout>
	);
}
