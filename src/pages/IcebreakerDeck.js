import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadCheckInState } from '../lib/checkInState';

const BASE_PROMPTS = [
  'Which wine or cocktail always reminds you of a special memory, and what’s the story behind it?',
  'If tonight had a theme song, what track would you pick and why?',
  'What’s the most delightful surprise you’ve experienced this year?',
  'Describe the best dinner party you’ve ever attended. What made it unforgettable?',
  'If you could host this gathering anywhere in the world, where would it be?',
  'What simple pleasure are you savoring lately?',
  'Which scent instantly transports you to another moment in time?',
  'Share a tradition you look forward to every year.',
  'What’s a question you love being asked?',
  'If you could thank one person at this table for being here tonight, who would it be and why?',
  'What’s the most meaningful compliment you’ve ever received?',
  'Tell us about a time you felt completely at ease.',
  'If your life right now had a signature drink, what would be in it?',
  'What’s a recent “first” that made you feel alive?',
  'Describe a moment you realized you’d grown or changed.',
  'What’s a luxury—big or small—you refuse to skip?',
  'If you could relive one evening from your past, which would you choose?',
  'What’s the boldest decision you’ve made while traveling?',
  'Share a book, film, or song that feels like comfort food to you.',
  'What’s something you’re curious about but haven’t explored yet?',
  'How do you honor important milestones in your life?',
  'What’s your favorite way to unwind after a long day?',
  'Which hobby would you pursue if time and resources were endless?',
  'Tell us about a conversation that changed your mind about something.',
  'What’s a dish you’ve mastered that always wows guests?',
  'If you could learn the life story of anyone in the world, whose would it be?',
  'What’s an underrated joy that deserves more appreciation?',
  'Who has been a quiet mentor in your life?',
  'What’s a personal ritual you practice before gatherings like this?',
  'Describe a place that makes you feel instantly grounded.',
  'What’s an opinion you hold that tends to spark good debates?',
  'Share a time you laughed until you cried.',
  'If you could bottle the feeling of tonight, what notes would it include?',
  'What’s a tradition you hope to start someday?',
  'Which artist or creator never fails to inspire you?',
  'What conversation topic never gets old for you?',
  'Who is someone you’ve met only once but still think about?',
  'What’s a risk you took that didn’t go as planned, but you’re glad you tried?',
  'If you could guarantee one shared experience for everyone here, what would it be?',
  'Describe the last moment that took your breath away.',
  'What’s something deliciously nostalgic you’d love to revisit?',
  'Which season of your life are you in right now, and how does it taste?',
  'What’s the most thoughtful gift you’ve ever given or received?',
  'Share a memory tied to a particular flavor.',
  'If you could invite anyone—past or present—to join us tonight, who would it be?',
  'What’s a recent compliment you gave that felt especially genuine?',
  'What does “home” taste like to you?',
  'Describe a time when you felt truly heard.',
  'What’s a family story you hope never gets lost?',
  'If you could freeze this evening for one moment, which would you pick?',
  'What’s a lesson you learned the hard way but wouldn’t change?',
  'What does your ideal Sunday morning look like?',
  'Which quality do you admire most in the people gathered here?',
  'What’s a local spot you love introducing friends to?',
  'Describe your current mood as a flavor profile.',
  'What’s a dream you’ve recently outgrown?',
  'Who in your life makes you feel most like yourself?',
  'Share a time you surprised yourself with your own bravery.',
  'What’s a soundtrack to your childhood dinners?',
  'If you could master one culinary skill overnight, what would it be?',
  'What’s a conversation you’ve replayed in your head because it felt so good?',
  'Which historical era would you visit for one evening’s celebration?',
  'What’s your favorite icebreaker question—and why does it work for you?',
  'If you could change one thing about typical dinner parties, what would it be?',
  'Describe the moment you felt most connected to nature.',
  'What keeps you grounded when life feels busy?',
  'What’s the most interesting thing you’ve learned about wine or food recently?',
  'Share an act of kindness from a stranger you still think about.',
  'What’s a simple ritual that signals “it’s time to relax” for you?',
  'If you could instantly adopt a new accent for one night, which would you choose?',
  'What’s a recent conversation that shifted your perspective?',
  'Which flavor combination feels like a metaphor for your personality?',
  'What’s a question you wish people asked you more often?',
  'If you could host a salon with any topic, what would guests discuss?',
  'Describe the last time you felt truly inspired.',
  'What’s a goal you’re savoring rather than rushing toward?',
  'Which fictional dinner party would you crash, and why?',
  'What’s a piece of advice you’ve received that aged well?',
  'Share a travel story that still makes you smile.',
  'If you could give today’s version of yourself a toast, what would you say?',
  'What’s a flavor or ingredient you recently fell in love with?',
  'Describe the role food plays in your favorite memories.',
  'Which habit have you adopted that genuinely improved your life?',
  'What’s a conversation starter that never fails to spark warmth?',
  'If you could time-travel to witness one historic meal, which would it be?',
  'Describe a moment when a stranger’s recommendation made your day.',
  'What’s something you’ve collected over the years and why?',
  'Who taught you the most about hospitality?',
  'What’s a dish that instantly connects you to your culture or heritage?',
  'Share a recent moment of serendipity.',
  'What’s a flavor pairing you think deserves more hype?',
  'If money were no object, what would your dream tasting menu include?',
  'Which aroma is guaranteed to lift your spirits?',
  'What’s a conversation topic you’re currently obsessed with?',
  'Describe a time you felt proud to be exactly where you were.',
  'What’s the most memorable toast you’ve ever heard?',
  'If you could create a signature wine blend, what would you name it?',
  'What’s a question you’d love to ask everyone at this table?',
  'Share a small act of self-care that feels indulgent.',
  'What’s a flavor you associate with love?',
  'If you could pass down one recipe to future generations, which would it be?',
  'Describe a conversation that made you feel deeply connected to someone.',
  'What’s a risk you’re glad you took, even if it scared you?',
  'Which person in your life do you wish could be here tonight?',
  'What’s your favorite way to bring strangers together?',
  'Share a hope you have for the rest of this year.',
  'What’s a question you’re still searching for the answer to?',
];

function IcebreakerDeck() {
  const navigate = useNavigate();
  const location = useLocation();
  const [attendee, setAttendee] = useState(() => {
    if (location.state?.name) {
      return location.state;
    }
    return loadCheckInState();
  });

  useEffect(() => {
    if (location.state?.name) {
      setAttendee(location.state);
      return;
    }

    const stored = loadCheckInState();
    if (stored) {
      setAttendee(stored);
    } else {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const attendeeName = attendee?.name || 'Guest';
  const attendeeLocation = attendee?.location;

  const [deck, setDeck] = useState(() => shuffle([...BASE_PROMPTS]));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advanceTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  const visibleCards = useMemo(() => {
    if (deck.length === 0) {
      return [];
    }
    return [0, 1, 2].map((offset) => deck[(currentIndex + offset) % deck.length]);
  }, [deck, currentIndex]);

  const handleNextCard = () => {
    if (deck.length === 0 || isAdvancing) {
      return;
    }

    setIsAdvancing(true);
    advanceTimeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
      setIsAdvancing(false);
    }, 320);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 py-10 text-slate-100 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 sm:gap-12">
        <header className="space-y-3 sm:space-y-4 md:space-y-5">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400 sm:text-sm">
            Icebreaker Lounge
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            You're checked in! Use the prompt cards to help break the ice.
          </h1>
        </header>

        <div className="relative">
          <div
            className="absolute inset-0 -translate-y-10 translate-x-4 rounded-[34px] bg-purple-500/20 blur-3xl sm:-translate-y-12 sm:translate-x-6 sm:rounded-[40px]"
            aria-hidden
          />
          <div className="relative rounded-[28px] border border-white/10 bg-slate-900 px-6 py-8 shadow-2xl shadow-purple-900/40 sm:rounded-[32px] sm:px-8 sm:py-10 md:px-12 md:py-12">
            <div className="flex flex-col items-center gap-4 text-center sm:gap-6">
              <h2 className="text-xl font-semibold text-white sm:text-2xl md:text-3xl">
                Share Your Event Photos
              </h2>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base md:text-lg">
                Capture the memories! Upload pictures from the event to help preserve these special moments.
              </p>
              <a
                href="https://app.kululu.com/upload/w9p97x"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-300 focus-visible:ring-offset-slate-900 sm:text-base"
              >
                Upload Photos
              </a>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 -translate-y-10 translate-x-4 rounded-[34px] bg-sky-500/25 blur-3xl sm:-translate-y-12 sm:translate-x-6 sm:rounded-[40px]"
            aria-hidden
          />
          <div
            className={`relative flex flex-col gap-8 rounded-[28px] border border-white/10 bg-slate-900 px-6 py-8 shadow-2xl shadow-sky-900/60 transition-transform duration-500 sm:gap-10 sm:rounded-[32px] sm:px-8 sm:py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-12 ${isAdvancing ? 'card-shuffle' : ''}`}
          >
            <div className="relative flex h-[270px] w-full flex-col items-center justify-center sm:h-[330px] md:h-[390px] md:w-2/3">
              {visibleCards.map((prompt, index) => {
                const rotation = index === 0 ? 'rotate-0' : index === 1 ? '-rotate-1.5' : 'rotate-1.5';
                const translate =
                  index === 0
                    ? 'translate-y-0'
                    : index === 1
                      ? 'translate-y-3 sm:translate-y-4 translate-x-3 sm:translate-x-4 md:translate-y-6 md:translate-x-6'
                      : 'translate-y-6 sm:translate-y-8 -translate-x-3 sm:-translate-x-4 md:translate-y-10 md:-translate-x-6';
                const opacity = index === 0 ? 'opacity-100' : index === 1 ? 'opacity-85' : 'opacity-70';
                const zIndex = index === 0 ? 'z-30' : index === 1 ? 'z-20' : 'z-10';

                return (
                  <article
                    key={`${prompt}-${index}`}
                    className={`absolute flex h-[250px] w-full max-w-[19rem] flex-col justify-between rounded-[24px] border border-white/15 bg-gradient-to-br from-white to-slate-100 px-6 py-5 text-slate-800 shadow-xl shadow-slate-900/40 transition-all duration-500 ease-out sm:h-[300px] sm:max-w-md sm:rounded-[30px] sm:px-8 sm:py-7 md:h-[340px] md:px-9 md:py-8 ${rotation} ${translate} ${opacity} ${zIndex}`}
                    aria-hidden={index !== 0}
                  >
                    <div className="flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-slate-500 sm:text-xs md:text-sm">
                      <span>Prompt</span>
                      <span>{String((currentIndex + index) % deck.length + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl md:text-3xl">
                      {prompt}
                    </p>
                    <div className="flex items-center justify-between text-[0.7rem] text-slate-500 sm:text-xs md:text-sm">
                      <span>Deck of {deck.length}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex w-full flex-col gap-3 sm:gap-4 md:w-1/3">
              <button
                type="button"
                onClick={handleNextCard}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-300 focus-visible:ring-offset-slate-900 sm:text-base"
              >
                Reveal next prompt
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm shadow-lg shadow-indigo-950/40 backdrop-blur-md sm:px-6 sm:py-5 md:max-w-sm">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-300 sm:text-xs">
              Checked-In Guest
            </p>
            <p className="mt-2 text-base font-semibold text-white sm:text-lg">{attendeeName}</p>
            {attendeeLocation && (
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Currently near: <span className="text-slate-200">{attendeeLocation}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-xs font-medium text-slate-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 focus-visible:ring-offset-slate-900 sm:text-sm"
          >
            Back to check-in
          </button>
        </div>
      </div>
    </div>
  );
}

function shuffle(array) {
  const shuffled = [...array];
  const random =
    typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues
      ? (limit) => {
          const buffer = new Uint32Array(1);
          window.crypto.getRandomValues(buffer);
          return buffer[0] % limit;
        }
      : (limit) => Math.floor(Math.random() * limit);

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = random(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default IcebreakerDeck;

