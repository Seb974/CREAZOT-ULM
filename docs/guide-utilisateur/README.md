# C6L - Guide Utilisateur

## Présentation

Guide utilisateur interactif pour **C6L** (Planetair Gestion 4.0).  
Site statique HTML hébergé sur le VPS OVH.

**URL :** https://creazot.com/

## Structure

```
docs/guide-utilisateur/
├── index.html          ← Guide HTML (13 pages)
├── screenshots/        ← Captures d'écran (22 images)
├── deploy.sh           ← Script de déploiement
└── README.md           ← Ce fichier
```

## Pages du guide

| # | Section |
|---|---------|
| 1 | Couverture C6L |
| 2 | 6 Atouts |
| 3 | Sommaire interactif |
| 4 | Connexion & Interface |
| 5 | Tableau de Bord (METAR, Windy, M&Radar) |
| 6 | Réservations |
| 7 | Prépaiements & Bons Cadeaux |
| 8 | Paiements |
| 9 | Carnets de Vols |
| 10 | Passagers |
| 11 | Flotte & Maintenance |
| 12 | Pilotes |
| 13 | Administration |

## Hébergement

| Paramètre | Valeur |
|-----------|--------|
| VPS | 104.248.141.236 (OVH) |
| Utilisateur | root |
| Chemin serveur | `/var/www/docs-c6l/` |
| Serveur web | Nginx |
| SSL | Let's Encrypt (certbot) |
| Config Nginx | `/etc/nginx/sites-available/creazot.com` |

## Déployer une mise à jour

```bash
chmod +x deploy.sh
./deploy.sh
```

Ou manuellement :

```bash
rsync -avz --delete \
  -e ssh \
  docs/guide-utilisateur/ \
  root@104.248.141.236:/var/www/docs-c6l/ \
  --exclude='deploy.sh' \
  --exclude='README.md'

ssh root@104.248.141.236 "systemctl reload nginx"
```

## Config Nginx (sauvegarde)

```nginx
server {
    listen 80;
    server_name creazot.com www.creazot.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name creazot.com www.creazot.com;

    ssl_certificate /etc/letsencrypt/live/creazot.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/creazot.com/privkey.pem;

    root /var/www/docs-c6l;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(png|jpg|jpeg|gif|ico|svg|css|js|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
}
```

## TODO

- [ ] Ajouter capture Caméras (screenshots/21-dashboard-cams.png)
- [ ] Peaufiner les autres sections (Réservations, Flotte, Pilotes...)
- [ ] Ajouter navigation inter-pages (boutons Précédent/Suivant)
