import { useState } from "react";
import { ResumeUpload } from "../components/features/ResumeUpload";
import { SkillInput } from "../components/features/SkillInput";

export default function Dashboard() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">
            AI Job Intelligence Platform{" "}
            <span role="img" aria-label="rocket">
              🚀
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Upload your resume or add skills manually and let Elevate AI analyze your profile to tailor recommendations.
          </p>
        </section>

        <section className="space-y-8">
          {/* RESUME UPLOAD */}
          <ResumeUpload email={email} />

          {/* SKILL INPUT */}
          <SkillInput email={email} onEmailChange={setEmail} />
        </section>
      </main>
    </div>
  );
}