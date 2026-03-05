import type { Site, Guard, CallOut } from "./types";

const SITES: Site[] = [
  { id: 1054, name: "16th Street", addr: "1730 16th St N, Arlington", armed: false, tier: "B" },
  { id: 1033, name: "Birchwood", addr: "545 N Pollard St, Arlington", armed: false, tier: "B" },
  { id: 1050, name: "Cavalier Court", addr: "11100 Cavalier Ct, Fairfax", armed: false, tier: "B" },
  { id: 1042, name: "Cherry Hill", addr: "2120 N Monroe St, Arlington", armed: false, tier: "B" },
  { id: 1045, name: "Columbia Park", addr: "942 S Wakefield St, Arlington", armed: true, tier: "A" },
  { id: 1051, name: "Columbia View", addr: "3416 Spring Ln, Falls Church", armed: false, tier: "B" },
  { id: 1043, name: "Courtland Park", addr: "2500 Clarendon Blvd, Arlington", armed: false, tier: "B" },
  { id: 1044, name: "Courtland Towers", addr: "1200 N Veitch St, Arlington", armed: false, tier: "B" },
  { id: 1046, name: "Dolley Madison Towers", addr: "2300 24th Rd S, Arlington", armed: true, tier: "A" },
  { id: 1049, name: "Edlandria", addr: "6198 Edsall Rd, Alexandria", armed: true, tier: "A" },
  { id: 1037, name: "Henderson Park", addr: "4301 Henderson Rd, Arlington", armed: false, tier: "B" },
  { id: 1053, name: "Hilton Arlington Rosslyn", addr: "1900 N Ft Myer Dr, Arlington", armed: false, tier: "A" },
  { id: 1034, name: "Quincy Plaza", addr: "3900 Fairfax Dr, Arlington", armed: false, tier: "B" },
  { id: 1035, name: "Randolph Towers", addr: "4001 9th St N, Arlington", armed: false, tier: "B" },
  { id: 1036, name: "Richmond Square", addr: "900 N Randolph St, Arlington", armed: false, tier: "B" },
  { id: 1052, name: "Rosslyn Towers", addr: "1919 N Nash St, Arlington", armed: false, tier: "B" },
  { id: 1007, name: "SouthPort Apartments", addr: "6112 Edsall Rd, Alexandria", armed: true, tier: "A" },
  { id: 1032, name: "The Amelia", addr: "816 N Oakland St, Arlington", armed: false, tier: "B" },
  { id: 1038, name: "Thomas Court", addr: "470 N Thomas St, Arlington", armed: false, tier: "B" },
  { id: 1039, name: "Thomas Place", addr: "461 N Thomas St, Arlington", armed: false, tier: "B" },
  { id: 1040, name: "Virginia Square Plaza", addr: "801 N Monroe St, Arlington", armed: false, tier: "B" },
  { id: 1041, name: "Virginia Square Towers", addr: "3444 Fairfax Dr, Arlington", armed: false, tier: "B" },
  { id: 1047, name: "Wildwood Park", addr: "5550 Columbia Pike, Arlington", armed: false, tier: "B" },
  { id: 1048, name: "Wildwood Towers", addr: "1075 S Jefferson St, Arlington", armed: false, tier: "B" },
];

const GUARDS: Guard[] = [
  { id: 1438, name: "A. Gueye", role: "Unarmed Officer", armed: false, grs: 88, hrs: 32, max: 40, lastOut: "19:00", status: "on-duty" },
  { id: 1194, name: "A. Ojoye", role: "Security Officer", armed: false, grs: 82, hrs: 36, max: 40, lastOut: "18:00", status: "on-duty" },
  { id: 1371, name: "A. Adams", role: "Unarmed Officer", armed: false, grs: 79, hrs: 28, max: 40, lastOut: "22:00", status: "off-duty" },
  { id: 1130, name: "A. Lyles", role: "Security Officer", armed: false, grs: 74, hrs: 40, max: 40, lastOut: "07:00", status: "off-duty" },
  { id: 1296, name: "B. Adams", role: "Armed Officer", armed: true, grs: 91, hrs: 34, max: 40, lastOut: "20:00", status: "on-duty" },
  { id: 1303, name: "C. Meador", role: "Supervisor", armed: false, grs: 85, hrs: 38, max: 40, lastOut: "21:00", status: "on-duty" },
  { id: 1293, name: "C. Nichols", role: "Unarmed Officer", armed: false, grs: 77, hrs: 24, max: 40, lastOut: "15:00", status: "on-duty" },
  { id: 1191, name: "E. Teklu", role: "Security Officer", armed: false, grs: 93, hrs: 30, max: 40, lastOut: "07:00", status: "on-duty" },
  { id: 1446, name: "F. Amoako", role: "Armed Officer", armed: true, grs: 86, hrs: 32, max: 40, lastOut: "11:00", status: "training" },
  { id: 1195, name: "G. Terrell", role: "Armed Officer", armed: true, grs: 90, hrs: 36, max: 40, lastOut: "17:00", status: "on-duty" },
  { id: 1314, name: "J. Farmer", role: "Security Officer", armed: false, grs: 71, hrs: 40, max: 40, lastOut: "05:00", status: "on-duty" },
  { id: 1359, name: "J. Herrera", role: "Armed Officer", armed: true, grs: 87, hrs: 30, max: 40, lastOut: "20:00", status: "on-duty" },
  { id: 1322, name: "K. Butler", role: "Supervisor", armed: false, grs: 84, hrs: 36, max: 40, lastOut: "19:00", status: "on-duty" },
  { id: 1378, name: "T. Bullock", role: "Unarmed Officer", armed: false, grs: 80, hrs: 28, max: 40, lastOut: "16:00", status: "off-duty" },
  { id: 1185, name: "A. Tchwenko", role: "Security Officer", armed: false, grs: 76, hrs: 32, max: 40, lastOut: "14:00", status: "off-duty" },
  { id: 1366, name: "A. Al Dossary", role: "Security Officer", armed: false, grs: 72, hrs: 20, max: 40, lastOut: "10:00", status: "off-duty" },
  { id: 1338, name: "A. Omar", role: "Security Officer", armed: false, grs: 65, hrs: 0, max: 40, lastOut: null, status: "inactive" },
];

const CALLOUTS: CallOut[] = [
  { day: "Mon", site: "Courtland Towers", guard: "A. Lyles", time: "23:00", armed: false, resolved: true, fill: 22, by: "A. Gueye" },
  { day: "Mon", site: "Thomas Place", guard: "A. Al Dossary", time: "15:00", armed: false, resolved: true, fill: 35, by: "C. Nichols" },
  { day: "Tue", site: "Hilton Arlington Rosslyn", guard: "T. Bullock", time: "07:00", armed: false, resolved: true, fill: 18, by: "A. Tchwenko" },
  { day: "Wed", site: "Edlandria", guard: "J. Herrera", time: "23:00", armed: true, resolved: true, fill: 41, by: "B. Adams" },
  { day: "Thu", site: "Birchwood", guard: "C. Nichols", time: "15:00", armed: false, resolved: true, fill: 28, by: "A. Adams" },
  { day: "Fri", site: "Columbia Park", guard: "G. Terrell", time: "23:00", armed: true, resolved: false, fill: null, by: null },
  { day: "Fri", site: "Wildwood Park", guard: "A. Ojoye", time: "15:00", armed: false, resolved: true, fill: 15, by: "E. Teklu" },
  { day: "Sat", site: "SouthPort Apartments", guard: "B. Adams", time: "07:00", armed: true, resolved: true, fill: 52, by: "J. Herrera" },
  { day: "Sat", site: "Randolph Towers", guard: "J. Farmer", time: "23:00", armed: false, resolved: true, fill: 19, by: "A. Gueye" },
  { day: "Sun", site: "Dolley Madison Towers", guard: "F. Amoako", time: "15:00", armed: true, resolved: false, fill: null, by: null },
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Mock API functions
export async function getSites(): Promise<Site[]> {
  return SITES;
}

export async function getGuards(): Promise<Guard[]> {
  return GUARDS;
}

export async function getCallOuts(): Promise<CallOut[]> {
  return CALLOUTS;
}

// Synchronous access for components that need immediate data
export { SITES, GUARDS, CALLOUTS };
