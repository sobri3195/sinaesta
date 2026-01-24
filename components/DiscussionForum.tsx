import React, { useMemo, useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Tag,
  CheckCircle,
  Paperclip,
  AtSign,
  Sparkles,
  Flag,
  Search
} from 'lucide-react';

type Answer = {
  id: string;
  author: string;
  content: string;
  votes: number;
  isBest: boolean;
  isMentor: boolean;
};

type Thread = {
  id: string;
  title: string;
  author: string;
  tags: string[];
  votes: number;
  answers: Answer[];
  content: string;
  attachments: string[];
  mentions: string[];
};

type Topic = {
  id: string;
  name: string;
  description: string;
  threads: Thread[];
};

const INITIAL_TOPICS: Topic[] = [
  {
    id: 'topic-1',
    name: 'Exam Prep',
    description: 'Share PPDS strategies, question breakdowns, and exam tips.',
    threads: [
      {
        id: 'thread-1',
        title: 'Approach to ambiguous ECG questions?',
        author: 'Nina',
        tags: ['Cardiology', 'Exam'],
        votes: 18,
        content: 'How do you eliminate distractors when the vignette gives minimal symptoms?',
        attachments: ['ECG_case_12.png'],
        mentions: ['@mentor_arini'],
        answers: [
          {
            id: 'answer-1',
            author: 'dr. Arini',
            content: 'Start with axis + rhythm. Build a short checklist and annotate the question stem.',
            votes: 32,
            isBest: true,
            isMentor: true
          },
          {
            id: 'answer-2',
            author: 'Raka',
            content: 'Use time-boxed reading: 30s for stem, 30s for options. Mark keywords.',
            votes: 12,
            isBest: false,
            isMentor: false
          }
        ]
      },
      {
        id: 'thread-2',
        title: 'Mnemonic for nephrotic syndromes',
        author: 'Luthfi',
        tags: ['Nephrology'],
        votes: 9,
        content: 'Need a way to remember minimal change vs FSGS vs membranous quickly.',
        attachments: [],
        mentions: [],
        answers: [
          {
            id: 'answer-3',
            author: 'Mentor Yuki',
            content: 'Use “MFM”: Minimal change = kids, FSGS = adult + HIV, Membranous = malignancy.',
            votes: 15,
            isBest: false,
            isMentor: true
          }
        ]
      }
    ]
  },
  {
    id: 'topic-2',
    name: 'Case Helpdesk',
    description: 'Post urgent cases and crowdsource differential diagnosis.',
    threads: [
      {
        id: 'thread-3',
        title: 'Septic shock with DIC on day 3',
        author: 'Rizal',
        tags: ['ICU', 'Hematology'],
        votes: 22,
        content: 'What is your approach to transfusion thresholds in DIC?',
        attachments: ['labs_day3.pdf'],
        mentions: ['@mentor_dina', '@icu_team'],
        answers: [
          {
            id: 'answer-4',
            author: 'dr. Dina',
            content: 'Follow SCCM: platelets <50k with bleeding or procedures; give cryo if fibrinogen <150.',
            votes: 27,
            isBest: true,
            isMentor: true
          }
        ]
      }
    ]
  },
  {
    id: 'topic-3',
    name: 'Mentor Office Hours',
    description: 'Structured Q&A with mentors and curated answer highlights.',
    threads: [
      {
        id: 'thread-4',
        title: 'How to structure OSCE presentations?',
        author: 'Alya',
        tags: ['OSCE', 'Communication'],
        votes: 14,
        content: 'Need a framework for concise OSCE handoffs.',
        attachments: [],
        mentions: ['@mentor_fajar'],
        answers: [
          {
            id: 'answer-5',
            author: 'dr. Fajar',
            content: 'Use SBAR + highlight red flags in 30 seconds, then propose plan.',
            votes: 20,
            isBest: false,
            isMentor: true
          }
        ]
      }
    ]
  }
];

const DiscussionForum: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [activeTopicId, setActiveTopicId] = useState(INITIAL_TOPICS[0]?.id ?? '');
  const [searchValue, setSearchValue] = useState('');
  const [draftQuestion, setDraftQuestion] = useState('');
  const [draftDetails, setDraftDetails] = useState('');
  const [draftTags, setDraftTags] = useState('');

  const activeTopic = topics.find(topic => topic.id === activeTopicId) ?? topics[0];

  const filteredThreads = useMemo(() => {
    if (!activeTopic) return [];
    return activeTopic.threads.filter(thread =>
      thread.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [activeTopic, searchValue]);

  const handleVote = (threadId: string, delta: number) => {
    setTopics(current =>
      current.map(topic =>
        topic.id !== activeTopic?.id
          ? topic
          : {
              ...topic,
              threads: topic.threads.map(thread =>
                thread.id === threadId ? { ...thread, votes: thread.votes + delta } : thread
              )
            }
      )
    );
  };

  const handleBestAnswer = (threadId: string, answerId: string) => {
    setTopics(current =>
      current.map(topic =>
        topic.id !== activeTopic?.id
          ? topic
          : {
              ...topic,
              threads: topic.threads.map(thread =>
                thread.id === threadId
                  ? {
                      ...thread,
                      answers: thread.answers.map(answer => ({
                        ...answer,
                        isBest: answer.id === answerId
                      }))
                    }
                  : thread
              )
            }
      )
    );
  };

  const handlePostQuestion = () => {
    if (!activeTopic || !draftQuestion.trim()) return;

    const newThread: Thread = {
      id: `thread-${Date.now()}`,
      title: draftQuestion,
      author: 'You',
      tags: draftTags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      votes: 0,
      content: draftDetails || 'No additional details provided yet.',
      attachments: ['case_notes.docx'],
      mentions: ['@mentor_team'],
      answers: []
    };

    setTopics(current =>
      current.map(topic =>
        topic.id === activeTopic.id ? { ...topic, threads: [newThread, ...topic.threads] } : topic
      )
    );
    setDraftQuestion('');
    setDraftDetails('');
    setDraftTags('');
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Peer-to-Peer Discussions</p>
            <h1 className="text-3xl font-bold text-gray-900">Discussion Forum</h1>
            <p className="text-gray-500">Topic-based threads with mentor-approved best answers, attachments, and rich-text notes.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
            <Search size={16} />
            <input
              className="w-48 border-0 focus:outline-none"
              placeholder="Search threads"
              value={searchValue}
              onChange={event => setSearchValue(event.target.value)}
            />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  topic.id === activeTopic?.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{topic.name}</p>
                <p className="text-xs text-gray-500 mt-1">{topic.description}</p>
                <p className="text-[10px] uppercase font-semibold text-gray-400 mt-2">{topic.threads.length} threads</p>
              </button>
            ))}
          </aside>

          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <MessageSquare className="text-indigo-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Ask a question</h2>
                  <p className="text-xs text-gray-500">Use markdown for rich text, tag mentors, and attach case files.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Question title"
                  value={draftQuestion}
                  onChange={event => setDraftQuestion(event.target.value)}
                />
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[120px]"
                  placeholder="Details, differential diagnosis, or context (markdown supported)"
                  value={draftDetails}
                  onChange={event => setDraftDetails(event.target.value)}
                />
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <input
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Tags (comma separated)"
                    value={draftTags}
                    onChange={event => setDraftTags(event.target.value)}
                  />
                  <button
                    onClick={handlePostQuestion}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Post Question
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><Paperclip size={12} /> Attachments supported</span>
                  <span className="inline-flex items-center gap-1"><AtSign size={12} /> Mention @mentor</span>
                  <span className="inline-flex items-center gap-1"><Sparkles size={12} /> AI summary available</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredThreads.map(thread => (
                <article key={thread.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{thread.title}</h3>
                      <p className="text-sm text-gray-500">Asked by {thread.author}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <button
                        onClick={() => handleVote(thread.id, 1)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1"
                      >
                        <ThumbsUp size={12} /> {thread.votes}
                      </button>
                      <button
                        onClick={() => handleVote(thread.id, -1)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-600">{thread.content}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {thread.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        <Tag size={12} /> {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                    {thread.attachments.map(file => (
                      <span key={file} className="inline-flex items-center gap-1"><Paperclip size={12} /> {file}</span>
                    ))}
                    {thread.mentions.map(mention => (
                      <span key={mention} className="inline-flex items-center gap-1"><AtSign size={12} /> {mention}</span>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3">
                    {thread.answers.map(answer => (
                      <div key={answer.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{answer.author}</p>
                            <p className="text-xs text-gray-500">{answer.isMentor ? 'Mentor' : 'Peer'} response</p>
                          </div>
                          <button
                            onClick={() => handleBestAnswer(thread.id, answer.id)}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                              answer.isBest
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'border border-gray-200 text-gray-500'
                            }`}
                          >
                            <CheckCircle size={12} /> {answer.isBest ? 'Best answer' : 'Mark best'}
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{answer.content}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <ThumbsUp size={12} /> {answer.votes}
                          {answer.isMentor && <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-semibold text-indigo-600">Mentor</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Flag size={12} /> Report or mute thread
                    </div>
                    <span>{thread.answers.length} answers</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;
