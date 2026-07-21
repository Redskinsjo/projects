export const COUNTRY_DIAL_CODES = [
  { code: "+33", label: "France" },
  { code: "+32", label: "Belgique" },
  { code: "+41", label: "Suisse" },
  { code: "+352", label: "Luxembourg" },
  { code: "+1", label: "Etats-Unis / Canada" },
  { code: "+44", label: "Royaume-Uni" },
  { code: "+49", label: "Allemagne" },
  { code: "+34", label: "Espagne" },
  { code: "+39", label: "Italie" },
  { code: "+31", label: "Pays-Bas" },
  { code: "+212", label: "Maroc" },
  { code: "+213", label: "Algerie" },
  { code: "+216", label: "Tunisie" },
  { code: "+225", label: "Cote d'Ivoire" },
  { code: "+221", label: "Senegal" },
  { code: "+237", label: "Cameroun" },
];

export const DEFAULT_COUNTRY_DIAL_CODE = "+33";

export function normalizeDialCode(value?: string | null) {
  const digits = value?.replace(/[^\d]/g, "") ?? "";

  return digits ? `+${digits}` : DEFAULT_COUNTRY_DIAL_CODE;
}

export function composeInternationalPhoneNumber(
  phoneNumber?: string | null,
  countryDialCode = DEFAULT_COUNTRY_DIAL_CODE,
) {
  const rawPhoneNumber = phoneNumber?.trim() ?? "";

  if (!rawPhoneNumber) return "";

  if (rawPhoneNumber.startsWith("+")) {
    return `+${rawPhoneNumber.replace(/[^\d]/g, "")}`;
  }

  if (rawPhoneNumber.startsWith("00")) {
    return `+${rawPhoneNumber.replace(/[^\d]/g, "").replace(/^00/, "")}`;
  }

  const dialCode = normalizeDialCode(countryDialCode);
  const nationalNumber = rawPhoneNumber.replace(/[^\d]/g, "").replace(/^0+/, "");

  return nationalNumber ? `${dialCode}${nationalNumber}` : "";
}

export function splitInternationalPhoneNumber(phoneNumber?: string | null) {
  const rawPhoneNumber = phoneNumber?.trim() ?? "";

  if (!rawPhoneNumber) {
    return { countryDialCode: DEFAULT_COUNTRY_DIAL_CODE, nationalNumber: "" };
  }

  const normalizedPhoneNumber = rawPhoneNumber.startsWith("00")
    ? `+${rawPhoneNumber.replace(/[^\d]/g, "").replace(/^00/, "")}`
    : rawPhoneNumber.startsWith("+")
      ? `+${rawPhoneNumber.replace(/[^\d]/g, "")}`
      : rawPhoneNumber;

  if (!normalizedPhoneNumber.startsWith("+")) {
    return {
      countryDialCode: DEFAULT_COUNTRY_DIAL_CODE,
      nationalNumber: rawPhoneNumber,
    };
  }

  const matchedCountry = [...COUNTRY_DIAL_CODES]
    .sort((left, right) => right.code.length - left.code.length)
    .find((country) => normalizedPhoneNumber.startsWith(country.code));

  if (!matchedCountry) {
    return {
      countryDialCode: DEFAULT_COUNTRY_DIAL_CODE,
      nationalNumber: normalizedPhoneNumber,
    };
  }

  return {
    countryDialCode: matchedCountry.code,
    nationalNumber: normalizedPhoneNumber.slice(matchedCountry.code.length),
  };
}
