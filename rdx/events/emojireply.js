const emojiDatabase = {
  '❤️': ['Aww, mera dil bhi terha! 💕', 'Pyar se neend ud jaati hai 😍', 'Dil ki suno, mind nahi! 💗'],
  '❤': ['Aww, mera dil bhi terha! 💕', 'Pyar se neend ud jaati hai 😍', 'Dil ki suno, mind nahi! 💗'],
  '😂': ['Hahahaha, main bhi hasne laga 😂😂', 'Teri hassi dekh ke mera dimaag chaal gya! 🤣', 'Wooo, hasna mat! 😆'],
  '🤣': ['Hahahaha, main bhi hasne laga 😂😂', 'Teri hassi dekh ke mera dimaag chaal gya! 🤣'],
  '😆': ['Hahahaha! 😂😂', 'Hassi mar gayi! 😆'],
  '🔥': ['Fire! Aag laga di 🔥🔥', 'Itna hot hai! 🥵', 'Burning vibes! 😤'],
  '😘': ['Chumma lelo! 😘💋', 'Kiss accept! 😜', 'Muahhh! 👄'],
  '🎉': ['Party time! 🎂🎉', 'Celebrate! 💃', 'Woohoo! 🥳'],
  '🎊': ['Party! 🎉🎊', 'Celebrate! 💃', 'Woohoo! 🥳'],
  '😭': ['Rowna mat! 😭', 'Smile kar! 😊', 'Dil toda! 💔'],
  '😢': ['Rowna mat! 😭', 'Smile kar! 😊', 'Dil toda! 💔'],
  '💔': ['Heart break! 💔', 'Theek kar dunga! 💕', 'Dil toda!'],
  '🤔': ['Soch rahe ho? 🤔', 'Dimag se dhua! 💨', 'Samajh aa gya! 🧠'],
  '😱': ['Arrey! 😱😱', 'Shock! 😲', 'Ready hoon! 👀'],
  '😲': ['Arrey! 😱😱', 'Shock! 😲', 'Ready hoon! 👀'],
  '🎯': ['Target pakda! 🎯🏆', 'Bullseye! 🔫', 'Pro mode! 💯'],
  '✨': ['Sparkle! ✨✨', 'Magic! 🪄✨', 'Glowing! 😌✨'],
  '😏': ['Naughty! 😏😏', 'Samajh aa gya! 😏', 'Tum mera matlab!'],
  '😎': ['Cool! 😎😎', 'Swag! 😎', 'Bilkul cool! 😎'],
  '🥺': ['Kya hua? 🥺', 'Sad! 🥺', 'Khush raho! 🥺'],
  '😻': ['Kitten! 😻😻', 'Cute! 😻', 'Meow! 😻'],
  '😸': ['Happy cat! 😸😸', 'Meow! 😸', 'Cat vibes! 😸'],
  '🤨': ['Kya hua? 🤨', 'Suspect! 🤨', 'Sach bol! 🤨'],
  '👀': ['Dekh rahe ho? 👀👀', 'Main bhi dekh raha! 👀', 'Kya dekh rahe! 👀'],
  '💀': ['Hassi! 💀😂', 'Jaan nikli! 💀', 'Arre yaar! 💀'],
  '😡': ['Gussa? 😡', 'Jhinjhore mat! 😡', 'Settle kar! 😡'],
  '🤗': ['Hug! 🤗', 'Gale laga! 🤗', 'Pyaar! 🤗'],
  '💕': ['Dil pyaar! 💕', 'Dhadkan! 💕', 'Jaan! 💕'],
  '💖': ['Mohabbat! 💖', 'Jaan! 💖', 'Pyaar! 💖'],
  '💗': ['Dil! 💗', 'Baat! 💗', 'Pyaar! 💗'],
  '💝': ['Gift! 💝', 'Tere liye! 💝', 'Main gift! 💝'],
  '💘': ['Cupid! 💘', 'Arrow! 💘', 'Pyaar! 💘'],
  '💞': ['Two hearts! 💞', 'Dohra dil! 💞', 'Pyaar! 💞'],
  '🤩': ['Wow! 🤩', 'Beautiful! 🤩', 'Stunned! 🤩'],
  '😍': ['Look kar! 😍', 'Love! 😍', 'Taara! 😍'],
  '🥰': ['Affection! 🥰', 'Cute! 🥰', 'Dil khol! 🥰'],
  '😋': ['Yummy! 😋', 'Taste! 😋', 'Mazedaar! 😋'],
  '😜': ['Naughty! 😜', 'Hassi! 😜', 'Joke tha! 😜'],
  '😝': ['Tongue! 😝', 'Masti! 😝', 'Hassi! 😝'],
  '🤪': ['Pagal! 🤪', 'Crazy! 🤪', 'Page! 🤪'],
  '😤': ['Offo! 😤', 'Gussa! 😤', 'Jhinjhore mat! 😤'],
  '😠': ['Gussa! 😠', 'Maaf kar! 😠', 'Settle! 😠'],
  '🤬': ['Language! 🤬', 'Gaali! 🤬', 'Sambhal! 🤬'],
  '😈': ['Devil! 😈', 'Naughty! 😈', 'Plan? 😈'],
  '👿': ['Angry! 👿', 'Gussa! 👿', 'Cool down! 👿'],
  '👋': ['Bye! 👋', 'Hello! 👋', 'Ciao! 👋'],
  '👌': ['OK! 👌', 'Good! 👌', 'Perfect! 👌'],
  '🤝': ['Deal! 🤝', 'Handshake! 🤝', 'Agree! 🤝'],
  '👍': ['Thumbs up! 👍', 'Good! 👍', 'Like! 👍'],
  '👎': ['Thumbs down! 👎', 'Bad! 👎', 'Dislike! 👎'],
  '💪': ['Strong! 💪', 'Muscle! 💪', 'Power! 💪'],
  '🙌': ['Raise hands! 🙌', 'Celebrate! 🙌', 'Hooray! 🙌'],
  '👐': ['Open arms! 👐', 'Hug! 👐', 'Spread! 👐'],
  '🏆': ['Champion! 🏆', 'Winner! 🏆', 'Trophy! 🏆'],
  '🥇': ['Gold! 🥇', 'First! 🥇', 'Best! 🥇'],
  '⭐': ['Star! ⭐', 'Shining! ⭐', 'Brilliant! ⭐'],
  '🌟': ['Bright! 🌟', 'Glowing! 🌟', 'Beautiful! 🌟'],
  '💫': ['Dizzy! 💫', 'Wow! 💫', 'Amazing! 💫'],
  '🎆': ['Fireworks! 🎆', 'Bang! 🎆', 'Celebrate! 🎆'],
  '💥': ['Boom! 💥', 'Blast! 💥', 'Bang! 💥'],
  '⚡': ['Lightning! ⚡', 'Fast! ⚡', 'Speed! ⚡'],
  '🌈': ['Rainbow! 🌈', 'Beautiful! 🌈', 'Colors! 🌈'],
  '☀️': ['Sunny! ☀️', 'Hot! ☀️', 'Bright! ☀️'],
  '🌙': ['Night! 🌙', 'Moon! 🌙', 'Sleep! 🌙'],
  '☔': ['Rainy! ☔', 'Monsoon! ☔', 'Wet! ☔'],
  '⛈️': ['Thunder! ⛈️', 'Storm! ⛈️', 'Rain! ⛈️'],
  '🍕': ['Pizza! 🍕', 'Cheesy! 🍕', 'Taste! 🍕'],
  '🍔': ['Burger! 🍔', 'Meat! 🍔', 'Hungry! 🍔'],
  '🍟': ['Fries! 🍟', 'Crispy! 🍟', 'Salty! 🍟'],
  '🍛': ['Biryani! 🍛', 'Spice! 🍛', 'Yummy! 🍛'],
  '🍜': ['Noodles! 🍜', 'Hot! 🍜', 'Slurp! 🍜'],
  '🍝': ['Pasta! 🍝', 'Italian! 🍝', 'Carbs! 🍝'],
  '🍰': ['Cake! 🍰', 'Sweet! 🍰', 'Slice! 🍰'],
  '🎂': ['Birthday! 🎂', 'Candles! 🎂', 'Celebrate! 🎂'],
  '🍪': ['Cookie! 🍪', 'Crispy! 🍪', 'Chocolate! 🍪'],
  '🍩': ['Donut! 🍩', 'Round! 🍩', 'Sweet! 🍩'],
  '☕': ['Coffee! ☕', 'Hot! ☕', 'Morning! ☕'],
  '🍵': ['Tea! 🍵', 'Cup! 🍵', 'Warm! 🍵'],
  '🍷': ['Wine! 🍷', 'Red! 🍷', 'Classy! 🍷'],
  '🍺': ['Beer! 🍺', 'Foam! 🍺', 'Cold! 🍺'],
  '💋': ['Kiss! 💋', 'Lips! 💋', 'Smooch! 💋'],
  '💌': ['Love letter! 💌', 'Message! 💌', 'Romantic! 💌']
};

function findEmojiResponse(message) {
  if (!message) return null;
  
  for (const [emoji, responses] of Object.entries(emojiDatabase)) {
    if (message.includes(emoji)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  return null;
}

module.exports = {
  config: {
    name: 'emojireply',
    eventType: 'message'
  },

  async run({ api, event, Users, Threads, config, client }) {
    const { body, senderID, threadID, messageID } = event;
    
    if (!body) return;

    const response = findEmojiResponse(body);
    
    if (response) {
      console.log('[EMOJI REPLY] Found emoji:', body);
      try {
        api.sendMessage(response, threadID, messageID);
      } catch (err) {
        console.log('[EMOJI REPLY ERROR]:', err.message);
      }
    }
  }
};
