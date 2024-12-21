'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Wallet from '../components/wallet';
import { TonConnectUI } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { User as UserType } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Users,
  ShoppingBag,
  Star,
  CheckCircle,
  Gift,
  Volume2,
  Coins,
  ArrowRight,
  Copy,
  Vibrate,
  Music,
  Eye,
  Check,
  X,
  Award,
  Zap,
  Lock,
} from 'lucide-react';
import GamePopup from '../components/GamePopup';
import { isMobile } from '../utils/deviceCheck';
import PCMessage from '../components/PCMessage';

interface User extends UserType {}

interface CryptoGameProps {
  userData: UserType | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
  saveUserData: (userData: Partial<UserType>) => Promise<void>;
}

type ShopItem = {
  id: number;
  name: string;
  image: string;
  basePrice: number;
  baseProfit: number;
  level: number;
};

type PremiumShopItem = {
  id: number;
  name: string;
  image: string;
  basePrice: number;
  effect: string;
  boosterCredits?: number;
  tap?: number;
};

type Task = {
  id: number;
  description: string;
  reward: number;
  progress: number;
  maxProgress?: number;
  completed: boolean;
  claimed: boolean;
  icon: React.ReactNode;
  action: () => void;
};

type LeaderboardEntry = {
  id: string;
  telegramId: string;
  name: string;
  username: true;
  coins: number;
  profitPerHour: number;
  rank: number;
};

interface UserData extends Omit<User, 'dailyReward'> {
  dailyReward: {
    lastClaimed: Date | null;
    streak: number;
    day: number;
    completed: boolean;
  };
}

interface WalletProps {
  coins: number;
}

// Keyframe animation
const styles = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .coin-button:active, .coin-button.pulse {
    animation: pulse 0.1s cubic-bezier(.36,.07,.19,.97) both;
  }
  .coin-button {
    transform-origin: center center;
  }
  html, body {
    scroll-behavior: smooth;
  }
  @keyframes fadeOutUp {
    from {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    to {
      opacity: 0;
      transform: translate(-50%, -150%) scale(1.5);
    }
  }
  .click-effect {
    position: fixed;
    pointer-events: none;
    animation: fadeOutUp 0.7s ease-out forwards;
    color: white;
    font-weight: 900;
    font-size: 1.5rem;
    text-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 25px rgba(255, 255, 255, 0.8);
    transform: translate(-50%, -50%);
    z-index: 30;
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  @keyframes countUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .trophy-button, .level-button {
    transition: all 0.3s ease;
  }
  .trophy-button:hover, .level-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  .trophy-button:active, .level-button:active {
    transform: translateY(0);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    height: 100vh;
    height: -webkit-fill-available;
  }
  #__next {
    height: 100%;
  }
  @keyframes button-click {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  .animate-button-click {
    animation: button-click 0.3s ease-in-out;
  }
  img {
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
  @keyframes energyPulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
  @keyframes float {
    0% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-5px) scale(1.05); }
    100% { transform: translateY(0px) scale(1); }
  }

  .daily-reward-button:hover, .wallet-button:hover {
    animation: float 1s ease-in-out infinite;
  }

  @keyframes cheetah-glow {
    0% {
      box-shadow: 0 0 5px rgba(248, 220, 112, 0.5),
                  0 0 10px rgba(248, 220, 112, 0.5);
    }
    50% {
      box-shadow: 0 0 10px rgba(248, 220, 112, 0.8),
                  0 0 20px rgba(248, 220, 112, 0.8),
                  0 0 30px rgba(248, 220, 112, 0.8);
    }
    100% {
      box-shadow: 0 0 5px rgba(248, 220, 112, 0.5),
                  0 0 10px rgba(248, 220, 112, 0.5);
    }
  }

  .animate-cheetah-glow {
    animation: cheetah-glow 2s infinite;
  }

  @keyframes button-click {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }

  .animate-button-click {
    animation: button-click 0.3s ease-in-out;
  }

  @keyframes cheetah-pulse {
  0% { transform: scale(1); background-color: rgba(255, 69, 0, 0.2); }
  50% { transform: scale(0.95); background-color: rgba(255, 165, 0, 0.3); }
  100% { transform: scale(1); background-color: rgba(255, 69, 0, 0.2); }
}

.animate-button-click {
  animation: cheetah-pulse 0.3s ease-in-out;
}

  .filter-grayscale {
    filter: grayscale(100%);
  }
`;

// Telegram WebApp type definition
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        onEvent: (eventType: string, eventHandler: () => void) => void;
        sendData: (data: string) => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
            coins: number;
            level: number;
            tasksCompleted: number;
          };
          start_param?: string;
        };
        initData: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        showAlert: (message: string) => Promise<void>;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
        openLink: (url: string) => void;
        openTelegramLink: (url: string) => void;
      };
    };
  }
}

// Component definitions
const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
      color: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${
        Math.random() * 200 + 55
      }, ${Math.random() * 0.5 + 0.5})`,
    }));

    let animationFrameId: number;
    let lastScrollY = window.scrollY;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a radial gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 25, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 25, 1)');

      // Fill the background with the gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
        } else if (star.y < 0) {
          star.y = canvas.height;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', () => {});
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
};

const NeonGradientCard: React.FC<React.ComponentProps<'div'>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/50 to-black/50 text-white border border-gray-700/30 backdrop-blur-xl ${className}`}
    {...props}
  >
    <div className="relative z-10 p-6">{children}</div>
  </div>
);

interface CryptoButtonProps {
  icon: React.ElementType;
  href: string;
  text: string;
  isActive: boolean;
  setCurrentPage: (page: string) => void;
}

const CryptoButton: React.FC<CryptoButtonProps> = ({
  icon: Icon,
  href,
  text,
  isActive,
  setCurrentPage,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setCurrentPage(href);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className={`relative w-16 h-16 bg-transparent flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-t from-[#F8DC70]/20 to-transparent border-2 border-[#F8DC70] shadow-lg shadow-[#F8DC70]/50'
            : 'border border-gray-700/30'
        } ${
          isClicked ? 'animate-button-click' : ''
        } backdrop-blur-md text-white active:bg-gray-800/50 hover:bg-[#F8DC70]/10`}
        onClick={handleClick}
      >
        <Icon
          className={`w-6 h-6 mb-1 ${isActive ? 'text-[#F8DC70]' : 'text-white filter grayscale'}`}
        />
        <span
          className={`text-xs ${isActive ? 'text-[#F8DC70]' : 'text-gray-400'} group-hover:text-[#F8DC70] font-bold`}
        >
          {text}
        </span>
        {isActive && (
          <div className="absolute inset-0 rounded-2xl border-2 border-[#F8DC70] animate-cheetah-glow"></div>
        )}
      </button>
    </div>
  );
};

const levelRequirements = [
  0, 50000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 1000000000, 5000000000,
  10000000000, 50000000000, 100000000000,
];

const levelImages = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Broke%20Cheetah-zvEupxSYmiG3d6uvTTqyRofP7LirFr.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mr%20Cheetah-EIrU0m585VzcYQNNqIY2G9gT6XvPCY.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sparrow%20Cheetah-CZ58OLVJc3fTjY9mvhctjCNQAXmOid.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Viking%20Cheetah-TqYGnwW4l2saCU1o08TJy86burO8jD.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Samurai%20Cheetah-oE9slMQwRtFkED0CBCBrFORyGTjbsj.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Alien%20Cheetah-gekxahjmUSh9DgbK8dfeXPVAaYu9Jr.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Robot%20Cheetah-ZQDisjjWuvNoOkx8wAd7J1SR7Zyw3T.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Space%20Cheetah-vLKxS5HHFCBo00goi6JcYVcy8p9Gkg.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pop%20Cheetah-lGLaeaUe3rnhR1qmaYahCHyVhA0pht.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Super%20Cheetah-xWVCW1Ty2TCnklNy3Z1WDhcuRmylb0.png',
];

const trophies = [
  {
    name: 'Cheetah Spirit',
    description: 'Speed is in your soul, and greatness is in your paws',
    requirement: 10000,
    prize: 1000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cheetah%20Spirit%203D%20ICON-iczgm9Y3jJZuDSDH8FqOjHNtNCNU9g.png',
    claimed: false,
  },
  {
    name: 'Cosmic Runner',
    description: 'You’ve run past the stars; the galaxy watches in awe',
    requirement: 50000,
    prize: 5000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cosmic%20Runner%203D%20ICON-V75MZht2LrDPIJ75tb8X2O6QZSo7Ai.png',
    claimed: false,
  },
  {
    name: 'Quest Conqueror',
    description: 'Every step forward is a victory in itself',
    requirement: 100000,
    prize: 10000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Quest%20Conqueror%203D%20ICON-aBdcxDA5KX39Gab4JuUqWY2RxU9wok.png',
    claimed: false,
  },
  {
    name: 'Gold Hunter',
    description: 'Fortune favors those bold enough to chase it',
    requirement: 250000,
    prize: 25000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gold%20Hunter%203D%20ICON-1yeVe629S06xwvRcfm37Wo8EYdhIH0.png',
    claimed: false,
  },
  {
    name: 'Star Collector',
    description: 'Shine brighter than the cosmos; the sky is yours to claim',
    requirement: 500000,
    prize: 50000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Star%20Collector-m9ihxt6yrcDf2YWvVq6N481JKJwcjW.png',
    claimed: false,
  },
  {
    name: 'Wealth Builder',
    description: 'True riches are built, not found',
    requirement: 1000000,
    prize: 100000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wealth%20Builder-tfPdZPXRZCShOPxkshtcOd6f3LCUWk.png',
    claimed: false,
  },
  {
    name: 'Friend Magnet',
    description: 'Greatness grows when shared with others',
    requirement: 2500000,
    prize: 250000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Friend%20Magnet-GDi7PAhOTeugy3abK6eAbsO9gNidKl.png',
    claimed: false,
  },
  {
    name: 'Celebration Master',
    description: 'Every milestone deserves a moment of joy',
    requirement: 5000000,
    prize: 500000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Celebration%20Master-x20JtpH2kRI4udYImf8WmCjfUt4sfL.png',
    claimed: false,
  },
  {
    name: 'Legendary Unlocker',
    description: 'Legends aren’t born—they unlock their own destiny',
    requirement: 7500000,
    prize: 750000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Legendary%20Unlocker-0jg3EPTYw1rPeMtOlO7ga1hyzfcxKR.png',
    claimed: false,
  },
  {
    name: 'King of Coins',
    description: 'Wealth isn’t just earned, it’s conquered',
    requirement: 10000000,
    prize: 1000000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/King%20of%20Coins%203D%20ICON-22v8eZDhx9amJWljmN9chWAbCXeMMV.png',
    claimed: false,
  },
];

const formatNumberWithSuffix = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'b';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'm';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
  return num.toString();
};

const formatNumber = (num: number, useShortFormat: boolean = true): string => {
  if (useShortFormat) {
    return formatNumberWithSuffix(Math.floor(num));
  }
  return Math.floor(num).toLocaleString('en-US');
};

const CryptoGame: React.FC<CryptoGameProps> = ({ userData, onCoinsUpdate, saveUserData }) => {
  const [user, setUser] = useState<UserType>(
    userData || {
      id: '',
      telegramId: '',
      username: '',
      firstName: '',
      lastName: '',
      coins: 0,
      level: 1,
      exp: 0,
      profilePhoto: '',
      shopItems: [],
      premiumShopItems: [],
      tasks: [],
      dailyReward: {
        lastClaimed: null,
        streak: 0,
        day: 1,
        completed: false,
      },
      unlockedLevels: [1],
      clickPower: 1,
      friendsCoins: {},
      energy: 2000,
      pphAccumulated: 0,
      multiplier: 1,
      multiplierEndTime: null,
      boosterCooldown: null,
      selectedCoinImage: levelImages[0],
      settings: {
        vibration: true,
        backgroundMusic: false,
      },
      profitPerHour: 0,
      boosterCredits: 1, // Updated initial boosterCredits
      lastBoosterReset: null,
    }
  );

  const [currentShopTab, setCurrentShopTab] = useState<'regular' | 'premium'>('regular');
  const { connected, wallet } = useTonConnect();
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [clickPower, setClickPower] = useState(1);
  const [profitPerHour, setProfitPerHour] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  const [energy, setEnergy] = useState(2000);
  const [maxEnergy] = useState(2000);
  const energyRef = useRef<HTMLDivElement>(null);
  const [pphAccumulated, setPphAccumulated] = useState(0);
  const [showPPHPopup, setShowPPHPopup] = useState(false);
  const [settings, setSettings] = useState<{
    vibration: boolean;
    backgroundMusic: boolean;
    backgroundMusicAudio: HTMLAudioElement | null;
  }>({
    vibration: true,
    backgroundMusic: false,
    backgroundMusicAudio: null,
  });
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [dailyReward, setDailyReward] = useState({
    lastClaimed: null as string | null,
    streak: 0,
    day: 1,
    completed: false,
  });
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierEndTime, setMultiplierEndTime] = useState<number | null>(null);
  const [boosterCooldown, setBoosterCooldown] = useState<number | null>(null);
  const [selectedCoinImage, setSelectedCoinImage] = useState(levelImages[0]);
  const [friendsCoins, setFriendsCoins] = useState<{ [key: string]: number }>({});
  const [congratulationPopup, setCongratulationPopup] = useState({
    show: false,
    item: null as ShopItem | PremiumShopItem | null,
  });
  const [clickEffects, setClickEffects] = useState<
    { id: number; x: number; y: number; value: number; color: string; text: string }[]
  >([]);
  const [shownPopups, setShownPopups] = useState<Set<string>>(new Set());
  const [showLevelUnlockPopup, setShowLevelUnlockPopup] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [activePopups, setActivePopups] = useState<Set<string>>(new Set());
  const [shownLevelUnlocks, setShownLevelUnlocks] = useState<Set<number>>(new Set());
  const handleWalletConnect = useCallback(
    (address: string) => {
      setUser((prevUser) => ({
        ...prevUser,
        walletAddress: address,
      }));
      saveUserData({ walletAddress: address });
      console.log('Wallet connected to game:', address);
    },
    [saveUserData]
  );

  useEffect(() => {
    if (connected && wallet?.address && user.walletAddress !== wallet.address) {
      handleWalletConnect(wallet.address);
    }
  }, [connected, wallet, user.walletAddress, handleWalletConnect]);

  const [shopItems, setShopItems] = useState<ShopItem[]>([
    {
      id: 1,
      name: 'Swift Vault',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Swift%20Vault%203D%20ICON-YjJdYhrDzvHtpqZFjqpThbolAWY6fR.png',
      basePrice: 300,
      baseProfit: 100,
      level: 1,
    },
    {
      id: 2,
      name: 'Glow Haven',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Glow%20Haven%203D%20ICON-shE3nK955ePBhcjxHePTVm1UjmqbXY.png',
      basePrice: 600,
      baseProfit: 200,
      level: 1,
    },
    {
      id: 3,
      name: 'Turbo Trove',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Turbo%20Trove%203D%20ICON-xRC8mkvRyBp1S1DiZrTSGZv5Wn59gR.png',
      basePrice: 900,
      baseProfit: 300,
      level: 1,
    },
    {
      id: 4,
      name: 'Star Forge',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Star%20Forge%203D%20ICON-dv0713lbRSVu9JoQX9mBx1FzsBTFWk.png',
      basePrice: 1200,
      baseProfit: 600,
      level: 1,
    },
    {
      id: 5,
      name: 'Pulse Vault',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pulse%20Vault%203D%20ICON-VYtHx0eH8O2SUFaHntxVSYq7gQACFX.png',
      basePrice: 1800,
      baseProfit: 900,
      level: 1,
    },
    {
      id: 6,
      name: 'Flash Nest',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Flash%20Nest%203D%20ICON-A6avR3GCNvkEjhrHUhQ6oX6DPfSjc3.png',
      basePrice: 2400,
      baseProfit: 1200,
      level: 1,
    },
    {
      id: 7,
      name: 'Blaze Vault',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Blaze%20Vault%203D%20ICON-Zr5ZGgsvzm2M0Dyyk8yYz6ocGAm4oU.png',
      basePrice: 3600,
      baseProfit: 1800,
      level: 1,
    },
    {
      id: 8,
      name: 'Shine Chamber',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Shine%20Chamber%203D%20ICON-deR5Ww87XqwIZc7P4hlYsGaiUGcBIf.png',
      basePrice: 4800,
      baseProfit: 2400,
      level: 1,
    },
    {
      id: 9,
      name: 'Speed Market',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Speed%20Market%203D%20ICON-k6ux9fP6NBPGzVzScR0LAsxGGSEL0P.png',
      basePrice: 7200,
      baseProfit: 3600,
      level: 1,
    },
    {
      id: 10,
      name: 'Radiant Depot',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Radiant%20Depot%203D%20ICON-DxHzpjdjUft5ZQfMz7LZxJ9rT6vHNx.png',
      basePrice: 9600,
      baseProfit: 4800,
      level: 1,
    },
  ]);

  const [premiumShopItems, setPremiumShopItems] = useState<PremiumShopItem[]>([
    {
      id: 1,
      name: 'Booster Burst',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Booster%20Burst%203D%20ICON-1aG3Bj9yJ581q3FLf2MWhG0iP3HEMz.png',
      basePrice: 50000,
      effect: 'Adds 1 booster credit',
      boosterCredits: 1,
    },
    {
      id: 2,
      name: 'Coin Hit',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coin%20Hit%203D%20ICON-7MzrNIktY3OEDHK90l9Znezh7buAqj.png',
      basePrice: 6000,
      effect: 'Adds 1 tap to coin button',
      tap: 1,
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      description: 'Share on Facebook',
      reward: 500,
      progress: 0,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Facebook%203D%20ICON-HuOyHlDIHEQusiCA0otRLNqN2QFWGz.png"
          alt="Facebook"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => shareToSocialMedia('facebook'),
    },
    {
      id: 2,
      description: 'Share on X',
      reward: 500,
      progress: 0,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/X%203D%20ICON-7WGq7XU7tZHnLw8Jh2tmLCjf0e94ii.png"
          alt="X"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => shareToSocialMedia('x'),
    },
    {
      id: 3,
      description: 'Share on Instagram',
      reward: 500,
      progress: 0,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Instagram%203D%20ICON-ClIOzvVv2BnSM9iRv28uoYcA6K4UMZ.png"
          alt="Instagram"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => shareToSocialMedia('instagram'),
    },
    {
      id: 4,
      description: 'Subscribe Channel',
      reward: 2000,
      progress: 0,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Youtube%203D%20ICON-n3DFRVp9JnkM0qQcysyNK18eaDTZQ9.png"
          alt="YouTube"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => openYouTubeChannel(),
    },
    {
      id: 5,
      description: 'Watch video',
      reward: 1000,
      progress: 0,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Youtube%203D%20ICON-n3DFRVp9JnkM0qQcysyNK18eaDTZQ9.png"
          alt="YouTube"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => watchYouTubeVideos(),
    },
    {
      id: 6,
      description: 'Join TG News',
      reward: 1000,
      progress: 0,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Telegram%203D%20ICON-NDxLVpptGuaMMEVnUxO3JwNPsoQURR.png"
          alt="Telegram"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => joinTelegramChannel(),
    },
    {
      id: 7,
      description: 'Invite 10 friends',
      reward: 20000,
      progress: 0,
      maxProgress: 10,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Invite%20Friends-zoNaAe54HVxyqUHWGMnRk0yVSPlQNe.png"
          alt="Invite Friends"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => inviteFriends(),
    },
    {
      id: 8,
      description: 'Reach level 10',
      reward: 100000,
      progress: 0,
      maxProgress: 10,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FIRE%203D%20ICON-s9MYcBHxjRf2tFINAmTGa2xg78ithG.png"
          alt="Reach Level 10"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => {},
    },
    {
      id: 9,
      description: "Trophy's Level",
      reward: 100000,
      progress: 0,
      maxProgress: 10,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TROPHY%20TASK%203D%20ICON-XNiYwBNTYYMV7G1hu3QOQHyKIMej8o.png"
          alt="Trophy's Level"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => {},
    },
    {
      id: 10,
      description: 'Follow X',
      reward: 1000,
      progress: 0,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/X%203D%20ICON-7WGq7XU7tZHnLw8Jh2tmLCjf0e94ii.png"
          alt="X"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => followX(),
    },
    {
      id: 11,
      description: 'Follow Instagram',
      reward: 1000,
      progress: 0,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Instagram%203D%20ICON-ClIOzvVv2BnSM9iRv28uoYcA6K4UMZ.png"
          alt="Instagram"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => followInstagram(),
    },
    {
      id: 12,
      description: 'Follow WhatsApp',
      reward: 1000,
      progress: 0,
      completed: false,
      claimed: false,
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Whatsapp%203D%20ICON-xBKvZqkfPamAPHhSnS56SBjZbnQWF7.png"
          alt="WhatsApp"
          width={36}
          height={36}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      ),
      action: () => followWhatsApp(),
    },
  ]);

  const inviteFriend = useCallback(
    async (friendId: string) => {
      if (!invitedFriends.includes(friendId)) {
        try {
          const response = await fetch('/api/invite', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.telegramId,
              friendId: friendId,
            }),
          });

          if (response.ok) {
            setInvitedFriends((prev) => [...prev, friendId]);
            setUser((prevUser) => ({
              ...prevUser,
              coins: prevUser.coins + 2000,
            }));
            saveUserData({ ...user, coins: user.coins + 2000 });
            showGameAlert('You earned 2000 coins for inviting a friend!');
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to process invitation');
          }
        } catch (error) {
          console.error('Error inviting friend:', error);
          showGameAlert('Failed to process invitation. Please try again.');
        }
      }
    },
    [invitedFriends, user, saveUserData]
  );

  const level = useMemo(() => {
    const maxPredefinedLevel = levelRequirements.length - 1;
    if (user.coins < levelRequirements[maxPredefinedLevel]) {
      return levelRequirements.findIndex((req) => user.coins < req);
    } else {
      const excessCoins = user.coins - levelRequirements[maxPredefinedLevel];
      const additionalLevels = Math.floor(excessCoins / levelRequirements[maxPredefinedLevel]);
      return maxPredefinedLevel + additionalLevels + 1;
    }
  }, [user.coins]);

  const nextLevelRequirement = useMemo(() => {
    const maxPredefinedLevel = levelRequirements.length - 1;
    if (level <= maxPredefinedLevel) {
      return levelRequirements[level];
    } else {
      return levelRequirements[maxPredefinedLevel] * (level - maxPredefinedLevel + 1);
    }
  }, [level]);

  const clickCoin = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (currentPage === 'settings') return; // Add this line to prevent updates on the settings page

      if (energy >= 1) {
        const clickValue = clickPower * multiplier;
        const newCoins = user.coins + clickValue;
        const newExp = user.exp + 1;
        const newLevel = newExp >= 100 ? user.level + 1 : user.level;

        const updatedUser = {
          ...user,
          coins: newCoins,
          exp: newExp % 100,
          level: newLevel,
        };

        setUser(updatedUser);
        saveUserData(updatedUser);

        setEnergy((prev) => Math.max(prev - 1, 0));

        const rect = event.currentTarget.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in event) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else {
          clientX = event.clientX;
          clientY = event.clientY;
        }
        const x = clientX;
        const y = clientY;
        const clickEffect = {
          id: Date.now(),
          x,
          y,
          value: clickValue,
          color: 'white',
          text: formatNumber(clickValue, true),
        };
        setClickEffects((prev) => [...prev, clickEffect]);
        setTimeout(() => {
          setClickEffects((prev) => prev.filter((effect) => effect.id !== clickEffect.id));
        }, 700);

        // Trigger haptic feedback
        if (settings.vibration && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        // Send tap data to Telegram Mini App
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.sendData(
            JSON.stringify({ action: 'tap', amount: clickPower * multiplier })
          );
        }

        // Add pulse effect for touch events
        if ('touches' in event) {
          const button = event.currentTarget;
          button.classList.add('pulse');
          setTimeout(() => button.classList.remove('pulse'), 300);
        }
        setLastActiveTime(Date.now()); // Update last active time
      }
    },
    [clickPower, multiplier, energy, settings.vibration, saveUserData, user, currentPage] // Add currentPage to the dependency array
  );

  const buyItem = useCallback(
    async (item: ShopItem) => {
      const currentPrice = item.basePrice * Math.pow(1.5, item.level - 1); // Changed multiplier to 1.5x (50% increase)
      const currentProfit = item.baseProfit * (1 + 0.1 * (item.level - 1)); // Changed to 0.10x (10% increase)

      if (user.coins >= currentPrice) {
        try {
          const updatedUser = {
            ...user,
            coins: user.coins - currentPrice,
          };
          setUser(updatedUser);
          await saveUserData(updatedUser);

          // Update shop item level and recalculate profit per hour
          setShopItems((prevItems) =>
            prevItems.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    level: i.level + 1,
                  }
                : i
            )
          );

          // Update profit per hour
          const newProfit = currentProfit * 1.1; // Increase profit by 10%
          setProfitPerHour((prev) => prev + newProfit);

          setCongratulationPopup({ show: true, item: item });
          showPopup('congratulation');

          if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.sendData(
              JSON.stringify({
                action: 'purchase',
                item: item.name,
                cost: currentPrice,
                newLevel: item.level + 1,
                profitIncrease: newProfit,
              })
            );
          }
        } catch (error) {
          console.error('Error purchasing item:', error);
          showGameAlert('Failed to purchase item. Please try again.');
        }
      } else {
        showGameAlert('Not enough coins!');
      }
    },
    [user, saveUserData, setUser, setProfitPerHour, setCongratulationPopup]
  );

  const buyPremiumItem = useCallback(
    async (item: PremiumShopItem) => {
      if (user.coins >= item.basePrice) {
        try {
          const updatedUser = {
            ...user,
            coins: user.coins - item.basePrice,
          };
          setUser(updatedUser);
          await saveUserData(updatedUser);

          if (item.id === 1 && item.boosterCredits !== undefined) {
            // Booster Credits
            setUser((prevUser) => ({
              ...prevUser,
              boosterCredits: prevUser.boosterCredits + item.boosterCredits!,
            }));
          } else if (item.id === 2 && item.tap) {
            // Cheetah Coin Corner
            setClickPower((prev) => prev + 1);
            setPremiumShopItems((prevItems) =>
              prevItems.map((i) =>
                i.id === item.id ? { ...i, basePrice: i.basePrice * 2, tap: (i.tap || 0) + 1 } : i
              )
            );
          }

          setCongratulationPopup({ show: true, item: item });
          showPopup('congratulation');

          if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.sendData(
              JSON.stringify({
                action: 'purchase',
                item: item.name,
                cost: item.basePrice,
                isPremium: true,
              })
            );
          }
        } catch (error) {
          console.error('Error purchasing item:', error);
          showGameAlert('Failed to purchase item. Please try again.');
        }
      } else {
        showGameAlert('Not enough coins!');
      }
    },
    [user, saveUserData, setUser, setPremiumShopItems, setClickPower, setCongratulationPopup]
  );

  const claimPPH = useCallback(() => {
    if (pphAccumulated > 0) {
      const updatedUser = {
        ...user,
        coins: user.coins + pphAccumulated,
      };
      setUser(updatedUser);
      saveUserData(updatedUser);
      setPphAccumulated(0);
      hidePopup('pph');
      setLastActiveTime(Date.now());
    }
  }, [pphAccumulated, user, saveUserData]);

  const claimNewLevel = useCallback(() => {
    setUser((prevUser) => ({
      ...prevUser,
      level: newLevel,
    }));
    setUnlockedLevels((prev) => [...new Set([...prev, newLevel])]);
    hidePopup('levelUp');
  }, [newLevel]);

  const claimDailyReward = useCallback(() => {
    const now = new Date();
    const lastClaimed = dailyReward.lastClaimed ? new Date(dailyReward.lastClaimed) : null;

    if (
      !dailyReward.completed &&
      (!lastClaimed ||
        now.getDate() !== lastClaimed.getDate() ||
        now.getMonth() !== lastClaimed.getMonth() ||
        now.getFullYear() !== lastClaimed.getFullYear())
    ) {
      const newStreak =
        lastClaimed && (now.getTime() - lastClaimed.getTime()) / (1000 * 60 * 60 * 24) <= 1
          ? dailyReward.streak + 1
          : 1;
      const reward = getDailyReward(newStreak);

      setUser((prevUser) => ({
        ...prevUser,
        coins: prevUser.coins + reward,
      }));

      const newDay = (dailyReward.day % 12) + 1;
      const completed = newDay === 1;

      setDailyReward({
        lastClaimed: now.toISOString(),
        streak: newStreak,
        day: newDay,
        completed: completed,
      });

      showGameAlert(
        `Claimed daily reward: ${formatNumber(reward)} Coins! Streak: ${newStreak} days`
      );
    } else if (dailyReward.completed) {
      showGameAlert('You have completed the 12-day reward cycle!');
    } else {
      showGameAlert('You have already claimed your daily reward today!');
    }
  }, [dailyReward, user, saveUserData]);

  const getDailyReward = (day: number) => {
    const rewards = [100, 500, 700, 10000, 15000, 17000, 20000, 25000, 27000, 30000, 35000, 50000];
    return rewards[(day - 1) % rewards.length];
  };

  const activateMultiplier = useCallback(() => {
    if (user.boosterCredits > 0 && !multiplierEndTime) {
      setMultiplier(2);
      const endTime = Date.now() + 1 * 60 * 1000; // 1 minute
      setMultiplierEndTime(endTime);
      setUser((prevUser) => ({
        ...prevUser,
        boosterCredits: prevUser.boosterCredits - 1,
      }));
      showGameAlert(
        `Activated 2x multiplier for 1 minute! Credits left: ${user.boosterCredits - 1}`
      );

      const cooldownTimer = setTimeout(
        () => {
          setMultiplier(1);
          setMultiplierEndTime(null);
        },
        1 * 60 * 1000
      );

      return () => clearTimeout(cooldownTimer);
    } else if (user.boosterCredits === 0) {
      showGameAlert('No booster credits left. Wait for daily reset.');
    } else if (multiplierEndTime) {
      const remainingMultiplier = Math.ceil((multiplierEndTime - Date.now()) / 1000);
      showGameAlert(`Multiplier active for ${remainingMultiplier} more seconds.`);
    }
  }, [user.boosterCredits, multiplierEndTime]);

  const shareToSocialMedia = useCallback((platform: string) => {
    const message =
      "🏆 Just claimed some coins in Baby Cheetah! 🚀 Join me in this exciting crypto game and start earning too! 🤑 Complete tasks, invite friends, and rise in the ranks. Let's get those coins together! 💰🐾";
    if (platform === 'facebook') {
      window.Telegram.WebApp.openLink(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`
      );
    } else if (platform === 'x') {
      window.Telegram.WebApp.openLink(
        `https://x.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(window.location.href)}`
      );
    } else if (platform === 'instagram') {
      window.Telegram.WebApp.openLink(`https://www.instagram.com/`);
      showGameAlert('Copy and paste the message to your Instagram post!');
    } else if (platform === 'whatsapp') {
      window.Telegram.WebApp.openLink(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
      );
    }
  }, []);

  const openYouTubeChannel = useCallback(() => {
    window.Telegram.WebApp.openLink('https://www.youtube.com/channel/UC-pGiivNfXNXS3DQLblwisg');
  }, []);

  const watchYouTubeVideos = useCallback(() => {
    window.Telegram.WebApp.openLink('https://www.youtube.com/channel/UC-pGiivNfXNXS3DQLblwisg');
  }, []);

  const joinTelegramChannel = useCallback(() => {
    window.Telegram.WebApp.openTelegramLink('https://t.me/babycheetahcrypto');
  }, []);

  const inviteFriends = useCallback(() => {
    const referralLink = `https://t.me/BabyCheetah_Bot/?startapp=${user.telegramId}`;
    showGameConfirm(`Share your referral link: ${referralLink}`, (confirmed: boolean) => {
      if (confirmed) {
        navigator.clipboard.writeText(referralLink);
        showGameAlert('Referral link copied to clipboard!');
      }
    });
  }, [user.telegramId]);

  const followX = useCallback(() => {
    window.Telegram.WebApp.openLink('https://x.com/BabyCheetahTeam');
  }, []);

  const followInstagram = useCallback(() => {
    window.Telegram.WebApp.openLink('https://www.instagram.com/babycheetahcrypto/');
  }, []);

  const followWhatsApp = useCallback(() => {
    window.Telegram.WebApp.openLink('https://whatsapp.com/channel/0029VasnzUPAO7RJkehdu43p');
  }, []);

  const useUserData = () => {
    const fetchUserData = useCallback(async () => {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          const telegramUser = webApp.initDataUnsafe.user;
          console.log('Telegram user data:', telegramUser);

          if (telegramUser) {
            const response = await fetch(`/api/user?telegramId=${telegramUser.id}`);
            console.log('Fetch response status:', response.status);

            if (response.ok) {
              const userData = await response.json();
              console.log('Fetched user data:', userData);
              setUser(userData);
            } else {
              console.error('Failed to fetch user data:', await response.text());
              throw new Error('Failed to fetch user data');
            }
          } else {
            console.error('No Telegram user data available');
            throw new Error('No Telegram user data available');
          }
        } else {
          console.error('Telegram WebApp not available');
          throw new Error('Telegram WebApp not available');
        }
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      if (connected && wallet) {
        console.log('Wallet connected:', wallet.address);
        // You can update the user data or perform any other actions here
        // when the wallet is connected
      }
    }, [connected, wallet]);

    useEffect(() => {
      if (userData) {
        setUser(userData);
      }
    }, [userData]);

    useEffect(() => {
      fetchUserData();
    }, [fetchUserData]);

    const handleCoinChange = (amount: number) => {
      if (user) {
        const updatedUser: UserData = { ...user, coins: user.coins + amount };
        saveUserData(updatedUser);
        onCoinsUpdate(updatedUser.coins);
      }
    };

    const saveUserData = useCallback(async (updatedUser: Partial<UserType>) => {
      if (!updatedUser) return;
      try {
        console.log('Saving user data:', updatedUser);
        const response = await fetch('/api/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser),
        });

        if (!response.ok) {
          throw new Error('Failed to save user data');
        }

        const savedUser = await response.json();
        setUser(savedUser);
        console.log('User data saved successfully');
      } catch (error) {
        console.error('Error saving user data:', error);
        showGameAlert('Failed to save user data. Please try again.');
      }
    }, []);

    return { user, setUser, saveUserData, isLoading, fetchUserData };
  };

  const fetchUserData = useCallback(async () => {
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        const telegramUser = webApp.initDataUnsafe.user;
        console.log('Telegram user data:', telegramUser);

        if (telegramUser) {
          const response = await fetch(`/api/user?telegramId=${telegramUser.id}`);
          if (response.ok) {
            const userData = await response.json();
            console.log('Fetched user data:', userData);
            setUser(userData);
          } else {
            console.error('Failed to fetch user data:', await response.text());
          }
        } else {
          console.error('No Telegram user data available');
        }
      } else {
        console.error('Telegram WebApp not available');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const initializeGame = async () => {
      setIsLoading(true);
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          webApp.ready();
          webApp.expand();

          // Set the viewport height
          const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
          };

          setViewportHeight();
          window.addEventListener('resize', setViewportHeight);

          // Get user data from Telegram
          const telegramUser = webApp.initDataUnsafe.user;
          if (telegramUser) {
            setUser((prevUser) => ({
              ...prevUser,
              name:
                telegramUser.username ||
                `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
              telegramId: telegramUser.id.toString(),
              profilePhoto: telegramUser.photo_url || '',
            }));
          }

          // Apply Telegram theme
          document.body.style.setProperty('--tg-theme-bg-color', webApp.backgroundColor);
          document.body.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color);
          document.body.style.setProperty(
            '--tg-theme-button-color',
            webApp.themeParams.button_color
          );
          document.body.style.setProperty(
            '--tg-theme-button-text-color',
            webApp.themeParams.button_text_color
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []);

  // Check if TelegramWebApp is available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      // Telegram Web App environment
      const TelegramWebApp = window.Telegram.WebApp;
      TelegramWebApp.ready();
      TelegramWebApp.expand();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy((prevEnergy) => {
        const newEnergy = Math.min(prevEnergy + 0.2, maxEnergy);
        if (energyRef.current) {
          energyRef.current.style.width = `${(newEnergy / maxEnergy) * 100}%`;
        }
        return newEnergy;
      });

      // Update coins based on real-time profit
      setUser((prevUser) => ({
        ...prevUser,
        coins: prevUser.coins + profitPerHour / 3600,
      }));
    }, 1000); // Check every second
    return () => clearInterval(timer);
  }, [maxEnergy, profitPerHour]);

  // Show PPH popup
  useEffect(() => {
    const now = Date.now();
    const timeDiff = now - lastActiveTime;
    const maxOfflineTime = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

    if (timeDiff > 1000) {
      // User was offline for more than a second
      const offlineEarnings = Math.min((profitPerHour * timeDiff) / 3600000, profitPerHour * 3);
      setPphAccumulated(offlineEarnings);
      showPopup('pph');
    }

    setLastActiveTime(now);
  }, [lastActiveTime, profitPerHour]);

  // Level up and task progress
  useEffect(() => {
    if (level > user.level && !activePopups.has('levelUp')) {
      setNewLevel(level);
      showPopup('levelUp');
    }

    const newUnlockedLevels = levelRequirements
      .filter((req, index) => user.coins >= req && !unlockedLevels.includes(index + 1))
      .map((_, index) => index + 1);
    if (newUnlockedLevels.length > 0) {
      setUnlockedLevels((prev) => [...prev, ...newUnlockedLevels]);
      const highestNewLevel = Math.max(...newUnlockedLevels);
      if (!shownLevelUnlocks.has(highestNewLevel)) {
        setUnlockedLevel(highestNewLevel);
        showPopup('levelUnlock');
      }
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === 8) {
          const newProgress = Math.min(level, 10);
          const completed = newProgress >= 10;
          if (completed && !task.completed) {
            setUser((u) => ({ ...u, coins: u.coins + task.reward }));
          }
          return { ...task, progress: newProgress, completed };
        }
        return task;
      })
    );
  }, [level, user.level, user.coins, unlockedLevels, activePopups, shownLevelUnlocks]);

  useEffect(() => {
    if (!user.settings) {
      setUser((prevUser) => ({
        ...prevUser,
        settings: {
          vibration: true,
          backgroundMusic: false,
        },
      }));
    }
  }, [user]);

  const renderHeader = () => (
    <div className="sticky top-0 z-10 bg-black/30 backdrop-blur-xl p-3 rounded-b-3xl border-b border-white/10 shadow-lg">
      <Card className="bg-transparent border-0 overflow-hidden">
        <CardContent className="p-0 flex items-center justify-between relative flex-wrap">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-full flex items-center justify-center transform rotate-12 shadow-lg overflow-hidden border border-white/20">
              <Image
                src={user.profilePhoto}
                alt={user.username}
                width={48}
                height={48}
                className="rounded-full"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            <div>
              <h2 className="font-black text-base text-white">
                {`${user.firstName || ''} ${user.lastName || ''}`.trim().slice(0, 12) + '...'}
              </h2>
              <div className="text-sm text-white font-bold flex items-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-Jx43bOKm7s99NARIa6gjgHp3gQ7RP1.png"
                  alt="Coin"
                  width={20}
                  height={20}
                  className="mr-1"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
                <span className="font-bold">{formatNumberWithSuffix(user.coins)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="bg-white/10 backdrop-blur-xl text-white p-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 border border-white/20"
              onClick={() => {
                setCurrentPage('trophies');
              }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TROPHY%203D%20ICON-OWj5E59yfxlLk1Ggf2x8o0kfMIJNVy.png"
                alt="Trophies"
                width={32}
                height={32}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </Button>
            <Button
              variant="ghost"
              className="bg-white/10 backdrop-blur-xl text-white p-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 border border-white/20"
              onClick={() => {
                setCurrentPage('levels');
              }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LEVEL%203D%20ICON-1QycsqYoN36yz9KyR6KM3Q7pfm2eTe.png"
                alt="Levels"
                width={32}
                height={32}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </Button>
            <Button
              variant="ghost"
              className="bg-white/10 backdrop-blur-xl text-white p-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 border border-white/20"
              onClick={() => {
                setCurrentPage('settings');
              }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SETTING%203D%20ICON-e5kOIT7doa350SWGGjbyEw71v4Ldhm.png"
                alt="Settings"
                width={32}
                height={32}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderbottom = () => (
    <div
      className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-xl p-2 rounded-t-3xl z-50 border-t border-gray-700/30"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/30 to-blue-900/30 rounded-full blur-xl"></div>
        {[
          {
            page: 'tasks',
            text: 'Tasks',
            icon: 'TASKS%203D%20ICON-TdX24HYmqD0KAnug5YsjXN8t6qMRDr.png',
          },
          {
            page: 'shop',
            text: 'Shop',
            icon: 'SHOP%203D%20ICON-02YxP35Bd9AC8hMPGjqzUQylpXOHRS.png',
          },
          {
            page: 'home',
            text: 'Home',
            icon: 'Home%203D%20ICON-lq4p7b3umu25lmHYmoI2AyAjriJJl5.png',
          },
          {
            page: 'ranking',
            text: 'Ranking',
            icon: 'RATING%203D%20ICON-fc1CF0mncViyB8MTFT7iisKtLfBKoA.png',
          },
          {
            page: 'invite',
            text: 'Invite',
            icon: 'FRIEND%20INVITE%203D%20ICON-GyAxv2xoA7fZeN65uJ60ILc6RQxxXN.png',
          },
        ].map(({ page, text, icon }) => (
          <CryptoButton
            key={page}
            icon={(props) => (
              <Image
                src={`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/${icon}`}
                alt={text}
                width={37}
                height={37}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
                {...props}
              />
            )}
            href={page}
            text={text}
            isActive={currentPage === page}
            setCurrentPage={setCurrentPage}
          />
        ))}
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="flex-grow flex flex-col items-center justify-between p-4 relative overflow-hidden">
      <div className="text-center w-full max-w-md flex flex-col justify-end h-full">
        <div className="flex space-x-2 mb-4 w-full">
          <div className="flex-1 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-2 backdrop-blur-md flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Levels%203D%20ICON-OqKpsqUsCgruaYTpvTZkyMGr0gWVum.png"
                  alt="Level Icon"
                  width={18}
                  height={18}
                  className="inline-block"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
                <span className="text-sm font-bold text-white font-bold">Level {level}</span>
              </div>
            </div>
            <div className="w-full bg-gray-700/30 h-2 rounded-full overflow-hidden backdrop-blur-md">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out animate-pulse"
                style={{
                  width: `${((user.coins - levelRequirements[level - 1]) / (nextLevelRequirement - levelRequirements[level - 1])) * 100}%`,
                  boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
            </div>
            <div className="text-xs text-white font-bold flex justify-between mt-1">
              <span className="font-bold">
                {formatNumber(user.coins - levelRequirements[level - 1], true)}
              </span>
              <span className="font-bold">
                {formatNumber(nextLevelRequirement - levelRequirements[level - 1], true)} coins
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('wallet')}
              className="flex-none w-16 h-16 bg-gradient-to-r from-yellow-600 to-orange-600 backdrop-blur-md text-white p-2 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 wallet-button font-bold"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wallet%203D%20ICON-i45iGLhTQldoCi8pzRNLinRlgHiofn.png"
                alt="Wallet"
                width={32}
                height={32}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </Button>
            <div className="flex-none w-16 h-16 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md text-white p-2 rounded-xl shadow-lg flex flex-col items-center justify-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CLOCK%203D%20ICON-UUwIZcQbC3VSDZkALg1FQGG7PCsG2w.png"
                alt="Profit Per Hour"
                width={22}
                height={22}
                className="mb-1"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
              <span className="text-xs text-white font-bold">
                {formatNumber(profitPerHour, true)}/h
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <h1
            className={`font-black text-white font-extrabold overflow-hidden ${formatNumber(user.coins, false).length > 7 ? 'text-4xl' : 'text-5xl'}`}
          >
            {formatNumber(user.coins, false)
              .split('')
              .map((digit, index) => (
                <span
                  key={index}
                  className="inline-block font-bold"
                  style={{
                    animation: `countUp 0.5s ${index * 0.1}s backwards`,
                  }}
                >
                  {digit}
                </span>
              ))}
          </h1>
          <div className="w-12 h-12">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Crypto%20Coin%203D%20ICON-QksBNLkNX7u1KmxGGnaVV8937NucdL.png"
              alt="Crypto Coin"
              width={48}
              height={48}
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full mx-auto">
          <div className="relative">
            <button
              className="w-[335px] h-[335px] rounded-full overflow-hidden shadow-lg z-20 coin-button mb-6 relative bg-transparent"
              onClick={clickCoin}
              onTouchStart={clickCoin}
              onTouchEnd={(e) => e.preventDefault()}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Image
                  src={selectedCoinImage}
                  alt={`Level ${level} Cheetah`}
                  width={335}
                  height={335}
                  objectFit="contain"
                  className="relative z-10"
                  priority
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </button>
          </div>

          <div className="w-full max-w-md mb-2">
            <div className="flex justify-between text-sm mb-2 text-white font-bold">
              <span className="font-bold flex items-center gap-2">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Energy%203D%20ICON-4zZaqZ94OWxLZYPRzSYsS1bpecFsCS.png"
                  alt="Energy"
                  width={24}
                  height={24}
                  className="animate-pulse"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
                Energy
              </span>
              <span className="font-bold">
                {Math.floor(energy)}/{maxEnergy}
              </span>
            </div>
            <div className="h-3 bg-gray-800/50 backdrop-blur-sm rounded-full overflow-hidden relative">
              <div
                ref={energyRef}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-blue-400 to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${(energy / maxEnergy) * 100}%`,
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full mb-4">
            <Button
              onClick={() => {
                setCurrentPage('dailyReward');
              }}
              className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-3 py-2 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 text-sm font-bold daily-reward-button"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Daily%20Reward%203D%20ICON-GE4oWyoZwrVMWsQY4vZGJbcJmyd2VX.png"
                alt="Daily Reward"
                width={30}
                height={30}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
              <span className="font-bold">Daily Reward</span>
            </Button>
            <Button
              onClick={activateMultiplier}
              className={`flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 text-sm font-bold ${
                user.boosterCredits === 0 || multiplierEndTime ? 'opacity-50' : ''
              }`}
              disabled={user.boosterCredits === 0 || !!multiplierEndTime}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BOOST%203D%20ICON-YhjAJUG0nQni2cUfdcWSAXtp6f5Cxo.png"
                alt="2x Multiplier"
                width={30}
                height={30}
                className="mr-1"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
              <span className="font-bold">
                {multiplierEndTime
                  ? `Active (${Math.ceil((multiplierEndTime - Date.now()) / 1000)}s)`
                  : user.boosterCredits === 0
                    ? 'No credits'
                    : `Booster (${user.boosterCredits})`}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="flex-grow flex flex-col items-center justify-start p-4 pb-16 relative overflow-y-auto">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <StarryBackground />
      </div>
      <div className="w-full max-w-7xl mx-auto">
        <div className="sticky top-0 z-10 py-4 mb-8">
          <div className="flex justify-center">
            <div className="rounded-full p-1 flex backdrop-blur-md bg-white/10">
              <button
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentShopTab === 'regular'
                    ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
                onClick={() => setCurrentShopTab('regular')}
              >
                Regular Shop
              </button>
              <button
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentShopTab === 'premium'
                    ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
                onClick={() => setCurrentShopTab('premium')}
              >
                Premium Shop
              </button>
            </div>
          </div>
        </div>

        {currentShopTab === 'regular' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {shopItems.map((item, index) => (
                <NeonGradientCard
                  key={item.id}
                  className="transform transition-all duration-300 hover:shadow-2xl group rounded-xl overflow-hidden"
                >
                  <h3 className="text-sm font-bold text-center mb-2 group-hover:text-primary transition-colors duration-300 text-white">
                    {item.name}
                  </h3>
                  <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-[15px] group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={item.image}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      className={`relative z-10 rounded-[15px] ${
                        !unlockedLevels.includes(index + 1)
                          ? 'group-hover:opacity-80 transition-opacity duration-300'
                          : ''
                      }`}
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                  <p className="text-xs text-white mb-1 flex items-center">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Levels%203D%20ICON-OqKpsqUsCgruaYTpvTZkyMGr0gWVum.png"
                      alt="Level"
                      width={14}
                      height={14}
                      className="inline mr-1"
                    />
                    Level: {item.level}
                  </p>
                  <p className="text-xs text-white mb-2 flex items-center">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Profit%203D%20ICON-LxqAu2YW7MazlwuZhOdC4RpqnczhU3.png"
                      alt="Profit"
                      width={14}
                      height={14}
                      className="inline mr-1"
                    />
                    Profit: {formatNumber(item.baseProfit * (1 + 0.1 * (item.level - 1)), true)}/h
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white py-2 rounded-2xl text-sm font-bold hover:via-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center"
                    onClick={() => {
                      buyItem(item);
                    }}
                  >
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Crypto%20Coin%203D%20ICON-QksBNLkNX7u1KmxGGnaVV8937NucdL.png"
                      alt="Crypto Coin"
                      width={16}
                      height={16}
                      className="mr-1"
                    />
                    {formatNumber(item.basePrice * Math.pow(1.5, item.level - 1), true)}
                  </Button>
                </NeonGradientCard>
              ))}
            </div>
          </>
        )}

        {currentShopTab === 'premium' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {premiumShopItems.map((item) => (
                <NeonGradientCard
                  key={item.id}
                  className="transform transition-all duration-300 hover:shadow-2xl group rounded-xl overflow-hidden"
                >
                  <h3 className="text-sm font-bold text-center mb-2 group-hover:text-primary transition-colors duration-300 text-white">
                    {item.name}
                  </h3>
                  <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-[15px] group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={item.image}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-[15px] group-hover:opacity-80 transition-opacity duration-300"
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                  <p className="text-xs text-white mb-1 flex items-center">
                    <Image
                      src={
                        item.id === 1
                          ? 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Boost%203D%20ICON-4b947I4OluagHe9yjdro9LLmy0s41A.png'
                          : 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tap%203D%20ICON-c6aHeRV1j8uaDFXdyjcROOXZmpi7Ei.png'
                      }
                      alt={item.id === 1 ? 'Boost' : 'Tap'}
                      width={14}
                      height={14}
                      className="inline mr-1"
                    />
                    {item.id === 1 ? 'Boost:' : 'Tap:'}{' '}
                    {item.id === 1 ? item.boosterCredits : item.tap}
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white py-2 rounded-2xl text-sm font-bold hover:via-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center"
                    onClick={() => {
                      buyPremiumItem(item);
                    }}
                  >
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Crypto%20Coin%203D%20ICON-QksBNLkNX7u1KmxGGnaVV8937NucdL.png"
                      alt="Crypto Coin"
                      width={16}
                      height={16}
                      className="mr-1"
                    />
                    {formatNumber(item.basePrice, true)}
                  </Button>
                </NeonGradientCard>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="flex-grow flex flex-col items-center justify-start p-4 pb-16 relative overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {tasks.map((task) => (
          <NeonGradientCard
            key={task.id}
            className="transform transition-all duration-300 hover:shadow-2xl"
          >
            <CardHeader className="p-3">
              <CardTitle className="flex items-center justify-between z-10 text-base">
                <span className="flex items-center">
                  {task.icon}
                  <span className="ml-2 text-white">{task.description}</span>
                </span>
                <span className="text-white font-bold">
                  {formatNumber(task.reward, true)} coins
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${(task.progress / (task.maxProgress || 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">
                  {task.progress}/{task.maxProgress || 1} complete
                </span>
                {task.completed ? (
                  task.claimed ? (
                    <Button
                      className="bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="font-bold">Claimed</span>
                    </Button>
                  ) : (
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs font-bold transform transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-pink-700 font-bold"
                      onClick={() => {
                        setUser((prevUser) => ({
                          ...prevUser,
                          coins: prevUser.coins + task.reward,
                        }));
                        setTasks((prevTasks) =>
                          prevTasks.map((t) => (t.id === task.id ? { ...t, claimed: true } : t))
                        );
                        showGameAlert(`Claimed ${formatNumber(task.reward, true)} coins!`);
                      }}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      <span className="font-bold">Claim</span>
                    </Button>
                  )
                ) : (
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-xs font-bold transform transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-cyan-700 font-bold"
                    onClick={() => {
                      task.action();
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    <span className="font-bold">Start</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </NeonGradientCard>
        ))}
      </div>
    </div>
  );

  const renderRanking = () => {
    return (
      <div className="flex-grow flex flex-col items-center justify-start p-4 pb-16 relative overflow-y-auto">
        <div className="w-full max-w-2xl bg-gray-900/50 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-800">
          {leaderboardData.slice(0, 200).map((player, index) => (
            <NeonGradientCard
              key={player.id}
              className={`flex items-center justify-between p-4 ${
                index < 3
                  ? `bg-gradient-to-r ${
                      index === 0
                        ? 'from-yellow-600/50 to-yellow-800/50'
                        : index === 1
                          ? 'from-gray-400/50 to-gray-600/50'
                          : 'from-orange-600/50 to-orange-800/50'
                    } text-white font-bold`
                  : index % 2 === 0
                    ? 'bg-gray-800/30'
                    : 'bg-gray-900/30'
              } ${player.rank === currentUserRank ? 'bg-gradient-to-r from-primary/50 to-primary-foreground/50' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index < 3
                      ? index === 0
                        ? 'bg-yellow-400'
                        : index === 1
                          ? 'bg-gray-300'
                          : 'bg-orange-400'
                      : 'bg-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-white font-bold">{player.name}</h3>
                  <p className="text-sm text-white font-bold">
                    {formatNumber(player.coins, true)} coins
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white font-bold">Profit/h</p>
                <p className="font-bold text-white font-bold">
                  {formatNumber(player.profitPerHour, true)}
                </p>
              </div>
            </NeonGradientCard>
          ))}
        </div>
        {currentUserRank > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-primary/30 to-primary-foreground/30 rounded-lg shadow-lg backdrop-blur-md">
            <p className="text-white text-xl font-bold">
              Your current rank:{' '}
              <span className="font-bold text-white font-bold">{currentUserRank}</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderWallet = () => <Wallet coins={user.coins} onWalletConnect={handleWalletConnect} />;

  const renderLevels = () => (
    <div className="flex-grow flex flex-col items-center justify-start p-4 pb-16 relative overflow-y-auto">
      <div className="grid grid-cols-2 gap-4 p-4">
        {levelImages.map((image, index) => {
          const isUnlocked = unlockedLevels.includes(index + 1);
          if (user.coins >= levelRequirements[index] && !unlockedLevels.includes(index + 1)) {
            setUnlockedLevels((prev) => [...prev, index + 1]);
          }
          return (
            <div key={index}>
              <NeonGradientCard
                className={`bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden transform transition-all duration-300 hover:shadow-2xl ${
                  isUnlocked ? 'border-2 border-primary' : ''
                }`}
              >
                <CardHeader className="relative p-2">
                  <CardTitle className="z-10 text-center text-[#FFFFFF] font-extrabold text-sm">
                    {index === 0 && 'Broke Cheetah'}
                    {index === 1 && 'Mr Cheetah'}
                    {index === 2 && 'Sparrow Cheetah'}
                    {index === 3 && 'Viking Cheetah'}
                    {index === 4 && 'Samurai Cheetah'}
                    {index === 5 && 'Alien Cheetah'}
                    {index === 6 && 'Robot Cheetah'}
                    {index === 7 && 'Space Cheetah'}
                    {index === 8 && 'Pop Cheetah'}
                    {index === 9 && 'Super Cheetah'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-2">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg mb-2 level-button">
                    <Image
                      src={image}
                      alt={`Level ${index + 1}`}
                      layout="fill"
                      objectFit="contain"
                      className={`relative z-10 ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-level-YQMxTHGDxhTgRoTxhFxSRZxNxNxNxN.png';
                      }}
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                  <p className="text-xs text-center text-white mb-2">
                    {isUnlocked ? (
                      <>
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Unlocked%203D%20ICON-F9DnOWD7XNAVmHCrNYHPlZZ3Iyg6qP.png"
                          alt="Unlocked Icon"
                          width={16}
                          height={16}
                          className="inline-block mr-1"
                        />
                        <span>Unlocked</span>
                      </>
                    ) : (
                      <>
                        Unlock at{' '}
                        <span className="text-yellow-400">
                          {formatNumber(levelRequirements[index], true)}
                        </span>{' '}
                        coins
                      </>
                    )}
                  </p>
                  {isUnlocked && (
                    <Button
                      onClick={() => {
                        setSelectedCoinImage(image);
                        setCurrentPage('home');
                        if (!unlockedLevels.includes(index + 1)) {
                          showGameAlert(`Congratulations! You've unlocked Level ${index + 1}!`);
                        }
                      }}
                      className={`w-full text-white text-xs py-2 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 level-button ${
                        selectedCoinImage === image
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      } flex items-center justify-center font-bold`}
                    >
                      {selectedCoinImage === image ? (
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Current%203D%20ICON-XlI3WOlLsZZYFbbQXzBDAl6pWl8H81.png"
                          alt="Current"
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                      ) : (
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Use%203D%20ICON-v45FnFKLV9CZdk918x5UG4dSufQB2z.png"
                          alt="Use"
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                      )}
                      <span className="font-bold">
                        {selectedCoinImage === image ? 'Current' : 'Use'}
                      </span>
                    </Button>
                  )}
                </CardContent>
              </NeonGradientCard>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLevelUnlockPopup = () => (
    <Popup
      title="Level Unlocked!"
      onClose={() => {
        hidePopup('levelUnlock');
        setShownLevelUnlocks((prev) => new Set(prev).add(unlockedLevel));
      }}
    >
      <p className="mb-6 text-xl text-center text-white">
        Congratulations! You've unlocked <span className="font-bold">Level {unlockedLevel}</span>!
      </p>
      <Button
        onClick={() => {
          hidePopup('levelUnlock');
          setShownLevelUnlocks((prev) => new Set(prev).add(unlockedLevel));
        }}
        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-base font-bold"
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Awesome%203D%20ICON-HN2tr353wye3DLusQa15XU8aM36j8U.png"
          alt="Awesome"
          width={34}
          height={34}
          className="w-6 h-6 relative z-10"
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
        <span className="font-extrabold text-lg relative z-10">Awesome!</span>
      </Button>
    </Popup>
  );

  const renderSettings = () => (
    <div className="flex-grow flex items-center justify-center p-6">
      <NeonGradientCard className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative p-6 pb-2">
          <CardTitle className="z-10 text-3xl text-center text-white font-bold">Settings</CardTitle>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-70 rounded-2xl border border-gray-700 shadow-lg"></div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {[
            {
              id: 'vibration',
              icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Vibrate%203D%20ICON-2n53zEIwaFDSD3Bl9GWULb8slR8d6c.png',
              label: 'Vibration',
              description: 'Enable haptic feedback when tapping',
            },
            {
              id: 'backgroundMusic',
              icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Music%203D%20ICON-xQYRmibKIf540A6WMxNsmfjcc3S3J6.png',
              label: 'Background Music',
              description: 'Play game music in the background',
            },
          ].map(({ id, icon, label, description }) => (
            <div
              key={id}
              className="flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-700/50 to-gray-800/50">
                  <Image
                    src={icon}
                    alt={label}
                    width={32}
                    height={32}
                    className="text-primary"
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-white">{label}</h3>
                  <p className="text-xs text-gray-400">{description}</p>
                </div>
              </div>
              <Switch
                id={id}
                checked={
                  typeof settings[id as keyof typeof settings] === 'boolean'
                    ? (settings[id as keyof typeof settings] as boolean)
                    : false
                }
                onCheckedChange={(checked) => {
                  setSettings((prev) => {
                    const newSettings = { ...prev, [id]: checked };
                    if (id === 'vibration' && checked && navigator.vibrate) {
                      navigator.vibrate([100, 30, 100, 30, 100]);
                    } else if (id === 'backgroundMusic') {
                      if (checked && newSettings.backgroundMusicAudio) {
                        newSettings.backgroundMusicAudio
                          .play()
                          .catch((error: Error) => console.error('Error playing audio:', error));
                        newSettings.backgroundMusicAudio.loop = true;
                      } else if (newSettings.backgroundMusicAudio) {
                        newSettings.backgroundMusicAudio.pause();
                        newSettings.backgroundMusicAudio.currentTime = 0;
                      }
                    }
                    return newSettings;
                  });
                }}
                className="data-[state=checked]:bg-green-400 data-[state=unchecked]:bg-gray-600"
              />
            </div>
          ))}
        </CardContent>
      </NeonGradientCard>
    </div>
  );

  const renderDailyReward = () => (
    <div className="flex-grow flex flex-col items-center justify-start p-4 pb-16 relative overflow-y-auto">
      <NeonGradientCard className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative">
          <CardTitle className="z-10 text-3xl text-center text-white font-bold">
            Daily Rewards
          </CardTitle>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-70 rounded-2xl border border-gray-700 shadow-lg"></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const day = i + 1;
              const isCurrentDay = day === dailyReward.day;
              const isPastDay = day < dailyReward.day;
              const reward = getDailyReward(day);

              // Array of unique icon URLs for each day
              const iconUrls = [
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%201%203D%20ICON-B9zVEw3i39gIu7Sj1L4ujelb7ZhbEu.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%202%203D%20ICON-JkuZGy30eYcLlZCAxVeVmWXAF1z9DR.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%203%203D%20ICON-staviwV2Ywni7SxZltnz8jC15E3rUL.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%204%203D%20ICON-FfBDQmuZOdrfyEg5Uv79vDiocdjUzX.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%205%203D%20ICON-pfPc2tlISCb7JdA89fqagvaQ6aJMEn.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%206%203D%20ICON-PBmm3pdX2tBYcPAhqCoFPaoDDWbmdA.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%207%203D%20ICON-jHI7hKoYms2LUXzBitB6CR6T4F9054.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%208%203D%20ICON-Q98CtOGxE9cIiCEMJCHFoJfhbYT8zd.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%209%203D%20ICON-F2nrRqa77tUBK75tUBRD7lWKB5TbC3.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%2010%203D%20ICON-UBW0RWBt8PMD5jEndraJ3ar3a0V4Xt.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%2011%203D%20ICON-tZ0YGQ4KjMaBlSUA7wUwdzUGPmdVTM.png',
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Day%2012%203D%20ICON-giH2mPm3abxND2CUC4a5RrcC0enYvd.png',
              ];

              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center relative overflow-hidden ${
                    isCurrentDay
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900'
                  }`}
                >
                  <span className="text-lg font-bold text-white mb-1 font-bold">{day}</span>
                  <Image
                    src={iconUrls[i]}
                    alt={`Day ${day} Icon`}
                    width={50}
                    height={50}
                    className={`w-12 h-12 ${
                      isCurrentDay ? 'text-white' : isPastDay ? 'text-white' : 'text-white'
                    }`}
                  />
                  <div className="mt-2 text-sm font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    {formatNumber(reward, true)}
                  </div>
                  {isPastDay && (
                    <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-green-400" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <p className="text-xl mb-4 text-white">Current Streak: {dailyReward.streak} days</p>
            <Button
              onClick={() => {
                claimDailyReward();
              }}
              className="w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 backdrop-blur-md text-white font-bold"
              disabled={dailyReward.completed}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Claim%20Reward%203D%20ICON-XyBdXZwO7OnLf5Zuj0Ivp7PNjc1YIp.png"
                alt="Claim Reward"
                width={24}
                height={24}
                className="w-6 h-6 mr-2"
              />
              <span className="font-bold">Claim Reward</span>
            </Button>
          </div>
        </CardContent>
      </NeonGradientCard>
    </div>
  );

  const renderInvite = () => (
    <div className="flex-grow flex flex-col items-center justify-start p-4 pb-16 relative overflow-y-auto">
      <NeonGradientCard className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative">
          <CardTitle className="z-10 text-3xl text-center text-white font-bold">
            Invite Friends
          </CardTitle>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-70 rounded-2xl border border-gray-700 shadow-lg"></div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-800/60 to-pink-800/60 rounded-lg backdrop-blur-md">
            <h3 className="text-xl font-bold mb-2 text-center text-white">Your Referral Link</h3>
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2">
              <span className="text-sm text-white truncate mr-2">
                https://t.me/BabyCheetah_Bot/?startapp={user.telegramId}
              </span>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://t.me/BabyCheetah_Bot/?startapp=${user.telegramId}`
                  );
                  showGameAlert('Referral link copied to clipboard!');
                }}
                className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-xs py-1 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center font-bold"
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copy%203D%20ICON-qVagBixv3Uacicht1qeEubKtLUwh6W.png"
                  alt="Copy"
                  width={24}
                  height={24}
                  className="w-5 h-5 mr-2"
                />
                <span className="font-bold">Copy</span>
              </Button>
            </div>
            <p className="text-xs text-center mt-2 text-white">
              Share this link to earn <span className="text-yellow-400 font-bold">2000</span> coins
              for each friend who joins!
            </p>
          </div>
          <Button
            onClick={() => setCurrentPage('friendsActivity')}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white py-3 rounded-2xl text-lg font-bold transform transition-all duration-300 hover:scale-105 backdrop-blur-md mt-4 flex items-center justify-center font-bold"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Friends%20Activity%203D%20ICON-MuArgoDXJUAr5rEz9VgjF4KmRcHPy9.png"
              alt="Friends Activity"
              width={34}
              height={34}
              className="w-8 h-8 mr-2"
            />
            <span className="font-bold">Friends Activity</span>
          </Button>
        </CardContent>
      </NeonGradientCard>
    </div>
  );

  const renderFriendsActivity = () => (
    <div className="flex-grow flex items-center justify-start p-4 pb-16 relative overflow-y-auto">
      <NeonGradientCard className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative">
          <CardTitle className="z-10 text-3xl text-center text-white font-bold">
            Friends Activity
          </CardTitle>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform -skew-y-3"></div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {Object.entries(friendsCoins).map(([friendId, coins]) => (
            <div
              key={friendId}
              className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-4 rounded-lg backdrop-blur-md"
            >
              <span className="font-bold text-white font-bold">Friend {friendId}</span>
              <span className="text-yellow font-bold">{formatNumber(coins, true)} coins</span>
            </div>
          ))}
          {Object.keys(friendsCoins).length === 0 && (
            <p className="text-center text-white">
              No friends invited yet. Share your referral link to get started!
            </p>
          )}
        </CardContent>
      </NeonGradientCard>
    </div>
  );

  const renderTrophies = () => (
    <div className="grid grid-cols-1 gap-4 p-4">
      {trophies.map((trophy, index) => (
        <div key={index}>
          <NeonGradientCard
            className={`bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl ${
              user.coins >= trophy.requirement ? 'border-2 border-primary' : ''
            }`}
          >
            <CardHeader className="relative">
              <CardTitle className="z-10 text-center text-white font-bold">{trophy.name}</CardTitle>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-70 rounded-2xl border border-gray-700 shadow-lg"></div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
                <Image
                  src={trophy.icon}
                  alt={trophy.name}
                  width={150}
                  height={150}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-trophy-YQMxTHGDxhTgRoTxhFxSRZxNxNxNxN.png';
                  }}
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              <p className="text-sm text-center text-white">{trophy.description}</p>
              <p className="text-sm text-center text-white mt-2">
                Requirement:{' '}
                <span className="text-yellow-500">{formatNumber(trophy.requirement, true)}</span>{' '}
                coins
              </p>
              <p className="text-sm text-center text-white">
                Prize: <span className="text-yellow-500">{formatNumber(trophy.prize, true)}</span>{' '}
                coins
              </p>
              {user.coins >= trophy.requirement && !trophy.claimed ? (
                <Button
                  onClick={() => claimTrophy(trophy)}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-4 py-2 rounded-2xl shadow-lg transform transition-all duration-300 mt-4 flex items-center justify-center hover:from-purple-600 hover:via-pink-600 hover:to-red-600 hover:scale-105 active:scale-95 trophy-button font-bold text-base"
                >
                  <a href="#" className="flex items-center justify-center">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Claim%203D%20ICON-ddItyvxb6SR8lfphuvhK6P2snlkJqt.png"
                      alt="Claim Trophy"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    <span className="font-bold">Claim</span>
                  </a>
                </Button>
              ) : trophy.claimed ? (
                <div className="w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 text-white px-4 py-2 rounded-2xl shadow-lg transform transition-all duration-300 mt-4 flex items-center justify-center font-bold text-base">
                  <a href="#" className="flex items-center justify-center">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Claimed%203D%20ICON-TiYmc8wajOladsY7nfqhbrWuZYckFp.png"
                      alt="Claimed Trophy"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    <span className="font-bold">Claimed</span>
                  </a>
                </div>
              ) : (
                <div className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white px-4 py-2 rounded-2xl shadow-lg transform transition-all duration-300 mt-4 flex items-center justify-center font-bold text-base">
                  <a href="#" className="flex items-center justify-center">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lock%203D%20ICON-tSADoa2jMYhydtsWHFQcTlvhAShAK6.png"
                      alt="Locked Trophy"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    <span className="font-bold">Locked</span>
                  </a>
                </div>
              )}
            </CardContent>
          </NeonGradientCard>
        </div>
      ))}
    </div>
  );

  const claimTrophy = (trophy: (typeof trophies)[0]) => {
    if (user.coins >= trophy.requirement && !trophy.claimed) {
      setUser((prevUser) => ({
        ...prevUser,
        coins: prevUser.coins + trophy.prize,
      }));
      trophy.claimed = true;
      showGameAlert(
        `Congratulations! You've claimed ${formatNumber(trophy.prize, true)} coins for the "${trophy.name}" trophy!`
      );
      saveUserData({ ...user, coins: user.coins + trophy.prize });
    }
  };

  const showPopup = (popupType: string) => {
    setActivePopups((prev) => new Set(prev).add(popupType));
  };

  const hidePopup = (popupType: string) => {
    setActivePopups((prev) => {
      const newSet = new Set(prev);
      newSet.delete(popupType);
      return newSet;
    });
  };

  const [gamePopup, setGamePopup] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({ show: false, message: '', onConfirm: () => {} });

  const showGameAlert = (message: string) => {
    setGamePopup({
      show: true,
      message,
      onConfirm: () => setGamePopup({ show: false, message: '', onConfirm: () => {} }),
    });
  };

  const showGameConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    setGamePopup({
      show: true,
      message,
      onConfirm: () => {
        setGamePopup({ show: false, message: '', onConfirm: () => {} });
        callback(true);
      },
      onCancel: () => {
        setGamePopup({ show: false, message: '', onConfirm: () => {} });
        callback(false);
      },
    });
  };

  const resetBoosterCredits = useCallback(() => {
    const now = new Date();
    const lastReset = new Date(user.lastBoosterReset || 0);
    if (
      now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      setUser((prevUser) => ({
        ...prevUser,
        boosterCredits: 3,
        lastBoosterReset: now.toISOString(),
      }));
    }
  }, [user.lastBoosterReset]);

  useEffect(() => {
    resetBoosterCredits();
  }, [resetBoosterCredits]);

  useEffect(() => {
    const audio = new Audio(
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Riches%20in%20the%20Shadows-8jIfTBhDiLVL55LWoh4M55lq2PNpf9.MP3'
    );
    audio.preload = 'auto';
    audio.load();
    setSettings((prev) => ({ ...prev, backgroundMusicAudio: audio }));

    return () => {
      if (settings.backgroundMusicAudio) {
        settings.backgroundMusicAudio.pause();
        settings.backgroundMusicAudio.currentTime = 0;
      }
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/game-data');
      if (!response.ok) {
        throw new Error('Failed to fetch game data');
      }
      const data = await response.json();
      setUser(data.user);
      setShopItems(data.shopItems);
      setPremiumShopItems(data.premiumShopItems);
      setTasks(data.tasks);
      // Update other state variables as needed
    } catch (error) {
      console.error('Error fetching game data:', error);
      showGameAlert('Failed to load game data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div className="absolute inset-0 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 border-r-4 border-l-4 border-purple-500 rounded-full animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-Jx43bOKm7s99NARIa6gjgHp3gQ7RP1.png"
                  alt="Game Logo"
                  width={200}
                  height={200}
                  className="animate-pulse"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 animate-pulse">Loading...</h2>
        </div>
      </div>
    );
  }

  const Popup = ({
    title,
    children,
    onClose,
  }: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 flex items-center justify-center z-[60]">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-lg" onClick={onClose}></div>
      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 text-white p-8 rounded-3xl shadow-2xl z-10 max-w-md w-full mx-4 border border-gray-700/30 backdrop-blur-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">{title}</h2>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );

  const CongratulationPopup = () => (
    <Popup
      title="Epic Achievement Unlocked!"
      onClose={() => {
        hidePopup('congratulation');
      }}
    >
      <p className="mb-6 text-xl text-center text-white">
        You've acquired the legendary{' '}
        <span className="font-bold text-yellow-400">{congratulationPopup.item?.name}</span>!
      </p>
      <p className="mb-6 text-center text-white">
        This cosmic upgrade will supercharge your crypto earnings and propel you to new heights!
      </p>
      <Button
        onClick={() => {
          hidePopup('congratulation');
        }}
        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-base"
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Achievement%203D%20ICON-uPsT5t3TZ9lrkjkpSqlgwfiFaEKn4K.png"
          alt="Achievement Icon"
          width={34}
          height={34}
          className="w-6 h-6 relative z-10"
        />
        <span className="font-extrabold text-lg relative z-10">Embrace the Power!</span>
      </Button>
    </Popup>
  );

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.openTelegramLink(href);
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <>
      {!isMobile() ? (
        <PCMessage />
      ) : (
        <div
          className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col"
          style={{
            backgroundAttachment: 'fixed',
            width: '100%',
            height: '100vh',
            minHeight: '-webkit-fill-available',
            overflowY: 'auto',
            overflowX: 'hidden',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            userSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            KhtmlUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <style>{styles}</style>
          <div className="fixed inset-0 z-0 overflow-hidden">
            <StarryBackground />
          </div>
          {renderHeader()}
          <div
            className="flex-grow pb-20"
            style={{
              paddingBottom: 'calc(5rem + env(safe-area-inset-bottom) + 16px)',
              marginBottom: '16px',
            }}
          >
            {currentPage === 'home' && renderHome()}
            {currentPage === 'shop' && renderShop()}
            {currentPage === 'tasks' && renderTasks()}
            {currentPage === 'ranking' && renderRanking()}
            {currentPage === 'wallet' && renderWallet()}
            {currentPage === 'invite' && renderInvite()}
            {currentPage === 'friendsActivity' && renderFriendsActivity()}
            {currentPage === 'levels' && renderLevels()}
            {currentPage === 'settings' && renderSettings()}
            {currentPage === 'dailyReward' && renderDailyReward()}
            {currentPage === 'trophies' && renderTrophies()}
          </div>
          {renderbottom()}

          {/* Popup logic */}
          {activePopups.has('pph') && (
            <Popup
              title="Earned"
              onClose={() => {
                hidePopup('pph');
                claimPPH();
              }}
            >
              <p className="mb-2 text-xl text-center text-white">While you were away, you earned</p>
              <p className="mb-5 text-sm text-center text-white">
                To keep earning, enter the game every 3 hours.
              </p>
              <div className="flex items-center justify-center mb-3">
                <span className="text-4xl font-extrabold text-white">
                  {formatNumber(pphAccumulated, true)}
                </span>
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Crypto%20Coin%203D%20ICON-QksBNLkNX7u1KmxGGnaVV8937NucdL.png"
                  alt="Game Logo"
                  width={40}
                  height={40}
                  className="ml-3"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              <Button
                onClick={() => {
                  claimPPH();
                  hidePopup('pph');
                }}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-base"
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cliam%203D%20ICON-4TAt1mqi8cGSkOxrY2VHngEEFJGyRi.png"
                  alt="Claim Icon"
                  width={34}
                  height={34}
                  className="w-6 h-6 relative z-10"
                />
                <span className="font-extrabold text-lg relative z-10">Claim Now!</span>
              </Button>
            </Popup>
          )}

          {activePopups.has('levelUp') && (
            <Popup
              title="Cosmic Level Up!"
              onClose={() => {
                hidePopup('levelUp');
                claimNewLevel();
              }}
            >
              <p className="mb-6 text-xl text-center text-white">
                Stellar Achievement Unlocked! You've rocketed to{' '}
                <span className="font-bold text-yellow-400">Level {newLevel}</span>!
              </p>
              <p className="mb-6 text-center text-white">
                Your crypto prowess is reaching new galaxies. Prepare for unprecedented powers and
                cosmic riches!
              </p>
              <Button
                onClick={() => {
                  claimNewLevel();
                  hidePopup('levelUp');
                }}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-base"
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Level%20UP%203D%20ICON-xndJfi9xA5hNBn6sWPRX0jk6MDLA4t.png"
                  alt="Level Up Icon"
                  width={34}
                  height={34}
                  className="w-6 h-6 relative z-10"
                />
                <span className="font-extrabold text-lg relative z-10">Level Up</span>
              </Button>
            </Popup>
          )}

          {activePopups.has('congratulation') && <CongratulationPopup />}
          {gamePopup.show && (
            <GamePopup
              message={gamePopup.message}
              onConfirm={gamePopup.onConfirm}
              onCancel={gamePopup.onCancel}
            />
          )}
          {activePopups.has('levelUnlock') && renderLevelUnlockPopup()}
          {clickEffects.map((effect) => (
            <div
              key={effect.id}
              className="click-effect"
              style={{
                left: effect.x,
                top: effect.y,
                color: effect.color,
              }}
            >
              <strong>{effect.text}</strong>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default CryptoGame;
