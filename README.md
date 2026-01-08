# Smart Weekly Planner & Curriculum Tracker

Een intelligente weekplanner voor Nederlands basisonderwijs - gebouwd voor leerkrachten die hun tijd willen optimaliseren en hun leerlingen beter willen volgen door lesmethoden.

## 🎯 Wat is dit?

De Smart Weekly Planner is een webapplicatie die leerkrachten helpt om:

- **Automatisch weekplanningen te genereren** op basis van een stamrooster
- **Voortgang te volgen** door Nederlandse lesmethoden (Wereld in Getallen, Staal, etc.)
- **Gemiste lessen intelligent te beheren** via een backlog-systeem
- **Professionele weektaken te printen** voor leerlingen en ouders

## ✨ Kernfuncties

### 🔄 Intelligente Planning
- Automatische weekgeneratie op basis van stamrooster template
- Backlog-systeem: gemiste lessen komen automatisch terug
- A/B-weekondersteuning voor tweewekelijkse roosters
- Drag-and-drop voor handmatige aanpassingen

### 📚 Curriculum Engine
- Volledige tracking van lesmethoden
- Het systeem weet welke les volgt
- Ondersteunt meerdere vakken en methoden tegelijk
- Mock data voor Rekenen (Wereld in Getallen) en Spelling (Staal)

### 🎯 Evaluatie Workflow (De Unieke Logic!)
Aan het einde van elke week:
1. **Q1: Completion Check** - Welke lessen zijn gegeven?
2. **Q2: Extra Progress** - Heb je extra lessen gegeven?
3. **Q3: Next Week Exceptions** - Speciale activiteiten komende week?

### 📄 Export Functionaliteit
- Genereer printbare weektaken voor leerlingen
- PDF export met html2canvas + jsPDF
- A4-formaat, klaar om te printen

## 🚀 Snel starten

### Vereisten
- Node.js (v18 of hoger)
- npm of yarn

### Installatie

```bash
# Clone de repository
git clone https://github.com/OBKlaassen/skills-introduction-to-github.git
cd skills-introduction-to-github

# Installeer dependencies
npm install

# Start development server
npm run dev
```

De applicatie opent automatisch in je browser op `http://localhost:3000`

### Build voor productie

```bash
npm run build
npm run preview
```

## 📖 Gebruik

### Eerste keer opstarten

1. **Onboarding (3 stappen)**
   - Vul basisgegevens in (school, naam, groep)
   - Stel vakken en roostercyclus in
   - Bouw je stamrooster op

2. **Dashboard**
   - Genereer je eerste week
   - Bekijk voortgang per vak
   - Beheer wekelijkse planningen

3. **Weekplanning**
   - Pas lessen aan met drag-and-drop
   - Vink voltooide lessen af
   - Genereer weektaak voor leerlingen

4. **Evaluatie (elke week)**
   - Markeer voltooide/gemiste lessen
   - Registreer extra voortgang
   - Plan uitzonderingen voor volgende week
   - Systeem genereert automatisch volgende week met backlog

Voor gedetailleerde instructies, zie **[USER_GUIDE.md](./USER_GUIDE.md)**

## 🏗️ Architectuur

### Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **PDF Export**: jsPDF + html2canvas
- **Date handling**: date-fns
- **State**: Local state + localStorage

### Data Schema
Zie **[ARCHITECTURE.md](./ARCHITECTURE.md)** voor:
- Complete TypeScript interfaces
- Data flow diagrammen
- Core scheduling algorithm
- Design principles

### Project Structure
```
smart-weekly-planner/
├── src/
│   ├── components/          # React components
│   │   ├── Onboarding.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MasterScheduleEditor.jsx
│   │   ├── WeeklyScheduleView.jsx
│   │   ├── EvaluationWizard.jsx
│   │   └── WeektaakView.jsx
│   ├── logic/               # Business logic
│   │   └── scheduleEngine.js
│   ├── data/                # Mock curriculum data
│   │   └── mockCurriculum.json
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind styles
├── ARCHITECTURE.md          # Technical documentation
├── USER_GUIDE.md           # User documentation
└── package.json
```

## 🔑 Kernlogica: Schedule Generation Algorithm

```javascript
function generateNextWeekSchedule(
  masterSchedule,      // Template
  progressTracker,     // Current position in curriculum
  weeklyEvaluation,    // Previous week's feedback
  targetWeekNumber
) {
  // 1. Get available slots (exclude exceptions)
  // 2. Group slots by subject
  // 3. For each subject:
  //    a. PRIORITY: Fill with backlog lessons
  //    b. STANDARD: Fill remaining with next lessons in sequence
  // 4. Return complete weekly schedule
}
```

**Sleutelprincipes:**
- Backlog heeft altijd prioriteit
- Lessen volgen curriculum volgorde (sequenceOrder)
- Uitzonderingen blokkeren specifieke slots
- Handmatige override altijd mogelijk

## 📦 Dependencies

### Production
- `react` & `react-dom` - UI framework
- `@dnd-kit/*` - Drag and drop functionality
- `date-fns` - Date manipulation
- `jspdf` - PDF generation
- `html2canvas` - DOM to image conversion
- `uuid` - Unique ID generation

### Development
- `vite` - Build tool
- `tailwindcss` - Styling
- `eslint` - Linting

## 🎨 Features in Detail

### Stamrooster (Master Schedule)
- Flexibele tijdslots per dag
- Wekelijks of tweewekelijks (A/B weken)
- Pauzes markeren
- Volledig aanpasbaar

### Curriculum Tracking
Mock data geïmplementeerd voor:
- **Rekenen**: Wereld in Getallen (Groep 4)
  - 3 blokken, 17 lessen
  - Incrementele moeilijkheidsgraad
- **Spelling**: Staal (Groep 4)
  - 3 blokken, 17 lessen
  - Dictees en oefeningen

### Weektaak Generator
- Groepering per vak
- Checkbox voor leerlingen
- Backlog-indicatie
- Handtekening velden
- Opmerkingen sectie

## 🔮 Toekomstige Features

- [ ] Cloud sync (Firebase/Supabase)
- [ ] Meerdere groepen beheren
- [ ] Eigen lesmethoden toevoegen
- [ ] Export naar Excel
- [ ] Statistieken en rapporten
- [ ] Sharing tussen collega's
- [ ] Mobile app (React Native)
- [ ] Integratie met schoolsystemen

## 🤝 Bijdragen

Contributions zijn welkom! Voor grote wijzigingen:
1. Open eerst een issue om te bespreken wat je wilt wijzigen
2. Fork de repo
3. Create een feature branch (`git checkout -b feature/AmazingFeature`)
4. Commit je changes (`git commit -m 'Add some AmazingFeature'`)
5. Push naar de branch (`git push origin feature/AmazingFeature`)
6. Open een Pull Request

## 📝 License

Dit project is gelicenseerd onder de MIT License - zie [LICENSE](LICENSE) voor details.

## 🙏 Acknowledgments

- Ontwikkeld voor Nederlandse basisonderwijs leerkrachten
- Geïnspireerd door echte classroom challenges
- Gebouwd met moderne web technologieën

## 📧 Contact

Voor vragen of suggesties, open een issue op GitHub.

---

# Introduction to GitHub

_Get started using GitHub in less than an hour._

## Welcome

People use GitHub to build some of the most advanced technologies in the world. Whether you’re visualizing data or building a new game, there’s a whole community and set of tools on GitHub that can help you do it even better. GitHub Skills’ “Introduction to GitHub” exercise guides you through everything you need to start contributing in less than an hour.

- **Who is this for**: New developers, new GitHub users, and students.
- **What you'll learn**: We'll introduce repositories, branches, commits, and pull requests.
- **What you'll build**: We'll make a short Markdown file you can use as your [profile README](https://docs.github.com/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme).
- **Prerequisites**: None. This exercise is a great introduction for your first day on GitHub.
- **How long**: This exercise takes less than one hour to complete.

In this exercise, you will:

1. Create a branch
2. Commit a file
3. Open a pull request
4. Merge your pull request

### How to start this exercise

1. Right-click **Copy Exercise** and open the link in a new tab.

   <a id="copy-exercise">
      <img src="https://img.shields.io/badge/📠_Copy_Exercise-AAA" height="25pt"/>
   </a>

2. In the new tab, most of the prompts will automatically fill in for you.
   - For owner, choose your personal account or an organization to host the repository.
   - We recommend creating a public repository, as private repositories will [use Actions minutes](https://docs.github.chttps://github.com/OBKlaassen/skills-introduction-to-github/billing/managing-billing-for-github-actions/about-billing-for-github-actions).
   - Scroll down and click the **Create repository** button at the bottom of the form.

3. After your new repository is created, wait about 20 seconds for the exercise to be prepared and buttons updated. You will continue working from your copy of the exercise.
   - The **Copy Exercise** button will deactivate, changing to gray.
   - The **Start Exercise** button will activate, changing to green.
   - You will likely need to refresh the page.

4. Click **Start Exercise**. Follow the step-by-step instructions and feedback will be provided as you progress.

   <a id="start-exercise" href="https://github.com/OBKlaassen/skills-introduction-to-github/issues/1">
      <img src="https://img.shields.io/badge/🚀_Start_Exercise-008000" height="25pt"/>
   </a>

> [!IMPORTANT]
> The **Start Exercise** button will activate after copying the repository. You will probably need to refresh the page.

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)