export type Team = {
  name: string;
  code: string;
  group: string;
  total: number;
  flag: string;
};

const RAW: Array<[string, string, string, string]> = [
  // [name, code, group, flag]
  ["México", "MEX", "A", "🇲🇽"],
  ["África do Sul", "RSA", "A", "🇿🇦"],
  ["Coreia do Sul", "KOR", "A", "🇰🇷"],
  ["Rep. Tcheca", "CZE", "A", "🇨🇿"],
  ["Canadá", "CAN", "B", "🇨🇦"],
  ["Bósnia", "BIH", "B", "🇧🇦"],
  ["Catar", "QAT", "B", "🇶🇦"],
  ["Suíça", "SUI", "B", "🇨🇭"],
  ["Brasil", "BRA", "C", "🇧🇷"],
  ["Marrocos", "MAR", "C", "🇲🇦"],
  ["Haiti", "HAI", "C", "🇭🇹"],
  ["Escócia", "SCO", "C", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
  ["Estados Unidos", "USA", "D", "🇺🇸"],
  ["Paraguai", "PAR", "D", "🇵🇾"],
  ["Austrália", "AUS", "D", "🇦🇺"],
  ["Turquia", "TUR", "D", "🇹🇷"],
  ["Alemanha", "GER", "E", "🇩🇪"],
  ["Curaçao", "CUW", "E", "🇨🇼"],
  ["Costa do Marfim", "CIV", "E", "🇨🇮"],
  ["Equador", "ECU", "E", "🇪🇨"],
  ["Holanda", "NED", "F", "🇳🇱"],
  ["Japão", "JPN", "F", "🇯🇵"],
  ["Suécia", "SWE", "F", "🇸🇪"],
  ["Tunísia", "TUN", "F", "🇹🇳"],
  ["Bélgica", "BEL", "G", "🇧🇪"],
  ["Egito", "EGY", "G", "🇪🇬"],
  ["Irã", "IRN", "G", "🇮🇷"],
  ["Nova Zelândia", "NZL", "G", "🇳🇿"],
  ["Espanha", "ESP", "H", "🇪🇸"],
  ["Cabo Verde", "CPV", "H", "🇨🇻"],
  ["Arábia Saudita", "KSA", "H", "🇸🇦"],
  ["Uruguai", "URU", "H", "🇺🇾"],
  ["França", "FRA", "I", "🇫🇷"],
  ["Senegal", "SEN", "I", "🇸🇳"],
  ["Iraque", "IRQ", "I", "🇮🇶"],
  ["Noruega", "NOR", "I", "🇳🇴"],
  ["Argentina", "ARG", "J", "🇦🇷"],
  ["Argélia", "ALG", "J", "🇩🇿"],
  ["Áustria", "AUT", "J", "🇦🇹"],
  ["Jordânia", "JOR", "J", "🇯🇴"],
  ["Portugal", "POR", "K", "🇵🇹"],
  ["Congo", "COD", "K", "🇨🇩"],
  ["Uzbequistão", "UZB", "K", "🇺🇿"],
  ["Colômbia", "COL", "K", "🇨🇴"],
  ["Inglaterra", "ENG", "L", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"],
  ["Croácia", "CRO", "L", "🇭🇷"],
  ["Gana", "GHA", "L", "🇬🇭"],
  ["Panamá", "PAN", "L", "🇵🇦"],
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
