import type { GameDetails } from '../../api/types'

// Udawany katalog (catalog-service + RAWG). Opisy są krótkie i własne, obrazków brak –
// frontend generuje wtedy okładkę z nazwy. Prawdziwe dane i grafiki przyjdą z RAWG.
interface MockGame extends GameDetails {
  /** dodatkowe nazwy do wyszukiwania, np. polskie tytuły */
  aliases?: string[]
}

const game = (
  rawgId: number,
  name: string,
  released: string | null,
  rating: string,
  genres: string[],
  platforms: string[],
  description: string,
  aliases?: string[],
): MockGame => ({ rawgId, name, released, rating, genres, platforms, description, imageUrl: null, aliases })

const PC = 'PC'
const PS5 = 'PlayStation 5'
const PS4 = 'PlayStation 4'
const XSX = 'Xbox Series S/X'
const XONE = 'Xbox One'
const SWITCH = 'Nintendo Switch'

export const MOCK_GAMES: MockGame[] = [
  game(3328, 'The Witcher 3: Wild Hunt', '2015-05-18', '4.65', ['Action', 'RPG'], [PC, PS5, XSX, PS4, XONE, SWITCH], 'Geralt z Rivii szuka Ciri w otwartym świecie pełnym potworów, politycznych intryg i zadań pobocznych, które potrafią przyćmić główny wątek.', ['Wiedźmin 3: Dziki Gon', 'Wiedzmin 3']),
  game(10073, 'The Witcher 2: Assassins of Kings', '2011-05-16', '4.21', ['Action', 'RPG'], [PC, 'Xbox 360'], 'Geralt zostaje wplątany w spisek królobójców, a jego wybory dzielą historię na dwie zupełnie różne ścieżki.', ['Wiedźmin 2: Zabójcy królów', 'Wiedzmin 2']),
  game(10035, 'The Witcher', '2007-10-24', '3.92', ['RPG'], [PC], 'Pierwsza przygoda Geralta, oparta na prozie Andrzeja Sapkowskiego: Wyzima, zaraza i tajemnicza Salamandra.', ['Wiedźmin', 'Wiedzmin']),
  game(901341, 'The Witcher 4', null, '0', ['Action', 'RPG'], [PC, PS5, XSX], 'Nowa saga wiedźmińska – tym razem z Ciri w roli głównej. Data premiery nie jest jeszcze znana.', ['Wiedźmin 4', 'Wiedzmin 4']),
  game(41494, 'Cyberpunk 2077', '2020-12-10', '4.21', ['Action', 'RPG', 'Shooter'], [PC, PS5, XSX], 'Najemnik V próbuje przetrwać w Night City, mając w głowie chip z cyfrową kopią legendarnego rockersa.'),
  game(326243, 'Elden Ring', '2022-02-25', '4.43', ['Action', 'RPG'], [PC, PS5, XSX, PS4, XONE], 'Wymagające RPG akcji w ogromnych Ziemiach Pomiędzy – każdy boss to osobna lekcja cierpliwości.'),
  game(274755, 'Hades', '2020-09-17', '4.42', ['Action', 'Indie', 'RPG'], [PC, SWITCH, PS5, XSX], 'Zagreus, syn boga podziemi, raz po raz próbuje uciec z Hadesu. Każda śmierć odsłania kolejny kawałek historii.'),
  game(927451, 'Hades II', '2025-09-25', '4.51', ['Action', 'Indie', 'RPG'], [PC, SWITCH], 'Melinoe, siostra Zagreusa, rusza do walki z Kronosem w kontynuacji mitologicznego roguelike’a.'),
  game(324997, "Baldur's Gate 3", '2023-08-03', '4.47', ['RPG', 'Strategy'], [PC, PS5, XSX], 'Drużynowe RPG w świecie Dungeons & Dragons, w którym niemal każda decyzja i rzut kością zmienia przebieg przygody.'),
  game(28, 'Red Dead Redemption 2', '2018-10-26', '4.59', ['Action', 'Adventure'], [PC, PS4, XONE], 'Arthur Morgan i gang Van der Lindego próbują przetrwać schyłek epoki Dzikiego Zachodu.'),
  game(3498, 'Grand Theft Auto V', '2013-09-17', '4.47', ['Action', 'Adventure'], [PC, PS5, XSX, PS4, XONE], 'Trzech przestępców, jedno słoneczne Los Santos i seria coraz bardziej zuchwałych skoków.', ['GTA 5', 'GTA V']),
  game(4200, 'Portal 2', '2011-04-18', '4.61', ['Puzzle', 'Shooter'], [PC, 'PlayStation 3', 'Xbox 360'], 'Logiczne łamigłówki z działem portalowym, sarkastyczna sztuczna inteligencja i jeden z najzabawniejszych scenariuszy w grach.'),
  game(4286, 'Portal', '2007-10-09', '4.50', ['Puzzle'], [PC, 'Xbox 360'], 'Krótka, genialna gra logiczna o testach, portalach i ciaście, które może być kłamstwem.'),
  game(5679, 'The Elder Scrolls V: Skyrim', '2011-11-11', '4.42', ['Action', 'RPG'], [PC, PS5, XSX, SWITCH], 'Smoki wracają do Tamriel – otwarty świat, w którym można być, kim się chce, i zgubić się na setki godzin.', ['Skyrim']),
  game(22511, 'The Legend of Zelda: Breath of the Wild', '2017-03-03', '4.50', ['Action', 'Adventure', 'RPG'], [SWITCH, 'Wii U'], 'Link budzi się po stu latach i odkrywa zrujnowany Hyrule, który można zwiedzać w dowolnej kolejności.', ['Zelda']),
  game(58175, 'God of War', '2018-04-20', '4.57', ['Action', 'Adventure'], [PS4, PC], 'Kratos i jego syn Atreus wyruszają w podróż przez krainy nordyckiej mitologii.'),
  game(3439, 'Life is Strange', '2015-01-29', '4.10', ['Adventure'], [PC, PS4, XONE], 'Max odkrywa, że potrafi cofać czas, i próbuje rozwikłać zagadkę zaginięcia w sennym Arcadia Bay.'),
  game(422, 'Terraria', '2011-05-16', '4.05', ['Action', 'Indie', 'Platformer'], [PC, SWITCH, PS4, XONE], 'Kopanie, budowanie i walka z bossami w dwuwymiarowym świecie pełnym sekretów.'),
  game(2454, 'DOOM', '2016-05-13', '4.38', ['Action', 'Shooter'], [PC, PS4, XONE, SWITCH], 'Szybka, brutalna strzelanina, w której jedynym planem jest atak.'),
  game(3070, 'Fallout 4', '2015-11-10', '3.81', ['Action', 'RPG', 'Shooter'], [PC, PS4, XONE], 'Postapokaliptyczna Wspólnota Bostonu, budowanie osad i poszukiwanie zaginionego syna.'),
  game(3612, 'Stardew Valley', '2016-02-26', '4.39', ['Indie', 'RPG', 'Simulation'], [PC, SWITCH, PS4, XONE], 'Przejmujesz zaniedbaną farmę dziadka i budujesz nowe życie w małym miasteczku.'),
  game(9767, 'Hollow Knight', '2017-02-24', '4.42', ['Action', 'Indie', 'Platformer'], [PC, SWITCH, PS4, XONE], 'Mroczna metroidvania w podziemnym królestwie owadów, z precyzyjną walką i ogromną mapą.'),
  game(3192, 'Hollow Knight: Silksong', '2025-09-04', '4.48', ['Action', 'Indie', 'Platformer'], [PC, SWITCH, PS5, XSX], 'Hornet trafia do nowego królestwa i musi wspiąć się na jego szczyt.', ['Silksong']),
  game(58751, 'Celeste', '2018-01-25', '4.32', ['Indie', 'Platformer'], [PC, SWITCH, PS4, XONE], 'Wymagająca platformówka o wspinaczce na górę i mierzeniu się z własnymi lękami.'),
  game(396121, 'Disco Elysium', '2019-10-15', '4.40', ['Indie', 'RPG'], [PC, PS5, SWITCH, XSX], 'Detektyw z amnezją prowadzi śledztwo w portowym mieście, a największym przeciwnikiem jest jego własna głowa.'),
  game(452634, 'Mass Effect Legendary Edition', '2021-05-14', '4.45', ['Action', 'RPG', 'Shooter'], [PC, PS4, XONE], 'Odświeżona trylogia kosmicznej opery o komandorze Shepardzie i walce o przetrwanie galaktyki.'),
  game(22509, 'Minecraft', '2009-05-10', '4.43', ['Action', 'Simulation'], [PC, SWITCH, PS4, XONE], 'Bloki, kilofy i nieograniczona wyobraźnia – przetrwaj noc albo zbuduj katedrę.'),
  game(47137, 'Fortnite', '2017-07-21', '3.60', ['Action', 'Shooter'], [PC, PS5, XSX, SWITCH], 'Battle royale z budowaniem, ciągle zmieniającą się mapą i sezonowymi przepustkami.'),
  game(362002, 'Genshin Impact', '2020-09-28', '3.70', ['Action', 'RPG'], [PC, PS5, PS4], 'Darmowe RPG akcji z otwartym światem, kolekcjonowaniem postaci i systemem losowań.'),
  game(969002, 'EA SPORTS FC 25', '2024-09-27', '3.05', ['Sports'], [PC, PS5, XSX, SWITCH], 'Coroczna odsłona piłkarskiej serii z rozbudowanym trybem Ultimate Team.', ['FIFA']),
  game(10213, 'Dota 2', '2013-07-09', '3.05', ['Action', 'Strategy'], [PC], 'Drużynowa gra MOBA, w której dwie piątki walczą o zniszczenie bazy przeciwnika.'),
  game(4291, 'Counter-Strike: Global Offensive', '2012-08-21', '3.57', ['Action', 'Shooter'], [PC], 'Taktyczna strzelanina drużynowa: terroryści kontra antyterroryści, runda po rundzie.', ['CS:GO', 'CS GO']),
  game(415171, 'Diablo IV', '2023-06-06', '3.80', ['Action', 'RPG'], [PC, PS5, XSX], 'Mroczne hack’n’slash w świecie Sanktuarium, gdzie łupy i buildy liczą się najbardziej.', ['Diablo 4']),
  game(426742, 'Starfield', '2023-09-06', '3.40', ['RPG'], [PC, XSX], 'Kosmiczne RPG od twórców Skyrima: setki planet, statki do zbudowania i frakcje do poznania.'),
  game(422038, 'Hogwarts Legacy', '2023-02-10', '4.10', ['Action', 'RPG'], [PC, PS5, XSX, SWITCH], 'Przygoda w świecie czarodziejów pod koniec XIX wieku, z otwartym Hogwartem do odkrycia.'),
  game(437059, 'Alan Wake 2', '2023-10-27', '4.20', ['Action', 'Adventure'], [PC, PS5, XSX], 'Survival horror, w którym pisarz i agentka FBI próbują wydostać się z koszmaru pisanego na bieżąco.'),
  game(28568, 'Frostpunk', '2018-04-24', '4.10', ['Simulation', 'Strategy'], [PC, PS4, XONE], 'Strategia przetrwania, w której zarządzasz ostatnim miastem ludzkości w wiecznej zimie.'),
  game(13627, 'This War of Mine', '2014-11-14', '4.00', ['Indie', 'Strategy'], [PC, SWITCH, PS4], 'Wojna widziana oczami cywilów, którzy każdej nocy muszą zdobyć jedzenie i leki.'),
  game(3939, 'Dying Light', '2015-01-26', '4.05', ['Action'], [PC, PS4, XONE], 'Parkour i zombie w zamkniętym kwarantanną mieście Harran. Nocą łowcy stają się zwierzyną.'),
  game(983318, 'Clair Obscur: Expedition 33', '2025-04-24', '4.60', ['RPG'], [PC, PS5, XSX], 'Turowe RPG z elementami akcji o ekspedycji, która próbuje powstrzymać Malarkę przed wymazaniem kolejnych ludzi.'),
]

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Wyszukiwanie jak w RAWG: fragment nazwy (albo aliasu); dopasowania od początku wyżej. */
export function searchCatalog(search: string): GameDetails[] {
  const query = normalize(search)
  if (!query) return []
  const scored: Array<[MockGame, number]> = []
  for (const candidate of MOCK_GAMES) {
    const names = [candidate.name, ...(candidate.aliases ?? [])].map(normalize)
    if (names.some((name) => name.startsWith(query))) scored.push([candidate, 0])
    else if (names.some((name) => name.includes(query))) scored.push([candidate, 1])
  }
  return scored.sort((a, b) => a[1] - b[1] || Number(b[0].rating) - Number(a[0].rating)).map(([found]) => stripAliases(found))
}

export function findCatalogGame(rawgId: number): GameDetails | undefined {
  const found = MOCK_GAMES.find((candidate) => candidate.rawgId === rawgId)
  return found && stripAliases(found)
}

function stripAliases({ aliases: _aliases, ...details }: MockGame): GameDetails {
  return details
}
