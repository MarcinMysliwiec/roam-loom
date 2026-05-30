import { type Session, auth } from "@repo/auth";
import { getOrganizationMembership } from "@repo/database";
import { createMiddleware } from "hono/factory";

export const adminMiddleware = createMiddleware<{
	Variables: {
		session: Session["session"];
		user: Session["user"];
		orgMemberRole: string | null;
	};
}>(async (c, next) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	if (session.user.role === "admin") {
		c.set("session", session.session);
		c.set("user", session.user);
		c.set("orgMemberRole", null);
		await next();
		return;
	}

	const activeOrganizationId = (
		session.session as Session["session"] & { activeOrganizationId?: string }
	).activeOrganizationId;

	if (!activeOrganizationId) {
		return c.json({ error: "Forbidden" }, 403);
	}

	const membership = await getOrganizationMembership(
		activeOrganizationId,
		session.user.id,
	);

	if (!membership) {
		return c.json({ error: "Forbidden" }, 403);
	}

	c.set("session", session.session);
	c.set("user", session.user);
	c.set("orgMemberRole", membership.role);

	await next();
});
