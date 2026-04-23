import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { applyAnnotateExtension } from "../extensions/annotate";
import type { AnnotateExtensionBridge } from "../extensions/annotate-core";
import { formatAnnotationResult } from "../extensions/annotate-core";

function toGithubSlug(heading: string) {
	return heading
		.trim()
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-");
}

function createBridge() {
	const commands = new Map<
		string,
		Parameters<AnnotateExtensionBridge["registerCommand"]>[1]
	>();
	const tools = new Map<
		string,
		Parameters<AnnotateExtensionBridge["registerTool"]>[0]
	>();
	const sentMessages: string[] = [];

	const bridge: AnnotateExtensionBridge = {
		registerCommand(name, options) {
			commands.set(name, options);
		},
		registerTool(tool) {
			tools.set(tool.name, tool);
		},
		sendUserMessage(message) {
			sentMessages.push(message);
		},
	};

	return { bridge, commands, tools, sentMessages };
}

describe("pi-annotate", () => {
	it("registers /annotate command with stable description", () => {
		const { bridge, commands } = createBridge();

		applyAnnotateExtension(bridge);

		const command = commands.get("annotate");
		expect(command).toBeDefined();
		expect(command?.description).toBe(
			"Start visual annotation mode in the browser. Optionally provide a URL.",
		);
	});

	it("registers annotate tool with stable contract", () => {
		const { bridge, tools } = createBridge();

		applyAnnotateExtension(bridge);

		const tool = tools.get("annotate");
		expect(tool).toBeDefined();
		expect(tool?.label).toBe("Annotate");
		expect(tool?.description).toContain(
			"Open visual annotation mode in the browser",
		);
		expect(tool?.promptSnippet).toBe(
			"Use only when the user explicitly asks for visual annotation or UI pointing. Call with {url?} and return selected element annotations.",
		);

		const parameters = tool?.parameters as
			| {
					type?: string;
					properties?: Record<
						string,
						{ type?: string; description?: string }
					>;
					required?: string[];
			  }
			| undefined;
		expect(parameters?.type).toBe("object");
		expect(Object.keys(parameters?.properties ?? {}).sort()).toEqual([
			"timeout",
			"url",
		]);
		expect(parameters?.properties?.url?.type).toBe("string");
		expect(parameters?.properties?.timeout?.type).toBe("number");
		expect(parameters?.properties?.url?.description).toContain(
			"current browser tab",
		);
		expect(parameters?.properties?.timeout?.description).toContain(
			"Default: 300",
		);
		expect(parameters?.required ?? []).toEqual([]);
	});

	it("keeps popup setup guide link pointed at live README heading", () => {
		const popupHtml = fs.readFileSync(
			new URL("../chrome-extension/popup.html", import.meta.url),
			"utf8",
		);
		const readme = fs.readFileSync(
			new URL("../README.md", import.meta.url),
			"utf8",
		);
		const hrefMatch = popupHtml.match(
			/<a href="https:\/\/github\.com\/magimetal\/pi-annotate(#[^"]+)" target="_blank">Setup Guide →<\/a>/,
		);
		expect(hrefMatch?.[1]).toBeDefined();

		const readmeAnchors = [...readme.matchAll(/^#{2,6}\s+(.+)$/gm)].map(
			([, heading]) => `#${toGithubSlug(heading)}`,
		);
		expect(readmeAnchors).toContain(hrefMatch?.[1]);
	});

	it("formats stable annotation markdown output", async () => {
		const text = await formatAnnotationResult({
			success: true,
			url: "https://example.com/fixture",
			viewport: { width: 1280, height: 720 },
			prompt: "Tighten spacing around CTA",
			elements: [
				{
					selector: "#probe-child",
					tag: "button",
					id: "probe-child",
					classes: ["probe-cta"],
					text: "Probe CTA",
					rect: { x: 16, y: 24, width: 205, height: 52 },
					attributes: { type: "button" },
					keyStyles: {
						display: "inline-flex",
						backgroundColor: "rgb(37, 99, 235)",
					},
					accessibility: {
						role: "button",
						name: "Probe CTA",
						description: null,
						focusable: true,
						disabled: false,
					},
					comment: "Reduce vertical padding",
				},
			],
		});

		expect(text).toBe(
			"## Page Annotation: https://example.com/fixture\n" +
				"**Viewport:** 1280×720\n\n" +
				"**Context:** Tighten spacing around CTA\n\n" +
				"### Selected Elements (1)\n\n" +
				"1. **button**\n" +
				"   - Selector: `#probe-child`\n" +
				"   - ID: `probe-child`\n" +
				"   - Classes: `probe-cta`\n" +
				'   - Text: "Probe CTA"\n' +
				"   - Size: 205×52px\n" +
				'   - **Attributes:** type="button"\n' +
				'   - **Accessibility:** role=button, name="Probe CTA", focusable=true, disabled=false\n' +
				"   - **Styles:** display: inline-flex, backgroundColor: rgb(37, 99, 235)\n" +
				"   - **Comment:** Reduce vertical padding\n\n",
		);
	});
});
