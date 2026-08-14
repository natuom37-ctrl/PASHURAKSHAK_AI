/**
 * PashuRakshak AI - Veterinary Help API Service
 * Manages nearby veterinary doctors, 24x7 emergency contacts, and care guides
 */

export const VetAPI = {
  /**
   * Get 24x7 Emergency Contact Information
   */
  getEmergencyContact() {
    return {
      title: '24x7 National Livestock Emergency Helpline',
      tollFree: '1800-425-1660',
      emergencyPhone: '+91 98230 45678',
      description: 'Immediate tele-veterinary assistance for critical livestock distress, viral outbreaks, and emergency trauma.',
      available: '24 Hours / 7 Days Available'
    };
  },

  /**
   * Get list of nearby veterinary doctors & clinics
   */
  getNearbyVets() {
    return [
      {
        id: 'vet-1',
        name: 'Dr. Ramesh Deshmukh (B.V.Sc & A.H)',
        clinic: 'Shri Krushna Livestock Care & Mobile Clinic',
        location: 'Pune Rural / Baramati Region',
        distance: '4.2 km away',
        phone: '+91 98224 11223',
        specialization: 'Cattle Infectious Diseases & Surgery',
        rating: 4.9,
        reviewsCount: 142,
        availability: 'Available Today (8:00 AM - 7:00 PM)',
        status: 'Open Now',
        emergencyServices: true,
        address: 'Plot 14, Agri Market Yard Road, Baramati'
      },
      {
        id: 'vet-2',
        name: 'Dr. Sunita Gaikwad (M.V.Sc)',
        clinic: 'Zilla Parishad Veterinary Polyclinic',
        location: 'Taluka Veterinary Hospital',
        distance: '7.8 km away',
        phone: '+91 94231 99887',
        specialization: 'Vaccination, Dairy Health & Nutrition',
        rating: 4.8,
        reviewsCount: 98,
        availability: 'Government Clinic (9:00 AM - 5:00 PM)',
        status: 'Open Now',
        emergencyServices: false,
        address: 'Near Old Bus Stand, Civil Hospital Road'
      },
      {
        id: 'vet-3',
        name: 'Dr. Anand Kulkarni (B.V.Sc)',
        clinic: 'Pashu Seva 24x7 Mobile Animal Ambulance',
        location: 'Satara - Pune Highway Belt',
        distance: '11.5 km away',
        phone: '+91 99750 33445',
        specialization: 'Emergency Trauma & Outbreak Containment',
        rating: 4.7,
        reviewsCount: 215,
        availability: '24x7 On-call Mobile Unit',
        status: 'Available On Call',
        emergencyServices: true,
        address: 'National Highway 48, Shirwal Bypass'
      },
      {
        id: 'vet-4',
        name: 'Dr. Vinod Jadhav (B.V.Sc)',
        clinic: 'Kisan Dairy Diagnostics & AI Centre',
        location: 'Haveli Dairy Corridor',
        distance: '15.0 km away',
        phone: '+91 98901 77665',
        specialization: 'Buffalo Reproduction & Herd Health',
        rating: 4.9,
        reviewsCount: 86,
        availability: 'Morning & Evening (7:00 AM - 11:00 AM, 4:00 PM - 8:00 PM)',
        status: 'Open Now',
        emergencyServices: false,
        address: 'Shop 3, Milk Collection Society, Uruli Kanchan'
      }
    ];
  },

  /**
   * Get livestock disease treatment & care guidelines
   */
  getCareGuidelines(lang = 'en') {
    if (lang === 'mr') {
      return [
        {
          id: 'fmd-guide',
          disease: 'लाळ्या-खुरकूत (FMD)',
          symptoms: ['तीव्र ताप', 'तोंडात व खुरांमध्ये फोड', 'तोंडातून लाळ गळणे', 'लंगडणे'],
          dos: [
            'जनावराचे तोंड १% पोटॅशियम परमँगनेट किंवा तुरटीच्या पाण्याने स्वच्छ धुवा',
            'खुरांमधील जखमांवर जंतुनाशक मलम व माशा बसू नयेत म्हणून तेल लावा',
            'पचायला हलकी लापशी किंवा मऊ चारा व गुळ-पाणी द्या',
            'आजारी जनावरास इतर जनावरांपासून ताबडतोब वेगळे बांधा आणि गोठ्यात चुना शिंपडा'
          ],
          donts: [
            'बाधित जनावरांना निरोगी कळपासोबत चरण्यासाठी सोडू नका',
            'लंगडणाऱ्या जनावरांना खडकाळ किंवा कठीण रस्त्यावरून चालवू नका',
            'आजारी जनावराचे दूध काढण्याचे भांडे निरोगी जनावरांसाठी वापरू नका'
          ]
        },
        {
          id: 'lsd-guide',
          disease: 'लंपी स्किन रोग (LSD)',
          symptoms: ['ताप', 'त्वचेवर २-५ सेमीच्या कडक गाठी (गाठी)', 'सुजलेल्या ग्रंथी', 'पायांवर सूज'],
          dos: [
            'बाधित जनावराला डास, माशा आणि गोचीडमुक्त स्वतंत्र गोठ्यात वेगळे ठेवा',
            'गोठ्यात कडुनिंबाच्या पानांचा धूर करा आणि हळद, कडुनिंब, खोबरेल तेलाचा लेप लावा',
            'डॉक्टरांच्या सल्ल्याने प्रतिकारशक्ती वाढवणारी जीवनसत्वे (व्हिटॅमिन E, बायोटिन) द्या',
            'जनावरास सतत स्वच्छ व इलेक्ट्रोलाइटयुक्त पिण्याचे पाणी उपलब्ध करून द्या'
          ],
          donts: [
            'त्वचेवरील गाठींना सुईने टोचू नका किंवा दाबू नका',
            'संसर्गग्रस्त भागातून जनावरांची इतर गावांत किंवा बाजारात वाहतूक करू नका',
            'निरोगी जनावरांचे गोटपॉक्स / लंपी प्रतिबंधक लसीकरण चुकवू नका'
          ]
        },
        {
          id: 'quarantine-guide',
          disease: 'गोठा जैवसुरक्षा व अलगीकरण',
          symptoms: ['कळपात नवीन जनावर आणणे', 'अचानक दुग्धोत्पादनात घट', 'संशयित संसर्ग'],
          dos: [
            'नवीन खरेदी केलेल्या जनावरांना किमान १४ ते २१ दिवस मुख्य कळपापासून वेगळे ठेवा',
            'गोठ्याच्या प्रवेशद्वारावर चुन्याची भुकटी किंवा पोटॅशियम परमँगनेटचे फूटबाथ ठेवा',
            'गोठा दररोज सकाळी व संध्याकाळी कोरडा व निर्जंतुक ठेवा'
          ],
          donts: [
            'अनोळखी व्यापारी किंवा बाहेरील वाहनांना गोठ्याच्या थेट आत येऊ देऊ नका',
            'संशयित मृत जनावरांची विल्हेवाट उघड्यावर न लावता खोल जमिनीत चुना टाकून पुरा'
          ]
        }
      ];
    }

    if (lang === 'hi') {
      return [
        {
          id: 'fmd-guide',
          disease: 'खुरपका-मुंहपका रोग (FMD)',
          symptoms: ['तेज़ बुखार', 'मुंह व खुरों में छाले/घाव', 'मुंह से लगातार लार टपकना', 'गंभीर लंगड़ापन'],
          dos: [
            'मुंह के छालों को १% पोटेशियम परमैंगनेट या फिटकरी के घोल से साफ़ करें',
            'खुरों के घावों पर रोगाणुरोधी मलहम व मक्खी-रोधी तेल लगाएं',
            'पचने में आसान दलिया, गुड़ का पानी व मुलायम चारा दें',
            'संक्रमित पशु को तुरंत अलग बाड़े में रखें और गोशाला को रोज़ाना विसंक्रमित करें'
          ],
          donts: [
            'संक्रमित पशुओं को स्वस्थ पशुओं के साथ चराने के लिए बाहर न भेजें',
            'लंगड़ा रहे पशुओं को पथरीले या पक्के रास्तों पर न चलाएं',
            'बीमार पशु के दूध के बर्तन या पानी के टब स्वस्थ पशुओं के साथ साझा न करें'
          ]
        },
        {
          id: 'lsd-guide',
          disease: 'लंपी स्किन रोग (LSD)',
          symptoms: ['बुखार', 'त्वचा पर २-५ सेमी की गोल गांठें', 'गले व जांघ की ग्रंथियों में सूजन', 'पैरों में सूजन'],
          dos: [
            'संक्रमित पशु को मच्छर, मक्खी व चींचड़ से सुरक्षित अलग बाड़े में रखें',
            'नीम की पत्तियों का धुआं करें तथा हल्दी, नीम व नारियल तेल का लेप लगाएं',
            'पशु चिकित्सक के परामर्श से रोग-प्रतिरोधक क्षमता बढ़ाने वाले विटामिन दें',
            'पशु के लिए हमेशा साफ़, ताज़ा व इलेक्ट्रोलाइटयुक्त पानी उपलब्ध रखें'
          ],
          donts: [
            'त्वचा पर उभरी गांठों को फोड़ें या दबाएं नहीं',
            'संक्रमित क्षेत्र से पशुओं को अन्य गांवों या हाट-बाज़ारों में न ले जाएं',
            'स्वस्थ पशुओं का गोट पॉक्स / एलएसडी टीकाकरण बिल्कुल न टालें'
          ]
        },
        {
          id: 'quarantine-guide',
          disease: 'गोशाला जैव-सुरक्षा एवं संगरोध (Quarantine)',
          symptoms: ['नया पशु झुंड में शामिल करना', 'अचानक दूध कम होना', 'संक्रामक बीमारी का संदेह'],
          dos: [
            'बाहर से खरीदे गए नए पशु को कम से कम १४ से २१ दिनों तक मुख्य झुंड से अलग रखें',
            'फार्म के मुख्य द्वार पर चूना अथवा पोटेशियम परमैंगनेट का फुटबाथ बनाएं',
            'गोशाला को प्रतिदिन विसंक्रमित व सूखा रखें'
          ],
          donts: [
            'अज्ञात वाहनों अथवा बाहरी व्यक्तियों को सीधे गोशाला के अंदर न आने दें',
            'बीमारी से मृत पशुओं को खुले में न फेंकें, चूना डालकर गड्ढे में दबाएं'
          ]
        }
      ];
    }

    // Default English
    return [
      {
        id: 'fmd-guide',
        disease: 'Foot-and-Mouth Disease (FMD)',
        symptoms: ['High fever', 'Blisters inside mouth and hooves', 'Ropy salivation', 'Severe lameness'],
        dos: [
          'Wash mouth with mild 1% potassium permanganate solution or alum water',
          'Apply antiseptic fly-repellent ointments to hoof lesions',
          'Provide soft, easily digestible gruel (cooked porridge with jaggery)',
          'Strictly isolate the animal and disinfect the stable daily'
        ],
        donts: [
          'Do NOT allow infected animals to graze with healthy herds',
          'Do NOT force lame animals to walk on rough or stony terrain',
          'Do NOT share milking pails or feeding troughs'
        ]
      },
      {
        id: 'lsd-guide',
        disease: 'Lumpy Skin Disease (LSD)',
        symptoms: ['Fever', 'Hard round skin nodules (2-5 cm)', 'Swollen lymph nodes', 'Edema in limbs'],
        dos: [
          'Isolate affected cattle in a mosquito/fly-proof enclosure',
          'Apply neem leaf smoke and herbal antiseptic paste (turmeric, neem, coconut oil)',
          'Administer supportive vitamins (Vitamin E, Biotin) as per vet prescription',
          'Ensure continuous access to clean, electrolyte-rich drinking water'
        ],
        donts: [
          'Do NOT puncture or squeeze skin nodules',
          'Do NOT move infected cattle out of the quarantined village zone',
          'Do NOT skip goat pox / homologous LSD vaccination for uninfected animals'
        ]
      },
      {
        id: 'quarantine-guide',
        disease: 'Quarantine & Biosecurity Protocol',
        symptoms: ['New animal introduction', 'Sudden drop in herd health', 'Suspected contagious exposure'],
        dos: [
          'Quarantine newly purchased livestock for at least 14 to 21 days',
          'Maintain lime powder or potassium permanganate footbaths at stable entrances',
          'Disinfect all animal stalls, feeding mangers, and milking equipment regularly'
        ],
        donts: [
          'Do NOT permit unauthorized livestock dealers or vehicles into housing areas',
          'Do NOT dispose of carcasses or contaminated bedding in open fields'
        ]
      }
    ];
  }
};
