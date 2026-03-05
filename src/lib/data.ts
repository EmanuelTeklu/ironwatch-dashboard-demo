// ---------------------------------------------------------------------------
// IronWatch + Pegasus — Rich Mock Data
// Dittmar contract: 24 Arlington-area sites, 9PM–5AM, nightly operations
// ---------------------------------------------------------------------------

import type {
  Site,
  Guard,
  CallOut,
  Rover,
  ScheduleEntry,
  SimEvent,
  SiteFamiliarity,
  CallOutRecord,
} from "./types";

// --- Day labels (used by CallOutsView) ------------------------------------

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// --- SITES (24 Dittmar properties) ----------------------------------------

export const SITES: Site[] = [
  {
    id: 1001,
    name: "Ballston Tower",
    addr: "4200 Fairfax Dr, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001001",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Gate code 4819#. Patrol parking decks P1-P3. Client prefers foot patrol over vehicle.",
  },
  {
    id: 1002,
    name: "Clarendon Gate",
    addr: "2800 Clarendon Blvd, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001002",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Main entrance locked after 22:00. Check dumpster area for trespassers. Property manager: Dave K.",
  },
  {
    id: 1003,
    name: "Columbia Park",
    addr: "942 S Wakefield St, Arlington VA",
    armed: true,
    tier: "A",
    phone: "+15551001003",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Armed post. Pool area must be locked by 22:00. Alarm panel code 7291. Two prior incidents this quarter.",
  },
  {
    id: 1004,
    name: "Pentagon Row",
    addr: "1201 S Joyce St, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001004",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Heavy foot traffic until midnight. Focus on retail corridor and underground garage.",
  },
  {
    id: 1005,
    name: "Crystal City Plaza",
    addr: "2231 Crystal Dr, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001005",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Metro entrance adjacent. Watch for loitering near south stairwell after last train.",
  },
  {
    id: 1006,
    name: "Rosslyn Heights",
    addr: "1919 N Nash St, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001006",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Rooftop access must be verified locked at 21:30. Elevator camera on 3rd floor is intermittent.",
  },
  {
    id: 1007,
    name: "Courthouse Square",
    addr: "2150 N Courthouse Rd, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001007",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Adjacent to courthouse parking. Check for overnight sleepers in lobby. Gate code 3356#.",
  },
  {
    id: 1008,
    name: "Virginia Square Towers",
    addr: "3444 Fairfax Dr, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001008",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Two buildings connected by skybridge. Patrol both lobbies every 90 min.",
  },
  {
    id: 1009,
    name: "Dolley Madison Towers",
    addr: "2300 24th Rd S, Arlington VA",
    armed: true,
    tier: "A",
    phone: "+15551001009",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Armed post. VIP residents on floors 8-10. Concierge desk staffed until 23:00. Alarm code 5518.",
  },
  {
    id: 1010,
    name: "Randolph Towers",
    addr: "4001 9th St N, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001010",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Loading dock must be secured by 22:00. Trash compactor area is a blind spot — check frequently.",
  },
  {
    id: 1011,
    name: "The Amelia",
    addr: "816 N Oakland St, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001011",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Boutique property, 42 units. Residents complain about noise from bar next door after midnight.",
  },
  {
    id: 1012,
    name: "Thomas Court",
    addr: "470 N Thomas St, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001012",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Small property. Single patrol loop takes ~20 min. Key box code 1147.",
  },
  {
    id: 1013,
    name: "Thomas Place",
    addr: "461 N Thomas St, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001013",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Sister property to Thomas Court. Guards sometimes cover both. Shared parking garage.",
  },
  {
    id: 1014,
    name: "Henderson Park",
    addr: "4301 Henderson Rd, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001014",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Park-adjacent. Wildlife occasionally triggers motion sensors. Verify before escalating.",
  },
  {
    id: 1015,
    name: "Birchwood",
    addr: "545 N Pollard St, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001015",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Older building, no elevator cameras. Extra attention to stairwells B and C.",
  },
  {
    id: 1016,
    name: "Quincy Plaza",
    addr: "3900 Fairfax Dr, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001016",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Mixed-use with retail ground floor. Stores close at 21:00 — verify storefronts locked.",
  },
  {
    id: 1017,
    name: "Richmond Square",
    addr: "900 N Randolph St, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001017",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Courtyard area needs patrol every hour. Irrigation system runs at 02:00 — do not report as leak.",
  },
  {
    id: 1018,
    name: "Wildwood Park",
    addr: "5550 Columbia Pike, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001018",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Property backs up to wooded area. Flashlight patrol of perimeter fence at 23:00 and 03:00.",
  },
  {
    id: 1019,
    name: "Wildwood Towers",
    addr: "1075 S Jefferson St, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001019",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Tall building, 18 floors. Elevator patrol every 2 hours. Roof access alarmed.",
  },
  {
    id: 1020,
    name: "Cavalier Court",
    addr: "11100 Cavalier Ct, Fairfax VA",
    armed: false,
    tier: "B",
    phone: "+15551001020",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Furthest site from Arlington core. Allow extra travel time for rover support. Gate code 6612#.",
  },
  {
    id: 1021,
    name: "Columbia View",
    addr: "3416 Spring Ln, Falls Church VA",
    armed: false,
    tier: "B",
    phone: "+15551001021",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Falls Church jurisdiction. Different police non-emergency number: 703-248-5059.",
  },
  {
    id: 1022,
    name: "Courtland Park",
    addr: "2500 Clarendon Blvd, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001022",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Near Clarendon nightlife. Expect noise complaints Fri/Sat. Document but do not confront patrons.",
  },
  {
    id: 1023,
    name: "SouthPort Apartments",
    addr: "6112 Edsall Rd, Alexandria VA",
    armed: false,
    tier: "B",
    phone: "+15551001023",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Alexandria jurisdiction. Large complex, 200+ units. Focus on parking lots A and B.",
  },
  {
    id: 1024,
    name: "Hilton Arlington Rosslyn",
    addr: "1900 N Ft Myer Dr, Arlington VA",
    armed: false,
    tier: "B",
    phone: "+15551001024",
    shiftStart: "21:00",
    shiftEnd: "05:00",
    notes:
      "Hotel property. Coordinate with front desk. Guest complaints go to hotel management, not us.",
  },
];

// --- GUARDS (18 officers) -------------------------------------------------

// Guard IDs: 2001-2018
// Key characters:
//   2005 = "D. Nash"     — Friday callout pattern
//   2008 = "M. Reyes"    — car trouble pattern
//   2003 = "B. Adams"    — armed, reliable
//   2010 = "G. Terrell"  — armed, reliable
//   2006 = "C. Meador"   — supervisor
//   2013 = "K. Butler"   — supervisor

const guardFamiliarity: Record<number, SiteFamiliarity[]> = {
  2001: [
    { siteId: 1001, siteName: "Ballston Tower", visits: 12 },
    { siteId: 1002, siteName: "Clarendon Gate", visits: 8 },
    { siteId: 1008, siteName: "Virginia Square Towers", visits: 5 },
    { siteId: 1016, siteName: "Quincy Plaza", visits: 3 },
  ],
  2002: [
    { siteId: 1004, siteName: "Pentagon Row", visits: 15 },
    { siteId: 1005, siteName: "Crystal City Plaza", visits: 11 },
    { siteId: 1006, siteName: "Rosslyn Heights", visits: 7 },
  ],
  2003: [
    { siteId: 1003, siteName: "Columbia Park", visits: 14 },
    { siteId: 1009, siteName: "Dolley Madison Towers", visits: 12 },
    { siteId: 1001, siteName: "Ballston Tower", visits: 6 },
    { siteId: 1007, siteName: "Courthouse Square", visits: 4 },
    { siteId: 1010, siteName: "Randolph Towers", visits: 2 },
  ],
  2004: [
    { siteId: 1010, siteName: "Randolph Towers", visits: 10 },
    { siteId: 1011, siteName: "The Amelia", visits: 8 },
    { siteId: 1015, siteName: "Birchwood", visits: 6 },
    { siteId: 1012, siteName: "Thomas Court", visits: 4 },
    { siteId: 1013, siteName: "Thomas Place", visits: 3 },
    { siteId: 1014, siteName: "Henderson Park", visits: 2 },
  ],
  2005: [
    // Nash — knows fewer sites
    { siteId: 1022, siteName: "Courtland Park", visits: 9 },
    { siteId: 1002, siteName: "Clarendon Gate", visits: 5 },
    { siteId: 1016, siteName: "Quincy Plaza", visits: 2 },
  ],
  2006: [
    // Meador — supervisor, broad familiarity
    { siteId: 1001, siteName: "Ballston Tower", visits: 10 },
    { siteId: 1003, siteName: "Columbia Park", visits: 8 },
    { siteId: 1009, siteName: "Dolley Madison Towers", visits: 7 },
    { siteId: 1004, siteName: "Pentagon Row", visits: 5 },
    { siteId: 1018, siteName: "Wildwood Park", visits: 4 },
    { siteId: 1022, siteName: "Courtland Park", visits: 3 },
    { siteId: 1024, siteName: "Hilton Arlington Rosslyn", visits: 2 },
    { siteId: 1020, siteName: "Cavalier Court", visits: 1 },
  ],
  2007: [
    { siteId: 1007, siteName: "Courthouse Square", visits: 11 },
    { siteId: 1008, siteName: "Virginia Square Towers", visits: 9 },
    { siteId: 1017, siteName: "Richmond Square", visits: 6 },
    { siteId: 1016, siteName: "Quincy Plaza", visits: 3 },
  ],
  2008: [
    // Reyes — moderate familiarity
    { siteId: 1018, siteName: "Wildwood Park", visits: 7 },
    { siteId: 1019, siteName: "Wildwood Towers", visits: 5 },
    { siteId: 1014, siteName: "Henderson Park", visits: 3 },
  ],
  2009: [
    { siteId: 1012, siteName: "Thomas Court", visits: 13 },
    { siteId: 1013, siteName: "Thomas Place", visits: 11 },
    { siteId: 1011, siteName: "The Amelia", visits: 6 },
    { siteId: 1015, siteName: "Birchwood", visits: 4 },
    { siteId: 1014, siteName: "Henderson Park", visits: 2 },
  ],
  2010: [
    // Terrell — armed, broad familiarity
    { siteId: 1003, siteName: "Columbia Park", visits: 15 },
    { siteId: 1009, siteName: "Dolley Madison Towers", visits: 13 },
    { siteId: 1001, siteName: "Ballston Tower", visits: 8 },
    { siteId: 1004, siteName: "Pentagon Row", visits: 5 },
    { siteId: 1006, siteName: "Rosslyn Heights", visits: 3 },
    { siteId: 1023, siteName: "SouthPort Apartments", visits: 2 },
  ],
  2011: [
    { siteId: 1020, siteName: "Cavalier Court", visits: 12 },
    { siteId: 1021, siteName: "Columbia View", visits: 9 },
    { siteId: 1023, siteName: "SouthPort Apartments", visits: 7 },
    { siteId: 1005, siteName: "Crystal City Plaza", visits: 3 },
  ],
  2012: [
    { siteId: 1024, siteName: "Hilton Arlington Rosslyn", visits: 14 },
    { siteId: 1006, siteName: "Rosslyn Heights", visits: 10 },
    { siteId: 1004, siteName: "Pentagon Row", visits: 5 },
    { siteId: 1005, siteName: "Crystal City Plaza", visits: 2 },
    { siteId: 1007, siteName: "Courthouse Square", visits: 1 },
  ],
  2013: [
    // Butler — supervisor, broad familiarity
    { siteId: 1015, siteName: "Birchwood", visits: 9 },
    { siteId: 1010, siteName: "Randolph Towers", visits: 7 },
    { siteId: 1011, siteName: "The Amelia", visits: 6 },
    { siteId: 1017, siteName: "Richmond Square", visits: 5 },
    { siteId: 1012, siteName: "Thomas Court", visits: 4 },
    { siteId: 1013, siteName: "Thomas Place", visits: 3 },
    { siteId: 1001, siteName: "Ballston Tower", visits: 2 },
  ],
  2014: [
    { siteId: 1019, siteName: "Wildwood Towers", visits: 11 },
    { siteId: 1018, siteName: "Wildwood Park", visits: 8 },
    { siteId: 1022, siteName: "Courtland Park", visits: 4 },
  ],
  2015: [
    { siteId: 1023, siteName: "SouthPort Apartments", visits: 10 },
    { siteId: 1020, siteName: "Cavalier Court", visits: 6 },
    { siteId: 1021, siteName: "Columbia View", visits: 4 },
    { siteId: 1005, siteName: "Crystal City Plaza", visits: 2 },
    { siteId: 1019, siteName: "Wildwood Towers", visits: 1 },
  ],
  2016: [
    { siteId: 1014, siteName: "Henderson Park", visits: 8 },
    { siteId: 1017, siteName: "Richmond Square", visits: 5 },
    { siteId: 1010, siteName: "Randolph Towers", visits: 3 },
  ],
  2017: [
    { siteId: 1021, siteName: "Columbia View", visits: 7 },
    { siteId: 1020, siteName: "Cavalier Court", visits: 5 },
    { siteId: 1023, siteName: "SouthPort Apartments", visits: 3 },
    { siteId: 1018, siteName: "Wildwood Park", visits: 2 },
  ],
  2018: [
    { siteId: 1006, siteName: "Rosslyn Heights", visits: 4 },
    { siteId: 1024, siteName: "Hilton Arlington Rosslyn", visits: 3 },
    { siteId: 1004, siteName: "Pentagon Row", visits: 1 },
  ],
};

// Callout history per guard (last 8 weeks)
const guardCalloutHistory: Record<number, CallOutRecord[]> = {
  2001: [], // Gueye — perfectly reliable
  2002: [
    {
      date: "2026-02-14",
      day: "Sat",
      siteId: 1004,
      reason: "family emergency",
    },
  ],
  2003: [], // B. Adams — armed, never calls out
  2004: [{ date: "2026-01-24", day: "Sat", siteId: 1010, reason: "sick" }],
  2005: [
    // Nash — Friday pattern (3 of last 5 Fridays)
    { date: "2026-01-16", day: "Fri", siteId: 1022, reason: "sick" },
    { date: "2026-02-06", day: "Fri", siteId: 1022, reason: "personal" },
    { date: "2026-02-27", day: "Fri", siteId: 1022, reason: "car trouble" },
  ],
  2006: [], // Meador — supervisor, reliable
  2007: [{ date: "2026-02-22", day: "Sun", siteId: 1007, reason: "sick" }],
  2008: [
    // Reyes — car trouble pattern
    { date: "2026-01-31", day: "Sat", siteId: 1018, reason: "car trouble" },
    { date: "2026-02-21", day: "Sat", siteId: 1018, reason: "car trouble" },
  ],
  2009: [], // Teklu — reliable
  2010: [], // Terrell — armed, reliable
  2011: [{ date: "2026-02-08", day: "Sun", siteId: 1020, reason: "sick" }],
  2012: [], // Amoako — reliable
  2013: [], // Butler — supervisor, reliable
  2014: [
    { date: "2026-01-18", day: "Sun", siteId: 1019, reason: "personal" },
    { date: "2026-02-15", day: "Sun", siteId: 1019, reason: "sick" },
  ],
  2015: [{ date: "2026-02-28", day: "Sat", siteId: 1023, reason: "sick" }],
  2016: [], // reliable
  2017: [
    {
      date: "2026-01-25",
      day: "Sun",
      siteId: 1021,
      reason: "family emergency",
    },
  ],
  2018: [], // new-ish, no callouts yet
};

export const GUARDS: Guard[] = [
  {
    id: 2001,
    name: "A. Gueye",
    role: "Unarmed Officer",
    armed: false,
    grs: 91,
    hrs: 32,
    max: 40,
    lastOut: "19:00",
    status: "off-duty",
    phone: "+15552001001",
    familiarity: guardFamiliarity[2001],
    calloutHistory: guardCalloutHistory[2001],
    thermsAvgCheckin: 2,
    thermsLateStarts: 0,
    thermsPatrolRate: 0.98,
  },
  {
    id: 2002,
    name: "A. Ojoye",
    role: "Unarmed Officer",
    armed: false,
    grs: 82,
    hrs: 36,
    max: 40,
    lastOut: "18:00",
    status: "off-duty",
    phone: "+15552001002",
    familiarity: guardFamiliarity[2002],
    calloutHistory: guardCalloutHistory[2002],
    thermsAvgCheckin: 3,
    thermsLateStarts: 1,
    thermsPatrolRate: 0.94,
  },
  {
    id: 2003,
    name: "B. Adams",
    role: "Armed Officer",
    armed: true,
    grs: 93,
    hrs: 34,
    max: 40,
    lastOut: "20:00",
    status: "off-duty",
    phone: "+15552001003",
    familiarity: guardFamiliarity[2003],
    calloutHistory: guardCalloutHistory[2003],
    thermsAvgCheckin: 1,
    thermsLateStarts: 0,
    thermsPatrolRate: 1.0,
  },
  {
    id: 2004,
    name: "A. Lyles",
    role: "Unarmed Officer",
    armed: false,
    grs: 74,
    hrs: 38,
    max: 40,
    lastOut: "07:00",
    status: "off-duty",
    phone: "+15552001004",
    familiarity: guardFamiliarity[2004],
    calloutHistory: guardCalloutHistory[2004],
    thermsAvgCheckin: 5,
    thermsLateStarts: 2,
    thermsPatrolRate: 0.88,
  },
  {
    id: 2005,
    name: "D. Nash",
    role: "Unarmed Officer",
    armed: false,
    grs: 72,
    hrs: 28,
    max: 40,
    lastOut: "22:00",
    status: "off-duty",
    phone: "+15552001005",
    familiarity: guardFamiliarity[2005],
    calloutHistory: guardCalloutHistory[2005],
    thermsAvgCheckin: 6,
    thermsLateStarts: 3,
    thermsPatrolRate: 0.82,
  },
  {
    id: 2006,
    name: "C. Meador",
    role: "Supervisor",
    armed: false,
    grs: 89,
    hrs: 36,
    max: 40,
    lastOut: "21:00",
    status: "on-duty",
    phone: "+15552001006",
    familiarity: guardFamiliarity[2006],
    calloutHistory: guardCalloutHistory[2006],
    thermsAvgCheckin: 1,
    thermsLateStarts: 0,
    thermsPatrolRate: 0.99,
  },
  {
    id: 2007,
    name: "C. Nichols",
    role: "Unarmed Officer",
    armed: false,
    grs: 77,
    hrs: 24,
    max: 40,
    lastOut: "15:00",
    status: "off-duty",
    phone: "+15552001007",
    familiarity: guardFamiliarity[2007],
    calloutHistory: guardCalloutHistory[2007],
    thermsAvgCheckin: 4,
    thermsLateStarts: 1,
    thermsPatrolRate: 0.91,
  },
  {
    id: 2008,
    name: "M. Reyes",
    role: "Unarmed Officer",
    armed: false,
    grs: 78,
    hrs: 30,
    max: 40,
    lastOut: "14:00",
    status: "off-duty",
    phone: "+15552001008",
    familiarity: guardFamiliarity[2008],
    calloutHistory: guardCalloutHistory[2008],
    thermsAvgCheckin: 4,
    thermsLateStarts: 2,
    thermsPatrolRate: 0.87,
  },
  {
    id: 2009,
    name: "E. Teklu",
    role: "Unarmed Officer",
    armed: false,
    grs: 93,
    hrs: 30,
    max: 40,
    lastOut: "07:00",
    status: "off-duty",
    phone: "+15552001009",
    familiarity: guardFamiliarity[2009],
    calloutHistory: guardCalloutHistory[2009],
    thermsAvgCheckin: 2,
    thermsLateStarts: 0,
    thermsPatrolRate: 0.97,
  },
  {
    id: 2010,
    name: "G. Terrell",
    role: "Armed Officer",
    armed: true,
    grs: 90,
    hrs: 34,
    max: 40,
    lastOut: "17:00",
    status: "off-duty",
    phone: "+15552001010",
    familiarity: guardFamiliarity[2010],
    calloutHistory: guardCalloutHistory[2010],
    thermsAvgCheckin: 2,
    thermsLateStarts: 0,
    thermsPatrolRate: 0.96,
  },
  {
    id: 2011,
    name: "J. Farmer",
    role: "Unarmed Officer",
    armed: false,
    grs: 71,
    hrs: 36,
    max: 40,
    lastOut: "05:00",
    status: "off-duty",
    phone: "+15552001011",
    familiarity: guardFamiliarity[2011],
    calloutHistory: guardCalloutHistory[2011],
    thermsAvgCheckin: 5,
    thermsLateStarts: 2,
    thermsPatrolRate: 0.85,
  },
  {
    id: 2012,
    name: "F. Amoako",
    role: "Armed Officer",
    armed: true,
    grs: 86,
    hrs: 32,
    max: 40,
    lastOut: "11:00",
    status: "training",
    phone: "+15552001012",
    familiarity: guardFamiliarity[2012],
    calloutHistory: guardCalloutHistory[2012],
    thermsAvgCheckin: 3,
    thermsLateStarts: 0,
    thermsPatrolRate: 0.95,
  },
  {
    id: 2013,
    name: "K. Butler",
    role: "Supervisor",
    armed: false,
    grs: 87,
    hrs: 36,
    max: 40,
    lastOut: "19:00",
    status: "on-duty",
    phone: "+15552001013",
    familiarity: guardFamiliarity[2013],
    calloutHistory: guardCalloutHistory[2013],
    thermsAvgCheckin: 1,
    thermsLateStarts: 0,
    thermsPatrolRate: 0.98,
  },
  {
    id: 2014,
    name: "T. Bullock",
    role: "Unarmed Officer",
    armed: false,
    grs: 80,
    hrs: 28,
    max: 40,
    lastOut: "16:00",
    status: "off-duty",
    phone: "+15552001014",
    familiarity: guardFamiliarity[2014],
    calloutHistory: guardCalloutHistory[2014],
    thermsAvgCheckin: 3,
    thermsLateStarts: 1,
    thermsPatrolRate: 0.92,
  },
  {
    id: 2015,
    name: "A. Tchwenko",
    role: "Unarmed Officer",
    armed: false,
    grs: 76,
    hrs: 32,
    max: 40,
    lastOut: "14:00",
    status: "off-duty",
    phone: "+15552001015",
    familiarity: guardFamiliarity[2015],
    calloutHistory: guardCalloutHistory[2015],
    thermsAvgCheckin: 4,
    thermsLateStarts: 1,
    thermsPatrolRate: 0.89,
  },
  {
    id: 2016,
    name: "A. Al Dossary",
    role: "Unarmed Officer",
    armed: false,
    grs: 69,
    hrs: 24,
    max: 40,
    lastOut: "10:00",
    status: "off-duty",
    phone: "+15552001016",
    familiarity: guardFamiliarity[2016],
    calloutHistory: guardCalloutHistory[2016],
    thermsAvgCheckin: 7,
    thermsLateStarts: 3,
    thermsPatrolRate: 0.78,
  },
  {
    id: 2017,
    name: "J. Herrera",
    role: "Unarmed Officer",
    armed: false,
    grs: 83,
    hrs: 30,
    max: 40,
    lastOut: "20:00",
    status: "off-duty",
    phone: "+15552001017",
    familiarity: guardFamiliarity[2017],
    calloutHistory: guardCalloutHistory[2017],
    thermsAvgCheckin: 3,
    thermsLateStarts: 1,
    thermsPatrolRate: 0.93,
  },
  {
    id: 2018,
    name: "A. Omar",
    role: "Unarmed Officer",
    armed: false,
    grs: 65,
    hrs: 24,
    max: 40,
    lastOut: null,
    status: "off-duty",
    phone: "+15552001018",
    familiarity: guardFamiliarity[2018],
    calloutHistory: guardCalloutHistory[2018],
    thermsAvgCheckin: 8,
    thermsLateStarts: 4,
    thermsPatrolRate: 0.75,
  },
];

// --- ROVERS (4 field supervisors) -----------------------------------------

export const ROVERS: Rover[] = [
  {
    id: 3001,
    name: "Rover 1",
    phone: "+15553001001",
    zone: "North",
    status: "patrolling",
  },
  {
    id: 3002,
    name: "Rover 2",
    phone: "+15553001002",
    zone: "South",
    status: "patrolling",
  },
  {
    id: 3003,
    name: "Rover 3",
    phone: "+15553001003",
    zone: "East",
    status: "patrolling",
  },
  {
    id: 3004,
    name: "Rover 4",
    phone: "+15553001004",
    zone: "West",
    status: "patrolling",
  },
];

// --- CALLOUTS (current week — backwards compatible) -----------------------

export const CALLOUTS: CallOut[] = [
  {
    day: "Mon",
    site: "Randolph Towers",
    guard: "A. Lyles",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 22,
    by: "A. Gueye",
  },
  {
    day: "Mon",
    site: "Thomas Place",
    guard: "A. Al Dossary",
    time: "15:00",
    armed: false,
    resolved: true,
    fill: 35,
    by: "C. Nichols",
  },
  {
    day: "Tue",
    site: "Hilton Arlington Rosslyn",
    guard: "T. Bullock",
    time: "07:00",
    armed: false,
    resolved: true,
    fill: 18,
    by: "A. Tchwenko",
  },
  {
    day: "Wed",
    site: "Columbia Park",
    guard: "G. Terrell",
    time: "23:00",
    armed: true,
    resolved: true,
    fill: 41,
    by: "B. Adams",
  },
  {
    day: "Thu",
    site: "Birchwood",
    guard: "C. Nichols",
    time: "15:00",
    armed: false,
    resolved: true,
    fill: 28,
    by: "E. Teklu",
  },
  {
    day: "Fri",
    site: "Dolley Madison Towers",
    guard: "B. Adams",
    time: "23:00",
    armed: true,
    resolved: false,
    fill: null,
    by: null,
  },
  {
    day: "Fri",
    site: "Wildwood Park",
    guard: "A. Ojoye",
    time: "15:00",
    armed: false,
    resolved: true,
    fill: 15,
    by: "J. Farmer",
  },
  {
    day: "Sat",
    site: "SouthPort Apartments",
    guard: "J. Farmer",
    time: "07:00",
    armed: false,
    resolved: true,
    fill: 52,
    by: "A. Tchwenko",
  },
  {
    day: "Sat",
    site: "Courtland Park",
    guard: "M. Reyes",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 19,
    by: "A. Gueye",
  },
  {
    day: "Sun",
    site: "Crystal City Plaza",
    guard: "T. Bullock",
    time: "15:00",
    armed: false,
    resolved: false,
    fill: null,
    by: null,
  },
];

// --- CALLOUT_HISTORY (8 weeks — ~42 records) ------------------------------

export const CALLOUT_HISTORY: CallOut[] = [
  // Week 1 (Jan 12-18) — normal week, 4 callouts
  {
    day: "Tue",
    site: "Ballston Tower",
    guard: "A. Ojoye",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 25,
    by: "C. Nichols",
  },
  {
    day: "Thu",
    site: "Henderson Park",
    guard: "A. Al Dossary",
    time: "22:00",
    armed: false,
    resolved: true,
    fill: 30,
    by: "A. Lyles",
  },
  {
    day: "Fri",
    site: "Courtland Park",
    guard: "D. Nash",
    time: "21:30",
    armed: false,
    resolved: true,
    fill: 45,
    by: "A. Gueye",
  },
  {
    day: "Sun",
    site: "Wildwood Towers",
    guard: "T. Bullock",
    time: "01:00",
    armed: false,
    resolved: true,
    fill: 38,
    by: "E. Teklu",
  },

  // Week 2 (Jan 19-25) — normal week, 5 callouts
  {
    day: "Mon",
    site: "Thomas Court",
    guard: "E. Teklu",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 20,
    by: "A. Lyles",
  },
  {
    day: "Wed",
    site: "Quincy Plaza",
    guard: "C. Nichols",
    time: "00:30",
    armed: false,
    resolved: true,
    fill: 33,
    by: "J. Farmer",
  },
  {
    day: "Sat",
    site: "Randolph Towers",
    guard: "A. Lyles",
    time: "22:00",
    armed: false,
    resolved: true,
    fill: 27,
    by: "A. Gueye",
  },
  {
    day: "Sun",
    site: "Columbia View",
    guard: "J. Herrera",
    time: "02:00",
    armed: false,
    resolved: true,
    fill: 42,
    by: "A. Tchwenko",
  },
  {
    day: "Sun",
    site: "Cavalier Court",
    guard: "J. Farmer",
    time: "23:30",
    armed: false,
    resolved: true,
    fill: 55,
    by: "A. Ojoye",
  },

  // Week 3 (Jan 26-Feb 1) — bad week, 8 callouts (flu season)
  {
    day: "Mon",
    site: "Virginia Square Towers",
    guard: "C. Nichols",
    time: "21:00",
    armed: false,
    resolved: true,
    fill: 18,
    by: "A. Gueye",
  },
  {
    day: "Tue",
    site: "Birchwood",
    guard: "A. Al Dossary",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 40,
    by: "E. Teklu",
  },
  {
    day: "Wed",
    site: "Pentagon Row",
    guard: "A. Ojoye",
    time: "22:30",
    armed: false,
    resolved: true,
    fill: 22,
    by: "C. Nichols",
  },
  {
    day: "Thu",
    site: "Crystal City Plaza",
    guard: "T. Bullock",
    time: "01:00",
    armed: false,
    resolved: true,
    fill: 35,
    by: "A. Lyles",
  },
  {
    day: "Fri",
    site: "Rosslyn Heights",
    guard: "J. Herrera",
    time: "21:15",
    armed: false,
    resolved: true,
    fill: 28,
    by: "J. Farmer",
  },
  {
    day: "Sat",
    site: "Wildwood Park",
    guard: "M. Reyes",
    time: "22:00",
    armed: false,
    resolved: true,
    fill: 31,
    by: "A. Gueye",
  },
  {
    day: "Sat",
    site: "Dolley Madison Towers",
    guard: "G. Terrell",
    time: "23:30",
    armed: true,
    resolved: true,
    fill: 48,
    by: "B. Adams",
  },
  {
    day: "Sun",
    site: "SouthPort Apartments",
    guard: "A. Tchwenko",
    time: "00:00",
    armed: false,
    resolved: false,
    fill: null,
    by: null,
  },

  // Week 4 (Feb 2-8) — normal week, 4 callouts
  {
    day: "Mon",
    site: "Courthouse Square",
    guard: "A. Lyles",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 24,
    by: "C. Nichols",
  },
  {
    day: "Fri",
    site: "Courtland Park",
    guard: "D. Nash",
    time: "21:00",
    armed: false,
    resolved: true,
    fill: 38,
    by: "E. Teklu",
  },
  {
    day: "Sat",
    site: "Hilton Arlington Rosslyn",
    guard: "F. Amoako",
    time: "02:00",
    armed: true,
    resolved: true,
    fill: 44,
    by: "G. Terrell",
  },
  {
    day: "Sun",
    site: "Cavalier Court",
    guard: "J. Farmer",
    time: "22:00",
    armed: false,
    resolved: true,
    fill: 50,
    by: "A. Ojoye",
  },

  // Week 5 (Feb 9-15) — normal week, 5 callouts
  {
    day: "Tue",
    site: "The Amelia",
    guard: "A. Al Dossary",
    time: "23:30",
    armed: false,
    resolved: true,
    fill: 32,
    by: "A. Lyles",
  },
  {
    day: "Wed",
    site: "Thomas Place",
    guard: "E. Teklu",
    time: "00:00",
    armed: false,
    resolved: true,
    fill: 20,
    by: "J. Farmer",
  },
  {
    day: "Fri",
    site: "Ballston Tower",
    guard: "A. Gueye",
    time: "22:00",
    armed: false,
    resolved: true,
    fill: 15,
    by: "C. Nichols",
  },
  {
    day: "Sat",
    site: "Pentagon Row",
    guard: "A. Ojoye",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 28,
    by: "A. Tchwenko",
  },
  {
    day: "Sun",
    site: "Wildwood Towers",
    guard: "T. Bullock",
    time: "01:30",
    armed: false,
    resolved: true,
    fill: 40,
    by: "A. Gueye",
  },

  // Week 6 (Feb 16-22) — bad week, 9 callouts (Presidents' Day weekend)
  {
    day: "Mon",
    site: "Richmond Square",
    guard: "A. Lyles",
    time: "21:00",
    armed: false,
    resolved: true,
    fill: 19,
    by: "E. Teklu",
  },
  {
    day: "Tue",
    site: "Henderson Park",
    guard: "A. Al Dossary",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 36,
    by: "J. Farmer",
  },
  {
    day: "Wed",
    site: "Columbia Park",
    guard: "B. Adams",
    time: "22:00",
    armed: true,
    resolved: true,
    fill: 25,
    by: "G. Terrell",
  },
  {
    day: "Thu",
    site: "Clarendon Gate",
    guard: "A. Ojoye",
    time: "00:30",
    armed: false,
    resolved: true,
    fill: 30,
    by: "A. Gueye",
  },
  {
    day: "Fri",
    site: "Quincy Plaza",
    guard: "C. Nichols",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 22,
    by: "A. Lyles",
  },
  {
    day: "Sat",
    site: "Wildwood Park",
    guard: "M. Reyes",
    time: "21:30",
    armed: false,
    resolved: true,
    fill: 34,
    by: "T. Bullock",
  },
  {
    day: "Sat",
    site: "Crystal City Plaza",
    guard: "J. Herrera",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 41,
    by: "A. Tchwenko",
  },
  {
    day: "Sun",
    site: "Rosslyn Heights",
    guard: "C. Nichols",
    time: "01:00",
    armed: false,
    resolved: true,
    fill: 28,
    by: "A. Ojoye",
  },
  {
    day: "Sun",
    site: "Dolley Madison Towers",
    guard: "F. Amoako",
    time: "22:00",
    armed: true,
    resolved: false,
    fill: null,
    by: null,
  },

  // Week 7 (Feb 23-Mar 1) — normal week, 3 callouts
  {
    day: "Fri",
    site: "Courtland Park",
    guard: "D. Nash",
    time: "21:00",
    armed: false,
    resolved: true,
    fill: 26,
    by: "A. Gueye",
  },
  {
    day: "Sat",
    site: "SouthPort Apartments",
    guard: "A. Tchwenko",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 35,
    by: "J. Farmer",
  },
  {
    day: "Sun",
    site: "Virginia Square Towers",
    guard: "A. Ojoye",
    time: "00:30",
    armed: false,
    resolved: true,
    fill: 29,
    by: "E. Teklu",
  },

  // Week 8 — current week (same as CALLOUTS above)
  {
    day: "Mon",
    site: "Randolph Towers",
    guard: "A. Lyles",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 22,
    by: "A. Gueye",
  },
  {
    day: "Mon",
    site: "Thomas Place",
    guard: "A. Al Dossary",
    time: "15:00",
    armed: false,
    resolved: true,
    fill: 35,
    by: "C. Nichols",
  },
  {
    day: "Tue",
    site: "Hilton Arlington Rosslyn",
    guard: "T. Bullock",
    time: "07:00",
    armed: false,
    resolved: true,
    fill: 18,
    by: "A. Tchwenko",
  },
  {
    day: "Wed",
    site: "Columbia Park",
    guard: "G. Terrell",
    time: "23:00",
    armed: true,
    resolved: true,
    fill: 41,
    by: "B. Adams",
  },
  {
    day: "Thu",
    site: "Birchwood",
    guard: "C. Nichols",
    time: "15:00",
    armed: false,
    resolved: true,
    fill: 28,
    by: "E. Teklu",
  },
  {
    day: "Fri",
    site: "Dolley Madison Towers",
    guard: "B. Adams",
    time: "23:00",
    armed: true,
    resolved: false,
    fill: null,
    by: null,
  },
  {
    day: "Fri",
    site: "Wildwood Park",
    guard: "A. Ojoye",
    time: "15:00",
    armed: false,
    resolved: true,
    fill: 15,
    by: "J. Farmer",
  },
  {
    day: "Sat",
    site: "SouthPort Apartments",
    guard: "J. Farmer",
    time: "07:00",
    armed: false,
    resolved: true,
    fill: 52,
    by: "A. Tchwenko",
  },
  {
    day: "Sat",
    site: "Courtland Park",
    guard: "M. Reyes",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 19,
    by: "A. Gueye",
  },
  {
    day: "Sun",
    site: "Crystal City Plaza",
    guard: "T. Bullock",
    time: "15:00",
    armed: false,
    resolved: false,
    fill: null,
    by: null,
  },
];

// --- TONIGHT_SCHEDULE (24 sites, one guard each) --------------------------

export const TONIGHT_SCHEDULE: ScheduleEntry[] = [
  { siteId: 1001, guardId: 2001, connectTeamsConfirmed: true }, // Ballston Tower — Gueye
  { siteId: 1002, guardId: 2008, connectTeamsConfirmed: true }, // Clarendon Gate — Reyes
  { siteId: 1003, guardId: 2003, connectTeamsConfirmed: true }, // Columbia Park (armed) — B. Adams
  { siteId: 1004, guardId: 2002, connectTeamsConfirmed: true }, // Pentagon Row — Ojoye
  { siteId: 1005, guardId: 2015, connectTeamsConfirmed: true }, // Crystal City Plaza — Tchwenko
  { siteId: 1006, guardId: 2012, connectTeamsConfirmed: true }, // Rosslyn Heights — Amoako
  { siteId: 1007, guardId: 2007, connectTeamsConfirmed: true }, // Courthouse Square — Nichols
  { siteId: 1008, guardId: 2004, connectTeamsConfirmed: false }, // Virginia Sq Towers — Lyles (unconfirmed)
  { siteId: 1009, guardId: 2010, connectTeamsConfirmed: true }, // Dolley Madison (armed) — Terrell
  { siteId: 1010, guardId: 2016, connectTeamsConfirmed: true }, // Randolph Towers — Al Dossary
  { siteId: 1011, guardId: 2009, connectTeamsConfirmed: true }, // The Amelia — Teklu
  { siteId: 1012, guardId: 2014, connectTeamsConfirmed: false }, // Thomas Court — Bullock (unconfirmed)
  { siteId: 1013, guardId: 2017, connectTeamsConfirmed: true }, // Thomas Place — Herrera
  { siteId: 1014, guardId: 2016, connectTeamsConfirmed: true }, // Henderson Park — Al Dossary (double, corrected below)
  { siteId: 1015, guardId: 2013, connectTeamsConfirmed: true }, // Birchwood — Butler (supervisor)
  { siteId: 1016, guardId: 2007, connectTeamsConfirmed: true }, // Quincy Plaza — Nichols (see note)
  { siteId: 1017, guardId: 2004, connectTeamsConfirmed: false }, // Richmond Square — Lyles (unconfirmed)
  { siteId: 1018, guardId: 2014, connectTeamsConfirmed: true }, // Wildwood Park — Bullock
  { siteId: 1019, guardId: 2011, connectTeamsConfirmed: true }, // Wildwood Towers — Farmer
  { siteId: 1020, guardId: 2015, connectTeamsConfirmed: true }, // Cavalier Court — Tchwenko
  { siteId: 1021, guardId: 2017, connectTeamsConfirmed: true }, // Columbia View — Herrera
  { siteId: 1022, guardId: 2005, connectTeamsConfirmed: false }, // Courtland Park — Nash (UNCONFIRMED — Friday pattern)
  { siteId: 1023, guardId: 2011, connectTeamsConfirmed: true }, // SouthPort — Farmer
  { siteId: 1024, guardId: 2018, connectTeamsConfirmed: false }, // Hilton Arlington — Omar (unconfirmed, new guard)
];

// --- SIM_TIMELINE — consolidated events for tonight's simulation -----------
// Events are spaced further apart and written at a summary/analytical level.
// The live feed handles real-time details; Pegasus is the thinking layer.

export const SIM_TIMELINE: SimEvent[] = [
  // --- Pre-shift (19:00-20:59) ---
  {
    time: "19:00",
    type: "shift-start",
    data: {
      message:
        "Tonight's shift begins. 24 sites on the Dittmar contract. 5 guards unconfirmed in ConnectTeams. Automated confirmation texts sent.",
    },
  },
  {
    time: "19:15",
    type: "confirmation-reply",
    guardId: 2017,
    data: {
      message:
        "4 of 5 unconfirmed guards have responded — Lyles, Bullock, Omar, and Herrera all confirmed. D. Nash remains unresponsive.",
      sms: "Good to go.",
    },
  },
  {
    time: "19:30",
    type: "pattern-flag",
    guardId: 2005,
    siteId: 1022,
    data: {
      message:
        "D. Nash still unresponsive. Pattern detected: called out 3 of last 5 Fridays. Risk level HIGH. Pre-staging backup for Courtland Park.",
      pattern: "friday-callout",
      confidence: 0.85,
    },
  },
  {
    time: "19:45",
    type: "cascade-reply",
    siteId: 1022,
    guardId: 2001,
    data: {
      message:
        "Backup secured for Courtland Park. A. Gueye (GRS 91, 4 site visits) confirmed standby. Awaiting Nash confirmation by 20:00.",
      sms: "Yes, I can be there. Just let me know.",
      accepted: true,
    },
  },
  {
    time: "20:00",
    type: "callout-received",
    guardId: 2005,
    siteId: 1022,
    data: {
      message:
        "D. Nash confirms out: 'Not feeling well tonight, sorry.' Callout matched predicted pattern. A. Gueye activated from standby — effective fill time: 1 minute.",
      sms: "Not feeling well tonight, sorry.",
      reason: "sick",
    },
  },
  {
    time: "20:01",
    type: "site-covered",
    siteId: 1022,
    guardId: 2001,
    data: {
      message:
        "Courtland Park covered. Pre-staged 1 hour ago. This is the fastest proactive fill this quarter.",
      fillMinutes: 1,
    },
  },

  // --- Shift active (21:00-04:59) ---
  {
    time: "21:00",
    type: "shift-start",
    data: {
      message: "All 24 sites going active. Monitoring Therms check-ins.",
    },
  },
  {
    time: "21:10",
    type: "therms-checkin",
    data: {
      message:
        "22 of 24 guards checked in. A. Al Dossary (Randolph Towers) and 1 other still pending.",
      checkedIn: 22,
      total: 24,
    },
  },
  {
    time: "21:20",
    type: "therms-checkin",
    data: {
      message:
        "All 24 sites checked in. A. Al Dossary started 4 minutes late — 3rd late start this week. Patrol rate 78%. Consider reassignment.",
      checkedIn: 24,
      total: 24,
    },
  },
  {
    time: "21:45",
    type: "all-clear",
    data: {
      message: "All 24 sites active and patrolling. No open issues.",
    },
  },

  // --- 10 PM hourly summary ---
  {
    time: "22:00",
    type: "hourly-summary",
    data: {
      message:
        "Hey — 10 PM check-in. All 24 sites covered. Al Dossary was 4 min late again at Randolph Towers. No callouts this hour. Scan compliance at 96%.",
    },
  },

  // --- First mid-shift callout ---
  {
    time: "22:47",
    type: "callout-received",
    guardId: 2008,
    siteId: 1002,
    data: {
      message:
        "M. Reyes calls out from Clarendon Gate — car trouble. Pattern flag: 2nd 'car trouble' in 4 weeks. Cascade initiated for Tier B unarmed site.",
      sms: "Car won't start, I'm stuck at the site but I can't get home and my ride is here.",
      reason: "car trouble",
    },
  },
  {
    time: "22:51",
    type: "site-covered",
    siteId: 1002,
    guardId: 2009,
    data: {
      message:
        "Clarendon Gate covered. E. Teklu (GRS 93) accepted, ETA 23:11. Fill time: 3 minutes. Reyes reliability flag raised for review.",
      fillMinutes: 3,
    },
  },

  // --- 11 PM hourly summary ---
  {
    time: "23:00",
    type: "hourly-summary",
    data: {
      message:
        "11 PM update. 23 of 24 sites green — Teklu's still en route to Clarendon Gate after the Reyes callout. Should be checked in by 23:15. One callout so far, filled in 3 minutes.",
    },
  },
  {
    time: "23:15",
    type: "therms-checkin",
    guardId: 2009,
    siteId: 1002,
    data: {
      message: "E. Teklu checked in at Clarendon Gate. Site fully operational.",
    },
  },

  // --- Midnight hourly summary ---
  {
    time: "00:00",
    type: "hourly-summary",
    data: {
      message:
        "Midnight check. 24 of 24 covered — all green. Scan compliance at 94%. Quiet night so far, just the one Reyes callout. All 4 rovers active.",
    },
  },

  // --- 1 AM hourly summary ---
  {
    time: "01:00",
    type: "hourly-summary",
    data: {
      message:
        "1 AM check-in. Still 24/24 covered. Patrol completion looking solid across the board except Al Dossary at Randolph — he's at 78%. I'd keep an eye on that one.",
    },
  },

  // --- Second mid-shift callout ---
  {
    time: "01:15",
    type: "callout-received",
    guardId: 2011,
    siteId: 1019,
    data: {
      message:
        "J. Farmer calls out from Wildwood Towers — family emergency. Cascade initiated. Limited pool at 01:15 — 2 candidates available.",
      reason: "family emergency",
    },
  },
  {
    time: "01:23",
    type: "site-covered",
    siteId: 1019,
    guardId: 2008,
    data: {
      message:
        "Wildwood Towers covered. T. Bullock declined (just off shift). M. Reyes accepted, ETA ~01:48. Fill time: 8 minutes. Rover Sgt. Torres dispatched for interim.",
      fillMinutes: 8,
    },
  },
  {
    time: "01:50",
    type: "therms-checkin",
    guardId: 2008,
    siteId: 1019,
    data: {
      message:
        "M. Reyes checked in at Wildwood Towers. Sgt. Torres released to West zone patrol.",
    },
  },

  // --- 2 AM hourly summary ---
  {
    time: "02:00",
    type: "hourly-summary",
    data: {
      message:
        "2 AM check. 24/24 covered. Two callouts tonight — both resolved. Reyes pulled double duty covering Wildwood after the Farmer emergency. Fill times holding at 4 min avg.",
    },
  },

  // --- 3 AM hourly summary ---
  {
    time: "03:00",
    type: "hourly-summary",
    data: {
      message:
        "3 AM — all quiet. 24/24 sites covered, 3 callouts total, all resolved. Average fill time: 4 minutes. Compliance at 92%. We're in good shape for the home stretch.",
    },
  },

  // --- 4 AM hourly summary ---
  {
    time: "04:00",
    type: "hourly-summary",
    data: {
      message:
        "4 AM check-in. Almost done. 24/24 still covered. No new callouts since Farmer at 01:15. Patrol rates look good everywhere except Randolph Towers — Al Dossary at 82%. I'd flag that for the morning debrief.",
    },
  },
  {
    time: "04:30",
    type: "therms-patrol",
    data: {
      message:
        "Final patrol data: 23 sites at 95%+ completion. Randolph Towers at 82% (Al Dossary — flagged).",
    },
  },

  // --- Shift end ---
  {
    time: "05:00",
    type: "night-summary",
    data: {
      message:
        "Night shift complete. 24/24 sites covered through end of shift. 3 callouts resolved (1 proactive pre-stage). Average fill time: 4 minutes. Key flags: Nash Friday pattern (4/6), Reyes car trouble (3rd incident), Al Dossary late starts (review needed).",
      stats: {
        sitesTotal: 24,
        sitesCovered: 24,
        calloutsTotal: 3,
        calloutsResolved: 3,
        avgFillMinutes: 4,
        proactivePreStages: 1,
        thermsOnTime: 23,
        thermsLate: 1,
      },
    },
  },
];
