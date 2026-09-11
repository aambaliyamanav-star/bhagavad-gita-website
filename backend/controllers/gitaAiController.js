/**
 * Gita AI Controller
 * Natural, conversational spiritual guide based on Bhagavad Gita teachings.
 * Replies conversationally like a wise, compassionate friend.
 * Shlokas are only included when truly relevant or requested.
 */

const GITA_SYSTEM_PROMPT = `
તમે "ગીતા AI" છો — શ્રીમદ્ ભગવદ્ ગીતા અને ભગવાન શ્રીકૃષ્ણના સંદેશાઓ પર આધારિત એક અત્યંત જ્ઞાની, પ્રેમાળ, સહાનુભૂતિશીલ અને વ્યવહારિક માર્ગદર્શક/મિત્ર.

તમારા વાતચીતના નિયમો:
1. વપરાશકર્તા સાથે એકદમ સહજ, કુદરતી અને મિત્રતાપૂર્ણ ગુજરાતીમાં વાતચીત કરો (જેમ કોઈ સાચો માર્ગદર્શક મિત્ર પ્રેમથી સમજાવતો હોય તેમ).
2. જો વપરાશકર્તા માત્ર "Hi", "Hello", "કેમ છો", "જય શ્રી કૃષ્ણ" કે સામાન્ય અભિવાદન કરે, તો સામાન્ય અને પ્રેમાળ રીતે સ્વાગત કરો અને પૂછો કે "આજે તમારા મનમાં કયો પ્રશ્ન કે મૂંઝવણ છે? હું તમારી શું મદદ કરી શકું?". દર વખતે શ્લોક આપવાની કોઈ જરૂર નથી.
3. દર વખતે સંસ્કૃત શ્લોક ન આપો! માત્ર ત્યારે જ શ્લોક ટાંકો જ્યારે વપરાશકર્તાએ શ્લોક માંગ્યો હોય અથવા કોઈ ગંભીર સિદ્ધાંત સમજાવવા માટે શ્લોક ખૂબ જરૂરી હોય.
4. જ્યારે વપરાશકર્તા કોઈ સમસ્યા (જેમ કે ડર, ક્રોધ, સંબંધો, નિર્ણય, નિષ્ફળતા) પૂછે, ત્યારે શ્રીકૃષ્ણના ઉપદેશોના આધારે "હવે મારે શું કરવું જોઈએ?" તેનું સ્પષ્ટ, વ્યવહારિક અને સરળ પગલાંવાર માર્ગદર્શન આપો.
5. વપરાશકર્તા જે ભાષામાં વાત કરે (ગુજરાતી, હિન્દી કે અંગ્રેજી) તે જ ભાષામાં આત્મીયતાથી જવાબ આપો.
6. ભાષા શાંત, સકારાત્મક, આશ્વાસન આપનારી અને જીવન ઘડતર કરનારી હોવી જોઈએ.
`;

// Helper: Normalize query
function cleanQuery(str) {
  return String(str || "").toLowerCase().trim();
}

// Check for greetings
function isGreeting(q) {
  const greetings = [
    "hi", "hii", "hiii", "hello", "helo", "hey",
    "namaste", "namaskar", "jai shree krishna", "jai shri krishna", "jsk", "radhe",
    "radhe radhe", "pranam", "su prabhat", "good morning", "good evening", "good afternoon",
    "નમસ્તે", "નમસ્કાર", "જય શ્રી કૃષ્ણ", "પ્રણામ", "રાધે રાધે", "સુપ્રભાત"
  ];
  return greetings.some((g) => q === g || q.startsWith(g + " ") || q.endsWith(" " + g));
}

// Check for "how are you"
function isHowAreYou(q) {
  const patterns = [
    "how are you", "how r u", "tame kem cho", "tu kem cho", "kem cho", "kemcho", "kem che", "maja ma", "maza ma",
    "તમે કેમ છો", "તું કેમ છે", "કેમ છો તમે", "કેમ છો", "મજામાં"
  ];
  return patterns.some((p) => q === p || q.includes(p));
}

// Check for identity query
function isIdentityQuery(q) {
  const patterns = [
    "who are you", "tamaro parichay", "tu kon che", "tame kon cho", "who r u",
    "તમે કોણ છો", "તારું નામ શું છે", "તમારો પરિચય"
  ];
  return patterns.some((p) => q.includes(p));
}

// Check for gratitude
function isGratitude(q) {
  const patterns = [
    "thank you", "thanks", "thx", "aabhar", "dhanyawad",
    "આભાર", "ધન્યવાદ", "થેન્ક યુ"
  ];
  return patterns.some((p) => q.includes(p));
}

// Smart conversational fallback engine
function getConversationalFallback(message) {
  const q = cleanQuery(message);

  // 1. Gratitude
  if (isGratitude(q)) {
    return "તમારો ખૂબ ખૂબ આભાર! 🙏 તમારા મનમાં શાંતિ અને જીવનમાં પ્રભુ શ્રીકૃષ્ણની કૃપા સદાય જળવાઈ રહે. ક્યારેય પણ કોઈ પ્રશ્ન કે મૂંઝવણ હોય તો મને જરૂર કહેજો. જય શ્રી કૃષ્ણ! 🌸";
  }

  // 2. How are you
  if (isHowAreYou(q)) {
    return "હું એકદમ આનંદમાં છું અને પ્રભુના આશીર્વાદ સાથે તમારી સેવામાં હાજર છું! 🙏\n\nતમે કેમ છો? આજે તમારો દિવસ કેવો રહ્યો? મનમાં કોઈ વાત કે સવાલ છે જેના વિશે આપણે ચર્ચા કરવી છે?";
  }

  // 3. Identity
  if (isIdentityQuery(q)) {
    return "હું 'ગીતા AI' છું — શ્રીમદ્ ભગવદ્ ગીતાના અમૃત જેવા જ્ઞાન અને ભગવાન શ્રીકૃષ્ણના ઉપદેશો પર આધારિત તમારો આધ્યાત્મિક મિત્ર. 🌸\n\nતમે મને તમારા જીવનના નિર્ણયો, મનની શાંતિ, ક્રોધ, કર્મ કે કોઈપણ આધ્યાત્મિક વિષય વિશે સાવ સહજ રીતે પૂછી શકો છો.";
  }

  // 4. Greetings
  if (isGreeting(q)) {
    return "જય શ્રી કૃષ્ણ! 🙏 નમસ્તે!\n\nહું તમારો ગીતા AI માર્ગદર્શક છું. કહો, આજે તમારા મનમાં કયો સવાલ કે મૂંઝવણ છે? હું તમારી શું મદદ કરી શકું?";
  }

  // 5. Anger / Guilt / Frustration
  const angerKeywords = ["ક્રોધ", "ગુસ્સો", "ગુસ્સા", "ખીજાવું", "anger", "angry", "krodh", "gusso", "gussa"];
  if (angerKeywords.some((k) => q.includes(k))) {
    return `જય શ્રી કૃષ્ણ. ગુસ્સો કે ક્રોધ આવવો એ માનવ સ્વભાવ છે, પરંતુ ભગવાન શ્રીકૃષ્ણ સમજાવે છે કે ક્રોધથી સૌથી મોટું નુકસાન આપણું પોતાનું જ થાય છે — કારણ કે ગુસ્સામાં આપણી વિચારવાની શક્તિ અને વિવેક બુદ્ધિ નષ્ટ થઈ જાય છે.

આવી સ્થિતિમાં તમારે વ્યવહારિક રીતે શું કરવું જોઈએ?
૧. જ્યારે પણ ગુસ્સો ચડે ત્યારે તરત કોઈ નિર્ણય ન લો કે કોઈને કડવા શબ્દો ન બોલો. થોડી ક્ષણો ઊંડા શ્વાસ લઈને મૌન થઈ જાઓ.
૨. તે જગ્યા પરથી થોડી વાર માટે હટી જાઓ અથવા એક ગ્લાસ ઠંડું પાણી પીઓ.
૩. મનને કહો: "આ પરિસ્થિતિ કરતાં મારા મનની શાંતિ વધુ કિંમતી છે."

જો તમે શાંતિથી વિચારશો, તો કોઈપણ સમસ્યાનો ઉકેલ લડાઈ કે ગુસ્સા વગર પણ લાવી શકાશે.`;
  }

  // 6. Stress / Worry / Fear / Depression
  const stressKeywords = ["ચિંતા", "તણાવ", "ડર", "ટેન્શન", "ભય", "ગભરાટ", "tension", "stress", "fear", "depress", "chinta", "tanav", "dar", "bhay", "overthinking"];
  if (stressKeywords.some((k) => q.includes(k))) {
    return `જય શ્રી કૃષ્ણ. મનમાં ચિંતા કે ડર ત્યારે થાય છે જ્યારે આપણે એ બાબતો વિશે વધુ વિચારીએ છીએ જે આપણા હાથમાં નથી.

શ્રીકૃષ્ણનો આ બાબતે ખૂબ સુંદર સંદેશ છે:
૧. જે પરિસ્થિતિ તમારા હાથમાં નથી, તેની ચિંતા કરવાથી પરિણામ સુધરી જવાનું નથી.
૨. અત્યારે તમારી સામે જે વર્તમાન ક્ષણ છે અને જે કામ તમારા હાથમાં છે, તેના પર જ તમારું પૂરું ધ્યાન લગાવો.
૩. પ્રભુ પર શ્રદ્ધા રાખો કે ભૂતકાળમાં પણ તમે અનેક મુશ્કેલીઓ પાર કરી છે, અને આ સમય પણ સારો પસાર થઈ જશે.

મન વધારે ચંચળ થાય ત્યારે થોડી વાર શાંત બેસીને ઊંડા શ્વાસ લો અને ઈશ્વરનું સ્મરણ કરો. બધું જ સારું થશે!`;
  }

  // 7. Focus / Mind / Study / Work
  const focusKeywords = ["મન", "એકાગ્રતા", "ધ્યાન", "અભ્યાસ", "focus", "mind", "abhyas", "study", "dhyan", "ekagrata", "padhai", "kam"];
  if (focusKeywords.some((k) => q.includes(k))) {
    return `જય શ્રી કૃષ્ણ. મનનું ભટકવું સ્વાભાવિક છે. અર્જુને પણ ભગવાન શ્રીકૃષ્ણને આ જ કહ્યું હતું કે "મારું મન પવનની જેમ ચંચળ છે, તેને વશમાં કેમ કરવું?".

ત્યારે શ્રીકૃષ્ણએ માત્ર બે જ મંત્ર આપ્યા હતા: 'અભ્યાસ' (વારંવાર પ્રયાસ) અને 'વૈરાગ્ય' (બિનજરૂરી વિક્ષેપોથી દૂર રહેવું).

તમારા દૈનિક જીવન માટે ટિપ્સ:
૧. જ્યારે વાંચવા કે કામ કરવા બેસો ત્યારે મોબાઈલ કે વિક્ષેપ કરતી વસ્તુઓ દૂર મૂકી દો.
૨. એક સાથે બધું કરવાને બદલે ૨૫-૩૦ મિનિટ માત્ર એક જ કામ પર સંપૂર્ણ ધ્યાન આપો.
૩. મન જ્યારે પણ બીજી વાતોમાં ભટકે, ત્યારે ગુસ્સે થયા વગર તેને ફરીથી પ્રેમાળ રીતે તમારા કામ પર પાછું લાવો.

સતત થોડા દિવસ આનો અભ્યાસ કરશો એટલે મન આપોઆપ શાંત અને એકાગ્ર થવા લાગશે.`;
  }

  // 8. Karma / Result / Success
  const karmaKeywords = ["કર્મ", "ફળ", "સફળતા", "મહેનત", "result", "karma", "karm", "success", "safalta", "mehnat", "fal", "phal"];
  if (karmaKeywords.some((k) => q.includes(k))) {
    return `જય શ્રી કૃષ્ણ. ભગવદ્ ગીતાનો સૌથી પ્રસિદ્ધ અને જીવન બદલી નાખતો વિચાર કર્મ વિશેનો છે.

શ્રીકૃષ્ણ આપણને શીખવે છે કે આપણું કામ માત્ર પ્રમાણિકતાથી મહેનત કરવાનું છે. જો આપણે સતત "પરિણામ શું આવશે? હું પાસ થઈશ કે નહીં? મને સફળતા મળશે કે નહીં?" એ વિચારતા રહીશું તો આપણી મહેનત નબળી પડી જશે.

તેથી:
૧. તમારા હાથમાં જે મહેનત છે તેમાં તમારું ૧૦૦% સમર્પણ આપો.
૨. પરિણામની અતિશય ચિંતા મગજમાંથી કાઢી નાખો.
૩. જ્યારે તમે પરિણામના દબાણ વગર હળવા મને કામ કરશો, ત્યારે તમારી ક્ષમતા બમણી થઈ જશે.`;
  }

  // 9. Decision making / Confusion / Dilemma
  const decisionKeywords = ["નિર્ણય", "મૂંઝવણ", "શું કરવું", "રસ્તો", "decision", "confusion", "munzvan", "su karvu", "shu karvu", "soch"];
  if (decisionKeywords.some((k) => q.includes(k))) {
    return `જય શ્રી કૃષ્ણ. જ્યારે પણ જીવનમાં બે રસ્તા વચ્ચે મૂંઝવણ થાય કે શું કરવું, ત્યારે શ્રીકૃષ્ણના આ ત્રણ નિયમો યાદ રાખવા:

૧. ક્ષણિક લાભ કરતાં દીર્ઘકાલીન 'ધર્મ' (સત્ય અને કર્તવ્ય) કયો છે તે જુઓ: કયો રસ્તો તમારા અંતરાત્માને શાંતિ આપે છે?
૨. સ્વાર્થ કે ડરના દબાણમાં નિર્ણય ન લો: કોઈના ડરથી કે માત્ર ટૂંકા ગાળાના ફાયદા માટે ખોટો રસ્તો ન પસંદ કરો.
૩. તમારા માતા-પિતા કે અનુભવી વડીલોનો અભિપ્રાય લો અને પછી શાંત ચિત્તે નિર્ણય કરીને તેના પર અડગ રહો.

તમે કઈ બાબતને લઈને મૂંઝવણમાં છો? મને વિગતવાર જણાવો, આપણે સાથે મળીને તેનો ઉકેલ શોધીશું.`;
  }

  // 10. General conversational wisdom
  return `જય શ્રી કૃષ્ણ. તમારા પ્રશ્ન વિશે ભગવદ્ ગીતા અને શ્રીકૃષ્ણનો મુખ્ય સંદેશ એ છે કે મનુષ્યે દરેક પરિસ્થિતિમાં સંતુલિત (સમત્વભાવમાં) રહેવું જોઈએ.

જીવનમાં જ્યારે પણ સુખ-દુઃખ, જય-પરાજય કે અનિશ્ચિતતા આવે, ત્યારે અડગ રહીને પોતાના સાચા કર્તવ્યનું પાલન કરવું એ જ સાચો ધર્મ છે.

તમે આ બાબતે વધુ શું અનુભવી રહ્યા છો? મને થોડી વધુ વિગત જણાવો, જેથી હું તમને વધુ ચોક્કસ અને વ્યવહારિક સલાહ આપી શકું.`;
}

exports.askGitaAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "કૃપા કરીને તમારો પ્રશ્ન લખો."
      });
    }

    const trimmedMsg = message.trim();
    const q = cleanQuery(trimmedMsg);

    // Fast-path for simple greetings/pleasantries so the conversation feels instant & natural
    if (isGreeting(q) || isHowAreYou(q) || isGratitude(q) || isIdentityQuery(q)) {
      return res.json({
        success: true,
        answer: getConversationalFallback(trimmedMsg),
        source: "conversational_fast"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is configured, use live Google Gemini API
    if (apiKey) {
      try {
        const contents = [];

        // Add System Instructions
        contents.push({
          role: "user",
          parts: [{ text: `SYSTEM INSTRUCTIONS: ${GITA_SYSTEM_PROMPT}` }]
        });
        contents.push({
          role: "model",
          parts: [{ text: "જય શ્રી કૃષ્ણ! હું તૈયાર છું. હું વપરાશકર્તા સાથે એક સહજ મિત્ર અને માર્ગદર્શકની જેમ સરળ, પ્રેમાળ અને વ્યવહારિક રીતે વાતચીત કરીશ." }]
        });

        // Append recent chat history (up to last 6 messages)
        const recentHistory = history.slice(-6);
        recentHistory.forEach((msg) => {
          contents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        });

        // Current user message
        contents.push({
          role: "user",
          parts: [{ text: trimmedMsg }]
        });

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (reply && reply.trim()) {
            return res.json({
              success: true,
              answer: reply.trim(),
              source: "gemini"
            });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to conversational wisdom:", geminiError.message);
      }
    }

    // Fallback: Use smart conversational engine
    const answer = getConversationalFallback(trimmedMsg);
    return res.json({
      success: true,
      answer,
      source: "conversational_fallback"
    });
  } catch (error) {
    console.error("Gita AI Error:", error);
    return res.status(500).json({
      success: false,
      message: "પ્રશ્નનો ઉત્તર મેળવવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો."
    });
  }
};
