import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, ChevronLeft, Upload, Plus, X, Star, Sparkles, Rocket, User, GraduationCap, Code2, Target, FileText } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Project {
  name: string;
  tech: string;
  about: string;
  link: string;
}

interface Certification {
  name: string;
}

export interface CometProfile {
  // Step 1
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  // Step 2
  college: string;
  degree: string;
  graduation: string;
  cgpa: string;
  backlogs: "none" | "active";
  status: "final-year" | "graduate" | "employed";
  // Step 3
  skills: string[];
  experienceLevel: "fresher" | "0-1" | "1-2" | "2+";
  // Step 4
  targetRoles: string[];
  preferredLocations: string[];
  salaryService: string;
  salaryProduct: string;
  noticePeriod: "immediate" | "15" | "30";
  relocate: boolean;
  targetCompanies: string;
  // Step 5
  resumeFileName: string;
  projects: Project[];
  certifications: Certification[];
  summary: string;
}

// ─── Default Profile (Chandu's data) ─────────────────────────────────────────
const DEFAULT_PROFILE: CometProfile = {
  name: "Gujjala Ganga Chandu",
  email: "gujjalagangachandu96@gmail.com",
  phone: "+91-9391072824",
  location: "Madurai, Tamil Nadu",
  linkedin: "linkedin.com/in/gangachandu",
  github: "github.com/Chandu917",
  portfolio: "",
  college: "Kalasalingam Academy of Research and Education",
  degree: "B.Tech Computer Science Engineering",
  graduation: "2026",
  cgpa: "",
  backlogs: "none",
  status: "final-year",
  skills: ["React", "JavaScript", "Python", "Java", "Next.js", "HTML/CSS", "MySQL", "Cybersecurity", "IoT", "Data Analytics", "Tableau", "Oracle Cloud", "Git", "GitHub", "Vercel"],
  experienceLevel: "fresher",
  targetRoles: ["React Developer", "Full Stack Developer", "Software Engineer", "Python Developer", "Cybersecurity Analyst", "Associate Software Engineer", "Graduate Engineer Trainee"],
  preferredLocations: ["Chennai", "Bangalore", "Remote", "Anywhere in India"],
  salaryService: "4-6 LPA",
  salaryProduct: "6-10 LPA",
  noticePeriod: "immediate",
  relocate: true,
  targetCompanies: "Zoho, Freshworks, LTIMindtree, Oracle, Deloitte, Capgemini",
  resumeFileName: "",
  projects: [
    { name: "HireSight AI", tech: "Python, React", about: "Analyzed 10,000+ resumes with AI", link: "" },
    { name: "SurakshaAI", tech: "JavaScript, React", about: "500+ phishing URLs scanned", link: "" },
  ],
  certifications: [
    { name: "Oracle Cloud Data Science 2024" },
    { name: "Deloitte Analytics Simulation 2025" },
    { name: "OWASP KARE Cyber Threat Hunt 2024" },
    { name: "VASHISHT Hackathon 5th Place 2023" },
  ],
  summary: "Software engineer skilled in Java, Python, JavaScript with AI and cybersecurity experience. Built HireSight AI analyzing 10,000+ resumes and SurakshaAI scanning 500+ phishing URLs. Oracle Cloud certified, 2026 batch fresher targeting full stack and cybersecurity roles.",
};

// ─── Skill Options ────────────────────────────────────────────────────────────
const PRIMARY_SKILLS = ["React", "JavaScript", "Python", "Java", "Node.js", "TypeScript", "Next.js", "HTML/CSS", "MySQL", "MongoDB", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Git", "GitHub", "Vercel"];
const SPECIAL_SKILLS = ["Cybersecurity", "IoT", "Machine Learning", "AI/ML", "Data Analytics", "Tableau", "Oracle Cloud", "Azure", "GCP"];
const ALL_ROLES = ["React Developer", "Full Stack Developer", "Software Engineer", "Python Developer", "Cybersecurity Analyst", "Associate Software Engineer", "Graduate Engineer Trainee"];
const ALL_LOCATIONS = ["Chennai", "Bangalore", "Hyderabad", "Mumbai", "Pune", "Remote", "Anywhere in India"];

// ─── Shared Input Component ───────────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium tracking-wide" style={{ color: "#94a3b8" }}>{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
    style={{
      background: "#12121a",
      border: "1px solid #1e1e2e",
      color: "#e2e8f0",
    }}
    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.2)"; }}
    onBlur={e => { e.target.style.borderColor = "#1e1e2e"; e.target.style.boxShadow = "none"; }}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all duration-200 resize-none"
    style={{
      background: "#12121a",
      border: "1px solid #1e1e2e",
      color: "#e2e8f0",
    }}
    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.2)"; }}
    onBlur={e => { e.target.style.borderColor = "#1e1e2e"; e.target.style.boxShadow = "none"; }}
  />
);

// ─── Radio Group ─────────────────────────────────────────────────────────────
const RadioOption = ({ label, value, selected, onChange }: {
  label: string; value: string; selected: boolean; onChange: (v: string) => void;
}) => (
  <button
    onClick={() => onChange(value)}
    className="flex items-center gap-2.5 text-sm transition-colors duration-150"
    style={{ color: selected ? "#e2e8f0" : "#64748b" }}
  >
    <div
      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
      style={{
        borderColor: selected ? "#6366f1" : "#374151",
        background: selected ? "#6366f1" : "transparent",
      }}
    >
      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
    {label}
  </button>
);

// ─── Skill Chip ───────────────────────────────────────────────────────────────
const SkillChip = ({ label, selected, onToggle }: {
  label: string; selected: boolean; onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none"
    style={{
      background: selected ? "rgba(99,102,241,0.2)" : "#12121a",
      border: `1px solid ${selected ? "#6366f1" : "#1e1e2e"}`,
      color: selected ? "#a5b4fc" : "#64748b",
      transform: selected ? "scale(1.05)" : "scale(1)",
    }}
  >
    {selected && <span className="mr-1">✓</span>}
    {label}
  </button>
);

// ─── Step Header ─────────────────────────────────────────────────────────────
const StepHeader = ({ icon: Icon, title, subtitle }: {
  icon: React.ElementType; title: string; subtitle: string;
}) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.15)" }}>
        <Icon size={18} style={{ color: "#6366f1" }} />
      </div>
      <h2 className="text-lg font-semibold" style={{ color: "#e2e8f0" }}>{title}</h2>
    </div>
    <p className="text-sm ml-12" style={{ color: "#64748b" }}>"{subtitle}"</p>
  </div>
);

// ─── Nav Buttons ─────────────────────────────────────────────────────────────
const NavButtons = ({ step, totalSteps, onBack, onNext, nextLabel }: {
  step: number; totalSteps: number; onBack: () => void; onNext: () => void; nextLabel?: string;
}) => (
  <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid #1e1e2e" }}>
    {step > 1 ? (
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
        style={{ background: "#12121a", border: "1px solid #1e1e2e", color: "#94a3b8" }}
      >
        <ChevronLeft size={16} /> Back
      </button>
    ) : <div />}
    <button
      onClick={onNext}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
      style={{ background: "linear-gradient(135deg, #6366f1, #4f52d4)", color: "#fff", boxShadow: "0 4px 15px rgba(99,102,241,0.4)" }}
    >
      {nextLabel || "Next"} <ChevronRight size={16} />
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProfileSetup({ onComplete }: { onComplete?: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);
  const [done, setDone] = useState(false);
  const [profile, setProfile] = useState<CometProfile>(DEFAULT_PROFILE);
  const [customSkill, setCustomSkill] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const TOTAL_STEPS = 5;

  const update = useCallback(<K extends keyof CometProfile>(key: K, value: CometProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  }, []);

  const goTo = (next: number) => {
    if (isAnimating) return;
    setSlideDir(next > step ? "right" : "left");
    setIsAnimating(true);
    setTimeout(() => {
      setStep(next);
      setIsAnimating(false);
    }, 280);
  };

  const toggleSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleRole = (role: string) => {
    setProfile(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role],
    }));
  };

  const toggleLocation = (loc: string) => {
    setProfile(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.includes(loc)
        ? prev.preferredLocations.filter(l => l !== loc)
        : [...prev.preferredLocations, loc],
    }));
  };

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !profile.skills.includes(s)) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, s] }));
      setCustomSkill("");
    }
  };

  const updateProject = (i: number, field: keyof Project, val: string) => {
    const updated = [...profile.projects];
    updated[i] = { ...updated[i], [field]: val };
    update("projects", updated);
  };

  const addProject = () => update("projects", [...profile.projects, { name: "", tech: "", about: "", link: "" }]);
  const removeProject = (i: number) => update("projects", profile.projects.filter((_, idx) => idx !== i));

  const updateCert = (i: number, val: string) => {
    const updated = [...profile.certifications];
    updated[i] = { name: val };
    update("certifications", updated);
  };

  const addCert = () => update("certifications", [...profile.certifications, { name: "" }]);
  const removeCert = (i: number) => update("certifications", profile.certifications.filter((_, idx) => idx !== i));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) update("resumeFileName", file.name);
  };

  const handleComplete = () => {
    localStorage.setItem("cometProfile", JSON.stringify(profile));
    setDone(true);
    setTimeout(() => {
      if (onComplete) onComplete();
      else navigate("/");
    }, 4000);
  };

  // ─── Completion Screen ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#0a0a0f" }}
      >
        <div className="text-center max-w-md w-full animate-[fadeInUp_0.6s_ease-out]">
          {/* Star burst */}
          <div className="relative inline-block mb-6">
            <div className="text-5xl animate-[pulse_1s_ease-in-out_3]">🌟</div>
            <div className="absolute -top-2 -right-2 text-lg animate-[spin_2s_linear_1]">✨</div>
            <div className="absolute -bottom-2 -left-2 text-sm animate-[spin_2.5s_linear_1]">⭐</div>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: "#e2e8f0" }}>
            Comet is ready, Chandu!
          </h1>
          <p className="text-sm mb-8" style={{ color: "#64748b" }}>
            I know everything about you now.
          </p>

          {/* Checklist */}
          <div className="rounded-2xl p-6 mb-6 text-left space-y-3" style={{ background: "#12121a", border: "1px solid #1e1e2e" }}>
            {[
              "Profile complete",
              profile.resumeFileName ? "Resume uploaded" : "Profile saved",
              "Skills mapped",
              "Job preferences saved",
              "AI brain trained",
            ].map((item, i) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm animate-[fadeInUp_0.4s_ease-out]"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both", color: "#94a3b8" }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.2)" }}>
                  <Check size={12} style={{ color: "#6366f1" }} />
                </div>
                {item}
              </div>
            ))}
          </div>

          {/* Match profile tags */}
          <div className="rounded-2xl p-5 mb-8" style={{ background: "#12121a", border: "1px solid #1e1e2e" }}>
            <p className="text-xs font-medium mb-3 tracking-wider" style={{ color: "#64748b" }}>YOUR MATCH PROFILE</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["React", "Python", "Java", "Cybersecurity", "Full Stack", "2026 Batch", "Fresher", "Open to relocate"].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => { if (onComplete) onComplete(); else navigate("/"); }}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold mx-auto transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366f1, #4f52d4)", color: "#fff", boxShadow: "0 8px 30px rgba(99,102,241,0.5)" }}
          >
            <Rocket size={18} /> Start Finding Jobs
          </button>
        </div>
      </div>
    );
  }

  // ─── Progress Header ────────────────────────────────────────────────────────
  const stepLabels = ["Personal", "Education", "Skills", "Preferences", "Resume"];
  const stepIcons = [User, GraduationCap, Code2, Target, FileText];

  const animStyle: React.CSSProperties = {
    transform: isAnimating ? `translateX(${slideDir === "right" ? "40px" : "-40px"})` : "translateX(0)",
    opacity: isAnimating ? 0 : 1,
    transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.28s ease",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0f" }}>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #1e1e2e" }}>
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: "#6366f1" }} />
          <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Comet Setup</span>
        </div>
        <span className="text-xs" style={{ color: "#64748b" }}>Step {step} of {TOTAL_STEPS}</span>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-6 pt-5 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          {stepLabels.map((label, i) => {
            const Icon = stepIcons[i];
            const n = i + 1;
            const isActive = n === step;
            const isDone = n < step;
            return (
              <div key={label} className="flex items-center" style={{ flex: n < TOTAL_STEPS ? "1" : "0" }}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isDone ? "#6366f1" : isActive ? "rgba(99,102,241,0.2)" : "#12121a",
                      border: `2px solid ${isDone || isActive ? "#6366f1" : "#1e1e2e"}`,
                    }}
                  >
                    {isDone
                      ? <Check size={14} style={{ color: "#fff" }} />
                      : <Icon size={14} style={{ color: isActive ? "#6366f1" : "#374151" }} />
                    }
                  </div>
                  <span className="text-[10px] hidden sm:block" style={{ color: isActive ? "#6366f1" : isDone ? "#a5b4fc" : "#374151" }}>
                    {label}
                  </span>
                </div>
                {n < TOTAL_STEPS && (
                  <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden" style={{ background: "#1e1e2e" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: isDone ? "100%" : "0%", background: "#6366f1" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Thin line progress */}
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "#1e1e2e" }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%`, background: "linear-gradient(90deg, #6366f1, #818cf8)" }}
          />
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4">
        <div className="max-w-lg mx-auto" style={animStyle}>

          {/* ══ STEP 1: Personal Info ══ */}
          {step === 1 && (
            <div>
              <StepHeader icon={User} title="Tell Comet about yourself" subtitle="So I can represent you perfectly" />
              <div className="space-y-4">
                <Field label="Full Name">
                  <Input value={profile.name} onChange={v => update("name", v)} placeholder="Your full name" />
                </Field>
                <Field label="Email">
                  <Input value={profile.email} onChange={v => update("email", v)} placeholder="you@email.com" type="email" />
                </Field>
                <Field label="Phone">
                  <Input value={profile.phone} onChange={v => update("phone", v)} placeholder="+91-XXXXXXXXXX" />
                </Field>
                <Field label="Location">
                  <Input value={profile.location} onChange={v => update("location", v)} placeholder="City, State" />
                </Field>
                <Field label="LinkedIn URL">
                  <Input value={profile.linkedin} onChange={v => update("linkedin", v)} placeholder="linkedin.com/in/yourprofile" />
                </Field>
                <Field label="GitHub URL">
                  <Input value={profile.github} onChange={v => update("github", v)} placeholder="github.com/yourusername" />
                </Field>
                <Field label="Portfolio URL (optional)">
                  <Input value={profile.portfolio} onChange={v => update("portfolio", v)} placeholder="yourportfolio.com" />
                </Field>
              </div>
              <NavButtons step={step} totalSteps={TOTAL_STEPS} onBack={() => goTo(step - 1)} onNext={() => goTo(2)} />
            </div>
          )}

          {/* ══ STEP 2: Education ══ */}
          {step === 2 && (
            <div>
              <StepHeader icon={GraduationCap} title="Your Education" subtitle="So I can apply to right batches" />
              <div className="space-y-4">
                <Field label="College / University">
                  <Input value={profile.college} onChange={v => update("college", v)} placeholder="Your institution" />
                </Field>
                <Field label="Degree">
                  <Input value={profile.degree} onChange={v => update("degree", v)} placeholder="B.Tech Computer Science" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Graduation Year">
                    <div className="relative">
                      <Input value={profile.graduation} onChange={v => update("graduation", v)} placeholder="2026" />
                      {profile.graduation === "2026" && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                          2026 ✦
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="CGPA (optional)">
                    <Input value={profile.cgpa} onChange={v => update("cgpa", v)} placeholder="8.5" />
                  </Field>
                </div>

                <Field label="Backlogs?">
                  <div className="flex gap-4 mt-1">
                    <RadioOption label="No backlogs" value="none" selected={profile.backlogs === "none"} onChange={v => update("backlogs", v as "none" | "active")} />
                    <RadioOption label="Active backlogs" value="active" selected={profile.backlogs === "active"} onChange={v => update("backlogs", v as "none" | "active")} />
                  </div>
                </Field>

                <Field label="Current Status">
                  <div className="space-y-2 mt-1">
                    <RadioOption label="Final Year Student" value="final-year" selected={profile.status === "final-year"} onChange={v => update("status", v as CometProfile["status"])} />
                    <RadioOption label="Recent Graduate" value="graduate" selected={profile.status === "graduate"} onChange={v => update("status", v as CometProfile["status"])} />
                    <RadioOption label="Currently Employed" value="employed" selected={profile.status === "employed"} onChange={v => update("status", v as CometProfile["status"])} />
                  </div>
                </Field>
              </div>
              <NavButtons step={step} totalSteps={TOTAL_STEPS} onBack={() => goTo(1)} onNext={() => goTo(3)} />
            </div>
          )}

          {/* ══ STEP 3: Skills ══ */}
          {step === 3 && (
            <div>
              <StepHeader icon={Code2} title="Your Skills" subtitle="So I can match you to right jobs" />
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold tracking-wider mb-2" style={{ color: "#64748b" }}>PRIMARY SKILLS</p>
                  <div className="flex flex-wrap gap-2">
                    {PRIMARY_SKILLS.map(s => (
                      <SkillChip key={s} label={s} selected={profile.skills.includes(s)} onToggle={() => toggleSkill(s)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wider mb-2" style={{ color: "#64748b" }}>SPECIAL SKILLS</p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIAL_SKILLS.map(s => (
                      <SkillChip key={s} label={s} selected={profile.skills.includes(s)} onToggle={() => toggleSkill(s)} />
                    ))}
                  </div>
                </div>

                <Field label="Add custom skill">
                  <div className="flex gap-2">
                    <input
                      value={customSkill}
                      onChange={e => setCustomSkill(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addCustomSkill()}
                      placeholder="e.g. Rust, Figma..."
                      className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: "#12121a", border: "1px solid #1e1e2e", color: "#e2e8f0" }}
                    />
                    <button
                      onClick={addCustomSkill}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-all duration-200 hover:scale-105"
                      style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </Field>

                <Field label="Experience Level">
                  <div className="space-y-2 mt-1">
                    {[
                      { label: "Fresher (0 years)", value: "fresher" },
                      { label: "0–1 year", value: "0-1" },
                      { label: "1–2 years", value: "1-2" },
                      { label: "2+ years", value: "2+" },
                    ].map(o => (
                      <RadioOption key={o.value} label={o.label} value={o.value} selected={profile.experienceLevel === o.value} onChange={v => update("experienceLevel", v as CometProfile["experienceLevel"])} />
                    ))}
                  </div>
                </Field>
              </div>
              <NavButtons step={step} totalSteps={TOTAL_STEPS} onBack={() => goTo(2)} onNext={() => goTo(4)} />
            </div>
          )}

          {/* ══ STEP 4: Job Preferences ══ */}
          {step === 4 && (
            <div>
              <StepHeader icon={Target} title="What jobs do you want?" subtitle="So I can find perfect matches" />
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold tracking-wider mb-2" style={{ color: "#64748b" }}>TARGET ROLES</p>
                  <div className="space-y-1.5">
                    {ALL_ROLES.map(r => (
                      <button
                        key={r}
                        onClick={() => toggleRole(r)}
                        className="flex items-center gap-2.5 text-sm w-full transition-colors duration-150"
                        style={{ color: profile.targetRoles.includes(r) ? "#e2e8f0" : "#64748b" }}
                      >
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{ background: profile.targetRoles.includes(r) ? "#6366f1" : "transparent", border: `1.5px solid ${profile.targetRoles.includes(r) ? "#6366f1" : "#374151"}` }}
                        >
                          {profile.targetRoles.includes(r) && <Check size={10} color="#fff" />}
                        </div>
                        {r}
                      </button>
                    ))}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-4 h-4 rounded flex-shrink-0" style={{ border: "1.5px solid #374151" }} />
                      <input placeholder="Other: custom role" className="text-sm bg-transparent outline-none flex-1" style={{ color: "#64748b" }} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wider mb-2" style={{ color: "#64748b" }}>PREFERRED LOCATIONS</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_LOCATIONS.map(l => (
                      <SkillChip key={l} label={l} selected={profile.preferredLocations.includes(l)} onToggle={() => toggleLocation(l)} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Service companies salary">
                    <Input value={profile.salaryService} onChange={v => update("salaryService", v)} placeholder="4-6 LPA" />
                  </Field>
                  <Field label="Product companies salary">
                    <Input value={profile.salaryProduct} onChange={v => update("salaryProduct", v)} placeholder="6-10 LPA" />
                  </Field>
                </div>

                <Field label="Notice Period">
                  <div className="flex gap-4 mt-1 flex-wrap">
                    <RadioOption label="Immediate" value="immediate" selected={profile.noticePeriod === "immediate"} onChange={v => update("noticePeriod", v as CometProfile["noticePeriod"])} />
                    <RadioOption label="15 days" value="15" selected={profile.noticePeriod === "15"} onChange={v => update("noticePeriod", v as CometProfile["noticePeriod"])} />
                    <RadioOption label="30 days" value="30" selected={profile.noticePeriod === "30"} onChange={v => update("noticePeriod", v as CometProfile["noticePeriod"])} />
                  </div>
                </Field>

                <Field label="Willing to relocate?">
                  <div className="flex gap-4 mt-1">
                    <RadioOption label="Yes" value="yes" selected={profile.relocate} onChange={() => update("relocate", true)} />
                    <RadioOption label="No" value="no" selected={!profile.relocate} onChange={() => update("relocate", false)} />
                  </div>
                </Field>

                <Field label="Target Companies (optional)">
                  <Input value={profile.targetCompanies} onChange={v => update("targetCompanies", v)} placeholder="Zoho, Freshworks, TCS..." />
                </Field>
              </div>
              <NavButtons step={step} totalSteps={TOTAL_STEPS} onBack={() => goTo(3)} onNext={() => goTo(5)} />
            </div>
          )}

          {/* ══ STEP 5: Resume & Projects ══ */}
          {step === 5 && (
            <div>
              <StepHeader icon={FileText} title="Your Resume & Projects" subtitle="So I can write perfect answers" />
              <div className="space-y-5">
                {/* Upload */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Upload Resume (PDF)</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all duration-200"
                    style={{
                      borderColor: profile.resumeFileName ? "#6366f1" : "#1e1e2e",
                      background: profile.resumeFileName ? "rgba(99,102,241,0.05)" : "#12121a",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#6366f1")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = profile.resumeFileName ? "#6366f1" : "#1e1e2e")}
                  >
                    {profile.resumeFileName ? (
                      <>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
                          <FileText size={20} style={{ color: "#6366f1" }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#a5b4fc" }}>{profile.resumeFileName} ✅</span>
                        <span className="text-xs" style={{ color: "#64748b" }}>Click to replace</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} style={{ color: "#374151" }} />
                        <span className="text-sm" style={{ color: "#64748b" }}>Drop PDF here or click to upload</span>
                        <span className="text-xs" style={{ color: "#374151" }}>Max 20MB</span>
                      </>
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                </div>

                {/* Projects */}
                <div>
                  <p className="text-xs font-semibold tracking-wider mb-3" style={{ color: "#64748b" }}>PROJECTS</p>
                  <div className="space-y-4">
                    {profile.projects.map((proj, i) => (
                      <div key={i} className="p-4 rounded-xl relative" style={{ background: "#12121a", border: "1px solid #1e1e2e" }}>
                        <button onClick={() => removeProject(i)} className="absolute top-3 right-3 p-1 rounded opacity-50 hover:opacity-100 transition-opacity" style={{ color: "#64748b" }}>
                          <X size={14} />
                        </button>
                        <p className="text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Project {i + 1}</p>
                        <div className="space-y-2">
                          <Input value={proj.name} onChange={v => updateProject(i, "name", v)} placeholder="Project name" />
                          <Input value={proj.tech} onChange={v => updateProject(i, "tech", v)} placeholder="Tech stack (Python, React...)" />
                          <Input value={proj.about} onChange={v => updateProject(i, "about", v)} placeholder="One-line description" />
                          <Input value={proj.link} onChange={v => updateProject(i, "link", v)} placeholder="Live demo URL (optional)" />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addProject}
                      className="w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
                      style={{ background: "#12121a", border: "1px dashed #374151", color: "#64748b" }}
                    >
                      <Plus size={14} /> Add Project
                    </button>
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <p className="text-xs font-semibold tracking-wider mb-3" style={{ color: "#64748b" }}>CERTIFICATIONS</p>
                  <div className="space-y-2">
                    {profile.certifications.map((cert, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={cert.name}
                          onChange={e => updateCert(i, e.target.value)}
                          placeholder="Certification name"
                          className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: "#12121a", border: "1px solid #1e1e2e", color: "#e2e8f0" }}
                        />
                        <button onClick={() => removeCert(i)} className="px-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity" style={{ color: "#64748b" }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addCert}
                      className="w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all duration-200"
                      style={{ background: "#12121a", border: "1px dashed #374151", color: "#64748b" }}
                    >
                      <Plus size={14} /> Add Certification
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <Field label="Professional Summary (AI will use this)">
                  <Textarea value={profile.summary} onChange={v => update("summary", v)} placeholder="Brief summary of your skills and goals..." rows={4} />
                </Field>
              </div>

              {/* Final button */}
              <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid #1e1e2e" }}>
                <button
                  onClick={() => goTo(4)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{ background: "#12121a", border: "1px solid #1e1e2e", color: "#94a3b8" }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f52d4)", color: "#fff", boxShadow: "0 6px 25px rgba(99,102,241,0.5)" }}
                >
                  <Rocket size={16} /> Complete Setup
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
