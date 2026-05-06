import { useState } from "react";
import { ResumeUpload } from "../components/features/ResumeUpload";
import { SkillInput } from "../components/features/SkillInput";
import { ProfileEditor } from "../components/features/ProfileEditor";
import { useAuth } from "../auth/useAuth";

export default function Dashboard() {
  const { user, isAuthed, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [profileUpdated, setProfileUpdated] = useState(false);

  // Use authenticated user's email or fallback to manual input
  const userEmail = user?.email || email;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

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
            Complete your professional profile, upload your resume or add skills manually, and let Elevate AI analyze your profile to tailor domain-specific recommendations.
          </p>
          {isAuthed && user && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <p className="text-blue-200 text-sm">
                👋 Welcome back, <strong>{user.name || user.email}</strong>! 
                {user.is_demo && <span className="ml-2 text-xs bg-yellow-600 px-2 py-1 rounded">DEMO MODE</span>}
              </p>
            </div>
          )}
        </section>

        <section className="space-y-8">
          {/* PROFESSIONAL PROFILE - Show for authenticated users OR when email is provided */}
          {(isAuthed && userEmail) || (!isAuthed && userEmail) ? (
            <ProfileEditor 
              email={userEmail} 
              onProfileUpdate={() => setProfileUpdated(!profileUpdated)}
            />
          ) : (
            <div className="p-6 bg-slate-900 border border-slate-700 rounded-lg text-center">
              <h3 className="text-xl font-bold text-slate-50 mb-2">Complete Your Professional Profile</h3>
              <p className="text-slate-400 mb-4">
                Please log in to access your professional profile and get personalized career recommendations.
              </p>
              <p className="text-sm text-slate-500">
                Use the login options in the navigation or continue as a guest below.
              </p>
            </div>
          )}

          {/* RESUME UPLOAD */}
          <ResumeUpload email={userEmail} />

          {/* SKILL INPUT */}
          <SkillInput email={userEmail} onEmailChange={setEmail} />
        </section>
      </main>
    </div>
  );
}