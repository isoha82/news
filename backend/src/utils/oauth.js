async function verifyOAuthToken(provider, idToken) {
  switch (provider) {
    case 'google':
      return verifyGoogle(idToken);
    case 'apple':
      return verifyApple(idToken);
    case 'kakao':
      return verifyKakao(idToken);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function verifyGoogle(idToken) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!res.ok) throw new Error('Invalid Google id_token');
  const data = await res.json();
  if (!data.sub) throw new Error('Invalid Google id_token');
  return {
    provider_id: data.sub,
    email: data.email,
    name: data.name,
    avatar_url: data.picture || null,
  };
}

async function verifyApple(idToken) {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid Apple id_token format');
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (!payload.sub) throw new Error('Invalid Apple id_token');
    return {
      provider_id: payload.sub,
      email: payload.email || null,
      name: payload.email?.split('@')[0] || 'Apple User',
      avatar_url: null,
    };
  } catch {
    throw new Error('Invalid Apple id_token');
  }
}

async function verifyKakao(accessToken) {
  const res = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Invalid Kakao access_token');
  const data = await res.json();
  if (!data.id) throw new Error('Invalid Kakao access_token');
  return {
    provider_id: String(data.id),
    email: data.kakao_account?.email || null,
    name: data.properties?.nickname || data.kakao_account?.profile?.nickname || 'Kakao User',
    avatar_url: data.properties?.profile_image || null,
  };
}

module.exports = { verifyOAuthToken };
