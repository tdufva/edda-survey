import {
  ArrowDown,
  ArrowUpRight,
  Asterisk,
  BookOpen,
  CircleAlert,
  Languages,
  Network,
  Scale,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type Theme = { name: string; count: number; interpretation: string };
type Question = {
  number: string;
  short: string;
  title: string;
  summary: string;
  themes: Theme[];
};

const responseCount = 7;

const questions: Question[] = [
  {
    number: "01",
    short: "Barriers",
    title:
      "What are the barriers to internationalisation in your institution, in your opinion?",
    summary:
      "The barriers are primarily infrastructural. International work competes with already full schedules, limited budgets, nationally organised curricula and local-language teaching. A smaller but important strand questions whose language and context internationalisation privileges.",
    themes: [
      {
        name: "Time, workload and stress",
        count: 4,
        interpretation:
          "International work is added to full schedules instead of being recognised in workload planning.",
      },
      {
        name: "Language, curriculum and structural fit",
        count: 4,
        interpretation:
          "National-language teaching, rigid curricula and narrow mobility windows make exchange difficult to integrate.",
      },
      {
        name: "Funding and financial priorities",
        count: 3,
        interpretation:
          "Travel, course development and staff time compete with domestic priorities and scarce resources.",
      },
      {
        name: "Motivation, curiosity and personal obligations",
        count: 2,
        interpretation:
          "Some students face family commitments or limited interest, while staff could do more to create meaningful invitations.",
      },
      {
        name: "Unequal or unclear terms of internationalisation",
        count: 2,
        interpretation:
          "The concept is not neutral: English can open exchange while also diminishing national and local contexts.",
      },
    ],
  },
  {
    number: "02",
    short: "Ideal",
    title: "What would internationalisation look like in an ideal situation?",
    summary:
      "The ideal is not an occasional trip. Respondents imagine internationalisation as a normal, reciprocal practice across teaching, research and institutional life—one that enables encounters while respecting different contexts, traditions and voices.",
    themes: [
      {
        name: "Embedded, regular and institution-wide",
        count: 3,
        interpretation:
          "Internationalisation belongs in everyday studies, teaching and research rather than in exceptional projects.",
      },
      {
        name: "Reciprocal mobility and face-to-face exchange",
        count: 3,
        interpretation:
          "Visits by students, teachers and researchers enable situated understanding that online contact alone cannot provide.",
      },
      {
        name: "Collaboration, co-development and shared learning",
        count: 3,
        interpretation:
          "Universities learn with one another by developing courses, sharing experience and comparing practices.",
      },
      {
        name: "Pluralism, context and respectful inclusion",
        count: 3,
        interpretation:
          "Academic freedom, many voices and attention to identity and local traditions are treated as conditions of success.",
      },
      {
        name: "Flexible, hybrid joint-course formats",
        count: 1,
        interpretation:
          "One concrete vision combines online study with intensive periods hosted by partner universities.",
      },
    ],
  },
  {
    number: "03",
    short: "Conditions",
    title: "How could we overcome these barriers, and what would it require?",
    summary:
      "The proposed remedies redistribute responsibility from individuals to institutions. Protected capacity, administrative support, durable partnerships and curriculum-level pilots would turn goodwill into a repeatable practice.",
    themes: [
      {
        name: "Protected time and human capacity",
        count: 3,
        interpretation:
          "Planning, meeting and administering international work need recognised hours and capable people.",
      },
      {
        name: "Leadership and administrative infrastructure",
        count: 3,
        interpretation:
          "Tools, contacts, coordination expertise and supportive leadership make participation possible.",
      },
      {
        name: "Partnerships and collegial networks",
        count: 3,
        interpretation:
          "Repeated meetings and close relationships with universities and schools create continuity and trust.",
      },
      {
        name: "Dedicated funding",
        count: 2,
        interpretation:
          "Funds are needed not only for travel but also for development work and time released from other duties.",
      },
      {
        name: "Curriculum integration and piloting",
        count: 2,
        interpretation:
          "Joint courses can be developed, tested and made part of curricula rather than left as optional extras.",
      },
    ],
  },
];

const principles = [
  ["Examine power", "We ask who receives time, funding, mobility and interpretive priority—and who performs the hidden work."],
  ["Challenge power", "The analysis shifts the burden from individual motivation toward institutional responsibility and shared resources."],
  ["Elevate emotion and embodiment", "Stress, obligation, identity, language and belonging are evidence, not noise around the data."],
  ["Rethink binaries and hierarchies", "International/local and online/in-person are treated as productive tensions, not simple opposites."],
  ["Embrace pluralism", "Overlapping themes remain visible; a response can hold several truths at once."],
  ["Consider context", "Seven situated accounts illuminate this EDDA conversation. They do not represent every institution."],
  ["Make labor visible", "The page documents the sample, denominator, coding choices and interpretive limits."],
];

const actions = [
  {
    icon: Asterisk,
    title: "Recognise the work",
    body: "Ring-fence time in workload plans and resource the coordination, relationship-building and course design that internationalisation requires.",
  },
  {
    icon: Network,
    title: "Pilot through partnership",
    body: "Co-develop one hybrid EDDA course with an intensive hosted period, then evaluate who could participate and who could not.",
  },
  {
    icon: Languages,
    title: "Design for language plurality",
    body: "Use English as a bridge without positioning it as the only legitimate academic voice; protect local concepts, contexts and languages.",
  },
  {
    icon: Scale,
    title: "Share access and power",
    body: "Track not only activity volume but whose mobility, time, care obligations and institutional position shape access to it.",
  },
];

function percentage(count: number) {
  return Math.round((count / responseCount) * 100);
}

function SevenUnitScale({ count }: { count: number }) {
  return (
    <>
      <span className="sr-only">{count} of {responseCount} responses</span>
      <div className="unit-scale" aria-hidden="true">
        {Array.from({ length: responseCount }, (_, index) => (
          <span key={index} className={index < count ? "is-active" : ""} />
        ))}
      </div>
    </>
  );
}

function ThemeList({ themes }: { themes: Theme[] }) {
  return (
    <div className="theme-list">
      {themes.map((theme) => (
        <article className="theme-row" key={theme.name}>
          <div className="theme-stat">
            <strong>{percentage(theme.count)}%</strong>
            <span>{theme.count}/{responseCount}</span>
          </div>
          <div className="theme-copy">
            <h3>{theme.name}</h3>
            <p>{theme.interpretation}</p>
            <SevenUnitScale count={theme.count} />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="EDDA survey, back to top">
          <span>EDDA</span><span>survey</span>
        </a>
        <nav aria-label="Page sections">
          <a href="#findings">Findings</a>
          <a href="#method">Method</a>
          <a href="#next">Next steps</a>
          <Link href="/responses/">All responses</Link>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><Sparkles aria-hidden="true" size={16} />Internationalisation, seen from within</div>
        <div className="hero-grid">
          <h1>Internationalisation needs <em>infrastructure</em>, not only enthusiasm.</h1>
          <div className="hero-intro">
            <p>Seven respondents describe a shared ambition: international work should become a natural part of education and research. Their accounts also show why it remains uneven—time, funding, language, curriculum and administrative labour determine who can take part.</p>
            <a className="down-link" href="#findings">Explore the findings <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="hero-facts" aria-label="Survey facts">
          <div><strong>7</strong><span>complete responses</span></div>
          <div><strong>3</strong><span>open questions</span></div>
          <div><strong>21</strong><span>written answers</span></div>
          <div><strong>14%</strong><span>one response in this sample</span></div>
        </div>
      </section>

      <section className="reading-note" aria-labelledby="reading-note-title">
        <CircleAlert aria-hidden="true" />
        <div>
          <h2 id="reading-note-title">Read percentages with their counts</h2>
          <p>Each question has seven answers, so one answer equals about 14%. Themes overlap and therefore do not add up to 100%. Percentages describe this small set of responses, not the whole EDDA network.</p>
        </div>
      </section>

      <section className="findings" id="findings">
        <div className="section-kicker">Question-by-question analysis</div>
        {questions.map((question) => (
          <section className="question" id={`question-${question.number}`} key={question.number}>
            <div>
              <div className="question-heading">
                <div className="question-number">Q{question.number}</div>
                <div><span>{question.short}</span><h2>{question.title}</h2></div>
              </div>
            </div>
            <div className="question-content">
              <p className="question-summary">{question.summary}</p>
              <ThemeList themes={question.themes} />
            </div>
          </section>
        ))}
      </section>

      <section className="synthesis" aria-labelledby="synthesis-title">
        <div className="synthesis-title">
          <span>Across all three questions</span>
          <h2 id="synthesis-title">What the responses make visible</h2>
        </div>
        <div className="synthesis-grid">
          <article><span>01</span><h3>Goodwill is not capacity</h3><p>Respondents largely imagine internationalisation positively. The recurring obstacle is that institutions rely on personal energy while time, money and coordination remain scarce.</p></article>
          <article><span>02</span><h3>“Natural” means structurally embedded</h3><p>Regular exchange becomes possible when it sits inside curricula, workload planning and research practice—not beside them as an optional extra.</p></article>
          <article><span>03</span><h3>Language is both bridge and power</h3><p>English can enable shared courses while giving some speakers and knowledge traditions interpretive priority. Internationalisation should widen plurality rather than flatten it.</p></article>
          <article><span>04</span><h3>Mobility is relational</h3><p>Travel matters, but the desired outcome is deeper: reciprocal understanding, sustained partnership and learning how one’s own context looks from elsewhere.</p></article>
        </div>
      </section>

      <section className="method" id="method" aria-labelledby="method-title">
        <div className="method-heading">
          <BookOpen aria-hidden="true" />
          <div><span>Data Feminism in practice</span><h2 id="method-title">A situated reading, not a neutral verdict</h2></div>
        </div>
        <div className="method-intro">
          <p>The analysis follows Catherine D’Ignazio and Lauren F. Klein’s seven principles of Data Feminism. Coding is interpretive: it organises patterns without claiming that the data “speak for themselves.”</p>
          <a href="https://data-feminism.mitpress.mit.edu/pub/frfa9szd/release/3" target="_blank" rel="noreferrer">Read the open-access introduction <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
        <ol className="principles">
          {principles.map(([title, body], index) => (
            <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></li>
          ))}
        </ol>
        <div className="method-notes">
          <div><h3>How themes were counted</h3><p>Each answer was read for explicit ideas and underlying conditions. A response could receive more than one theme. A theme’s percentage is the number of responses carrying it divided by seven, rounded to the nearest whole percent.</p></div>
          <div><h3>Limits and privacy</h3><p>The sample is small, self-selected and institutionally situated. Theme labels were produced in one analytic pass and have not been member-checked. Timestamps and raw answers are not reproduced to reduce the risk of re-identification.</p></div>
        </div>
      </section>

      <section className="next" id="next" aria-labelledby="next-title">
        <div>
          <span className="section-kicker">From insight to practice</span>
          <h2 id="next-title">Four directions for EDDA</h2>
          <p className="next-intro">These are prompts for collective deliberation, not prescriptions. The people doing the work should help decide what happens next.</p>
        </div>
        <div className="action-grid">
          {actions.map(({ icon: Icon, title, body }) => (
            <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>

      <footer>
        <div><span>EDDA survey</span><p>A reflexive thematic reading of seven responses on internationalisation.</p></div>
        <p>Percentages are always shown with counts. Updated September 2026.</p>
      </footer>
    </main>
  );
}
