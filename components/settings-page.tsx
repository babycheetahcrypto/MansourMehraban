'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useSettings } from './contexts/SettingsContext';

interface SettingsPageProps {
  backgroundMusicAudio: HTMLAudioElement | null;
}

const settingsConfig = [
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
];

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

const SettingsPage: React.FC<SettingsPageProps> = ({ backgroundMusicAudio }) => {
  const { settings, updateSettings } = useSettings();

  const handleSettingChange = (settingKey: keyof typeof settings, value: boolean) => {
    updateSettings({ [settingKey]: value });

    if (settingKey === 'backgroundMusic' && backgroundMusicAudio) {
      if (value) {
        backgroundMusicAudio.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
        backgroundMusicAudio.loop = true;
      } else {
        backgroundMusicAudio.pause();
        backgroundMusicAudio.currentTime = 0;
      }
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-6">
      <NeonGradientCard className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="relative p-6 pb-2">
          <CardTitle className="z-10 text-3xl text-center text-white font-bold">Settings</CardTitle>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform -skew-y-3"></div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {settingsConfig.map(({ id, icon, label, description }) => (
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
                checked={settings[id as keyof typeof settings]}
                onCheckedChange={(checked) => {
                  handleSettingChange(id as keyof typeof settings, checked);
                }}
                className="data-[state=checked]:bg-green-400 data-[state=unchecked]:bg-gray-600"
              />
            </div>
          ))}
        </CardContent>
      </NeonGradientCard>
    </div>
  );
};

export default SettingsPage;

