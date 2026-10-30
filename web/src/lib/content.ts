// Date the static links on the home page were last opened and confirmed. Update it whenever you re-check them.
export const CONTENT_CHECKED_AT = "2026-10-27";

export const OFFICIAL_LINKS = {
  renting: "https://www.gnb.ca/en/topic/family-home-community/housing-property.html",
  tenantRights: "https://www.gnb.ca/en/topic/family-home-community/housing-property/renters.html",
  newcomerOrgs: "https://www.gnb.ca/en/topic/family-home-community/immigration/newcomers.html",
};

export const RENTAL_SITES = [
  { name: "Kijiji", url: "https://www.kijiji.ca/" },
  { name: "Facebook Marketplace", url: "https://www.facebook.com/marketplace/" },
  { name: "Rentals.ca", url: "https://rentals.ca/" },
];

export const CITIES = [
  { slug: "fredericton", name: "Fredericton" },
  { slug: "moncton", name: "Moncton" },
  { slug: "saint-john", name: "Saint John" },
];

// Dates arrive as "YYYY-MM-DD" or ISO strings; format them in UTC so they never shift a day.
export function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
