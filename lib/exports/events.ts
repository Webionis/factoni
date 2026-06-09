export const EXPORT_COMPLETED_EVENT = "factoni:export-completed";

export function notifyExportCompleted(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EXPORT_COMPLETED_EVENT));
  }
}
