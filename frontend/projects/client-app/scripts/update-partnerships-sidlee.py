#!/usr/bin/env python3
"""Update partnerships i18n with Sid Lee work page texts."""
import json
from pathlib import Path

I18N_DIR = Path(__file__).resolve().parents[1] / "public" / "i18n"

# Sid Lee detail content — intro, 3 blocks, outro
CONTENT = {
    "en": {
        "toughCookies": {
            "intro": "Over four years, the Tough Cookies campaign has raised $1.7 million for the Fondation Charles-Bruneau through IGA stores across Quebec. Every year, kids who have beaten cancer create characters that become temporary tattoos sold at checkout—unlocking AR adventures, mobile games, and interactive stories.",
            "block1": {"title": "Co-Creation with Young Survivors", "body": "Children draw their favorite foods; tattoo artists translate them into temporary tattoos that come alive through augmented reality. The approach raised $450,000 in its first year, proof that co-creation with young survivors can drive both engagement and fundraising."},
            "block2": {"title": "Building a Video Game in Six Weeks", "body": "The second year introduced a mobile game where tattoos unlocked playable characters across four taste-themed levels. Over 20,000 players cleared more than 4,000 levels, and arcade versions were installed in hospitals."},
            "block3": {"title": "Impact Through Play", "body": "Across four editions, Tough Cookies raised more than $1.7 million while engaging over 80,000 players—transforming charitable giving into family play rather than competing with expensive merchandise or celebrity appeals."},
            "outroTitle": "Tattoos to millions",
            "outro": "Tough Cookies replaced abstract research funding with personal stories families can see and touch—kids who are alive, healthy, and contributing their creativity.",
        },
        "gillesVilleneuve": {
            "intro": "Gilles Villeneuve was more than a driver; he was a cultural icon. The Villeneuve family's ambition was to reclaim ownership of the complete story and ensure his legacy inspires a new generation.",
            "block1": {"title": "A Brand Defined by Chapters", "body": "What if the brand itself became a living tribute to Gilles' extraordinary journey? We imagined a platform where fans and newcomers could connect with the spirit of Gilles Villeneuve."},
            "block2": {"title": "Building the Experience", "body": "A signature logo echoing Gilles' handwriting, an interactive timeline, an e-commerce website, and official merchandise—each piece designed to honor his raw skills and instinct."},
            "block3": {"title": "Global Reach", "body": "New social channels take his legacy beyond the website, turning history into conversation and inviting younger, global audiences to discover Gilles."},
            "outroTitle": "A legacy in motion",
            "outro": "Sid Lee transformed a revered legacy into a living brand experience, empowering a new generation of fans to keep the legend's spirit racing forward.",
        },
        "rona": {
            "intro": "For RONA, a brand deeply rooted in Quebec, connecting with customers meant embracing the way they actually talk about renovation—not just technical product terms.",
            "block1": {"title": "Translating Hardware into Québécois", "body": "When looking for a \"tackeuse,\" a \"zigouilleur,\" or a \"tempo,\" users couldn't find products without knowing exact technical terms. We closed the gap by embracing local slang."},
            "block2": {"title": "A Revolution from Within", "body": "We built a custom search engine understanding everyday language, integrating over 225 regional terms through data analysis, field research, and technical integration."},
            "block3": {"title": "Impact", "body": "5.3M organic impressions, +125% website traffic, and 22K new website searches—proving RONA understands the reality of the people who use its tools."},
            "outroTitle": "An exercise in reno-linguistics",
            "outro": "The DIYctionary sparked conversation across Quebec and proved that the best experiences are the ones that are authentic.",
        },
        "igaAvatars": {
            "intro": "During Montreal Canadiens home games, the Bell Centre lights up with a guessing game on the 8K jumbotron—a 3D avatar slowly takes shape in IGA's signature animated style.",
            "block1": {"title": "Training a Model on IGA's Visual Signature", "body": "Sid Lee built a custom AI pipeline, training a diffusion model on IGA's visual archive to generate avatars that look authentically \"IGA\" at stadium scale."},
            "block2": {"title": "The Artisan's Hand", "body": "Artists refined every portrait—proportions adjusted, lighting balanced, materials polished—until everything hit broadcast-quality standards on a 60-foot screen."},
            "block3": {"title": "Beyond the Jumbotron", "body": "Ten avatars delivered in a fraction of traditional 3D time. The pipeline lets IGA bring real people into its animated world—from employees to local legends."},
            "outroTitle": "Cartoon warmth at 60 feet",
            "outro": "IGA's AI pipeline keeps the brand's style intact while opening new ways to tell human stories at any scale.",
        },
        "loto": {
            "intro": "Every week, millions of Quebecers open the Loto-Québec app to check their lottery numbers. When it came time to play casino games, they had to switch to the website—a split experience that didn't make sense.",
            "block1": {"title": "Ready for a New Chapter", "body": "By 2025, Loto-Québec's mobile app was set for a new chapter. The mandate: design Quebec's first unified gaming app combining weekly lottery play with casino games in a single, seamless experience."},
            "block2": {"title": "Rituals, Routines, and Exploration", "body": "Lottery is a ritual built on habit and anticipation. Casino play is exploratory. The strategy bridged both behaviours in one app, honouring patterns while connecting the two worlds."},
            "block3": {"title": "Play It All in One Place", "body": "In March 2025, Quebecers could check weekly numbers, scan tickets, and jump straight into slots or table games—all without leaving the app."},
            "outroTitle": "A trusted destination",
            "outro": "For Loto-Québec, the new app represents a huge step forward in bringing all offerings into a single, trusted platform.",
        },
        "tfo": {
            "intro": "TFO has been a cultural cornerstone since 1970. Today it stakes its claim in a market saturated by giants with a modern streaming platform on par with the industry's best.",
            "block1": {"title": "The new media landscape", "body": "With cable cuts rising and streaming subscriptions growing, TFO seized the opportunity to redefine audience engagement with an ad-free digital universe."},
            "block2": {"title": "Six weeks to seamless streaming", "body": "In a six-week sprint, we designed, built and launched a platform with 5,000 content items for Francophones and French learners—across tablets, phones, laptops and consoles."},
            "block3": {"title": "Inclusive design is an imperative", "body": "Closed captioning, transcription, keyboard navigation, and adaptive streaming ensure TFO meets stringent benchmarks for inclusivity and accessibility."},
            "outroTitle": "Stay tuned for season 2",
            "outro": "Through continual refinements, TFO remains an enriching destination for language learners and Francophone audiences across Ontario.",
        },
        "resortsWorld": {
            "intro": "Digital Kitchen's GLOW is a collection of 5 shows designed to turn heads on the Las Vegas strip. Resorts World Las Vegas features some of the largest screens in North America.",
            "block1": {"title": "Beyond neon signs", "body": "GLOW's 5 shows run day and night on RWLV's 100,000 square foot exterior display, mirrored by a globe-like screen in the lobby—five joyfully psychedelic short films paying tribute to Vegas surrealism and glamour."},
            "block2": {"title": "The five digital artscapes", "body": "Each show employs distinct art styles—from an interdimensional 2D cat explorer to a motion-captured dance love story—each matched with an original cinematic soundtrack."},
            "block3": {"title": "Neon Space", "body": "\"Neon Space\" is a psychedelic journey into space featuring an animated feline named Cheddar. GLOW recently took home Platinum at the MUSE awards in the Experiential & Immersive category."},
            "outroTitle": "The heartbeat of Vegas",
            "outro": "Each night RWLV joins the chorus with GLOW—a stunning burst of psychedelic colour and form on the most visually competitive space on earth.",
        },
        "cheekbone": {
            "intro": "More than 100 Indigenous communities in Canada don't have access to clean drinking water. Sid Lee collaborated with Cheekbone Beauty to create Glossed Over—a lip gloss collection of contaminated water sourced from Indigenous communities.",
            "block1": {"title": "Special Delivery", "body": "Leaders from Grassy Narrows, Neskantaga, and Cowichan Tribes collected real water samples processed into 50 tubes, packaged into premium boxes designed by our artisans."},
            "block2": {"title": "Would you put this to your lips?", "body": "For Indigenous History Month, influencers and politicians received polluted lip glosses. Sephora Canada featured the sets, hitting 36 million organic impressions on social media."},
            "block3": {"title": "Raising funds for clean water", "body": "Every dollar of Cheekbone's Sephora sales in June 2022 went to Water First. Glossed Over raised over $45,000, training over 400 Indigenous youth as certified water treatment plant operators."},
            "outroTitle": "Experience the reality",
            "outro": "Glossed Over enabled Canadians to experience the realities of people in Indigenous communities who don't have a choice.",
        },
        "hogwarts": {
            "intro": "The Harry Potter universe has between 200 and 300 million fans. When WB Games Avalanche announced the most ambitious Harry Potter game in history, it called for an extraordinary launch strategy. Dreams were at stake.",
            "block1": {"title": "Calling fans to live the unwritten", "body": "We reignited Harry Potter fandom culture by engaging with memes, hosting trending topics, and crafting captivating assets—potion, spell, and beast demonstrations, an Unauthorized Guide to Hogwarts, and more."},
            "block2": {"title": "Growing alongside the fan base", "body": "A dynamic social campaign that evolved with fans—listening to conversations to provide the exact snippets of content they wanted most, keeping the magic alive at State of Play and Gamescom."},
            "block3": {"title": "Lumos!", "body": "The real honor was playing a significant role in one of the most substantial culture events in the 2023 gaming landscape—building connection with fans and sending them off to their first day at school."},
            "outroTitle": "The unwritten chapter",
            "outro": "We grew infectious excitement and ultimately sent fans off to their first day at Hogwarts School of Witchcraft and Wizardry.",
        },
        "canadiens": {
            "intro": "The Montreal Canadiens are the oldest professional hockey team in Canadian history—their creation precedes the NHL itself. Gen Z has an entirely fresh orientation to sports, so we decided to tell a different story: individuality, self-expression, and originality. The story of a city.",
            "block1": {"title": "Brand as Trojan horse", "body": "OG1's branding was based on Montréal-born brands, organizations and cultural figures—with the Canadiens conspicuously absent. On Thanksgiving weekend, 50 influencers were invited to a secret event at the Montreal Pool Room."},
            "block2": {"title": "Game day", "body": "One week later, OG1 was revealed as The Original One on the ice of the home opener. 20,000 roaring fans rallied together, and the launch video was broadcast to the entire country."},
            "block3": {"title": "18 million impressions", "body": "18 million impressions sparkled on socials. We can't wait for the next chapter of Canada's oldest team and its fresh connection to a dynamic city like no other."},
            "outroTitle": "The Original One",
            "outro": "OG1 resonated with all generations through a story of individuality, self-expression, and originality in every sense of the word.",
        },
        "linkbuds": {
            "intro": "When Sony broke their own alphanumeric naming rule with the launch of Linkbuds, we heard the ambition to innovate loud and clear. We worked with Sony to shake their traditional product launch mold and align with Gen Z's playful spirit.",
            "block1": {"title": "Enter the Portal", "body": "Sony Linkbuds are hollow, like a donut—a portal to seamlessly blend listening to music and interacting with surrounding environments. We created an immersive film with VFX and intricate sound design, branded with #Neveroff."},
            "block2": {"title": "How it went", "body": "Performance for Gen Z audiences increased across all social channels. A TikTok brand lift study called the film \"outstanding\", citing significant lift in Ad recall."},
            "block3": {"title": "#LinkBudsNeverOff", "body": "The hashtag went viral on TikTok with 21 billion views, making it the audio industry's most famous HTC. Strong client relationship + trust to get bold = big results."},
            "outroTitle": "Way up high",
            "outro": "We set the bar for Sony's new product launches where it belongs: way up high.",
        },
        "callisto": {
            "intro": "The Callisto Protocol is the first title from Striking Distance Studios. Its creator Glen Schofield co-wrote Dead Space—one of the best horror games of all time. The stakes were high between audiences who had never heard of it and fans with bullish expectations.",
            "block1": {"title": "Disseminating dread", "body": "In a 6-week sprint, we generated an organic social campaign and created an AR Filter for Instagram—teasing story arcs, characters, and weapon upgrades with shocking visuals and cryptic copy."},
            "block2": {"title": "Rise, dead man", "body": "Digital Kitchen created the Live Action Trailer combining live-action and VFX to unravel the spine-chilling Black Iron Prison. Partnering with Prettybird director Vellas and Rodeo FX, filmed in Brazil and Los Angeles."},
            "block3": {"title": "Peak exclusivity", "body": "Fans joined our SMS partnership with Community for customized teasers, first looks at weapon closeups, and an AR filter placing fans face-to-face with one of Callisto's horrific biophage worms."},
            "outroTitle": "A strong platform",
            "outro": "The horror and beauty of Callisto's setting spoke for itself—all it needed was a strong platform, delivered in time for two major holidays.",
        },
    },
    "pl": {
        "toughCookies": {
            "intro": "Przez cztery lata kampania Tough Cookies zebrała 1,7 mln USD dla Fondation Charles-Bruneau w sklepach IGA w Quebecu. Co roku dzieci, które pokonały raka, tworzą postacie zamieniane w tatuaże na kasie — odblokowujące AR, gry mobilne i interaktywne historie.",
            "block1": {"title": "Co-kreacja z młodymi ocalałymi", "body": "Dzieci rysują ulubione jedzenie; artyści tatuażu zamieniają je w tatuaże ożywiane w AR. W pierwszym roku zebrano 450 000 USD."},
            "block2": {"title": "Gra wideo w sześć tygodni", "body": "W drugim roku tatuaże odblokowywały postacie w grze mobilnej z czterema poziomami smaków. Ponad 20 000 graczy ukończyło 4 000 poziomów."},
            "block3": {"title": "Wpływ przez zabawę", "body": "W czterech edycjach zebrano ponad 1,7 mln USD i zaangażowano 80 000 graczy — zamieniając datki w rodzinną zabawę."},
            "outroTitle": "Od tatuaży do milionów",
            "outro": "Tough Cookies zastąpiło abstrakcyjne finansowanie badań osobistymi historiami, które rodziny mogą zobaczyć i dotknąć.",
        },
        "gillesVilleneuve": {
            "intro": "Gilles Villeneuve był czymś więcej niż kierowcą — ikoną kultury. Rodzina Villeneuve chciała odzyskać pełną opowieść i inspirować nowe pokolenie.",
            "block1": {"title": "Marka zdefiniowana przez rozdziały", "body": "Co jeśli marka stanie się żywym hołdem dla drogi Gillesa? Stworzyliśmy platformę, na której fani łączą się z jego duchem."},
            "block2": {"title": "Budowanie doświadczenia", "body": "Logo w stylu podpisu, interaktywna oś czasu, sklep e-commerce i oficjalny merchandising — każdy element oddaje jego instynkt i pasję."},
            "block3": {"title": "Globalny zasięg", "body": "Kanały social przeniosły dziedzictwo poza stronę, zamieniając historię w rozmowę i zapraszając młodsze, globalne audytorium."},
            "outroTitle": "Dziedzictwo w ruchu",
            "outro": "Legenda stała się żywym doświadczeniem marki, które inspiruje nowe pokolenie fanów.",
        },
        "rona": {
            "intro": "Dla RONA, marki głęboko zakorzenionej w Quebecu, autentyczność oznaczała mówić językiem klientów o remontach — nie tylko terminami technicznymi.",
            "block1": {"title": "Hardware po quebecku", "body": "Szukając „tackeuse”, „zigouilleur” czy „tempo”, użytkownicy nie znajdowali produktów bez znajomości terminów technicznych."},
            "block2": {"title": "Rewolucja od środka", "body": "Zbudowaliśmy silnik wyszukiwania rozumiejący codzienny język, integrując ponad 225 regionalnych terminów."},
            "block3": {"title": "Wpływ", "body": "5,3 mln organicznych wyświetleń, +125% ruchu na stronie i 22 tys. nowych wyszukiwań."},
            "outroTitle": "Ćwiczenie z reno-linguistyki",
            "outro": "DIYctionary rozpalił rozmowę w Quebecu i udowodnił, że najlepsze doświadczenia są autentyczne.",
        },
        "igaAvatars": {
            "intro": "Podczas meczów Canadiens Bell Centre rozświetla się grą na jumbotronie 8K — awatar 3D powoli nabiera kształtu w stylu animacji IGA.",
            "block1": {"title": "Model wytrenowany na sygnaturze IGA", "body": "Zbudowaliśmy pipeline AI, trenując model dyfuzyjny na archiwum wizualnym IGA."},
            "block2": {"title": "Ręka artysty", "body": "Artyści dopracowywali każdy portret aż do jakości broadcast na ekranie o szerokości 18 metrów."},
            "block3": {"title": "Poza jumbotronem", "body": "Dziesięć awatarów w ułamku czasu tradycyjnego 3D. Pipeline pozwala wprowadzać prawdziwych ludzi do świata marki."},
            "outroTitle": "Kreskówkowe ciepło na 18 metrach",
            "outro": "Pipeline AI zachowuje styl IGA i otwiera nowe sposoby opowiadania ludzkich historii.",
        },
        "loto": {
            "intro": "Co tydzień miliony Quebeckerów otwierają aplikację Loto-Québec, by sprawdzić numery. Gra w kasynie wymagała przejścia na stronę — rozdzielone doświadczenie bez sensu.",
            "block1": {"title": "Gotowi na nowy rozdział", "body": "Mandat: zaprojektować pierwszą zunifikowaną aplikację gamingową Quebecu łączącą loterię z grami kasynowymi."},
            "block2": {"title": "Rytuały, rutyny i eksploracja", "body": "Loteria to rytuał nawyku i oczekiwania. Kasyno to eksploracja. Strategia połączyła oba zachowania w jednej aplikacji."},
            "block3": {"title": "Graj wszystko w jednym miejscu", "body": "W marcu 2025 Quebeckerzy mogą sprawdzić numery, zeskanować bilety i przejść do slotów — bez opuszczania aplikacji."},
            "outroTitle": "Zaufane miejsce",
            "outro": "Nowa aplikacja to ogromny krok naprzód w zjednoczeniu wszystkich ofert na jednej zaufanej platformie.",
        },
        "tfo": {
            "intro": "TFO to filar kultury od 1970 roku. Dziś konkuuruje z gigantami dzięki nowoczesnej platformie streamingowej dorównującej najlepszym w branży.",
            "block1": {"title": "Nowy krajobraz mediów", "body": "Przy rosnących rezygnacjach z kabla TFO przedefiniowało zaangażowanie widzów bezpłatnym cyfrowym wszechświatem treści."},
            "block2": {"title": "Sześć tygodni do streamingu", "body": "W sześciotygodniowym sprincie uruchomiliśmy platformę z 5000 pozycji dla frankofonów i uczących się francuskiego."},
            "block3": {"title": "Design inkluzywny to imperatyw", "body": "Napisy, transkrypcje, nawigacja klawiaturą i adaptacyjny streaming spełniają rygorystyczne standardy dostępności."},
            "outroTitle": "Wkrótce sezon 2",
            "outro": "Dzięki ciągłym ulepszeniom TFO pozostaje ważnym miejscem dla frankofonów w Ontario.",
        },
        "resortsWorld": {
            "intro": "GLOW Digital Kitchen to kolekcja 5 show mających przyciągnąć wzrok na Stripie w Las Vegas. Resorts World ma jedne z największych ekranów w Ameryce Północnej.",
            "block1": {"title": "Poza neonami", "body": "5 show GLOW działa na 9300 m² ekranu zewnętrznego i globie w lobby — pięć psychedelicznych filmów oddających surrealizm Vegas."},
            "block2": {"title": "Pięć cyfrowych artscape'ów", "body": "Każdy show ma inny styl — od 2D kota w innym wymiarze po love story z motion capture — z oryginalną ścieżką dźwiękową."},
            "block3": {"title": "Neon Space", "body": "„Neon Space” to psychedeliczna podróż w kosmos z kotem Cheddar. GLOW zdobyło Platynę na MUSE w kategorii Experiential & Immersive."},
            "outroTitle": "Puls Vegas",
            "outro": "Każdej nocy RWLV dołącza do chóru z GLOW — spektakularnym wybuchem koloru na najbardziej konkurencyjnej przestrzeni wizualnej świata.",
        },
        "cheekbone": {
            "intro": "Ponad 100 społeczności rdzennych w Kanadzie nie ma dostępu do czystej wody pitnej. Sid Lee współpracowało z Cheekbone Beauty nad Glossed Over — kolekcją błyszczyków z skażonej wody ze społeczności rdzennych.",
            "block1": {"title": "Specjalna dostawa", "body": "Liderzy z Grassy Narrows, Neskantaga i Cowichan Tribes zebrali próbki wody przetworzone na 50 tubek w premium opakowaniach."},
            "block2": {"title": "Czy nałożyłbyś to na usta?", "body": "W Miesiącu Historii Rdzennych influencerzy i politycy dostali skażone błyszczyki. Sephora Canada zaprezentowała zestawy — 36 mln organicznych wyświetleń."},
            "block3": {"title": "Fundusze na czystą wodę", "body": "Każdy dolar sprzedaży Cheekbone w Sephorze w czerwcu 2022 poszedł do Water First. Zebrano ponad 45 000 USD, przeszkolono 400 młodych operatorów uzdatniania wody."},
            "outroTitle": "Poczuj rzeczywistość",
            "outro": "Glossed Over pozwoliło Kanadyjczykom doświadczyć rzeczywistości społeczności rdzennych, które nie mają wyboru.",
        },
        "hogwarts": {
            "intro": "Wszechświat Harry'ego Pottera ma 200–300 mln fanów. Gdy WB Games Avalanche ogłosiło najambitniejszą grę w historii serii, potrzebna była wyjątkowa strategia launchu. Marzenia były na szali.",
            "block1": {"title": "Zaproszenie fanów do nie napisanego", "body": "Odżywiliśmy kulturę fandomu — memy, trending topics, demonstracje eliksirów i zaklęć, Nieautoryzowany Przewodnik po Hogwarcie i więcej."},
            "block2": {"title": "Rosnąc razem z fanami", "body": "Dynamiczna kampania social ewoluująca z fanami — słuchając rozmów, by dawać dokładnie te fragmenty treści, których chcieli na State of Play i Gamescom."},
            "block3": {"title": "Lumos!", "body": "Prawdziwy zaszczyt to rola w jednym z najważniejszych wydarzeń kulturowych gamingu 2023 — budowanie więzi z fanami i wysłanie ich na pierwszy dzień w Hogwarcie."},
            "outroTitle": "Nie napisany rozdział",
            "outro": "Rozpaliliśmy zaraźliwą ekscytację i ostatecznie wysłaliśmy fanów na pierwszy dzień w Hogwarcie.",
        },
        "canadiens": {
            "intro": "Montreal Canadiens to najstarszy profesjonalny klub hokejowy w historii Kanady — powstał przed NHL. Gen Z ma świeże podejście do sportu, więc opowiedzieliśmy inną historię: indywidualność, ekspresja i oryginalność. Historię miasta.",
            "block1": {"title": "Marka jako koń trojański", "body": "Branding OG1 oparty na montrealskich markach i postaciach kultury — bez Canadiens. W Thanksgiving 50 influencerów zaproszono na tajne wydarzenie w Montreal Pool Room."},
            "block2": {"title": "Dzień meczu", "body": "Tydzień później OG1 ujawniono jako The Original One na lodzie home openera. 20 000 fanów i wideo transmitowane w całym kraju."},
            "block3": {"title": "18 mln wyświetleń", "body": "18 mln wyświetleń w social. Nie możemy się doczekać kolejnego rozdziału najstarszego klubu Kanady."},
            "outroTitle": "The Original One",
            "outro": "OG1 zarezonowało ze wszystkimi pokoleniami przez historię indywidualności, ekspresji i oryginalności.",
        },
        "linkbuds": {
            "intro": "Gdy Sony złamało własną regułę alfanumerycznych nazw przy Linkbuds, usłyszeliśmy ambicję innowacji. Współpracowaliśmy, by przełamać tradycyjny launch i trafić do ducha Gen Z.",
            "block1": {"title": "Wejdź do portalu", "body": "Linkbuds są puste jak donut — portalem łączącym muzykę z otoczeniem. Stworzyliśmy immersyjny film z VFX i sound designem, z hashtagiem #Neveroff."},
            "block2": {"title": "Jak poszło", "body": "Wyniki dla Gen Z wzrosły na wszystkich kanałach social. Badanie TikTok nazwało film „outstanding” ze znaczącym wzrostem Ad recall."},
            "block3": {"title": "#LinkBudsNeverOff", "body": "Hashtag stał się viralem na TikToku z 21 mld wyświetleń — najsłynniejszym HTC w branży audio."},
            "outroTitle": "Wysoko",
            "outro": "Ustawiliśmy poprzeczkę dla nowych launchy Sony tam, gdzie powinna być: bardzo wysoko.",
        },
        "callisto": {
            "intro": "The Callisto Protocol to pierwszy tytuł Striking Distance Studios. Glen Schofield współtworzył Dead Space — jedną z najlepszych gier grozy. Stawka była wysoka między nowymi odbiorcami a fanami z wielkimi oczekiwaniami.",
            "block1": {"title": "Rozpowszechnianie grozy", "body": "W 6-tygodniowym sprincie stworzyliśmy organiczną kampanię social i filtr AR na Instagram — z szokującymi wizualizacjami i zwięzłym, tajemniczym copy."},
            "block2": {"title": "Rise, dead man", "body": "Digital Kitchen stworzyło Live Action Trailer łączący live-action i VFX, odsłaniając przerażające Black Iron Prison. Nakręcone w Brazylii i Los Angeles."},
            "block3": {"title": "Szczyt ekskluzywności", "body": "Fani dołączyli do SMS z Community po spersonalizowane teasery i filtr AR stawiający ich twarzą w twarz z biophage worm Callisto."},
            "outroTitle": "Silna platforma",
            "outro": "Horror i piękno Callisto mówiły same za siebie — potrzebowały tylko silnej platformy, dostarczonej na dwa główne święta.",
        },
    },
}

IMAGE_ALTS = {
    "en": {
        "toughCookies": ("Fondation Charles-Bruneau & IGA — Tough Cookies", "Tough Cookies co-creation", "Tough Cookies mobile game", "Tough Cookies campaign impact"),
        "gillesVilleneuve": ("Gilles Villeneuve — Reviving a Legend", "Gilles Villeneuve brand", "Gilles Villeneuve experience", "Gilles Villeneuve global reach"),
        "rona": ("Rona — The DIYctionary", "RONA DIYctionary search", "RONA regional terms", "RONA campaign results"),
        "igaAvatars": ("IGA — Stadium-Scale Avatars", "IGA AI pipeline", "IGA avatar refinement", "IGA jumbotron avatars"),
        "loto": ("Loto-Québec Mobile Application", "Loto-Québec app redesign", "Loto-Québec unified experience", "Loto-Québec launch"),
        "tfo": ("TFO — TFO.ORG", "TFO.ORG platform", "TFO streaming sprint", "TFO inclusive design"),
        "resortsWorld": ("Resorts World Las Vegas — GLOW", "GLOW exterior display", "GLOW digital artscapes", "GLOW Neon Space"),
        "cheekbone": ("Cheekbone Beauty — Glossed Over", "Glossed Over delivery", "Glossed Over campaign", "Glossed Over Water First"),
        "hogwarts": ("Hogwarts Legacy — WB Games", "Hogwarts Legacy social", "Hogwarts Legacy fan campaign", "Hogwarts Legacy launch"),
        "canadiens": ("The Montreal Canadiens — The Original One", "OG1 secret event", "OG1 game day reveal", "OG1 social impact"),
        "linkbuds": ("Sony — Linkbuds", "Sony Linkbuds portal film", "Sony Linkbuds Gen Z", "Sony Linkbuds TikTok"),
        "callisto": ("The Callisto Protocol", "Callisto social campaign", "Callisto live action trailer", "Callisto AR filter"),
    },
    "pl": {
        "toughCookies": ("Fondation Charles-Bruneau & IGA — Tough Cookies", "Co-kreacja Tough Cookies", "Gra mobilna Tough Cookies", "Wpływ kampanii Tough Cookies"),
        "gillesVilleneuve": ("Gilles Villeneuve — Ożywienie legendy", "Marka Gilles Villeneuve", "Doświadczenie Gilles Villeneuve", "Zasięg Gilles Villeneuve"),
        "rona": ("Rona — The DIYctionary", "Wyszukiwarka RONA DIYctionary", "Terminy regionalne RONA", "Wyniki kampanii RONA"),
        "igaAvatars": ("IGA — awatary w skali stadionu", "Pipeline AI IGA", "Dopracowanie awatarów IGA", "Awatary IGA na jumbotronie"),
        "loto": ("Loto-Québec — aplikacja mobilna", "Redesign aplikacji Loto-Québec", "Zunifikowane doświadczenie Loto", "Launch Loto-Québec"),
        "tfo": ("TFO — TFO.ORG", "Platforma TFO.ORG", "Sprint streamingowy TFO", "Design inkluzywny TFO"),
        "resortsWorld": ("Resorts World Las Vegas — GLOW", "Ekran zewnętrzny GLOW", "Cyfrowe artscape GLOW", "GLOW Neon Space"),
        "cheekbone": ("Cheekbone Beauty — Glossed Over", "Dostawa Glossed Over", "Kampania Glossed Over", "Glossed Over i Water First"),
        "hogwarts": ("Hogwarts Legacy — WB Games", "Social Hogwarts Legacy", "Kampania fanowska Hogwarts", "Launch Hogwarts Legacy"),
        "canadiens": ("Montreal Canadiens — The Original One", "Tajne wydarzenie OG1", "Ujawnienie OG1 na lodzie", "Wpływ social OG1"),
        "linkbuds": ("Sony — Linkbuds", "Film portalu Linkbuds", "Linkbuds i Gen Z", "Linkbuds na TikToku"),
        "callisto": ("The Callisto Protocol", "Kampania social Callisto", "Live action trailer Callisto", "Filtr AR Callisto"),
    },
}

LISTING = {
    "toughCookies": {"client": "Fondation Charles-Bruneau & IGA", "title": "Tough Cookies"},
    "gillesVilleneuve": {"client": "Gilles Villeneuve", "title": "Reviving a Legend"},
    "rona": {"client": "Rona", "title": "The DIYctionary"},
    "igaAvatars": {"client": "IGA", "title": "The Innovation Behind Stadium-Scale Avatars"},
    "loto": {"client": "Loto-Québec", "title": "Mobile Application"},
    "tfo": {"client": "TFO", "title": "TFO.ORG"},
    "resortsWorld": {"client": "Resorts World Las Vegas", "title": "GLOW | Digital Kitchen"},
    "cheekbone": {"client": "Cheekbone Beauty", "title": "Glossed Over"},
    "hogwarts": {"client": "WB Games | Avalanche", "title": "Hogwarts Legacy"},
    "canadiens": {"client": "The Montreal Canadiens", "title": "The Original One"},
    "linkbuds": {"client": "Sony", "title": "Linkbuds"},
    "callisto": {"client": "Striking Distance Studios", "title": "The Callisto Protocol"},
}

PL_LISTING = {
    "gillesVilleneuve": {"title": "Ożywienie legendy"},
    "igaAvatars": {"title": "Innowacja stojąca za awatarami w skali stadionu"},
    "loto": {"title": "Aplikacja mobilna"},
}


def apply_content(data: dict, lang: str) -> None:
    content_lang = "pl" if lang == "pl" else "en"
    if content_lang not in CONTENT:
        content_lang = "en"

    alts_lang = "pl" if lang == "pl" else "en"

    for slug, listing in LISTING.items():
        prefix = f"marketing.partnerships.projects.{slug}"
        pl_listing = PL_LISTING.get(slug, {})
        data[f"{prefix}.client"] = listing["client"]
        data[f"{prefix}.title"] = pl_listing.get("title", listing["title"]) if lang == "pl" else listing["title"]
        alts = IMAGE_ALTS[alts_lang][slug]
        data[f"{prefix}.imageAlt"] = alts[0]

        if slug in CONTENT[content_lang]:
            c = CONTENT[content_lang][slug]
            data[f"{prefix}.detail.intro"] = c["intro"]
            data[f"{prefix}.detail.outroTitle"] = c["outroTitle"]
            data[f"{prefix}.detail.outro"] = c["outro"]
            for i, bk in enumerate(["block1", "block2", "block3"], 1):
                data[f"{prefix}.detail.{bk}.title"] = c[bk]["title"]
                data[f"{prefix}.detail.{bk}.body"] = c[bk]["body"]
                if i < len(alts):
                    data[f"{prefix}.detail.{bk}.imageAlt"] = alts[i]


for lang_file in sorted(I18N_DIR.glob("*.json")):
    lang = lang_file.stem
    with open(lang_file, encoding="utf-8") as f:
        data = json.load(f)
    apply_content(data, lang)
    with open(lang_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Updated {lang_file.name}")
