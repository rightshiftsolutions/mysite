const mcqs = [
  {
    tenant_id: 1,
    course_id: 201,
    topic_id: 1,
    unit_id: 1,

    games: [
      
      // 🔹 1. Normal MCQ
      {
        type: "normal",
        title: "Basic Quiz",
        settings: {
          totalQuestions: 5,
          passingScore: 50
        },
        questions: [
          {
            id: 1,
            question: "Kotlin is developed by?",
            options: ["Google", "JetBrains", "Microsoft", "Oracle"],
            correctAnswer: "JetBrains"
          }
        ]
      },

      // 🔹 2. Time Bound
      {
        type: "time-bound",
        title: "Timed Quiz",
        settings: {
          timeLimit: 60
        },
        questions: [
          {
            id: 1,
            question: "Kotlin runs on?",
            options: ["JVM", "Python", "Node", "C++"],
            correctAnswer: "JVM"
          }
        ]
      },

      // 🔹 3. Rapid Fire
      {
        type: "rapid-fire",
        title: "Rapid Fire",
        settings: {
          timePerQuestion: 10
        },
        questions: [
          {
            id: 1,
            question: "Is Kotlin statically typed?",
            options: ["Yes", "No"],
            correctAnswer: "Yes"
          }
        ]
      }

    ]
  }
];