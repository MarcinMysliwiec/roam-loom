import type { BookingStatus } from "@prisma/client";
import { db } from "../client";

type BookingFilters = {
	status?: BookingStatus;
	checkInFrom?: Date;
	checkInTo?: Date;
};

export async function getBookings({
	limit,
	offset,
	status,
	checkInFrom,
	checkInTo,
}: {
	limit: number;
	offset: number;
} & BookingFilters) {
	return db.booking.findMany({
		where: buildBookingWhere({ status, checkInFrom, checkInTo }),
		include: {
			property: { select: { id: true, name: true } },
			user: { select: { id: true, name: true, email: true } },
		},
		take: limit,
		skip: offset,
		orderBy: { createdAt: "desc" },
	});
}

export async function countBookings(filters: BookingFilters = {}) {
	return db.booking.count({ where: buildBookingWhere(filters) });
}

export async function getBookingById(id: string) {
	return db.booking.findUnique({
		where: { id },
		include: {
			property: true,
			user: { select: { id: true, name: true, email: true } },
		},
	});
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
	return db.booking.update({
		where: { id },
		data: { status },
	});
}

function buildBookingWhere({
	status,
	checkInFrom,
	checkInTo,
}: BookingFilters) {
	return {
		...(status ? { status } : {}),
		...(checkInFrom || checkInTo
			? {
					checkIn: {
						...(checkInFrom ? { gte: checkInFrom } : {}),
						...(checkInTo ? { lte: checkInTo } : {}),
					},
				}
			: {}),
	};
}
