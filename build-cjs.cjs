const fs = require('fs');
const path = require('path');

console.log('🔧 Building Axon with proper method...');

// Create dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist');

// Copy and process HTML
const reactHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Axon - Blockchain & AI Platform</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" src="bundle.js"></script>
  </body>
</html>`;

fs.writeFileSync('dist/index.html', reactHtml);

// Copy public assets
if (fs.existsSync('public')) {
  copyDir('public', 'dist');
}

// Create a proper React bundle using Babel
const bundleContent = `
// Axon Application Bundle
// Generated: ${new Date().toISOString()}

console.log('🚀 Axon Application Loading...');

// Suppress extension errors
const originalError = console.error;
console.error = (...args) => {
    const errorMessage = args.join(' ');
    const suppressPatterns = [
        'content.bundle.js',
        'content-script.js', 
        'Smart Unit Converter',
        'Cannot read properties of null',
        'reading \'1\'',
        '1275'
    ];
    
    const shouldSuppress = suppressPatterns.some(pattern => errorMessage.includes(pattern));
    
    if (!shouldSuppress) {
        originalError.apply(console, args);
    }
};

// React App Component
const { useState, useEffect } = React;

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') setCurrentPage('dashboard');
    else if (path === '/wallet') setCurrentPage('wallet');
    else if (path === '/swap') setCurrentPage('swap');
    else if (path === '/profile') setCurrentPage('profile');
    else setCurrentPage('home');
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    const path = page === 'home' ? '/' : \`/\${page}\`;
    window.history.pushState({}, '', path);
  };

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">🧠 Axon</h1>
          <p className="text-xl text-gray-600">Blockchain & AI Platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('dashboard')}>
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
            <p className="text-gray-600">View portfolio and analytics</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('wallet')}>
            <div className="text-3xl mb-4">💳</div>
            <h3 className="text-lg font-semibold mb-2">Wallet</h3>
            <p className="text-gray-600">Manage digital assets</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('swap')}>
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Swap</h3>
            <p className="text-gray-600">Exchange tokens instantly</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('profile')}>
            <div className="text-3xl mb-4">👤</div>
            <h3 className="text-lg font-semibold mb-2">Profile</h3>
            <p className="text-gray-600">Account settings</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">⚠️</span>
            <h3 className="text-lg font-semibold">Development Mode</h3>
          </div>
          <p className="text-gray-700">This is a development build. Install dependencies for full production functionality.</p>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('home')} className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          ← Back to Home
        </button>
        <h1 className="text-4xl font-bold mb-8">📊 Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Balance:</span>
                <span className="font-bold">$12,345.67</span>
              </div>
              <div className="flex justify-between">
                <span>24h Change:</span>
                <span className="text-green-600 font-bold">+5.2%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="border-b pb-2">ETH → USDC: $500</div>
              <div className="border-b pb-2">Received: 0.1 BTC</div>
              <div className="border-b pb-2">Sent: 100 USDT</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Market Data</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ETH:</span>
                <span>$3,245.67</span>
              </div>
              <div className="flex justify-between">
                <span>BTC:</span>
                <span>$67,890.12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const WalletPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('home')} className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          ← Back to Home
        </button>
        <h1 className="text-4xl font-bold mb-8">💳 Wallet</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Connected Wallet</h3>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="font-mono">0x1234...5678</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Send To</label>
                <input type="text" className="w-full p-2 border rounded" placeholder="0x..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input type="number" className="w-full p-2 border rounded" placeholder="0.0" />
              </div>
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Send Transaction
            </button>
            <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SwapPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('home')} className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          ← Back to Home
        </button>
        <h1 className="text-4xl font-bold mb-8">🔄 Swap</h1>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Swap</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">From</label>
                <select className="w-full p-2 border rounded mb-2">
                  <option>ETH</option>
                  <option>USDC</option>
                  <option>USDT</option>
                </select>
                <input type="number" className="w-full p-2 border rounded" placeholder="0.0" />
              </div>
              
              <div className="text-center">
                <button className="p-2 bg-gray-200 rounded-full">⬇️</button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <select className="w-full p-2 border rounded mb-2">
                  <option>USDC</option>
                  <option>ETH</option>
                  <option>USDT</option>
                </select>
                <input type="number" className="w-full p-2 border rounded" placeholder="0.0" readOnly />
              </div>
              
              <button className="w-full bg-yellow-600 text-white py-3 rounded hover:bg-yellow-700 font-semibold">
                Swap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('home')} className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          ← Back to Home
        </button>
        <h1 className="text-4xl font-bold mb-8">👤 Profile</h1>
        
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">User Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input type="text" className="w-full p-2 border rounded" defaultValue="User123" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" className="w-full p-2 border rounded" defaultValue="user@example.com" />
              </div>
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                Update Profile
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Email notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Price alerts</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Dark mode</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'wallet': return <WalletPage />;
      case 'swap': return <SwapPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  return renderPage();
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Setup routing
window.addEventListener('popstate', () => {
  const path = window.location.pathname;
  if (path === '/dashboard') window.location.reload();
  else if (path === '/wallet') window.location.reload();
  else if (path === '/swap') window.location.reload();
  else if (path === '/profile') window.location.reload();
  else window.location.reload();
});
`;

fs.writeFileSync('dist/bundle.js', bundleContent);

console.log('✅ Build completed successfully!');
console.log('📁 Output: dist/');
console.log('📄 Files: index.html, bundle.js');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}