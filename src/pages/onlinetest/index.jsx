import React, { useState, useEffect } from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";

// Ikonkalar (24x24, currentColor)
const Svg = ({ className, children }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
const DocIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </Svg>
);
const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" />
    <path d="m8.8 12.2 2.2 2.2 4.3-4.6" />
  </Svg>
);
const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.2-3.7 4.1-5.5 7.5-5.5s6.3 1.8 7.5 5.5" />
  </Svg>
);
const PhoneIcon = (p) => (
  <Svg {...p}>
    <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4z" />
  </Svg>
);
const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Svg>
);
const ArrowIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
const ListIcon = (p) => (
  <Svg {...p}>
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </Svg>
);
const HourglassIcon = (p) => (
  <Svg {...p}>
    <path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9" />
  </Svg>
);
const ChartIcon = (p) => (
  <Svg {...p}>
    <path d="M5 20v-6M10 20V10M15 20V6M20 20V3" />
  </Svg>
);
const HomeIcon = (p) => (
  <Svg {...p}>
    <path d="m3 11 9-7 9 7M5 9.5V20h5v-6h4v6h5V9.5" />
  </Svg>
);

const LockIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);
const InfoIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

// Test yopiq (admin panelda barcha testlar status=False): rasmdagi "Test topshirish hozircha yopiq" sahifasi
const ClosedView = () => (
  <div className="relative">
    <div className="relative mx-auto max-w-[680px] rounded-[24px] bg-white border border-[#EEF2FA] shadow-[0_20px_60px_rgba(16,42,116,0.10)] px-6 py-10 md:px-12 md:py-12 text-center">
      {/* Illyustratsiya: qulf va kalendar */}
      <div className="relative mx-auto w-[260px] h-[190px]" aria-hidden="true">
        <div className="absolute inset-x-6 top-2 bottom-2 rounded-full bg-gradient-to-b from-[#E6EEFF] to-[#F5F8FF]" />
        <div className="absolute right-6 top-8 w-[104px] h-[110px] rounded-[16px] bg-white border border-[#DCE6FB] shadow-[0_10px_24px_rgba(29,91,232,0.12)] p-3">
          <div className="h-3 rounded-full bg-[#2F6BFF] mb-2" />
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={i === 6 ? "h-3.5 rounded-[4px] bg-[#2F6BFF]" : "h-3.5 rounded-[4px] bg-[#DCE6FB]"} />
            ))}
          </div>
          <span className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-white border-2 border-[#2F6BFF] text-[#2F6BFF] flex items-center justify-center shadow">
            <ClockIcon className="w-6 h-6" />
          </span>
        </div>
        <div className="absolute left-12 top-6 w-[118px] h-[150px] flex flex-col items-center">
          <div className="w-[70px] h-[58px] rounded-t-full border-[12px] border-b-0 border-[#5B8CFF]" />
          <div className="w-[118px] h-[92px] rounded-[20px] bg-gradient-to-br from-[#CFE0FF] via-[#8FB2FF] to-[#3E72F5] shadow-[0_14px_30px_rgba(29,91,232,0.35)] flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-[#173A8F] relative after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-3 after:w-2 after:h-5 after:rounded-b after:bg-[#173A8F]" />
          </div>
        </div>
        <span className="absolute left-4 top-4 w-3 h-3 rounded-[4px] bg-[#C9D8F8]" />
        <span className="absolute right-3 top-1 w-4 h-4 rounded-[5px] bg-[#DCE6FB]" />
      </div>

      <span className="mt-6 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#E8F0FE] text-[#1D5BE8] text-[14px] font-bold tracking-wide">
        <LockIcon className="w-4 h-4" /> TEST YOPIQ
      </span>
      <h1 className="mt-5 text-[28px] md:text-[36px] font-extrabold leading-tight text-[#0B1A4F]">
        Test topshirish hozircha yopiq
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-[#3B4A75]">
        Ayni vaqtda test topshirishga ruxsat berilmagan.
        <br className="hidden sm:block" /> Test ochilganda ushbu sahifa orqali qatnashishingiz mumkin.
      </p>

      <div className="mt-8 rounded-[16px] bg-[#EEF4FF] p-5 md:p-6 flex items-start gap-4 text-left">
        <span className="w-12 h-12 shrink-0 rounded-full bg-white text-[#1D5BE8] flex items-center justify-center shadow-[0_4px_12px_rgba(16,42,116,0.08)]">
          <InfoIcon className="w-6 h-6" />
        </span>
        <div>
          <p className="text-[16px] font-bold text-[#0B1A4F]">Nima qilish kerak?</p>
          <ul className="mt-2 space-y-1.5 text-[14px] text-[#1E2B5A]">
            <li className="flex items-start gap-2.5">
              <span className="mt-[7px] w-2 h-2 rounded-full bg-[#1D5BE8] shrink-0" />
              Test boshlanish sanasi e&apos;lon qilinishini kuting.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-[7px] w-2 h-2 rounded-full bg-[#1D5BE8] shrink-0" />
              Qo&apos;shimcha ma&apos;lumot uchun institut ma&apos;muriyatiga murojaat qiling.
            </li>
          </ul>
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-[12px] bg-[#1D5BE8] text-white text-[15px] font-semibold hover:bg-[#174FD0] transition-colors"
      >
        <HomeIcon className="w-5 h-5" /> Bosh sahifaga qaytish
      </Link>
    </div>
  </div>
);

const Index = () => {
  // State'lar
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: ""
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 soat (3600 sekund)
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  // null — tekshirilmoqda, true — ochiq, false — yopiq (admin panelda barcha testlar o'chirilgan)
  const [testOpen, setTestOpen] = useState(null);

  // Test holatini tekshirish: /api/quiz/list/ faqat status=True testlarni qaytaradi
  useEffect(() => {
    let alive = true;
    fetch("https://main.tmsiti.uz/api/quiz/list/")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (!alive) return;
        const open =
          Array.isArray(data) && data.some((q) => q.status !== false && Array.isArray(q.json) && q.json.length > 0);
        setTestOpen(open);
      })
      // Tarmoq xatosi — forma ko'rsatiladi, "Testni boshlash" bosilganda xato matni chiqadi
      .catch(() => alive && setTestOpen(true));
    return () => {
      alive = false;
    };
  }, []);

  // Komponent yuklanganida localStorage'dan ma'lumotlarni olish
  useEffect(() => {
    const savedUserData = localStorage.getItem("testUserData");
    if (savedUserData) {
      try {
        const parsedData = JSON.parse(savedUserData);
        setFormData(parsedData);
      } catch (err) {
        console.error("LocalStorage ma'lumotlarini o'qishda xatolik:", err);
      }
    }
  }, []);

  // Array'ni random aralashtirish funksiyasi
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Testni boshlash funksiyasi
  const handleStartTest = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone || !formData.email) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    
    // Ma'lumotlarni localStorage'ga saqlash
    localStorage.setItem("testUserData", JSON.stringify(formData));
    
    setLoading(true);
    
    try {
      // 1. API-dan savollarni olish
      const response = await fetch("https://main.tmsiti.uz/api/quiz/list/");
      
      if (!response.ok) {
        throw new Error(`HTTP xatosi: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 2. Ma'lumotlarni formatlash va aralashtirish
      if (Array.isArray(data)) {
        let allQuestions = [];
        
        data.forEach((quizGroup, groupIndex) => {
          if (quizGroup.json && Array.isArray(quizGroup.json)) {
            quizGroup.json.forEach((question, questionIndex) => {
              // Javoblarni random aralashtirish
              const shuffledOptions = shuffleArray([...(question.options || [])]);
              
              // To'g'ri javob indeksini yangilash
              const correctAnswer = question.correct_answer || question.correctAnswer;
              const newCorrectIndex = shuffledOptions.findIndex(opt => opt === correctAnswer);
              
              allQuestions.push({
                id: question.id || `${groupIndex}-${questionIndex}`,
                originalId: question.id || `${groupIndex}-${questionIndex}`,
                question: question.question,
                options: shuffledOptions,
                correctAnswer: correctAnswer,
                correctIndex: newCorrectIndex, // Yangi indeks
                category: quizGroup.title || `Guruh ${groupIndex + 1}`
              });
            });
          }
        });
        
        // Savollarni random aralashtirish
        const shuffledQuestions = shuffleArray(allQuestions);
        
        if (shuffledQuestions.length > 0) {
          setQuestions(shuffledQuestions);
          setTestStarted(true);
          setShowForm(false);
          setStartTime(new Date());
          console.log("Savollar yuklandi:", shuffledQuestions.length);
        } else {
          throw new Error("Savollar topilmadi");
        }
      } else {
        throw new Error("API javobi to'g'ri formatda emas");
      }
      
      setError(null);
    } catch (err) {
      console.error("Savollarni yuklashda xatolik:", err);
      setError(`Xatolik: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Vaqtni hisoblash
  useEffect(() => {
    let timer;
    
    if (testStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            autoSubmitTest(); // Vaqt tugaganda avtomatik topshirish
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [testStarted, timeLeft]);

  // Format vaqt
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;
  };

  // Format vaqt (soniyalarda)
  const formatTimeSpent = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours} soat ${minutes} daqiqa ${secs} soniya`;
    } else if (minutes > 0) {
      return `${minutes} daqiqa ${secs} soniya`;
    } else {
      return `${secs} soniya`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnswer = (questionId, answerIndex) => {
    console.log("Javob berildi:", questionId, answerIndex);
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const getQuestionStatus = (index) => {
    if (!questions[index]) return 'unanswered';
    
    if (answers[questions[index].id] !== undefined) {
      return 'answered';
    }
    if (index === currentQuestion) {
      return 'current';
    }
    return 'unanswered';
  };

  // Natijalarni hisoblash
  const calculateResults = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    
    const detailedResults = questions.map(q => {
      const userAnswerIndex = answers[q.id];
      const userAnswer = userAnswerIndex !== undefined ? q.options[userAnswerIndex] : null;
      const isCorrect = userAnswerIndex === q.correctIndex;
      
      if (userAnswerIndex === undefined) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
      
      return {
        questionId: q.originalId,
        question: q.question,
        category: q.category,
        userAnswer: userAnswer,
        correctAnswer: q.correctAnswer,
        userAnswerIndex: userAnswerIndex,
        correctAnswerIndex: q.correctIndex,
        isCorrect: isCorrect,
        options: q.options
      };
    });
    
    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions * 100).toFixed(1) : 0;
    const timeSpent = startTime ? Math.floor((new Date() - startTime) / 1000) : 0;
    
    return {
      correctCount,
      incorrectCount,
      unansweredCount,
      totalQuestions,
      percentage,
      timeSpent,
      detailedResults
    };
  };

  // Testni POST qilish
  const submitTestToAPI = async (results) => {
    try {
      const resultJson = {
        user_info: formData,
        test_summary: {
          total_questions: results.totalQuestions,
          correct_answers: results.correctCount,
          incorrect_answers: results.incorrectCount,
          unanswered_questions: results.unansweredCount,
          percentage: results.percentage,
          time_spent_seconds: results.timeSpent,
          time_spent_formatted: formatTimeSpent(results.timeSpent),
          finished_at: new Date().toISOString()
        },
        detailed_results: results.detailedResults
      };
      
      const postData = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        corrent_ans: results.correctCount,
        result: resultJson
      };
      
      console.log("POST qilinayotgan ma'lumot:", postData);
      
      const response = await fetch("https://main.tmsiti.uz/api/customer/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`API POST xatosi: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("API javobi:", responseData);
      return responseData;
      
    } catch (err) {
      console.error("Test natijalarini yuborishda xatolik:", err);
      throw err;
    }
  };

  // Testni avtomatik topshirish (vaqt tugaganda)
  const autoSubmitTest = async () => {
    if (testStarted && !showResults) {
      console.log("Vaqt tugadi, avtomatik topshirilmoqda...");
      const results = calculateResults();
      
      try {
        await submitTestToAPI(results);
        
        setTestResult(results);
        setShowResults(true);
        
        // LocalStorage'dan ma'lumotlarni o'chirish
        localStorage.removeItem("testUserData");
        
      } catch (err) {
        alert("Natijalarni saqlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
        console.error(err);
      }
    }
  };

  // Testni qo'lda yakunlash
  const handleFinishTest = async () => {
    if (window.confirm("Testni yakunlashni istaysizmi?\nYakunlaganingizdan so'ng javoblarni o'zgartira olmaysiz.")) {
      setLoading(true);
      
      try {
        const results = calculateResults();
        
        // API-ga POST qilish
        await submitTestToAPI(results);
        
        setTestResult(results);
        setShowResults(true);
        setTestStarted(false);
        
        // LocalStorage'dan ma'lumotlarni o'chirish
        localStorage.removeItem("testUserData");
        
      } catch (err) {
        alert("Natijalarni saqlashda xatolik yuz berdi: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Yangi test boshlash
  const handleNewTest = () => {
    setShowForm(true);
    setShowResults(false);
    setTestResult(null);
    setTestStarted(false);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(3600);
    setFormData({
      full_name: "",
      phone: "",
      email: ""
    });
  };

  // Navigatsiya tugmalari
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Savol raqamini bosganda
  const handleQuestionSelect = (index) => {
    setCurrentQuestion(index);
  };

  // Natijalar sahifasi uchun tafsilotli jadval render qilish
  const renderResultsTable = () => {
    if (!testResult) return null;
    
    return (
      <div className="mt-8 overflow-x-auto">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Batafsil tahlil</h3>
        
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left border-b">#</th>
              <th className="py-3 px-4 text-left border-b">SAVOL</th>
              <th className="py-3 px-4 text-left border-b">SIZNING JAVOBINGIZ</th>
              <th className="py-3 px-4 text-left border-b">TO'G'RI JAVOB</th>
              <th className="py-3 px-4 text-left border-b">HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {testResult.detailedResults.map((result, index) => (
              <React.Fragment key={index}>
                <tr className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="py-3 px-4 border-b align-top font-bold">{index + 1}</td>
                  <td className="py-3 px-4 border-b">
                    <div className="font-medium">{result.question}</div>
                    <div className="text-xs text-gray-500 mt-1">Mavzu: {result.category}</div>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className={`${!result.userAnswer ? 'text-gray-500 italic' : 
                      result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {result.userAnswer || "Javob berilmagan"}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b text-green-600 font-medium">
                    {result.correctAnswer}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : result.userAnswer === null 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isCorrect ? '✅ To\'g\'ri' : 
                       result.userAnswer === null ? '○ Javob berilmagan' : 
                       '❌ Noto\'g\'ri'}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 text-sm text-gray-500 italic">
          *Barcha {testResult.totalQuestions} ta savol natijalari ro'yxatining davomi...
        </div>
      </div>
    );
  };

  return (
    <Main>
      <Menu />
      <section className={"bg-[#EFF3FA] text-[14px] text-[#607198]"}>
        <div className={"container py-[12px] flex items-center gap-2"}>
          <Link href={"/"} className={"flex items-center gap-2 text-[#0B1A4F] hover:text-[#1D5BE8]"}>
            <HomeIcon className={"w-[18px] h-[18px]"} /> Bosh sahifa
          </Link>
          <span>/</span>
          <span>Institut</span>
          <span>/</span>
          <span className={"text-[#0B1A4F]"}>Onlayn Test</span>
        </div>
      </section>

      <div className={"relative overflow-hidden bg-gradient-to-b from-[#F3F7FD] to-white"}>
        {showForm && testOpen === false && (
          <>
            <div
              className={"absolute inset-0 bg-cover bg-center opacity-60"}
              style={{ backgroundImage: "url(/images/homepage-back.png)" }}
              aria-hidden={"true"}
            />
            <div className={"absolute inset-0 bg-gradient-to-r from-white/30 via-white/90 to-white/30"} aria-hidden={"true"} />
          </>
        )}
      <section className={"relative container pt-10 md:pt-14 pb-20"}>
        {showForm && testOpen === null ? (
          <div className="py-24 flex justify-center">
            <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1D5BE8]" />
          </div>
        ) : showForm && testOpen === false ? (
          <ClosedView />
        ) : showForm ? (
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 lg:gap-8 items-stretch">
            {/* Chap panel: xush kelibsiz */}
            <div className="relative overflow-hidden rounded-[24px] border border-[#E3EAF7] bg-[#F3F7FD] shadow-[0_12px_40px_rgba(16,42,116,0.08)] min-h-[520px]">
              <div
                className="absolute inset-0 bg-no-repeat bg-cover opacity-90"
                style={{ backgroundImage: "url(/images/homepage-back.png)", backgroundPosition: "88% center" }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F5F8FE] via-[#F5F8FE]/95 to-[#F5F8FE]/40" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#F5F8FE] to-transparent" aria-hidden="true" />

              <div className="relative p-7 md:p-10 flex flex-col h-full">
                <div className="flex items-center gap-3">
                  <img src="/icons/brand.svg" alt="TMSITI" className="h-12 w-auto" />
                </div>
                <p className="mt-2 max-w-[300px] text-[11px] font-semibold uppercase tracking-wide text-[#3B4A75] leading-snug">
                  Texnik me&apos;yorlash va standartlashtirish ilmiy-tadqiqot instituti
                </p>

                <h1 className="mt-8 text-[34px] md:text-[42px] leading-[1.1] font-extrabold text-[#0B1A4F]">
                  Onlayn testga
                  <br />
                  xush kelibsiz!
                </h1>
                <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed text-[#3B4A75]">
                  Ilm, tajriba va imkoniyatlar sari qadam. Testni boshlash uchun shaxsiy ma&apos;lumotlaringizni kiriting.
                </p>

                <ul className="mt-9 space-y-6">
                  {[
                    { title: "Qulay va tez", text: "Testni onlayn tarzda istalgan joydan topshirishingiz mumkin.", Icon: ClockIcon },
                    { title: "Shaffof baholash", text: "Natijalar avtomatik tarzda hisoblanadi.", Icon: DocIcon },
                    { title: "Ishonchli tizim", text: "Sizning ma'lumotlaringiz himoyalangan.", Icon: ShieldIcon },
                  ].map(({ title, text, Icon }) => (
                    <li key={title} className="flex items-start gap-4">
                      <span className="w-[60px] h-[60px] shrink-0 rounded-full bg-white/90 shadow-[0_6px_18px_rgba(16,42,116,0.08)] text-[#1D5BE8] flex items-center justify-center">
                        <Icon className="w-7 h-7" />
                      </span>
                      <span className="pt-2">
                        <span className="block text-[16px] font-bold text-[#0B1A4F]">{title}</span>
                        <span className="block mt-0.5 text-[14px] leading-snug text-[#3B4A75] max-w-[290px]">{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* O'ng panel: forma */}
            <div className="rounded-[24px] bg-white border border-[#EEF2FA] shadow-[0_12px_40px_rgba(16,42,116,0.08)] p-6 md:p-10">
              <div className="flex items-start gap-5">
                <span className="text-[#1D5BE8] shrink-0">
                  <DocIcon className="w-11 h-11" />
                </span>
                <div>
                  <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#0B1A4F] leading-tight">
                    Test oldidan ma&apos;lumot kiritish
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#5B6788]">
                    Iltimos, shaxsingizni tasdiqlash va test natijalarini rasmiylashtirish uchun quyidagi ma&apos;lumotlarni to&apos;ldiring.
                  </p>
                </div>
              </div>

              <form onSubmit={handleStartTest} className="mt-8 space-y-5">
                {[
                  { name: "full_name", label: "Ism Familiya", type: "text", placeholder: "Aliyev Ali", Icon: UserIcon, autoComplete: "name" },
                  { name: "phone", label: "Telefon raqam", type: "tel", placeholder: "+998 90 123 45 67", Icon: PhoneIcon, autoComplete: "tel" },
                  { name: "email", label: "Elektron pochta", type: "email", placeholder: "ali@example.com", Icon: MailIcon, autoComplete: "email" },
                ].map(({ name, label, type, placeholder, Icon, autoComplete }) => (
                  <div key={name}>
                    <label htmlFor={`test-${name}`} className="block text-[14px] font-medium text-[#0B1A4F] mb-2">
                      {label} <span className="text-[#E5484D]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1D5BE8] pointer-events-none">
                        <Icon className="w-5 h-5" />
                      </span>
                      <input
                        id={`test-${name}`}
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        required
                        className="w-full h-[52px] pl-12 pr-4 rounded-[12px] border border-[#D6DEEE] bg-white text-[15px] text-[#0B1A4F] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"
                      />
                    </div>
                    {name === "email" && (
                      <p className="mt-2 text-[12px] text-[#5B6788]">Test natijalari ushbu pochta manziliga yuboriladi.</p>
                    )}
                  </div>
                ))}

                {error && (
                  <div className="p-3 rounded-[12px] bg-[#FDECEC] text-[#B42318] text-[14px]">⚠️ {error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[56px] rounded-[12px] bg-[#1D5BE8] text-white text-[17px] font-semibold hover:bg-[#174FD0] shadow-[0_10px_24px_rgba(29,91,232,0.3)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Savollar yuklanmoqda...
                    </>
                  ) : (
                    <>
                      Testni boshlash <ArrowIcon className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="rounded-[16px] bg-[#EEF4FF] p-5 md:p-6 flex gap-4">
                  <span className="text-[#1D5BE8] shrink-0 pt-0.5">
                    <DocIcon className="w-7 h-7" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[16px] font-bold text-[#0B1A4F]">Test haqida ma&apos;lumot:</p>
                    <ul className="mt-3 space-y-2.5">
                      {[
                        ["Test davomiyligi: 1 soat", ClockIcon],
                        ["Har bir savolga faqat bitta javob berish mumkin", ListIcon],
                        ["Vaqt tugaganda test avtomatik yakunlanadi", HourglassIcon],
                        ["Test yakunlangandan so'ng natijalar saqlanadi", ChartIcon],
                      ].map(([text, Icon]) => (
                        <li key={text} className="flex items-center gap-3 text-[14px] text-[#1E2B5A]">
                          <Icon className="w-5 h-5 shrink-0 text-[#1D5BE8]" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : showResults ? (
          // Natijalar ekrani - Rasmda ko'rsatilganday
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">📊</div>
                <h1 className="text-3xl font-bold mb-2">Test Natijalari</h1>
                <p className="text-gray-600">Batafsil tahlil va statistik ma'lumotlar</p>
              </div>
              
              {/* Umumiy statistik ma'lumotlar */}
              {testResult && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {testResult.correctCount}/{testResult.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600">To'g'ri javoblar</div>
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      {testResult.percentage}%
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {testResult.incorrectCount}
                    </div>
                    <div className="text-sm text-gray-600">Noto'g'ri javoblar</div>
                  </div>
                  
                  <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {testResult.unansweredCount}
                    </div>
                    <div className="text-sm text-gray-600">Javobsiz savollar</div>
                  </div>
                  
                  <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {formatTimeSpent(testResult.timeSpent)}
                    </div>
                    <div className="text-sm text-gray-600">Sarflangan vaqt</div>
                  </div>
                </div>
              )}
              
              {/* Foydalanuvchi ma'lumotlari */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Test ishtirokchisi ma'lumotlari</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Ism Familya</div>
                    <div className="font-medium text-gray-800">{formData.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Telefon raqam</div>
                    <div className="font-medium text-gray-800">{formData.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Elektron pochta</div>
                    <div className="font-medium text-gray-800">{formData.email}</div>
                  </div>
                </div>
              </div>
              

              {/* {renderResultsTable()} */}

              <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-6 border-t">
                <button
                  onClick={handleNewTest}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  Yangi test boshlash
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  Natijani chop etish
                </button>
                <button
                  onClick={() => window.location.href = "/"}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🏠</span>
                  Bosh sahifa
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Test jarayoni ekrani
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Savollar qismi */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">Onlayn Test</h1>
                      {formData.full_name && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          👤 {formData.full_name}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {questions.length > 0 && questions[currentQuestion] ? (
                <div className="bg-white rounded-lg shadow-sm mb-6 p-6 border-l-4 border-green-500">
                  <div className="flex justify-between items-center mb-6">
                    <div className="bg-green-50 text-green-600 px-4 py-2 rounded text-sm font-medium">
                      SAVOL {currentQuestion + 1} / {questions.length}
                    </div>
                    <div className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded">
                      {questions[currentQuestion].category}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-6 text-gray-800">
                    {questions[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, optIndex) => {
                      const currentQuestionId = questions[currentQuestion].id;
                      const isSelected = answers[currentQuestionId] === optIndex;
                      
                      return (
                        <div
                          key={optIndex}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleAnswer(currentQuestionId, optIndex)}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                            isSelected 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-400'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="text-gray-700 select-none">{option}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigatsiya tugmalari */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestion === 0}
                      className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                        currentQuestion === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ← Oldingi savol
                    </button>
                    
                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestion === questions.length - 1}
                      className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                        currentQuestion === questions.length - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Keyingi savol →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">Savollar topilmadi</h3>
                  <p className="text-gray-600 mb-6">Iltimos, qaytadan urinib ko'ring.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                  >
                    Qaytadan boshlash
                  </button>
                </div>
              )}
            </div>

            {/* O'ng panel - Vaqt va navigatsiya */}
            {questions.length > 0 && (
              <div className="w-full lg:w-80">
                <div className="bg-[#1e293b] rounded-lg p-6 text-white sticky top-6">
                  {/* Vaqt qismi */}
                  <div className="text-center mb-8">
                    <div className="text-sm text-gray-400 mb-2">QOLGAN VAQT</div>
                    <div className={`text-4xl font-bold tracking-wider mb-3 ${
                      timeLeft < 600 ? 'text-red-400' : 'text-white'
                    }`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          timeLeft > 1800 ? 'bg-green-500' : 
                          timeLeft > 600 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(timeLeft / 3600) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Vaqt tugaganda test avtomatik yakunlanadi
                    </div>
                  </div>

                  {/* Savollar xaritasi */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <span className="text-lg">📋</span>
                      <span className="text-gray-300">Savollar xaritasi</span>
                      <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">
                        {questions.length} ta
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                      {questions.map((_, index) => {
                        const status = getQuestionStatus(index);
                        return (
                          <button
                            key={index}
                            onClick={() => handleQuestionSelect(index)}
                            className={`h-10 rounded-lg font-medium transition-all ${
                              status === 'answered'
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : status === 'current'
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            title={`Savol ${index + 1}`}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Holatlar */}
                  <div className="space-y-3 text-sm mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-300">Javob berilgan</span>
                      <span className="ml-auto text-gray-400">
                        {Object.keys(answers).length}/{questions.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-300">Joriy savol</span>
                      <span className="ml-auto text-gray-400">{currentQuestion + 1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded"></div>
                      <span className="text-gray-300">Javob berilmagan</span>
                      <span className="ml-auto text-gray-400">
                        {questions.length - Object.keys(answers).length}
                      </span>
                    </div>
                  </div>

                  {/* Yakunlash tugmasi */}
                  <button 
                    onClick={handleFinishTest}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Yakunlanmoqda...
                      </>
                    ) : (
                      <>
                        <span>🏁</span>
                        Testni Yakunlash
                      </>
                    )}
                  </button>
                  
                  <div className="text-xs text-gray-400 text-center mt-4">
                    Yakunlashdan oldin barcha savollarni tekshirib ko'ring
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      </div>
    </Main>
  );
};

export default Index;
