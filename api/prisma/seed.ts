import { PrismaClient, ProfileType } from "@prisma/client";
import { checklistFingerprint } from "../src/lib/fingerprint.js";

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
  "For ID, a PR card, a study or work permit, or a foreign passport with your immigration documents works. A Medicare card or school ID does not.",
  "Your two proofs of address must come from two different organizations, for example your lease and a utility bill.",
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

// French text for each card, shown when the site is in French. Uses the terms the federal and NB governments use
// in French: NAS, carte de RP, CRP, Service Nouveau-Brunswick, Assurance-maladie, ARC.
type French = {
  title: string;
  detail: string;
  bring: string[];
  where?: string;
  cost?: string;
  timeline?: string;
  keyFacts: string[];
};

const sinSharedFr = {
  title: "Obtenir votre numéro d'assurance sociale (NAS)",
  where: "En ligne, par la poste ou en personne dans un Centre Service Canada, sur rendez-vous",
  cost: "Gratuit",
};
const sinDetailFr =
  "Un numéro à 9 chiffres dont vous avez besoin pour travailler au Canada, y compris à temps partiel, et pour recevoir des prestations du gouvernement.";
const sinSecondIdFr =
  "Une deuxième pièce d'identité avec votre nom légal complet et votre date de naissance : passeport (de n'importe quel pays), permis de conduire canadien, carte d'identité provinciale ou autre pièce d'identité du gouvernement canadien";
const sinTemporaryTimelineFr = "Environ 5 jours ouvrables en ligne, environ 20 par la poste, le jour même en personne";
const sinPermanentTimelineFr = "Le jour même en personne. En ligne, c'est plus rapide que par la poste";
const sinMayWorkFr = (permit: string) =>
  `${permit} qui indique que vous « pouvez travailler » ou « pouvez accepter un emploi » au Canada (en anglais : « may work » ou « may accept employment »)`;
const sinTemporaryFactsFr = [
  "Votre NAS commence par 9 et expire le même jour que votre permis. Mettez-le à jour chaque fois que vous obtenez un nouveau permis.",
  "Vous avez demandé la prolongation de votre permis avant son expiration? Vous pouvez continuer à travailler avec votre NAS expiré jusqu'à la décision d'IRCC.",
  "Vous pouvez commencer à travailler dès que vous avez présenté votre demande, sans attendre votre numéro.",
];
const sinApplyFactsFr = [
  "Votre deuxième pièce d'identité doit être délivrée par un gouvernement canadien ou être un passeport. Un permis de conduire d'un autre pays ne compte pas.",
  "Vous ne recevrez pas de carte en plastique. Service Canada vous envoie plutôt une lettre de confirmation.",
  "Les documents doivent être en français ou en anglais, ou traduits. Un membre de votre famille ne peut pas faire la traduction.",
  "Si vous oubliez un document, vous ne pouvez pas modifier votre demande. Vous devez en présenter une nouvelle.",
];
const sinProtectFactsFr = [
  "Donnez votre NAS seulement à votre employeur une fois embauché, à votre banque et au gouvernement. Les propriétaires, les entreprises de téléphonie et les demandes d'emploi ne peuvent pas l'exiger.",
  "Ne donnez jamais votre NAS à quelqu'un qui vous appelle, vous texte ou vous écrit. Méfiez-vous des messages qui menacent de bloquer ou d'annuler votre NAS : c'est une arnaque.",
  "Ne gardez pas votre lettre de NAS dans votre portefeuille. Rangez-la en lieu sûr à la maison.",
];

const bankSharedFr = {
  title: "Ouvrir un compte bancaire",
  where: "N'importe quelle succursale bancaire. Vous devrez peut-être vous présenter en personne la première fois",
  keyFacts: [
    "Apportez les originaux. Les banques n'acceptent pas de copies de vos pièces d'identité.",
    "Le passeport n'est pas obligatoire. Deux documents de la liste acceptée par la banque suffisent, par exemple un permis de conduire canadien et une facture de services publics.",
    "Option 2 : pas encore de document avec votre adresse? Apportez une pièce d'identité avec votre nom et votre date de naissance, et demandez à une personne en qui la banque a confiance, comme un client existant ou un membre respecté de la communauté, de confirmer votre identité.",
    "Un bail ne figure pas sur la liste acceptée. Si vous n'avez qu'un passeport et un permis, renseignez-vous auprès de la banque sur l'option 2 ou sur les autres documents qu'elle accepte.",
    "Demandez un compte à frais modiques ou sans frais en le nommant. Un compte à frais modiques coûte 4 $ ou moins par mois, comprend au moins 18 opérations de débit et ne peut pas exiger de solde minimum.",
    "Une banque ne peut vous refuser que pour des raisons précises, comme un soupçon de fraude. Si elle refuse, elle doit vous le dire par écrit et vous expliquer comment porter plainte.",
    "Votre banque peut vous demander votre NAS, car elle doit déclarer les intérêts que vous gagnez.",
    "Comparez les comptes avec l'Outil de comparaison des comptes bancaires de l'Agence de la consommation en matière financière du Canada.",
  ],
};
const bankDetailFr =
  "Vous avez besoin d'un compte canadien pour être payé, payer votre loyer et recevoir les paiements du gouvernement.";
const bankAddressDocsFr = [
  "Un document original avec votre nom et votre adresse, comme une facture canadienne récente de services publics, un relevé bancaire ou de carte de crédit, ou un relevé de prestations ou d'impôt du gouvernement",
  "Pas encore de document avec votre adresse? Vous pouvez quand même ouvrir un compte : voyez l'option 2 sous « À savoir »",
];
const bankNewcomerCostFr = "0 $ par mois dans votre première année au Canada, puis 4 $ ou moins pour un compte à frais modiques";

const licenceSharedFr = {
  title: "Échanger ou obtenir un permis de conduire",
  where: "N'importe quel centre de Service Nouveau-Brunswick",
  cost: "Jusqu'à 100 $ pour le permis. Si vous devez passer un examen sur route, 25 $ plus la TVH",
  timeline:
    "Vous recevez un permis temporaire de 30 jours lors de votre demande. Votre carte est envoyée par la poste dans un délai d'environ 14 jours",
};
const licenceDetailFr =
  "Selon votre pays, vous échangez votre permis ou vous passez tous les examens. Un permis du N.-B. est aussi une pièce d'identité officielle avec photo.";
const licenceBringFr = (statusDocument: string) => [
  "Votre permis original de votre pays",
  "Une traduction officielle en français ou en anglais, s'il est dans une autre langue (d'une agence de traduction, ou un permis de conduire international)",
  statusDocument,
  "Une pièce d'identité et deux preuves d'adresse au N.-B.",
];
const licenceTemporaryGraceFr =
  "Avec un permis de travail ou d'études valide pour plus de 6 mois, vous pouvez conduire avec le permis valide de votre pays pendant au plus 6 mois à partir de votre arrivée au Canada.";
const licenceFactsFr = [
  "Aucun examen écrit ni sur route si votre permis vient de : l'Allemagne, l'Australie, l'Autriche, la Belgique, la Corée du Sud, le Danemark, l'Espagne, la France, l'île de Man, l'Irlande, l'Italie, le Japon, la Norvège, la Nouvelle-Zélande, les Pays-Bas, le Portugal, le Royaume-Uni (Angleterre, Écosse, pays de Galles), la Suède, la Suisse, Taïwan ou l'Ukraine.",
  "Les permis des autres provinces canadiennes et des États américains sont échangés classe pour classe, sans examen.",
  "Si votre permis vient d'un autre pays, vous passez tous les examens : un examen de la vue, un examen théorique écrit et un examen sur route.",
  "Comme pièce d'identité, une carte de RP, un permis d'études ou de travail, ou un passeport étranger avec vos documents d'immigration sont acceptés. Une carte d'assurance-maladie ou une carte étudiante ne l'est pas.",
  "Vos deux preuves d'adresse doivent venir de deux organisations différentes, par exemple votre bail et une facture de services publics.",
  "Taïwan : apportez aussi une traduction anglaise authentifiée par le Bureau économique et culturel de Taipei à Toronto, et un certificat de vérification délivré au cours des 3 derniers mois. Ukraine : les permis de catégorie B ou BE exigent un examen de la vue.",
  "L'examen théorique peut se faire en ligne ou dans un centre de Service Nouveau-Brunswick. Attendez au moins 4 jours ouvrables après l'avoir réussi avant de vous présenter à un centre pour l'étape suivante.",
  "Réservez l'examen sur route en ligne ou au 1-888-762-8600. Venez avec un conducteur titulaire d'un permis complet depuis au moins 3 ans, et un véhicule immatriculé et assuré.",
  "Vous échangez le permis de votre pays le jour de votre examen sur route? Arrivez 45 minutes à l'avance.",
  "Le Nouveau-Brunswick conserve le permis de votre pays pendant 5 ans après l'échange.",
  "Des questions? Appelez la Direction des véhicules à moteur au 506-453-2410.",
];

const medicareWhereFr =
  "En ligne, ou avec le formulaire papier envoyé par la poste ou par courriel, ou déposé dans un centre de Service Nouveau-Brunswick";
const medicareTimelineFr = "De 10 à 12 semaines. Vous recevez une lettre avec votre date de début, puis votre carte";
const medicareEntryStampFr =
  "La page de votre passeport avec votre dernier timbre d'entrée (obligatoire, même si vous utilisez une autre pièce d'identité ci-dessus)";
const medicarePrivateFr = "D'ici le début de votre couverture, pensez à une assurance maladie privée.";
const medicareBeforeYouApplyFr = [
  "Vous ne pouvez présenter une demande qu'après avoir emménagé au Nouveau-Brunswick.",
  "Le passeport n'est pas la seule pièce d'identité acceptée. Vous pouvez aussi utiliser un certificat de naissance canadien ou traduit, un permis de conduire ou une carte d'identité du N.-B., une carte étudiante, une carte d'employé, un certificat de citoyenneté, une carte de statut des Premières Nations, un certificat de baptême indiquant le lieu et la date de naissance, ou une carte d'assurance-maladie d'une autre province.",
  "La page du timbre d'entrée n'est pas votre pièce d'identité. Elle indique à l'Assurance-maladie quand vous êtes arrivé au Canada; elle est donc exigée en plus de votre pièce d'identité.",
  "Pas de timbre d'entrée dans votre passeport? Appelez le 1-888-762-8600 avant de présenter votre demande et demandez quoi envoyer à la place.",
  "Votre preuve d'adresse doit indiquer votre nom et votre adresse au N.-B. : par exemple un bail, une facture de services publics, un talon de paie, une lettre de l'employeur ou une police d'assurance locataire.",
  "Envoyez des photocopies, pas les originaux. Chaque document ne peut servir qu'à une seule exigence, et une demande à laquelle il manque un document n'est pas traitée.",
  "Présentez une seule demande. N'envoyez pas de formulaire papier si vous avez déjà fait votre demande en ligne.",
  "L'Assurance-maladie peut demander d'autres documents, par exemple de pays où vous avez vécu, travaillé ou étudié, ou une preuve de changement de nom.",
];
const medicareAfterYouApplyFr = [
  "Informez l'Assurance-maladie de tout changement de statut, de permis ou d'adresse, sinon vous pourriez perdre votre couverture.",
  "Pas de lettre après 14 semaines? Appelez Service Nouveau-Brunswick au 1-888-762-8600.",
  "Pas encore de médecin de famille? Inscrivez-vous à NB Health Link sur nbhealthlink.ca. En attendant, composez le 811 à tout moment pour parler à une infirmière.",
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
    fr: {
      ...sinSharedFr,
      detail: sinDetailFr,
      bring: [sinMayWorkFr("Un permis d'études"), sinSecondIdFr],
      timeline: sinTemporaryTimelineFr,
      keyFacts: [
        "Si votre permis d'études n'indique pas que vous pouvez travailler, communiquez avec IRCC pour obtenir un permis modifié avant de présenter votre demande. Un courriel d'IRCC n'est pas accepté.",
        ...sinTemporaryFactsFr,
        ...sinApplyFactsFr,
        ...sinProtectFactsFr,
      ],
    },
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
    fr: {
      ...sinSharedFr,
      detail: `${sinDetailFr} En tant que résident permanent, votre NAS n'expire pas.`,
      bring: [
        "Carte de RP, ou votre Confirmation de résidence permanente (CRP) si vous êtes devenu résident permanent il y a moins d'un an",
        sinSecondIdFr,
      ],
      timeline: sinPermanentTimelineFr,
      keyFacts: [
        "Vous aviez déjà un NAS commençant par 9 grâce à un permis d'études ou de travail? Mettez à jour votre dossier de NAS avec votre nouveau statut de RP.",
        ...sinApplyFactsFr,
        ...sinProtectFactsFr,
      ],
    },
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
    fr: {
      ...sinSharedFr,
      detail: sinDetailFr,
      bring: [sinMayWorkFr("Un permis de travail"), sinSecondIdFr],
      timeline: sinTemporaryTimelineFr,
      keyFacts: [
        "Apportez le permis lui-même. Un courriel d'IRCC n'est pas accepté.",
        ...sinTemporaryFactsFr,
        ...sinApplyFactsFr,
        ...sinProtectFactsFr,
      ],
    },
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
    fr: {
      ...sinSharedFr,
      title: "Obtenir un NAS pour chaque adulte qui travaillera",
      detail:
        "Un numéro à 9 chiffres dont chaque personne a besoin pour travailler au Canada et recevoir des prestations du gouvernement. Chaque personne présente sa demande avec ses propres documents.",
      bring: [
        "Chaque personne : sa carte de RP (ou sa CRP, dans l'année qui suit l'obtention de la résidence permanente), ou son permis de travail ou d'études",
        `Chaque adulte : ${sinSecondIdFr.charAt(0).toLowerCase()}${sinSecondIdFr.slice(1)}`,
      ],
      timeline: sinPermanentTimelineFr,
      keyFacts: [
        "Les résidents permanents obtiennent un NAS qui n'expire pas.",
        "Seuls les adultes qui ont atteint l'âge de la majorité ont besoin d'une deuxième pièce d'identité. Les enfants n'ont besoin que de leur document de statut.",
        "Les membres de la famille titulaires d'un permis de travail ou d'études ont besoin d'un permis qui indique qu'ils « peuvent travailler » ou « peuvent accepter un emploi » (« may work » ou « may accept employment »). Leur NAS commence par 9 et expire le même jour que leur permis.",
        ...sinApplyFactsFr,
        ...sinProtectFactsFr,
      ],
    },
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
    fr: {
      title: "Vérifier votre couverture santé",
      detail:
        "Les étudiants étrangers à temps plein peuvent obtenir l'Assurance-maladie du Nouveau-Brunswick, mais la couverture met des semaines à commencer. Demandez à votre bureau des étudiants internationaux ce qui vous couvre d'ici là, pour ne jamais vous retrouver sans protection.",
      bring: [
        "Permis d'études",
        "Une pièce d'identité, comme la page photo de votre passeport, votre carte étudiante, votre permis de conduire du N.-B. ou votre certificat de naissance",
        medicareEntryStampFr,
        "Une preuve d'inscription à temps plein pour toute l'année scolaire",
        "Une preuve d'adresse au N.-B., comme votre bail ou une facture de services publics",
      ],
      where:
        "D'abord votre bureau des étudiants internationaux, puis la demande d'Assurance-maladie en ligne ou avec le formulaire papier",
      cost: "Demande d'Assurance-maladie gratuite",
      timeline: medicareTimelineFr,
      keyFacts: [
        "Vous devez étudier à temps plein pendant toute l'année scolaire. Les étudiants à temps partiel et les étudiants en échange ne sont pas admissibles à l'Assurance-maladie.",
        "Votre lettre d'acceptation n'est pas acceptée. Demandez à votre établissement une preuve d'inscription pour une année scolaire complète.",
        ...medicareBeforeYouApplyFr,
        "D'ici le début de votre Assurance-maladie, assurez-vous d'être couvert par le régime de santé de votre établissement ou par une assurance privée.",
        ...medicareAfterYouApplyFr,
      ],
    },
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
    fr: {
      title: "Demander votre carte d'assurance-maladie",
      detail:
        "Votre assurance maladie provinciale. En tant que résident permanent, vous y avez droit dès que le Nouveau-Brunswick est votre résidence permanente. Faites la demande dès votre arrivée.",
      bring: [
        "Carte de RP (recto verso), CRP ou fiche relative au droit d'établissement",
        "Une pièce d'identité, comme la page photo de votre passeport, votre permis de conduire du N.-B., votre certificat de naissance ou votre carte d'employé",
        medicareEntryStampFr,
        "Une preuve d'adresse au N.-B., comme votre bail, une facture de services publics ou un talon de paie",
      ],
      where: medicareWhereFr,
      cost: "Demande gratuite",
      timeline: medicareTimelineFr,
      keyFacts: [
        "Posséder une propriété ou payer des impôts ici ne suffit pas. Le Nouveau-Brunswick doit être votre résidence permanente et principale.",
        ...medicareBeforeYouApplyFr,
        medicarePrivateFr,
        ...medicareAfterYouApplyFr,
      ],
    },
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
    fr: {
      title: "Demander votre carte d'assurance-maladie",
      detail:
        "Votre assurance maladie provinciale. Vérifiez que votre permis de travail vous y donne droit, puis faites la demande dès votre arrivée.",
      bring: [
        "Permis de travail valide",
        "Une pièce d'identité, comme la page photo de votre passeport, votre carte d'employé, votre permis de conduire du N.-B. ou votre certificat de naissance",
        medicareEntryStampFr,
        "Une preuve d'adresse au N.-B., comme votre bail, un talon de paie ou une lettre de votre employeur",
      ],
      where: medicareWhereFr,
      cost: "Demande gratuite",
      timeline: medicareTimelineFr,
      keyFacts: [
        "Le ministère de la Santé a indiqué que votre permis de travail doit être valide pendant 12 mois ou plus; les travailleurs saisonniers ne sont donc généralement pas admissibles. Appelez le 1-888-762-8600 pour le confirmer avant de présenter votre demande.",
        "Si votre permis de travail arrive à expiration, joignez la preuve d'IRCC que vous avez demandé sa prolongation, comme l'accusé de réception.",
        ...medicareBeforeYouApplyFr,
        medicarePrivateFr,
        "Quand vous obtenez un nouveau permis, envoyez-le à l'Assurance-maladie pour que votre couverture ne soit pas interrompue.",
        ...medicareAfterYouApplyFr,
      ],
    },
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
    fr: {
      title: "Demander l'Assurance-maladie pour votre famille",
      detail:
        "L'assurance maladie provinciale pour chaque membre de votre famille. Une seule demande peut inclure tout le monde. Faites la demande dès votre arrivée.",
      bring: [
        "Chaque personne : carte de RP ou CRP, son permis, ou un certificat de naissance canadien pour les enfants nés au Canada",
        "Chaque personne : une pièce d'identité, comme la page photo de son passeport, son certificat de naissance, sa carte étudiante ou sa carte d'identité du N.-B.",
        "Chaque personne : la page de son passeport avec son dernier timbre d'entrée (obligatoire, même si elle utilise une autre pièce d'identité)",
        "Vous seulement : une preuve d'adresse au N.-B., comme votre bail ou une facture de services publics",
      ],
      where: medicareWhereFr,
      cost: "Demande gratuite",
      timeline: medicareTimelineFr,
      keyFacts: [
        "Chaque personne inscrite à la demande a besoin de son propre document de statut et de sa pièce d'identité. Seul le demandeur principal doit fournir une preuve d'adresse.",
        "Si votre famille est ici avec des permis de travail ou d'études plutôt qu'en tant que résidents permanents, appelez le 1-888-762-8600 pour savoir qui est admissible.",
        "Votre bébé est né au Nouveau-Brunswick? Inscrivez-le en appelant le 1-888-762-8600 ou dans un centre de Service Nouveau-Brunswick, et la carte vous sera envoyée par la poste.",
        ...medicareBeforeYouApplyFr,
        "D'ici le début de votre couverture, pensez à une assurance maladie privée pour toute la famille.",
        ...medicareAfterYouApplyFr,
      ],
    },
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
    fr: {
      title: "Demander l'Allocation canadienne pour enfants",
      detail:
        "Un paiement mensuel non imposable de l'Agence du revenu du Canada pour chaque enfant de moins de 18 ans qui vit avec vous. Vous pouvez faire la demande dès votre arrivée.",
      bring: [
        "Formulaire RC66, Demande de prestations canadiennes pour enfants",
        "Annexe RC66SCH, Statut au Canada et renseignements sur le revenu (obligatoire pour les nouveaux arrivants)",
        "Une preuve de votre statut au Canada ou de celui de votre époux ou conjoint de fait, comme une carte de RP, une CRP ou un permis",
        "Une preuve de naissance pour chaque enfant, avec une traduction en français ou en anglais au besoin",
        "Vos revenus de toutes sources, au Canada et à l'étranger, pour un maximum de 2 ans avant votre arrivée",
        "Votre NAS",
      ],
      where: "Par la poste à votre centre fiscal, avec les deux formulaires signés",
      cost: "Demande gratuite",
      timeline: "Environ 11 semaines pour une demande papier",
      keyFacts: [
        "Vous y avez droit si votre enfant a moins de 18 ans et vit avec vous, si vous êtes la principale personne responsable de ses soins et si vous résidez au Canada aux fins de l'impôt.",
        "Vous ou votre époux ou conjoint de fait devez être citoyen, résident permanent, personne protégée ou résident temporaire. Les demandeurs d'asile ne sont pas admissibles.",
        "Résidents temporaires : les paiements peuvent commencer à votre 19e mois au Canada, si vous détenez un permis valide ce mois-là.",
        "De juillet 2026 à juin 2027 : jusqu'à 8 157 $ par année (679,75 $ par mois) pour chaque enfant de moins de 6 ans, et jusqu'à 6 883 $ par année (573,58 $ par mois) pour chaque enfant de 6 à 17 ans. Les paiements diminuent lorsque le revenu familial net dépasse 38 237 $.",
        "Les paiements ne sont pas imposables. Vous ne les déclarez pas dans votre déclaration de revenus.",
        "Votre époux ou conjoint de fait a vécu à l'extérieur du Canada pendant une partie d'une année? Envoyez aussi le formulaire CTB9 pour chacune de ces années.",
        "Lorsque votre permis est renouvelé, envoyez le nouveau permis à l'ARC avant que l'ancien expire, sinon vos paiements s'arrêtent.",
        "Vous et votre époux ou conjoint de fait devez chacun produire une déclaration de revenus chaque année, généralement au plus tard le 30 avril (le 15 juin si l'un de vous est travailleur autonome). L'ARC s'en sert pour calculer vos paiements.",
        "La même demande compte pour la nouvelle prestation pour l'épicerie et les produits essentiels (anciennement le crédit pour la TPS/TVH).",
        "Suivez votre demande dans Mon dossier de l'ARC.",
      ],
    },
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
    fr: {
      ...bankSharedFr,
      detail: `${bankDetailFr} En tant qu'étudiant et nouvel arrivant dans votre première année, vous avez droit à un compte sans frais.`,
      bring: [
        "Une pièce d'identité originale avec votre nom et votre date de naissance, comme votre passeport, votre permis d'études ou un permis de conduire canadien",
        ...bankAddressDocsFr,
      ],
      cost: "0 $ par mois : les étudiants et les nouveaux arrivants dans leur première année ont droit à un compte sans frais",
    },
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
    fr: {
      ...bankSharedFr,
      detail: `${bankDetailFr} Dans votre première année au Canada, vous avez droit à un compte sans frais pour nouveaux arrivants.`,
      bring: [
        "Une pièce d'identité originale avec votre nom et votre date de naissance, comme votre passeport, votre carte de RP ou un permis de conduire canadien",
        ...bankAddressDocsFr,
      ],
      cost: bankNewcomerCostFr,
    },
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
    fr: {
      ...bankSharedFr,
      detail: `${bankDetailFr} Dans votre première année au Canada, vous avez droit à un compte sans frais pour nouveaux arrivants.`,
      bring: [
        "Une pièce d'identité originale avec votre nom et votre date de naissance, comme votre passeport, votre permis de travail ou un permis de conduire canadien",
        ...bankAddressDocsFr,
      ],
      cost: bankNewcomerCostFr,
    },
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
    fr: {
      ...bankSharedFr,
      title: "Ouvrir des comptes bancaires pour votre famille",
      detail: `${bankDetailFr} Les nouveaux arrivants dans leur première année et les enfants de 18 ans ou moins ont droit à un compte sans frais.`,
      bring: [
        "Chaque adulte qui ouvre un compte : une pièce d'identité originale avec son nom et sa date de naissance, comme son passeport, sa carte de RP ou son permis",
        ...bankAddressDocsFr,
      ],
      cost: "0 $ par mois pour les nouveaux arrivants dans leur première année et pour les enfants de 18 ans ou moins",
    },
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
    fr: {
      title: "Obtenir un numéro de téléphone canadien",
      detail:
        "Les employeurs, les propriétaires, votre banque et les bureaux du gouvernement ont besoin d'un numéro local pour vous joindre. Comparez les forfaits prépayés et mensuels avant de signer.",
      bring: [
        "Une pièce d'identité avec photo, comme votre passeport",
        "Un moyen de paiement, comme une carte de débit ou de crédit",
        "Le téléphone de votre pays, si vous voulez continuer à l'utiliser",
      ],
      where: "N'importe quel magasin d'une entreprise de téléphonie, ou en ligne",
      cost: "Selon le forfait. Le prépayé est sans contrat",
      keyFacts: [
        "Une entreprise de téléphonie ne peut pas exiger votre NAS pour vous offrir un service.",
        "Vous avez changé d'idée? Vous pouvez retourner le téléphone et annuler un nouveau contrat dans les 15 jours sans pénalité, si vous n'avez pas utilisé plus de la moitié de votre limite mensuelle. Les personnes handicapées ont 30 jours.",
        "Vous pouvez annuler un contrat après 2 ans sans frais de résiliation, même si vous aviez accepté une durée plus longue.",
        "Les téléphones vendus au Canada doivent être déverrouillés, et le déverrouillage est gratuit. Un téléphone de votre pays doit aussi fonctionner sur les réseaux canadiens; vérifiez-le avant d'acheter un forfait.",
        "Votre entreprise de téléphonie doit arrêter les frais d'utilisation excédentaire de données à 50 $ par mois, sauf si vous acceptez de payer plus.",
        "Les forfaits prépayés n'exigent pas de contrat, ce qui convient à un court séjour ou à une personne sans historique de crédit canadien.",
      ],
    },
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
    fr: {
      ...licenceSharedFr,
      detail: `Vous n'avez pas à échanger votre permis pendant vos études. ${licenceDetailFr}`,
      bring: licenceBringFr("Votre permis d'études"),
      keyFacts: [
        "Les étudiants n'ont pas à échanger leur permis pendant leurs études, mais doivent le faire dès qu'ils occupent un emploi ou deviennent résidents permanents.",
        licenceTemporaryGraceFr,
        ...licenceFactsFr,
      ],
    },
    profiles: [INTERNATIONAL_STUDENT],
  },
  {
    slug: "drivers-licence-permanent-resident",
    ...licenceShared,
    detail: `New residents must get a New Brunswick licence as soon as they move here. ${licenceDetail}`,
    bring: licenceBring("Your PR card or COPR"),
    keyFacts: licenceFacts,
    fr: {
      ...licenceSharedFr,
      detail: `Les nouveaux résidents doivent obtenir un permis du Nouveau-Brunswick dès leur arrivée. ${licenceDetailFr}`,
      bring: licenceBringFr("Votre carte de RP ou votre CRP"),
      keyFacts: licenceFactsFr,
    },
    profiles: [PERMANENT_RESIDENT],
  },
  {
    slug: "drivers-licence-work-permit",
    ...licenceShared,
    detail: `If your work permit is valid for more than 6 months, you can drive on your home licence for your first 6 months. ${licenceDetail}`,
    bring: licenceBring("Your work permit"),
    keyFacts: [licenceTemporaryGrace, ...licenceFacts],
    fr: {
      ...licenceSharedFr,
      detail: `Si votre permis de travail est valide pour plus de 6 mois, vous pouvez conduire avec le permis de votre pays pendant vos 6 premiers mois. ${licenceDetailFr}`,
      bring: licenceBringFr("Votre permis de travail"),
      keyFacts: [licenceTemporaryGraceFr, ...licenceFactsFr],
    },
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
    fr: {
      ...licenceSharedFr,
      title: "Obtenir un permis de conduire du N.-B. pour chaque conducteur",
      detail: `Chaque personne qui conduira a besoin de son propre permis. ${licenceDetailFr}`,
      bring: [
        "Chaque conducteur : son permis original de son pays, avec une traduction officielle en français ou en anglais au besoin",
        "Chaque conducteur : sa carte de RP, sa CRP, ou son permis d'études ou de travail",
        "Chaque conducteur : une pièce d'identité et deux preuves d'adresse au N.-B.",
      ],
      keyFacts: [
        "Les résidents permanents doivent obtenir un permis du Nouveau-Brunswick dès leur arrivée.",
        licenceTemporaryGraceFr,
        ...licenceFactsFr,
      ],
    },
    profiles: [FAMILY],
  },
];

async function main() {
  for (const { profiles, fr, ...data } of items) {
    const item = await prisma.checklistItem.upsert({
      where: { slug: data.slug },
      create: { ...data, lastCheckedAt: checked },
      update: { ...data, lastCheckedAt: checked },
    });
    await prisma.profileItem.deleteMany({ where: { checklistItemId: item.id } });
    await prisma.profileItem.createMany({
      data: profiles.map((profileType) => ({ profileType, checklistItemId: item.id })),
    });
    // Fingerprint the English as saved, so the API can tell when this French no longer matches it.
    const french = { ...(fr as French), sourceHash: checklistFingerprint(item) };
    await prisma.checklistItemTranslation.upsert({
      where: { checklistItemId_locale: { checklistItemId: item.id, locale: "fr" } },
      create: { ...french, checklistItemId: item.id, locale: "fr" },
      update: french,
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
