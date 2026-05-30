"use client";

import {
	useAdminBookingsQuery,
	useAdminPropertiesQuery,
} from "@saas/admin/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { CalendarIcon, BuildingIcon, ClockIcon } from "lucide-react";
import { useTranslations } from "next-intl";

function StatCard({
	title,
	value,
	icon: Icon,
	loading,
}: {
	title: string;
	value: number | undefined;
	icon: React.ElementType;
	loading: boolean;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="font-medium text-sm">{title}</CardTitle>
				<Icon className="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p className="font-bold text-3xl">
					{loading ? (
						<span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
					) : (
						(value ?? 0).toLocaleString()
					)}
				</p>
			</CardContent>
		</Card>
	);
}

export function AdminDashboard() {
	const t = useTranslations();

	const { data: bookingsData, isLoading: bookingsLoading } =
		useAdminBookingsQuery({ itemsPerPage: 1, currentPage: 1 });

	const { data: pendingData, isLoading: pendingLoading } =
		useAdminBookingsQuery({
			itemsPerPage: 1,
			currentPage: 1,
			status: "PENDING",
		});

	const { data: propertiesData, isLoading: propertiesLoading } =
		useAdminPropertiesQuery({
			itemsPerPage: 1,
			currentPage: 1,
			searchTerm: "",
		});

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<StatCard
				title={t("admin.dashboard.totalBookings")}
				value={bookingsData?.total}
				icon={CalendarIcon}
				loading={bookingsLoading}
			/>
			<StatCard
				title={t("admin.dashboard.pendingBookings")}
				value={pendingData?.total}
				icon={ClockIcon}
				loading={pendingLoading}
			/>
			<StatCard
				title={t("admin.dashboard.totalProperties")}
				value={propertiesData?.total}
				icon={BuildingIcon}
				loading={propertiesLoading}
			/>
		</div>
	);
}
