import { apiClient } from "@shared/lib/api-client";
import { createQueryKeyWithParams } from "@shared/lib/query-client";
import {
	keepPreviousData,
	useMutation,
	useQuery,
} from "@tanstack/react-query";

/*
 * Admin users
 */
type FetchAdminUsersParams = {
	itemsPerPage: number;
	currentPage: number;
	searchTerm: string;
};

export const adminUsersQueryKey = ["admin", "users"];
export const fetchAdminUsers = async ({
	itemsPerPage,
	currentPage,
	searchTerm,
}: FetchAdminUsersParams) => {
	const response = await apiClient.admin.users.$get({
		query: {
			limit: itemsPerPage.toString(),
			offset: ((currentPage - 1) * itemsPerPage).toString(),
			query: searchTerm,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch users");
	}

	return response.json();
};
export const useAdminUsersQuery = (params: FetchAdminUsersParams) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminUsersQueryKey, params),
		queryFn: () => fetchAdminUsers(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

/*
 * Admin organizations
 */
type FetchAdminOrganizationsParams = {
	itemsPerPage: number;
	currentPage: number;
	searchTerm: string;
};
export const adminOrganizationsQueryKey = ["admin", "organizations"];
export const fetchAdminOrganizations = async ({
	itemsPerPage,
	currentPage,
	searchTerm,
}: FetchAdminOrganizationsParams) => {
	const response = await apiClient.admin.organizations.$get({
		query: {
			limit: itemsPerPage.toString(),
			offset: ((currentPage - 1) * itemsPerPage).toString(),
			query: searchTerm,
		},
	});

	if (!response.ok) {
		throw new Error("Could not fetch organizations");
	}

	return response.json();
};
export const useAdminOrganizationsQuery = (
	params: FetchAdminOrganizationsParams,
) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminOrganizationsQueryKey, params),
		queryFn: () => fetchAdminOrganizations(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

/*
 * Admin bookings
 */
type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
type FetchAdminBookingsParams = {
	itemsPerPage: number;
	currentPage: number;
	status?: BookingStatus;
};

export const adminBookingsQueryKey = ["admin", "bookings"];
export const fetchAdminBookings = async ({
	itemsPerPage,
	currentPage,
	status,
}: FetchAdminBookingsParams) => {
	const response = await apiClient.admin.bookings.$get({
		query: {
			limit: itemsPerPage.toString(),
			offset: ((currentPage - 1) * itemsPerPage).toString(),
			...(status ? { status } : {}),
		},
	});
	if (!response.ok) throw new Error("Could not fetch bookings");
	return response.json();
};
export const useAdminBookingsQuery = (params: FetchAdminBookingsParams) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminBookingsQueryKey, params),
		queryFn: () => fetchAdminBookings(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};
export const useUpdateBookingStatusMutation = () => {
	return useMutation({
		mutationFn: async ({
			id,
			status,
		}: {
			id: string;
			status: "PENDING" | "CONFIRMED" | "CANCELLED";
		}) => {
			const response = await apiClient.admin.bookings[":id"].status.$patch({
				param: { id },
				json: { status },
			});
			if (!response.ok) throw new Error("Could not update booking status");
			return response.json();
		},
	});
};

/*
 * Admin properties
 */
type FetchAdminPropertiesParams = {
	itemsPerPage: number;
	currentPage: number;
	searchTerm: string;
};
type PropertyInput = {
	name: string;
	description?: string;
	address: string;
	basePrice: number;
	organizationId: string;
};

export const adminPropertiesQueryKey = ["admin", "properties"];
export const fetchAdminProperties = async ({
	itemsPerPage,
	currentPage,
	searchTerm,
}: FetchAdminPropertiesParams) => {
	const response = await apiClient.admin.properties.$get({
		query: {
			limit: itemsPerPage.toString(),
			offset: ((currentPage - 1) * itemsPerPage).toString(),
			query: searchTerm,
		},
	});
	if (!response.ok) throw new Error("Could not fetch properties");
	return response.json();
};
export const useAdminPropertiesQuery = (params: FetchAdminPropertiesParams) => {
	return useQuery({
		queryKey: createQueryKeyWithParams(adminPropertiesQueryKey, params),
		queryFn: () => fetchAdminProperties(params),
		retry: false,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};
export const useCreatePropertyMutation = () => {
	return useMutation({
		mutationFn: async (data: PropertyInput) => {
			const response = await apiClient.admin.properties.$post({ json: data });
			if (!response.ok) throw new Error("Could not create property");
			return response.json();
		},
	});
};
export const useUpdatePropertyMutation = () => {
	return useMutation({
		mutationFn: async ({ id, ...data }: PropertyInput & { id: string }) => {
			const response = await apiClient.admin.properties[":id"].$put({
				param: { id },
				json: data,
			});
			if (!response.ok) throw new Error("Could not update property");
			return response.json();
		},
	});
};
export const useDeletePropertyMutation = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.admin.properties[":id"].$delete({
				param: { id },
			});
			if (!response.ok) throw new Error("Could not delete property");
		},
	});
};
