import { PrismaClient, ProfileType } from "@prisma/client";

const prisma = new PrismaClient();

const { INTERNATIONAL_STUDENT, PERMANENT_RESIDENT, WORK_PERMIT_HOLDER, FAMILY } = ProfileType;

// Date each official source URL below was last opened and confirmed.
const checked = new Date("2026-10-27");

// SIN rules shared by every newcomer category. Each category's card adds its own documents and status facts.
const sinShared = {
  title: "Get your Social Insurance Number (SIN)",
  where: "Online, by mail, or in person at Service Canada with an appointment",
  cost: "Free",
  officialSourceUrl: "https://www.canada.ca/en/employment-social-development/services/sin.html",
  sortOrder: 10,
};
const sinDetail = "A 9-digit number you need to work in Canada, including part-time jobs, and to get government benefits.";
const sinSecondId =
  "A second ID with full legal name and date of birth: passport (any country), Canadian driver's licence, provincial ID card, or other Canadian government ID";
const sinTemporaryTimeline = "About 5 business days online, about 20 by mail, same day in person";
const sinPermanentTimeline = "Same day in person. Online is faster than mail";
const sinTemporaryFacts = [
  "Your SIN starts with 9 and expires the same day as your permit. Update it each time you get a new permit.",
  "Applied to extend your permit before it expired? You can keep working with your expired SIN until IRCC decides.",
  "You can start working as soon as you have applied, without waiting for your number.",
];
const sinApplyFacts = [
  "Your second ID must be issued by a Canadian government or be a passport. A driver's licence from another country does not count.",
  "You will not get a plastic card. Service Canada sends a confirmation letter instead.",
  "Documents must be in English or French, or translated. Family members cannot do the translation.",
  "If you forget a document, you cannot edit your application. You have to submit a new one.",
];
const sinProtectFacts = [
  "Give your SIN only to your employer after you are hired, your bank, and the government. Landlords, phone companies and job applications cannot require it.",
  "Never give your SIN to someone who calls, texts or emails you. Be wary of messages that threaten to lock or cancel your SIN: that is a scam.",
  "Do not carry your SIN letter in your wallet. Keep it somewhere safe at home.",
];

// Bank account rules from the Financial Consumer Agency of Canada, shared by every newcomer category.
const bankShared = {
  title: "Open a bank account",
  where: "Any bank branch. You may need to go in person the first time",
  keyFacts: [
    "Bring originals. Banks do not accept copies of your ID.",
    "A passport is not required. Any two documents from the bank's accepted list work, such as a Canadian driver's licence and a utility bill.",
    "Option 2: no address document yet? Bring one ID with your name and date of birth, and have someone the bank trusts, such as an existing customer or a respected community member, confirm who you are.",
    "A lease is not on the accepted list. If all you have is a passport and a permit, ask the bank about option 2 or which other documents it accepts.",
    "Ask for a low-cost or no-cost account by name. Low-cost accounts are $4 or less a month, include at least 18 debit transactions, and cannot require a minimum balance.",
    "A bank can only refuse you for specific reasons, such as suspected fraud. If it refuses, it must tell you in writing and explain how to complain.",
    "Your bank may ask for your SIN, because it has to report the interest you earn.",
    "Compare accounts with the Account Comparison Tool from the Financial Consumer Agency of Canada.",
  ],
  officialSourceUrl: "https://www.canada.ca/en/financial-consumer-agency/services/banking/opening-bank-account.html",
  sortOrder: 30,
};
const bankDetail = "You need a Canadian account to get paid, pay rent and receive government payments.";
const bankAddressDocs = [
  "One original document with your name and address, such as a recent Canadian utility bill, bank or credit card statement, or government benefit or tax statement",
  "No address document yet? You can still open an account: see option 2 under \"What to know\"",
];

// Driver's licence rules for new residents from Service New Brunswick, shared by every newcomer category.
const licenceShared = {
  title: "Exchange or get a driver's licence",
  where: "Any Service New Brunswick office",
  cost: "Up to $100 for the licence. If you need a road test, $25 plus HST",
  timeline: "You get a 30-day temporary licence when you apply. Your card is mailed within about 14 days",
  officialSourceUrl: "https://www.gnb.ca/en/topic/driving-transportation/driving-licensing/licences-new-residents.html",
  sortOrder: 40,
};
const licenceDetail =
  "Depending on your country, you either exchange your licence or take the full test. An NB licence is also official photo ID.";
const licenceBring = (statusDocument: string) => [
  "Your original licence from home",
  "An official English or French translation, if it is in another language (from a translation agency, or an international driver's licence)",
  statusDocument,
  "One ID and two proofs of NB address",
];
const licenceTemporaryGrace =
  "With a work or study permit valid for more than 6 months, you can drive on your valid home licence for up to 6 months from the day you land in Canada.";
const licenceFacts = [
  "No written or road test if your licence is from: Australia, Austria, Belgium, Denmark, France, Germany, Ireland, Isle of Man, Italy, Japan, the Netherlands, New Zealand, Norway, Portugal, South Korea, Spain, Sweden, Switzerland, Taiwan, Ukraine, or the UK (England, Scotland, Wales).",
  "Licences from other Canadian provinces and US states are exchanged class for class, with no tests.",
  "From any other country, you take the full exam: a vision test, a written knowledge test and a road test.",
  "Taiwan: also bring an English translation authenticated by the Taipei Economic and Cultural Office in Toronto, and a Verification Certificate issued in the last 3 months. Ukraine: category B or BE licences need a vision test.",
  "The knowledge test can be done online or at a Service New Brunswick office. Wait at least 4 business days after passing before going to an office for the next step.",
  "Book the road test online or at 1-888-762-8600. Bring a driver with a full licence and at least 3 years' experience, and a registered, insured vehicle.",
  "Exchanging your home licence on the day of your road test? Arrive 45 minutes early.",
  "New Brunswick keeps your home licence for 5 years after you exchange it.",
  "Questions? Call the Motor Vehicle Branch at 506-453-2410.",
];

// Medicare rules shared by every newcomer category. Each category's card adds its own documents and eligibility facts.
const MEDICARE_APPLY_URL =
  "https://www2.gnb.ca/content/gnb/en/departments/health/DrugPlans/content/medicare/ApplyingforaCard.html";
const MEDICARE_DOCUMENTS_URL =
  "https://www2.gnb.ca/content/gnb/en/departments/health/DrugPlans/content/medicare/RequiredDocumentationforYourMedicare.html";
const medicareWhere = "Online, or a paper form sent by mail or email, or taken to a Service New Brunswick office";
const medicareTimeline = "10 to 12 weeks. You get a letter with your start date, then your card";
const medicareEntryStamp = "Passport page with your last entry stamp (required, even if you use a different ID above)";
const medicareBeforeYouApply = [
  "You can only apply after you have physically moved to New Brunswick.",
  "A passport is not the only ID accepted. You can also use a Canadian or translated birth certificate, NB driver's licence or ID card, student ID, employee ID, citizenship certificate, First Nations status card, a baptismal certificate showing place and date of birth, or a health card from another province.",
  "The entry stamp page is not your ID. It shows Medicare when you arrived in Canada, so it is needed on top of your ID.",
  "No entry stamp in your passport? Call 1-888-762-8600 before you apply and ask what to send instead.",
  "Your proof of address must show your name and NB address: for example a lease, utility bill, pay stub, employer letter or tenant insurance policy.",
  "Send photocopies, not originals. Each document can only count for one requirement, and an application missing a document is not processed.",
  "Apply only once. Do not send a paper form if you already applied online.",
  "Medicare may ask for more, such as documents from a country you lived, worked or studied in before, or proof of a name change.",
];
const medicareAfterYouApply = [
  "Tell Medicare when your status, permit or address changes, or you could lose your coverage.",
  "No letter after 14 weeks? Call Service New Brunswick at 1-888-762-8600.",
  "No family doctor yet? Register with NB Health Link at nbhealthlink.ca. Until then, call 811 any time to talk to a nurse.",
];

// sortOrder is global; each profile sees its own items in this order, and the first three are its urgent steps.
const items = [
  {
    // Slug kept from when this card was shared, so progress saved in browsers still matches.
    slug: "sin",
    ...sinShared,
    detail: sinDetail,
    bring: ['Study permit that says you "may work" or "may accept employment" in Canada', sinSecondId],
    timeline: sinTemporaryTimeline,
    keyFacts: [
      "If your study permit does not say you can work, contact IRCC about an amended permit before you apply. An email from IRCC is not accepted.",
      ...sinTemporaryFacts,
      ...sinApplyFacts,
      ...sinProtectFacts,
    ],
    profiles: [INTERNATIONAL_STUDENT],
  },
  {
    slug: "sin-permanent-resident",
    ...sinShared,
    detail: `${sinDetail} As a permanent resident, your SIN does not expire.`,
    bring: ["PR card, or your COPR if it is less than 1 year since you became a permanent resident", sinSecondId],
    timeline: sinPermanentTimeline,
    keyFacts: [
      "Already had a SIN starting with 9 from a study or work permit? Update your SIN record with your new PR status.",
      ...sinApplyFacts,
      ...sinProtectFacts,
    ],
    profiles: [PERMANENT_RESIDENT],
  },
  {
    slug: "sin-work-permit",
    ...sinShared,
    detail: sinDetail,
    bring: ['Work permit that says you "may work" or "may accept employment" in Canada', sinSecondId],
    timeline: sinTemporaryTimeline,
    keyFacts: [
      "Bring the permit itself. An email from IRCC is not accepted.",
      ...sinTemporaryFacts,
      ...sinApplyFacts,
      ...sinProtectFacts,
    ],
    profiles: [WORK_PERMIT_HOLDER],
  },
  {
    slug: "sin-family",
    ...sinShared,
    title: "Get a SIN for each adult who will work",
    detail:
      "A 9-digit number each person needs to work in Canada and to get government benefits. Each person applies with their own documents.",
    bring: [
      "Each person: their PR card (or COPR, within 1 year of becoming a PR), or their work or study permit",
      `Each adult: ${sinSecondId.charAt(0).toLowerCase()}${sinSecondId.slice(1)}`,
    ],
    timeline: sinPermanentTimeline,
    keyFacts: [
      "Permanent residents get a SIN that does not expire.",
      "Only adults who have reached the age of majority need a second ID. Children need only their status document.",
      "Family members on a work or study permit need a permit that says they \"may work\" or \"may accept employment\". Their SIN starts with 9 and expires the same day as their permit.",
      ...sinApplyFacts,
      ...sinProtectFacts,
    ],
    profiles: [FAMILY],
  },
  {
    slug: "student-health-coverage",
    title: "Check your health coverage",
    detail:
      "Full-time international students can get New Brunswick Medicare, but it takes weeks to start. Ask your international student office what covers you until then, so you are never caught without it.",
    bring: [
      "Study permit",
      "One ID, such as your passport photo page, student ID, NB driver's licence or birth certificate",
      medicareEntryStamp,
      "Proof of full-time enrolment for the full school year",
      "One proof of NB address, such as your lease or a utility bill",
    ],
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
    bring: [
      "PR card (both sides), COPR or Record of Landing",
      "One ID, such as your passport photo page, NB driver's licence, birth certificate or employee ID",
      medicareEntryStamp,
      "One proof of NB address, such as your lease, a utility bill or a pay stub",
    ],
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
    bring: [
      "Valid work permit",
      "One ID, such as your passport photo page, employee ID, NB driver's licence or birth certificate",
      medicareEntryStamp,
      "One proof of NB address, such as your lease, a pay stub or a letter from your employer",
    ],
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
    bring: [
      "Each person: PR card or COPR, their permit, or a Canadian birth certificate for children born in Canada",
      "Each person: one ID, such as their passport photo page, birth certificate, student ID or NB ID card",
      "Each person: the passport page with their last entry stamp (required, even if they use a different ID)",
      "You only: one proof of NB address, such as your lease or a utility bill",
    ],
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
    detail:
      "A tax-free monthly payment from the Canada Revenue Agency for each child under 18 who lives with you. You can apply as soon as you arrive.",
    bring: [
      "Form RC66, Canada Child Benefits Application",
      "Schedule RC66SCH, Status in Canada and Income Information (required for newcomers)",
      "Proof of status in Canada for you or your spouse, such as a PR card, COPR or permit",
      "Proof of birth for each child, with an English or French translation if needed",
      "Your income from all sources, inside and outside Canada, for up to 2 years before you arrived",
      "Your SIN",
    ],
    where: "By mail to your tax centre, with both forms signed",
    cost: "Free to apply",
    timeline: "About 11 weeks for a paper application",
    keyFacts: [
      "You qualify if your child is under 18 and lives with you, you are mainly responsible for their care, and you live in Canada for tax purposes.",
      "You or your spouse must be a citizen, permanent resident, protected person or temporary resident. Refugee claimants are not eligible.",
      "Temporary residents: payments can start in your 19th month in Canada, if you hold a valid permit in that month.",
      "July 2026 to June 2027: up to $8,157 a year ($679.75 a month) for each child under 6, and up to $6,883 a year ($573.58 a month) for each child aged 6 to 17. Payments go down once family net income is over $38,237.",
      "The payments are not taxable. You do not report them on your tax return.",
      "Spouse lived outside Canada for part of a year? Also send Form CTB9 for each of those years.",
      "When your permit is renewed, send the new permit to the CRA before the old one expires, or your payments stop.",
      "You and your spouse each need to file a tax return every year, generally by April 30 (June 15 if either of you is self-employed). The CRA uses it to calculate your payments.",
      "The same application counts for the Canada Groceries and Essentials Benefit (formerly the GST/HST credit).",
      "Track your application in your CRA My Account.",
    ],
    officialSourceUrl:
      "https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit/how-apply.html",
    sortOrder: 28,
    profiles: [FAMILY],
  },
  {
    // Slug kept from when this card was shared, so progress saved in browsers still matches.
    slug: "bank-account",
    ...bankShared,
    detail: `${bankDetail} As a student and a newcomer in your first year, you qualify for a no-cost account.`,
    bring: [
      "One original ID with your name and date of birth, such as your passport, study permit, or a Canadian driver's licence",
      ...bankAddressDocs,
    ],
    cost: "$0 a month: students and newcomers in their first year qualify for a no-cost account",
    profiles: [INTERNATIONAL_STUDENT],
  },
  {
    slug: "bank-account-permanent-resident",
    ...bankShared,
    detail: `${bankDetail} In your first year in Canada, you qualify for a no-cost newcomer account.`,
    bring: [
      "One original ID with your name and date of birth, such as your passport, PR card, or a Canadian driver's licence",
      ...bankAddressDocs,
    ],
    cost: "$0 a month in your first year in Canada, then $4 or less for a low-cost account",
    profiles: [PERMANENT_RESIDENT],
  },
  {
    slug: "bank-account-work-permit",
    ...bankShared,
    detail: `${bankDetail} In your first year in Canada, you qualify for a no-cost newcomer account.`,
    bring: [
      "One original ID with your name and date of birth, such as your passport, work permit, or a Canadian driver's licence",
      ...bankAddressDocs,
    ],
    cost: "$0 a month in your first year in Canada, then $4 or less for a low-cost account",
    profiles: [WORK_PERMIT_HOLDER],
  },
  {
    slug: "bank-account-family",
    ...bankShared,
    title: "Open bank accounts for your family",
    detail: `${bankDetail} Newcomers in their first year and children 18 or younger qualify for a no-cost account.`,
    bring: [
      "Each adult opening an account: one original ID with their name and date of birth, such as their passport, PR card or permit",
      ...bankAddressDocs,
    ],
    cost: "$0 a month for newcomers in their first year and for children 18 or younger",
    profiles: [FAMILY],
  },
  {
    slug: "phone-plan",
    title: "Get a Canadian phone number",
    detail:
      "Employers, landlords, your bank and government offices need a local number to reach you. Compare prepaid and monthly plans before you sign.",
    bring: [
      "Photo ID, such as your passport",
      "A way to pay, such as a debit or credit card",
      "Your phone from home, if you want to keep using it",
    ],
    where: "Any phone company store, or online",
    cost: "Depends on the plan. Prepaid has no contract",
    keyFacts: [
      "A phone company cannot require your SIN to give you service.",
      "Changed your mind? You can return the phone and cancel a new contract within 15 days without penalty, if you used no more than half your monthly allowance. People with disabilities get 30 days.",
      "You can cancel a contract after 2 years with no cancellation fee, even if you agreed to a longer term.",
      "Phones sold in Canada must be unlocked, and unlocking is free. A phone from home must also work on Canadian networks, so check before you buy a plan.",
      "Your phone company must stop data overage charges at $50 a month, unless you agree to pay more.",
      "Prepaid plans need no contract, which suits a short stay or someone without Canadian credit history.",
    ],
    officialSourceUrl: "https://crtc.gc.ca/eng/phone/mobile/code.htm",
    sortOrder: 35,
    profiles: [INTERNATIONAL_STUDENT, PERMANENT_RESIDENT, WORK_PERMIT_HOLDER, FAMILY],
  },
  {
    // Slug kept from when this card was shared, so progress saved in browsers still matches.
    slug: "drivers-licence",
    ...licenceShared,
    detail: `You do not need to exchange your licence while you are in school. ${licenceDetail}`,
    bring: licenceBring("Your study permit"),
    keyFacts: [
      "Students do not need to exchange their licence while in school, but must once they become employed or a permanent resident.",
      licenceTemporaryGrace,
      ...licenceFacts,
    ],
    profiles: [INTERNATIONAL_STUDENT],
  },
  {
    slug: "drivers-licence-permanent-resident",
    ...licenceShared,
    detail: `New residents must get a New Brunswick licence as soon as they move here. ${licenceDetail}`,
    bring: licenceBring("Your PR card or COPR"),
    keyFacts: licenceFacts,
    profiles: [PERMANENT_RESIDENT],
  },
  {
    slug: "drivers-licence-work-permit",
    ...licenceShared,
    detail: `If your work permit is valid for more than 6 months, you can drive on your home licence for your first 6 months. ${licenceDetail}`,
    bring: licenceBring("Your work permit"),
    keyFacts: [licenceTemporaryGrace, ...licenceFacts],
    profiles: [WORK_PERMIT_HOLDER],
  },
  {
    slug: "drivers-licence-family",
    ...licenceShared,
    title: "Get NB driver's licences for each driver",
    detail: `Each person who will drive needs their own licence. ${licenceDetail}`,
    bring: [
      "Each driver: their original licence from home, with an official English or French translation if needed",
      "Each driver: their PR card, COPR or permit",
      "Each driver: one ID and two proofs of NB address",
    ],
    keyFacts: [
      "Permanent residents must get a New Brunswick licence as soon as they move here.",
      licenceTemporaryGrace,
      ...licenceFacts,
    ],
    profiles: [FAMILY],
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
