"use client";

import {
	adminPropertiesQueryKey,
	useAdminPropertiesQuery,
	useDeletePropertyMutation,
} from "@saas/admin/lib/api";
import { getAdminPath } from "@saas/admin/lib/links";
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
import { Card } from "@ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Input } from "@ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/components/table";
import { EditIcon, MoreVerticalIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { withQuery } from "ufo";

const ITEMS_PER_PAGE = 10;

type Property = {
	id: string;
	name: string;
	address: string;
	basePrice: string | number;
	_count: { bookings: number; reviews: number };
};

export function PropertyList() {
	const t = useTranslations();
	const { confirm } = useConfirmationAlert();
	const queryClient = useQueryClient();
	const deleteProperty = useDeletePropertyMutation();

	const [currentPage, setCurrentPage] = useQueryState(
		"currentPage",
		parseAsInteger.withDefault(1),
	);
	const [searchTerm, setSearchTerm] = useQueryState(
		"query",
		parseAsString.withDefault(""),
	);
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounceValue(
		searchTerm,
		300,
		{ leading: true, trailing: false },
	);

	useEffect(() => {
		setDebouncedSearchTerm(searchTerm);
	}, [searchTerm]);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchTerm]);

	const { data, isLoading } = useAdminPropertiesQuery({
		itemsPerPage: ITEMS_PER_PAGE,
		currentPage,
		searchTerm: debouncedSearchTerm,
	});

	const getEditPath = (id: string) => {
		const searchParams = new URLSearchParams(window.location.search);
		return withQuery(getAdminPath(`/properties/${id}`), {
			backTo: `${window.location.pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`,
		});
	};

	const handleDelete = (id: string) => {
		confirm({
			title: t("admin.properties.confirmDelete.title"),
			message: t("admin.properties.confirmDelete.message"),
			confirmLabel: t("admin.properties.confirmDelete.confirm"),
			destructive: true,
			onConfirm: () =>
				toast.promise(deleteProperty.mutateAsync(id), {
					loading: t("admin.properties.deleteProperty.deleting"),
					success: () => {
						queryClient.invalidateQueries({
							queryKey: adminPropertiesQueryKey,
						});
						return t("admin.properties.deleteProperty.deleted");
					},
					error: t("admin.properties.deleteProperty.notDeleted"),
				}),
		});
	};

	const columns: ColumnDef<Property>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: () => (
					<span className="font-medium text-xs uppercase opacity-60">
						Property
					</span>
				),
				cell: ({ row }) => (
					<div className="leading-tight">
						<Link
							href={getEditPath(row.original.id)}
							className="block font-bold hover:underline"
						>
							{row.original.name}
						</Link>
						<small className="text-muted-foreground">
							{row.original.address}
						</small>
					</div>
				),
			},
			{
				accessorKey: "basePrice",
				header: () => (
					<span className="font-medium text-xs uppercase opacity-60">
						Base price
					</span>
				),
				cell: ({ row }) =>
					`$${Number(row.original.basePrice).toFixed(2)} / night`,
			},
			{
				accessorKey: "bookings",
				header: () => (
					<span className="font-medium text-xs uppercase opacity-60">
						Bookings
					</span>
				),
				cell: ({ row }) => row.original._count?.bookings ?? 0,
			},
			{
				accessorKey: "actions",
				header: "",
				cell: ({ row }) => (
					<div className="flex justify-end">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size="icon" variant="ghost">
									<MoreVerticalIcon className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem asChild>
									<Link href={getEditPath(row.original.id)}>
										<EditIcon className="mr-2 size-4" />
										{t("admin.properties.edit")}
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleDelete(row.original.id)}
									className="text-destructive focus:text-destructive"
								>
									<TrashIcon className="mr-2 size-4" />
									{t("admin.properties.delete")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				),
			},
		],
		[],
	);

	const properties = useMemo(
		() => (data?.properties as Property[]) ?? [],
		[data],
	);

	const table = useReactTable({
		data: properties,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
	});

	return (
		<Card className="p-6">
			<div className="mb-4 flex items-center justify-between gap-4">
				<h2 className="font-semibold text-2xl">
					{t("admin.properties.title")}
				</h2>
				<Button asChild>
					<Link href={getAdminPath("/properties/new")}>
						<PlusIcon className="mr-1.5 size-4" />
						{t("admin.properties.create")}
					</Link>
				</Button>
			</div>

			<Input
				type="search"
				placeholder={t("admin.properties.search")}
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="mb-4"
			/>

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
								<TableRow key={row.id} className="group">
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="py-3"
										>
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
											{t("admin.properties.loading")}
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
