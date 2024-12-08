'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import TonConnect from '@tonconnect/sdk';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@radix-ui/react-label';
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
} from 'lucide-react';

interface User {
  id: string;
  telegramId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  coins: number;
  level: number;
  exp: number;
  profilePhoto: string;
  shopItems: any[];
  premiumShopItems: any[];
  tasks: any[];
  dailyReward: {
    lastClaimed: Date | null;
    streak: number;
    day: number;
    completed: boolean;
  };
  unlockedLevels: number[];
  clickPower: number;
  friendsCoins: { [key: string]: number };
  energy: number;
  pphAccumulated: number;
  multiplier: number;
  multiplierEndTime: Date | null;
  boosterCooldown: Date | null;
  selectedCoinImage: string;
  settings: {
    vibration: boolean;
    backgroundMusic: boolean;
    soundEffect: boolean;
  };
  profitPerHour: number;
}

interface CryptoGameProps {
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
  saveUserData: (userData: Partial<User>) => Promise<void>;
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
  level: number;
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

interface LeaderboardEntry {
  id: string;
  name: string;
  coins: number;
  rank: number;
}

interface UserData extends Omit<User, 'dailyReward'> {
  dailyReward: {
    lastClaimed: Date | null;
    streak: number;
    day: number;
    completed: boolean;
  };
}

// Keyframe animation
const styles = `
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
  .coin-button:active {
    animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
  }
  .coin-button {
    transform-origin: center center;
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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: { x: number; y: number; radius: number; speed: number }[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3.5,
        speed: Math.random() * 0.5,
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();

      stars.forEach((star) => {
        ctx.moveTo(star.x, star.y);
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
        }
      });

      ctx.fill();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
    className={`relative overflow-hidden rounded-lg bg-black/30 backdrop-blur-md text-white ${className}`}
    {...props}
  >
    <div className="absolute inset-0 bg-black/30 backdrop-blur-md rounded-lg"></div>
    <div className="relative z-10 p-6 rounded-lg">{children}</div>
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
  const playHeaderFooterSound = () => {
    const audio = new Audio(
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/All%20Button%20Sound-NecLnCIFTmsT5rZXNgDaGNLmKdTxNO.mp3'
    );
    return audio.play();
  };

  return (
    <div>
      <Button
        variant="ghost"
        className={`relative w-16 h-16 bg-transparent flex flex-col items-center justify-center ${isActive ? 'bg-gradient-to-t from-primary/20 to-transparent' : ''} bg-black/30 backdrop-blur-md text-white hover:bg-gray-800/50 transition-all duration-300 hover:text-white active:text-white`}
        onClick={() => {
          setCurrentPage(href);
          playHeaderFooterSound();
        }}
      >
        <Icon className={`w-8 h-8 mb-1 ${isActive ? 'text-primary' : 'text-white'}`} />
        <span
          className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'} group-hover:text-white`}
        >
          {text}
        </span>
        {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
      </Button>
    </div>
  );
};

const levelRequirements = [
  0, 5000, 50000, 100000, 500000, 800000, 1000000, 5000000, 8000000, 10000000,
];

const levelImages = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Broke%20Cheetah-pZJ2aUjvx5OQNVKP5jfNIBh9qDFVSd.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mr%20Cheetah-zNboNDDvI5meIrZuD8OlOqfuow4BK9.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sparrow%20Cheetah-na8Hpm3FsqQZv4JctkPOprLDTeCXXs.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Vikings%20Cheetah-5V5mUP17Likg5b0uc9Dkn8fs5AxJS2.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Samurai%20Cheetah-XIq9QRNfGqMQO8JSM2BuW4DkUFQLWa.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Alien%20Cheetah-EgVPsC1VYxIS56kCfN9XBkxVxoPV26.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Robot%20Cheetah-QMuyW27ybeXMN7gfkL0GKS2DjGNV6r.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Space%20Cheetah-DQa6FGcwSeKYKxLqU7NZrkxUspXxGN.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pop%20Star%20Cheetah-B1MP0HSxg4Ej38rDjJIGMR7w9auwxf.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Super%20Hero%20Cheetah-Ja0KaW8LPfG0wBkpPGktH0h027wmWq.png',
];

const trophies = [
  {
    name: 'Crypto Novice',
    description: 'First steps into the digital realm',
    requirement: 10000,
    prize: 1000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1T-nUWKYBAKLuUbRUCtQ4Pe6bKVvuayqD.png',
  },
  {
    name: 'Blockchain Pioneer',
    description: 'Exploring the foundations of crypto',
    requirement: 50000,
    prize: 5000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2T-qkckZRo7F2pFbjOXFUsmZW1aVDaKkX.png',
  },
  {
    name: 'DeFi Explorer',
    description: 'Venturing into decentralized finance',
    requirement: 100000,
    prize: 10000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3T-S4ZJ26mqOyNGPIIBKrLLwkozCZFPru.png',
  },
  {
    name: 'NFT Collector',
    description: 'Embracing the world of digital art',
    requirement: 250000,
    prize: 25000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4T-8R9RicTTe3vC5WD0wWAY7OCNaF1vxx.png',
  },
  {
    name: 'Hodl Master',
    description: 'Showing true diamond hands',
    requirement: 500000,
    prize: 50000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5T-QEssxxIveH9hiQ0nJcZZrmdJJguJbF.png',
  },
  {
    name: 'Altcoin Adventurer',
    description: 'Diversifying beyond Bitcoin',
    requirement: 1000000,
    prize: 100000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6T-fnsT0zSHQjez6E6KHO3AjIwflnyT1P.png',
  },
  {
    name: 'Smart Contract Sage',
    description: 'Mastering the art of crypto automation',
    requirement: 2500000,
    prize: 250000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7T-2DEkkrvJaawGC1O7GADjiHOn8RQfia.png',
  },
  {
    name: 'Crypto Whale',
    description: 'Making waves in the digital ocean',
    requirement: 5000000,
    prize: 500000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8T-i7iib3r4xoqtY9qYHdrOOgiUflPOCu.png',
  },
  {
    name: 'Metaverse Mogul',
    description: 'Conquering virtual worlds',
    requirement: 7500000,
    prize: 750000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9T-FOz1XZIhMkDitSvZsKOFXfYkP6QdQt.png',
  },
  {
    name: 'Crypto Legend',
    description: 'Achieving legendary status in the crypto world',
    requirement: 10000000,
    prize: 1000000,
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-m1ABpvscvGrraWnHOclc7sLK531TqB.png',
  },
];

const formatNumber = (num: number) => {
  if (num >= 1e18) return (num / 1e18).toFixed(2) + 'Q';
  if (num >= 1e15) return (num / 1e15).toFixed(2) + 'P';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'k';
  return num.toFixed(2);
};

const playCoinSound = () => {
  const audio = new Audio(
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coin%20Button%20Sound-vLxAEYrnFJ4W4ZNzInbVnZpsMhwZLa.mp3'
  );
  audio.play();
};

const playHeaderFooterSound = () => {
  const audio = new Audio(
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/All%20Button%20Sound-NecLnCIFTmsT5rZXNgDaGNLmKdTxNO.mp3'
  );
  return audio.play();
};

const CryptoGame: React.FC<CryptoGameProps> = ({ userData, onCoinsUpdate, saveUserData }) => {
  const [user, setUser] = useState<User>(
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
      energy: 500,
      pphAccumulated: 0,
      multiplier: 1,
      multiplierEndTime: null,
      boosterCooldown: null,
      selectedCoinImage: levelImages[0],
      settings: {
        vibration: true,
        backgroundMusic: false,
        soundEffect: true,
      },
      profitPerHour: 0,
    }
  );

  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [wallet, setWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [clickPower, setClickPower] = useState(1);
  const [profitPerHour, setProfitPerHour] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  const [energy, setEnergy] = useState(500);
  const [maxEnergy] = useState(500);
  const energyRef = useRef<HTMLDivElement>(null);
  const [pphAccumulated, setPphAccumulated] = useState(0);
  const [showPPHPopup, setShowPPHPopup] = useState(false);
  const [settings, setSettings] = useState({
    vibration: true,
    backgroundMusic: false,
    soundEffect: true,
    backgroundMusicAudio:
      typeof Audio !== 'undefined'
        ? new Audio(
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Riches%20in%20the%20Shadows-8jIfTBhDiLVL55LWoh4M55lq2PNpf9.MP3'
          )
        : null,
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
    { id: number; x: number; y: number; value: number }[]
  >([]);
  const [popupShown, setPopupShown] = useState({
    pph: false,
    levelUp: false,
    congratulation: false,
  });
  const [shownPopups, setShownPopups] = useState<Set<string>>(new Set());
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    {
      id: 1,
      name: 'Cosmic Shipyard',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cosmic%20Shipyard.jpg-g0folteuEnRzE2ke1wVnCVMyxpoRC2.jpeg',
      basePrice: 500,
      baseProfit: 50,
      level: 1,
    },
    {
      id: 2,
      name: 'Galactic WarpCrafts',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Galactic%20WarpCrafts.jpg-Ebh93DdGRcffZMhpLKm5dOqpN7c7Y4.jpeg',
      basePrice: 1000,
      baseProfit: 100,
      level: 1,
    },
    {
      id: 3,
      name: 'Galaxy Gear Crypto',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Galaxy%20Gear%20Crypto.jpg-FE1Ait4Pr0hgjoQXxY4aACXxtHrSIa.jpeg',
      basePrice: 2000,
      baseProfit: 500,
      level: 1,
    },
    {
      id: 4,
      name: 'RocketCoin Speedway',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RocketCoin%20Speedway.jpg-C7c29Ra1Lo9GWgsb5knfynlR1c4e4h.jpeg',
      basePrice: 4000,
      baseProfit: 1000,
      level: 1,
    },
    {
      id: 5,
      name: 'Stellar Speed Vault',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Stellar%20Speed%20Vault.jpg-vQAbuozzA2Bh7op7dd2Xw6hl2wmMwh.jpeg',
      basePrice: 8000,
      baseProfit: 2000,
      level: 1,
    },
    {
      id: 6,
      name: 'Speedy Coin Shop',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Speedy%20Coin%20Shop-4Pjy8KKoF4mPmJqSCKaeBmVjjOeDmG.jpg',
      basePrice: 15000,
      baseProfit: 4000,
      level: 1,
    },
    {
      id: 7,
      name: 'SpaceXcelerate Crypto',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SpaceXcelerate%20Crypto-tRNfj0y3wKPzkeompo47K0INGZ8RzP.jpg',
      basePrice: 35000,
      baseProfit: 8000,
      level: 1,
    },
    {
      id: 8,
      name: 'Lunar Cruiser Exchange',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lunar%20Cruiser%20Exchange-l3lp6JnCc43BWBNbDAmfoTDRfgVIPr.jpg',
      basePrice: 50000,
      baseProfit: 12000,
      level: 1,
    },
    {
      id: 9,
      name: 'Hyperdrive Coin Garage',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hyperdrive%20Coin%20Garage-p3lGkiS6WCbCuwUBxy75HFwCkRjbJU.jpg',
      basePrice: 70000,
      baseProfit: 35000,
      level: 1,
    },
    {
      id: 10,
      name: 'MoonShip Hangar',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MoonShip%20Hangar-A3Pne3hTeraZk7TTZDnekdMmnVytf3.jpg',
      basePrice: 100000,
      baseProfit: 50000,
      level: 1,
    },
  ]);

  const [premiumShopItems, setPremiumShopItems] = useState<PremiumShopItem[]>([
    {
      id: 6,
      name: 'Cheetah Coin Corner',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cheetah%20Coin%20Corner.jpg-xLd8l1UKa8tR7HU4JcT7lcmwi2e8sa.jpeg',
      basePrice: 7000,
      effect: 'Doubles coin button taps',
      level: 1,
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Facebook%20icon-6GoJtap21nyoiQnYLSpB6IJtMTN02p.png"
          alt="Facebook"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/X%203D%20icon-BKGCBNiG3sECcTXzWnsCIQKt2C7s2q.png"
          alt="X"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Instagram%203D%20icon-oGuCqwnySi2zDrS8HlS44YDNgGaCuH.png"
          alt="Instagram"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Youtube%203D%20icon-6rol1Ge421KShZTlo6utbgTE8fsxm8.png"
          alt="YouTube"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Youtube%203D%20icon-6rol1Ge421KShZTlo6utbgTE8fsxm8.png"
          alt="YouTube"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Telegram%203D%20icon-0mE8I8odV0mcJBqfO91vdaj6mxrgGS.png"
          alt="Telegram"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Invite%203D%20icon-2VG1B7pHqsL5VeIjvBp0me4DZXRIKg.png"
          alt="Invite Friends"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FIRE%203D%20ICON-2WjFYZbZ4SZ1BggDxdY0b4Zqxkk3lA.png"
          alt="Reach Level 10"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Trophy%20Task%203D%20icon-TiL6cVCcwg5sxAGaMTNfFUmCFypzv1.png"
          alt="Trophy's Level"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/X%203D%20icon-BKGCBNiG3sECcTXzWnsCIQKt2C7s2q.png"
          alt="X"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Instagram%203D%20icon-oGuCqwnySi2zDrS8HlS44YDNgGaCuH.png"
          alt="Instagram"
          width={48}
          height={48}
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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Whatsapp%203D%20icon-zQ7YPZyXLWhIzlUUDOv03O3EE8qWSI.png"
          alt="WhatsApp"
          width={48}
          height={48}
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
              coins: prevUser.coins + 1000,
            }));
            saveUserData({ ...user, coins: user.coins + 1000 });
            window.Telegram.WebApp.showAlert('You earned 1000 coins for inviting a friend!');
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to process invitation');
          }
        } catch (error) {
          console.error('Error inviting friend:', error);
          window.Telegram.WebApp.showAlert('Failed to process invitation. Please try again.');
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
    (event: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      const getCoordinates = (
        e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>
      ): { x: number; y: number } => {
        if ('clientX' in e) {
          return { x: e.clientX, y: e.clientY };
        } else if (e.touches && e.touches.length > 0) {
          return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: 0, y: 0 };
      };

      const { x, y } = getCoordinates(event);

      if (energy > 0) {
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

        // Visual number show with animation
        const numberShow = document.createElement('div');
        numberShow.textContent = `+${formatNumber(clickValue)}`;
        numberShow.style.position = 'absolute';
        numberShow.style.left = `${x}px`;
        numberShow.style.top = `${y}px`;
        numberShow.style.color = 'white';
        numberShow.style.fontSize = '24px';
        numberShow.style.fontWeight = 'bold';
        numberShow.style.pointerEvents = 'none';
        numberShow.style.zIndex = '9999';
        numberShow.style.textShadow = '0 0 10px #ffffff,  0 0 20px #ffffff, 0 0 30px #ffffff';
        document.body.appendChild(numberShow);

        numberShow.animate(
          [
            { opacity: 1, transform: 'translateY(0) scale(1)' },
            { opacity: 0, transform: 'translateY(-50px) scale(1.5)' },
          ],
          {
            duration: 1000,
            easing: 'ease-out',
          }
        ).onfinish = () => document.body.removeChild(numberShow);

        setEnergy((prev) => Math.max(prev - 1, 0));

        // Trigger haptic feedback
        if (
          settings.vibration &&
          window.Telegram &&
          window.Telegram.WebApp &&
          window.Telegram.WebApp.HapticFeedback
        ) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        // Play sound effect
        if (settings.soundEffect) {
          playCoinSound();
        }

        // Send tap data to Telegram Mini App
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.sendData(
            JSON.stringify({ action: 'tap', amount: clickPower * multiplier })
          );
        }
      }
    },
    [clickPower, multiplier, energy, settings.vibration, settings.soundEffect, saveUserData, user]
  );

  const buyItem = useCallback(
    async (item: ShopItem | PremiumShopItem, isPremium = false) => {
      const price = isPremium
        ? item.basePrice * Math.pow(5, item.level - 1)
        : item.basePrice * Math.pow(2, item.level - 1);
      if (user.coins >= price) {
        try {
          const response = await fetch('/api/shop', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramId: user.telegramId,
              itemId: item.id,
              isPremium,
              price,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            const updatedUser = {
              ...user,
              coins: result.updatedCoins,
            };
            setUser(updatedUser);
            saveUserData(updatedUser);

            if (isPremium) {
              setPremiumShopItems((prevItems) =>
                prevItems.map((i) => (i.id === item.id ? result.updatedItem : i))
              );
              setClickPower((prev) => prev * 2);
            } else {
              setShopItems((prevItems) =>
                prevItems.map((i) => {
                  if (i.id === item.id) {
                    const newProfit = result.updatedItem.baseProfit * result.updatedItem.level;
                    setProfitPerHour((prev) => prev + newProfit - i.baseProfit * i.level);
                    return result.updatedItem;
                  }
                  return i;
                })
              );
            }

            if (!popupShown.congratulation) {
              setCongratulationPopup({ show: true, item: result.updatedItem });
              setPopupShown((prev) => ({ ...prev, congratulation: true }));
            }

            // Send purchase data to Telegram Mini App
            if (window.Telegram && window.Telegram.WebApp) {
              window.Telegram.WebApp.sendData(
                JSON.stringify({ action: 'purchase', item: item.name, cost: price, isPremium })
              );
            }

            // Show success message
            if (window.Telegram && window.Telegram.WebApp) {
              window.Telegram.WebApp.showAlert(`Successfully purchased ${item.name}!`);
            } else {
              alert(`Successfully purchased ${item.name}!`);
            }
          } else {
            throw new Error('Failed to purchase item');
          }
        } catch (error) {
          console.error('Error purchasing item:', error);
          if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert('Failed to purchase item. Please try again.');
          } else {
            alert('Failed to purchase item. Please try again.');
          }
        }
      } else {
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.showAlert('Not enough coins!');
        } else {
          alert('Not enough coins!');
        }
      }
    },
    [user, saveUserData]
  );

  const connectWallet = async () => {
    try {
      const manifestUrl = 'https://babycheetah.vercel.app/tonconnect-manifest.json';
      const tonConnect = new TonConnect({ manifestUrl });

      const walletConnectionSource = {
        jsBridgeKey: 'tonkeeper',
      };

      await tonConnect.connect(walletConnectionSource);

      const walletInfo = await tonConnect.getWallets();
      if (walletInfo && walletInfo.length > 0) {
        const firstWallet = walletInfo[0];
        if ('address' in firstWallet) {
          return firstWallet.address as string;
        } else {
          throw new Error('Failed to get wallet address');
        }
      } else {
        throw new Error('No wallets available');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const App: React.FC = () => {
    const [wallet, setWallet] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConnectWallet = useCallback(async () => {
      try {
        setIsLoading(true);
        const address = await connectWallet();
        setWallet(address);
        window.Telegram.WebApp.showAlert('Wallet connected successfully with Tonkeeper!');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        window.Telegram.WebApp.showAlert('Failed to connect wallet. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, []);

    return (
      <div>
        <h1>Tonkeeper</h1>
        <button onClick={handleConnectWallet} disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {wallet && <p>Connected Wallet: {wallet}</p>}
        {/* Display user data */}
        {user && (
          <div>
            <p>User ID: {user.telegramId}</p>
            <p>Username: {user.username}</p>
            <p>Name: {user.username}</p>
            <p>Coins: {user.coins}</p>
          </div>
        )}
      </div>
    );
  };

  const claimPPH = useCallback(() => {
    if (pphAccumulated > 0) {
      const updatedUser = {
        ...user,
        coins: user.coins + pphAccumulated,
      };
      setUser(updatedUser);
      saveUserData(updatedUser);
      setPphAccumulated(0);
      setShowPPHPopup(false);
      window.Telegram.WebApp.showAlert(`Claimed ${formatNumber(pphAccumulated)} coins!`);

      window.Telegram.WebApp.sendData(JSON.stringify({ action: 'claim', amount: pphAccumulated }));
    } else {
      window.Telegram.WebApp.showAlert('No profits to claim yet!');
    }
  }, [pphAccumulated, user, saveUserData]);

  const claimNewLevel = useCallback(() => {
    window.Telegram.WebApp.showAlert(`Congratulations! You've advanced to Level ${newLevel}!`);
    setUser((prevUser) => ({
      ...prevUser,
      level: newLevel,
    }));
    setUnlockedLevels((prev) => [...new Set([...prev, newLevel])]);
    setShowLevelUpPopup(false);
    setPopupShown((prev) => ({ ...prev, levelUp: true }));
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
        lastClaimed && now.getDate() - lastClaimed.getDate() === 1 ? dailyReward.streak + 1 : 1;
      const reward = getDailyReward(newStreak);

      setUser((prevUser) => ({
        ...prevUser,
        coins: prevUser.coins + reward,
      }));

      const newDay = (dailyReward.day % 30) + 1;
      const completed = newDay === 1;

      setDailyReward({
        lastClaimed: now.toISOString(),
        streak: newStreak,
        day: newDay,
        completed: completed,
      });

      window.Telegram.WebApp.showAlert(
        `Claimed daily reward: ${formatNumber(reward)} coins! Streak: ${newStreak} days`
      );
    } else if (dailyReward.completed) {
      window.Telegram.WebApp.showAlert('You have completed the 30-day reward cycle!');
    } else {
      window.Telegram.WebApp.showAlert('You have already claimed your daily reward today!');
    }
  }, [dailyReward, user, saveUserData]);

  const getDailyReward = (day: number) => {
    const rewards = [
      100, 250, 350, 450, 550, 650, 750, 850, 1000, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 10000,
      20000, 30000, 40000, 50000, 60000, 70000, 80000, 100000, 300000, 600000, 700000, 800000,
      1000000, 2000000,
    ];
    return rewards[day % rewards.length];
  };

  const activateMultiplier = useCallback(() => {
    if (!multiplierEndTime && !boosterCooldown) {
      setMultiplier(2);
      const endTime = Date.now() + 1 * 60 * 1000;
      setMultiplierEndTime(endTime);
      window.Telegram.WebApp.showAlert(`Activated 2x multiplier for 1 minutes!`);

      const cooldownTimer = setTimeout(
        () => {
          setMultiplier(1);
          setMultiplierEndTime(null);
          setBoosterCooldown(Date.now() + 100 * 60 * 1000);
          const unlockTimer = setTimeout(
            () => {
              setBoosterCooldown(null);
            },
            100 * 60 * 1000
          );
          return () => clearTimeout(unlockTimer);
        },
        1 * 60 * 1000
      );

      return () => clearTimeout(cooldownTimer);
    } else if (boosterCooldown) {
      const remainingCooldown = Math.ceil((boosterCooldown - Date.now()) / 1000);
      window.Telegram.WebApp.showAlert(
        `Booster on cooldown. Available in ${remainingCooldown} seconds.`
      );
    } else if (multiplierEndTime) {
      const remainingMultiplier = Math.ceil((multiplierEndTime - Date.now()) / 1000);
      window.Telegram.WebApp.showAlert(
        `Multiplier active for ${remainingMultiplier} more seconds.`
      );
    }
  }, [multiplierEndTime, boosterCooldown, user.id]);

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
      window.Telegram.WebApp.showAlert('Copy and paste the message to your Instagram post!');
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
    const referralLink = `https://t.me/BabyCheetah_Bot/?start=${user.telegramId}`;
    window.Telegram.WebApp.showConfirm(
      `Share your referral link: ${referralLink}`,
      (confirmed: boolean) => {
        if (confirmed) {
          navigator.clipboard.writeText(referralLink);
          window.Telegram.WebApp.showAlert('Referral link copied to clipboard!');
        }
      }
    );
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

  type LeaderboardEntry = {
    id: string;
    telegramId: string;
    name: string;
    username: true;
    coins: number;
    profitPerHour: number;
    rank: number;
  };

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
      } catch (error) {
        console.error('Error fetching user data:', error);
        window.Telegram.WebApp.showAlert('Failed to load game data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, []);

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

    const saveUserData = useCallback(async (updatedUser: UserData) => {
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

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.showAlert('Failed to load game data. Please try again.');
        } else {
          alert('Failed to load game data. Please try again.');
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
  // Energy regeneration and profit accumulation
  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy((prevEnergy) => {
        const newEnergy = Math.min(prevEnergy + 0.1, maxEnergy);
        if (energyRef.current) {
          energyRef.current.style.width = `${(newEnergy / maxEnergy) * 100}%`;
        }
        return newEnergy;
      });
      setPphAccumulated((prev) => prev + profitPerHour / 3600);
    }, 1000);
    return () => clearInterval(timer);
  }, [maxEnergy, profitPerHour]);

  // Show PPH popup
  useEffect(() => {
    if (!popupShown.pph && pphAccumulated > 0) {
      setShowPPHPopup(true);
      setPopupShown((prev) => ({ ...prev, pph: true }));
    }
  }, [pphAccumulated, popupShown.pph]);

  // Level up and task progress
  useEffect(() => {
    if (!popupShown.levelUp && level > user.level) {
      setNewLevel(level);
      setShowLevelUpPopup(true);
      setPopupShown((prev) => ({ ...prev, levelUp: true }));
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
  }, [level, user.level, popupShown.levelUp]);

  const renderHeader = () => (
    <div className="sticky top-0 z-10 bg-black/30 backdrop-blur-md p-2 rounded-full">
      <Card className="bg-transparent border-0 overflow-hidden">
        <CardContent className="p-2 flex items-center justify-between relative flex-wrap">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center transform rotate-12 shadow-lg overflow-hidden">
              <Image
                src={user.profilePhoto}
                alt={user.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">
                {`${user.firstName || ''} ${user.lastName || ''}`.trim().slice(0, 9) + '...'}
              </h2>
              <div className="text-xs text-white flex items-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-Jx43bOKm7s99NARIa6gjgHp3gQ7RP1.png"
                  alt="Coin"
                  width={16}
                  height={16}
                  className="mr-1"
                />
                {formatNumber(user.coins)} coins
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="bg-transparent backdrop-filter backdrop-blur-sm text-white p-1 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0"
              onClick={() => {
                setCurrentPage('trophies');
                playHeaderFooterSound();
              }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TROPHY%203D%20ICON-r7DrilofLzG7BdFZtgONM1tDZHT5aO.png"
                alt="Trophies"
                width={28}
                height={28}
              />
            </Button>
            <Button
              variant="ghost"
              className="bg-transparent backdrop-filter backdrop-blur-sm text-white p-1 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0"
              onClick={() => {
                setCurrentPage('levels');
                playHeaderFooterSound();
              }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LEVEL%203D%20ICON-0VzQFGvjHWkPoGl5HmoDJ4edD4ZztE.png"
                alt="Levels"
                width={28}
                height={28}
              />
            </Button>
            <Button
              variant="ghost"
              className="bg-transparent backdrop-filter backdrop-blur-sm text-white p-1 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0"
              onClick={() => {
                setCurrentPage('settings');
                playHeaderFooterSound();
              }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SETTING%203D%20ICON-Zln2aXS4iPIxlZfmYO42iPAKAwEtKt.png"
                alt="Settings"
                width={28}
                height={28}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md p-2 rounded-t-3xl z-50">
      <div className="flex justify-around items-center max-w-md mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-full blur-xl"></div>
        {[
          {
            page: 'home',
            text: 'Home',
            icon: 'HOME%203D%20ICON-l0PT1uIGWdh36mELTwJwL4iX9QOqwY.png',
          },
          {
            page: 'shop',
            text: 'Shop',
            icon: 'SHOP%203D%20ICON-8W5KCBOOeijJzAMwkJlM3AvlopMlor.png',
          },
          {
            page: 'tasks',
            text: 'Tasks',
            icon: 'TASKS%203D%20ICON-xYtBLApGw0DH6Z96oMKZEnNZJu5KvW.png',
          },
          {
            page: 'rating',
            text: 'Rating',
            icon: 'RATING%203D%20ICON-445ZGZSdRbrUUyhr0TpzxlvsnwJNeu.png',
          },
          {
            page: 'wallet',
            text: 'Wallet',
            icon: 'WALLET%203D%20ICON-GQhzZExvdqTlDqxZLcBNZkfiaGpp53.png',
          },
          {
            page: 'invite',
            text: 'Invite',
            icon: 'FRIEND%20INVITE%203D%20ICON-8lQ0eY4dY5Qznxnip4OH8ae53TzlvY.png',
          },
        ].map(({ page, text, icon }) => (
          <CryptoButton
            key={page}
            icon={(props) => (
              <Image
                src={`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/${icon}`}
                alt={text}
                width={32}
                height={32}
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
    <div className="flex-grow flex flex-col items-center justify-center p-4 pb-16 relative">
      <div className="text-center mb-4 w-full max-w-md">
        <div className="flex space-x-2 mb-4 w-full">
          <div className="flex-1 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-2 backdrop-blur-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-white">Level {level}</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{
                  width: `${((user.coins - levelRequirements[level - 1]) / (nextLevelRequirement - levelRequirements[level - 1])) * 100}%`,
                }}
              />
            </div>
            <div className="text-xstext-white flex justify-between">
              <span>{formatNumber(user.coins - levelRequirements[level - 1])}</span>
              <span>{formatNumber(nextLevelRequirement - levelRequirements[level - 1])} coins</span>
            </div>
          </div>
          <div className="flex-none w-16 h-16 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md text-white p-2 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CLOCK%203D%20ICON-BOmbm8gpqO0AMx6vImTMvMohF71biw.png"
              alt="Profit Per Hour"
              width={16}
              height={16}
              className="mb-1"
            />
            <span className="text-xs text-white">{formatNumber(profitPerHour)}/h</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-5xl font-bold text-white">{formatNumber(user.coins)}</h1>
          <div className="w-12 h-12">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Real%20Crypto%20Coin-f2MzxVE8kKpBYtXJ1LdiHOPH8kkXYr.png"
              alt="Crypto Coin"
              width={48}
              height={48}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full mx-auto mb-16">
          <button
            className="w-[350px] h-[350px] rounded-full overflow-hidden shadow-lg z-20 coin-button mb-6 relative"
            onClick={clickCoin}
            onTouchStart={(e) => {
              e.preventDefault();
              clickCoin(e);
            }}
            onTouchEnd={(e) => e.preventDefault()}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Image
                src={selectedCoinImage}
                alt={`Level ${level} Cheetah`}
                width={350}
                height={350}
                objectFit="contain"
                className="relative z-10"
                priority
              />
            </div>
          </button>

          <div className="w-full space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2 text-white">
                <span className="font-semibold">Energy</span>
                <span>
                  {energy.toFixed(1)}/{maxEnergy}
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                  ref={energyRef}
                  style={{
                    width: `${(energy / maxEnergy) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  setCurrentPage('dailyReward');
                  playHeaderFooterSound();
                }}
                className="flex-1 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 backdrop-blur-md bg-black/30 text-white"
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GIFT%203D%20ICON-1N7HahK5oT1NZXElcGOdQiIVEt2fAR.png"
                  alt="Daily Reward"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <span>Daily Reward</span>
              </Button>
              <Button
                onClick={() => {
                  activateMultiplier();
                  playHeaderFooterSound();
                }}
                className={`flex-1 bg-gradient-to-r ${boosterCooldown ? 'from-gray-600 to-gray-700' : 'from-gray-800 to-gray-900'} text-white px-4 py-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 backdrop-blur-md bg-black/30 text-white`}
                disabled={!!multiplierEndTime || !!boosterCooldown}
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BOOST%203D%20ICON-dt9XRoqhHoghg1M8hOR1TJBLFPORVi.png"
                  alt="2x Multiplier"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <span>
                  {boosterCooldown
                    ? `Cooldown (${Math.ceil((boosterCooldown - Date.now()) / 1000)}s)`
                    : multiplierEndTime
                      ? `Active (${Math.ceil((multiplierEndTime - Date.now()) / 1000)}s)`
                      : 'Booster'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {clickEffects.map((effect) => (
          <div
            key={effect.id}
            className="absolute pointer-events-none text-white text-2xl font-bold"
            style={{ left: effect.x, top: effect.y }}
            onAnimationEnd={() => setClickEffects((prev) => prev.filter((e) => e.id !== effect.id))}
          >
            +{formatNumber(effect.value)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="p-6 min-h-screen relative z-0">
      <StarryBackground />
      <div className="max-w-7xl mx-auto">
        <h4 className="text-4xl font-bold mb-8 text-center text-white">Emporium Shop</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {shopItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-md text-white rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-gray-800/50 hover:border-primary/50 group"
            >
              <div className="p-3">
                <h3 className="text-sm font-bold text-center mb-2 group-hover:text-primary transition-colors duration-300">
                  {item.name}
                </h3>
                <div className="relative w-full h-24 mb-2 overflow-hidden rounded-md group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={item.image}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className={`relative z-10 ${!unlockedLevels.includes(index + 1) ? 'group-hover:opacity-80 transition-opacity duration-300' : ''}`}
                  />
                </div>
                <p className="text-xs text-white mb-1">Level: {item.level}</p>
                <p className="text-xs text-white mb-2">
                  Profit: {formatNumber(item.baseProfit * item.level)}/h
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-1 rounded-md text-xs font-bold group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300 flex items-center justify-center"
                  onClick={() => {
                    buyItem(item);
                    playHeaderFooterSound();
                  }}
                >
                  Buy {formatNumber(item.basePrice * Math.pow(2, item.level - 1))}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <h4 className="text-3xl font-bold my-8 text-center text-white">Booster Shop</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {premiumShopItems.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 backdrop-blur-md text-white rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-yellow-500/50 hover:border-yellow-400 group"
            >
              <div className="p-4">
                <h3 className="text-lg font-bold text-center mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                  {item.name}
                </h3>
                <div className="relative w-full h-32 mb-3 overflow-hidden rounded-md group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={item.image}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:opacity-80 transition-opacity duration-300"
                  />
                </div>
                <p className="text-sm text-white mb-1">Level: {item.level}</p>
                <p className="text-sm text-white mb-3">Effect: {item.effect}</p>
                <Button
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 text-white py-2 rounded-md text-sm font-bold group-hover:from-yellow-500 group-hover:to-yellow-700 transition-all duration-300 flex items-center justify-center"
                  onClick={() => {
                    buyItem(item, true);
                    playHeaderFooterSound();
                  }}
                >
                  Upgrade for {formatNumber(item.basePrice * Math.pow(5, item.level - 1))}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
      {tasks.map((task) => (
        <NeonGradientCard
          key={task.id}
          className="bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden transform transition-all duration-300 hover:shadow-2xl text-sm"
        >
          <CardHeader className="relative p-3">
            <CardTitle className="flex items-center justify-between z-10 text-base">
              <span className="flex items-center">
                {task.icon}
                <span className="ml-2 text-white">{task.description}</span>
              </span>
              <span className="text-white font-bold">{formatNumber(task.reward)} coins</span>
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
              <span className="text-white">
                {task.progress}/{task.maxProgress || 1} complete
              </span>
              {task.completed ? (
                task.claimed ? (
                  <Button
                    className="bg-green-600 text-white px-4 py-2 rounded-full text-xs"
                    disabled
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Claimed</span>
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs font-bold transform transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => {
                      setUser((prevUser) => ({
                        ...prevUser,
                        coins: prevUser.coins + task.reward,
                      }));
                      setTasks((prevTasks) =>
                        prevTasks.map((t) => (t.id === task.id ? { ...t, claimed: true } : t))
                      );
                      window.Telegram.WebApp.showAlert(`Claimed ${task.reward} coins!`);
                    }}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    <span>Claim</span>
                  </Button>
                )
              ) : (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-xs font-bold transform transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-cyan-700"
                  onClick={() => {
                    task.action();
                    playHeaderFooterSound();
                  }}
                >
                  <ArrowRight className=" w-4 h-4 mr-1" />
                  <span>Start</span>
                </Button>
              )}
            </div>
          </CardContent>
        </NeonGradientCard>
      ))}
    </div>
  );

  const renderRating = () => {
    return (
      <div className="flex flex-col items-center justify-start p-6 min-h-screen">
        <div className="w-full max-w-2xl bg-gray-900/50 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-800">
          {leaderboardData.slice(0, 200).map((player, index) => (
            <div
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
                  <h3 className="font-bold text-white">{player.name}</h3>
                  <p className="text-sm text-white">{formatNumber(player.coins)} coins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">Profit/h</p>
                <p className="font-bold text-white">{formatNumber(player.profitPerHour)}</p>
              </div>
            </div>
          ))}
        </div>
        {currentUserRank > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-primary/30 to-primary-foreground/30 rounded-lg shadow-lg backdrop-blur-md">
            <p className="text-white text-xl">
              Your current rank: <span className="font-bold text-white">{currentUserRank}</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderWallet = () => (
    <div className="flex-grow flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <NeonGradientCard className="bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="relative">
            <CardTitle className="z-10 text-2xl flex items-center justify-between">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Airdrop Soon!
              </span>
              <div className="relative">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Airdrop%203D%20icon-qTW5KRopM7teMBA6gpKYTnjNQ8mnTw.png"
                  alt="Airdrop"
                  width={128}
                  height={128}
                  className="relative z-10"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full filter blur-md animate-pulse"></div>
              </div>
            </CardTitle>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform -skew-y-3"></div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="ml-2">Connecting...</span>
              </div>
            ) : !wallet ? (
              <Button
                onClick={() => {
                  connectWallet()
                    .then((address) => {
                      setWallet(address);
                      window.Telegram.WebApp.showAlert(
                        'Wallet connected successfully with Tonkeeper!'
                      );
                    })
                    .catch((error) => {
                      console.error('Failed to connect wallet:', error);
                      window.Telegram.WebApp.showAlert(
                        'Failed to connect wallet. Please try again.'
                      );
                    });
                  playHeaderFooterSound();
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl text-lg font-bold transform transition-all duration-200 hover:scale-105 hover:from-purple-700 hover:to-pink-700 backdrop-blur-md flex items-center justify-center"
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tonkeeper%20icon-aZ7pPSOt0fj9plFTg3WJKeufQ6dM6c.png"
                  alt="Tonkeeper"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <span className="text-base">Connect Tonkeeper</span>
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                  <span className="text-green-400 flex items-center text-lg">
                    <CheckCircle className="mr-2 w-6 h-6" /> Connected
                  </span>
                  <span className="text-xs bg-gray-700 px-3 py-1 rounded-full text-white">
                    {wallet.slice(0, 6)}...{wallet.slice(-4)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </NeonGradientCard>
      </div>
    </div>
  );

  const renderLevels = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4">
      {levelImages.map((image, index) => (
        <div key={index}>
          <NeonGradientCard
            className={`bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden transform transition-all duration-300 hover:shadow-2xl ${unlockedLevels.includes(index + 1) ? 'border-2 border-primary' : ''}`}
          >
            <CardHeader className="relative p-2">
              <CardTitle className="z-10 text-center text-xs text-white">
                Level {index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-2">
              <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg mb-2 coin-button">
                <Image
                  src={image}
                  alt={`Level ${index + 1}`}
                  layout="fill"
                  objectFit="contain"
                  className={`relative z-10 ${!unlockedLevels.includes(index + 1) ? 'opacity-50 grayscale' : ''}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-level-YQMxTHGDxhTgRoTxhFxSRZxNxNxNxN.png';
                  }}
                />
              </div>
              <p className="text-xs text-center text-white mb-2">
                {unlockedLevels.includes(index + 1)
                  ? 'Unlocked'
                  : `Unlock at ${formatNumber(levelRequirements[index])} coins`}
              </p>
              {unlockedLevels.includes(index + 1) && (
                <Button
                  onClick={() => {
                    setSelectedCoinImage(image);
                    setCurrentPage('home');
                    playHeaderFooterSound();
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-xs py-1 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0"
                >
                  Use
                </Button>
              )}
            </CardContent>
          </NeonGradientCard>
        </div>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="flex-grow flex items-center justify-center p-6">
      <NeonGradientCard className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white w-full max-w-md overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative">
          <CardTitle className="z-10 text-2xl text-white">Settings</CardTitle>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform -skew-y-3"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { id: 'vibration', icon: Vibrate, label: 'Vibration' },
            { id: 'backgroundMusic', icon: Music, label: 'Background Music' },
            { id: 'soundEffect', icon: Volume2, label: 'Sound Effect' },
          ].map(({ id, icon: Icon, label }) => (
            <div key={id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5 text-primary" />
                <Label htmlFor={id} className="text-white text-sm">
                  {label}
                </Label>
              </div>
              <div
                className={`w-12 h-6 flex items-center ${
                  settings[id as keyof typeof settings] ? 'bg-green-400' : 'bg-gray-300'
                } rounded-full p-1 duration-300 ease-in-out cursor-pointer`}
                onClick={() => {
                  setSettings((prev) => {
                    const newSettings = { ...prev, [id]: !prev[id as keyof typeof settings] };
                    if (id === 'vibration' && newSettings.vibration && navigator.vibrate) {
                      navigator.vibrate([
                        100, 30, 100, 30, 100, 30, 200, 30, 200, 30, 200, 30, 100, 30, 100, 30, 100,
                      ]);
                    } else if (id === 'backgroundMusic') {
                      if (newSettings.backgroundMusic && settings.backgroundMusicAudio) {
                        settings.backgroundMusicAudio.play();
                        settings.backgroundMusicAudio.loop = true;
                      } else if (settings.backgroundMusicAudio) {
                        settings.backgroundMusicAudio.pause();
                        settings.backgroundMusicAudio.currentTime = 0;
                      }
                    }
                    return newSettings;
                  });
                }}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                    settings[id as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </NeonGradientCard>
    </div>
  );

  const renderDailyReward = () => (
    <div className="flex-grow flex flex-col items-center justify-center p-6">
      <NeonGradientCard className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative">
          <CardTitle className="z-10 text-3xl text-center text-white">Daily Rewards</CardTitle>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform -skew-y-3"></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1;
              const isCurrentDay = day === dailyReward.day;
              const isPastDay = day < dailyReward.day;
              const reward = getDailyReward(day);

              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center relative overflow-hidden ${
                    isCurrentDay
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900'
                  }`}
                >
                  <span className="text-sm font-bold text-white mb-1">{day}</span>
                  <Gift
                    className={`w-6 h-6 ${
                      isCurrentDay ? 'text-white' : isPastDay ? 'text-white' : 'text-white'
                    }`}
                  />
                  <div className="mt-1 text-xs font-semibold text-white">
                    {formatNumber(reward)}
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
                playHeaderFooterSound();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 backdrop-blur-md text-white"
              disabled={dailyReward.completed}
            >
              <Gift className="w-6 h-6 mr-2" />
              Claim Reward
            </Button>
          </div>
        </CardContent>
      </NeonGradientCard>
    </div>
  );

  const renderInvite = () => (
    <div className="flex-grow flex items-center justify-center p-6">
      <NeonGradientCard className="bg-gradient-to-br fromgray-900 to-black text-white w-full max-w-md overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative">
          <CardTitle className="z-10 text-3xl text-center text-white">Invite Friends</CardTitle>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform -skew-y-3"></div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg backdrop-blur-md">
            <h3 className="text-xl font-bold mb-2 text-center text-white">Your Referral Link</h3>
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2">
              <span className="text-sm text-white truncate mr-2">
                https://t.me/BabyCheetah_Bot?start={user.telegramId}
              </span>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://t.me/BabyCheetah_Bot?start=${user.telegramId}`
                  );
                  window.Telegram.WebApp.showAlert('Referral link copied to clipboard!');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded-full"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-center mt-2 text-white">
              Share this link to earn 1000 coins for each friend whojoins!
            </p>
          </div>
          <Button
            onClick={() => setCurrentPage('friendsActivity')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 rounded-full text-lg font-bold transform transition-all duration-300 hover:scale-105 backdrop-blur-md mt-4 flex items-center justify-center"
          >
            <Users className="w-5 h-5 mr-2" />
            Friends Activity
          </Button>
        </CardContent>
      </NeonGradientCard>
    </div>
  );

  const renderFriendsActivity = () => (
    <div className="flex-grow flex items-center justify-center p-6">
      <NeonGradientCard className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-md overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative">
          <CardTitle className="z-10 text-3xl text-center text-white">Friends Activity</CardTitle>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform -skew-y-3"></div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {invitedFriends.map((friendId) => (
            <div
              key={friendId}
              className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-4 rounded-lg backdrop-blur-md"
            >
              <span className="font-bold text-white">Friend {friendId}</span>
              <span className="text-white">Invited</span>
            </div>
          ))}
          {invitedFriends.length === 0 && (
            <p className="text-center text-white">
              No friends invited yet. Share your referral link to get started!
            </p>
          )}
        </CardContent>
      </NeonGradientCard>
    </div>
  );

  const renderTrophies = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {trophies.map((trophy, index) => (
        <div key={index}>
          <NeonGradientCard
            className={`bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden transform transition-all duration-300 hover:shadow-2xl ${user.coins >= trophy.requirement ? 'border-2 border-primary' : ''}`}
          >
            <CardHeader className="relative">
              <CardTitle className="z-10 text-center text-white">{trophy.name}</CardTitle>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform skew-y-3"></div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
                <Image
                  src={trophy.icon}
                  alt={trophy.name}
                  width={64}
                  height={64}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-trophy-YQMxTHGDxhTgRoTxhFxSRZxNxNxNxN.png';
                  }}
                />
              </div>
              <p className="text-sm text-center text-white">{trophy.description}</p>
              <p className="text-sm text-center text-white mt-2">
                Requirement: {formatNumber(trophy.requirement)} coins
              </p>
              <p className="text-sm text-center text-white">
                Prize: {formatNumber(trophy.prize)} coins
              </p>
              {user.coins >= trophy.requirement ? (
                <Button
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 backdrop-blur-md bg-black/30 text-white mt-4"
                  onClick={() => {
                    setUser((prev) => ({ ...prev, coins: prev.coins + trophy.prize }));
                    window.Telegram.WebApp.showAlert(
                      `Congratulations! You've claimed the ${trophy.name} trophy and earned ${formatNumber(trophy.prize)} coins!`
                    );
                    playHeaderFooterSound();
                  }}
                >
                  <Image
                    src="/claim-icon.svg"
                    alt="Claim Prize"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  Claim
                </Button>
              ) : (
                <div className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-full text-xs font-bold">
                  Locked
                </div>
              )}
            </CardContent>
          </NeonGradientCard>
        </div>
      ))}
    </div>
  );

  const showPopup = (popupType: string) => {
    if (!shownPopups.has(popupType)) {
      setShownPopups((prev) => new Set(prev).add(popupType));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-black opacity-50"></div>
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  animation: `twinkle ${Math.random() * 5 + 3}s infinite`,
                }}
              ></div>
            ))}
          </div>
        </div>
        <div className="text-center z-10">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-iTiljsrx8N2IGIdjozA2tXBHhaCi8x.png"
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto mb-8"
          />
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-pulse"
              style={{ width: '100%' }}
            />
          </div>
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-m" onClick={onClose}></div>
      <div className="bg-gradient-to-br from-gray-900/90 to-black/90 text-white p-8 rounded-3xl shadow-2xl z-10 max-w-md w-full mx-4 border border-gray-700/50 backdrop-blur-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">{title}</h2>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );

  const CongratulationPopup = () => (
    <Popup
      title="Congratulations!"
      onClose={() => {
        setCongratulationPopup({ show: false, item: null });
        showPopup('congratulation');
      }}
    >
      <p className="mb-6 text-xl text-center text-white">
        You've purchased <span className="font-bold">{congratulationPopup.item?.name}</span>!
      </p>
      <p className="mb-6 text-center text-white">This will boost your crypto earnings!</p>
      <Button
        onClick={() => {
          setCongratulationPopup({ show: false, item: null });
          showPopup('congratulation');
        }}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 rounded-full text-lg font-bold flex items-center justify-center hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
      >
        <CheckCircle className="w-6 h-6 mr-2" />
        Awesome!
      </Button>
    </Popup>
  );

  return (
    <div
      className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col"
      style={{ maxWidth: '100vw', maxHeight: '100vh' }}
    >
      <style>{styles}</style>
      <StarryBackground />
      {renderHeader()}
      <div className="flex-grow overflow-y-auto pb-20">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'shop' && renderShop()}
        {currentPage === 'tasks' && renderTasks()}
        {currentPage === 'rating' && renderRating()}
        {currentPage === 'wallet' && renderWallet()}
        {currentPage === 'invite' && renderInvite()}
        {currentPage === 'friendsActivity' && renderFriendsActivity()}
        {currentPage === 'levels' && renderLevels()}
        {currentPage === 'settings' && renderSettings()}
        {currentPage === 'dailyReward' && renderDailyReward()}
        {currentPage === 'trophies' && renderTrophies()}
      </div>
      {renderFooter()}

      {/* Popup logic */}
      {!shownPopups.has('pph') && showPPHPopup && (
        <Popup
          title="Profit Accumulated!"
          onClose={() => {
            setShowPPHPopup(false);
            showPopup('pph');
          }}
        >
          <p className="mb-6 text-xl text-center text-white">
            You've accumulated <span className="font-bold">{formatNumber(pphAccumulated)}</span>{' '}
            coins!
          </p>
          <Button
            onClick={() => {
              claimPPH();
              showPopup('pph');
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
          >
            <Coins className="w-5 h-5 mr-2" />
            Claim Profits
          </Button>
        </Popup>
      )}

      {!shownPopups.has('levelUp') && showLevelUpPopup && (
        <Popup
          title="Level Up!"
          onClose={() => {
            setShowLevelUpPopup(false);
            showPopup('levelUp');
          }}
        >
          <p className="mb-6 text-xl text-center text-white">
            Congratulations! You've reached <span className="font-bold">Level {newLevel}</span>!
          </p>
          <Button
            onClick={() => {
              claimNewLevel();
              showPopup('levelUp');
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
          >
            <Star className="w-5 h-5 mr-2" />
            Claim Rewards
          </Button>
        </Popup>
      )}

      {!shownPopups.has('congratulation') && congratulationPopup.show && <CongratulationPopup />}
    </div>
  );
};

export default CryptoGame;
