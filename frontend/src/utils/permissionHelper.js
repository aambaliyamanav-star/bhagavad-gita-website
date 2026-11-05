// =====================================================
// BHAGAVAD GITA - ROLE & PERMISSIONS HELPER
// =====================================================

export const SUPER_ADMIN_EMAIL = "gitagyanm700@gmail.com";

export const PERMISSION_KEYS = {
  MANAGE_SHLOKS: "manage_shloks",
  MANAGE_QUIZ: "manage_quiz",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_FEEDBACKS: "manage_feedbacks",
  MANAGE_USERS: "manage_users",
  MANAGE_ADMINS: "manage_admins",
};

export const ALL_PERMISSIONS = [
  {
    id: "manage_shloks",
    nameGu: "શ્લોક સંચાલન",
    nameHi: "श्लोक प्रबंधन",
    nameEn: "Manage Shlokas",
    descGu: "નવા શ્લોક ઉમેરવા, સુધારવા, ડિલીટ કરવા અને સંસ્કૃત ઑડિયો જનરેટ કરવો.",
    descHi: "नए श्लोक जोड़ना, संपादित करना, हटाना और संस्कृत ऑडियो जनरेट करना।",
    descEn: "Add, edit, delete shlokas and generate Sanskrit neural recitation audio.",
    category: "content",
  },
  {
    id: "manage_quiz",
    nameGu: "ક્વિઝ સંચાલન",
    nameHi: "क्विज़ प्रबंधन",
    nameEn: "Manage Quiz",
    descGu: "ક્વિઝ પ્રશ્નો ઉમેરવા, સુધારવા અને યુઝર્સના પ્રશ્નો મંજૂર કરવા.",
    descHi: "क्विज़ प्रश्न जोड़ना, संपादित करना और उपयोगकर्ताओं के प्रश्न स्वीकृत करना।",
    descEn: "Add, edit, delete quiz questions and approve user community submissions.",
    category: "content",
  },
  {
    id: "view_analytics",
    nameGu: "ટ્રાફિક અને એનાલિટિક્સ",
    nameHi: "ट्रैफ़िक और एनालिटिक्स",
    nameEn: "Traffic & Analytics",
    descGu: "વેબસાઇટ & એપ મુલાકાતીઓ, લાઈવ યુઝર્સ અને ડિવાઇસ આંકડા જોવા.",
    descHi: "वेबसाइट और ऐप विज़िटर्स, लाइव उपयोगकर्ता और डिवाइस आंकड़े देखना।",
    descEn: "View website & mobile app traffic, live visitors, devices, and retention trends.",
    category: "analytics",
  },
  {
    id: "manage_feedbacks",
    nameGu: "યુઝર પ્રતિસાદ (Feedbacks)",
    nameHi: "उपयोगकर्ता फ़ीडबैक",
    nameEn: "User Feedbacks",
    descGu: "યુઝર્સના રિવ્યુ, રેટિંગ્સ અને સંદેશા વાંચવા તથા ડિલીટ કરવા.",
    descHi: "उपयोगकर्ताओं की समीक्षाएं, रेटिंग और संदेश पढ़ना तथा हटाना।",
    descEn: "Read user reviews, star ratings, and delete inappropriate feedbacks.",
    category: "community",
  },
  {
    id: "manage_users",
    nameGu: "યુઝર્સ સંચાલન",
    nameHi: "उपयोगकर्ता प्रबंधन",
    nameEn: "Manage Users",
    descGu: "રજીસ્ટર્ડ યુઝર્સની યાદી જોવી અને યુઝર એકાઉન્ટ ડિલીટ કરવું.",
    descHi: "पंजीकृत उपयोगकर्ताओं की सूची देखना और खाता हटाना।",
    descEn: "View registered user details and delete registered accounts.",
    category: "users",
  },
  {
    id: "manage_admins",
    nameGu: "એડમિન પરમિશન્સ સંચાલન",
    nameHi: "एडमिन अनुमति प्रबंधन",
    nameEn: "Manage Admins & Roles",
    descGu: "અન્ય યુઝર્સને એડમિન બનાવવા અને તેમની પરમિશન કંટ્રોલ કરવી.",
    descHi: "अन्य उपयोगकर्ताओं को एडमिन बनाना और उनकी अनुमतियाँ नियंत्रित करना।",
    descEn: "Grant admin access to other users and configure granular permissions.",
    category: "security",
  },
];

/**
 * Checks if the user is the primary Super Admin (Master Admin)
 */
export function isSuperAdminUser(user) {
  if (!user) return false;
  if (user.isSuperAdmin === true) return true;
  if (user.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  return false;
}

/**
 * Checks if the user has a specific permission
 */
export function hasPermission(user, permissionKey) {
  if (!user) return false;
  if (user.role !== "admin") return false;

  // Super Admin always has 100% access to all permissions
  if (isSuperAdminUser(user)) return true;

  // If user has specific permissions array
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(permissionKey);
  }

  // Fallback for legacy admin
  return true;
}

/**
 * Returns human-readable label for a permission key
 */
export function getPermissionLabel(key, lang = "gu") {
  const perm = ALL_PERMISSIONS.find((p) => p.id === key);
  if (!perm) return key;
  if (lang === "hi") return perm.nameHi;
  if (lang === "en") return perm.nameEn;
  return perm.nameGu;
}
