// World of Warcraft Classes and Specializations with Role Categories

export const ROLE_CATEGORIES = {
  TANK: 'Tank',
  HEALER: 'Healer',
  MELEE_DPS: 'Melee DPS',
  RANGED_DPS: 'Ranged DPS',
  SUPPORT_DPS: 'Support DPS'
}

export const CLASS_SPECS = [
  {
    class: 'Death Knight',
    icon: '⚔️',
    color: '#C41E3A',
    specs: [
      { name: 'Blood', category: ROLE_CATEGORIES.TANK },
      { name: 'Frost', category: ROLE_CATEGORIES.MELEE_DPS },
      { name: 'Unholy', category: ROLE_CATEGORIES.MELEE_DPS }
    ]
  },
  {
    class: 'Demon Hunter',
    icon: '😈',
    color: '#A330C9',
    specs: [
      { name: 'Havoc', category: ROLE_CATEGORIES.MELEE_DPS },
      { name: 'Vengeance', category: ROLE_CATEGORIES.TANK },
      { name: 'Devourer', category: ROLE_CATEGORIES.RANGED_DPS }
    ]
  },
  {
    class: 'Druid',
    icon: '🐻',
    color: '#FF7C0A',
    specs: [
      { name: 'Balance', category: ROLE_CATEGORIES.RANGED_DPS },
      { name: 'Feral', category: ROLE_CATEGORIES.MELEE_DPS },
      { name: 'Guardian', category: ROLE_CATEGORIES.TANK },
      { name: 'Restoration', category: ROLE_CATEGORIES.HEALER }
    ]
  },
  {
    class: 'Evoker',
    icon: '🐉',
    color: '#33937F',
    specs: [
      { name: 'Augmentation', category: ROLE_CATEGORIES.SUPPORT_DPS },
      { name: 'Devastation', category: ROLE_CATEGORIES.RANGED_DPS },
      { name: 'Preservation', category: ROLE_CATEGORIES.HEALER }
    ]
  },
  {
    class: 'Hunter',
    icon: '🏹',
    color: '#AAD372',
    specs: [
      { name: 'Beast Mastery', category: ROLE_CATEGORIES.RANGED_DPS },
      { name: 'Marksmanship', category: ROLE_CATEGORIES.RANGED_DPS },
      { name: 'Survival', category: ROLE_CATEGORIES.MELEE_DPS }
    ]
  },
  {
    class: 'Mage',
    icon: '🔮',
    color: '#3FC7EB',
    specs: [
      { name: 'Arcane', category: ROLE_CATEGORIES.RANGED_DPS },
      { name: 'Fire', category: ROLE_CATEGORIES.RANGED_DPS },
      { name: 'Frost', category: ROLE_CATEGORIES.RANGED_DPS }
    ]
  },
  {
    class: 'Monk',
    icon: '🥋',
    color: '#00FF98',
    specs: [
      { name: 'Brewmaster', category: ROLE_CATEGORIES.TANK },
      { name: 'Mistweaver', category: ROLE_CATEGORIES.HEALER },
      { name: 'Windwalker', category: ROLE_CATEGORIES.MELEE_DPS }
    ]
  },
  {
    class: 'Paladin',
    icon: '🛡️',
    color: '#F48CBA',
    specs: [
      { name: 'Holy', category: ROLE_CATEGORIES.HEALER },
      { name: 'Protection', category: ROLE_CATEGORIES.TANK },
      { name: 'Retribution', category: ROLE_CATEGORIES.MELEE_DPS }
    ]
  },
  {
    class: 'Priest',
    icon: '✨',
    color: '#FFFFFF',
    specs: [
      { name: 'Discipline', category: ROLE_CATEGORIES.HEALER },
      { name: 'Holy', category: ROLE_CATEGORIES.HEALER },
      { name: 'Shadow', category: ROLE_CATEGORIES.RANGED_DPS }
    ]
  },
  {
    class: 'Rogue',
    icon: '🗡️',
    color: '#FFF468',
    specs: [
      { name: 'Assassination', category: ROLE_CATEGORIES.MELEE_DPS },
      { name: 'Outlaw', category: ROLE_CATEGORIES.MELEE_DPS },
      { name: 'Subtlety', category: ROLE_CATEGORIES.MELEE_DPS }
    ]
  },
  {
    class: 'Shaman',
    icon: '⚡',
    color: '#0070DD',
    specs: [
      { name: 'Elemental', category: ROLE_CATEGORIES.RANGED_DPS },
      { name: 'Enhancement', category: ROLE_CATEGORIES.MELEE_DPS },
      { name: 'Restoration', category: ROLE_CATEGORIES.HEALER }
    ]
  },
  {
    class: 'Warlock',
    icon: '🔥',
    color: '#8788EE',
    specs: [
      { name: 'Affliction', category: ROLE_CATEGORIES.RANGED_DPS },
      { name: 'Demonology', category: ROLE_CATEGORIES.RANGED_DPS },
      { name: 'Destruction', category: ROLE_CATEGORIES.RANGED_DPS }
    ]
  },
  {
    class: 'Warrior',
    icon: '⚒️',
    color: '#C69B6D',
    specs: [
      { name: 'Arms', category: ROLE_CATEGORIES.MELEE_DPS },
      { name: 'Fury', category: ROLE_CATEGORIES.MELEE_DPS },
      { name: 'Protection', category: ROLE_CATEGORIES.TANK }
    ]
  }
]

// Helper function to get all specs by category
export const getSpecsByCategory = (category) => {
  const specs = []
  CLASS_SPECS.forEach(classData => {
    classData.specs.forEach(spec => {
      if (spec.category === category) {
        specs.push({
          class: classData.class,
          spec: spec.name,
          category: spec.category
        })
      }
    })
  })
  return specs
}

// Helper function to create spec key
export const createSpecKey = (className, specName) => {
  return `${className}-${specName}`
}
