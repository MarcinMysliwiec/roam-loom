import { config } from "@repo/config";
import nodemailer from "nodemailer";
import type { SendEmailHandler } from "../../types";

const { from } = config.mails;

export const send: SendEmailHandler = async ({ to, subject, text, html }) => {
	const user = process.env.MAIL_USER;
	const pass = process.env.MAIL_PASS;
	const transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST as string,
		port: Number.parseInt(process.env.MAIL_PORT ?? "1025", 10),
		...(user && pass ? { auth: { user, pass } } : {}),
	});

	await transporter.sendMail({
		to,
		from,
		subject,
		text,
		html,
	});
};
