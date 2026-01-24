import React, { useMemo, useState } from 'react';
import { Send, Hash, Users, Sparkles, UserCheck } from 'lucide-react';

type ChatMessage = {
  id: string;
  sender: string;
  content: string;
  time: string;
  type: 'message' | 'system';
};

type Channel = {
  id: string;
  name: string;
  topic: string;
  messages: ChatMessage[];
  typingUsers: string[];
};

type PresenceUser = {
  id: string;
  name: string;
  status: 'online' | 'away' | 'busy';
};

const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'channel-1',
    name: 'general',
    topic: 'Daily check-ins & announcements',
    typingUsers: ['Tia'],
    messages: [
      {
        id: 'm1',
        sender: 'System',
        content: 'Welcome to Cardio Mastery Squad! Real-time sync is active.',
        time: '09:00',
        type: 'system'
      },
      {
        id: 'm2',
        sender: 'Raka',
        content: 'Reminder: group exam starts in 20 minutes, please open the shared deck.',
        time: '09:10',
        type: 'message'
      },
      {
        id: 'm3',
        sender: 'dr. Arini',
        content: 'I will drop hints on ECG interpretation in the thread after the exam.',
        time: '09:12',
        type: 'message'
      }
    ]
  },
  {
    id: 'channel-2',
    name: 'case-board',
    topic: 'Discussing ongoing cases & differentials',
    typingUsers: [],
    messages: [
      {
        id: 'm4',
        sender: 'Tia',
        content: 'Sharing the updated problem list for our ACS patient now.',
        time: '08:55',
        type: 'message'
      }
    ]
  },
  {
    id: 'channel-3',
    name: 'flashcard-room',
    topic: 'Collaborative flashcard writing',
    typingUsers: ['Mira', 'Seno'],
    messages: [
      {
        id: 'm5',
        sender: 'Mira',
        content: 'Added 12 new cards on arrhythmia management. Please review!',
        time: '08:40',
        type: 'message'
      }
    ]
  }
];

const PRESENCE: PresenceUser[] = [
  { id: 'p1', name: 'dr. Arini', status: 'online' },
  { id: 'p2', name: 'Raka', status: 'busy' },
  { id: 'p3', name: 'Tia', status: 'online' },
  { id: 'p4', name: 'Mira', status: 'away' }
];

const GroupChat: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState(INITIAL_CHANNELS[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeChannel = useMemo(
    () => channels.find(channel => channel.id === activeChannelId) ?? channels[0],
    [channels, activeChannelId]
  );

  const handleSend = () => {
    if (!draft.trim() || !activeChannel) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'You',
      content: draft,
      time: 'Now',
      type: 'message'
    };

    setChannels(current =>
      current.map(channel =>
        channel.id === activeChannel.id
          ? { ...channel, messages: [...channel.messages, newMessage], typingUsers: [] }
          : channel
      )
    );
    setDraft('');
    setIsTyping(false);
  };

  return (
    <div className="h-full overflow-hidden bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto h-full grid gap-6 lg:grid-cols-[240px_1fr_240px]">
        <aside className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Hash size={16} className="text-indigo-600" /> Channels
            </h2>
            <div className="mt-3 space-y-2">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    channel.id === activeChannel?.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="font-semibold">#{channel.name}</p>
                  <p className="text-xs text-gray-500">{channel.topic}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" /> Real-time Signals
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li>Live typing indicators enabled</li>
              <li>Presence auto-updates every 5s</li>
              <li>Mentor highlight mode active</li>
            </ul>
          </div>
        </aside>

        <section className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h1 className="text-lg font-semibold text-gray-900">#{activeChannel?.name}</h1>
            <p className="text-xs text-gray-500">{activeChannel?.topic}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {activeChannel?.messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'system' ? 'justify-center' : 'justify-start'}`}>
                <div
                  className={`rounded-xl px-4 py-2 text-sm ${
                    message.type === 'system'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-indigo-50 text-gray-700'
                  }`}
                >
                  {message.type === 'message' && <p className="text-xs font-semibold text-indigo-600">{message.sender}</p>}
                  <p>{message.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{message.time}</p>
                </div>
              </div>
            ))}
            {activeChannel?.typingUsers.length ? (
              <p className="text-xs text-gray-400">{activeChannel.typingUsers.join(', ')} typing...</p>
            ) : null}
          </div>

          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <input
                value={draft}
                onChange={event => {
                  setDraft(event.target.value);
                  setIsTyping(event.target.value.length > 0);
                }}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                placeholder="Share an update or ask a question"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <button
                onClick={handleSend}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
              >
                <Send size={16} /> Send
              </button>
            </div>
            {isTyping && <p className="text-[10px] text-gray-400 mt-2">You are typing…</p>}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Users size={16} className="text-indigo-600" /> Online now
            </h2>
            <div className="mt-3 space-y-2">
              {PRESENCE.map(person => (
                <div key={person.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                  <span>{person.name}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                      person.status === 'online'
                        ? 'bg-emerald-100 text-emerald-600'
                        : person.status === 'busy'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {person.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-500" /> Mentor Q&A
            </h2>
            <p className="mt-2 text-xs text-gray-500">Live mentor office hours every Tuesday 20.00 WIB.</p>
            <button className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white">
              Notify me
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GroupChat;
