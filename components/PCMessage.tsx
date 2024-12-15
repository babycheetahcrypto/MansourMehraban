import Image from 'next/image';

const PCMessage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
    <Image
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-Jx43bOKm7s99NARIa6gjgHp3gQ7RP1.png"
      alt="Game Logo"
      width={200}
      height={200}
    />
    <h1 className="text-3xl font-bold mt-8 mb-4">Baby Cheetah Crypto Game</h1>
    <p className="text-xl">This game is only available on mobile devices via Telegram mini app.</p>
    <p className="text-lg mt-4">Please open the game on your mobile device to play.</p>
  </div>
);

export default PCMessage;
