import { useState } from 'react'
import CommandFlowMap from './CommandFlowMap'

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('events')

  const tabs = [
    { id: 'events', label: 'Events', icon: '🌟' },
    { id: 'halloffame', label: 'Hall of Fame', icon: '🏆' },
    { id: 'officers', label: 'Meet Our Officers', icon: '👥' },
  ]

  return (
    <div className="min-h-screen">
      {/* Spacer for fixed header */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-16 px-4 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
        <div className="w-full max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Welcome to Eclipsed
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A guild united by adventure, bound by honor, and driven by excellence
          </p>
          <div className="flex justify-center space-x-4">
            <button className="group relative px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-md group-hover:blur-lg transition-all"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
              <span className="relative z-10 text-white">Join Our Guild</span>
            </button>
            <button className="group relative px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/50 group-hover:border-purple-400 transition-all"></div>
              <span className="relative z-10 text-white">Learn More</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="w-full px-4 py-12 flex flex-col items-center">
        <div className="w-full max-w-7xl">
        {/* Tab Buttons */}
        <div className="flex justify-center space-x-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300
                ${activeTab === tab.id ? 'scale-105' : 'hover:scale-105'}
              `}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-md"></div>
              )}
              <div
                className={`
                  absolute inset-0 rounded-lg transition-all duration-300
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                      : 'bg-white/5 hover:bg-white/10 border border-purple-500/30'
                  }
                `}
              ></div>
              <span className="relative z-10 flex items-center space-x-2 text-white">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl blur-3xl"></div>
          <div className="relative bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 min-h-[500px]">
            {activeTab === 'events' && <EventsTab />}
            {activeTab === 'halloffame' && <HallOfFameTab />}
            {activeTab === 'officers' && <OfficersTab />}
          </div>
        </div>
        </div>
      </section>
    </div>
  )
}

const EventsTab = () => {
  const events = [
    {
      title: 'Guild Raid Night',
      date: 'Every Friday @ 8:00 PM EST',
      description: 'Join us for our weekly raid progression. All members welcome!',
      status: 'recurring',
    },
    {
      title: 'PvP Tournament',
      date: 'Feb 15, 2026',
      description: 'Test your skills in our monthly PvP championship.',
      status: 'upcoming',
    },
    {
      title: 'Guild Anniversary',
      date: 'March 1, 2026',
      description: 'Celebrating 3 years of Eclipsed! Special events and prizes.',
      status: 'upcoming',
    },
  ]

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Upcoming Events
      </h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {events.map((event, index) => (
          <div
            key={index}
            className="group relative bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 text-center w-full max-w-sm"
          >
            <div className="absolute top-4 right-4">
              <span
                className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${
                  event.status === 'recurring'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                }
              `}
              >
                {event.status === 'recurring' ? 'Recurring' : 'Upcoming'}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white pt-6">{event.title}</h3>
            <p className="text-purple-300 font-semibold mb-3">{event.date}</p>
            <p className="text-gray-300">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const HallOfFameTab = () => {
  const achievements = [
    {
      title: 'World First Clear',
      player: 'ShadowKnight',
      description: 'First in the world to clear the Eclipse Raid',
      date: 'Jan 2026',
    },
    {
      title: 'Top Guild Ranking',
      player: 'Eclipsed Guild',
      description: 'Achieved #1 guild ranking on the server',
      date: 'Dec 2025',
    },
    {
      title: 'PvP Champion',
      player: 'StarBreaker',
      description: 'Won the Annual PvP Championship',
      date: 'Nov 2025',
    },
    {
      title: 'Legendary Crafter',
      player: 'ArtisanPro',
      description: 'Crafted the first Mythic tier weapon',
      date: 'Oct 2025',
    },
  ]

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
        Hall of Fame
      </h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className="relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 text-center w-full max-w-md"
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">🏆</div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-yellow-300">{achievement.title}</h3>
                <p className="text-purple-300 font-semibold mb-2">{achievement.player}</p>
                <p className="text-gray-300 mb-2">{achievement.description}</p>
                <p className="text-sm text-gray-400">{achievement.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const OfficersTab = () => {
  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
        Meet Our Officers
      </h2>
      <CommandFlowMap />
    </div>
  )
}

export default HomePage
