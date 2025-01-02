Idle/incremental game:

This is entirely a React web-based text-based game, with buttons to buy upgrades.

GAME DESIGN PRINCIPLES:

1. each player decision should be meaningful, not interchangeable
2. each player decision should mean giving up something else, tradeoffs
3. each player decision should be a tradeoff between risk and reward

NOTE: generally, the game should faintly feel like crypto mining

Core loop:

- ships go mine and return, giving resources to the base
- players can buy upgrades for ships - more ships, mining capacity, defense, evasion, speed, repairability, stealth
- players can buy upgrades for their base - faster ship production, healing, refining mineral speed
- minerals can be raw and sold to stock market, or refined (refined mineral can be used to produce, upgrade, and ships and repair ships)

ship stat effects:

- more ships - self explanatory lol
- mining capacity - increases the amount of resources a ship can mine total
- defense - increases the amount of damage a ship can take before being destroyed (there is a chance to be destroyed by weird aliens) - destroyed ships lose themselves + all resources
- evasion - increases the chance a ship can evade incoming attacks
- speed - increases the speed of a ship (how fast they complete each mission)
- repairability - % chance a ship can be repaired after being destroyed
- stealth - reduces how fast alien danger meter increases

base upgrade effects:

- faster ship production - decreases the time it takes to produce a ship
- healing - increases the amount of health a ship can heal per second
- refining mineral speed - increases the amount of minerals a ship can convert per second

NOTE: the longer you mine, the more resources you get, but the more chance you have to be destroyed by aliens.

Alien danger meter:

- increases the longer you mine (ship travel speed has no effect)

Stock market:

- players can buy and sell minerals

SHIPS:

- the more stats ships have, the more expensive (and rare minerals) to produce and repair and upgrade

Mineral names and rarity:

- Ferrox (common) - chance - 10%
- Silicor (common) - chance - 10%
- Ionite (uncommon) - chance - 5%
- Tritum Spark (uncommon) - chance - 5%
- Celestium (rare) - chance - 2%
- Crystite (rare) - chance - 2%
- Celestium (very rare) - chance - 1%
- Xotheneium (extremely rare) - chance - 0.1%

^^ the chance is the chance of finding a mineral in a single chunk of rock (a single mining time tick), otherwise the chunk of rock is worthless
