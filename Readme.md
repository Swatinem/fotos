# Fotos.js

```bash
npm install
```

A small photo gallery using express

# Using

If using nginx, you can use the following config to serve raw files using nginx
and everything else using node

```
server {
	location ~ ^/raw/(.+)$ {
		root /var/www/fotos;
		try_files /$1 $uri;
	}
	location / {
		proxy_pass http://localhost:3001;
		include proxy_params;
	}
}
```
However, nginx 1.1.9 (the version in Ubuntu precise) is bugged
(See http://trac.nginx.org/nginx/ticket/152) so you might need to use a PPA on
Ubuntu.

Then start your node.js server
```bash
NODE_ENV=production PORT=3001 RAW=/var/www/fotos node app.js
#or when using forever:
NODE_ENV=production PORT=3001 RAW=/var/www/fotos forever start fotos/app.js
```

# TODO

* Modularize frontend using `component`
* Support subdirectories
* Thumbnail generation
  * Preload prev/next images in the frontend
