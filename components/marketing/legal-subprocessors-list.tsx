import { LEGAL_SUBPROCESSORS } from "@/lib/legal/subprocessors";

export function LegalSubprocessorsList() {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {LEGAL_SUBPROCESSORS.map((processor) => (
        <li key={processor.name}>
          <strong className="font-medium text-[#334155]">{processor.name}</strong>
          {processor.optional ? (
            <span className="text-[#94a3b8]"> (si activé)</span>
          ) : null}
          {" — "}
          {processor.purpose}.{" "}
          <a
            href={processor.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563eb] hover:underline"
          >
            {processor.websiteLabel}
          </a>
        </li>
      ))}
      <li>Aucune revente ni cession commerciale de vos données à des tiers.</li>
    </ul>
  );
}
