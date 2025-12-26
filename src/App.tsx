// @ts-expect-error okay
import '@fontsource-variable/sora';
import logo from './assets/logo.svg'
import trophy from "./assets/trophy.svg"

function App() {
  const personalBest = 92
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
    <dl>

      <dd>
        <span>WPM:</span>
        <span>0</span>
      </dd>

      <dd>
        <span>Accuracy:</span>
        <span>100%</span>
      </dd>

      <dd>
        <span>Time:</span>
        <span>00:60</span>
      </dd>

      {/* Actions buttons */}
      <div>

        <span>
          Difficulty:
        </span>

          <div>



            
          </div>

      </div>
    </dl>
  </main>)
}

export default App
