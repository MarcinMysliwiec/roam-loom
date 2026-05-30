import {
	countProperties,
	createProperty,
	deleteProperty,
	getProperties,
	getPropertyById,
	updateProperty,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin";

const propertyBodySchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	address: z.string(),
	images: z.array(z.string()).optional(),
	basePrice: z.number(),
	organizationId: z.string(),
});

export const propertiesRouter = new Hono()
	.basePath("/properties")
	.use(adminMiddleware)
	.get(
		"/",
		validator(
			"query",
			z.object({
				query: z.string().optional(),
				organizationId: z.string().optional(),
				limit: z.string().optional().default("10").transform(Number),
				offset: z.string().optional().default("0").transform(Number),
			}),
		),
		describeRoute({
			summary: "Get all properties",
			tags: ["Administration"],
		}),
		async (c) => {
			const { query, organizationId, limit, offset } = c.req.valid("query");

			const [properties, total] = await Promise.all([
				getProperties({ limit, offset, query, organizationId }),
				countProperties({ query, organizationId }),
			]);

			return c.json({ properties, total });
		},
	)
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const property = await getPropertyById(id);

		if (!property) {
			throw new HTTPException(404);
		}

		return c.json(property);
	})
	.post(
		"/",
		validator("json", propertyBodySchema),
		describeRoute({
			summary: "Create a property",
			tags: ["Administration"],
		}),
		async (c) => {
			const user = c.get("user");
			const orgMemberRole = c.get("orgMemberRole");
			if (
				user.role !== "admin" &&
				!["owner", "admin"].includes(orgMemberRole ?? "")
			) {
				return c.json({ error: "Forbidden" }, 403);
			}
			const data = c.req.valid("json");
			const property = await createProperty(data);
			return c.json(property, 201);
		},
	)
	.put(
		"/:id",
		validator("json", propertyBodySchema.partial()),
		describeRoute({
			summary: "Update a property",
			tags: ["Administration"],
		}),
		async (c) => {
			const id = c.req.param("id");
			const data = c.req.valid("json");

			const existing = await getPropertyById(id);
			if (!existing) {
				throw new HTTPException(404);
			}

			const property = await updateProperty(id, data);
			return c.json(property);
		},
	)
	.delete("/:id", async (c) => {
		const user = c.get("user");
		const orgMemberRole = c.get("orgMemberRole");
		if (
			user.role !== "admin" &&
			!["owner", "admin"].includes(orgMemberRole ?? "")
		) {
			return c.json({ error: "Forbidden" }, 403);
		}

		const id = c.req.param("id");

		const existing = await getPropertyById(id);
		if (!existing) {
			throw new HTTPException(404);
		}

		await deleteProperty(id);
		return c.body(null, 204);
	});
