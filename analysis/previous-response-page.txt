import type { Metadata } from "next";
import { ArrowLeft, CircleAlert, Eye } from "lucide-react";
import Link from "next/link";

const questions = [
  "What are the barriers to internationalisation in your institution, in your opinion?",
  "What would internationalisation look like in an ideal situation?",
  "How could we overcome these barriers, and what would it require?",
];

const respondents = [
  {
    id: "01",
    answers: [
      "The fact that there is no time allocated in our service planning is largely due to financial considerations. This prioritisation means that domestic issues take precedence.",
      "That internationalisation is a natural and straightforward part of students’ studies and of lecturers’ course responsibilities.",
      "To continue to meet, and to ensure that there is time within our studies and work commitments to plan such courses and meetings.",
    ],
  },
  {
    id: "02",
    answers: [
      "The workload, (finding the time) but also sometimes lack of funding for travels etc.",
      "Something that occur in both educational programs and research: preferably face-to-face exchange in order to gain a better understanding of other contexts and traditions",
      "Allocated funds and supporting structures (tools, contacts, etc), and funds that also can be used to give teachers/researchers time in their schedule",
    ],
  },
  {
    id: "03",
    answers: [
      "Language—as the teaching language in our institution is the national language.",
      "A number of elective courses that are co-developed by the participating universities and taught in English. These courses should be part online and part intensive, hosted by the universities responsible for each course.",
      "We could apply for the next round of funding to work on developing these courses and test them out.",
    ],
  },
  {
    id: "04",
    answers: [
      "Internationalisation is already happening at my institution. In most ways it is really good, it brings funding and a metaperspective to the activities and counteracts traditionality, but it also diminishes the Swedish context where English-speaking academics gets interpretation priority.",
      "There is probably no ideal situation, but in every situation an open academic freedom is the best with plurality for many voices, orientations and a tolerant and respectful working environment is the best to also achieve academic success. If internationalisation supports this, it is the best or creates an ideal situation.",
      "It requires leadership, collaboration, collegiality and an organisational and administrative structure that works for the development of the work and activities that should be in focus for the best of education and research.",
    ],
  },
  {
    id: "05",
    answers: [
      "Our teaching in teacher education in arts and crafts is in Norwegian except for one subject (15 ECTS) that can be taught in English. The whole programme is not very 'geared' towards international visits and exchanges. A number of students have family or other obligations at home or are not particularly interested. The teachers could also motivate them more, I guess.",
      "Knowledge of nordic programmes in universities and schools. Visits from abroad both of teachers and students",
      "Close partnerships with other institutions (and Schools) might be a possibility",
    ],
  },
  {
    id: "06",
    answers: [
      "It depends on what is meant by internationalisation and the context in which it is considered. In general, the main barriers are funding and time. Lack of engagement is less often an issue.",
      "Collaborative learning, sharing experiences, inspiration from effective practices and approaches, and, in the best of worlds, learning about the world and one’s own identity within it.",
      "The necessary conditions. There need to be individuals who have the knowledge and capacity to handle the administrative work involved in exchanges and internationalisation in its various forms. I am convinced that the willingness and commitment are there, at least in the relationship between Finland and Sweden.",
    ],
  },
  {
    id: "07",
    answers: [
      "My colleagues keep saying they have no time. When it comes to the students, we offer very few opportunities/\"open windows\" when they can choose exchange studies. But basically - everyone, students and staff, are too stressed. Also, maybe, lack of curiosity. And the fact that teacher education is so rigidly connected to national curricula makes teachers and students think it is of \"no use\" to visit and learn from other countries.",
      "It should be present on every level: student exchange, teachers visiting and learning from each other, and researchers visiting and collaborating. That is, very much as it is formulated already... But it should come more \"naturally\" and regularly.",
      "Maybe make it mandatory, or part of our curricula, to get to know how other countries arrange their visual art teacher education. \"Know thy neighbour\"",
    ],
  },
];

export const metadata: Metadata = {
  title: "All responses — EDDA Survey",
  description: "All 21 written answers to the EDDA internationalisation survey, grouped by anonymised respondent.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "All responses — EDDA Survey",
    description: "All written survey answers, grouped by anonymised respondent.",
    images: [],
  },
  twitter: {
    title: "All responses — EDDA Survey",
    description: "All written survey answers, grouped by anonymised respondent.",
    images: [],
  },
};

export default function ResponsesPage() {
  return (
    <main className="responses-page">
      <header className="site-header responses-header">
        <Link className="brand" href="/" aria-label="EDDA survey, back to analysis">
          <span>EDDA</span><span>survey</span>
        </Link>
        <nav aria-label="Response page navigation">
          <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Analysis</Link>
          <a href="#respondent-01">Start reading</a>
        </nav>
      </header>

      <section className="responses-hero">
        <div className="eyebrow"><Eye size={16} aria-hidden="true" />Source voices</div>
        <div className="responses-title-grid">
          <h1>Every answer, grouped by respondent.</h1>
          <div>
            <p>Seven people answered all three open questions. Their words are shown verbatim and in the original order so the thematic analysis can be read alongside its source material.</p>
            <dl className="responses-facts">
              <div><dt>Respondents</dt><dd>7</dd></div>
              <div><dt>Answers</dt><dd>21</dd></div>
              <div><dt>Edited</dt><dd>No</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <aside className="response-caveat" aria-labelledby="response-caveat-title">
        <CircleAlert aria-hidden="true" />
        <div>
          <h2 id="response-caveat-title">A note on privacy and context</h2>
          <p>Names and timestamps were not collected on this page, and respondents are identified only by number. Because the sample is small and some answers describe national or institutional contexts, complete anonymity cannot be guaranteed. Please read and share with care.</p>
        </div>
      </aside>

      <nav className="respondent-index" aria-label="Jump to respondent">
        <span>Jump to</span>
        {respondents.map((respondent) => (
          <a key={respondent.id} href={`#respondent-${respondent.id}`}>{respondent.id}</a>
        ))}
      </nav>

      <section className="responses-list" aria-label="All survey responses">
        {respondents.map((respondent) => (
          <article className="respondent-card" id={`respondent-${respondent.id}`} key={respondent.id}>
            <header>
              <span>Respondent</span>
              <h2>{respondent.id}</h2>
              <p>3 of 3 questions answered</p>
            </header>
            <div className="respondent-answers">
              {respondent.answers.map((answer, index) => (
                <section className="answer" key={questions[index]}>
                  <div className="answer-label">Q{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <h3>{questions[index]}</h3>
                    <p>{answer}</p>
                  </div>
                </section>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer>
        <div><span>EDDA survey</span><p>All answers are presented verbatim; theme labels and interpretation remain on the analysis page.</p></div>
        <Link className="footer-link" href="/">Return to the analysis <ArrowLeft size={15} aria-hidden="true" /></Link>
      </footer>
    </main>
  );
}
