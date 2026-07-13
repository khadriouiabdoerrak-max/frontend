export type Product = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  shortDescriptionAr: string;
  descriptionAr: string;
  price: number;
  compareAtPrice?: number;
  isBundle: boolean;
  image?: string;
  usageImage?: string;
  resultImage?: string;
  rating: number;
  benefits: string[];
  howToUse: string;
  ingredients: string[];
  suitableFor?: string[];
  usageSteps?: string[];
  proTips?: string[];
  expectedResults?: string[];
  routineNote?: string;
  step?: number;
  stepLabel?: string;
};

export const products: Product[] = [
  {
    id: "repair-hair-shampoo",
    slug: "repair-hair-shampoo",
    nameEn: "Oxyprime Repair Hair Shampoo",
    nameAr: "شامبو OXIPRIME لإصلاح الشعر",
    shortDescriptionAr: "تنظيف لطيف للشعر الجاف والمتضرر دون إحساس بالجفاف.",
    descriptionAr:
      "وداعا للشعر الجاف والمتضرر. شامبو OXIPRIME الاحترافي مصمم لتنظيف الشعر بلطف مع الحفاظ على زيوته الطبيعية. تساعد تركيبته الغنية على إنعاش الشعر والعناية بالتلف الناتج عن الصباغة أو الحرارة.",
    price: 199,
    isBundle: false,
    image: "/images/oxiprime-shampoo-realistic.png",
    usageImage: "/images/oxiprime-shampoo-use-realistic.png",
    resultImage: "/images/oxiprime-smooth-hair-result.png",
    rating: 4.8,
    step: 1,
    stepLabel: "ينظف بلطف",
    benefits: [
      "ينظف بلطف دون تجفيف الشعر",
      "يمنح الشعر إحساسا بالحيوية",
      "مناسب كبداية لروتين العناية بالشعر المتضرر",
    ],
    suitableFor: [
      "الشعر الجاف والمتضرر من الحرارة أو الصباغة",
      "الشعر اللي كيتوسخ بسرعة ولكن كينشف من الشامبوهات القوية",
      "اللي بغا يبدأ روتين إصلاح وترطيب بطريقة لطيفة",
    ],
    usageSteps: [
      "بللي الشعر مزيان بالماء الدافئ.",
      "ضعي كمية مناسبة ففروة الرأس وطوليها للأطراف بالرغوة.",
      "دلكي بلطف دقيقة أو جوج بلا فرك قوي.",
      "اشطفي مزيان وكملي بالبلسم باش يتحبس الترطيب.",
    ],
    proTips: [
      "إلى كان الشعر دهني من الجذور، ركزي الشامبو على الفروة وخلي الأطراف تاخذ غير الرغوة.",
      "ما تستعمليش ماء سخون بزاف باش ما يزيدش الجفاف.",
    ],
    expectedResults: [
      "شعر نقي وخفيف بلا إحساس بالقساوة",
      "تحضير الشعر باش يستافد أكثر من البلسم والماسك",
      "إحساس بنعومة أوضح مع الاستعمال المنتظم",
    ],
    routineNote:
      "الشامبو هو الخطوة الأولى: كينظف وكيحضّر الشعر باش البلسم والماسك يخدمو مزيان.",
    howToUse:
      "ضعي كمية مناسبة على شعر مبلل، دلكي فروة الرأس بلطف حتى تظهر الرغوة، ثم اشطفي جيدا بالماء.",
    ingredients: ["كيراتين", "كولاجين", "زيت الأركان"],
  },
  {
    id: "repair-hair-conditioner",
    slug: "repair-hair-conditioner",
    nameEn: "Oxyprime Repair Hair Conditioner",
    nameAr: "بلسم OXIPRIME للترطيب والنعومة",
    shortDescriptionAr: "بلسم يرطب الشعر ويسهل التسريح ويمنحه ملمسا ناعما.",
    descriptionAr:
      "أكملي روتين العناية بشعركِ مع بلسم OXIPRIME الذي يوفر ترطيبا عميقا ويساعد على فك التشابك. يعمل على تنعيم الشعر ومنحه لمعانا جميلا مع إحساس حريري بعد الغسل.",
    price: 199,
    isBundle: false,
    image: "/images/oxiprime-conditioner-realistic.png",
    usageImage: "/images/oxiprime-conditioner-use-realistic.png",
    resultImage: "/images/oxiprime-smooth-hair-result.png",
    rating: 4.8,
    step: 2,
    stepLabel: "يرطب ويفك التشابك",
    benefits: [
      "يساعد على فك التشابك",
      "يرطب الشعر بعمق",
      "يقلل مظهر التقصف والجفاف",
    ],
    suitableFor: [
      "الشعر اللي كيتشابك بسرعة بعد الغسيل",
      "الأطراف الجافة والمنفوشة",
      "اللي بغا نعومة يومية بلا ما يثقل الشعر",
    ],
    usageSteps: [
      "بعد الشامبو، عصري الشعر شوية من الماء الزائد.",
      "ضعي البلسم من الوسط حتى الأطراف وتجنبي الجذور.",
      "خليه من دقيقتين حتى 3 دقايق.",
      "سرحي بالأصابع أو مشط واسع ثم اشطفي مزيان.",
    ],
    proTips: [
      "إلى كان شعرك خفيف، استعملي كمية صغيرة وركزي غير على الأطراف.",
      "لنتيجة أنعم، خليه دقيقة إضافية فالأطراف الجافة.",
    ],
    expectedResults: [
      "تسريح أسهل بعد الغسيل",
      "ملمس أنعم وأقل نفشة",
      "أطراف باينة مرطبة أكثر",
    ],
    routineNote:
      "البلسم هو الخطوة الثانية: كيغلق الترطيب بعد الشامبو وكيخلي الشعر أسهل فالتسريح.",
    howToUse:
      "بعد الشامبو، ضعي البلسم على أطراف الشعر مع تجنب الجذور، اتركيه من دقيقتين إلى ثلاث دقائق، ثم اشطفيه.",
    ingredients: ["كولاجين", "زيت الجوجوبا", "كيراتين"],
  },
  {
    id: "deep-conditioning-repair-mask",
    slug: "deep-conditioning-repair-mask",
    nameEn: "Oxyprime Professional Deep Conditioning Repair Hair Mask",
    nameAr: "ماسك OXIPRIME الاحترافي للتغذية المكثفة",
    shortDescriptionAr: "عناية أسبوعية مكثفة للشعر الجاف، الباهت، والمتقصف.",
    descriptionAr:
      "عناية الصالون داخل بيتكِ. ماسك OXIPRIME هو حل مكثف للشعر الجاف والهش. تركيبته الغنية تساعد على تغذية ألياف الشعر، تقويته، ومنحه مرونة ولمعانا ملحوظين.",
    price: 199,
    isBundle: false,
    image: "/images/oxiprime-mask-realistic.png",
    usageImage: "/images/oxiprime-mask-use-realistic.png",
    resultImage: "/images/oxiprime-smooth-hair-result.png",
    rating: 4.9,
    step: 3,
    stepLabel: "يغذي بعمق",
    benefits: [
      "تغذية مكثفة للشعر الجاف والمتقصف",
      "عناية عميقة داخل بيتكِ",
      "يمنح لمعانا وملمسا أكثر نعومة",
    ],
    suitableFor: [
      "الشعر الجاف بزاف أو اللي فقد اللمعان",
      "الشعر المتضرر من الصباغة، السشوار أو البلاكة",
      "الأطراف المتقصفة والمظهر الباهت",
    ],
    usageSteps: [
      "استعمليه بعد الشامبو على شعر نظيف ومبلل.",
      "وزعيه من الوسط حتى الأطراف بكمية كافية.",
      "خليه من 10 حتى 15 دقيقة.",
      "اشطفي مزيان، ومن بعد تقدري ديري شوية بلسم إذا شعرك كيتشابك بزاف.",
    ],
    proTips: [
      "مرة فالأسبوع كافية للشعر العادي، ومرتين للشعر الجاف بزاف.",
      "غطي الشعر بفوطة دافئة باش تحسي بعناية أعمق.",
    ],
    expectedResults: [
      "نعومة ولمعان أوضح",
      "إحساس بالشعر مغذي ومتماسك",
      "نقصان مظهر الجفاف والتقصف مع الاستمرار",
    ],
    routineNote:
      "الماسك هو العناية الأسبوعية المركزة: دخليه فالروتين مرة أو جوج فالاسبوع حسب جفاف الشعر.",
    howToUse:
      "استعمليه مرة أو مرتين في الأسبوع. ضعيه على شعر نظيف ومبلل، اتركيه من 10 إلى 15 دقيقة. يفضل تغطية الشعر بفوطة دافئة، ثم اشطفيه.",
    ingredients: ["كيراتين", "كولاجين", "زيت الأركان", "زيت الجوجوبا"],
  },
  {
    id: "thermal-keratin-hair-serum",
    slug: "thermal-keratin-hair-serum",
    nameEn: "OXIPRIME Thermal Keratin Hair Serum with Natural Oils",
    nameAr: "سيروم OXIPRIME بالكيراتين والزيوت الطبيعية",
    shortDescriptionAr:
      "لمسة نهائية للحماية من الحرارة، تقليل النفشة، وإضافة اللمعان.",
    descriptionAr:
      "اللمسة النهائية التي يحتاجها شعركِ. سيروم OXIPRIME الحراري غني بالكيراتين، الكولاجين، زيت الأركان، وزيت الجوجوبا. يساعد على حماية الشعر من حرارة السشوار والبلاكة، تقليل النفشة، ومنح لمعان جميل دون مظهر دهني.",
    price: 199,
    isBundle: false,
    image: "/images/oxiprime-serum-realistic.png",
    usageImage: "/images/oxiprime-serum-use-realistic.png",
    resultImage: "/images/oxiprime-smooth-hair-result.png",
    rating: 4.9,
    step: 4,
    stepLabel: "يحمي ويضيف اللمعان",
    benefits: [
      "حماية من الحرارة والسشوار",
      "ترطيب ولمعان دون مظهر دهني",
      "يساعد على تقليل التكسر ومظهر النفشة",
      "مناسب قبل السشوار أو بعده",
    ],
    suitableFor: [
      "الشعر اللي كيتنفش بعد السشوار أو مع الرطوبة",
      "الأطراف الجافة اللي كتحتاج لمسة لمعان",
      "اللي كيتستعمل السشوار أو البلاكة وكيحتاج حماية",
    ],
    usageSteps: [
      "ضعي قطرتين حتى 4 قطرات حسب طول الشعر.",
      "فركيه بين اليدين ثم مرريه على الأطراف والطول.",
      "استعمليه قبل السشوار للحماية أو بعده للمعان.",
      "تجنبي الجذور باش ما يبانش الشعر دهني.",
    ],
    proTips: [
      "بداي بكمية صغيرة وزيدي غير إذا احتاج الشعر.",
      "ديريه فالأطراف يوميا إلى كان الشعر جاف، خصوصا قبل الخروج.",
    ],
    expectedResults: [
      "لمعان فوري ولمسة ناعمة",
      "نفشة أقل ومظهر مرتب",
      "حماية إضافية قبل الحرارة",
    ],
    routineNote:
      "السيروم هو اللمسة الأخيرة: كيكمل الروتين باللمعان والحماية خصوصا قبل أو بعد السشوار.",
    howToUse:
      "ضعي بضع قطرات في راحة يدكِ، ثم مرريها على أطراف الشعر المبلل أو الجاف. استعمليه قبل السشوار للحماية أو بعده للمعان.",
    ingredients: ["كيراتين", "كولاجين", "زيت الأركان", "زيت الجوجوبا"],
  },
];

export const bundleProduct: Product = {
  id: "complete-hair-repair-kit",
  slug: "complete-hair-repair-kit",
  nameEn: "Oxyprime Complete Hair Repair Kit",
  nameAr: "روتين OXIPRIME الكامل لإصلاح الشعر",
  shortDescriptionAr:
    "الروتين الاحترافي الكامل: شامبو + بلسم + ماسك + سيروم كيراتين.",
  descriptionAr:
    "اعتني بشعركِ مع الروتين الاحترافي الكامل من OXIPRIME. هذا العرض يجمع كل ما يحتاجه الشعر ليبدو أكثر قوة، ترطيبا، ونعومة: شامبو، بلسم، ماسك وسيروم كيراتين.",
  price: 599,
  compareAtPrice: 796,
  isBundle: true,
  rating: 4.9,
  benefits: [
    "4 منتجات روتين متكامل في باك واحد",
    "توفير 197 درهم مقارنة بالشراء الفردي",
    "أفضل نتيجة عند استعمال الروتين كاملا",
  ],
  howToUse:
    "استعملي الشامبو أولا، ثم البلسم، ثم الماسك مرة أو مرتين في الأسبوع، وأنهي بالسيروم قبل أو بعد السشوار.",
  ingredients: ["كيراتين", "كولاجين", "زيت الأركان", "زيت الجوجوبا"],
};

export const allProducts = [...products, bundleProduct];

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getStarsDisplay(rating: number): string {
  return "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "");
}
