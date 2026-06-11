import { Text, View } from "@react-pdf/renderer";

import { pdfStyles } from "@/lib/pdf/styles";
import type { PdfParty } from "@/lib/pdf/types";

interface PdfPartyBlockProps {
  label: string;
  party: PdfParty;
  interventionLocation?: PdfParty | null;
  /** Empêche la coupure du bloc entre deux pages (reçu de paiement). */
  keepTogether?: boolean;
}

function PartyDetails({ party }: { party: PdfParty }) {
  return (
    <>
      <Text style={pdfStyles.partyName}>{party.name}</Text>
      {party.subtitle ? (
        <Text style={pdfStyles.partySubtitle}>{party.subtitle}</Text>
      ) : null}
      {party.addressLines.map((line, i) => (
        <Text key={`addr-${i}`} style={pdfStyles.partyLine}>
          {line}
        </Text>
      ))}
      {party.email ? (
        <Text style={pdfStyles.partyLine}>{party.email}</Text>
      ) : null}
      {party.phone ? (
        <Text style={pdfStyles.partyLine}>{party.phone}</Text>
      ) : null}
      {party.siren ? (
        <Text style={pdfStyles.partyLine}>SIREN : {party.siren}</Text>
      ) : null}
      {party.siret ? (
        <Text style={pdfStyles.partyLine}>SIRET : {party.siret}</Text>
      ) : null}
      {party.vatNumber ? (
        <Text style={pdfStyles.partyLine}>TVA : {party.vatNumber}</Text>
      ) : null}
    </>
  );
}

export function PdfPartyBlock({
  label,
  party,
  interventionLocation,
  keepTogether = false,
}: PdfPartyBlockProps) {
  return (
    <View style={pdfStyles.partyBlock} wrap={keepTogether ? false : undefined}>
      <Text style={pdfStyles.partyLabel}>{label}</Text>
      <PartyDetails party={party} />
      {interventionLocation ? (
        <View style={pdfStyles.partySubsection}>
          <View style={pdfStyles.partySubsectionDivider} />
          <Text style={pdfStyles.partySubsectionLabel}>Lieu d'intervention</Text>
          <PartyDetails party={interventionLocation} />
        </View>
      ) : null}
    </View>
  );
}
