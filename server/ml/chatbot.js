/**
 * EduShield AI Counselling Chatbot
 * 
 * Rule-based NLP chatbot that provides contextual counselling
 * based on student risk profiles and conversation context.
 */

class CounsellingChatbot {
  constructor() {
    this.patterns = this._buildPatternDatabase();
    this.greetings = [
      "Hello! I'm your EduShield counselling assistant. How can I help you today?",
      "Hi there! I'm here to support you. What's on your mind?",
      "Welcome! I'm your AI counsellor. Feel free to share what you're going through."
    ];
  }

  /**
   * Process user message and return appropriate response
   */
  getResponse(message, studentData = null) {
    const input = message.toLowerCase().trim();
    
    // Check for greetings
    if (this._isGreeting(input)) {
      return {
        text: this._randomChoice(this.greetings),
        type: 'greeting',
        suggestions: this._getSuggestions(studentData)
      };
    }

    // Match against patterns
    for (const pattern of this.patterns) {
      if (pattern.keywords.some(kw => input.includes(kw))) {
        const response = this._randomChoice(pattern.responses);
        const contextual = this._addContext(response, studentData, pattern.category);
        return {
          text: contextual,
          type: pattern.category,
          suggestions: pattern.followUp || [],
          showCounsellor: pattern.critical || false,
          cards: pattern.cards || []
        };
      }
    }

    // Default fallback
    return {
      text: "I understand you're going through something. Could you tell me more about what's troubling you? I'm here to help with academics, stress, finances, or any other concerns.",
      type: 'fallback',
      suggestions: ['I feel stressed', 'My marks are low', 'I have fee issues', 'My attendance is low']
    };
  }

  /**
   * Get initial message based on student risk
   */
  getWelcomeMessage(studentData) {
    if (!studentData) {
      return {
        text: this._randomChoice(this.greetings),
        type: 'greeting',
        suggestions: ['I need help', 'I feel stressed', 'Tell me about scholarships']
      };
    }

    const { risk_level, name } = studentData;
    let text, suggestions;

    switch (risk_level) {
      case 'High':
        text = `Hi ${name}! I'm your EduShield counsellor. I noticed you might be facing some challenges right now. I'm here to help you navigate through this — whether it's academics, attendance, or financial concerns. Let's talk!`;
        suggestions = ['I need study help', 'Tell me about scholarships', 'How to improve attendance?', 'I feel overwhelmed'];
        break;
      case 'Medium':
        text = `Hello ${name}! Welcome to EduShield counselling. You're doing okay, but there are some areas we can work on together. What would you like to discuss?`;
        suggestions = ['How to improve my CGPA?', 'Study tips', 'Time management', 'I feel stressed'];
        break;
      default:
        text = `Hi ${name}! Great to see you here. You're doing well academically! If you ever need guidance or just want to chat, I'm here for you.`;
        suggestions = ['Career guidance', 'How to maintain my performance?', 'I want to help peers', 'Stress management tips'];
    }

    return { text, type: 'welcome', suggestions };
  }

  _isGreeting(input) {
    const greetingWords = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'];
    return greetingWords.some(g => input.startsWith(g) || input === g);
  }

  _buildPatternDatabase() {
    return [
      {
        category: 'stress',
        keywords: ['stress', 'stressed', 'anxious', 'anxiety', 'pressure', 'overwhelm', 'burnout', 'tired', 'exhausted', 'depressed', 'depression', 'sad', 'lonely'],
        responses: [
          "I hear you, and it's completely okay to feel this way. Here are some strategies that can help:\n\n🧘 **Deep Breathing**: Try the 4-7-8 technique — inhale 4 sec, hold 7 sec, exhale 8 sec\n📝 **Journaling**: Write down 3 things you're grateful for each day\n🏃 **Physical Activity**: Even a 15-minute walk can reduce stress hormones by 40%\n⏰ **Time Blocking**: Break your day into focused 25-minute sessions (Pomodoro technique)\n\nRemember: seeking help is a sign of strength, not weakness!",
          "Stress is your body's way of saying you need a change. Let's work through this:\n\n💤 **Sleep Hygiene**: Aim for 7-8 hours — it directly affects academic performance\n🎵 **Music Therapy**: Classical or lo-fi music while studying reduces cortisol\n🤝 **Social Support**: Connect with a friend or study group\n📱 **Digital Detox**: Try 30 min without screens before bed\n\nYou're stronger than you think!",
          "Many students feel this way — you're not alone. Research shows that:\n\n✅ Students who practice mindfulness perform 20% better\n✅ Regular exercise boosts memory and concentration\n✅ Talking about feelings reduces their intensity\n\nWould you like specific study strategies or want to explore stress management techniques?"
        ],
        followUp: ['Give me study tips', 'Tell me more about mindfulness', 'I need help with time management'],
        critical: true
      },
      {
        category: 'marks',
        keywords: ['marks', 'grades', 'cgpa', 'gpa', 'score', 'fail', 'failed', 'failing', 'low marks', 'poor performance', 'exam', 'test', 'result'],
        responses: [
          "Don't worry — grades can always improve! Here's a proven study plan:\n\n📚 **Active Recall**: Test yourself instead of re-reading notes (2x more effective)\n🗓️ **Spaced Repetition**: Review material at increasing intervals\n📖 **Teach Others**: Explaining concepts improves retention by 90%\n✍️ **Past Papers**: Practice with previous year questions\n🎯 **Focus on Weak Areas**: Identify and target specific topics\n\nConsistency beats intensity — 1 hour daily > 7 hours on Sunday!",
          "Low marks are a signal, not a sentence. Let's build a recovery plan:\n\n1️⃣ **Identify Gaps**: Which subjects need the most attention?\n2️⃣ **Seek Help**: Visit professors during office hours\n3️⃣ **Study Groups**: Collaborative learning improves understanding\n4️⃣ **Online Resources**: Khan Academy, NPTEL, Coursera (many are free!)\n5️⃣ **Practice Problems**: Solve at least 10 problems per topic daily\n\nMany toppers started with low marks. Your comeback story starts today!"
        ],
        followUp: ['How to make a study schedule?', 'Best online resources?', 'How to prepare for exams?'],
        critical: false
      },
      {
        category: 'fees',
        keywords: ['fee', 'fees', 'money', 'financial', 'scholarship', 'loan', 'afford', 'expensive', 'payment', 'economic', 'poverty', 'poor'],
        responses: [
          "I understand financial issues can be very stressful. Here are some resources that can help you right now:"
        ],
        followUp: ['How to apply for scholarships?', 'Tell me about education loans', 'Part-time job options'],
        critical: true,
        cards: [
          {
            title: 'National Scholarship Portal',
            description: 'Government scholarships for students across all levels.',
            link: 'https://scholarships.gov.in'
          },
          {
            title: 'Buddy4Study',
            description: 'India\'s largest scholarship platform connecting students with NGOs.',
            link: 'https://www.buddy4study.com'
          },
          {
            title: 'Vidya Lakshmi Portal',
            description: 'Education loan portal with interest subsidies for students.',
            link: 'https://www.vidyalakshmi.co.in'
          }
        ]
      },
      {
        category: 'attendance',
        keywords: ['attendance', 'absent', 'absence', 'skip', 'skipping', 'bunk', 'missing class', 'not attending'],
        responses: [
          "Attendance directly impacts your success. Studies show:\n\n📊 **Every 1% increase in attendance = 0.5% increase in grades**\n\nHere's how to improve:\n\n⏰ **Morning Routine**: Set 2 alarms, prepare clothes the night before\n📅 **Track It**: Use a habit tracker app\n👥 **Buddy System**: Partner with a classmate for accountability\n🎯 **Set Goals**: Aim for 85%+ attendance this month\n🏥 **Health Issues?**: Visit the campus health center — get proper treatment, not just absence\n\nIf you're struggling to attend classes, there might be an underlying reason. Want to talk about it?",
          "Missing classes creates a snowball effect — each missed class makes the next one harder. Let's break the cycle:\n\n🔄 **Start Small**: Commit to attending just the next 3 days\n📝 **Sit in Front**: It increases engagement by 30%\n🤝 **Study Group**: Friends who attend together, succeed together\n💡 **Find Purpose**: Connect each class to your career goals\n\nWhat's making it hard to attend classes? Let's address the root cause."
        ],
        followUp: ['How to catch up on missed classes?', 'I have health issues', 'I lack motivation'],
        critical: false
      },
      {
        category: 'career',
        keywords: ['career', 'job', 'placement', 'future', 'intern', 'internship', 'work', 'company', 'industry', 'skill'],
        responses: [
          "Great that you're thinking about your career! Here's a roadmap:\n\n🎯 **Skill Building**:\n  • Technical: Focus on in-demand skills (coding, data analysis)\n  • Soft skills: Communication, teamwork, leadership\n\n💼 **Experience**:\n  • Apply for internships early (pre-final year)\n  • Build projects for your portfolio\n  • Join college clubs and committees\n\n🌐 **Networking**:\n  • LinkedIn profile (professional photo, detailed experience)\n  • Attend workshops and seminars\n  • Connect with alumni\n\n📄 **Preparation**:\n  • Start resume building now\n  • Practice aptitude tests\n  • Mock interviews\n\nWhich area would you like to explore more?"
        ],
        followUp: ['Resume building tips', 'How to prepare for interviews?', 'Best skills to learn'],
        critical: false
      },
      {
        category: 'motivation',
        keywords: ['motivat', 'inspire', 'give up', 'quit', 'dropout', 'drop out', 'leave', 'purpose', 'worth', 'point', 'why bother', 'hopeless'],
        responses: [
          "I understand you're feeling this way, and I want you to know — your feelings are valid. But let me share something:\n\n🌟 **You matter. Your education matters.**\n\n💡 Did you know?\n  • 67% of students who considered dropping out but stayed graduated with honors\n  • Every additional year of education increases lifetime earnings by 10%\n  • The hardest semesters often come right before the breakthrough\n\n🔥 **Action Steps**:\n  1. Talk to a mentor or professor you trust\n  2. Set one small goal for this week\n  3. Remember why you started\n  4. Take it one day at a time\n\n\"The only impossible journey is the one you never begin.\" — Tony Robbins\n\nI strongly recommend speaking with a human counsellor. Would you like help scheduling an appointment?",
          "Please don't give up. Every successful person has faced moments of doubt. Here's what matters:\n\n❤️ **Your journey is unique** — don't compare your chapter 3 to someone else's chapter 20\n💪 **Challenges build resilience** — this struggle is preparing you for something bigger\n🎓 **Education opens doors** — but only if you walk through them\n\n📞 **Support Available**:\n  • Campus Counselling Center\n  • Student Helpline\n  • Peer Support Groups\n  • Faculty Mentorship Programs\n\nYou've already shown courage by reaching out. Let's take the next step together."
        ],
        followUp: ['Connect me with a counsellor', 'I want to talk to someone', 'Give me a study plan'],
        critical: true
      },
      {
        category: 'time_management',
        keywords: ['time', 'schedule', 'manage', 'plan', 'organize', 'procrastina', 'lazy', 'distract', 'focus', 'concentrat'],
        responses: [
          "Time management is a superpower! Here's a framework that works:\n\n📋 **The Eisenhower Matrix**:\n  • Urgent + Important → Do now\n  • Important, Not Urgent → Schedule it\n  • Urgent, Not Important → Delegate\n  • Neither → Eliminate\n\n⏱️ **Pomodoro Technique**:\n  • 25 min focused work\n  • 5 min break\n  • After 4 cycles, take 15-30 min break\n\n📱 **Digital Discipline**:\n  • Use app blockers during study time\n  • Keep phone in another room\n  • Use website blockers for social media\n\n🎯 **Weekly Planning**:\n  • Sunday: Plan the week\n  • Daily: Top 3 priorities\n  • Evening: Review and adjust\n\nWhich technique would you like to try first?"
        ],
        followUp: ['Tell me more about Pomodoro', 'How to stop procrastinating?', 'Best study apps'],
        critical: false
      }
    ];
  }

  _addContext(response, studentData, category) {
    if (!studentData) return response;

    let context = '';
    if (category === 'marks' && studentData.cgpa) {
      if (studentData.cgpa < 5) {
        context = `\n\n📌 *Based on your current CGPA of ${studentData.cgpa}, I'd specifically recommend focusing on core subjects first and building up from there.*`;
      }
    }
    if (category === 'attendance' && studentData.attendance) {
      if (studentData.attendance < 60) {
        context = `\n\n⚠️ *Your current attendance is ${studentData.attendance}%. We need to get this above 75% to avoid academic penalties. Let's create a plan!*`;
      }
    }

    return response + context;
  }

  _getSuggestions(studentData) {
    if (!studentData) return ['I need help', 'I feel stressed', 'Tell me about scholarships'];
    
    const suggestions = [];
    if (studentData.attendance < 75) suggestions.push('How to improve attendance?');
    if (studentData.cgpa < 6) suggestions.push('Help me improve my grades');
    if (studentData.financial_status === 'Low') suggestions.push('Tell me about financial aid');
    suggestions.push('I feel stressed');
    return suggestions.slice(0, 4);
  }

  _randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

module.exports = new CounsellingChatbot();
