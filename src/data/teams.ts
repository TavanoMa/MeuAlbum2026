export type Team = {
  name: string;
  code: string;
  group: string;
  total: number;
  flag: string;
};

const RAW: Array<[string, string, string, string]> = [
  // [name, code, group, flag]

  ["México", "MEX", "A", "mex.png"],
  ["África do Sul", "RSA", "A", "rsa.png"],
  ["Coreia do Sul", "KOR", "A", "kor.png"],
  ["Rep. Tcheca", "CZE", "A", "cze.png"],

  ["Canadá", "CAN", "B", "can.png"],
  ["Bósnia", "BIH", "B", "bih.png"],
  ["Catar", "QAT", "B", "qat.png"],
  ["Suíça", "SUI", "B", "sui.png"],

  ["Brasil", "BRA", "C", "bra.png"],
  ["Marrocos", "MAR", "C", "mar.png"],
  ["Haiti", "HAI", "C", "hai.png"],
  ["Escócia", "SCO", "C", "sco.png"],

  ["Estados Unidos", "USA", "D", "usa.png"],
  ["Paraguai", "PAR", "D", "par.png"],
  ["Austrália", "AUS", "D", "aus.png"],
  ["Turquia", "TUR", "D", "tur.png"],

  ["Alemanha", "GER", "E", "ger.png"],
  ["Curaçao", "CUW", "E", "cuw.png"],
  ["Costa do Marfim", "CIV", "E", "civ.png"],
  ["Equador", "ECU", "E", "ecu.png"],

  ["Holanda", "NED", "F", "ned.png"],
  ["Japão", "JPN", "F", "jpn.png"],
  ["Suécia", "SWE", "F", "swe.png"],
  ["Tunísia", "TUN", "F", "tun.png"],

  ["Bélgica", "BEL", "G", "bel.png"],
  ["Egito", "EGY", "G", "egy.png"],
  ["Irã", "IRN", "G", "irn.png"],
  ["Nova Zelândia", "NZL", "G", "nzl.png"],

  ["Espanha", "ESP", "H", "esp.png"],
  ["Cabo Verde", "CPV", "H", "cpv.png"],
  ["Arábia Saudita", "KSA", "H", "ksa.png"],
  ["Uruguai", "URU", "H", "uru.png"],

  ["França", "FRA", "I", "fra.png"],
  ["Senegal", "SEN", "I", "sen.png"],
  ["Iraque", "IRQ", "I", "irq.png"],
  ["Noruega", "NOR", "I", "nor.png"],

  ["Argentina", "ARG", "J", "arg.png"],
  ["Argélia", "ALG", "J", "alg.png"],
  ["Áustria", "AUT", "J", "aut.png"],
  ["Jordânia", "JOR", "J", "jor.png"],

  ["Portugal", "POR", "K", "por.png"],
  ["Congo", "COD", "K", "cod.png"],
  ["Uzbequistão", "UZB", "K", "uzb.png"],
  ["Colômbia", "COL", "K", "col.png"],

  ["Inglaterra", "ENG", "L", "eng.png"],
  ["Croácia", "CRO", "L", "cro.png"],
  ["Gana", "GHA", "L", "gha.png"],
  ["Panamá", "PAN", "L", "pan.png"],
];

export const TEAMS: Team[] = [
  ...RAW.map(([name, code, group, flag]) => ({
    name,
    code,
    group,
    flag,
    total: 20,
  })),
  { name: "Coca-Cola", code: "CC", group: "Especial", flag: "🥤", total: 14 },
  { name: "FIFA World Cup History", code: "FWC", group: "Especial", flag: "🏆", total: 19 },
];

export function getTeam(code: string): Team | undefined {
  return TEAMS.find((t) => t.code === code);
}

export function stickerIds(team: Team): string[] {
  return Array.from({ length: team.total }, (_, i) => `${team.code}${i + 1}`);
}

export const TOTAL_STICKERS = TEAMS.reduce((s, t) => s + t.total, 0);
