import { Hono } from "hono";
import { bookingsRouter } from "./bookings";
import { organizationRouter } from "./organizations";
import { propertiesRouter } from "./properties";
import { userRouter } from "./users";

export const adminRouter = new Hono()
	.basePath("/admin")
	.route("/", organizationRouter)
	.route("/", userRouter)
	.route("/", propertiesRouter)
	.route("/", bookingsRouter);
