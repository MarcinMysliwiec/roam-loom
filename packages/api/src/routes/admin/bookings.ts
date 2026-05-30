import {
	countBookings,
	getBookingById,
	getBookings,
	updateBookingStatus,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin";

const bookingStatusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);

export const bookingsRouter = new Hono()
	.basePath("/bookings")
	.use(adminMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				status: bookingStatusSchema.optional(),
				checkInFrom: z.string().optional(),
				checkInTo: z.string().optional(),
				limit: z.string().optional().default("10").transform(Number),
				offset: z.string().optional().default("0").transform(Number),
			}),
		),
		describeRoute({
			summary: "Get all bookings",
			tags: ["Administration"],
		}),
		async (c) => {
			const { status, checkInFrom, checkInTo, limit, offset } =
				c.req.valid("query");

			const filters = {
				status: status as "PENDING" | "CONFIRMED" | "CANCELLED" | undefined,
				checkInFrom: checkInFrom ? new Date(checkInFrom) : undefined,
				checkInTo: checkInTo ? new Date(checkInTo) : undefined,
			};

			const [bookings, total] = await Promise.all([
				getBookings({ limit, offset, ...filters }),
				countBookings(filters),
			]);

			return c.json({ bookings, total });
		},
	)
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const booking = await getBookingById(id);

		if (!booking) {
			throw new HTTPException(404);
		}

		return c.json(booking);
	})
	.patch(
		"/:id/status",
		validator(
			"json",
			z.object({ status: bookingStatusSchema }),
		),
		describeRoute({
			summary: "Update booking status",
			tags: ["Administration"],
		}),
		async (c) => {
			const id = c.req.param("id");
			const { status } = c.req.valid("json");

			const existing = await getBookingById(id);
			if (!existing) {
				throw new HTTPException(404);
			}

			const booking = await updateBookingStatus(id, status);
			return c.json(booking);
		},
	)
	.delete(
		"/:id",
		describeRoute({
			summary: "Cancel a booking",
			tags: ["Administration"],
		}),
		async (c) => {
			const id = c.req.param("id");

			const existing = await getBookingById(id);
			if (!existing) {
				throw new HTTPException(404);
			}

			const booking = await updateBookingStatus(id, "CANCELLED");
			return c.json(booking);
		},
	);
