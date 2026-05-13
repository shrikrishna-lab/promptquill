import axios from 'axios';

function getFlagEmoji(cc) {
  if (!cc) return '🌍';
  return String.fromCodePoint(...cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)));
}

export const getCountryFromIP = async (ip) => {
  try {
    if (!ip || ip === '127.0.0.1' || ip === '::1') return { country: 'Localhost', flag: '💻', full: 'Localhost 💻' };
    const { data } = await axios.get('http://ip-api.com/json/' + ip + '?fields=status,country,countryCode');
    if (data.status === 'success') {
      const flag = getFlagEmoji(data.countryCode);
      return { country: data.country, flag, full: data.country + ' ' + flag };
    }
    return { country: 'Unknown', flag: '🌍', full: 'Unknown 🌍' };
  } catch {
    return { country: 'Unknown', flag: '🌍', full: 'Unknown 🌍' };
  }
};
