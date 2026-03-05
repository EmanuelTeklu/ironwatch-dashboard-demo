// ---------------------------------------------------------------------------
// Pre-shift Callout Simulation — timeline of guard callouts with voice text
// ---------------------------------------------------------------------------

export interface CalloutEvent {
  readonly time: string;
  readonly guardId: number;
  readonly guardName: string;
  readonly siteId: number;
  readonly siteName: string;
  readonly reason: string;
  readonly voiceText: string;
  readonly messageText: string;
}

export const CALLOUT_TIMELINE: readonly CalloutEvent[] = [
  {
    time: "20:15",
    guardId: 2005,
    guardName: "D. Nash",
    siteId: 1022,
    siteName: "Courtland Park",
    reason: "sick",
    voiceText: "Hey, this is Nash. I'm not feeling well tonight. I don't think I can make it in for my shift at Courtland Park. Sorry about the late notice.",
    messageText: "D. Nash calls out from Courtland Park: 'Not feeling well tonight.' Friday pattern — 4th callout in 6 Fridays. Pre-staged backup A. Gueye activated.",
  },
  {
    time: "20:30",
    guardId: 2008,
    guardName: "M. Reyes",
    siteId: 1002,
    siteName: "Clarendon Gate",
    reason: "car trouble",
    voiceText: "It's Reyes. My car won't start again. I've been trying for the last twenty minutes. I'm not going to make it to Clarendon Gate tonight.",
    messageText: "M. Reyes calls out from Clarendon Gate: 'Car won't start.' 3rd car trouble callout in 5 weeks. Cascade initiated — E. Teklu contacted.",
  },
  {
    time: "20:42",
    guardId: 2011,
    guardName: "J. Farmer",
    siteId: 1019,
    siteName: "Wildwood Towers",
    reason: "family emergency",
    voiceText: "This is Farmer. I have a family emergency and I need to deal with it tonight. I won't be able to make my shift at Wildwood Towers. I'm really sorry.",
    messageText: "J. Farmer calls out from Wildwood Towers: 'Family emergency.' Cascade initiated — T. Bullock contacted, then M. Reyes as backup.",
  },
  {
    time: "20:55",
    guardId: 2016,
    guardName: "A. Al Dossary",
    siteId: 1010,
    siteName: "Randolph Towers",
    reason: "sick",
    voiceText: "Al Dossary here. I've been sick all day and I'm not getting any better. I can't come in for Randolph Towers tonight.",
    messageText: "A. Al Dossary calls out from Randolph Towers: 'Sick all day.' Late start pattern flagged. Cascade initiated — C. Nichols contacted.",
  },
];
