import { defineCollection, defineConfig, type AnyCollection } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { transformMDX } from "@fumadocs/content-collections/configuration";
import rehypeShiki from "@shikijs/rehype";
import { remarkImage } from "fumadocs-core/mdx-plugins";
import { z } from "zod/v4";
import { config } from "../../config";

function sanitizePath(path: string) {
	return path
		.replace(/(\.[a-zA-Z-]{2,5})$/, "")
		.replace(/^\//, "")
		.replace(/\/$/, "")
		.replace(/index$/, "");
}

function getLocaleFromFilePath(path: string) {
	return (
		path
			.match(/(\.[a-zA-Z-]{2,5})+\.(md|mdx|json)$/)?.[1]
			?.replace(".", "") ?? config.i18n.defaultLocale
	);
}

const posts = defineCollection({
	name: "posts",
	directory: "content/posts",
	include: "**/*.{mdx,md}",
	schema: z.object({
		title: z.string(),
		date: z.string(),
		image: z.string().optional(),
		authorName: z.string(),
		authorImage: z.string().optional(),
		authorLink: z.string().optional(),
		excerpt: z.string().optional(),
		tags: z.array(z.string()),
		published: z.boolean(),
	}),
	transform: async (document, context) => {
		const body = await compileMDX(context, document, {
			rehypePlugins: [
				[
					rehypeShiki,
					{
						theme: "nord",
					},
				],
			],
		});

		return {
			...document,
			body,
			locale: getLocaleFromFilePath(document._meta.filePath),
			path: sanitizePath(document._meta.path),
		};
	},
});

const legalPages = defineCollection({
	name: "legalPages",
	directory: "content/legal",
	include: "**/*.{mdx,md}",
	schema: z.object({
		title: z.string(),
	}),
	transform: async (document, context) => {
		const body = await compileMDX(context, document);

		return {
			...document,
			body,
			locale: getLocaleFromFilePath(document._meta.filePath),
			path: sanitizePath(document._meta.path),
		};
	},
});

const docs = defineCollection({
	name: "docs",
	directory: "content/docs",
	include: "**/*.mdx",
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		icon: z.string().optional(),
		full: z.boolean().optional(),
		_openapi: z.record(z.string(), z.unknown()).optional(),
	}),
	transform: async (document, context) =>
		transformMDX(document, context, {
			remarkPlugins: [
				[
					remarkImage,
					{
						publicDir: "public",
					},
				],
			],
		}),
});

const docsMeta = defineCollection({
	name: "docsMeta",
	directory: "content/docs",
	include: "**/meta.json",
	parser: "json",
	schema: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		pages: z.array(z.string()).optional(),
		icon: z.string().optional(),
		root: z.boolean().optional(),
		defaultOpen: z.boolean().optional(),
	}),
});

export default defineConfig({
	// docs cast needed: transformMDX returns structuredData with `heading: string|undefined`,
	// which fails @content-collections/core's Serializable check at type-level (undefined not in Literal)
	collections: [posts, legalPages, docs as unknown as AnyCollection, docsMeta],
});
