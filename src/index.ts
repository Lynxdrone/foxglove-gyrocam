import { ExtensionContext } from "@foxglove/studio";
import { initGyrocam } from "./Gyrocam";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "test_camera", initPanel: initGyrocam });
}
