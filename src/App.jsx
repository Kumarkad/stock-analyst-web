import React, { useState, useEffect } from 'react'
import { TrendingUp, BarChart2, Shield, Search, Loader2, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react'

function App() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Search for tickers
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        setIsSearching(true)
        try {
          const response = await fetch(`http://localhost:8000/search?q=${query}`)
          const data = await response.json()
          setSearchResults(data.results || [])
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const getCurrency = (symbol) => {
    if (!symbol) return '$';
    return (symbol.endsWith('.NS') || symbol.endsWith('.BO')) ? '₹' : '$';
  };

  const handleAnalyze = async (symbol) => {
    setSearchResults([])
    setQuery('')
    setIsAnalyzing(true)
    setAnalysis(null)
    try {
      const response = await fetch(`http://localhost:8000/analyze?symbol=${symbol}`)
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const [showPortfolio, setShowPortfolio] = useState(false)
  const [portfolioData, setPortfolioData] = useState([])

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('http://localhost:8000/portfolio')
      const data = await response.json()
      setPortfolioData(data.holdings || [])
      setShowPortfolio(true)
      setAnalysis(null)
    } catch (error) {
      console.error('Fetch portfolio error:', error)
    }
  }

  const addToPortfolio = async () => {
    try {
      await fetch('http://localhost:8000/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: analysis.symbol,
          quantity: 1, // Default for now
          average_price: analysis.results.quantitative.technicals.current_price
        })
      })
      alert(`Added ${analysis.symbol} to your portfolio!`)
    } catch (error) {
      console.error('Add to portfolio error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              StockAnalyst<span className="text-cyan-400">.ai</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchPortfolio}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Portfolio
            </button>
            <button className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all">
              Connect Broker
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Portfolio View */}
        {showPortfolio && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <h2 className="text-4xl font-extrabold">Your Portfolio</h2>
              <button 
                onClick={() => setShowPortfolio(false)}
                className="px-4 py-2 bg-white/5 rounded-xl text-sm font-medium hover:bg-white/10 transition-all border border-white/10"
              >
                Back to Search
              </button>
            </div>

            {portfolioData.length === 0 ? (
              <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-slate-500">No holdings found. Start by searching and adding stocks!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioData.map((item, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-[#121216] border border-white/10 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold">{item.symbol}</span>
                      <ArrowUpRight size={20} className="text-green-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Quantity</span>
                        <span className="font-medium text-white">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Avg Price</span>
                        <span className="font-medium text-white">{getCurrency(item.symbol)}{item.average_price?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!analysis && !isAnalyzing && !showPortfolio && (
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Research Stocks with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Agentic Intelligence
              </span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Eliminate emotional bias with our Multi-Agent "Mixture of Experts" engine.
              Real-time data, fundamental analysis, and sentiment scoring at your fingertips.
            </p>
          </div>
        )}

        {/* Search Bar Container */}
        <div className={`relative max-w-xl mx-auto mb-16 transition-all duration-500 ${analysis || isAnalyzing ? 'mt-0' : 'mt-12'}`}>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
          <div className="relative flex items-center bg-[#121216] border border-white/10 rounded-2xl px-6 py-4 shadow-2xl transition-all focus-within:border-cyan-500/50">
            {isSearching ? <Loader2 size={24} className="text-cyan-500 animate-spin mr-4" /> : <Search className="text-slate-500 mr-4" size={24} />}
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticker or company names (e.g. AAPL, Reliance)..." 
              className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-600 font-medium"
            />
          </div>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-20 left-0 right-0 bg-[#121216] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden divide-y divide-white/5">
              {searchResults.map((result) => (
                <button 
                  key={result.symbol}
                  onClick={() => handleAnalyze(result.symbol)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <div>
                    <div className="font-bold text-white">{result.symbol}</div>
                    <div className="text-sm text-slate-500">{result.longname || result.shortname}</div>
                  </div>
                  <div className="text-xs uppercase px-2 py-1 bg-white/5 rounded text-slate-400">
                    {result.exchange}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading Analysis */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
              <Loader2 size={64} className="text-cyan-500 animate-spin relative" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Engaging Agents...</h2>
              <p className="text-slate-500">Consulting Technical, Fundamental, and Sentiment experts</p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !isAnalyzing && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8">
              <div>
                <h2 className="text-4xl font-extrabold mb-2">{analysis.symbol}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-medium">Market Analysis Report</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${analysis.results.sentiment.label === 'Bullish' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {analysis.results.sentiment.label} Sentiment
                  </span>
                </div>
              </div>
              <button 
                onClick={addToPortfolio}
                className="mt-6 md:mt-0 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
              >
                Add to Portfolio
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Technical Indicator Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6 text-blue-400">
                  <BarChart2 size={24} />
                  <h3 className="text-xl font-bold text-white">Technical Score</h3>
                </div>
                <div className="space-y-6">
                  <div className="px-4 py-3 bg-white/5 rounded-2xl">
                    <span className="text-slate-400 text-sm block mb-1">Current Price</span>
                    <span className="text-3xl font-bold">
                      {getCurrency(analysis.symbol)}{analysis.results.quantitative.technicals.current_price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl">
                    <span className="text-slate-400">SMA 50</span>
                    <span className="font-bold">${analysis.results.quantitative.technicals.sma50?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl">
                    <span className="text-slate-400">RSI (14)</span>
                    <span className={`font-bold ${analysis.results.quantitative.technicals.rsi > 70 ? 'text-red-400' : analysis.results.quantitative.technicals.rsi < 30 ? 'text-green-400' : 'text-cyan-400'}`}>
                      {analysis.results.quantitative.technicals.rsi?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fundamental Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6 text-emerald-400">
                  <Shield size={24} />
                  <h3 className="text-xl font-bold text-white">Fundamental Health</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <div className="text-xs text-slate-500 mb-1 uppercase font-bold">PE Ratio</div>
                      <div className="text-lg font-bold">{analysis.results.quantitative.fundamentals.pe_ratio?.toFixed(1) || 'N/A'}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <div className="text-xs text-slate-500 mb-1 uppercase font-bold">ROE</div>
                      <div className="text-lg font-bold">{(analysis.results.quantitative.fundamentals.roe * 100)?.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                    <p className="text-sm text-emerald-400 leading-relaxed font-medium">
                      Fundamental Agent identifies high capital efficiency and stable debt-to-equity ratio for {analysis.symbol}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sentiment Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6 text-indigo-400">
                  <TrendingUp size={24} />
                  <h3 className="text-xl font-bold text-white">Sentiment Pulse</h3>
                </div>
                <div className="space-y-4">
                  {analysis.results.sentiment.top_headlines.slice(0, 3).map((news, idx) => (
                    <a 
                      key={idx}
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-white/5 rounded-2xl group hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                    >
                      <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                        {news.publisher}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-sm font-medium leading-tight line-clamp-2">{news.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Landing Page Features (Only show if no analysis and no portfolio) */}
        {!analysis && !isAnalyzing && !showPortfolio && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Agent Analysis</h3>
              <p className="text-slate-400 leading-relaxed">
                Three specialized agents (Fundamental, Technical, Sentiment) analyze every stock.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">ROI Projections</h3>
              <p className="text-slate-400 leading-relaxed">
                High-conviction forecasts with confidence intervals based on quantitative data.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Safe Guardrails</h3>
              <p className="text-slate-400 leading-relaxed">
                Automatic risk filters for volatility and liquidity to protect your capital.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 text-center mt-auto">
        <p className="text-slate-600 text-sm">
          Powered by LangGraph, yfinance, and Google Deepmind.
        </p>
      </footer>
    </div>
  )
}

export default App
