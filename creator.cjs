const copy = {
  en: {
    label: 'English',
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
    label: 'Македонски',
    name: 'Стефан Иванов',
    role: 'Дизајн и изработка',
    bio: 'Јас сум програмер од Македонија. Правам игри и веб-алатки, меѓу кои се Oddburn и Рима, речник на рими за македонскиот јазик.',
    game: 'Кога ја осмислував Oddburn, тргнав од едно прашање: колку далеку ќе одлеташ ако дадеш одговор што никому друг не му текнал?',
    portfolio: 'Мое портфолио',
    rima: 'Разгледај ја Рима',
    back: 'Назад кон Oddburn',
    language: 'Јазик на страницата',
    alt: 'Радиотелескопот на поларната опсерваторија од Oddburn под зелена поларна светлина.'
  },
  ...require('./creator-translations.json')
};

const languages = Object.keys(copy);
const languagePath = code => code === 'en' ? '/creator/' : `/creator/${code}/`;

function creatorPage(lang) {
  const t = copy[lang];
  const links = languages.map(code => {
    return `<a href="${languagePath(code)}" lang="${code}" hreflang="${code}"${code === lang ? ' aria-current="page"' : ''}>${copy[code].label}</a>`;
  }).join('');
  const alternates = languages.map(code => `<link rel="alternate" hreflang="${code}" href="${languagePath(code)}">`).join('\n');
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#071225">
<title>${t.name} · Oddburn</title>
<meta name="description" content="${t.bio}">
${alternates}
<link rel="alternate" hreflang="x-default" href="/creator/">
<link rel="stylesheet" href="/creator/creator.css">
</head>
<body>
<header><a class="back" href="/">← ${t.back}</a>
  <details class="languages"><summary aria-label="${t.language} · ${t.label}">${t.label}</summary><nav aria-label="${t.language}">${links}</nav></details>
</header>
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
}

module.exports = {creatorPage, languages};
