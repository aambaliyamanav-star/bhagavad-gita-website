/**
 * Gita AI Controller
 * Natural, conversational spiritual guide based on Bhagavad Gita teachings.
 * Replies directly and accurately to whatever question is asked.
 * Includes a rich knowledge base for characters, weapons, conches, shlokas, and life wisdom.
 */

const GITA_SYSTEM_PROMPT = `
તમે "ગીતા AI" છો — શ્રીમદ્ ભગવદ્ ગીતા, મહાભારત અને ભગવાન શ્રીકૃષ્ણના સંદેશાઓ પર આધારિત એક અત્યંત જ્ઞાની, સચોટ, પ્રેમાળ અને વિવેકી માર્ગદર્શક.

સૌથી મહત્વપૂર્ણ નિયમો:
૧. વપરાશકર્તાએ જે પ્રશ્ન પૂછ્યો હોય ફક્ત તેનો જ સીધો, સચોટ અને મુદ્દાસર સાચો જવાબ આપો. કોઈ પણ આડોઅવળો, અસંબંધિત કે બનાવટી જવાબ ન આપવો.
૨. જો વપરાશકર્તા કોઈ ચોક્કસ તથ્ય કે પાત્ર વિશે પૂછે (દા.ત. અર્જુનનું ધનુષ, શ્રીકૃષ્ણનો શંખ, ગીતાના અધ્યાય/શ્લોકની સંખ્યા, કર્ણ, ભીષ્મ, દ્રોણાચાર્ય, કુરુક્ષેત્ર વગેરે), તો તરત જ સાચો અને ચોક્કસ જવાબ આપો.
૩. સામાન્ય અભિવાદન (Hi, Hello, કેમ છો, જય શ્રી કૃષ્ણ) પર સંસ્કૃત શ્લોક ન આપવો, સહજ અને પ્રેમાળ રીતે સ્વાગત કરવું.
૪. દર વખતે સંસ્કૃત શ્લોક ન આપો. માત્ર ત્યારે જ શ્લોક ટાંકો જ્યારે વપરાશકર્તાએ ખાસ શ્લોક માંગ્યો હોય અથવા કોઈ ગંભીર વિષય સમજાવવા માટે શ્લોકનો સંદર્ભ આપવો અનિવાર્ય હોય.
૫. જીવનના પ્રશ્નોમાં (ચિંતા, ક્રોધ, નિર્ણય, પરીક્ષા, સંબંધો) શ્રીકૃષ્ણના ઉપદેશોના આધારે વ્યવહારિક અને અમલ કરી શકાય તેવી સ્પષ્ટ સલાહ આપો.
૬. ભાષા શુદ્ધ, સરળ, સન્માનજનક અને આત્મીય ગુજરાતી હોવી જોઈએ.
`;

// Helper: Normalize query
function cleanQuery(str) {
  return String(str || "").toLowerCase().trim();
}

// Convert Gujarati digits to English
function normalizeDigits(str) {
  const gujDigits = { "૦": "0", "૧": "1", "૨": "2", "૩": "3", "૪": "4", "૫": "5", "૬": "6", "૭": "7", "૮": "8", "૯": "9" };
  return str.replace(/[૦-૯]/g, (d) => gujDigits[d] || d);
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

/**
 * Direct factual resolver for specific queries about Gita & Mahabharata
 * Ensures questions like "What is Arjuna's bow?" get the EXACT answer.
 */
function resolveSpecificFact(q) {
  const norm = normalizeDigits(q);

  // 1. Arjuna's Bow
  if (norm.includes("ધનુષ") || norm.includes("dhanush") || norm.includes("ગાંડીવ") || norm.includes("gandiv") || norm.includes("bow")) {
    if (norm.includes("અર્જુન") || norm.includes("arjun") || norm.includes("ધનુષ") || norm.includes("dhanush") || norm.includes("ગાંડીવ")) {
      return "અર્જુનના દિવ્ય ધનુષનું નામ **ગાંડીવ (Gandiva)** હતું. આ અજેય ધનુષ અર્જુનને અગ્નિદેવ પાસેથી વરુણદેવ મારફતે પ્રાપ્ત થયું હતું.";
    }
  }

  // 2. Krishna's Conch (શંખ)
  if ((norm.includes("કૃષ્ણ") || norm.includes("krishna") || norm.includes("કાનહા")) && (norm.includes("શંખ") || norm.includes("shankh"))) {
    return "ભગવાન શ્રીકૃષ્ણના દિવ્ય અને પવિત્ર શંખનું નામ **પાંચજન્ય (Panchajanya)** હતું.";
  }

  // 3. Arjuna's Conch (શંખ)
  if ((norm.includes("અર્જુન") || norm.includes("arjun")) && (norm.includes("શંખ") || norm.includes("shankh"))) {
    return "અર્જુનના શંખનું નામ **દેવદત્ત (Devadatta)** હતું.";
  }

  // 4. All Conches / List of Conches
  if (norm.includes("શંખ") || norm.includes("shankh") || norm.includes("પાંચજન્ય") || norm.includes("દેવદત્ત")) {
    if (norm.includes("નામ") || norm.includes("પાંડવ") || norm.includes("બધા") || norm.includes("list")) {
      return `મહાભારતના યુદ્ધમાં પાંડવો અને શ્રીકૃષ્ણના શંખોના દિવ્ય નામ નીચે મુજબ હતા:
• શ્રીકૃષ્ણ: **પાંચજન્ય**
• અર્જુન: **દેવદત્ત**
• યુધિષ્ઠિર: **અનંતવિજય**
• ભીમ: **પૌણ્ડ્ર**
• નકુલ: **સુઘોષ**
• સહદેવ: **મણિપુષ્પક**`;
    }
  }

  // 5. Arjuna's Chariot (રથ) & Flag
  if (norm.includes("રથ") || norm.includes("rath") || norm.includes("chariot") || norm.includes("નંદીઘોષ") || norm.includes("કપિધ્વજ")) {
    return "અર્જુનના દિવ્ય રથનું નામ **નંદીઘોષ** હતું. આ રથના સારથિ સ્વયં **ભગવાન શ્રીકૃષ્ણ** હતા અને રથની ધ્વજા પર મહાબલી **હનુમાનજી** બિરાજમાન હતા, તેથી અર્જુનને **'કપિધ્વજ'** પણ કહેવામાં આવે છે.";
  }

  // 6. Chapters & Shlokas count in Gita
  if (
    norm.includes("કેટલા અધ્યાય") || norm.includes("કેટલા શ્લોક") ||
    norm.includes("કુલ શ્લોક") || norm.includes("કુલ અધ્યાય") ||
    norm.includes("ketla adhyay") || norm.includes("ketla shlok") ||
    norm.includes("how many chapter") || norm.includes("total shlok") || norm.includes("total chapter")
  ) {
    return "શ્રીમદ્ ભગવદ્ ગીતામાં કુલ **૧૮ અધ્યાય** અને **૭૦૦ શ્લોક** છે. તે મહર્ષિ વેદવ્યાસ રચિત 'મહાભારત'ના ભીષ્મ પર્વનો પવિત્ર અંશ છે.";
  }

  // 7. First Shloka of Gita
  if (norm.includes("પહેલો શ્લોક") || norm.includes("પ્રથમ શ્લોક") || norm.includes("first shlok") || norm.includes("1.1") || norm.includes("૧.૧")) {
    return `ગીતાનો પ્રથમ શ્લોક રાજા ધૃતરાષ્ટ્ર દ્વારા સંજયને પૂછવામાં આવે છે:

**ધર્મક્ષેત્રે કુરુક્ષેત્રે સમવેતા યુયુત્સવઃ |**
**મામકાઃ પાણ્ડવાશ્ચૈવ કિમકુર્વત સઞ્જય ||** (અધ્યાય ૧, શ્લોક ૧)

**અર્થ:** હે સંજય! પવિત્ર ધર્મભૂમિ કુરુક્ષેત્રમાં યુદ્ધની ઇચ્છાથી એકત્ર થયેલા મારા (કૌરવો) અને પાંડુના પુત્રોએ શું કર્યું?`;
  }

  // 8. Last Shloka of Gita
  if (norm.includes("છેલ્લો શ્લોક") || norm.includes("અંતિમ શ્લોક") || norm.includes("last shlok") || norm.includes("18.78") || norm.includes("૧૮.૭૮")) {
    return `ગીતાનો અંતિમ શ્લોક સંજય દ્વારા બોલવામાં આવ્યો છે:

**યત્ર યોગેશ્વરઃ કૃષ્ણો યત્ર પાર્થો ધનુર્ધરઃ |**
**તત્ર શ્રીર્વિજયો ભૂતિર્ધ્રુવા નીતિર્મતિર્મમ ||** (અધ્યાય ૧૮, શ્લોક ૭૮)

**અર્થ:** જ્યાં યોગેશ્વર ભગવાન શ્રીકૃષ્ણ છે અને જ્યાં ગાંડિવધનુર્ધારી અર્જુન છે, ત્યાં જ વિજય, સંપત્તિ, વિભૂતિ અને અચળ નીતિ રહેલી છે.`;
  }

  // 9. Author / Origin of Gita
  if (norm.includes("કોણે લખી") || norm.includes("કોણે કહી") || norm.includes("રચયિતા") || norm.includes("લેખક") || norm.includes("કોના વચ્ચે")) {
    return "શ્રીમદ્ ભગવદ્ ગીતા એ કુરુક્ષેત્રના મેદાનમાં **ભગવાન શ્રીકૃષ્ણ** દ્વારા પ્રિય સખા અને શિષ્ય **અર્જુન**ને આપવામાં આવેલો અમૃત ઉપદેશ છે. મહાભારતના મહાગ્રંથના ભાગ રૂપે તેનું સંકલન મહર્ષિ **વેદવ્યાસ** દ્વારા કરવામાં આવ્યું હતું.";
  }

  // 10. Sudarshan Chakra
  if (norm.includes("સુદર્શન") || norm.includes("sudarshan")) {
    return "સુદર્શન ચક્ર ભગવાન શ્રીકૃષ્ણનું અમોઘ અને દિવ્ય શસ્ત્ર છે, જે ધર્મની રક્ષા કરવા અને અધર્મીઓ તથા દુષ્ટોના સંહાર માટે લક્ષ્ય સાધીને આપોઆપ પાછું શ્રીકષ્ણ પાસે આવી જતું.";
  }

  // 11. Karna (કર્ણ)
  if (norm.includes("કર્ણ") || norm.includes("karna") || norm.includes("સૂર્યપુત્ર") || norm.includes("દાનવીર")) {
    return "કર્ણ માતા કુંતી અને સૂર્યદેવનો જ્યેષ્ઠ પુત્ર હતો. તે મહાભારતનો અપ્રતિમ ધનુર્ધર યોદ્ધા અને 'દાનવીર કર્ણ' તરીકે પ્રસિદ્ધ હતો. તે જન્મથી કવચ અને કુંડળ ધરાવતો હતો, અને દુર્યોધનનો અતૂટ મિત્ર તેમજ અંગદેશનો રાજા હતો.";
  }

  // 12. Bhishma Pitamah
  if (norm.includes("ભીષ્મ") || norm.includes("પિતામહ") || norm.includes("દેવવ્રત") || norm.includes("ગાંગેય") || norm.includes("bhishma")) {
    return "ભીષ્મ પિતામહ (મૂળ નામ દેવવ્રત) રાજા શાંતનુ અને ગંગાજીના પુત્ર હતા. તેમણે આજીવન બ્રહ્મચર્ય અને હસ્તિનાપુરના સિંહાસનની રક્ષા કરવાની કઠોર ભીષણ પ્રતિજ્ઞા લીધી હોવાથી તેમને 'ભીષ્મ' કહેવાયા. તેમને 'ઇચ્છામૃત્યુ'નું વરદાન હતું.";
  }

  // 13. Dronacharya
  if (norm.includes("દ્રોણ") || norm.includes("દ્રોણાચાર્ય") || norm.includes("ગુરુ દ્રોણ") || norm.includes("dronacharya") || norm.includes("drona")) {
    return "ગુરુ દ્રોણાચાર્ય કૌરવો અને પાંડવોના રાજગુરુ તથા ધનુર્વિદ્યા અને શસ્ત્રકળાના મહાન આચાર્ય હતા. અર્જુન તેમનો સૌથી પ્રિય અને સર્વશ્રેષ્ઠ શિષ્ય હતો.";
  }

  // 14. Sanjay & Divya Drishti
  if (norm.includes("સંજય") || norm.includes("દિવ્ય દૃષ્ટિ") || norm.includes("sanjay")) {
    return "સંજય મહર્ષિ વેદવ્યાસના શિષ્ય અને રાજા ધૃતરાષ્ટ્રના મંત્રી હતા. મહર્ષિ વેદવ્યાસજીએ સંજયને 'દિવ્ય દૃષ્ટિ' આપી હતી, જેના દ્વારા તેમણે હસ્તિનાપુરના મહેલમાં બેઠા-બેઠા કુરુક્ષેત્રના યુદ્ધ અને શ્રીકૃષ્ણ-અર્જુન સંવાદનું જીવંત દર્શન ધૃતરાષ્ટ્રને સંભળાવ્યું હતું.";
  }

  // 15. Kurukshetra
  if (norm.includes("કુરુક્ષેત્ર") || norm.includes("kurukshetra")) {
    return "કુરુક્ષેત્ર હાલના હરિયાણા રાજ્યમાં આવેલું ઐતિહાસિક તીર્થક્ષેત્ર છે. અહીં કૌરવો અને પાંડવો વચ્ચે ૧૮ દિવસ સુધી મહાભારતનું ધર્મયુદ્ધ લડાયું હતું અને ભગવાન શ્રીકૃષ્ણએ અર્જુનને ગીતાનો દિવ્ય ઉપદેશ આપ્યો હતો.";
  }

  // 16. Krishna's Birth / Parents
  if ((norm.includes("કૃષ્ણ") || norm.includes("krishna")) && (norm.includes("જન્મ") || norm.includes("માતા") || norm.includes("પિતા") || norm.includes("દેવકી") || norm.includes("વાસુદેવ") || norm.includes("યશોદા") || norm.includes("નંદ") || norm.includes("birth"))) {
    return "ભગવાન શ્રીકૃષ્ણનો જન્મ મથુરાના કારાગારમાં માતા દેવકી અને પિતા વાસુદેવના આઠમા પુત્ર તરીકે શ્રાવણ વદ આઠમ (જન્માષ્ટમી) ની મધ્યરાત્રિએ થયો હતો. તેમનો બાળપણનો ઉછેર ગોકુળ-વૃંદાવનમાં માતા યશોદા અને નંદબાબાએ કર્યો હતો.";
  }

  // 17. Atma / Soul
  if (norm.includes("આત્મા") || norm.includes("atma") || norm.includes("soul") || norm.includes("નૈનં છિન્દન્તિ")) {
    return `ગીતાના અધ્યાય ૨માં ભગવાન શ્રીકૃષ્ણ સમજાવે છે કે આત્મા અજર, અમર અને અવિનાશી છે:

**નૈનં છિન્દન્તિ શસ્ત્રાણિ નૈનં દહતિ પાવકઃ |**
**ન ચૈનં ક્લેદયન્ત્યાપો ન શોષયતિ મારુતઃ ||** (૨.૨૩)

આત્માને શસ્ત્રો કાપી શકતા નથી, અગ્નિ બાળી શકતી નથી, પાણી ભીંજવી શકતું નથી અને પવન સૂકવી શકતો નથી. જેમ મનુષ્ય જૂના વસ્ત્રો ત્યજીને નવા વસ્ત્રો પહેરે છે, તેમ આત્મા જૂનું શરીર છોડીને નવું શરીર ધારણ કરે છે. તેથી મૃત્યુ માત્ર શરીરનું છે, આત્માનું નહીં.`;
  }

  // 18. Karmanyevadhikaraste Shloka
  if (norm.includes("કર્મણ્યેવાધિકારસ્તે") || norm.includes("karmanye") || norm.includes("2.47") || norm.includes("૨.૪૭")) {
    return `ભગવદ્ ગીતાનો સૌથી પ્રસિદ્ધ શ્લોક (અધ્યાય ૨, શ્લોક ૪૭):

**કર્મણ્યેવાધિકારસ્તે મા ફલેષુ કદાચન |**
**મા કર્મફલહેતુર્ભૂર્મા તે સઙ્ગોસ્ત્વકર્મણિ ||**

**અર્થ:** તારો અધિકાર ફક્ત કર્મ (કર્તવ્ય) કરવામાં છે, તેના ફળ પર ક્યારેય નહીં. કર્મનું ફળ મેળવવાની આસક્તિ ન રાખ અને કર્મ ન કરવામાં (આળસ કે નિષ્ક્રિયતા) પણ તારો લગાવ ન થાઓ.`;
  }

  // 19. Yada Yada Hi Dharmasya Shloka
  if (norm.includes("યદા યદા") || norm.includes("yada yada") || norm.includes("4.7") || norm.includes("૪.૭") || norm.includes("અવતાર")) {
    return `ગીતાનો દિવ્ય શ્લોક (અધ્યાય ૪, શ્લોક ૭-૮):

**યદા યદા હિ ધર્મસ્ય ગ્લાનિર્ભવતિ ભારત |**
**અભ્યુત્થાનમધર્મસ્ય તદાત્માનં સૃજામ્યહમ્ ||**
**પરિત્રાણાય સાધૂનાં વિનાશાય ચ દુષ્કૃતામ્ |**
**ધર્મસંસ્થાપનાર્થાય સંભવામિ યુગે યુગે ||**

**અર્થ:** હે ભારત! જ્યારે જ્યારે ધર્મની હાનિ થાય છે અને અધર્મ વધે છે, ત્યારે હું સ્વયં પ્રગટ થાઉં છું. સજ્જનોના રક્ષણ માટે, દુષ્ટોના સંહાર માટે અને ધર્મની પુનઃ સ્થાપના માટે હું યુગે-યુગે જન્મ લઉં છું.`;
  }

  // 20. Draupadi
  if (norm.includes("દ્રૌપદી") || norm.includes("પાંચાલી") || norm.includes("draupadi")) {
    return "દ્રૌપદી (મૂળ નામ કૃષ્ણા) રાજા દ્રુપદની પુત્રી હતી, જે યજ્ઞકુંડમાંથી પ્રગટ થઈ હતી (તેથી યાજ્ઞસેની પણ કહેવાઈ). તે પાંચ પાંડવોની પત્ની અને ભગવાન શ્રીકૃષ્ણની પરમ સખી અને ભક્ત હતી.";
  }

  // 21. Abhimanyu & Chakravyuha
  if (norm.includes("અભિમન્યુ") || norm.includes("ચક્રવ્યૂહ") || norm.includes("abhimanyu") || norm.includes("chakravyuha")) {
    return "અભિમન્યુ અર્જુન અને સુભદ્રાનો પુત્ર તથા શ્રીકૃષ્ણનો ભાણેજ હતો. તેણે માત્ર ૧૬ વર્ષની કુમળી વયે કૌરવોના મહારથીઓ દ્વારા રચાયેલા અજેય ચક્રવ્યૂહને ભેદીને અપ્રતિમ વીરતા દાખવી હતી.";
  }

  // 22. Vishwaroop Darshan
  if (norm.includes("વિશ્વરૂપ") || norm.includes("વિરાટ દર્શન") || norm.includes("વિરાટ રૂપ") || norm.includes("vishwaroop")) {
    return "ભગવદ્ ગીતાના ૧૧મા અધ્યાયમાં ભગવાન શ્રીકૃષ્ણ અર્જુનને પોતાનું અનંત 'વિશ્વરૂપ દર્શન' કરાવે છે, જેમાં સમગ્ર બ્રહ્માંડ, સૂર્ય-ચંદ્ર, દેવતાઓ, અગ્નિ અને કાળ સ્વરૂપ શ્રીકૃષ્ણના એક જ વિરાટ શરીરમાં સમાયેલા દેખાય છે.";
  }

  // 23. Sthitaprajna (સ્થિતપ્રજ્ઞ)
  if (norm.includes("સ્થિતપ્રજ્ઞ") || norm.includes("sthitaprajna")) {
    return "ગીતામાં 'સ્થિતપ્રજ્ઞ' એટલે એવો મનુષ્ય જેની બુદ્ધિ સદાય સ્થિર છે. જે સુખ મળ્યે અતિશય હરખાતો નથી અને દુઃખમાં શોક કે વિલાપ કરતો નથી; જેને રાગ, ભય અને ક્રોધ સ્પર્શતા નથી તે સાચો સ્થિતપ્રજ્ઞ છે.";
  }

  // 24. Moksha (મોક્ષ)
  if (norm.includes("મોક્ષ") || norm.includes("મુક્તિ") || norm.includes("moksha")) {
    return "મોક્ષ એટલે જન્મ અને મરણના ફેરામાંથી કાયમી મુક્તિ મેળવીને પરમાત્માના પરમધામમાં લીન થવું. ગીતા અનુસાર નિષ્કામ કર્મયોગ, આત્મજ્ઞાન અને પ્રભુની અનન્ય શરણાગતિ દ્વારા મોક્ષ પ્રાપ્ત થાય છે.";
  }

  // 25. Meaning of Dharma (ધર્મ એટલે શું)
  if (norm.includes("ધર્મ એટલે") || norm.includes("ધર્મનો અર્થ") || norm.includes("what is dharma")) {
    return "ભગવદ્ ગીતામાં 'ધર્મ' કોઈ બાહ્ય સંપ્રદાય કે જાતિ નથી, પરંતુ સત્ય, ન્યાય અને મનુષ્યનું પોતાનું પવિત્ર કર્તવ્ય છે. પોતાનું કાર્ય પ્રમાણિકતાથી અને કોઈને અન્યાય કર્યા વગર નિભાવવું એ જ સાચો ધર્મ છે.";
  }

  // 26. Friendship / Sudama
  if (norm.includes("મિત્રતા") || norm.includes("દોસ્તી") || norm.includes("સુદામા") || norm.includes("friendship")) {
    return "શ્રીકૃષ્ણ અને સુદામા તેમજ શ્રીકૃષ્ણ અને અર્જુનની મિત્રતા નિઃસ્વાર્થ પ્રેમ, સમર્પણ અને સન્માનનું પ્રતીક છે. સાચો મિત્ર એ છે જે મુશ્કેલીમાં સાથ આપે અને જીવનમાં હંમેશાં સાચો માર્ગ બતાવે.";
  }

  // 27. Ego / Ahankar
  if (norm.includes("અહંકાર") || norm.includes("અભિમાન") || norm.includes("ઘમંડ") || norm.includes("ego") || norm.includes("ahankar")) {
    return "શ્રીકૃષ્ણ કહે છે કે અહંકાર એ મનુષ્યનો સૌથી મોટો શત્રુ છે. અહંકારથી વિવેક અને બુદ્ધિનો નાશ થાય છે. જ્યારે મનુષ્ય સમજે છે કે સૃષ્ટિમાં બધું જ ઈશ્વરની ઇચ્છાથી ચાલે છે, ત્યારે અહંકાર આપોઆપ ઓગળી જાય છે.";
  }

  return null;
}

/**
 * Conversational guidance for emotional and life challenges
 */
function resolveTopicGuidance(q) {
  const norm = normalizeDigits(q);

  // 1. Anger / Guilt / Frustration
  const angerKeywords = ["ક્રોધ", "ગુસ્સો", "ગુસ્સા", "ખીજાવું", "anger", "angry", "krodh", "gusso", "gussa"];
  if (angerKeywords.some((k) => norm.includes(k))) {
    return `જય શ્રી કૃષ્ણ. ગુસ્સો કે ક્રોધ આવવો એ માનવ સ્વભાવ છે, પરંતુ ભગવાન શ્રીકૃષ્ણ સમજાવે છે કે ક્રોધથી સૌથી મોટું નુકસાન આપણું પોતાનું જ થાય છે — કારણ કે ગુસ્સામાં આપણી વિચારવાની શક્તિ અને વિવેક બુદ્ધિ નષ્ટ થઈ જાય છે.

આવી સ્થિતિમાં તમારે વ્યવહારિક રીતે શું કરવું જોઈએ?
૧. જ્યારે પણ ગુસ્સો ચડે ત્યારે તરત કોઈ નિર્ણય ન લો કે કોઈને કડવા શબ્દો ન બોલો. થોડી ક્ષણો ઊંડા શ્વાસ લઈને મૌન થઈ જાઓ.
૨. તે જગ્યા પરથી થોડી વાર માટે હટી જાઓ અથવા એક ગ્લાસ ઠંડું પાણી પીઓ.
૩. મનને કહો: "આ પરિસ્થિતિ કરતાં મારા મનની શાંતિ વધુ કિંમતી છે."

જો તમે શાંતિથી વિચારશો, તો કોઈપણ સમસ્યાનો ઉકેલ લડાઈ કે ગુસ્સા વગર પણ લાવી શકાશે.`;
  }

  // 2. Stress / Worry / Fear / Depression
  const stressKeywords = ["ચિંતા", "તણાવ", "ડર", "ટેન્શન", "ભય", "ગભરાટ", "દુઃખ", "ઉદાસ", "ડિપ્રેશન", "હતાશા", "નિરાશા", "tension", "stress", "fear", "depress", "chinta", "tanav", "dar", "bhay", "overthinking", "sad"];
  if (stressKeywords.some((k) => norm.includes(k))) {
    return `જય શ્રી કૃષ્ણ. મનમાં ચિંતા કે ડર ત્યારે થાય છે જ્યારે આપણે એ બાબતો વિશે વધુ વિચારીએ છીએ જે આપણા હાથમાં નથી.

શ્રીકૃષ્ણનો આ બાબતે ખૂબ સુંદર સંદેશ છે:
૧. જે પરિસ્થિતિ તમારા હાથમાં નથી, તેની ચિંતા કરવાથી પરિણામ સુધરી જવાનું નથી.
૨. અત્યારે તમારી સામે જે વર્તમાન ક્ષણ છે અને જે કામ તમારા હાથમાં છે, તેના પર જ તમારું પૂરું ધ્યાન લગાવો.
૩. પ્રભુ પર શ્રદ્ધા રાખો કે ભૂતકાળમાં પણ તમે અનેક મુશ્કેલીઓ પાર કરી છે, અને આ સમય પણ સારો પસાર થઈ જશે.

મન વધારે ચંચળ થાય ત્યારે થોડી વાર શાંત બેસીને ઊંડા શ્વાસ લો અને ઈશ્વરનું સ્મરણ કરો. બધું જ સારું થશે!`;
  }

  // 3. Focus / Mind / Study / Exam
  const focusKeywords = ["મન", "એકાગ્રતા", "ધ્યાન", "અભ્યાસ", "પરીક્ષા", "વાંચન", "ભણવું", "focus", "mind", "abhyas", "study", "exam", "dhyan", "ekagrata", "padhai", "kam"];
  if (focusKeywords.some((k) => norm.includes(k))) {
    return `જય શ્રી કૃષ્ણ. મનનું ભટકવું સ્વાભાવિક છે. અર્જુને પણ ભગવાન શ્રીકૃષ્ણને આ જ કહ્યું હતું કે "મારું મન પવનની જેમ ચંચળ છે, તેને વશમાં કેમ કરવું?".

ત્યારે શ્રીકૃષ્ણએ માત્ર બે જ મંત્ર આપ્યા હતા: 'અભ્યાસ' (વારંવાર પ્રયાસ) અને 'વૈરાગ્ય' (બિનજરૂરી વિક્ષેપોથી દૂર રહેવું).

તમારા અભ્યાસ અને દૈનિક જીવન માટે ટિપ્સ:
૧. વાંચવા કે કામ કરવા બેસો ત્યારે મોબાઈલ કે વિક્ષેપ કરતી વસ્તુઓ દૂર મૂકી દો.
૨. એક સાથે બધું કરવાને બદલે ૨૫-૩૦ મિનિટ માત્ર એક જ વિષય પર સંપૂર્ણ ધ્યાન આપો.
૩. પરીક્ષાના પરિણામ (માર્ક્સ) ની ચિંતા મગજમાંથી કાઢી નાખો અને ફક્ત પ્રામાણિક મહેનત કરો.

સતત થોડા દિવસ આનો અભ્યાસ કરશો એટલે મન આપોઆપ શાંત અને એકાગ્ર થવા લાગશે.`;
  }

  // 4. Karma / Result / Success
  const karmaKeywords = ["કર્મ", "ફળ", "સફળતા", "મહેનત", "result", "karma", "karm", "success", "safalta", "mehnat", "fal", "phal"];
  if (karmaKeywords.some((k) => norm.includes(k))) {
    return `જય શ્રી કૃષ્ણ. ભગવદ્ ગીતાનો સૌથી પ્રસિદ્ધ વિચાર કર્મ વિશેનો છે.

શ્રીકૃષ્ણ આપણને શીખવે છે કે આપણું કામ માત્ર પ્રમાણિકતાથી મહેનત કરવાનું છે. જો આપણે સતત "પરિણામ શું આવશે? મને સફળતા મળશે કે નહીં?" એ વિચારતા રહીશું તો આપણી મહેનત નબળી પડી જશે.

તેથી:
૧. તમારા હાથમાં જે મહેનત છે તેમાં તમારું ૧૦૦% સમર્પણ આપો.
૨. પરિણામની અતિશય ચિંતા મગજમાંથી કાઢી નાખો.
૩. જ્યારે તમે પરિણામના દબાણ વગર હળવા મને કામ કરશો, ત્યારે તમારી કાર્યક્ષમતા બમણી થઈ જશે.`;
  }

  // 5. Decision making / Confusion / Dilemma
  const decisionKeywords = ["નિર્ણય", "મૂંઝવણ", "શું કરવું", "રસ્તો", "decision", "confusion", "munzvan", "su karvu", "shu karvu", "soch"];
  if (decisionKeywords.some((k) => norm.includes(k))) {
    return `જય શ્રી કૃષ્ણ. જ્યારે પણ જીવનમાં બે રસ્તા વચ્ચે મૂંઝવણ થાય કે શું કરવું, ત્યારે શ્રીકૃષ્ણના આ ત્રણ નિયમો યાદ રાખવા:

૧. ક્ષણિક લાભ કરતાં દીર્ઘકાલીન 'ધર્મ' (સત્ય અને કર્તવ્ય) કયો છે તે જુઓ: કયો રસ્તો તમારા અંતરાત્માને શાંતિ આપે છે?
૨. સ્વાર્થ કે ડરના દબાણમાં નિર્ણય ન લો: કોઈના ડરથી કે માત્ર ટૂંકા ગાળાના ફાયદા માટે ખોટો રસ્તો ન પસંદ કરો.
૩. અનુભવી વડીલોનો અભિપ્રાય લો અને પછી શાંત ચિત્તે નિર્ણય કરીને તેના પર અડગ રહો.

તમે કઈ બાબતને લઈને મૂંઝવણમાં છો? મને વિગતવાર જણાવો, આપણે સાથે મળીને તેનો યોગ્ય ઉકેલ શોધીશું.`;
  }

  return null;
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

    // Fast-path for simple greetings/pleasantries
    if (isGreeting(q)) {
      return res.json({
        success: true,
        answer: "જય શ્રી કૃષ્ણ! 🙏 નમસ્તે!\n\nહું તમારો ગીતા AI માર્ગદર્શક છું. કહો, આજે તમારા મનમાં કયો સવાલ કે મૂંઝવણ છે? હું તમારી શું મદદ કરી શકું?",
        source: "conversational_fast"
      });
    }

    if (isHowAreYou(q)) {
      return res.json({
        success: true,
        answer: "હું એકદમ આનંદમાં છું અને પ્રભુના આશીર્વાદ સાથે તમારી સેવામાં હાજર છું! 🙏\n\nતમે કેમ છો? આજે તમારો દિવસ કેવો રહ્યો? મનમાં કોઈ વાત કે સવાલ છે જેના વિશે આપણે ચર્ચા કરવી છે?",
        source: "conversational_fast"
      });
    }

    if (isGratitude(q)) {
      return res.json({
        success: true,
        answer: "તમારો ખૂબ ખૂબ આભાર! 🙏 તમારા મનમાં શાંતિ અને જીવનમાં પ્રભુ શ્રીકૃષ્ણની કૃપા સદાય જળવાઈ રહે. ક્યારેય પણ કોઈ પ્રશ્ન કે મૂંઝવણ હોય તો મને જરૂર કહેજો. જય શ્રી કૃષ્ણ! 🌸",
        source: "conversational_fast"
      });
    }

    if (isIdentityQuery(q)) {
      return res.json({
        success: true,
        answer: "હું 'ગીતા AI' છું — શ્રીમદ્ ભગવદ્ ગીતાના અમૃત જેવા જ્ઞાન અને ભગવાન શ્રીકૃષ્ણના ઉપદેશો પર આધારિત તમારો આધ્યાત્મિક મિત્ર. 🌸\n\nતમે મને તમારા જીવનના નિર્ણયો, મનની શાંતિ, ક્રોધ, કર્મ કે કોઈપણ આધ્યાત્મિક વિષય વિશે સાવ સહજ રીતે પૂછી શકો છો.",
        source: "conversational_fast"
      });
    }

    // 1. Direct factual resolver: If it's a specific fact question (e.g. Arjuna's bow, conch, chapters count)
    const directFact = resolveSpecificFact(q);
    if (directFact) {
      return res.json({
        success: true,
        answer: directFact,
        source: "direct_fact"
      });
    }

    // 2. If Gemini API Key is configured, use live Google Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const modelsToTry = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
      for (const modelName of modelsToTry) {
        try {
          const contents = [];

          // Add System Instructions
          contents.push({
            role: "user",
            parts: [{ text: `SYSTEM INSTRUCTIONS: ${GITA_SYSTEM_PROMPT}` }]
          });
          contents.push({
            role: "model",
            parts: [{ text: "જય શ્રી કૃષ્ણ! હું તૈયાર છું. વપરાશકર્તા જે ચોક્કસ પ્રશ્ન પૂછશે, હું ફક્ત તેનો જ સીધો, સાચો અને સચોટ જવાબ ગુજરાતીમાં આપીશ." }]
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
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                contents,
                generationConfig: {
                  temperature: 0.5,
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
          console.warn(`Gemini (${modelName}) failed:`, geminiError.message);
        }
      }
    }

    // 3. Topic Guidance resolver for practical life challenges (Anger, Stress, Study, Karma, Decision)
    const topicGuidance = resolveTopicGuidance(q);
    if (topicGuidance) {
      return res.json({
        success: true,
        answer: topicGuidance,
        source: "topic_guidance"
      });
    }

    // 4. Default contextual reply
    return res.json({
      success: true,
      answer: `જય શ્રી કૃષ્ણ. તમારા પ્રશ્ન વિશે ભગવદ્ ગીતાનો મુખ્ય સંદેશ એ છે કે મનુષ્યે દરેક પરિસ્થિતિમાં સંતુલિત (સમત્વભાવમાં) રહીને પોતાના સાચા ધર્મ અને કર્તવ્યનું પાલન કરવું જોઈએ.

તમે આ બાબતે શું જાણવા માંગો છો? કૃપા કરીને થોડી વધુ વિગત જણાવો, જેથી હું તમને ચોક્કસ અને વ્યવહારિક જવાબ આપી શકું.`,
      source: "contextual_guidance"
    });
  } catch (error) {
    console.error("Gita AI Error:", error);
    return res.status(500).json({
      success: false,
      message: "પ્રશ્નનો ઉત્તર મેળવવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો."
    });
  }
};
