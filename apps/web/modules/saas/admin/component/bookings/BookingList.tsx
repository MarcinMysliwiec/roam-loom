"use client";

import {
	adminBookingsQueryKey,
	useAdminBookingsQuery,
	useUpdateBookingStatusMutation,
} from "@saas/admin/lib/api";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { Pagination } from "@saas/shared/components/Pagination";
import { Spinner } from "@shared/components/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@ui/components/button";
import { Badge } from "@ui/components/badge";
import { Card } from "@ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/components/table";
import { CheckCircleIcon, MoreVerticalIcon, XCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

type Booking = {
	id: string;
	checkIn: string;
	checkOut: string;
	status: "PENDING" | "CONFIRMED" | "CANCELLED";
	totalPrice: string | number;
	property: { id: string; name: string } | null;
	user: { id: string; name: string; email: string } | null;
};

const statusBadgeVariant = (
	status: Booking["status"],
): "success" | "warning" | "error" => {
	if (status === "CONFIRMED") return "success";
	if (status === "PENDING") return "warning";
	return "error";
};

export function BookingList() {
	const t = useTranslations();
	const { confirm } = useConfirmationAlert();
	const queryClient = useQueryClient();
	const updateStatus = useUpdateBookingStatusMutation();

	const [currentPage, setCurrentPage] = useQueryState(
		"currentPage",
		parseAsInteger.withDefault(1),
	);
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);

	const { data, isLoading } = useAdminBookingsQuery({
		itemsPerPage: ITEMS_PER_PAGE,
		currentPage,
		status: (statusFilter as Booking["status"]) || undefined,
	});

	useEffect(() => {
		setCurrentPage(1);
	}, [statusFilter]);

	const handleUpdateStatus = async (
		id: string,
		status: "CONFIRMED" | "CANCELLED",
	) => {
		const isConfirm = status === "CONFIRMED";
		confirm({
			title: t(
				isConfirm
					? "admin.bookings.confirmBooking.title"
					: "admin.bookings.cancelBooking.title",
			),
			message: t(
				isConfirm
					? "admin.bookings.confirmBooking.message"
					: "admin.bookings.cancelBooking.message",
			),
			confirmLabel: t(
				isConfirm
					? "admin.bookings.confirmBooking.confirm"
					: "admin.bookings.cancelBooking.confirm",
			),
			destructive: !isConfirm,
			onConfirm: () =>
				toast.promise(updateStatus.mutateAsync({ id, status }), {
					success: () => {
						queryClient.invalidateQueries({
							queryKey: adminBookingsQueryKey,
						});
						return t(
							isConfirm
								? "admin.bookings.updateStatus.confirmed"
								: "admin.bookings.updateStatus.cancelled",
						);
					},
					error: t("admin.bookings.updateStatus.error"),
				}),
		});
	};

	const columns: ColumnDef<Booking>[] = useMemo(
		() => [
			{
				accessorKey: "property",
				header: () => (
					<span className="font-medium text-xs uppercase opacity-60">
						Property
					</span>
				),
				cell: ({ row }) => (
					<span className="font-medium">
						{row.original.property?.name ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "user",
				header: () => (
					<span className="font-medium text-xs uppercase opacity-60">
						Guest
					</span>
				),
				cell: ({ row }) => (
					<div className="leading-tight">
						<p className="font-medium">{row.original.user?.name ?? "—"}</p>
						<p className="text-muted-foreground text-xs">
							{row.original.user?.email}
						</p>
					</div>
				),
			},
			{
				accessorKey: "checkIn",
				header: () => (
					<span className="font-medium text-xs uppercase opacity-60">
						Check-in
					</span>
				),
				cell: ({ row }) =>
					new Date(row.original.checkIn).toLocaleDateString(),
			},
			{
				accessorKey: "checkOut",
				header: () => (
					<span className="font-medium text-xs uppercase opacity-60">
						Check-out
					</span>
				),
				cell: ({ row }) =>
					new Date(row.original.checkOut).toLocaleDateString(),
			},
			{
				accessorKey: "status",
				header: () => (
					<span className="font-medium text-xs uppercase opacity-60">
						Status
					</span>
				),
				cell: ({ row }) => (
					<Badge status={statusBadgeVariant(row.original.status)}>
						{t(`admin.bookings.status.${row.original.status}`)}
					</Badge>
				),
			},
			{
				accessorKey: "totalPrice",
				header: () => (
					<span className="font-medium text-xs uppercase opacity-60">
						Total
					</span>
				),
				cell: ({ row }) => `$${Number(row.original.totalPrice).toFixed(2)}`,
			},
			{
				accessorKey: "actions",
				header: "",
				cell: ({ row }) => {
					const { id, status } = row.original;
					return (
						<div className="flex justify-end">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size="icon" variant="ghost">
										<MoreVerticalIcon className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									{status === "PENDING" && (
										<DropdownMenuItem
											onClick={() =>
												handleUpdateStatus(id, "CONFIRMED")
											}
										>
											<CheckCircleIcon className="mr-2 size-4 text-emerald-500" />
											{t("admin.bookings.confirm")}
										</DropdownMenuItem>
									)}
									{status !== "CANCELLED" && (
										<DropdownMenuItem
											onClick={() =>
												handleUpdateStatus(id, "CANCELLED")
											}
											className="text-destructive focus:text-destructive"
										>
											<XCircleIcon className="mr-2 size-4" />
											{t("admin.bookings.cancel")}
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[data],
	);

	const bookings = useMemo(() => (data?.bookings as Booking[]) ?? [], [data]);

	const table = useReactTable({
		data: bookings,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
	});

	return (
		<Card className="p-6">
			<div className="mb-4 flex items-center justify-between gap-4">
				<h2 className="font-semibold text-2xl">
					{t("admin.bookings.title")}
				</h2>
				<Select
					value={statusFilter || "all"}
					onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
				>
					<SelectTrigger className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All statuses</SelectItem>
						<SelectItem value="PENDING">
							{t("admin.bookings.status.PENDING")}
						</SelectItem>
						<SelectItem value="CONFIRMED">
							{t("admin.bookings.status.CONFIRMED")}
						</SelectItem>
						<SelectItem value="CANCELLED">
							{t("admin.bookings.status.CANCELLED")}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{table.getHeaderGroups().map((hg) =>
								hg.headers.map((header) => (
									<TableHead key={header.id}>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
									</TableHead>
								)),
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="py-3">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{isLoading ? (
										<div className="flex h-full items-center justify-center">
											<Spinner className="mr-2 size-4 text-primary" />
											{t("admin.bookings.loading")}
										</div>
									) : (
										<p>No results.</p>
									)}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{!!data?.total && data.total > ITEMS_PER_PAGE && (
				<Pagination
					className="mt-4"
					totalItems={data.total}
					itemsPerPage={ITEMS_PER_PAGE}
					currentPage={currentPage}
					onChangeCurrentPage={setCurrentPage}
				/>
			)}
		</Card>
	);
}
