import React, { useState, useEffect } from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";

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
      <section className={"bg-[#EFF3FA] text-xs text-[#607198] mb-[50px]"}>
        <div className={"container py-[12px]"}>
          <Link href={"/"}>Bosh sahifa / </Link>
          <Link href={"#"}>Institut / </Link>
          <Link href={"#"}>Onlayn Test</Link>
        </div>
      </section>

      <section className={"container pb-20"}>
        {showForm ? (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">Test oldidan ma'lumot kiritish</h1>
            <p className="text-gray-600 mb-8">
              Iltimos, shaxsingizni tasdiqlash va test natijalarini rasmiylashtirish uchun quyidagi ma'lumotlarni to'ldiring.
            </p>

            <form onSubmit={handleStartTest}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Ism Familya *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Aliyev Ali"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Telefon raqam *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📞</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">Elektron pochta *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">✉️</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ali@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Test natijalari ushbu pochta manziliga yuboriladi.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Savollar yuklanmoqda...
                  </>
                ) : (
                  "Testni boshlash →"
                )}
              </button>
              
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <strong>📋 Test haqida ma'lumot:</strong>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Test davomiyligi: 1 soat</li>
                  <li>Har bir savolga faqat bitta javob berish mumkin</li>
                  <li>Vaqt tugaganda test avtomatik yakunlanadi</li>
                  <li>Test yakunlangandan so'ng natijalar saqlanadi</li>
                </ul>
              </div>
            </form>
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
    </Main>
  );
};

export default Index;
