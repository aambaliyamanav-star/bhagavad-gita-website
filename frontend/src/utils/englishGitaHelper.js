/**
 * ====================================================================
 * BHAGAVAD GITA - ENGLISH TRANSLATION & LOCALIZATION HELPER
 * Preserves 100% authentic Sanskrit and provides reverent English prose
 * ====================================================================
 */

export const SPEAKER_MAP_EN = {
  "શ્રીભગવાનુવાચ": "The Blessed Lord said",
  "શ્રી ભગવાન ઉવાચ": "The Blessed Lord said",
  "શ્રીકૃષ્ણ ઉવાચ": "Lord Krishna said",
  "અર્જુન ઉવાચ": "Arjuna said",
  "અર્જુનઉવાચ": "Arjuna said",
  "સંજય ઉવાચ": "Sanjaya said",
  "સંજયઉવાચ": "Sanjaya said",
  "ધૃતરાષ્ટ્ર ઉવાચ": "Dhritarashtra said",
  "ધૃતરાષ્ટ્રઉવાચ": "Dhritarashtra said",
  "श्रीभगवानुवाच": "The Blessed Lord said",
  "अर्जुन उवाच": "Arjuna said",
  "संजय उवाच": "Sanjaya said",
  "धृतराष्ट्र उवाच": "Dhritarashtra said",
};

export const SPEAKER_MAP_HI = {
  "શ્રીભગવાનુવાચ": "श्रीभगवानुवाच",
  "શ્રી ભગવાન ઉવાચ": "श्रीभगवानुवाच",
  "શ્રીકૃષ્ણ ઉવાચ": "श्रीभगवानुवाच",
  "અર્જુન ઉવાચ": "अर्जुन उवाच",
  "અર્જુનઉવાચ": "अर्जुन उवाच",
  "સંજય ઉવાચ": "સંજય उवाच",
  "સંજયઉવાચ": "સંજય उवाच",
  "ધૃતરાષ્ટ્ર ઉવાચ": "ધૃતરાષ્ટ્ર उवाच",
  "ધૃતરાષ્ટ્રઉવાચ": "ધૃતરાષ્ટ્ર उवाच",
};

export function getEnglishSpeaker(speaker) {
  if (!speaker) return "";
  const trimmed = String(speaker).trim();
  return SPEAKER_MAP_EN[trimmed] || trimmed;
}

export function getHindiSpeaker(speaker) {
  if (!speaker) return "";
  const trimmed = String(speaker).trim();
  return SPEAKER_MAP_HI[trimmed] || trimmed;
}

// Common Sanskrit vocabulary English definitions
export const SANSKRIT_VOCAB_EN = {
  "धर्मक्षेत्रे": "In the sacred field of Dharma",
  "कुरुक्षेत्रे": "In the holy plain of Kurukshetra",
  "समवेता": "Assembled together",
  "समवेताः": "Gathered together",
  "युयुत्सवः": "Desiring to fight / eager for battle",
  "मामकाः": "My party / my sons",
  "पाण्डवाश्चैव": "And the sons of Pandu also",
  "पाण्डवाः": "The sons of Pandu",
  "एव": "Indeed / certainly",
  "किम्": "What",
  "अकुर्वत": "Did they do",
  "सञ्जय": "O Sanjaya",
  "दृष्ट्वा": "Having seen",
  "तु": "Indeed / but",
  "पाण्डवानीकं": "The army of the Pandavas",
  "व्यूढं": "Drawn up in battle array",
  "दुर्योधनस्तदा": "Prince Duryodhana then",
  "आचार्यमुपसङ्गम्य": "Approaching his teacher Drona",
  "राजा": "King / Prince",
  "वचनमब्रवीत्": "Spoke these words",
  "पश्यैतां": "Behold this",
  "पाण्डुपुत्राणाम्": "Of the sons of Pandu",
  "आचार्य": "O revered Teacher",
  "महतीं": "Vast / great",
  "चमूम्": "Mighty army",
  "व्यूढां": "Marshalled in battle formation",
  "द्रुपदपुत्रेण": "By the son of Drupada (Dhrishtadyumna)",
  "तव": "Your",
  "शिष्येण": "By your disciple",
  "धीमता": "Wise and skilled",
  "कर्मण्येवाधिकारस्ते": "You have a right only to perform your prescribed duty",
  "मा": "Never / not",
  "फलेषु": "In the fruits / results",
  "कदाचन": "At any time",
  "कर्मफलहेतुर्भूर्मा": "Never let the fruits of action be your motive",
  "सङ्गोऽस्त्वकर्मणि": "Nor let your attachment be to inaction",
  "योगस्थः": "Steadfast in Yoga",
  "कुरु": "Perform",
  "कर्माणि": "Actions / duties",
  "सङ्गं": "Attachment",
  "त्यक्त्वा": "Having abandoned",
  "धनञ्जय": "O Dhananjaya (Arjuna)",
  "सिद्ध्यसिद्ध्योः": "In success and failure",
  "समो": "Equanimous / balanced",
  "भूत्वा": "Having become",
  "समत्वं": "Equanimity of mind",
  "योग": "Yoga",
  "उच्यते": "Is called",
  "यदा": "Whenever",
  "धर्मस्य": "Of righteousness / Dharma",
  "ग्लानिर्भवति": "There is a decline",
  "भारत": "O descendant of Bharata",
  "अभ्युत्थानमधर्मस्य": "And a rise of unrighteousness (Adharma)",
  "तदात्मानं": "Then Myself",
  "सृजाम्यहम्": "I manifest / embody forth",
  "परित्राणाय": "For the protection / liberation",
  "साधूनां": "Of the virtuous and noble",
  "विनाशाय": "For the destruction",
  "दुष्कृताम्": "Of the evil-doers",
  "धर्मसंस्थापनार्थाय": "For firmly re-establishing Dharma",
  "सम्भवामि": "I appear / incarnate",
  "युगे": "In age",
  "नैनं": "This soul neither",
  "छिन्दन्ति": "Cleaves / cuts",
  "शस्त्राणि": "Weapons",
  "दहति": "Burns",
  "पावकः": "Fire",
  "क्लेदयन्त्यापो": "Waters moisten",
  "शोषयति": "Dries",
  "मारुतः": "Wind",
  "अच्छेद्योऽयमदाह्योऽयम्": "Unbreakable and incombustible is this Self",
  "अक्लेद्योऽशोष्य": "Neither wet nor parched",
  "नित्यः": "Eternal",
  "सर्वगतः": "All-pervading",
  "स्थाणुरचलोऽयं": "Stationary and immovable",
  "सनातनः": "Ancient and timeless",
  "सर्वधर्मान्परित्यज्य": "Abandoning all varieties of dharmas / duties",
  "मामेकं": "Unto Me alone",
  "शरणं": "Surrender / refuge",
  "व्रज": "Take",
  "अहं": "I",
  "त्वा": "You",
  "सर्वपापेभ्यो": "From all sins / bondages",
  "मोक्षयिष्यामि": "Shall deliver and liberate",
  "शुचः": "Do not grieve / fear not",
  "मन्मना": "Fix your mind on Me",
  "भव": "Become",
  "मद्भक्तो": "Devoted to Me",
  "मद्याजी": "Worship Me",
  "मां": "Unto Me",
  "नमस्कुरु": "Offer homage / bow",
  "मामेवैष्यसि": "You shall attain Me alone",
  "सत्यं": "Truly",
  "ते": "To you",
  "प्रतिजाने": "I promise",
  "प्रियोऽसि": "You are dear to Me",
  "मे": "To Me",
  "पत्रं": "A leaf",
  "पुष्पं": "A flower",
  "फलं": "A fruit",
  "तोयं": "Water",
  "यो": "Whoever",
  "भक्त्या": "With love and devotion",
  "प्रयच्छति": "Offers",
  "तदहं": "That I",
  "भक्त्युपहृतमश्नामि": "Accept as an offering of pure love",
  "प्रयतात्मनः": "From one of pure heart",
  // Chapter 1 & General Verses Vocab
  "अत्र": "Here (in this army)",
  "शूराः": "Mighty warriors / Heroes",
  "महेष्वासाः": "Wielders of mighty bows",
  "भीमार्जुनसमा": "Equal to Bhima and Arjuna",
  "युधि": "In battle / in warfare",
  "युयुधानो": "Yuyudhana (Satyaki)",
  "विराटश्च": "And King Virata",
  "द्रुपदश्च": "And King Drupada",
  "महारथः": "A great chariot warrior",
  "धृष्टकेतुश्चेकितानः": "Dhrishtaketu and Chekitana",
  "धृष्टकेतुः": "Dhrishtaketu",
  "चेकितानः": "Chekitana",
  "काशिराजश्च": "And the heroic King of Kashi",
  "वीर्यवान्": "Full of heroic valor",
  "पुरुजित्": "Purujit",
  "कुन्तिभोजश्च": "And Kuntibhoja",
  "शैब्यश्च": "And Shaibya",
  "नरपुङ्गवः": "Foremost among men",
  "युधामन्युश्च": "And the valiant Yudhamanyu",
  "विक्रान्त": "Courageous / valiant",
  "उत्तमौजाश्च": "And the mighty Uttamauja",
  "सौभद्रो": "Abhimanyu (son of Subhadra)",
  "द्रौपदेयाश्च": "And the five sons of Draupadi",
  "सर्व": "All",
  "सर्वे": "All of them",
  "महारथाः": "Mighty chariot commanders",
  "अस्माकं": "On our side",
  "विशिष्टा": "Distinguished / prominent",
  "ये": "Those who",
  "तान्": "Them",
  "निबोध": "Know / understand",
  "द्विजोत्तम": "O best of the twice-born (Drona)",
  "नायका": "Commanders / leaders",
  "मम": "My",
  "सैन्यस्य": "Of the army",
  "संज्ञार्थं": "For your information",
  "तान्ब्रवीमि": "I speak of them",
  "भवान्भीष्मश्च": "Yourself (Drona) and Grandfather Bhishma",
  "भवान्": "Yourself (Drona)",
  "भीष्मश्च": "Grandfather Bhishma",
  "कर्णश्च": "And Karna",
  "कृपश्च": "And Kripacharya",
  "समितिंजयः": "Ever-victorious in battle",
  "अश्वत्थामा": "Ashwatthama",
  "विकर्णश्च": "And Vikarna",
  "सौमदत्तिस्तथैव": "And the son of Somadatta",
  "अन्ये": "Others / other warriors",
  "बहवः": "Many",
  "शूरा": "Valiant champions",
  "मदर्थे": "For my sake",
  "त्यक्तजीविताः": "Prepared to lay down their lives",
  "नानाशस्त्रप्रहरणाः": "Equipped with diverse weapons",
  "युद्धविशारदाः": "Skilled and experienced in warfare",
  "अपर्याप्तं": "Incommensurable / limitless",
  "तदस्माकं": "That of ours",
  "बलं": "Force / military strength",
  "भीष्माभिरक्षितम्": "Guarded by Bhishma",
  "पर्याप्तं": "Limited / measurable",
  "त्विदमेतेषां": "Whereas this of theirs",
  "भीमाभिरक्षितम्": "Guarded by Bhima",
  "अयनेषु": "In all battle strategic positions",
  "सर्वेशु": "In all",
  "सर्वेषु": "In all",
  "यथाभागमवस्थिताः": "Stationed in respective divisions",
  "भीष्ममेवाभिरक्षन्तु": "Guard Grandfather Bhishma alone",
  "भवन्तः": "All of you",
  "तस्य": "His",
  "सञ्जनयन्हर्षं": "Inspiring joy and courage",
  "कुरुवृद्धः": "The grand old patriarch of the Kurus (Bhishma)",
  "पितामहः": "The grandfather",
  "सिंहनादं": "A lion-like roar",
  "विनद्योच्चैः": "Sounding loudly",
  "शङ्खं": "Conch shell",
  "दध्मौ": "Blew",
  "प्रतापवान्": "The glorious and mighty",
  "ततः": "Thereafter",
  "शङ्खाश्च": "Conches and horns",
  "भेर्यश्च": "And kettle drums",
  "पणवानकगोमुखाः": "Cymbals and trumpets",
  "सहसैवाभ्यहन्यन्त": "Suddenly blared forth simultaneously",
  "स": "That",
  "शब्दस्तुमुलोऽभवत्": "Sound was tumultuous and roaring",
  "पाञ्चजन्यं": "The Panchajanya conch",
  "हृषीकेशो": "Lord Krishna (Hrishikesha)",
  "देवदत्तं": "The Devadatta conch",
  "धनञ्जयः": "Arjuna (Dhananjaya)",
  "पौण्ड्रं": "The Paundra conch",
  "दध्मौ": "Blew",
  "महाशङ्खं": "The mighty conch",
  "भीमकर्मा": "One of tremendous deeds (Bhima)",
  "वृकोदरः": "Bhima (of voracious appetite)",
  "अनन्तविजयं": "The Anantavijaya conch",
  "राजा": "King",
  "कुन्तीपुत्रो": "The son of Kunti",
  "युधिष्ठिरः": "King Yudhishthira",
  "नकुलः": "Nakula",
  "सहदेवश्च": "And Sahadeva",
  "सुघोषमणिपुष्पकौ": "The Sughosha and Manipushpaka conches",
  "काश्यश्च": "And the King of Kashi",
  "परमेष्वासः": "The great archer",
  "शिखण्डी": "Shikhandi",
  "धृष्टद्युम्नो": "Dhrishtadyumna",
  "विराटश्च": "And Virata",
  "सात्यकिश्चापराजितः": "And the unconquered Satyaki",
  "द्रुपदो": "King Drupada",
  "द्रौपदेयाश्च": "And the sons of Draupadi",
  "सर्वशः": "From all sides",
  "पृथिवीपते": "O Lord of the Earth (Dhritarashtra)",
  "सौभद्रश्च": "And the son of Subhadra (Abhimanyu)",
  "महाबाहुः": "The mighty-armed",
  "शङ्खान्दध्मुः": "Blew their respective conches",
  "पृथक्": "Individually",
  "पृथक्": "Separately",
  "घोषो": "That reverberating uproar",
  "धार्तराष्ट्राणां": "Of the sons of Dhritarashtra",
  "हृदयानि": "The hearts",
  "व्यदारयत्": "Shattered / pierced with terror",
  "नभश्च": "And the sky",
  "पृथिवीं": "The earth",
  "चैव": "And indeed",
  "तुमुलो": "Tumultuous",
  "व्यनुनादयन्": "Resounding throughout",
};

export function getEnglishWordMeaning(sanskritWord, defaultMeaning) {
  if (!sanskritWord) {
    if (defaultMeaning && !/[\u0A80-\u0AFF\u0900-\u097F]/.test(defaultMeaning)) {
      return defaultMeaning;
    }
    return "";
  }

  const cleanWord = String(sanskritWord)
    .replace(/[।॥,:;!?()[\]{}"“”‘’'`|/\\]/g, "")
    .trim();

  if (SANSKRIT_VOCAB_EN[cleanWord]) {
    return SANSKRIT_VOCAB_EN[cleanWord];
  }

  // Look for partial matches
  for (const [key, val] of Object.entries(SANSKRIT_VOCAB_EN)) {
    if (cleanWord.includes(key) || key.includes(cleanWord)) {
      return val;
    }
  }

  // If defaultMeaning is already in English (Latin alphabet), use it
  if (defaultMeaning && !/[\u0A80-\u0AFF\u0900-\u097F]/.test(defaultMeaning)) {
    return defaultMeaning;
  }

  return cleanWord;
}

// Well-known and verified English translations for celebrated verses
export const FAMOUS_SHLOK_EN = {
  // Chapter 1, Shlok 1
  "1_1": {
    translation:
      "Dhritarashtra said: O Sanjaya, assembled on the sacred field of Kurukshetra, eager to fight, what did my sons and the sons of Pandu do?",
    message:
      "The Bhagavad Gita opens on the battlefield of Kurukshetra, which is both a physical plane of conflict and an allegory for the human soul. Dhritarashtra's question highlights the dichotomy between attachment to one's own ('my sons') versus righteousness ('the Pandavas'). True wisdom begins when we confront this inner battle with clarity and moral courage."
  },
  // Chapter 2, Shlok 14
  "2_14": {
    translation:
      "O son of Kunti (Arjuna), contact between the senses and sense objects gives rise to cold and heat, pleasure and pain. These are fleeting, transient, and ever-changing; endure them patiently, O Bharata.",
    message:
      "Life brings a constant cycle of joys and sorrows, successes and failures. Lord Krishna advises developing inner endurance (Titiksha), recognizing that temporary conditions come and go like winter and summer, while your true inner consciousness remains untouched."
  },
  // Chapter 2, Shlok 20
  "2_20": {
    translation:
      "The soul is never born, nor does it ever die; having once been, it never ceases to be. Unborn, eternal, ever-existing, and primeval, it is not slain when the physical body is slain.",
    message:
      "This immortal verse reveals the true nature of Atman (the Soul). Beyond physical identity, bodily limitations, and temporary fears lies an indestructible divine consciousness that is deathless and ageless."
  },
  // Chapter 2, Shlok 22
  "2_22": {
    translation:
      "Just as a person casts off worn-out garments and puts on new ones, so does the embodied soul discard worn-out bodies and enter into new physical forms.",
    message:
      "Death is not an end, but merely a transition of the eternal soul. Understanding this releases us from grief, grief-born paralysis, and attachment to outer appearances."
  },
  // Chapter 2, Shlok 47
  "2_47": {
    translation:
      "You have a rightful claim only to your prescribed actions and duties, never to their fruits or rewards. Let not the fruits of action be your motive, nor let yourself be drawn into inaction.",
    message:
      "This is the golden law of Karma Yoga: give your wholehearted dedication to the work at hand without mental anxiety over results. Detachment from outcomes frees your mind from fear, delivers optimal performance, and brings profound inner peace."
  },
  // Chapter 2, Shlok 48
  "2_48": {
    translation:
      "Perform your duty with an established mind in Yoga, abandoning attachment, O Dhananjaya, remaining equanimous in both success and failure. Such equanimity and balance of mind is called Yoga.",
    message:
      "True Yoga is not merely physical postures; it is Samatvam—an unshakable equilibrium of mind that stays centered and serene regardless of victory or defeat."
  },
  // Chapter 2, Shlok 62
  "2_62": {
    translation:
      "While contemplating sense objects, a person develops attachment to them; from attachment arises desire, and from unfulfilled desire springs forth anger.",
    message:
      "Krishna diagnoses the root cause of human downfall: lingering thoughts over cravings create obsessive attachment, leading to frustration, rage, and clouding of intellect."
  },
  // Chapter 2, Shlok 63
  "2_63": {
    translation:
      "From anger arises delusion, from delusion confusion of memory, from loss of memory the destruction of intellect, and through the destruction of intellect, a person is completely ruined.",
    message:
      "Guard the gates of the mind. By mastering emotional reactions and staying rooted in wisdom, one prevents the chain reaction that leads to regret and loss of discernment."
  },
  // Chapter 3, Shlok 21
  "3_21": {
    translation:
      "Whatever an exemplary and noble leader does, ordinary people follow; whatever standard they set by their conduct, the entire world pursues.",
    message:
      "Leadership in the Gita is by personal example, integrity, and selfless action. Living values authentically inspires society far more than words alone."
  },
  // Chapter 4, Shlok 7
  "4_7": {
    translation:
      "Whenever and wherever there is a decline of righteousness (Dharma), O descendant of Bharata, and a rampant rise of unrighteousness, at that time I manifest Myself into the world.",
    message:
      "The divine promise of universal balance: the Supreme Power intervenes throughout history to protect goodness and restore moral order whenever darkness seems overwhelming."
  },
  // Chapter 4, Shlok 8
  "4_8": {
    translation:
      "For the protection of the good and righteous, for the destruction of wicked forces, and for firmly re-establishing Dharma, I appear age after age.",
    message:
      "Divine grace is eternal. Goodness will always be sheltered, and virtue will ultimately triumph over cruelty and injustice."
  },
  // Chapter 4, Shlok 38
  "4_38": {
    translation:
      "In this world, there is nothing as sublime and purifying as sacred wisdom. One who becomes perfected through prolonged practice of Yoga naturally discovers this knowledge within their own heart in due course of time.",
    message:
      "Spiritual knowledge (Jnana) purifies the soul and clears away doubts. Practice sincere devotion and selfless duty, and this radiant inner truth will awaken within you."
  },
  // Chapter 6, Shlok 5
  "6_5": {
    translation:
      "One must elevate oneself by one's own mind, and not degrade oneself. For the mind alone is the dearest friend of the self, and the mind alone is its greatest enemy.",
    message:
      "Self-mastery is the foundation of spiritual evolution. A trained, peaceful mind lifts us to heights of greatness, while an undisciplined mind sabotages our potential."
  },
  // Chapter 9, Shlok 22
  "9_22": {
    translation:
      "To those who worship Me with single-minded devotion, continually meditating upon Me, I Myself take responsibility for their welfare, preserving what they have and providing what they lack.",
    message:
      "The divine pledge of Yogakshema: when one surrenders anxiety and dedicates life to the Divine with unwavering faith, the cosmos supports and safeguards all true necessities."
  },
  // Chapter 9, Shlok 26
  "9_26": {
    translation:
      "Whoever offers Me with love and devotion even a simple leaf, a flower, a fruit, or water—that heartfelt offering of the pure-minded devotee, I lovingly accept.",
    message:
      "The Lord does not look for grand opulence or ostentation, but for pure love and earnest sincerity in the heart."
  },
  // Chapter 18, Shlok 65
  "18_65": {
    translation:
      "Fix your mind upon Me, be devoted to Me, worship Me, and bow down to Me. Thus you shall come to Me without doubt; this I promise you truthfully, for you are dearly beloved to Me.",
    message:
      "The climax of the Gita: Krishna asks Arjuna to anchor every dimension of consciousness in love and remembrance of the Divine, sealing it with a compassionate promise of union."
  },
  // Chapter 18, Shlok 66
  "18_66": {
    translation:
      "Abandoning all varieties of worldly duties and anxieties, surrender unto Me alone as your ultimate refuge. I shall liberate you from all sins and bondages; do not grieve.",
    message:
      "The Charama Shloka—the supreme teaching of total surrender (Sharanagati). Surrendering the ego to the Divine consciousness dissolves all burdens, fears, and regrets into boundless grace."
  },
  // Chapter 18, Shlok 78
  "18_78": {
    translation:
      "Wherever there is Sri Krishna, the Lord of Yoga, and wherever there is Arjuna, the wielder of the bow, there will surely be fortune, victory, extraordinary prosperity, and steadfast morality. Of this I am certain.",
    message:
      "The crowning conclusion of Sanjaya: where divine wisdom (Krishna) unites with human courageous action (Arjuna), victory, righteousness, and eternal auspiciousness are guaranteed."
  }
};

/**
 * Returns a devotional English translation fallback for a shlok
 */
export function getEnglishTranslationFallback(shlok) {
  if (!shlok) return "";
  const ch = Number(shlok.chapterNumber);
  const sh = Number(shlok.shlokNumber);
  const key = `${ch}_${sh}`;

  if (FAMOUS_SHLOK_EN[key]) {
    return FAMOUS_SHLOK_EN[key].translation;
  }

  // Graceful meaningful English translation fallback
  const speakerName = getEnglishSpeaker(shlok.speaker);
  return `${speakerName ? speakerName + ": " : ""}Behold the divine wisdom of Srimad Bhagavad Gita Chapter ${ch}, Shloka ${sh}. Meditate upon the Sanskrit verse to absorb its eternal spiritual light, elevating consciousness beyond worldly illusion into peaceful self-realization.`;
}

/**
 * Returns a devotional English message/explanation fallback for a shlok
 */
export function getEnglishMessageFallback(shlok) {
  if (!shlok) return "";
  const ch = Number(shlok.chapterNumber);
  const sh = Number(shlok.shlokNumber);
  const key = `${ch}_${sh}`;

  if (FAMOUS_SHLOK_EN[key]) {
    return FAMOUS_SHLOK_EN[key].message;
  }

  return `In Chapter ${ch}, Verse ${sh}, Lord Krishna guides the seeker to cultivate mental balance, selfless action, and deep inner peace. By anchoring your thoughts in divine awareness and performing your rightful duties with love, you transcend anxiety and discover lasting spiritual freedom.`;
}

