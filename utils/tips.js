const tips = [
  {
    id: 'streaming_resolution',
    type: 'web',
    title: {
      'en': 'Video streaming - reduce resolution',
      'fr': 'Streaming vidéo - réduire la résolution'
    },
    domains: ['youtube', 'tiktok', 'twitch', 'netflix', 'vimeo', 'dailymotion','ted'],
    notificationIntroHTML: {
      'en': 'You downloaded <b>{data}</b> on streaming platforms like {domains} this month. Did you try <b>reducing the resolution of video</b>?',
      'fr': 'Vous avez téléchargé <b>{data}</b> sur des plateformes de streaming video comme {domains} ce mois. Avez-vous essayé de <b>réduire la résolution des vidéos</b>'
    },
    detailsHTML: {
      'en': 'While streaming video, <b>reducing the video resolution</b> can save a lot of bandwidth and reduce your impact. Around 80% of internet data usage is due to videos. Switching from HD resolution to 480p can divide by up to 4 the impact of video streaming.',
      'fr': 'Lors du visionnage de vidéos en ligne, vous pouvez économiser beaucoup de données et réduire votre impact en <b>limitant la résolution de la vidéo</b>. Les vidéos en ligne représentent environ 80% de la bande passante globale d\'internet. Passer d\'une résolution HD à 480p peut diviser jusqu\'à 4 votre impact.</b>'
    }
  },
  {
    id: 'social_networks',
    type: 'web',
    title: {
      'en': 'Social networks - deactivate video auto play',
      'fr': 'Réseaux sociaux - désactiver la lecture automatique des vidéos'
    },
    domains: ['facebook', 'twitter', 'instagram', 'linkedin'],
    notificationIntroHTML: {
      'en': 'You downloaded <b>{data}</b> on social networks like {domains} this month. Did you try <b>disabling autoplay of videos</b>.',
      'fr': 'Vous avez téléchargé <b>{data}</b> sur des réseaux sociaux comme {domains} ce mois.Avez-vous essayé de <b>désactiver la lecture automatique des vidéso</b>'
    },
    detailsHTML: {
      'en': 'Autoplay of videos on social networks can generate a lot of data even though you are not really watching the content. Most social networks allow to <b>deactivate autoplay</b>. You can configure that option to save a lot of bandwidth on the web version but also on your smartphone applications. You can for instance follow these <a href="https://www.theverge.com/21422932/autoplay-videos-how-to-facebook-twitter-reddit-chrome-safari-edge-firefox">instructions</a>.',
      'fr': 'La lecture automatique des vidéos sur les réseaux sociaux peut générer de grande quantité de données même si vous ne regardez pas le contenu. La plupart des réseaux sociaux permettent de <b>désactiver la lecture automatique des vidéos</b>. Vous pouvez configurer cette option pour économiser beaucoup de données sur la version web mais aussi sur vos applications mobiles. Vous pouvez par exemple suivre ces <a href="https://www.google.ch/search?q=d%C3%A9sactiver+lecture+automatique+vid%C3%A9os+facebook+twitter+instagram">instructions</a>.'
    }
  },
  {
    id: 'adblocker',
    type: 'web',
    title: {
      'en': 'Install an Ad blocker',
      'fr': 'Installer un bloqueur de publicités'
    },
    notificationIntroHTML: {
      'en': '',
      'fr': ''
    },
    detailsHTML: {
      'en': 'On some websites, advertising may require a lot of data. You can install an <b>ad blocker extension</b> on your browser to block advertisings and save data. You can for instance install the open source extension <a href="https://ublockorigin.com/">uBlock Origin</a>.',
      'fr': 'Sur certains sites web, les publicités peuvent nécessiter de grandes quantités de données. Vous pouvez installer une <b>extension bloqueur de publicité</b> dans votre navigateur pour bloquer les publicités et économiser des données. Vous pouvez par exemple installer l\'extension open source <a href="https://ublockorigin.com/">uBlock Origin</a>. '
    }
  },
  {
    id: 'lifetime',
    type: 'device',
    title: {
      'en': 'Devices lifetime - keep your devices longer',
      'fr': 'Durée de vie appareils - garder vos appareils plus longtemps'
    },
    domains: [''],
    notificationIntroHTML: {
      'en': '',
      'fr': ''
    },
    detailsHTML: {
      'en': 'Almost 80% of the environmental impact of digital activities comes from user device manufacturing. The most efficient way to reduce your impact is thus to <b>keep your devices (laptop, smartphone, desktop, etc.) longer</b>.',
      'fr': 'près de 80% de l\'impact environnemental du numérique provient de la production des terminaux utilisateurs. La façon la plus efficace de réduire votre impact est donc de <b>garder vos appareils (ordinateur portable, smartphone, etc.) plus longtemps</b>.'
    }
  },
  {
    id: 'repair',
    type: 'device',
    title: {
      'en': 'Device - repair your device whenever possible',
      'fr': 'Appareils - réparer vos appareils si possible'
    },
    domains: [''],
    notificationIntroHTML: {
      'en': '',
      'fr': 'La majorité de votre impact provient de l\'énergie et des ressources nécessaires pour fabriquer vos appareils. Pensez à réparer votre appareil plutôt que d\en acheter un nouveau. Lors de l\'achat d\'un nouvel appareil, pensez à vérifier son <a href="https://www.indicereparabilite.fr/appareils/multimedia/smartphone/?orderby=price-desc">indice de réparabilité</a>.'
    },
    detailsHTML: {
      'en': 'The majority of your impact comes from the energy and ressources needed to build your devices. Consider repairing your device instead of buying a new one. When buying a new device you can check how easy it will be to repair.',
      'fr': 'La majorité de votre impact provient de l\'énergie et des ressources nécessaires pour fabriquer vos appareils. Pensez à réparer votre appareil plutôt que d\en acheter un nouveau. Lors de l\'achat d\'un nouvel appareil, pensez à vérifier son <a href="https://www.indicereparabilite.fr/appareils/multimedia/smartphone/?orderby=price-desc">indice de réparabilité</a>.'
    }
  },
  {
    id: 'wifi',
    type: 'device',
    title: {
      'en': 'Connection - prefer Wifi',
      'fr': 'Connexion - privilégier le Wifi'
    },
    domains: [''],
    notificationIntroHTML: {
      'en': '',
      'fr': ''
    },
    detailsHTML: {
      'en': 'When possible, connect to Wifi instead of mobile network. Wifi needs less energy than mobile networks.',
      'fr': 'Quand cela est possible, connectez-vous au Wifi plutôlt qu\'au réseau mobile. Le Wifi nécessite moins d\'énergie qu\'une connexion mobile.'
    }
  },
  {
    id: 'renewable_ernegy',
    type: 'other',
    title: {
      'en': 'Electricity - prefer renewable energy',
      'fr': 'Électricité - privilégier les énergies renouvelables'
    },
    domains: [''],
    notificationIntroHTML: {
      'en': '',
      'fr': ''
    },
    detailsHTML: {
      'en': 'Although the usage of your device is less impacting than the manufacturing, you can reduce its impact by switching to electricity from renewable sources.',
      'fr': 'Bien que l\'usage de votre appareil représente moins d\'impact que sa fabrication, vous pouvez réduire celui-ci en utilisant de l\'électricité d\'origine renouvelable.'
    }
  },
  {
    id: 'go_outside',
    type: 'other',
    title: {
      'en': 'Take a break',
      'fr': 'Prendre une pause'
    },
    domains: [''],
    notificationIntroHTML: {
      'en': '',
      'fr': ''
    },
    detailsHTML: {
      'en': 'What best to reduce your impact than taking a short break from time to time? You can go for a walk, read a book, etc.. Good for the body, the mind and the planet!',
      'fr': 'Quoi de mieux pour réduire votre impact que de faire une petite pause de temps en temps ? Vous pouvez vous promener, lire un livre, etc.. C\'est bon pour le corps, l\'esprit et la planète !'
    }
  }
]

export { tips }
