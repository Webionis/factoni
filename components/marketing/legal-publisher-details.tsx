import { getLegalPublisher } from "@/lib/legal/publisher";

export function LegalPublisherDetails() {
  const publisher = getLegalPublisher();

  return (
    <ul className="list-none space-y-1.5 p-0">
      <li>
        <strong className="font-medium text-[#334155]">Nom commercial :</strong>{" "}
        {publisher.tradeName}
      </li>
      <li>
        <strong className="font-medium text-[#334155]">Entrepreneur :</strong>{" "}
        {publisher.companyName}
      </li>
      <li>
        <strong className="font-medium text-[#334155]">Forme juridique :</strong>{" "}
        {publisher.legalForm}
      </li>
      <li>
        <strong className="font-medium text-[#334155]">Adresse :</strong>{" "}
        {publisher.address}
      </li>
      <li>
        <strong className="font-medium text-[#334155]">SIREN :</strong>{" "}
        {publisher.siren}
      </li>
      <li>
        <strong className="font-medium text-[#334155]">SIRET :</strong>{" "}
        {publisher.siret}
      </li>
      {publisher.vatNumber ? (
        <li>
          <strong className="font-medium text-[#334155]">TVA :</strong>{" "}
          {publisher.vatNumber}
        </li>
      ) : null}
      {publisher.rcs ? (
        <li>
          <strong className="font-medium text-[#334155]">
            Immatriculation (RCS) :
          </strong>{" "}
          {publisher.rcs}
        </li>
      ) : null}
      {publisher.shareCapital ? (
        <li>
          <strong className="font-medium text-[#334155]">Capital social :</strong>{" "}
          {publisher.shareCapital}
        </li>
      ) : null}
      <li>
        <strong className="font-medium text-[#334155]">Site web :</strong>{" "}
        <a
          href={publisher.websiteUrl}
          className="text-[#2563eb] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {publisher.websiteUrl.replace(/^https?:\/\//, "")}
        </a>
      </li>
      <li>
        <strong className="font-medium text-[#334155]">Email :</strong>{" "}
        <a
          href={`mailto:${publisher.email}`}
          className="text-[#2563eb] hover:underline"
        >
          {publisher.email}
        </a>
      </li>
      {publisher.phone ? (
        <li>
          <strong className="font-medium text-[#334155]">Téléphone :</strong>{" "}
          {publisher.phone}
        </li>
      ) : null}
    </ul>
  );
}

export function LegalPublicationDirector() {
  const publisher = getLegalPublisher();

  return <p>{publisher.publicationDirector}</p>;
}
