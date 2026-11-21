const copy = {
  en: {
    name: 'Stefan Ivanov',
    role: 'Design and development',
    bio: 'I’m a developer from Macedonia. I build games and web tools, including Oddburn and Rima, a rhyming dictionary for Macedonian.',
    game: 'I designed and built Oddburn around one question: how far could you fly on the answer nobody else thinks of?',
    portfolio: 'My portfolio',
    rima: 'Explore Rima',
    back: 'Back to Oddburn',
    language: 'Page language',
    alt: 'The radio telescope at Oddburn’s polar observatory beneath a green aurora.'
  },
  mk: {
    name: 'Стефан Иванов',
    role: 'Дизајн и изработка',
    bio: 'Јас сум програмер од Македонија. Правам игри и веб-алатки, меѓу кои се Oddburn и Рима, речник на рими за македонскиот јазик.',
    game: 'Кога ја осмислував Oddburn, тргнав од едно прашање: колку далеку ќе одлеташ ако дадеш одговор што никому друг не му текнал?',
    portfolio: 'Мое портфолио',
    rima: 'Разгледај ја Рима',
    back: 'Назад кон Oddburn',
    language: 'Јазик на страницата',
    alt: 'Радиотелескопот на поларната опсерваторија од Oddburn под зелена поларна светлина.'
  }
};

module.exports = function creatorPage(lang) {
  const t = copy[lang];
  const links = Object.entries({en: 'English', mk: 'Македонски'}).map(([code, label]) => {
    const href = code === 'en' ? '/creator/' : '/creator/mk/';
    return `<a href="${href}" lang="${code}" hreflang="${code}"${code === lang ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#071225">
<title>${t.name} · Oddburn</title>
<meta name="description" content="${t.bio}">
<link rel="alternate" hreflang="en" href="/creator/">
<link rel="alternate" hreflang="mk" href="/creator/mk/">
<link rel="stylesheet" href="/creator/creator.css">
</head>
<body>
<header><a class="back" href="/">← ${t.back}</a><nav aria-label="${t.language}">${links}</nav></header>
<main>
  <div class="profile">
    <p class="role">${t.role}</p>
    <h1>${t.name}</h1>
    <p>${t.bio}</p>
    <p>${t.game}</p>
    <div class="work"><a href="https://stefanxmiami.com/" rel="me">${t.portfolio} ↗</a><a href="https://rima.mk/">${t.rima} ↗</a></div>
  </div>
  <img class="station" src="/creator/station.png" width="960" height="540" alt="${t.alt}">
</main>
</body>
</html>`;
};
