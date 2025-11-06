import { UniteXLogo } from './components/UniteXLogo';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-slate-800 mb-2">UniteX App Icons</h1>
          <p className="text-slate-600">Professional app icons for iOS and Android</p>
        </div>

        {/* Main Icons Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Dark Mode Icon */}
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center mb-8">
              <h2 className="text-slate-800 mb-2">Dark Mode</h2>
              <p className="text-slate-500">Like X (Twitter)</p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="relative">
                <UniteXLogo size={280} theme="dark" />
                {/* Shadow effect for icon */}
                <div className="absolute inset-0 -z-10 blur-2xl opacity-20 bg-black rounded-[60px]"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center gap-3">
                <UniteXLogo size={120} theme="dark" />
                <span className="text-slate-500">120px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <UniteXLogo size={80} theme="dark" />
                <span className="text-slate-500">80px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <UniteXLogo size={60} theme="dark" />
                <span className="text-slate-500">60px</span>
              </div>
            </div>
          </div>

          {/* Light Mode Icon */}
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center mb-8">
              <h2 className="text-slate-800 mb-2">Light Mode</h2>
              <p className="text-slate-500">White & Blue Theme</p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="relative">
                <UniteXLogo size={280} theme="light" />
                {/* Shadow effect for icon */}
                <div className="absolute inset-0 -z-10 blur-2xl opacity-15 bg-blue-500 rounded-[60px]"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center gap-3">
                <UniteXLogo size={120} theme="light" />
                <span className="text-slate-500">120px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <UniteXLogo size={80} theme="light" />
                <span className="text-slate-500">80px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <UniteXLogo size={60} theme="light" />
                <span className="text-slate-500">60px</span>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
