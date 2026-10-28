import { PrismaClient, ProfileType } from "@prisma/client";

const prisma = new PrismaClient();

const { INTERNATIONAL_STUDENT, PERMANENT_RESIDENT, WORK_PERMIT_HOLDER, FAMILY } = ProfileType;

// Date each official source URL below was last opened and confirmed.
const checked = new Date("2026-10-27");

// Medicare rules shared by every newcomer category. Each category's card adds its own documents and eligibility facts.
const MEDICARE_APPLY_URL =
  "https://www2.gnb.ca/content/gnb/en/departments/health/DrugPlans/content/medicare/ApplyingforaCard.html";
const MEDICARE_DOCUMENTS_URL =
  "https://www2.gnb.ca/content/gnb/en/departments/health/DrugPlans/content/medicare/RequiredDocumentationforYourMedicare.html";
const medicareWhere = "Online, or a paper form sent by mail or email, or taken to a Service New Brunswick office";
const medicareTimeline = "10 to 12 weeks. You get a letter with your start date, then your card";
const medicareBeforeYouApply = [
  "You can only apply after you have physically moved to New Brunswick.",
  "Your proof of address must show your name and NB address: for example a lease, utility bill, pay stub, employer letter or tenant insurance policy.",
  "Send photocopies, not originals. Each document can only count for one requirement, and an application missing a document is not processed.",
  "Apply only once. Do not send a paper form if you already applied online.",
  "Medicare may ask for more, such as documents from a country you lived, worked or studied in before, or proof of a name change.",
];
const medicareAfterYouApply = [
  "Tell Medicare when your status, permit or address changes, or you could lose your coverage.",
  "No letter after 14 weeks? Call Service New Brunswick at 1-888-762-8600.",
  "To find a family doctor, register with Patient Connect NB, online or by calling 811. Waits can be long.",
];

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
      "Full-time international students can get New Brunswick Medicare, but it takes weeks to start. Ask your international student office what covers you until then, so you are never caught without it.",
    bring:
      "Copies of your study permit; your passport photo page (or your student ID) and the page with your last entry stamp; proof of full-time enrolment for the full school year; and one proof of your NB address, such as your lease or a utility bill",
    where: "Your international student office first, then apply for Medicare online or with the paper form",
    cost: "No fee to apply for Medicare",
    timeline: medicareTimeline,
    keyFacts: [
      "You must study full time for the full school year. Part-time and exchange students are not eligible for Medicare.",
      "Your acceptance letter is not accepted. Ask your school for proof of enrolment for a full school year.",
      ...medicareBeforeYouApply,
      "Until your Medicare starts, make sure a school health plan or private insurance covers you.",
      ...medicareAfterYouApply,
    ],
    officialSourceUrl: MEDICARE_APPLY_URL,
    sortOrder: 20,
    profiles: [INTERNATIONAL_STUDENT],
  },
  {
    // Slug kept from when this card was shared, so progress saved in browsers still matches.
    slug: "medicare",
    title: "Apply for your Medicare card",
    detail:
      "Your provincial health insurance. As a permanent resident you qualify once New Brunswick is your permanent home. Apply as soon as you move here.",
    bring:
      "Copies of your PR card (both sides), COPR or Record of Landing; your passport photo page and last entry stamp page; and one proof of your NB address, such as your lease, a utility bill or a pay stub",
    where: medicareWhere,
    cost: "No fee to apply",
    timeline: medicareTimeline,
    keyFacts: [
      "Owning property or paying taxes here is not enough on its own. New Brunswick must be your permanent and main home.",
      ...medicareBeforeYouApply,
      "Until your coverage starts, consider private health insurance.",
      ...medicareAfterYouApply,
    ],
    officialSourceUrl: MEDICARE_APPLY_URL,
    sortOrder: 25,
    profiles: [PERMANENT_RESIDENT],
  },
  {
    slug: "medicare-work-permit",
    title: "Apply for your Medicare card",
    detail:
      "Your provincial health insurance. Check that your work permit qualifies, then apply as soon as you move here.",
    bring:
      "Copies of your valid work permit; your passport photo page (or your employee ID) and the page with your last entry stamp; and one proof of your NB address, such as your lease, a pay stub or a letter from your employer",
    where: medicareWhere,
    cost: "No fee to apply",
    timeline: medicareTimeline,
    keyFacts: [
      "The Department of Health has said your work permit must be valid for 12 months or more, so seasonal workers usually do not qualify. Call 1-888-762-8600 to confirm before you apply.",
      "If your work permit is about to expire, include proof from IRCC that you applied to extend it, such as the acknowledgment of receipt letter.",
      ...medicareBeforeYouApply,
      "Until your coverage starts, consider private health insurance.",
      "When you get a new permit, send it to Medicare so your coverage is not cut off.",
      ...medicareAfterYouApply,
    ],
    officialSourceUrl: MEDICARE_DOCUMENTS_URL,
    sortOrder: 26,
    profiles: [WORK_PERMIT_HOLDER],
  },
  {
    slug: "medicare-family",
    title: "Apply for Medicare for your family",
    detail:
      "Provincial health insurance for each person in your family. One application can list everyone. Apply as soon as you move here.",
    bring:
      "Copies for each person: their status document (PR card or COPR, their permit, or a Canadian birth certificate for children born in Canada) and a second ID, such as their passport photo page and last entry stamp page. For you: one proof of your NB address",
    where: medicareWhere,
    cost: "No fee to apply",
    timeline: medicareTimeline,
    keyFacts: [
      "Every person on the application needs their own status document and ID. Only the main applicant needs proof of address.",
      "If your family is here on work or study permits rather than as permanent residents, call 1-888-762-8600 to confirm who qualifies.",
      "Baby born in New Brunswick? Register them by calling 1-888-762-8600 or at a Service New Brunswick office, and the card is mailed to you.",
      ...medicareBeforeYouApply,
      "Until your coverage starts, consider private health insurance for the whole family.",
      ...medicareAfterYouApply,
    ],
    officialSourceUrl: MEDICARE_APPLY_URL,
    sortOrder: 27,
    profiles: [FAMILY],
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
