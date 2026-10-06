import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
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
  Flower2,
  CheckCircle2,
  Award,
  HelpCircle,
  X,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import "./About.css";

const FEATURES_DATA = [
  {
    id: "chapters",
    num: "01",
    category: "વાંચન & અધ્યયન",
    icon: BookOpen,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "સંપૂર્ણ જ્ઞાન",
    title: "18 અધ્યાય અને 700 શ્લોક વાચન",
    description:
      "મૂળ સંસ્કૃત શ્લોકો, સચોટ અન્વય, શબ્દાર્થ, સરળ ગુજરાતી ભાવાર્થ અને તાત્પર્ય સાથે ઊંડાણપૂર્વક અભ્યાસ. વક્તા ઓળખ (શ્રીભગવાનુવાચ, અર્જુન ઉવાચ વગેરે) અને શ્લોક નેવિગેશન સુવિધા.",
    highlights: [
      "18 અધ્યાયોનું વ્યવસ્થિત વર્ગીકરણ",
      "સંસ્કૃત અન્વય અને શબ્દાર્થ સાથે શુદ્ધ અર્થ",
      "સરળ અને મધુર ગુજરાતી ભાવાર્થ",
      "શ્લોક નંબર અને અધ્યાય દ્વારા ત્વરિત નેવિગેશન",
    ],
    link: "/chapters",
    linkText: "18 અધ્યાય વાંચો",
  },
  {
    id: "ai",
    num: "02",
    category: "આધુનિક AI",
    icon: Brain,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "Gemini AI",
    title: "ગીતા AI આધ્યાત્મિક સહાયક",
    description:
      "અત્યાધુનિક AI ટેકનોલોજી દ્વારા તમારા અંગત પ્રશ્નો, માનસિક મૂંઝવણો કે ધર્મ સંકટનું ભગવદ્ ગીતાના શ્લોકો અને શ્રીકૃષ્ણના ઉપદેશો આધારે તુરંત સચોટ સમાધાન.",
    highlights: [
      "ગીતા આધારિત વ્યક્તિગત આધ્યાત્મિક માર્ગદર્શન",
      "સરળ અને મૈત્રીપૂર્ણ ગુજરાતીમાં વાતચીત",
      "શ્લોક સંદર્ભ સાથે પ્રમાણિત જવાબો",
      "ચેટ હિસ્ટ્રી અને 24/7 સતત ઉપલબ્ધતા",
    ],
    actionType: "ai",
    linkText: "ગીતા AI પૂછો",
  },
  {
    id: "guidance",
    num: "03",
    category: "જીવન વ્યવહાર",
    icon: Compass,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "કૃષ્ણ વાણી",
    title: "જીવન માર્ગદર્શન (Life Guidance)",
    description:
      "આજના આધુનિક જીવનની મુખ્ય સમસ્યાઓ જેવી કે તણાવ, ક્રોધ, સંબંધો, નિર્ણયશક્તિ અને કર્મયોગ માટે ગીતાજીના સર્વોત્તમ શ્લોકોનું વ્યવહારિક સંકલન.",
    highlights: [
      "ચિંતા, ડિપ્રેશન અને તણાવ નિવારણ",
      "ક્રોધ નિયંત્રણ અને માનસિક શાંતિ",
      "કર્મ અને ફરજ અંગે ચોક્કસ સ્પષ્ટતા",
      "સંબંધો અને આંતરિક સ્થિરતા",
    ],
    link: "/guidance",
    linkText: "માર્ગદર્શન મેળવો",
  },
  {
    id: "quiz",
    num: "04",
    category: "જ્ઞાન કસોટી",
    icon: HelpCircle,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "MCQ કસોટી",
    title: "ઇન્ટરેક્ટિવ ગીતા ક્વિઝ",
    description:
      "અધ્યાય વાઇઝ અને વિવિધ વિષયો પર રસપ્રદ બહુવિકલ્પી (MCQ) પ્રશ્નોત્તરી. રમતા રમતા ગીતાજીના ગહન સિદ્ધાંતો શીખો અને તમારો સ્કોર તપાસો.",
    highlights: [
      "અધ્યાયવાર રસપ્રદ અને જ્ઞાનવર્ધક પ્રશ્નો",
      "લાઈવ ટાઈમર અને તાત્કાલિક સ્કોરિંગ",
      "સાચા ઉત્તરો સાથે વિગતવાર સમજૂતી",
      "તમામ જૂની ક્વિઝની હિસ્ટ્રી ટ્રેકિંગ",
    ],
    link: "/quiz-category",
    linkText: "ક્વિઝ રમો",
  },
  {
    id: "achievements",
    num: "05",
    category: "સિદ્ધિઓ",
    icon: Award,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "ડિજિટલ બેજીસ",
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
    num: "06",
    category: "દૈનિક સ્વાધ્યાય",
    icon: Flame,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "Daily Streak",
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
    num: "07",
    category: "દૈનિક પ્રેરણા",
    icon: Sparkles,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "આજનો શ્લોક",
    title: "આજનો શ્લોક & સોશિયલ કાર્ડ શેરિંગ",
    description:
      "રોજ સવારે એક નવો પ્રેરણાદાયક શ્લોક, ગુજરાતી અર્થ અને આજના દિવસ માટેનો સંદેશ. વ્હોટ્સએપ કે સોશિયલ મીડિયા પર શેર કરવા માટે સુંદર HD કાર્ડ બનાવો.",
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
    num: "08",
    category: "અંગત સંગ્રહ",
    icon: Heart,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "Bookmarks",
    title: "મનપસંદ શ્લોક (Bookmarks)",
    description:
      "જે શ્લોક તમને ખાસ ગમી જાય કે જીવનમાં માર્ગદર્શક લાગે તેને એક જ ક્લિકમાં બુકમાર્ક કરીને તમારા પર્સનલ કલેક્શનમાં સાચવો.",
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
    num: "09",
    category: "ઇતિહાસ",
    icon: Clock,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "Cloud Sync",
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
    num: "10",
    category: "સુગમ વાચન",
    icon: Sun,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "થીમ્સ & ફૉન્ટ",
    title: "ડાર્ક & લાઇટ મોડ અને ફૉન્ટ કંટ્રોલ",
    description:
      "રાત્રિના સમયે આંખો પર તાણ ન પડે તે માટે રૉયલ ડાર્ક થીમ અને દિવસ માટે ક્લીન લાઇટ થીમ. સાથે ફૉન્ટ સાઈઝ નાના-મોટા કરવાની અનુકૂળતા.",
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
    num: "11",
    category: "યુઝર સંવાદ",
    icon: Star,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "૫-સ્ટાર રેટિંગ",
    title: "પ્રતિસાદ & 5-સ્ટાર રેટિંગ સિસ્ટમ",
    description:
      "આ પ્લેટફોર્મ તમને કેવું લાગ્યું તે અંગે તમારો કિંમતી અભિપ્રાય આપો. વપરાશકર્તાઓના ફીડબેકના આધારે અમે સતત નવી સુવિધાઓ ઉમેરીએ છીએ.",
    highlights: [
      "સરળ 5-સ્ટાર રેટિંગ આપવાની સુવિધા",
      "સૂચનો અને મંતવ્યો સીધા શેર કરો",
      "નિરંતર સુધારા માટે સીધો સંવાદ",
      "તમારા દરેક સૂચનને સન્માન",
    ],
    actionType: "feedback",
    linkText: "પ્રતિસાદ આપો",
  },
];

function About() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedFeature(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openAiAssistant = () => {
    setSelectedFeature(null);
    window.dispatchEvent(new CustomEvent("open-gita-ai-assistant"));
  };

  const openFeedback = () => {
    setSelectedFeature(null);
    window.dispatchEvent(new CustomEvent("open-feedback-modal"));
  };

  return (
    <main className="about-compact-page">
      {/* =====================================================
          BACKGROUND AMBIENT RAYS & CHAKRA (CONTAINED)
      ===================================================== */}
      <div className="about-compact-bg" aria-hidden="true">
        <div className="bg-glow-orb orb-1" />
        <div className="bg-glow-orb orb-2" />
        <div className="bg-chakra spin-slow" />
      </div>

      <div className="about-compact-container">
        {/* =====================================================
            CENTERED TOP BAR: TITLE (CLEAN, NO BOX, ENLARGED)
        ===================================================== */}
        <header className="compact-header-centered">
          <div className="compact-title-wrap">
            <Flower2 size={28} className="compact-logo-flower" />
            <h1>
              શ્રીમદ્ ભગવદ્ ગીતા <span className="title-sep">•</span>{" "}
              <span className="blue-title-text">તમામ વિશેષતાઓ</span>
            </h1>
          </div>
        </header>

        {/* =====================================================
            CENTERED GRID: 11 COMPACT FEATURE BUTTONS
        ===================================================== */}
        <section className="compact-grid-wrapper">
          <div className="features-centered-grid">
            {FEATURES_DATA.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="feature-btn-card"
                  onClick={() => setSelectedFeature(item)}
                >
                  <div className="card-top-row">
                    <span className="card-num-pill">{item.num}</span>
                    <span className="card-category-tag">{item.category}</span>
                  </div>

                  <div className="card-main-content">
                    <div className="card-icon-box">
                      <ItemIcon size={18} />
                    </div>

                    <div className="card-text-col">
                      <h3 className="card-title">{item.title}</h3>
                    </div>
                  </div>

                  <div className="card-hover-hint">
                    <span>વિગતવાર જુઓ</span>
                    <ChevronRight size={13} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* =====================================================
          CENTERED MODAL POPUP FOR FEATURE DETAILS
      ===================================================== */}
      {selectedFeature && (
        <div
          className="about-modal-backdrop"
          onClick={() => setSelectedFeature(null)}
        >
          <div
            className="about-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-left">
                <span className="modal-category-badge">
                  {selectedFeature.category}
                </span>
                <span className="modal-num-badge">
                  {selectedFeature.num} / 11 • {selectedFeature.badge}
                </span>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedFeature(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Hero Row */}
            <div className="modal-hero-row">
              <div className="modal-icon-box">
                <selectedFeature.icon size={30} />
              </div>

              <div className="modal-hero-text">
                <h2>{selectedFeature.title}</h2>
                <p>{selectedFeature.description}</p>
              </div>
            </div>

            {/* Modal Highlights 2x2 Grid */}
            <div className="modal-highlights-grid">
              {selectedFeature.highlights.map((hl, hlIdx) => (
                <div key={hlIdx} className="modal-hl-item">
                  <CheckCircle2
                    size={16}
                    className="modal-hl-check"
                  />
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            {/* Modal Footer Action */}
            <div className="modal-footer">
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={() => setSelectedFeature(null)}
              >
                બંધ કરો
              </button>

              {selectedFeature.link ? (
                <Link
                  to={selectedFeature.link}
                  className="modal-primary-btn"
                  onClick={() => setSelectedFeature(null)}
                >
                  <span>{selectedFeature.linkText}</span>
                  <ArrowRight size={16} />
                </Link>
              ) : selectedFeature.actionType === "ai" ? (
                <button
                  type="button"
                  onClick={openAiAssistant}
                  className="modal-primary-btn"
                >
                  <Brain size={16} />
                  <span>{selectedFeature.linkText}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openFeedback}
                  className="modal-primary-btn"
                >
                  <Star size={16} />
                  <span>{selectedFeature.linkText}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default About;
