// @ts-expect-error okay
import '@fontsource-variable/sora';
import { createCollection, localStorageCollectionOptions } from '@tanstack/react-db';
import { useLiveQuery } from '@tanstack/react-db';
import { Fragment, useEffect } from 'react';
import logo from './assets/logo.svg';
import trophy from "./assets/trophy.svg";
import keyboard from './assets/keyboard.svg'

import { SelectButton, Button } from './components/button';
import { NativeSelect, NativeSelectOption } from './components/NativeSelect';


interface UserStats {
  userId: string;
  personalBest: number;
  started: boolean;
  totalGames: number;
  gameStats: {
    gameId: string;
    stats: number;
    endedAt: number;
  }[]
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

function App() {
  const { data: prefs } = useLiveQuery((q) =>
    q.from({ pref: userPrefences })
    // .where(({ pref }) => pref.id === 'singleton')
  )

  const currentPrefs = prefs?.[0]

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

  const personalBest = 92;
  const stats = [['WPM:', 0], ['Accuracy:', "100%"], ["Time:", '0:60']]

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
            {stats.map(([key, value], index) => (
              <Fragment key={index}>
                <dd className='flex item-center gap-x-3 max-sm:flex-col max-sm:w-full max-sm:items-center max-sm:justify-between max-sm:gap-y-2'>
                  <span className='text-preset-3 text-neutral-400 max-sm:text-preset-3-mobile'>{key}</span>
                  <span className='text-preset-2 text-white'>{value}</span>
                </dd>
                {index != stats.length - 1 && (
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

          <section className='text-preset-1-regular text-neutral-0 backdrop-blur-2xl blur-md relative col-start-1 row-start-1 '>
            The archaeological expedition unearthed artifacts that complicated prevailing theories about Bronze Age trade networks. Obsidian from Anatolia, lapis lazuli from Afghanistan, and amber from the Baltic—all discovered in a single Mycenaean tomb—suggested commercial connections far more extensive than previously hypothesized. "We've underestimated ancient peoples' navigational capabilities and their appetite for luxury goods," the lead researcher observed. "Globalization isn't as modern as we assume."
          </section>

          <div className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-4 z-10 ">
            <Button className="px-6 py-3 bg-blue-500 text-white rounded-lg">
              Start Typing Test
            </Button>
            <p className="text-neutral-400 text-sm">
              Or click the text and start typing
            </p>
          </div>
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