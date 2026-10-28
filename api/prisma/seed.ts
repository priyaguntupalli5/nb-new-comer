import { PrismaClient, ProfileType } from "@prisma/client";

const prisma = new PrismaClient();

const { INTERNATIONAL_STUDENT, PERMANENT_RESIDENT, WORK_PERMIT_HOLDER, FAMILY } = ProfileType;

// Date each official source URL below was last opened and confirmed.
const checked = new Date("2026-10-27");

// sortOrder is global; each profile sees its own items in this order, and the first three are its urgent steps.
const items = [
  {
    slug: "sin",
    title: "Get your Social Insurance Number (SIN)",
    detail:
      "A 9-digit number you need to work in Canada, including part-time jobs, and to get government benefits.",
    bring:
      "Your study permit, work permit or PR card (or COPR, if you became a PR less than a year ago), plus your passport",
    where: "Online, by mail, or in person at Service Canada with an appointment",
    cost: "Free",
    timeline: "About 5 business days online, about 20 by mail, same day in person",
    keyFacts: [
      "Your study permit must say you \"may accept employment\" or \"may work\" in Canada. An email from IRCC is not accepted.",
      "If you are a temporary resident, your SIN starts with 9 and expires the same day as your permit. Update it each time you get a new permit.",
      "You will not get a plastic card. Service Canada sends a confirmation letter instead.",
      "If you forget a document, you cannot edit your application. You have to submit a new one.",
      "Give your SIN only to your employer after you are hired, your bank, and the government. Landlords, phone companies and job applications cannot require it.",
      "Never give your SIN to someone who calls, texts or emails you. Be wary of messages that threaten to lock or cancel your SIN: that is a scam.",
      "Do not carry your SIN letter in your wallet. Keep it somewhere safe at home.",
    ],
    officialSourceUrl: "https://www.canada.ca/en/employment-social-development/services/sin.html",
    sortOrder: 10,
    profiles: [INTERNATIONAL_STUDENT, PERMANENT_RESIDENT, WORK_PERMIT_HOLDER, FAMILY],
  },
  {
    slug: "student-health-coverage",
    title: "Check your health coverage",
    detail:
      "Ask your international student office whether you are covered by provincial Medicare or a school plan, so you are never caught without it.",
    bring: "Passport, study permit, acceptance letter",
    where: "University international student office",
    officialSourceUrl: "https://www2.gnb.ca/content/gnb/en/departments/health/Medicare.html",
    sortOrder: 20,
    profiles: [INTERNATIONAL_STUDENT],
  },
  {
    slug: "medicare",
    title: "Apply for your Medicare card",
    detail:
      "You can apply once you have physically moved to New Brunswick. Processing can take weeks, so apply early.",
    bring: "Passport, PR card or permit, proof of NB address",
    where: "Online, or by mail with the paper form",
    officialSourceUrl: "https://www2.gnb.ca/content/gnb/en/departments/health/Medicare.html",
    sortOrder: 25,
    profiles: [PERMANENT_RESIDENT, WORK_PERMIT_HOLDER, FAMILY],
  },
  {
    slug: "child-benefit",
    title: "Apply for the Canada Child Benefit",
    detail: "A monthly tax-free payment to help with the cost of raising children under 18.",
    bring: "Immigration documents for you and your children, SIN",
    where: "Online through the Canada Revenue Agency, or by mail",
    officialSourceUrl:
      "https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit-overview.html",
    sortOrder: 28,
    profiles: [FAMILY],
  },
  {
    slug: "bank-account",
    title: "Open a bank account",
    detail: "Many banks offer student or newcomer accounts. Compare them before you pick.",
    bring: "Passport, permit or PR confirmation, proof of address",
    where: "Any branch, or start online",
    officialSourceUrl:
      "https://www.canada.ca/en/financial-consumer-agency/services/banking/opening-bank-account.html",
    sortOrder: 30,
    profiles: [INTERNATIONAL_STUDENT, PERMANENT_RESIDENT, WORK_PERMIT_HOLDER, FAMILY],
  },
  {
    slug: "drivers-licence",
    title: "Exchange or get a driver's licence",
    detail:
      "Find out whether you can exchange your licence from home or need to take a test. An NB licence is also official photo ID.",
    bring: "Licence from home, passport, immigration documents",
    where: "Any Service New Brunswick location",
    officialSourceUrl: "https://www.gnb.ca/en/topic/driving-transportation/driving-licensing.html",
    sortOrder: 40,
    profiles: [INTERNATIONAL_STUDENT, PERMANENT_RESIDENT, WORK_PERMIT_HOLDER, FAMILY],
  },
];

async function main() {
  for (const { profiles, ...data } of items) {
    const item = await prisma.checklistItem.upsert({
      where: { slug: data.slug },
      create: { ...data, lastCheckedAt: checked },
      update: { ...data, lastCheckedAt: checked },
    });
    await prisma.profileItem.deleteMany({ where: { checklistItemId: item.id } });
    await prisma.profileItem.createMany({
      data: profiles.map((profileType) => ({ profileType, checklistItemId: item.id })),
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
