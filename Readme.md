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
		try_files /$1 @node;
	}
	location ~ ^/thumb/(.+)$ {
		root /var/www/thumbs;
		try_files /$1 @node;
	}
	location / {
		proxy_pass http://localhost:3001;
		include proxy_params;
	}
	location @node {
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

* Zoom out should return to the current picture, not the one which was zoomed in on
* Cache the directory content so we don’t need to read the metadata all the time.
  * use `fs.watchFile` to catch file changes or additions
  * clear a files thumbnails if the file changed
  * figure out how to better read the metadata, maybe use `exif` instead of `imagemagick` for that
* Modularize frontend using `component`
  * figure out what to do with `dateFormat`
* Support subdirectories
* Preload prev/next images in the frontend
* fix aspect ratio for wide images

