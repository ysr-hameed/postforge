// The STRATEGIST (mock): reads the site profile and decides WHAT to post and WHICH visual type to use.
// A real LLM can replace this file; it must return the same `posts[]` shape.
// Numbers marked verify:true are placeholders the owner must replace with real data.
import { VISUAL_TYPES } from "./visualTypes.js";

const WHY = {
  "myth-fact": "Myth-busting invites comments from both sides.", "big-stat": "One huge number stops the scroll.", steps: "Step posts get saved, and saves feed reach.",
  checklist: "Checklists are among the most saved formats.", "before-after": "Contrast shows the pain and the payoff at a glance.", quote: "Quote cards are easy shares.",
  offer: "A clear offer with a deadline converts nearby followers.", compare: "Decision content attracts high-intent viewers.", tip: "One sharp tip builds authority.",
  announce: "Announcements drive immediate visits.", "hero-photo": "A strong photo with six words beats a paragraph.", product: "Product spotlights turn browsers into buyers.",
  event: "Invites with a clear date get saved and shared.", greeting: "Occasion posts earn goodwill and reach.", testimonial: "Real voices build trust faster than claims.", "price-list": "People screenshot prices and menus.",
};
const P = (vt, tag, d, why) => ({ vt, tag, d, why: why || WHY[vt] });
const MF = (myth, fact, n, label, tag = "Myth vs Fact", v = false) => P("myth-fact", tag, { myth, fact, stat: { n, label, verify: v } });
const BS = (n, label, context, tag = "By the numbers") => P("big-stat", tag, { n, label, context, verify: true });
const ST = (title, s, tag = "How-to") => P("steps", tag, { title, steps: s.map(([t, d]) => ({ t, d })) });
const CL = (title, items, foot, tag = "Checklist") => P("checklist", tag, { title, items, foot });
const BA = (title, before, after, tag = "Before / After") => P("before-after", tag, { title, before, after });
const QT = (quote, by, tag = "Words that stick") => P("quote", tag, { quote, by });
const OF = (badge, headline, n, label, perks, urgency, sticker, tag = "Offer") => P("offer", tag, { badge, headline, offer: { n, label, verify: true }, perks, urgency, sticker });
const CP = (title, ln, lp, rn, rp, tag = "Compare") => P("compare", tag, { title, left: { name: ln, points: lp }, right: { name: rn, points: rp }, pick: "right" });
const TP = (headline, why, example, chips, tag = "Pro tip") => P("tip", tag, { headline, why, example, chips });
const AN = (badge, headline, accentWord, sub, chips, tag = "New") => P("announce", tag, { badge, headline, accentWord, sub, chips });
const HP = (kicker, headline, flair, sub, tag = "Moment") => P("hero-photo", tag, { kicker, headline, flair, sub });
const PR = (name, price, was, desc, perks, sticker, tag = "Spotlight") => P("product", tag, { name, price, was, desc, perks, sticker, verify: true });
const EV = (title, day, month, time, venue, tag = "You're invited") => P("event", tag, { title, day, month, time, venue });
const GR = (wish, flair, sub, from, tag = "Greetings") => P("greeting", tag, { wish, flair, sub, from });
const TS = (quote, name, role, tag = "Kind words") => P("testimonial", tag, { quote, name, role });
const PL = (title, items, foot, tag = "The list") => P("price-list", tag, { title, items: items.map(([n, p, d]) => ({ n, p, d })), foot });

const L = {
  dev: (n) => [
    MF("Rolling your own auth saves money", "One auth bug costs more than years of a managed setup", "1 bug", "is all it takes", "Dev Truths"),
    ST("Ship login in four steps", [["Install the SDK", "One command, zero config"], ["Add your providers", "Email, Google, GitHub"], ["Protect your routes", "One middleware, done"], ["Go live", "Self-host or cloud"]]),
    BS("10 min", "from zero to working auth", `Replace with your measured setup time for ${n}.`),
    BA("Billing, before and after", ["Webhook spaghetti", "Manual invoices", "Failed-payment panic"], ["Typed events", "Auto invoices", "Smart retries"]),
    CL("Before you launch your SaaS", ["Auth with MFA", "Billing + webhooks tested", "Rate limits on", "Backups verified"], "Save this for launch week.", "Launch list"),
    CP("DIY vs managed", "DIY stack", ["Weeks of setup", "You own every bug", "Constant patching"], n, ["Minutes to start", "Battle-tested core", "Open source, no lock-in"]),
    QT("Ship the product, not the plumbing.", `The ${n} philosophy`, "Builder mindset"),
    HP("Open source", "Built in public, owned by you", "owned", "Self-host it or let us run it.", "Why us"),
  ],
  restaurant: (n) => [
    OF("This weekend", "Family Thali Feast", "₹499", "per person, unlimited refills", ["Dum biryani", "Live tandoor", "Dessert"], "Sat & Sun, limited tables", "Weekend only!", "Weekend Special"),
    HP("Straight from the handi", "Sealed. Slow-cooked. Served hot.", "Slow-cooked", "Dum biryani, opened at your table.", "Signature"),
    MF("Biryani is just spiced rice", "Real dum biryani is sealed and slow-cooked for hours", "3 hrs", "of slow dum cooking", "Kitchen Truth", true),
    PL("Today's favourites", [["Dum Biryani", "₹349", "Chicken or veg"], ["Butter Chicken", "₹329"], ["Dal Makhani", "₹249", "Slow-cooked overnight"], ["Garlic Naan", "₹59"], ["Gulab Jamun", "₹99"]], "Prices are placeholders: replace with your menu.", "The Menu"),
    TS("Tastes like Sunday at my grandmother's house.", "A happy guest", "Replace with a real review", "Guest love"),
    EV("Live Qawwali Dinner", "14", "DEC", "8:00 PM onwards", "Spice Route, Main Street", "Save the date"),
    ST("How our biryani is made", [["Marinate overnight", "Yogurt, spices, patience"], ["Layer the rice", "Half-cooked, saffron on top"], ["Seal the handi", "Dough crust locks the steam"], ["Rest, then serve", "Opened at your table"]], "Behind the dum"),
  ],
  cafe: (n) => [
    PR("Cardamom Cold Brew", "₹220", "₹260", "Slow-steeped for 18 hours, finished with cardamom.", ["18-hr steep", "Oat milk option"], "New!", "On the bar"),
    HP("Good morning", "Slow mornings, warm bread", "warm", "Fresh bakes out of the oven by 8 AM.", "Mornings"),
    PL("Today's bar", [["Flat white", "₹180"], ["Filter coffee", "₹120", "South Indian style"], ["Croissant", "₹150", "Baked at 7 AM"], ["Banana loaf", "₹130"]], "Prices are placeholders.", "Menu"),
    CL("A perfect cafe morning", ["Window seat", "Fresh croissant", "Good playlist", "One more refill"], "Come sit a while.", "Slow living"),
    QT("Life happens, coffee helps.", n, "Daily dose"),
    AN("Open daily", "Your corner, your coffee", "coffee", "7 AM to 10 PM, bring a book.", ["Wi-Fi", "Pet friendly", "Fresh bakes"], "Hello"),
  ],
  fitness: (n) => [
    MF("You need 90 minutes a day", "30 focused minutes, done consistently, beats long skipped sessions", "30", "minutes is enough", "Fitness Facts"),
    ST("Your first week, simplified", [["Day 1: Push", "Press, dips, plank"], ["Day 3: Pull", "Rows and curls"], ["Day 5: Legs", "Squats and lunges"], ["Day 7: Walk", "Active recovery"]], "Starter plan"),
    BS("12 wks", "to a visible change", "Replace with a real member result.", "Proof"),
    BA("Skip it vs show up", ["All or nothing", "Wait for motivation", "Chase perfect"], ["30 minutes daily", "Build a routine", "Progress over perfect"], "Mindset"),
    HP("No excuses", "Show up. Sweat. Repeat.", "Sweat", "Your future self is watching.", "Motivation"),
    OF("Free trial", "Start Strong", "7 days", "free, no card needed", ["Coach chat", "Custom plan", "Cancel anytime"], "Limited spots this month", "Join free!", "Join now"),
    TS("Lost 6 kg and finally enjoy mornings.", "Rohit S.", "Member for 5 months, replace with a real review", "Member story"),
  ],
  fashion: (n) => [
    PR("The Everyday Overshirt", "₹2,499", "₹3,199", "Heavy cotton, relaxed cut, made to be worn out.", ["Pure cotton", "Easy returns"], "New!", "Just dropped"),
    HP("New season", "Wear less. Wear better.", "better", "Ten pieces that work with everything.", "Lookbook"),
    CL("Build a capsule wardrobe", ["Two good jeans", "One white shirt", "A jacket that fits", "Shoes you can walk in"], "Fewer pieces, better days.", "Style guide"),
    CP("Fast fashion vs made to last", "Fast fashion", ["Wears out in months", "Trend today, gone tomorrow", "Cheap each time"], n, ["Lasts for years", "Timeless cuts", "Cheaper per wear"]),
    OF("Limited drop", "Festive Edit", "20% off", "this week only", ["Free shipping", "Easy exchange", "Gift wrap"], "Ends Sunday midnight", "Last days", "Sale"),
    QT("Style is knowing who you are.", n, "Mood"),
  ],
  ecommerce: (n) => [
    OF("Sale", "Festive Edit", "30% off", "storewide this week", ["Free shipping", "Easy returns", "Gift wrap"], "Ends Sunday midnight", "Big sale!", "Sale"),
    PR("Bestseller of the month", "₹1,299", "₹1,799", "Loved by thousands, back in stock.", ["Free shipping", "7-day returns"], "Back!", "Bestseller"),
    CL("Before you buy online", ["Check the return policy", "Read recent reviews", "Compare the real price", "Confirm delivery time"], "We make all four easy.", "Buying guide"),
    CP("Classic vs Premium", "Classic", ["Everyday use", "Great value", "Ships fast"], "Premium", ["Hand-finished", "Longer warranty", "Gift-ready"], "Which one?"),
    AN("Just dropped", "The New Collection", "New", "Fresh pieces, limited batch.", ["Men", "Women", "Home"], "New"),
  ],
  beauty: (n) => [
    MF("Expensive skincare works better", "Consistent, simple routines beat 10-step shelves", "3", "steps are enough", "Skin Truths"),
    ST("A simple evening routine", [["Cleanse", "Gentle, never stripping"], ["Treat", "One active, not five"], ["Moisturise", "Lock it in"], ["Sunscreen next morning", "Non-negotiable"]], "Routine"),
    HP("Glow from within", "Skin first. Everything else second.", "Skin", "Gentle care for real results.", "Philosophy"),
    PR("Vitamin C Glow Serum", "₹899", "₹1,199", "Brightens, evens tone, lightweight finish.", ["Fragrance-free", "Derm tested"], "New!", "Bestseller"),
    PL("Salon menu", [["Signature facial", "₹1,800", "60 minutes"], ["Hair spa", "₹1,200"], ["Manicure", "₹650"], ["Bridal trial", "₹3,500"]], "Prices are placeholders.", "Treatments"),
    TS("My skin has never felt this calm.", "Ananya R.", "Replace with a real review", "Glow stories"),
    EV("Free Skin Consult Day", "09", "DEC", "11 AM to 5 PM", "Glow & Co studio", "Open day"),
  ],
  jewelry: (n) => [
    HP("The new collection", "Gold that tells your story", "story", "Handcrafted, one piece at a time.", "Collection"),
    PR("Heirloom Gold Pendant", "₹48,500", "", "22k gold, hand-finished, comes with a certificate.", ["22k hallmarked", "Lifetime polish"], "New!", "Spotlight"),
    CL("Buying gold jewellery, safely", ["Check the hallmark", "Ask for the making charges", "Keep the certificate", "Compare today's rate"], "Ask us anything, anytime.", "Buyer's guide"),
    QT("Some things are made to be passed down.", n, "Heritage"),
    EV("Bridal Preview Evening", "07", "DEC", "6 PM, by invitation", `${n} studio`, "Private preview"),
    TS("They helped us choose every piece for the wedding.", "The Mehta family", "Replace with a real review", "Our families"),
  ],
  realestate: (n) => [
    HP("Now open for visits", "Come home to light", "light", "3 BHK residences with garden views.", "New launch"),
    PR("3 BHK Garden Residence", "₹1.2 Cr", "", "1,450 sq ft, east-facing, covered parking.", ["RERA registered", "Ready by 2027"], "New!", "Featured"),
    CL("Before you buy a home", ["Verify RERA registration", "Check the title deed", "Visit at different hours", "Ask about hidden charges"], "We walk through each one with you.", "Buyer's guide"),
    CP("Ready-to-move vs under construction", "Under construction", ["Lower price", "Wait for possession", "Delay risk"], "Ready-to-move", ["Move in now", "See what you buy", "No GST on resale"]),
    EV("Site Visit Sunday", "15", "DEC", "10 AM to 4 PM", `${n} sample flat`, "Open house"),
    BS("5 min", "to the nearest metro", "Replace with the real distance.", "Location"),
  ],
  travel: (n) => [
    HP("Quiet corners", "Go where the crowds aren't", "crowds", "Small-group trips, real local stays.", "Escape"),
    ST("Plan a trip in 4 steps", [["Pick the mood", "Mountains, coast or forest"], ["Choose the dates", "Avoid peak weeks"], ["Book local stays", "Homestays over chains"], ["Pack light", "One bag, no regrets"]], "Trip planner"),
    OF("Early bird", "Spiti Valley, 7 days", "₹24,999", "all-inclusive, small group of 10", ["Homestays", "All meals", "Local guide"], "Seats filling fast", "Book now", "Departures"),
    CL("Packing for the hills", ["Layers, not bulk", "Good walking shoes", "Power bank", "A reusable bottle"], "Travel light, see more.", "Pack list"),
    QT("Travel is the only thing you buy that makes you richer.", n, "Wander"),
    GR("Happy Journeys", "Journeys", "Every trip starts with a first step.", n, "Hello"),
  ],
  education: (n) => [
    ST("Learn anything in 4 steps", [["Pick one outcome", "A project, not a topic"], ["Learn the core", "The 20% that gives 80%"], ["Build something", "Ugly first version"], ["Teach it back", "Fastest way to master"]], "Study plan"),
    MF("Re-reading notes is studying", "Active recall beats re-reading, every time", "1 quiz", "beats 3 re-reads", "Study Truths", true),
    CL("Exam week checklist", ["Past papers daily", "Sleep before cramming", "Short breaks every hour", "Formula sheet ready"], "Share with a friend who needs it.", "Exam week"),
    HP("Batch starts soon", "Your future starts in class", "future", "Small batches, real mentors.", "Admissions"),
    TS("I cracked the exam after one focused term.", "Priya K.", "Student, replace with a real review", "Success story"),
    EV("Free Demo Class", "12", "DEC", "5 PM online", `${n} Academy`, "Join us"),
  ],
  agency: (n) => [
    MF("More posts means more growth", "Consistent, useful posts beat daily noise", "3 a week", "is a strong cadence", "Growth Truths", true),
    BA("Your brand, before and after", ["Random posts", "No clear offer", "Silent DMs"], ["Clear message", "One sharp offer", "Leads weekly"], "Transformation"),
    ST("How we work with you", [["Discover", "Goals, audience, offer"], ["Design", "Visuals that look like you"], ["Deliver", "On time, every time"]], "Our process"),
    AN("Open", "Taking 3 new clients", "3", "Book a free strategy call.", ["Branding", "Web", "Social"], "Now booking"),
    HP("Selected work", "We make brands hard to ignore", "ignore", "Strategy, design and content.", "Studio"),
    TS("They doubled our enquiries in two months.", "A happy client", "Replace with a real review", "Client love"),
  ],
  events: (n) => [
    HP("Your big day", "Every ritual, beautifully done", "beautifully", "Planning, decor and everything between.", "Weddings"),
    EV("Wedding Expo Weekend", "20", "DEC", "11 AM to 8 PM", `${n} Experience Studio`, "Visit us"),
    CL("Wedding planning, month by month", ["Fix the budget first", "Book venue early", "Lock the photographer", "Plan the pheras timing"], "We handle the rest.", "Planner"),
    GR("Shubh Vivah", "Vivah", "Wishing the couple a lifetime of joy.", n, "Congratulations"),
    PL("Decor packages", [["Mandap + stage", "₹85,000", "Floral, 3 days"], ["Sangeet setup", "₹55,000"], ["Haldi decor", "₹25,000"]], "Prices are placeholders.", "Packages"),
    TS("They made our wedding feel effortless.", "Aarav & Meera", "Replace with a real review", "Couples"),
  ],
  kids: (n) => [
    HP("Little learners", "Where curiosity grows", "curiosity", "Play-based learning, big smiles.", "Welcome"),
    CL("Signs of a happy preschool", ["Kids run in smiling", "Teachers know every name", "Mess is allowed", "Parents are partners"], "Come see for yourself.", "Parent's guide"),
    EV("Free Trial Weekend", "14", "DEC", "10 AM to 12 PM", `${n} activity club`, "Join the fun"),
    MF("Screen time is the only fun", "Hands-on play builds focus and confidence", "20", "minutes of play a day helps", "Parenting Truths", true),
    GR("Happy Children's Day", "Children's", "Every child is a little star.", n, "Celebrate"),
    OF("Admissions open", "Little Sprouts 2027", "₹0", "registration fee this month", ["Small batches", "Safe campus", "Trained teachers"], "Limited seats", "Join us!", "Admissions"),
  ],
  health: (n) => [
    MF("You can skip regular check-ups", "Small issues are easier and cheaper to fix early", "1 visit", "a year can catch problems early", "Health Truths", true),
    ST("A healthier week, simply", [["Walk 30 minutes", "Daily, any pace"], ["Eat the colours", "Half the plate vegetables"], ["Hydrate", "Water before chai"], ["Sleep on time", "Same hour every night"]], "Wellness"),
    HP("Care that listens", "Healthier, one small step at a time", "small", "Friendly doctors, honest advice.", "Our clinic"),
    CL("When to see a doctor", ["Symptoms last over a week", "Pain keeps returning", "Sudden changes", "Anything that worries you"], "When in doubt, call us.", "Good to know"),
    EV("Free Health Camp", "08", "DEC", "9 AM to 1 PM", `${n} clinic`, "Free camp"),
    TS("Finally a clinic where I felt heard.", "Sunita M.", "Replace with a real review", "Patient voices"),
  ],
  finance: (n) => [
    MF("You need a lot to start investing", "Small monthly amounts compound into real wealth", "₹500", "a month is a start", "Money Truths", true),
    CL("Your money basics", ["Emergency fund first", "Term insurance sorted", "Start a SIP", "Review every year"], "Not financial advice. Replace with your own guidance.", "Checklist"),
    BS("12%", "is not a promise", "Returns vary. Replace with a compliant, verified figure.", "Reality check"),
    ST("Start a SIP in 3 steps", [["Complete KYC", "One time, 10 minutes"], ["Pick a fund", "Match your goal and horizon"], ["Automate it", "Set and forget"]], "How-to"),
    CP("FD vs SIP", "Fixed deposit", ["Fixed, lower returns", "Safe, predictable", "Taxed on interest"], "SIP", ["Market-linked", "Builds over years", "Flexible amounts"], "Compare"),
    QT("Time in the market beats timing the market.", n, "Money mindset"),
  ],
  coach: (n) => [
    MF("You need to feel ready first", "Action creates confidence, not the other way round", "1 step", "today beats a plan tomorrow", "Mindset"),
    QT("Small steps, taken daily, change everything.", n, "Daily thought"),
    ST("Reset your week in 4 steps", [["Review last week", "What worked, what did not"], ["Pick 3 priorities", "Only three"], ["Block the time", "Put it on the calendar"], ["Protect it", "Say no to the rest"]], "Weekly reset"),
    HP("Your next chapter", "Start before you feel ready", "ready", "Clear plans. Real accountability.", "Coaching"),
    TS("In 90 days I changed careers.", "Neha D.", "Client, replace with a real review", "Client wins"),
    EV("Free Workshop", "13", "DEC", "7 PM online", `${n} live session`, "Join live"),
  ],
  generic: (n) => [
    HP("Welcome", `Meet ${n}`, n, "Here is what we do and who we help.", "Hello"),
    CL(`Why people pick ${n}`, ["Clear pricing", "Fast replies", "Real results", "Friendly support"], "Message us to get started.", "Why us"),
    MF("Quality always costs more", "Smart choices give quality and value together", "1", "right choice matters", "Good to know"),
    QT("Do fewer things, and do them well.", n, "Our promise"),
    AN("Open", "We are here for you", "here", "Say hello, we reply fast.", ["Quality", "Service", "Trust"], "Hello"),
  ],
};

const topicIdeas = (topic, n) => [
  HP("Today", cap(topic), topic.split(" ").pop(), `From the ${n} team.`, "Spotlight"),
  MF(`${cap(topic)} is only for experts`, `Anyone can start with ${topic} using a simple routine`, "1 step", "gets you started", "Myth vs Fact"),
  CL(`${cap(topic)}: your checklist`, ["Define the goal", "Start small today", "Track what works", "Fix one thing weekly"], `From the ${n} team.`, "Checklist"),
  ST(`Start ${topic} in 3 steps`, [["Learn the basics", "Keep it simple"], ["Try one small thing", "Today, not someday"], ["Review and repeat", "Weekly rhythm"]], "How to"),
  TP(`The fastest win in ${topic}`, "Small, consistent actions compound faster than big rare ones.", `Example: 15 minutes on ${topic} every day.`, ["Simple", "Repeatable", "Effective"]),
  BA(`${cap(topic)}: old way vs better way`, ["Guessing", "Doing too much", "No tracking"], ["Clear plan", "Doing the key thing", "Weekly review"], "Shift"),
];
const OCCASIONS = /diwali|deepavali|eid|holi|christmas|new year|navratri|dussehra|raksha|rakhi|birthday|anniversary|independence|republic|ganesh|onam|pongal|baisakhi|valentine|mother|father|teacher|women'?s day|children/i;
const occasion = (topic, n) => [
  GR(`Happy ${cap(topic.replace(/\s*(wishes|greetings|post)\s*/i, "").trim())}`, cap(topic.replace(/\s*(wishes|greetings|post)\s*/i, "").trim()).split(" ").pop(), "Wishing you joy, light and good times.", n, "Greetings"),
  HP("With warm wishes", `${cap(topic.replace(/\s*(wishes|greetings|post)\s*/i, "").trim())} from all of us`, "us", `The ${n} family`, "Greetings"),
  QT("May this season bring you closer to the people who matter.", n, "Season's thoughts"),
  AN("Special", `${cap(topic.replace(/\s*(wishes|greetings|post)\s*/i, "").trim())} offers`, "offers", "Something special, just for the season.", ["Gifts", "Offers", "Surprises"], "Festive"),
];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function planPosts(profile, { topic = "", count = 6, seed = 11, only = null } = {}) {
  const t = topic.trim();
  const lead = t ? (OCCASIONS.test(t) ? occasion(t, profile.name) : topicIdeas(t, profile.name)) : [];
  const pool = [...lead, ...(L[profile.niche] || L.generic)(profile.name)];
  let list = only ? pool.filter((p) => p.vt === only) : pool;
  if (!list.length) list = pool;
  const r = rng(seed), used = new Set(), out = [];
  const head = list.slice(0, lead.length), rest = list.slice(lead.length).sort(() => r() - 0.5);
  const ordered = [...head.slice(0, Math.min(2, head.length)), ...[...head.slice(2), ...rest].sort(() => r() - 0.5)];
  const kinds = new Set(list.map((p) => p.vt));
  while (out.length < Math.min(count, list.length)) {
    const next = ordered.find((p) => !out.includes(p) && !used.has(p.vt)) || ordered.find((p) => !out.includes(p));
    if (!next) break;
    used.add(next.vt); out.push(next);
    if (used.size >= kinds.size) used.clear();
  }
  return out.map((p, i) => ({
    id: `post-${i + 1}`, visualType: p.vt, visualLabel: VISUAL_TYPES[p.vt].label, tag: p.tag, why: p.why, data: p.d, seed: seed + i * 13,
    photoBg: p.vt === "hero-photo", needsVerification: JSON.stringify(p.d).includes('"verify":true'),
  }));
}
