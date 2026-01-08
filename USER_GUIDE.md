# Smart Weekly Planner - Gebruikershandleiding

## Inhoudsopgave
1. [Introductie](#introductie)
2. [Aan de slag](#aan-de-slag)
3. [Stamrooster instellen](#stamrooster-instellen)
4. [Weekplanning beheren](#weekplanning-beheren)
5. [Evaluatie uitvoeren](#evaluatie-uitvoeren)
6. [Weektaak genereren](#weektaak-genereren)
7. [Veelgestelde vragen](#veelgestelde-vragen)

## Introductie

De Smart Weekly Planner is een webapplicatie speciaal ontwikkeld voor leerkrachten in het Nederlands basisonderwijs. Het systeem helpt je om:

- Een vaste roosterstructuur (stamrooster) te beheren
- Automatisch weekplanningen te genereren op basis van lesmethoden
- Voortgang te volgen door lesmethoden zoals Wereld in Getallen en Staal
- Gemiste lessen automatisch te laten terugkomen (backlog-systeem)
- Professionele weektaken te printen voor leerlingen

### Kernfuncties

**🔄 Intelligente Planning**
- Automatische weekgeneratie op basis van je stamrooster
- Backlog-systeem: gemiste lessen komen automatisch terug in de volgende week
- A/B-weekondersteuning voor tweewekelijkse roosters

**📚 Curriculum Tracking**
- Volg precies waar je bent in elke lesmethode
- Het systeem weet welke les de volgende is
- Ondersteunt meerdere vakken en methodes tegelijk

**🎯 Evaluatie Workflow**
- 3-stappenproces aan het einde van elke week
- Registreer welke lessen zijn gegeven
- Voeg extra voortgang toe
- Plan uitzonderingen voor de volgende week

**📄 Professionele Output**
- Genereer printbare weektaken voor leerlingen
- Download als PDF
- Overzichtelijke presentatie per vak

## Aan de slag

### Installatie en opstarten

1. **Installeer dependencies:**
   ```bash
   npm install
   ```

2. **Start de applicatie:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - De applicatie opent automatisch in je browser
   - Standaard URL: http://localhost:3000

### Eerste keer opstarten: Onboarding

Bij de eerste keer opstarten doorloop je een 3-staps onboarding:

#### Stap 1: Basisgegevens
Voer in:
- **Schoolnaam**: Bijv. "De Springplank"
- **Naam leerkracht**: Bijv. "Juf Anna"
- **Groep**: Selecteer uit Groep 1 t/m 8
- **Schooljaar**: Bijv. "2025-2026"

#### Stap 2: Vakken en Roostercyclus

**Roostercyclus:**
- **Wekelijks**: Elke week hetzelfde rooster (meest gebruikt)
- **Tweewekelijks**: Afwisselend Week A en Week B

**Vakken toevoegen:**
- Standaard vakken zijn al ingevuld (Rekenen, Spelling, etc.)
- Voeg extra vakken toe indien nodig
- Verwijder vakken die je niet gebruikt

#### Stap 3: Stamrooster opzetten

Voor elke dag van de week:

1. Klik op **"+ Lesuur toevoegen"**
2. Stel de tijd in (bijv. 08:30 - 09:15)
3. Kies het vak
4. Vink "Pauze" aan als het een pauze is

**Tips:**
- Start met maandag en werk van boven naar beneden
- Gebruik realistische tijden
- Pauzes kun je markeren maar hoeven niet altijd vakken te hebben
- Voor tweewekelijkse roosters: stel eerst Week A in, kopieer dan naar Week B en pas aan

**Na voltooiing:**
Klik op **"Voltooien en starten"** en je bent klaar!

## Stamrooster instellen

### Stamrooster bewerken

Na de onboarding kun je het stamrooster altijd aanpassen:

1. Ga naar het **Dashboard**
2. Klik op **"Stamrooster"**
3. Maak aanpassingen:
   - Lesuren toevoegen/verwijderen
   - Tijden aanpassen
   - Vakken wijzigen

**Voor tweewekelijkse roosters:**
- Wissel tussen Week A en Week B met de knoppen bovenaan
- Gebruik **"Kopieer Week A naar Week B"** om tijd te besparen

4. Klik op **"Opslaan"** om wijzigingen te bewaren

⚠️ **Let op:** Wijzigingen in het stamrooster beïnvloeden alleen nieuwe weekplanningen, niet bestaande!

## Weekplanning beheren

### Je eerste week genereren

1. Ga naar het **Dashboard**
2. Klik op **"Start planning"** (verschijnt bij eerste gebruik)
3. Het systeem genereert automatisch Week 1 op basis van:
   - Je stamrooster
   - De beschikbare lesmethoden
   - De volgorde van lessen (les 1, 2, 3, etc.)

### Weekplanning bekijken en aanpassen

De weekplanning toont een overzicht per dag:

**Functies:**
- ✅ **Afvinken**: Vink lessen af als ze gegeven zijn
- 🖱️ **Slepen**: Sleep lessen om de volgorde binnen een dag te wijzigen
- ❌ **Verwijderen**: Verwijder een les als deze niet gegeven gaat worden
- 📊 **Statistieken**: Zie totaal, backlog, voltooid onderaan

**Kleuren:**
- 🔵 **Blauw**: Normale les
- 🟠 **Oranje**: Backlog-les (gemist vorige week)
- 🟢 **Groen**: Voltooid

**Acties:**
- **Opslaan**: Bewaar wijzigingen
- **Weektaak**: Genereer weektaak voor leerlingen
- **Terug**: Terug naar dashboard

### Handmatig nieuwe week genereren

Als je vooruit wilt plannen zonder evaluatie:

1. Dashboard → **"Nieuwe week"**
2. Klik **"Genereren"**
3. Een nieuwe week wordt aangemaakt zonder backlog

## Evaluatie uitvoeren

De evaluatie is het hart van het systeem. Doe dit aan het einde van elke week!

### Start evaluatie

1. Dashboard → Klik **"Evalueer week"** bij de huidige week

### Stap 1: Welke lessen zijn voltooid?

**Doel:** Bepaal welke lessen wel en niet gegeven zijn.

**Werkwijze:**
- Standaard staan alle lessen aangevinkt (vanuit optimisme! 😊)
- Vink lessen uit die je **niet** hebt kunnen geven
- Niet-aangevinkte lessen gaan automatisch naar de backlog

**Voorbeeld:**
```
✅ Rekenen - Les 1: Tellen tot 20       → Gegeven, blijft af
❌ Rekenen - Les 2: Tellen tot 50       → Niet gegeven, gaat naar backlog
✅ Spelling - Les 1: Korte klanken      → Gegeven, blijft af
```

**Resultaat:**
- ✓ Voltooid: X lessen
- → Backlog: Y lessen

### Stap 2: Extra lessen gegeven?

**Doel:** Registreer lessen die wél gegeven zijn maar niet in het rooster stonden.

**Scenario's:**
- Je had tijd over en hebt extra lessen gegeven
- Je hebt een andere les gegeven dan gepland
- Je hebt sneller gewerkt dan verwacht

**Werkwijze:**
Per vak zie je de volgende lessen in volgorde:
```
Rekenen
  □ Les 3: Optellen tot 20
  □ Les 4: Aftrekken tot 20
  □ Les 5: Kolomsgewijs optellen

Spelling
  □ Les 2: Meervoud met -en
  □ Les 3: Verdubbelen
```

Vink aan wat je extra hebt gegeven.

**Resultaat:**
- ✓ X extra lessen toegevoegd aan voortgang

### Stap 3: Uitzonderingen volgende week?

**Doel:** Blokkeer tijden voor speciale activiteiten.

**Voorbeelden:**
- Schoolreis
- Toetsweek
- Sportdag
- Excursie
- Vergadering

**Uitzondering toevoegen:**
1. Kies de dag (bijv. Donderdag)
2. Kies tijden (bijv. 09:00 - 15:00)
3. Voer reden in (bijv. "Schoolreis naar Efteling")
4. Klik **"+ Uitzondering toevoegen"**

**Effect:**
De geblokkeerde uren worden **overgeslagen** in de volgende weekplanning.

### Evaluatie voltooien

Klik op **"Evaluatie voltooien en volgende week genereren"**

**Wat gebeurt er nu?**
1. Voortgang wordt bijgewerkt in alle lesmethoden
2. Volgende week wordt automatisch gegenereerd met:
   - 🔴 **Eerst:** Backlog-lessen (hoogste prioriteit)
   - 🔵 **Daarna:** Nieuwe lessen in volgorde
   - ⚠️ **Respect voor:** Uitzonderingen die je hebt ingevoerd

## Weektaak genereren

De weektaak is een printbare lijst voor leerlingen.

### Weektaak maken

1. Open een weekplanning
2. Klik op **"📋 Weektaak"**

### Wat staat er in?

De weektaak toont:

**Per vak:**
- Alle lessen van die week
- Met checkboxes voor leerlingen
- Dagen waarop de les gegeven wordt
- Markering als het een "inhaal-les" is

**Extra velden:**
- Naam leerling
- Datum
- Handtekening ouder/verzorger
- Handtekening leerkracht
- Opmerkingen

### PDF downloaden

Klik op **"📄 Download PDF"**

**PDF-formaat:**
- A4-formaat
- Print-vriendelijk
- Klaar om te printen en uit te delen

**Bestandsnaam:**
`Weektaak_Week3_Groep4.pdf`

## Veelgestelde vragen

### Algemeen

**Q: Kan ik de applicatie op meerdere apparaten gebruiken?**
A: De data wordt lokaal opgeslagen in je browser (localStorage). Om op meerdere apparaten te werken, gebruik je dezelfde browser op hetzelfde apparaat, of moet je de data handmatig exporteren/importeren (toekomstige feature).

**Q: Wat gebeurt er als ik op "Reset" klik?**
A: ALLE data wordt verwijderd en je start opnieuw met onboarding. Gebruik dit alleen voor testen!

**Q: Kan ik mijn eigen lesmethoden toevoegen?**
A: Momenteel werkt het systeem met vooraf ingeladen methoden (Wereld in Getallen, Staal, etc.). Het toevoegen van eigen methoden is een toekomstige feature.

### Stamrooster

**Q: Kan ik verschillende roosters voor verschillende dagen hebben?**
A: Ja! Elke dag kan compleet anders ingericht worden.

**Q: Wat is het verschil tussen wekelijks en tweewekelijks?**
A:
- **Wekelijks**: Elk week hetzelfde rooster
- **Tweewekelijks**: Week A en Week B wisselen elkaar af

**Q: Moet ik pauzes toevoegen aan het rooster?**
A: Dat mag, maar het is niet verplicht. Pauzes worden niet gebruikt voor het plannen van lessen.

### Weekplanning

**Q: Waarom zijn sommige lessen oranje?**
A: Oranje lessen zijn backlog-lessen die je vorige week niet hebt kunnen geven.

**Q: Kan ik handmatig lessen toevoegen?**
A: Momenteel niet direct. Je kunt wel in de evaluatie extra lessen registreren, of lessen verwijderen/herschikken.

**Q: Wat als ik een les twee keer per week wil geven?**
A: Het systeem plant automatisch op basis van beschikbare slots. Als je twee Rekenen-slots hebt op een dag, krijg je twee verschillende Rekenen-lessen.

### Evaluatie

**Q: Moet ik elke week evalueren?**
A: Voor de beste resultaten: ja! De backlog-functie werkt alleen als je evalueert. Maar je kunt ook gewoon een nieuwe week genereren zonder evaluatie.

**Q: Wat als ik een les overslaan wil?**
A: Vink de les uit in Stap 1 van de evaluatie. Deze gaat dan naar de backlog voor volgende week.

**Q: Kan ik een evaluatie ongedaan maken?**
A: Momenteel niet. Zorg dat je zeker bent voordat je de evaluatie voltooit.

**Q: Wat als ik een les in een andere volgorde wil geven?**
A: Het systeem volgt de vastgestelde volgorde in de lesmethode. Voor afwijkende volgorde kun je lessen verwijderen en handmatig via "extra lessen" toevoegen.

### Voortgang

**Q: Hoe zie ik waar ik ben in een lesmethode?**
A: Dashboard → "Voortgang per vak" toont je huidige positie en aantal voltooide lessen.

**Q: Kan ik terug naar eerdere lessen?**
A: Ja, in de evaluatie (Stap 2) kun je eerdere lessen selecteren als "extra gegeven".

**Q: Wat als ik van lesmethode wil wisselen?**
A: Dit is momenteel niet mogelijk. Je zou een nieuwe installatie moeten doen of wachten op toekomstige updates.

### Technisch

**Q: Werkt het offline?**
A: Ja! Alle functionaliteit werkt offline. Alleen de initiële setup vereist internet (voor het laden van de applicatie).

**Q: Hoe maak ik een backup?**
A: Ga in je browser naar Developer Tools → Application → Local Storage → kopieer de data. Dit is een handmatig proces voor gevorderde gebruikers.

**Q: Welke browsers worden ondersteund?**
A: Chrome, Firefox, Safari, Edge (moderne versies).

## Tips voor optimaal gebruik

### 🎯 Planning Tips

1. **Start simpel**: Begin met een basis stamrooster en verfijn later
2. **Wees realistisch**: Plan niet te veel lessen per dag
3. **Buffer tijd**: Laat ruimte voor onverwachte zaken
4. **Consistentie**: Evalueer elke week voor beste resultaten

### 📚 Curriculum Tips

1. **Volgorde respecteren**: Het systeem volgt de lesmethode-volgorde
2. **Flexibiliteit**: Gebruik "extra lessen" voor afwijkingen
3. **Backlog monitoren**: Houd backlog onder controle (max 3-5 lessen)
4. **Voortgang volgen**: Check regelmatig het dashboard

### 🎨 Weektaak Tips

1. **Personaliseer**: Voeg handmatig opmerkingen toe aan de PDF
2. **Print kwaliteit**: Gebruik kleurenprinter voor beste resultaat
3. **Voorbereiden**: Genereer weektaken op zondag voor maandag
4. **Communicatie**: Deel met ouders via schoolsysteem

### ⚡ Efficiëntie Tips

1. **Kopieer roosters**: Gebruik "Kopieer Week A naar Week B" feature
2. **Bulk updates**: Pas stamrooster aan tijdens vakanties
3. **Keyboard shortcuts**: Tab en Enter werken in veel formulieren
4. **Drag & drop**: Sleep lessen voor snelle herschikking

## Ondersteuning

Voor vragen, bugs of feature requests:
- GitHub Issues: [Link naar repository issues]
- Email: [support email indien beschikbaar]

---

**Veel succes met de Smart Weekly Planner!** 🎓📚✨
