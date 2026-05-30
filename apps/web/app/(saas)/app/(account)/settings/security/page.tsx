import { config } from "@repo/config";
import { userAccountQueryKey } from "@saas/auth/lib/api";
import {
	getSession,
	getUserAccounts,
} from "@saas/auth/lib/server";
import { ActiveSessionsBlock } from "@saas/settings/components/ActiveSessionsBlock";
import { ChangePasswordForm } from "@saas/settings/components/ChangePassword";
import { ConnectedAccountsBlock } from "@saas/settings/components/ConnectedAccountsBlock";
import { SetPasswordForm } from "@saas/settings/components/SetPassword";
import { TwoFactorBlock } from "@saas/settings/components/TwoFactorBlock";
import { SettingsList } from "@saas/shared/components/SettingsList";
import { getServerQueryClient } from "@shared/lib/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("settings.account.security.title"),
	};
}

export default async function AccountSettingsPage() {
	const session = await getSession();

	if (!session) {
		return redirect("/auth/login");
	}

	const userAccounts = await getUserAccounts();

	const userHasPassword = userAccounts?.some(
		(account) => account.providerId === "credential",
	);

	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery({
		queryKey: userAccountQueryKey,
		queryFn: () => getUserAccounts(),
	});

	return (
		<SettingsList>
			{config.auth.enablePasswordLogin &&
				(userHasPassword ? (
					<ChangePasswordForm />
				) : (
					<SetPasswordForm />
				))}
			{config.auth.enableSocialLogin && <ConnectedAccountsBlock />}
			{config.auth.enableTwoFactor && <TwoFactorBlock />}
			<ActiveSessionsBlock />
		</SettingsList>
	);
}
