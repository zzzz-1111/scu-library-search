
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Book, History, Settings, ExternalLink, Trash2, X, Info } from 'lucide-react';

// Default URL provided by the user
const DEFAULT_BASE_URL = "http://opac.scu.edu.cn:8080/F/9F63EJD6J8RI1731DPHAUF7B5FM4JB151M4D369YC7XFUCITEF-09218?func=find-m&find_code=WRD&request=%E5%8D%81%E5%88%86%E9%92%9F%E5%86%A5%E6%83%B3&find_base=CNPUB&find_base=ENPUB&pds_handle=GUEST&pds_handle=GUEST";

const App: React.FC = () => {
  const [bookTitle, setBookTitle] = useState('');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [history, setHistory] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Load history and settings from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('scu_search_history');
    const savedUrl = localStorage.getItem('scu_base_url');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedUrl) setBaseUrl(savedUrl);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('scu_search_history', JSON.stringify(history));
  }, [history]);

  // Save base URL to localStorage
  useEffect(() => {
    localStorage.setItem('scu_base_url', baseUrl);
  }, [baseUrl]);

  const generateSearchUrl = (title: string) => {
    try {
      const url = new URL(baseUrl);
      const params = new URLSearchParams(url.search);
      params.set('request', title);
      url.search = params.toString();
      return url.toString();
    } catch (e) {
      console.error("Invalid URL format", e);
      return '';
    }
  };

  const handleSearch = useCallback((title: string = bookTitle) => {
    if (!title.trim()) return;

    const finalUrl = generateSearchUrl(title);
    if (finalUrl) {
      window.open(finalUrl, '_blank');
      
      // Update history
      setHistory(prev => {
        const filtered = prev.filter(item => item !== title);
        return [title, ...filtered].slice(0, 10); // Keep last 10
      });
      setBookTitle('');
    }
  }, [bookTitle, baseUrl]);

  const removeHistoryItem = (item: string) => {
    setHistory(prev => prev.filter(h => h !== item));
  };

  const clearHistory = () => {
    if (window.confirm("确定要清空检索历史吗？")) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#8c1d1d] flex items-center justify-center p-4 selection:bg-red-200">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black rounded-full blur-3xl" />
      </div>

      <div 
        className={`w-full max-w-md transition-all duration-500 ease-out transform ${isHovered ? 'scale-[1.02]' : 'scale-100'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* "Desktop App" Container */}
        <div className="glass rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[550px]">
          {/* Header Bar */}
          <div className="bg-white/50 px-6 py-4 flex items-center justify-between border-b border-white/20">
            <div className="flex items-center gap-2">
              <div className="bg-red-700 p-1.5 rounded-lg shadow-sm">
                <Book className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-gray-800 tracking-tight">SCU Library Search</h1>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-red-100 text-red-700' : 'hover:bg-black/5 text-gray-500'}`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-hide">
            {showSettings ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">设置</h2>
                  <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 ml-1">基础 URL (包含 Session ID)</label>
                  <textarea 
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full h-32 text-xs p-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none resize-none transition-all"
                    placeholder="输入图书馆检索页面的完整 URL..."
                  />
                  <p className="text-[10px] text-gray-400 flex items-start gap-1 mt-1">
                    <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>提示：图书馆会动态生成 Session ID，如果点击检索没反应，请重新打开图书馆官网并复制新的检索页面 URL 到此处。</span>
                  </p>
                </div>

                <div className="pt-4 flex gap-2">
                   <button 
                    onClick={() => {
                      setBaseUrl(DEFAULT_BASE_URL);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    重置默认
                  </button>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-red-700 text-white text-sm rounded-xl hover:bg-red-800 transition-colors shadow-lg shadow-red-700/20"
                  >
                    保存并返回
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Search Input Area */}
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-11 pr-4 py-4 bg-white border border-transparent rounded-2xl leading-5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent sm:text-sm transition-all shadow-lg shadow-black/5"
                      placeholder="输入书名进行检索..."
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  
                  <button
                    onClick={() => handleSearch()}
                    disabled={!bookTitle.trim()}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-red-700 text-white rounded-2xl font-semibold text-lg hover:bg-red-800 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-xl shadow-red-700/20"
                  >
                    <ExternalLink className="w-5 h-5" />
                    立即检索
                  </button>
                </div>

                {/* History Area */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <History className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">最近搜索</span>
                    </div>
                    {history.length > 0 && (
                      <button 
                        onClick={clearHistory}
                        className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        清除
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {history.length > 0 ? (
                      history.map((item, index) => (
                        <div 
                          key={index}
                          className="group flex items-center justify-between p-3 bg-white/40 hover:bg-white rounded-xl border border-transparent hover:border-black/5 transition-all cursor-pointer"
                          onClick={() => handleSearch(item)}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-2 h-2 rounded-full bg-red-200 group-hover:bg-red-500 transition-colors" />
                            <span className="text-sm text-gray-700 truncate font-medium">{item}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHistoryItem(item);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 opacity-30 grayscale">
                        <History className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">暂无搜索记录</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-6 py-4 bg-gray-50/50 text-center border-t border-white/20">
            <p className="text-[10px] text-gray-400 font-medium">
              Made for Sichuan University Students
            </p>
          </div>
        </div>
      </div>
      
      {/* Scrollbar hidden styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
      `}} />
    </div>
  );
};

export default App;
