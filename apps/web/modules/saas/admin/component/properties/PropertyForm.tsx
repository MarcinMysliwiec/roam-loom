"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	adminPropertiesQueryKey,
	useAdminOrganizationsQuery,
	useCreatePropertyMutation,
	useUpdatePropertyMutation,
} from "@saas/admin/lib/api";
import { getAdminPath } from "@saas/admin/lib/links";
import { useRouter } from "@shared/hooks/router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Textarea } from "@ui/components/textarea";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";

const propertyFormSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	address: z.string().min(1),
	basePrice: z.coerce.number().positive(),
	organizationId: z.string().min(1),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

type ExistingProperty = {
	id: string;
	name: string;
	description?: string | null;
	address: string;
	basePrice: string | number;
	organizationId: string;
};

export function PropertyForm({
	property,
}: {
	property?: ExistingProperty;
}) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();

	const createProperty = useCreatePropertyMutation();
	const updateProperty = useUpdatePropertyMutation();

	const { data: orgsData } = useAdminOrganizationsQuery({
		itemsPerPage: 100,
		currentPage: 1,
		searchTerm: "",
	});

	const form = useForm<PropertyFormValues>({
		resolver: zodResolver(propertyFormSchema),
		defaultValues: {
			name: property?.name ?? "",
			description: property?.description ?? "",
			address: property?.address ?? "",
			basePrice: property ? Number(property.basePrice) : 0,
			organizationId: property?.organizationId ?? "",
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		try {
			if (property) {
				await updateProperty.mutateAsync({ id: property.id, ...values });
			} else {
				const created = await createProperty.mutateAsync(values);
				queryClient.invalidateQueries({ queryKey: adminPropertiesQueryKey });
				router.replace(
					getAdminPath(`/properties/${(created as { id: string }).id}`),
				);
				toast.success(t("admin.properties.form.notifications.success"));
				return;
			}
			queryClient.invalidateQueries({ queryKey: adminPropertiesQueryKey });
			toast.success(t("admin.properties.form.notifications.success"));
		} catch {
			toast.error(t("admin.properties.form.notifications.error"));
		}
	});

	const isPending =
		createProperty.isPending || updateProperty.isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{property
						? t("admin.properties.form.updateTitle")
						: t("admin.properties.form.createTitle")}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("admin.properties.form.name")}
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("admin.properties.form.description")}
									</FormLabel>
									<FormControl>
										<Textarea rows={3} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("admin.properties.form.address")}
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="basePrice"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("admin.properties.form.basePrice")}
									</FormLabel>
									<FormControl>
										<Input type="number" min={0} step={0.01} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="organizationId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("admin.properties.form.organization")}
									</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{orgsData?.organizations.map((org) => (
												<SelectItem key={org.id} value={org.id}>
													{org.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end">
							<Button type="submit" loading={isPending}>
								{t("admin.properties.form.save")}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
