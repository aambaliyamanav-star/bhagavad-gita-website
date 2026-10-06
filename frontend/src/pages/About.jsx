import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Volume2,
  Brain,
  Compass,
  Trophy,
  Flame,
  Sparkles,
  Heart,
  Clock,
  Sun,
  Star,
  ShieldCheck,
  Zap,
  Smartphone,
  EyeOff,
  ChevronRight,
  ArrowRight,
  Flower2,
  CheckCircle2,
  Award,
  HelpCircle,
  MessageSquare,
  Users,
} from "lucide-react";
import "./About.css";

function About() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [animatedStats, setAnimatedStats] = useState({
    chapters: 0,
    shlokas: 0,
    features: 0,
    guaranteed: 0,
  });

  // Animated Numbers counter on mount
  useEffect(() => {
    let step = 0;
    const totalSteps = 40;
    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      setAnimatedStats({
        chapters: Math.min(18, Math.floor(progress * 18)),
        shlokas: Math.min(700, Math.floor(progress * 700)),
        features: Math.min(12, Math.floor(progress * 12)),
        guaranteed: Math.min(100, Math.floor(progress * 100)),
      });
      if (step >= totalSteps) {
        clearInterval(interval);
        setAnimatedStats({ chapters: 18, shlokas: 700, features: 12, guaranteed: 100 });
      }
    }, 25);
    return () => clearInterval(interval);
  }, []);

  const openAiAssistant = () => {
    window.dispatchEvent(new CustomEvent("open-gita-ai-assistant"));
  };

  const openFeedback = () => {
    window.dispatchEvent(new CustomEvent("open-feedback-modal"));
  };

  // Feature Categories Filter
  const categories = [
    { id: "all", label: "બધી જ વિશેષતાઓ", icon: Sparkles },
    { id: "reading", label: "વાંચન & અધ્યયન", icon: BookOpen },
    { id: "ai-guidance", label: "AI & માર્ગદર્શન", icon: Compass },
    { id: "gamification", label: "ક્વિઝ & ગેમિફિકેશન", icon: Trophy },
    { id: "experience", label: "સુવિધા & થીમ", icon: Sun },
  ];

  // All 12 Full Features of the Bhagavad Gita Platform
  const features = [
    {
      id: "chapters",
      category: "reading",
      icon: BookOpen,
      iconColor: "#3b82f6",
      bgGlow: "rgba(59, 130, 246, 0.15)",
      badge: "સંપૂર્ણ જ્ઞાન",
      title: "18 અધ્યાય અને 700 શ્લોક વાચન",
      description:
        "મૂળ સંસ્કૃત શ્લોકો, સચોટ અન્વય, શબ્દાર્થ, સરળ ગુજરાતી અનુવાદ અને તાત્પર્ય સાથે ઊંડાણપૂર્વક અભ્યાસ. વક્તા ઓળખ (શ્રીભગવાનુવાચ, અર્જુન ઉવાચ વગેરે) સાથે સુસ્પષ્ટ વાચન.",
      highlights: [
        "18 અધ્યાયોનું વ્યવસ્થિત વર્ગીકરણ",
        "સંસ્કૃત અન્વય અને શબ્દાર્થ સાથે અર્થ",
        "સરળ, મધુર ગુજરાતી ભાવાર્થ",
        "શ્લોક નંબર અને અધ્યાય દ્વારા ઝડપી નેવિગેશન",
      ],
      link: "/chapters",
      linkText: "અધ્યાય વાંચો",
    },
    {
      id: "audio",
      category: "reading",
      icon: Volume2,
      iconColor: "#10b981",
      bgGlow: "rgba(16, 185, 129, 0.15)",
      badge: "શ્રવણ ભક્તિ",
      title: "દિવ્ય ઓડિયો શ્લોક પ્લેયર",
      description:
        "દરેક શ્લોકનું પવિત્ર અને શુદ્ધ સંસ્કૃત ઉચ્ચારણ સાથે ઓડિયો શ્રવણ. સાંભળીને શ્લોકો યાદ રાખવા અને સાચું ઉચ્ચારણ શીખવા માટે શ્રેષ્ઠ સુવિધા.",
      highlights: [
        "શુદ્ધ વૈદિક સંસ્કૃત ઉચ્ચારણ ઓડિયો",
        "Play / Pause અને સીક કંટ્રોલ",
        "Loop મોડ (શ્લોક વારંવાર સાંભળી કંઠસ્થ કરવા)",
        "Playback સ્પીડ કંટ્રોલ (0.75x, 1x, 1.25x)",
      ],
      link: "/chapter/1",
      linkText: "ઓડિયો સાંભળો",
    },
    {
      id: "ai",
      category: "ai-guidance",
      icon: Brain,
      iconColor: "#8b5cf6",
      bgGlow: "rgba(139, 92, 246, 0.18)",
      badge: "Gemini AI Powered",
      title: "ગીતા AI આધ્યાત્મિક સહાયક",
      description:
        "અત્યાધુનિક AI ટેકનોલોજી દ્વારા તમારા અંગત પ્રશ્નો, માનસિક મૂંઝવણો કે ધર્મ સંકટનું ભગવદ્ ગીતાના શ્લોકો અને શ્રીકૃષ્ણના ઉપદેશો આધારે તુરંત સચોટ સમાધાન.",
      highlights: [
        "ગીતા આધારિત વ્યક્તિગત આધ્યાત્મિક માર્ગદર્શન",
        "સરળ અને મૈત્રીપૂર્ણ ગુજરાતીમાં વાતચીત",
        "શ્લોક સંદર્ભ સાથે પ્રમાણિત જવાબો",
        "ચેટ હિસ્ટ્રી અને 24/7 ઉપલબ્ધતા",
      ],
      action: openAiAssistant,
      linkText: "ગીતા AI પૂછો",
    },
    {
      id: "guidance",
      category: "ai-guidance",
      icon: Compass,
      iconColor: "#f59e0b",
      bgGlow: "rgba(245, 158, 11, 0.18)",
      badge: "જીવન વ્યવહાર",
      title: "જીવન માર્ગદર્શન (Life Guidance)",
      description:
        "આજના આધુનિક જીવનની મુખ્ય સમસ્યાઓ જેવી કે તણાવ, ક્રોધ, સંબંધો, નિર્ણયશક્તિ અને કર્મયોગ માટે ગીતાજીના સર્વોત્તમ શ્લોકોનું વ્યવહારિક સંકલન.",
      highlights: [
        "ચિંતા, ડિપ્રેશન અને તણાવ નિવારણ",
        "ક્રોધ નિયંત્રણ અને માનસિક શાંતિ",
        "કર્મ અને ફરજ અંગે સ્પષ્ટતા",
        "સંબંધો અને આંતરિક સ્થિરતા",
      ],
      link: "/guidance",
      linkText: "માર્ગદર્શન મેળવો",
    },
    {
      id: "quiz",
      category: "gamification",
      icon: HelpCircle,
      iconColor: "#06b6d4",
      bgGlow: "rgba(6, 182, 212, 0.16)",
      badge: "જ્ઞાન કસોટી",
      title: "ઇન્ટરેક્ટિવ ગીતા ક્વિઝ",
      description:
        "અધ્યાય વાઇઝ અને વિવિધ વિષયો પર રસપ્રદ બહુવિકલ્પી (MCQ) પ્રશ્નોત્તરી. રમતા રમતા ગીતાજીના ગહન સિદ્ધાંતો શીખો અને તમારો સ્કોર તપાસો.",
      highlights: [
        "અધ્યાયવાર રસપ્રદ પ્રશ્નો",
        "લાઈવ ટાઈમર અને તાત્કાલિક સ્કોરિંગ",
        "સાચા ઉત્તરો સાથે વિગતવાર સમજૂતી",
        "તમામ જૂની ક્વિઝની હિસ્ટ્રી ટ્રેકિંગ",
      ],
      link: "/quiz-category",
      linkText: "ક્વિઝ રમો",
    },
    {
      id: "achievements",
      category: "gamification",
      icon: Award,
      iconColor: "#eab308",
      bgGlow: "rgba(234, 179, 8, 0.18)",
      badge: "સિદ્ધિઓ",
      title: "ક્વિઝ અચીવમેન્ટ્સ અને બેજીસ",
      description:
        "જેમ જેમ તમે ક્વિઝ રમતા જશો અને શ્લોકો શીખતા જશો, તેમ તેમ તમને વિશેષ ડિજિટલ આધ્યાત્મિક સિદ્ધિ બેજીસ અને ટ્રોફીઝ પ્રાપ્ત થશે.",
      highlights: [
        "જિજ્ઞાસુ, સાધક, જ્ઞાનરત્ન જેવા વિશિષ્ટ બેજીસ",
        "સ્કોર મલ્ટિપ્લાયર્સ અને માઇલસ્ટોન્સ",
        "અનલૉક કરેલ બેજીસનું સુંદર ડિસ્પ્લે",
        "સતત પ્રગતિ માટે પ્રેરક પ્રોગ્રેસ બાર",
      ],
      link: "/quiz-achievements",
      linkText: "સિદ્ધિઓ જુઓ",
    },
    {
      id: "tracker",
      category: "gamification",
      icon: Flame,
      iconColor: "#ef4444",
      bgGlow: "rgba(239, 68, 68, 0.16)",
      badge: "દૈનિક નિયમિતતા",
      title: "વાંચન પ્રગતિ ટ્રેકર અને સ્ટ્રીક્સ",
      description:
        "રોજિંદા ગીતા વાચનની ટેવ કેળવો. તમારી દૈનિક Streak (સતત કેટલા દિવસ વાંચ્યું), કેટલા શ્લોકો પૂર્ણ કર્યા અને કેટલા અધ્યાય બાકી છે તેનો લાઈવ આલેખ.",
      highlights: [
        "દૈનિક સ્ટ્રીક કાઉન્ટર (Reading Streak)",
        "કુલ વાંચેલા શ્લોકો અને અધ્યાયની ટકાવારી",
        "દૈનિક વાચન ટાર્ગેટ અને પૂર્ણતા પ્રગતિ",
        "આધ્યાત્મિક શિસ્ત જાળવવામાં મદદરૂપ",
      ],
      link: "/reading-tracker",
      linkText: "પ્રગતિ તપાસો",
    },
    {
      id: "daily-shlok",
      category: "reading",
      icon: Sparkles,
      iconColor: "#ec4899",
      bgGlow: "rgba(236, 72, 153, 0.16)",
      badge: "દૈનિક પ્રેરણા",
      title: "આજનો શ્લોક & સોશિયલ કાર્ડ શેરિંગ",
      description:
        "રોજ સવારે એક નવો પ્રેરણાદાયક શ્લોક, ગુજરાતી અર્થ અને આજના દિવસ માટેનો સંદેશ. વ્હોટ્સએપ, ફેસબુક કે ઇન્સ્ટાગ્રામ પર શેર કરવા માટે સુંદર HD કાર્ડ બનાવો.",
      highlights: [
        "દરરોજ નવો પ્રેરણાદાયક દૈનિક શ્લોક",
        "આજના દિવસ માટે વ્યવહારિક જીવન સંદેશ",
        "સુંદર શ્લોક કાર્ડ ઇમેજ ડાઉનલોડ & શેર",
        "WhatsApp / Social Media એક ક્લિકમાં શેર",
      ],
      link: "/",
      linkText: "આજનો શ્લોક જુઓ",
    },
    {
      id: "favorites",
      category: "experience",
      icon: Heart,
      iconColor: "#f43f5e",
      bgGlow: "rgba(244, 63, 94, 0.16)",
      badge: "અંગત સંગ્રહ",
      title: "મનપસંદ શ્લોક (Bookmarks)",
      description:
        "જે શ્લોક તમને ખાસ ગમી જાય કે જીવનમાં માર્ગદર્શક લાગે તેને એક જ ક્લિકમાં હૃદય (Favorite) બટન દબાવી તમારા પર્સનલ કલેક્શનમાં સાચવો.",
      highlights: [
        "એક જ ક્લિકમાં શ્લોક બુકમાર્ક કરવાની સુવિધા",
        "ગમે ત્યારે સરળતાથી રિવિઝન કરો",
        "તમારા એકાઉન્ટ સાથે સુરક્ષિત સેવ રહે છે",
        "ઝડપી એક્સેસ માટે પર્સનલ લિસ્ટ",
      ],
      link: "/favorites",
      linkText: "મનપસંદ શ્લોક",
    },
    {
      id: "history",
      category: "experience",
      icon: Clock,
      iconColor: "#64748b",
      bgGlow: "rgba(100, 116, 139, 0.16)",
      badge: "ઇતિહાસ",
      title: "વાંચન અને ક્વિઝ ઇતિહાસ",
      description:
        "તમે ક્યારે કયો શ્લોક વાંચ્યો અને ભૂતકાળમાં કઈ ક્વિઝ આપી હતી તેનો સંપૂર્ણ કાલક્રમિક ઇતિહાસ. કોઈપણ શ્લોક કે રિઝલ્ટ પર ફરી જવા માટે સીધો શોર્ટકટ.",
      highlights: [
        "વાંચેલા શ્લોકોની તારીખવાર નોંધ",
        "ક્વિઝ આપેલા સ્કોર્સ અને તારીખો",
        "એક ક્લિકમાં તે શ્લોક પર પાછા જવાની સુવિધા",
        "સંપૂર્ણ ક્લાઉડ સિંક્રનાઇઝેશન",
      ],
      link: "/history",
      linkText: "ઇતિહાસ જુઓ",
    },
    {
      id: "theme",
      category: "experience",
      icon: Sun,
      iconColor: "#d97706",
      bgGlow: "rgba(217, 119, 6, 0.16)",
      badge: "સુગમ વાચન",
      title: "ડાર્ક & લાઇટ મોડ અને ફૉન્ટ કંટ્રોલ",
      description:
        "રાત્રિના સમયે આંખો પર તાણ ન પડે તે માટે રૉયલ ડાર્ક થીમ અને દિવસ માટે ક્લીન લાઇટ થીમ. સાથે ફૉન્ટ સાઈઝ નાની-મોટી કરવાની અનુકૂળતા.",
      highlights: [
        "આંખોને અનુકૂળ ડાર્ક અને લાઇટ થીમ",
        "વાંચન માટે એડજસ્ટેબલ ફૉન્ટ સાઇઝ",
        "મોબાઇલ, ટેબ્લેટ અને ડેસ્કટોપ પર ફુલ રિસ્પોન્સિવ",
        "ઝીરો ડિસ્ટ્રેક્શન વાચન અનુભવ",
      ],
      link: "/chapters",
      linkText: "વાંચન શરૂ કરો",
    },
    {
      id: "feedback",
      category: "experience",
      icon: Star,
      iconColor: "#f59e0b",
      bgGlow: "rgba(245, 158, 11, 0.16)",
      badge: "યુઝર કનેક્ટ",
      title: "પ્રતિસાદ & 5-સ્ટાર રેટિંગ સિસ્ટમ",
      description:
        "આ પ્લેટફોર્મ તમને કેવું લાગ્યું તે અંગે તમારો કિંમતી અભિપ્રાય આપો. વપરાશકર્તાઓના ફીડબેકના આધારે અમે સતત નવી સુવિધાઓ ઉમેરીએ છીએ.",
      highlights: [
        "સરળ 5-સ્ટાર રેટિંગ આપવાની સુવિધા",
        "સૂચનો અને મંતવ્યો સીધા શેર કરો",
        "નિરંતર સુધારા માટે સીધો સંવાદ",
        "તમારા દરેક સૂચનને સન્માન",
      ],
      action: openFeedback,
      linkText: "પ્રતિસાદ આપો",
    },
  ];

  const filteredFeatures =
    activeTab === "all"
      ? features
      : features.filter((item) => item.category === activeTab);

  return (
    <main className="about-page">
      {/* =====================================================
          BACKGROUND FLOATING ORBS & SACRED GLOW
      ===================================================== */}
      <div className="about-ambient-glow" aria-hidden="true">
        <div className="ambient-circle circle-1" />
        <div className="ambient-circle circle-2" />
        <div className="ambient-circle circle-3" />
        <div className="ambient-chakra" />
      </div>

      <div className="about-container">
        {/* =====================================================
            HERO SECTION WITH DIVINE ANIMATIONS
        ===================================================== */}
        <section className="about-hero">
          {/* Shimmer Badge */}
          <div className="about-hero-badge">
            <span className="badge-pulse-dot" />
            <Flower2 size={16} className="badge-icon spin-slow" />
            <span>॥ શ્રી પરમાત્મને નમઃ ॥ • ભગવદ્ ગીતા ડિજિટલ મિશન</span>
          </div>

          {/* Hero Title */}
          <h1 className="about-hero-title">
            સનાતન જ્ઞાન ગંગા, <br />
            <span className="gold-shimmer-text">આધુનિક ડિજિટલ યુગમાં</span>
          </h1>

          {/* Hero Subtitle */}
          <p className="about-hero-subtitle">
            ભગવાન શ્રીકૃષ્ણના અમૃતમય ઉપદેશોને દરેક જિજ્ઞાસુ સુધી સરળતાથી પહોંચાડવાનો એક
            નમ્ર અને પવિત્ર સંકલ્પ. શુદ્ધ સંસ્કૃત શ્લોકો, સરળ ગુજરાતી ભાવાર્થ, ઓડિયો
            શ્રવણ, કૃષ્ણ AI માર્ગદર્શન અને ઇન્ટરેક્ટિવ ક્વિઝ સાથેનું એકમાત્ર સંપૂર્ણ
            પ્લેટફોર્મ.
          </p>

          {/* Animated Hero CTA Buttons */}
          <div className="about-hero-actions">
            <Link to="/chapters" className="about-btn about-btn-primary">
              <BookOpen size={18} />
              <span>18 અધ્યાય વાંચો</span>
              <ArrowRight size={16} className="btn-arrow" />
            </Link>

            <button
              type="button"
              onClick={openAiAssistant}
              className="about-btn about-btn-secondary"
            >
              <Brain size={18} />
              <span>ગીતા AI સાથે વાત કરો</span>
              <Sparkles size={16} className="btn-sparkle" />
            </button>

            <Link to="/guidance" className="about-btn about-btn-ghost">
              <Compass size={18} />
              <span>જીવન માર્ગદર્શન</span>
            </Link>
          </div>
        </section>

        {/* =====================================================
            ANIMATED LIVE STATS COUNTER STRIP
        ===================================================== */}
        <section className="about-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue-glow">
              <BookOpen size={24} />
            </div>
            <div className="stat-number">{animatedStats.chapters}</div>
            <div className="stat-label">પવિત્ર અધ્યાય</div>
            <div className="stat-sub">સંપૂર્ણ ભગવદ્ ગીતા</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper gold-glow">
              <Volume2 size={24} />
            </div>
            <div className="stat-number">{animatedStats.shlokas}+</div>
            <div className="stat-label">દિવ્ય શ્લોકો</div>
            <div className="stat-sub">ઓડિયો અને ગુજરાતી અર્થ</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper purple-glow">
              <Sparkles size={24} />
            </div>
            <div className="stat-number">{animatedStats.features}+</div>
            <div className="stat-label">વિશેષ સુવિધાઓ</div>
            <div className="stat-sub">AI, ક્વિઝ, સ્ટ્રીક વગેરે</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green-glow">
              <ShieldCheck size={24} />
            </div>
            <div className="stat-number">{animatedStats.guaranteed}%</div>
            <div className="stat-label">જાહેરાત મુક્ત (Ad-Free)</div>
            <div className="stat-sub">૧૦૦% પવિત્ર & નિઃશુલ્ક</div>
          </div>
        </section>

        {/* =====================================================
            MISSION & VISION SECTION
        ===================================================== */}
        <section className="about-mission-section">
          <div className="mission-card">
            <div className="mission-badge">
              <Flower2 size={18} /> અમારું લક્ષ્ય (Our Mission)
            </div>
            <h2>સનાતન જ્ઞાનનું લોકશાહીકરણ</h2>
            <p>
              શ્રીમદ્ ભગવદ્ ગીતા એ માત્ર એક ધાર્મિક ગ્રંથ નથી, પરંતુ જીવન જીવવાની શ્રેષ્ઠ
              કળા છે. અમારું મિશન આ અમૂલ્ય જ્ઞાનને સંસ્કૃતના મૂળ શ્લોકો, શુદ્ધ ઉચ્ચારણ,
              શબ્દાર્થ અને સાદી-સરળ ગુજરાતી ભાષામાં દરેક વ્યક્તિ, ખાસ કરીને યુવા પેઢી
              સુધી સહજ રીતે પહોંચાડવાનું છે.
            </p>
            <div className="mission-points">
              <div className="point-item">
                <CheckCircle2 size={16} className="point-icon" />
                <span>સંસ્કૃત અન્વય અને શબ્દાર્થ સાથે શુદ્ધ ગુજરાતી અર્થ</span>
              </div>
              <div className="point-item">
                <CheckCircle2 size={16} className="point-icon" />
                <span>નિયમિત સ્વાધ્યાય માટે દૈનિક પ્રેરણા અને સ્ટ્રીક્સ</span>
              </div>
            </div>
          </div>

          <div className="mission-card vision-card">
            <div className="mission-badge vision-badge">
              <Compass size={18} /> અમારો દ્રષ્ટિકોણ (Our Vision)
            </div>
            <h2>તણાવમુક્ત અને સંતોષી જીવન</h2>
            <p>
              આજના દોડધામભર્યા અને માનસિક તાણવાળા યુગમાં માનવીને સાચી માનસિક શાંતિ અને
              દિશાસૂચક માર્ગદર્શન મળે તે માટે ગીતાજીના કર્મયોગ, જ્ઞાનયોગ અને ભક્તિયોગને
              આધુનિક ટેક્નોલોજી અને AI સાથે જોડીને દરેક સમસ્યાનું સાચું સમાધાન આપવું.
            </p>
            <div className="mission-points">
              <div className="point-item">
                <CheckCircle2 size={16} className="point-icon" />
                <span>કૃષ્ણ ઉપદેશો આધારિત વ્યવહારિક જીવન માર્ગદર્શન</span>
              </div>
              <div className="point-item">
                <CheckCircle2 size={16} className="point-icon" />
                <span>AI સહાયક દ્વારા ગમે ત્યારે આધ્યાત્મિક સંવાદ</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ALL FEATURES SHOWCASE (ANIMATED GRID)
        ===================================================== */}
        <section className="about-features-showcase">
          <div className="section-header-centered">
            <div className="section-pill">
              <Sparkles size={16} /> વેબસાઇટની તમામ અદ્ભુત વિશેષતાઓ
            </div>
            <h2 className="section-title">
              આ પ્લેટફોર્મ પર શું શું ઉપલબ્ધ છે?
            </h2>
            <p className="section-subtitle">
              અધ્યયન, શ્રવણ, જ્ઞાનચકાસણી અને આધ્યાત્મિક વિકાસ માટે તૈયાર કરાયેલી
              તમામ ૧૨ અજોડ વિશેષતાઓનું પરિચયદર્શન
            </p>

            {/* Filter Tabs */}
            <div className="feature-filter-tabs">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`filter-tab ${activeTab === cat.id ? "active" : ""}`}
                    onClick={() => setActiveTab(cat.id)}
                  >
                    <IconComponent size={16} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Features Animated Cards Grid */}
          <div className="features-grid">
            {filteredFeatures.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="feature-card"
                  style={{ "--card-index": index }}
                >
                  <div
                    className="feature-card-glow"
                    style={{ background: item.bgGlow }}
                  />

                  <div className="feature-card-header">
                    <div
                      className="feature-icon-box"
                      style={{
                        color: item.iconColor,
                        background: item.bgGlow,
                        borderColor: item.iconColor,
                      }}
                    >
                      <IconComp size={24} />
                    </div>

                    <span className="feature-badge">{item.badge}</span>
                  </div>

                  <h3 className="feature-card-title">{item.title}</h3>
                  <p className="feature-card-desc">{item.description}</p>

                  <ul className="feature-highlight-list">
                    {item.highlights.map((hl, hlIdx) => (
                      <li key={hlIdx}>
                        <CheckCircle2
                          size={14}
                          className="hl-icon"
                          style={{ color: item.iconColor }}
                        />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="feature-card-footer">
                    {item.link ? (
                      <Link to={item.link} className="feature-action-btn">
                        <span>{item.linkText}</span>
                        <ChevronRight size={16} className="action-arrow" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={item.action}
                        className="feature-action-btn"
                      >
                        <span>{item.linkText}</span>
                        <Sparkles size={16} className="action-arrow" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            TECH & DESIGN HIGHLIGHTS STRIP
        ===================================================== */}
        <section className="about-tech-section">
          <div className="section-header-centered">
            <div className="section-pill">
              <Zap size={16} /> ટેક્નોલોજી અને વિશેષ ડિઝાઇન
            </div>
            <h2 className="section-title">આધુનિક, સુરક્ષિત અને ઝડપી</h2>
            <p className="section-subtitle">
              અમે યુઝર અનુભવને શ્રેષ્ઠ બનાવવા માટે શ્રેષ્ઠ આધુનિક તકનીકનો ઉપયોગ કર્યો છે
            </p>
          </div>

          <div className="tech-cards-grid">
            <div className="tech-box">
              <div className="tech-icon-circle">
                <Zap size={22} className="tech-icon" />
              </div>
              <h4>અલ્ટ્રા-ફાસ્ટ સ્પીડ</h4>
              <p>
                React 19 અને Vite ની મદદથી પેજ પલકવારમાં લોડ થાય છે, જેથી કોઈ રાહ જોવી
                ન પડે.
              </p>
            </div>

            <div className="tech-box">
              <div className="tech-icon-circle">
                <Smartphone size={22} className="tech-icon" />
              </div>
              <h4>100% મોબાઇલ ફ્રેન્ડલી</h4>
              <p>
                મોબાઇલ, ટેબ્લેટ કે કોમ્પ્યુટર — દરેક સ્ક્રીન સાઈઝ પર એકસરખો સુખદ અનુભવ
                મળે છે.
              </p>
            </div>

            <div className="tech-box">
              <div className="tech-icon-circle">
                <EyeOff size={22} className="tech-icon" />
              </div>
              <h4>કોઈ ત્રાસદાયક જાહેરાતો નહીં</h4>
              <p>
                આધ્યાત્મિક વાતાવરણમાં ખલેલ ન પહોંચે તે માટે સંપૂર્ણ પ્લેટફોર્મ ૧૦૦%
                Ad-Free છે.
              </p>
            </div>

            <div className="tech-box">
              <div className="tech-icon-circle">
                <ShieldCheck size={22} className="tech-icon" />
              </div>
              <h4>ક્લાઉડ ડેટા સુરક્ષા</h4>
              <p>
                તમારો સ્કોર, વાંચન પ્રગતિ અને મનપસંદ શ્લોકો સુરક્ષિત ક્લાઉડમાં સાચવાય
                છે.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            SACRED SHLOKA BANNER
        ===================================================== */}
        <section className="about-sacred-banner">
          <div className="banner-decor-chakra spin-slow" />
          <div className="sacred-banner-content">
            <span className="shlok-number-badge">
              ॥ શ્રીમદ્ ભગવદ્ ગીતા • અધ્યાય ૨, શ્લોક ૪૭ ॥
            </span>
            <blockquote className="sacred-shlok-sanskrit">
              कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।<br />
              मा कर्मफलहेतुर्भूर्मा ते સङ्गोऽस्त्वकर्मणि ॥
            </blockquote>
            <p className="sacred-shlok-gujarati">
              <strong>ગુજરાતી ભાવાર્થ:</strong> &ldquo;તારો અધિકાર માત્ર કર્મ કરવામાં
              છે, તેના ફળમાં ક્યારેય નહીં. તેથી તું ફળની આશા રાખીને કર્મ ન કર, અને કર્મ ન
              કરવાનો મોહ પણ ન રાખ.&rdquo;
            </p>
          </div>
        </section>

        {/* =====================================================
            CALL TO ACTION SECTION
        ===================================================== */}
        <section className="about-cta-section">
          <div className="cta-inner">
            <div className="cta-badge">
              <Flower2 size={16} /> શરૂ કરો તમારી આધ્યાત્મિક યાત્રા
            </div>
            <h2>આજે જ ગીતાજીના જ્ઞાન સાગરમાં ડૂબકી લગાવો</h2>
            <p>
              જીવનની સાચી દિશા, શાશ્વત શાંતિ અને મનોબળ મેળવવા માટે ભગવદ્ ગીતાના પ્રથમ
              અધ્યાયથી જ વાચન શરૂ કરો અથવા ગીતા AI સાથે તમારા પ્રશ્નોની ચર્ચા કરો.
            </p>

            <div className="cta-btn-group">
              <Link to="/chapters" className="cta-btn cta-btn-gold">
                <BookOpen size={18} />
                <span>18 અધ્યાય જુઓ</span>
              </Link>

              <button
                type="button"
                onClick={openAiAssistant}
                className="cta-btn cta-btn-outline"
              >
                <Brain size={18} />
                <span>ગીતા AI સાથે વાત કરો</span>
              </button>

              <button
                type="button"
                onClick={openFeedback}
                className="cta-btn cta-btn-feedback"
              >
                <Star size={18} />
                <span>તમારો પ્રતિસાદ આપો</span>
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            SPIRITUAL FOOTER PRANAM
        ===================================================== */}
        <div className="about-footer-pranam">
          <div className="om-symbol-wrapper">
            <Flower2 size={34} strokeWidth={1.8} className="om-symbol-flower spin-slow" />
          </div>
          <p className="pranam-mantra">
            ॥ ॐ तत्सत् શ્રીકૃષ્ણાર્પણમસ્તુ ॥
          </p>
          <p className="pranam-sub">
            સર્વે ભવન્તુ સુખિનઃ સર્વે સન્તુ નિરામયાઃ • આ પ્લેટફોર્મ સમસ્ત માનવ કલ્યાણ
            માટે સમર્પિત છે.
          </p>
        </div>
      </div>
    </main>
  );
}

export default About;
