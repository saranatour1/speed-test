// @ts-expect-error okay
import '@fontsource-variable/sora';
import { createCollection, localOnlyCollectionOptions, localStorageCollectionOptions } from '@tanstack/react-db';
import { useLiveQuery } from '@tanstack/react-db';
import { Fragment, use, useEffect, useMemo, useState } from 'react';
import logo from './assets/logo.svg';
import trophy from "./assets/trophy.svg";
import keyboard from './assets/keyboard.svg'

import { SelectButton, Button } from './components/button';
import { NativeSelect, NativeSelectOption } from './components/NativeSelect';
import allScripts from './lib/data.json'
import { useTypingTest, type CharacterStatus } from './hooks/useTypingTest';


interface GameStats {
  gameId: string;
  startedAt: number;
  endedAt: number;
  wpm: number;
  accuracy: number;
  mode: Modes;
  difficulty: Difficulty;
}

interface AllTimeStats {
  games: number;
  lastTotal: number;
  best: number;
  userId: string;
}

interface TypingRuntimeState {
  started: boolean;
  startTime: number | null;
  elapsedMs: number;
  cursor: number;
  input: string;
  errors: number;
  totalTyped: number;
}


const difficultyOptions = ["Easy", "Medium", "Hard"] as const
const modeOptions = ["Timed (60s)", "Passage"] as const

type Difficulty = typeof difficultyOptions[number];
type Modes = typeof modeOptions[number]

interface UserPrefrences {
  id: string;
  userId: string | number;
  preferredActions: {
    difficulty: typeof difficultyOptions[number];
    modeOptions: typeof modeOptions[number]
  }
}

const userPrefsOptions = localStorageCollectionOptions<UserPrefrences>({
  id: 'user-prefs',
  storageKey: "user-prefs",
  getKey: (item) => item.id,
})

const userPrefences = createCollection(userPrefsOptions)

// Game stats
const gameStatsOptions = localOnlyCollectionOptions<GameStats>({
  getKey: (item) => item.gameId,
})

const gameStats = createCollection(gameStatsOptions)

const allTimeStats = createCollection(localStorageCollectionOptions<AllTimeStats>({
  id: "all-time",
  storageKey: 'all-time',
  getKey(item) {
    return item.userId
  },
}))

// Define the type for allScripts keys
type ScriptDifficulty = keyof typeof allScripts;

// Helper to get a random script for a given difficulty
function getRandomScript(difficulty: ScriptDifficulty) {
  const scripts = allScripts[difficulty];
  return scripts[Math.floor(Math.random() * scripts.length)];
}

function App() {
  const [showResults, setShowResults] = useState(false);

  const { data: prefs, } = useLiveQuery((q) =>
    q.from({ pref: userPrefences })
    // .where(({ pref }) => pref.id === 'singleton')
  )
  const { data: gameData } = useLiveQuery((q) => q.from({ gameStats }))

  const { data:allTimeData } = useLiveQuery((q) => q.from({ allTimeStats }))

  const currentPrefs = prefs?.[0];

  const currentScript = useMemo(() => {
    return getRandomScript(currentPrefs.preferredActions.difficulty.toLocaleLowerCase() as ScriptDifficulty)
  }, [currentPrefs])

  const userStats = allTimeData?.[0];
  const personalBest = userStats?.best || 0;

  const {
    state,
    startTest,
    resetTest,
    handleKeyPress,
    getCharacterStatuses,
    currentStats,
  } = useTypingTest(
    currentScript.text,
    currentPrefs?.preferredActions.modeOptions || 'Passage',
    (finalStats: { wpm: number; accuracy: number; timeElapsed: string }) => {
      // Save game stats when test completes
      const gameId = crypto.randomUUID();
      gameStats.insert({
        gameId,
        startedAt: state.startTime!,
        endedAt: Date.now(),
        wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        mode: currentPrefs?.preferredActions.modeOptions || 'Passage',
        difficulty: currentPrefs?.preferredActions.difficulty || 'Easy',
      });

      // Update all-time stats
      if (currentPrefs) {
        const currentBest = userStats?.best || 0;
        const newBest = Math.max(currentBest, finalStats.wpm);
        
        if (userStats) {
          allTimeStats.update(userStats.userId, (draft) => {
            draft.games += 1;
            draft.lastTotal = finalStats.wpm;
            draft.best = newBest;
          });
        } else {
          allTimeStats.insert({
            userId: currentPrefs.userId,
            games: 1,
            lastTotal: finalStats.wpm,
            best: newBest,
          });
        }
      }

      setShowResults(true);
    }
  );

  useEffect(() => {
    if (!currentPrefs && userPrefences.isReady()) {
      const newPrefs: UserPrefrences = {
        id: 'singleton',
        userId: crypto.randomUUID(),
        preferredActions: {
          difficulty: 'Easy',
          modeOptions: 'Passage'
        }
      }

      userPrefences.insert(newPrefs)
    }
  }, [currentPrefs])
 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.started && !state.finished) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.started, state.finished, handleKeyPress]);


    const handleStartTest = () => {
    setShowResults(false);
    startTest();
  };

  const handleRestart = () => {
    setShowResults(false);
    resetTest();
  };

  const characterStatuses = getCharacterStatuses();

  // Display stats
  const displayStats = [
    ['WPM:', currentStats.wpm],
    ['Accuracy:', `${currentStats.accuracy}%`],
    ['Time:', currentStats.timeElapsed],
  ];

  if (!currentPrefs) return null;

  return (
    <main className='px-28 py-8 flex flex-col items-start justify-start gap-y-16 min-h-screen bg-neutral-900 w-full max-w-full max-md:gap-y-10 max-md:px-8 max-sm:py-4 max-sm:gap-y-8'>
      <nav className='w-full flex items-center justify-between '>
        <img src={logo} alt="keyboard logo from frontend mentor" className='max-sm:hidden' />
        <img src={keyboard} alt="keyboard logo for small size screens" className='hidden max-sm:block' />
        <p className='flex items-center gap-x-2.5 text-preset-4 text-neutral-0 max-sm:text-preset-3-mobile'>
          <img src={trophy} alt="trophy logo" className='text-yellow-400' />
          <span className='text-neutral-400 capitalize'> <span className='text-neutral-400 max-sm:hidden'>Personal</span> best:</span>
          {personalBest} WPM
        </p>
      </nav>

      <div className='w-full flex flex-col items-start justify-start gap-y-8'>

        {/* Stats container */}
        <dl className='flex items-center justify-between w-full flex-wrap border-b-2 border-b-neutral-400 pb-4 gap-4'>
          <div className='flex items-center justify-center gap-x-3 max-sm:w-full max-sm:gap-x-5'>
            {displayStats.map(([key, value], index) => (
              <Fragment key={index}>
                <dd className='flex item-center gap-x-3 max-sm:flex-col max-sm:w-full max-sm:items-center max-sm:justify-between max-sm:gap-y-2'>
                  <span className='text-preset-3 text-neutral-400 max-sm:text-preset-3-mobile'>{key}</span>
                  <span className='text-preset-2 text-white'>{value}</span>
                </dd>
                {index != displayStats.length - 1 && (
                  <hr className='w-px h-6 max-sm:h-12.75 bg-[#3A3A3A]' />
                )}
              </Fragment>
            ))}
          </div>

          {/* Actions buttons */}
          <div className='flex items-center justify-center gap-4 max-sm:w-full'>
            <OptionGroup
              label="Difficulty:"
              options={[...difficultyOptions]}
              selected={currentPrefs?.preferredActions.difficulty}
              field='difficulty'
              currentPrefs={currentPrefs}
            />
            <hr className='h-7.75 w-px bg-neutral-400 max-sm:hidden ' />
            <OptionGroup
              label="Mode:"
              options={[...modeOptions]}
              selected={currentPrefs?.preferredActions.modeOptions}
              field='modeOptions'
              currentPrefs={currentPrefs}
            />
          </div>
        </dl>


        {/* Typing container  */}
        <div className="grid grid-cols-1 grid-rows-1 w-full">

          <section className='text-preset-1-regular relative col-start-1 row-start-1 max-sm:text-preset-1-regular-mobile leading-relaxed'>
            {characterStatuses.map((charStatus: CharacterStatus, index:number) => (
              <span
                key={index}
                className={`${
                  charStatus.status === 'pending'
                    ? 'text-neutral-400'
                    : charStatus.status === 'correct'
                    ? 'text-green-400'
                    : charStatus.status === 'incorrect'
                    ? 'text-red-400 bg-red-900/30 rounded-sm'
                    : 'bg-blue-500/30 border-l-2 border-blue-500'
                } ${charStatus.char === ' ' ? 'inline-block w-2' : ''}`}
              >
                {charStatus.char === ' ' ? '\u00A0' : charStatus.char}
              </span>
            ))}
          </section>

          {/* <div className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-4 z-10 ">
            <Button className="px-6 py-3 bg-blue-500 text-white rounded-lg" onClick={() => {
              // start game here, should we start. a timer 
                setStarted(true)
            }}>
              Start Typing Test
            </Button>
            <p className="text-neutral-400 text-sm">
              Or click the text and start typing
            </p>
          </div> */}


                {/* Overlay with start/results */}
          {(!state.started || showResults) && (
            <div className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-4 z-10 bg-neutral-900/80 backdrop-blur-sm p-8 rounded-lg">
              {showResults ? (
                <>
                  <h2 className="text-preset-1 text-white mb-4">Test Complete!</h2>
                  <div className="flex flex-col gap-3 text-center mb-6">
                    <p className="text-preset-2 text-blue-400">
                      {currentStats.wpm} WPM
                    </p>
                    <p className="text-preset-3 text-neutral-200">
                      Accuracy: {currentStats.accuracy}%
                    </p>
                    <p className="text-preset-4 text-neutral-400">
                      Time: {currentStats.timeElapsed}
                    </p>
                  </div>
                  <Button
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    onClick={handleRestart}
                  >
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    onClick={handleStartTest}
                  >
                    Start Typing Test
                  </Button>
                  <p className="text-neutral-400 text-sm">
                    Or start typing to begin
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

const OptionGroup = ({
  label,
  options,
  selected,
  field,
  currentPrefs
}: {
  label: string;
  options: (Difficulty | Modes)[];
  selected?: Difficulty | Modes;
  field: 'difficulty' | 'modeOptions';
  currentPrefs?: UserPrefrences;
}) => {
  return (
    <>
      <div className='flex items-center justify-center gap-1.5 max-sm:hidden'>
        <span className='text-preset-5 text-neutral-400 max-sm:hidden'>{label}</span>
        <div className='flex items-center justify-center gap-1.5'>
          {options.map(option => (
            <SelectButton onClick={() => {
              if (currentPrefs) {
                console.log(currentPrefs.id)
                userPrefences.update(currentPrefs.id, (draft) => {
                  if (field === "difficulty") {
                    draft.preferredActions.difficulty = (option as Difficulty)
                  } else {
                    draft.preferredActions.modeOptions = (option as Modes)
                  }
                })
              }
            }}
              key={option} className={selected === option ? 'ring-1 border border-blue-400 text-blue-400 ring-blue-400' : ""}>
              {option}
            </SelectButton>
          ))}
        </div>
      </div>

      <div className="sm:hidden max-sm:w-full max-sm:flex max-sm:items-center max-sm:justify-center max-sm:gap-2.5">
        <NativeSelect
          className='w-full border border-white rounded-8 text-preset-5 text-white '
          value={selected || ''}
          onChange={(e) => {
            if (currentPrefs) {
              userPrefences.update(currentPrefs.id, (draft) => {
                if (field === "difficulty") {
                  draft.preferredActions.difficulty = (e.target.value as Difficulty)
                } else {
                  draft.preferredActions.modeOptions = (e.target.value as Modes)
                }
              })
            }
          }}
        >
          <NativeSelectOption value="" disabled className='w-full'>
            {label.replace(':', '')}
          </NativeSelectOption>
          {options.map(option => (
            <NativeSelectOption key={option} value={option} className='w-full text-center text-preset-5'>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </>
  )
}

export default App