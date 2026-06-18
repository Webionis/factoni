import type { LegalHostingProvider } from "@/lib/legal/hosting";

interface LegalHostingDetailsProps {
  provider: LegalHostingProvider;
}

export function LegalHostingDetails({ provider }: LegalHostingDetailsProps) {
  return (
    <div className="space-y-2">
      <p>
        <strong className="font-medium text-[#334155]">Prestataire :</strong>{" "}
        {provider.name}
      </p>
      <p>
        <strong className="font-medium text-[#334155]">Rôle :</strong>{" "}
        {provider.role}
      </p>
      <p>
        <strong className="font-medium text-[#334155]">Adresse :</strong>{" "}
        {provider.address}
      </p>
      <p>
        <strong className="font-medium text-[#334155]">Site :</strong>{" "}
        <a
          href={provider.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2563eb] hover:underline"
        >
          {provider.websiteLabel}
        </a>
      </p>
    </div>
  );
}
