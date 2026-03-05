-- IronWatch Dashboard — Seed Data
-- Run this after schema.sql to populate with initial data

-- Sites (24 security sites in Arlington, VA area)
insert into sites (id, name, addr, armed, tier) values
  (1054, '16th Street', '1730 16th St N, Arlington', false, 'B'),
  (1033, 'Birchwood', '545 N Pollard St, Arlington', false, 'B'),
  (1050, 'Cavalier Court', '11100 Cavalier Ct, Fairfax', false, 'B'),
  (1042, 'Cherry Hill', '2120 N Monroe St, Arlington', false, 'B'),
  (1045, 'Columbia Park', '942 S Wakefield St, Arlington', true, 'A'),
  (1051, 'Columbia View', '3416 Spring Ln, Falls Church', false, 'B'),
  (1043, 'Courtland Park', '2500 Clarendon Blvd, Arlington', false, 'B'),
  (1044, 'Courtland Towers', '1200 N Veitch St, Arlington', false, 'B'),
  (1046, 'Dolley Madison Towers', '2300 24th Rd S, Arlington', true, 'A'),
  (1049, 'Edlandria', '6198 Edsall Rd, Alexandria', true, 'A'),
  (1037, 'Henderson Park', '4301 Henderson Rd, Arlington', false, 'B'),
  (1053, 'Hilton Arlington Rosslyn', '1900 N Ft Myer Dr, Arlington', false, 'A'),
  (1034, 'Quincy Plaza', '3900 Fairfax Dr, Arlington', false, 'B'),
  (1035, 'Randolph Towers', '4001 9th St N, Arlington', false, 'B'),
  (1036, 'Richmond Square', '900 N Randolph St, Arlington', false, 'B'),
  (1052, 'Rosslyn Towers', '1919 N Nash St, Arlington', false, 'B'),
  (1007, 'SouthPort Apartments', '6112 Edsall Rd, Alexandria', true, 'A'),
  (1032, 'The Amelia', '816 N Oakland St, Arlington', false, 'B'),
  (1038, 'Thomas Court', '470 N Thomas St, Arlington', false, 'B'),
  (1039, 'Thomas Place', '461 N Thomas St, Arlington', false, 'B'),
  (1040, 'Virginia Square Plaza', '801 N Monroe St, Arlington', false, 'B'),
  (1041, 'Virginia Square Towers', '3444 Fairfax Dr, Arlington', false, 'B'),
  (1047, 'Wildwood Park', '5550 Columbia Pike, Arlington', false, 'B'),
  (1048, 'Wildwood Towers', '1075 S Jefferson St, Arlington', false, 'B');

-- Guards (17 security officers)
insert into guards (id, name, role, armed, grs, hrs, max, last_out, status) values
  (1438, 'A. Gueye', 'Unarmed Officer', false, 88, 32, 40, '19:00', 'on-duty'),
  (1194, 'A. Ojoye', 'Security Officer', false, 82, 36, 40, '18:00', 'on-duty'),
  (1371, 'A. Adams', 'Unarmed Officer', false, 79, 28, 40, '22:00', 'off-duty'),
  (1130, 'A. Lyles', 'Security Officer', false, 74, 40, 40, '07:00', 'off-duty'),
  (1296, 'B. Adams', 'Armed Officer', true, 91, 34, 40, '20:00', 'on-duty'),
  (1303, 'C. Meador', 'Supervisor', false, 85, 38, 40, '21:00', 'on-duty'),
  (1293, 'C. Nichols', 'Unarmed Officer', false, 77, 24, 40, '15:00', 'on-duty'),
  (1191, 'E. Teklu', 'Security Officer', false, 93, 30, 40, '07:00', 'on-duty'),
  (1446, 'F. Amoako', 'Armed Officer', true, 86, 32, 40, '11:00', 'training'),
  (1195, 'G. Terrell', 'Armed Officer', true, 90, 36, 40, '17:00', 'on-duty'),
  (1314, 'J. Farmer', 'Security Officer', false, 71, 40, 40, '05:00', 'on-duty'),
  (1359, 'J. Herrera', 'Armed Officer', true, 87, 30, 40, '20:00', 'on-duty'),
  (1322, 'K. Butler', 'Supervisor', false, 84, 36, 40, '19:00', 'on-duty'),
  (1378, 'T. Bullock', 'Unarmed Officer', false, 80, 28, 40, '16:00', 'off-duty'),
  (1185, 'A. Tchwenko', 'Security Officer', false, 76, 32, 40, '14:00', 'off-duty'),
  (1366, 'A. Al Dossary', 'Security Officer', false, 72, 20, 40, '10:00', 'off-duty'),
  (1338, 'A. Omar', 'Security Officer', false, 65, 0, 40, null, 'inactive');

-- Call-outs (10 weekly call-outs)
insert into call_outs (day, site, guard, time, armed, resolved, fill, by) values
  ('Mon', 'Courtland Towers', 'A. Lyles', '23:00', false, true, 22, 'A. Gueye'),
  ('Mon', 'Thomas Place', 'A. Al Dossary', '15:00', false, true, 35, 'C. Nichols'),
  ('Tue', 'Hilton Arlington Rosslyn', 'T. Bullock', '07:00', false, true, 18, 'A. Tchwenko'),
  ('Wed', 'Edlandria', 'J. Herrera', '23:00', true, true, 41, 'B. Adams'),
  ('Thu', 'Birchwood', 'C. Nichols', '15:00', false, true, 28, 'A. Adams'),
  ('Fri', 'Columbia Park', 'G. Terrell', '23:00', true, false, null, null),
  ('Fri', 'Wildwood Park', 'A. Ojoye', '15:00', false, true, 15, 'E. Teklu'),
  ('Sat', 'SouthPort Apartments', 'B. Adams', '07:00', true, true, 52, 'J. Herrera'),
  ('Sat', 'Randolph Towers', 'J. Farmer', '23:00', false, true, 19, 'A. Gueye'),
  ('Sun', 'Dolley Madison Towers', 'F. Amoako', '15:00', true, false, null, null);
