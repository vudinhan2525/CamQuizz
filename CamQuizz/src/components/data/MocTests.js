export const mockTests = [
    {
      id: '1',
      title: 'Kiến thức cơ bản về JavaScript',
      description: 'Kiểm tra cơ bản về JavaScript',
      authorId: 'user-1',
      authorName: 'John Smith',
      organizationId: 'org-1',
      organizationName: 'Tech Academy',
      questions: [
        {
          id: 'q1',
          text: 'JavaScript là gì?',
          choices: [
            { id: 'c1', text: 'Một ngôn ngữ lập trình', isCorrect: true },
            { id: 'c2', text: 'Một ngôn ngữ đánh dấu', isCorrect: false },
            { id: 'c3', text: 'Một hệ quản trị cơ sở dữ liệu', isCorrect: false },
            { id: 'c4', text: 'An operating system', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          text: 'Câu lệnh khai báo biến nào sau đây là hợp lệ trong JavaScript?',
          choices: [
            { id: 'c5', text: 'var x = 5;', isCorrect: true },
            { id: 'c6', text: 'variable x = 5;', isCorrect: false },
            { id: 'c7', text: 'v x = 5;', isCorrect: false },
            { id: 'c8', text: '# x = 5;', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          text: 'DOM là viết tắt của cụm từ nào?',
          choices: [
            { id: 'c9', text: 'Mô hình đối tượng tài liệu (Document Object Model)', isCorrect: true },
            { id: 'c10', text: 'Mô hình đối tượng dữ liệu (Data Object Model)', isCorrect: false },
            { id: 'c11', text: 'Mô-đun định hướng tài liệu (Document Oriented Module)', isCorrect: false },
            { id: 'c12', text: 'Quản lý đối tượng số hóa (Digital Object Manager)', isCorrect: false },
          ],
        },
      ],
      createdAt: '2023-08-15T14:00:00Z',
      updatedAt: '2023-08-15T14:00:00Z',
      attempts: 150,
      results: [
        {
          id: 'r1',
          testId: '1',
          candidateId: 'user-2',
          candidateName: 'Alice Johnson',
          score: 3,
          totalQuestions: 3,
          answers: [
            { questionId: 'q1', choiceId: 'c1', isCorrect: true },
            { questionId: 'q2', choiceId: 'c5', isCorrect: true },
            { questionId: 'q3', choiceId: 'c9', isCorrect: true },
          ],
          completedAt: '2023-08-16T10:30:00Z',
        },
      ],
    },

    {
      id: '2',
      title: 'Kiến thức cơ bản về React',
      description: 'Kiểm tra hiểu biết của bạn về React',
      authorId: 'user-1',
      authorName: 'John Smith',
      organizationId: 'org-1',
      organizationName: 'Tech Academy',
      questions: [
        {
          id: 'q4',
          text: 'React là gì?',
          choices: [
            {id: 'c13', text: 'Một thư viện JavaScript xây dựng interfaces người dùng', isCorrect: true},
            {id: 'c14', text: 'Một ngôn ngữ lập trình', isCorrect: false},
            {id: 'c15', text: 'Một hệ quản trị cơ sở dữ liệu', isCorrect: false},
            {id: 'c16', text: 'Một backend framework', isCorrect: false},
          ]
        },

        {
          id: 'q5',
          text: 'JSX là gì?',
          choices: [
            { id: 'c17', text: 'JavaScript XML', isCorrect: true },
            { id: 'c18', text: 'JavaScript Extension', isCorrect: false },
            { id: 'c19', text: 'JavaScript Extra', isCorrect: false },
            { id: 'c20', text: 'Java XML', isCorrect: false },
          ],
        },
      ],

      createdAt: '2023-09-10T09:00:00Z',
      updatedAt: '2023-09-10T09:00:00Z',
      attempts: 75,
      results: [
        {
          id: 'r4',
          testId: '2',
          candidateId: 'user-2',
          candidateName: 'Alice Johnson',
          score: 2,
          totalQuestions: 2,
          answers: [
            { questionId: 'q4', choiceId: 'c13', isCorrect: true },
            { questionId: 'q5', choiceId: 'c17', isCorrect: true },
          ],
          completedAt: '2023-09-12T10:30:00Z',
        },
        {
          id: 'r5',
          testId: '2',
          candidateId: 'user-3',
          candidateName: 'Bob Miller',
          score: 1,
          totalQuestions: 2,
          answers: [
            { questionId: 'q4', choiceId: 'c13', isCorrect: true },
            { questionId: 'q5', choiceId: 'c18', isCorrect: false },
          ],
          completedAt: '2023-09-12T14:15:00Z',
        },

      ],
      },
  ];
  
  export const getCurrentUserTests = () => {
    return mockTests.filter(test => test.authorId === 'user-1');
  };
  
  export const getOrganizationTests = () => {
    return mockTests.filter(test => test.organizationId === 'org-1');
  };
  
  export const getCandidateAttemptedTests = () => {
    return mockTests.filter(test => 
      test.results.some(result => result.candidateId === 'user-2')
    );
  };
  
  export const getTestById = (id) => {
    return mockTests.find(test => test.id === id);
  };
  