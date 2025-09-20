import { useEffect } from 'react'
import { addTweet, getState } from '../store-mongodb'

const sampleTweets = [
  "Just discovered this amazing new JavaScript framework! 🚀",
  "Coffee break time ☕️ Who else is coding late tonight?",
  "The weather is perfect for a coding session today! ☀️",
  "Learning TypeScript has been a game changer for my projects 💻",
  "Anyone else excited about the new React features? ⚛️",
  "Debugging is like being a detective in a crime movie where you are also the victim 🕵️‍♂️",
  "Code review time! Always learning something new from my team 👥",
  "The best part of programming? When your code finally works! 🎉",
  "Stack Overflow saved my life again today 🙏",
  "Pair programming session was incredibly productive today! 🤝"
]

const sampleUsers = [
  { name: "Alex Developer", handle: "alexdev" },
  { name: "Sarah Coder", handle: "sarahcode" },
  { name: "Mike Programmer", handle: "mikeprog" },
  { name: "Emma Tech", handle: "emmatech" },
  { name: "David Builder", handle: "davidbuild" }
]

export function useRealtime() {
  useEffect(() => {
    // Simulate real-time updates by adding random tweets every 30-60 seconds
    const interval = setInterval(() => {
      const randomTweet = sampleTweets[Math.floor(Math.random() * sampleTweets.length)]
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)]
      
      // Only add if we have users in the system
      const state = getState()
      if (Object.keys(state.users).length > 1) {
        // Create a temporary user for the tweet
        const tempUserId = `temp_${Math.random().toString(36).slice(2, 9)}`
        const tempUser = {
          id: tempUserId,
          handle: randomUser.handle,
          name: randomUser.name,
          bio: '',
          followers: [],
          following: [],
          createdAt: Date.now()
        }
        
        // Add user to state
        state.users[tempUserId] = tempUser
        
        // Add tweet
        addTweet(randomTweet)
      }
    }, Math.random() * 30000 + 30000) // 30-60 seconds

    return () => clearInterval(interval)
  }, [])
}
