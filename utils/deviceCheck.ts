export const isMobile = () => {
  if (typeof window !== 'undefined') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Samsung|Nokia|Sony|HTC|LG|Motorola|Huawei|Xiaomi|OnePlus|Google Pixel|Realme|Oppo|Vivo|ZTE|Lenovo|Asus|TCL|Alcatel|Micromax|Infinix|Tecno|Honor|Razer Phone|Kindle|Fire|Surface/i.test(
      navigator.userAgent
    );
  }
  return false;
};
