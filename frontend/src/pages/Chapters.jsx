import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Chapters.css";

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

  const [shlokCounts, setShlokCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/shloks"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Shlok data load થઈ શક્યો નથી."
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
          ભગવદ્ ગીતાના 18 અધ્યાય
        </h1>

        <p>
          શ્રીકૃષ્ણના દિવ્ય ઉપદેશના 18 અધ્યાયોની
          યાત્રા શરૂ કરો.
        </p>

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
                અધ્યાય {chapter.number}
              </div>

              <h2>
                {chapter.name}
              </h2>

              <p>
                {loading
                  ? "⏳ Loading..."
                  : `${databaseCount} શ્લોક`}
              </p>

              <button
                onClick={() =>
                  openChapter(
                    chapter.number
                  )
                }
              >
                અધ્યાય વાંચો →
              </button>

            </div>
          );
        })}

      </section>

    </main>
  );
}

export default Chapters;