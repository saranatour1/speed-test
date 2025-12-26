// @ts-expect-error okay
import '@fontsource-variable/sora';
import logo from './assets/logo.svg'
import trophy from "./assets/trophy.svg"
import { SelectButton } from './components/button';

function App() {
  const personalBest = 92;

  const stats = [['WPM:', 0], ['Accuracy:', "100%"], ["Time:", '0:60']]

  const difficultyOptions = ["Easy", "Medium", "Hard"]
  const modeOptions = ["Timed (60s)", "Passage"]


  return (<main className='px-[112px] py-[32px] flex flex-col items-start justify-start gap-y-[64px] bg-neutral-900 w-full max-w-full h-screen'>

    <nav className='w-full flex items-center justify-between '>
      <img src={logo} alt="keyboard logo from frontend mentor" />


      <p className='flex items-center gap-x-2.5 text-preset-4 text-neutral-0'>
        <img src={trophy} alt="trophy logo" />

        <span className='text-neutral-400'>Personal best:</span>
        {personalBest} WPM
      </p>
    </nav>

    {/* Stats container */}
    <dl className='flex items-center justify-between w-full flex-wrap'>


      <div className='flex items-center justify-center gap-x-3'>
      {stats.map(([key, value], index) => (
        <>   
        <dd className='flex item-center gap-x-3'>
          <span className='text-preset-3 text-neutral-400'>{key}</span>
          <span className='text-preset-2 text-white'>{value}</span>
        </dd>
        {index != stats.length - 1 && <svg width="1" height="24" viewBox="0 0 1 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="1" height="24" fill="#3A3A3A" />
        </svg>}
        </>
      ))}

        </div>

      {/* Actions buttons */}
      <div className='flex items-center justify-center gap-4'>
        <OptionGroup label="Difficulty:" options={difficultyOptions} />
        <svg width="1" height="31" viewBox="0 0 1 31" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0.5C0 0.223857 0.223858 0 0.5 0C0.776142 0 1 0.223858 1 0.5V30.5C1 30.7761 0.776142 31 0.5 31C0.223858 31 0 30.7761 0 30.5V0.5Z" fill="#3A3A3A"/>
</svg>

        <OptionGroup label="Mode:" options={modeOptions} />
      </div>
    </dl>
  </main>)
}


  const OptionGroup = ({ label, options }: { label: string; options: string[] }) => (
    <div className='flex items-center justify-center gap-1.5'>
      <span className='text-preset-5 text-neutral-400'>{label}</span>
      <div className='flex items-center justify-center gap-1.5'>
        {options.map(option => (
          <SelectButton key={option}>
            {option}
          </SelectButton>
        ))}
      </div>
    </div>
  )


export default App
