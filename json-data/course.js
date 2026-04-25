const data = [
  {
    id: 201,
    tenantId:0,
    teacherId:0,
    tech: "Android Mobile App Development",
    icon: "bi-diagram-3",
    modules: [
      {
        name: "Kotlin",
        desc: "Android Mobile application Development using Kotlin",
        topics: [
          {
            title: "Introduction",
            desc: "Basic of kotlin [Unlock Code : kotlin201]",
            unlockCode: "kotlin201",

            resources: [
              {
                type: "pdf",
                url: "Kotlin/unit1.pdf",
                label: "PDF"
              }
            ],

            // ✅ NEW FIELD (Assignment)
            assignment: {
              title: "Kotlin Basics Assignment",
              desc: "Create a simple Hello World Android app",
              type: "pdf",
              url: "Kotlin/assignment1.pdf",
              maxMarks: 100,
              dueDate: "2026-05-01"
            }

          }
        ]
      }
    ]
  }
];