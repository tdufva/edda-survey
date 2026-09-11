import type { Metadata } from "next";
import { ArrowLeft, CircleAlert, Eye } from "lucide-react";
import Link from "next/link";

import survey from "../../analysis/survey.json";
const questions = survey.questions.map(q => q.title);
const respondents = survey.respondents;
const answerCount = respondents.reduce((n, r) => n + r.answers.filter(a => a.trim()).length, 0);

export const metadata: Metadata = {
  title: "All responses — EDDA Survey",
  description: "All 33 written answers to the EDDA internationalisation survey, grouped by anonymised respondent.",
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
          <Link href="/areas/">AREAS</Link><Link href="/dator/">Dator</Link><Link href="/comparison/">Comparison</Link><Link href="/sorting/">Sorting board</Link>
        </nav>
      </header>

      <section className="responses-hero">
        <div className="eyebrow"><Eye size={16} aria-hidden="true" />Source voices</div>
        <div className="responses-title-grid">
          <h1>Every answer, grouped by respondent.</h1>
          <div>
            <p>Eleven people answered all three open questions. Their words are shown verbatim and in the original order so the thematic analysis can be read alongside its source material.</p>
            <dl className="responses-facts">
              <div><dt>Respondents</dt><dd>{respondents.length}</dd></div>
              <div><dt>Answers</dt><dd>{answerCount}</dd></div>
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
