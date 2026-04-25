const mcqs = [
  {
    "tenant_id": 1,
    "course_id": 201,
    "topic_id": 1,
    "unit_id": 1,
    "games": [
      {
        "type": "normal",
        "title": "Basic Quiz",
        "settings": {
          "totalQuestions": 5,
          "passingScore": 50
        },
        "questions": [
          {
            "id": 1,
            "question": "Kotlin is developed by?",
            "options": [
              "Google",
              "JetBrains",
              "Microsoft",
              "Oracle"
            ],
            "correctAnswer": "JetBrains"
          }
        ]
      },
      {
        "type": "time-bound",
        "title": "Timed Quiz",
        "settings": {
          "timeLimit": 60
        },
        "questions": [
          {
            "id": 1,
            "question": "Kotlin runs on?",
            "options": [
              "JVM",
              "Python",
              "Node",
              "C++"
            ],
            "correctAnswer": "JVM"
          }
        ]
      },
      {
        "type": "rapid-fire",
        "title": "Rapid Fire",
        "settings": {
          "timePerQuestion": 10
        },
        "questions": [
          {
            "id": 1,
            "question": "Is Kotlin statically typed?",
            "options": [
              "Yes",
              "No"
            ],
            "correctAnswer": "Yes"
          }
        ]
      }
    ]
  },
  {
    "tenant_id": 1,
    "course_id": 202,
    "module_name": "Dart Basics",
    "topic_title": "Variables",
    "games": [
      {
        "type": "normal",
        "title": "Basic Quiz",
        "settings": {
          "totalQuestions": 5,
          "passingScore": 50
        },
        "questions": [
          {
            "id": 1,
            "question": "What is Dart?",
            "options": [
              "Programming Language",
              "Framework",
              "Database",
              "OS"
            ],
            "correctAnswer": "Programming Language"
          },
          {
            "id": 2,
            "question": "Who developed Dart?",
            "options": [
              "Google",
              "Microsoft",
              "Facebook",
              "Oracle"
            ],
            "correctAnswer": "Google"
          },
          {
            "id": 3,
            "question": "Dart is mainly used for?",
            "options": [
              "Web Development",
              "Mobile Apps",
              "Game Dev",
              "AI"
            ],
            "correctAnswer": "Mobile Apps"
          },
          {
            "id": 4,
            "question": "Dart runs on?",
            "options": [
              "JVM",
              "Flutter Engine",
              "NodeJS",
              "Python"
            ],
            "correctAnswer": "Flutter Engine"
          },
          {
            "id": 5,
            "question": "Is Dart strongly typed?",
            "options": [
              "Yes",
              "No"
            ],
            "correctAnswer": "Yes"
          }
        ]
      },
      {
        "type": "time-bound",
        "title": "Timed Quiz",
        "settings": {
          "timeLimit": 60
        },
        "questions": [
          {
            "id": 1,
            "question": "Which keyword is used to declare variable?",
            "options": [
              "var",
              "int",
              "let",
              "const"
            ],
            "correctAnswer": "var"
          },
          {
            "id": 2,
            "question": "Dart supports OOP?",
            "options": [
              "Yes",
              "No"
            ],
            "correctAnswer": "Yes"
          },
          {
            "id": 3,
            "question": "Which symbol is used for comments?",
            "options": [
              "//",
              "##",
              "/* */",
              "--"
            ],
            "correctAnswer": "//"
          }
        ]
      },
      {
        "type": "rapid-fire",
        "title": "Rapid Fire",
        "settings": {
          "timePerQuestion": 10
        },
        "questions": [
          {
            "id": 1,
            "question": "Is Dart compiled language?",
            "options": [
              "Yes",
              "No"
            ],
            "correctAnswer": "Yes"
          },
          {
            "id": 2,
            "question": "Dart is used in Flutter?",
            "options": [
              "Yes",
              "No"
            ],
            "correctAnswer": "Yes"
          },
          {
            "id": 3,
            "question": "Can Dart run on web?",
            "options": [
              "Yes",
              "No"
            ],
            "correctAnswer": "Yes"
          }
        ]
      }
    ]
  }
];