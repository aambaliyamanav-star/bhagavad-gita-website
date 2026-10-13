import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./Chapters.css";

const chapterNamesHi = {
  1: "अर्जुनविषाद योग",
  2: "सांख्य योग",
  3: "कर्म योग",
  4: "ज्ञानकर्मसंन्यास योग",
  5: "कर्मसंन्यास योग",
  6: "आत्मसंयम योग",
  7: "ज्ञानविज्ञान योग",
  8: "अक्षरब्रह्म योग",
  9: "राजविद्या राजगुह्य योग",
  10: "विभूति योग",
  11: "विश्वरूपदर्शन योग",
  12: "भक्ति योग",
  13: "क्षेत्र-क्षेत्रज्ञ विभाग योग",
  14: "गुणत्रय विभाग योग",
  15: "पुरुषोत्तम योग",
  16: "दैवासुरसम्पद्विभाग योग",
  17: "श्रद्धात्रयविभाग योग",
  18: "मोक्षसंन्यास योग",
};

const chapters = [
  { number: 1, name: "અર્જુનવિષાદ યોગ", verses: 47 },
  { number: 2, name: "સાંખ્ય યોગ", verses: 72 },
  { number: 3, name: "કર્મ યોગ", verses: 43 },
  { number: 4, name: "જ્ઞાનકર્મસંન્યાસ યોગ", verses: 42 },
  { number: 5, name: "કર્મસંન્યાસ યોગ", verses: 29 },
  { number: 6, name: "આત્મસંયમ યોગ", verses: 47 },
  { number: 7, name: "જ્ઞાનવિજ્ઞાન યોગ", verses: 30 },
  { number: 8, name: "અક્ષરબ્રહ્મ યોગ", verses: 28 },
  { number: 9, name: "રાજવિદ્યા રાજગુહ્ય યોગ", verses: 34 },
  { number: 10, name: "વિભૂતિ યોગ", verses: 42 },
  { number: 11, name: "વિશ્વરૂપદર્શન યોગ", verses: 55 },
  { number: 12, name: "ભક્તિ યોગ", verses: 20 },
  { number: 13, name: "ક્ષેત્રક્ષેત્રજ્ઞ વિભાગ યોગ", verses: 35 },
  { number: 14, name: "ગુણત્રય વિભાગ યોગ", verses: 27 },
  { number: 15, name: "પુરુષોત્તમ યોગ", verses: 20 },
  { number: 16, name: "દૈવાસુર સંપદ્વિભાગ યોગ", verses: 24 },
  { number: 17, name: "શ્રદ્ધાત્રય વિભાગ યોગ", verses: 28 },
  { number: 18, name: "મોક્ષસંન્યાસ યોગ", verses: 78 },
];

function Chapters() {
  const navigate = useNavigate();
  const { isHindi } = useLanguage();

  const [shlokCounts, setShlokCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "https://bhagavad-gita-website.onrender.com/api/shloks"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || (isHindi ? "श्लोक डेटा लोड नहीं हो सका।" : "Shlok data load થઈ શક્યો નથી.")
          );
        }

        const shlokas = data.shlokas || [];

        const counts = {};

        shlokas.forEach((shlok) => {
          const chapterNumber = Number(
            shlok.chapterNumber
          );

          if (!counts[chapterNumber]) {
            counts[chapterNumber] = 0;
          }

          counts[chapterNumber]++;
        });

        setShlokCounts(counts);
      } catch (error) {
        console.error(
          "Chapter data error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, []);

  const openChapter = (chapterNumber) => {
    navigate(`/chapter/${chapterNumber}`);
  };

  return (
    <main className="chapters-page">

      <section className="chapters-header">

        <p>
          ॥ श्रीमद्भगवद्गीता ॥
        </p>

        <h1>
          {isHindi ? "भगवद् गीता के 18 अध्याय" : "ભગવદ્ ગીતાના 18 અધ્યાય"}
        </h1>
      </section>


      <section className="chapters-grid">

        {chapters.map((chapter) => {

          const databaseCount =
            shlokCounts[chapter.number] || 0;

          return (
            <div
              className="chapter-card"
              key={chapter.number}
            >

              <div className="chapter-number">
                {isHindi ? `अध्याय ${chapter.number}` : `અધ્યાય ${chapter.number}`}
              </div>

              <h2>
                {isHindi ? (chapterNamesHi[chapter.number] || chapter.name) : chapter.name}
              </h2>

              <p>
                {databaseCount > 0 ? databaseCount : chapter.verses} {isHindi ? "श्लोक" : "શ્લોક"}
              </p>

              <button
                onClick={() =>
                  openChapter(
                    chapter.number
                  )
                }
              >
                <BookOpen className="btn-icon" size={14} /> {isHindi ? "अध्याय पढ़ें" : "અધ્યાય વાંચો"}
              </button>

            </div>
          );
        })}

      </section>

    </main>
  );
}

export default Chapters;