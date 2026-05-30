export function getAccountSettingsPath(organizationSlug?: string | null) {
	return organizationSlug
		? `/app/${organizationSlug}/account/settings/general`
		: "/app/settings/general";
}
