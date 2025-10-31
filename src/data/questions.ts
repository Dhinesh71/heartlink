import type { GameMode } from '../types/game';

export interface Question {
  type: 'truth' | 'dare';
  text: string;
}

export const questions: Record<GameMode, Question[]> = {
  friendly: [
    { type: 'truth', text: "What's your most embarrassing school moment?" },
    { type: 'truth', text: "What's the weirdest food combination you secretly love?" },
    { type: 'truth', text: "If you could have any superpower for a day, what would it be?" },
    { type: 'truth', text: "What's the funniest thing that's happened to you this week?" },
    { type: 'truth', text: "Who's your secret celebrity crush?" },
    { type: 'truth', text: "What's one thing you've never told anyone?" },
    { type: 'truth', text: "What's your biggest fear?" },
    { type: 'truth', text: "What's the last thing you searched on your phone?" },
    { type: 'dare', text: "Send a random selfie with a funny face 📸" },
    { type: 'dare', text: "Do your best dance move right now 💃" },
    { type: 'dare', text: "Sing the chorus of your favorite song 🎵" },
    { type: 'dare', text: "Tell a joke and make the other person laugh 😂" },
    { type: 'dare', text: "Share your most used emoji and explain why" },
    { type: 'dare', text: "Do 10 jumping jacks and send proof!" },
    { type: 'dare', text: "Post your favorite meme in the chat" },
    { type: 'dare', text: "Describe your perfect day in exactly 10 words" },
  ],
  crush: [
    { type: 'truth', text: "Who's the person you think about before sleeping?" },
    { type: 'truth', text: "What's your idea of a perfect first date?" },
    { type: 'truth', text: "Have you ever had a crush on someone in this room? 😏" },
    { type: 'truth', text: "What's the sweetest thing someone has ever done for you?" },
    { type: 'truth', text: "Do you believe in love at first sight?" },
    { type: 'truth', text: "What's your biggest romantic fantasy?" },
    { type: 'truth', text: "What makes you fall for someone?" },
    { type: 'truth', text: "Have you ever written a love letter?" },
    { type: 'truth', text: "What song reminds you of someone special?" },
    { type: 'truth', text: "Would you date someone you met online?" },
    { type: 'dare', text: "Send a heart emoji to your crush 😏❤️" },
    { type: 'dare', text: "Compliment the other player in the sweetest way possible 💕" },
    { type: 'dare', text: "Share your favorite love song right now 🎵" },
    { type: 'dare', text: "Describe your ideal partner in 3 words" },
    { type: 'dare', text: "Send a voice message saying something sweet 🎙️" },
    { type: 'dare', text: "Share the most romantic movie you've ever seen" },
    { type: 'dare', text: "Tell the other player what you like about them" },
    { type: 'dare', text: "Create a cute couple name for both of you 💑" },
  ],
  bold: [
    { type: 'truth', text: "What's one thing you wish your partner noticed about you?" },
    { type: 'truth', text: "Have you ever confessed your feelings to someone?" },
    { type: 'truth', text: "What's the boldest thing you've ever done for love?" },
    { type: 'truth', text: "Do you have any secret admirers you know of?" },
    { type: 'truth', text: "What's your biggest dating regret?" },
    { type: 'truth', text: "Have you ever ghosted someone? Why?" },
    { type: 'truth', text: "What's the most romantic gift you'd like to receive?" },
    { type: 'truth', text: "Would you make the first move on someone you like?" },
    { type: 'truth', text: "What's the longest you've had a crush on someone?" },
    { type: 'truth', text: "Have you ever caught feelings for someone unexpected?" },
    { type: 'dare', text: "Record a 10-second voice message confessing a secret 🎙️" },
    { type: 'dare', text: "Send a flirty text to someone you like (screenshot it!) 😏" },
    { type: 'dare', text: "Share your most romantic pickup line" },
    { type: 'dare', text: "Tell the other player something you've never told anyone" },
    { type: 'dare', text: "Send a selfie making your most attractive face 😍" },
    { type: 'dare', text: "Share a screenshot of your last conversation with your crush" },
    { type: 'dare', text: "Describe what makes you blush in detail" },
    { type: 'dare', text: "Send a playlist that describes your love life 🎵" },
  ],
};

export const getRandomQuestion = (mode: GameMode, type: 'truth' | 'dare'): Question => {
  const modeQuestions = questions[mode].filter((q) => q.type === type);
  return modeQuestions[Math.floor(Math.random() * modeQuestions.length)];
};
