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
    detail: "You need one before you can legally work in Canada, including part-time jobs.",
    bring: "Passport, study or work permit, or PR confirmation",
    where: "Service Canada office or online",
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
