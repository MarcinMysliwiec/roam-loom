import { db } from "../client";

export async function getProperties({
	limit,
	offset,
	query,
	organizationId,
}: {
	limit: number;
	offset: number;
	query?: string;
	organizationId?: string;
}) {
	return db.property.findMany({
		where: {
			...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
			...(organizationId ? { organizationId } : {}),
		},
		include: {
			_count: {
				select: { bookings: true, reviews: true },
			},
		},
		take: limit,
		skip: offset,
		orderBy: { createdAt: "desc" },
	});
}

export async function countProperties({
	query,
	organizationId,
}: {
	query?: string;
	organizationId?: string;
} = {}) {
	return db.property.count({
		where: {
			...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
			...(organizationId ? { organizationId } : {}),
		},
	});
}

export async function getPropertyById(id: string) {
	return db.property.findUnique({
		where: { id },
		include: {
			organization: true,
			_count: { select: { bookings: true, reviews: true } },
		},
	});
}

export async function createProperty(data: {
	name: string;
	description?: string | null;
	address: string;
	images?: string[];
	basePrice: number;
	organizationId: string;
}) {
	return db.property.create({
		data: {
			name: data.name,
			description: data.description,
			address: data.address,
			images: data.images ?? [],
			basePrice: data.basePrice,
			organizationId: data.organizationId,
		},
	});
}

export async function updateProperty(
	id: string,
	data: {
		name?: string;
		description?: string | null;
		address?: string;
		images?: string[];
		basePrice?: number;
		organizationId?: string;
	},
) {
	return db.property.update({
		where: { id },
		data,
	});
}

export async function deleteProperty(id: string) {
	return db.property.delete({ where: { id } });
}
