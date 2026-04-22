import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applyAnnotateExtension } from "./annotate-core.js";

export {
	type AnnotateExtensionBridge,
	type AnnotationContext,
	applyAnnotateExtension,
} from "./annotate-core.js";

export default function (pi: ExtensionAPI): void {
	applyAnnotateExtension(pi);
}
