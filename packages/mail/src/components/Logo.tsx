import React from "react";

export function Logo({
	withLabel = true,
}: {
	withLabel?: boolean;
}) {
	return (
		<span
			style={{
				display: "flex",
				alignItems: "center",
				gap: "10px",
				fontWeight: 600,
				color: "#6366f1",
				lineHeight: 1,
			}}
		>
			<svg
				width="40"
				height="40"
				viewBox="0 0 100 100"
				fill="currentColor"
				aria-hidden="true"
			>
				<title>Roam Loom</title>
				<path
					opacity="0.15"
					d="M50 5A30 30 0 0 1 80 35C80 60 50 95 50 95C50 95 20 60 20 35A30 30 0 0 0 50 5Z"
				/>
				<path
					opacity="0.35"
					d="M50 8A27 27 0 0 1 77 35C77 57 50 91 50 91C50 91 23 57 23 35A27 27 0 0 0 50 8Z"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M50 11A24 24 0 0 1 74 35C74 55 50 87 50 87C50 87 26 55 26 35A24 24 0 0 0 50 11ZM38 35A12 12 0 1 0 62 35A12 12 0 1 0 38 35Z"
				/>
			</svg>
			{withLabel && (
				<span style={{ fontSize: "18px", letterSpacing: "-0.02em" }}>
					Roam Loom
				</span>
			)}
		</span>
	);
}
