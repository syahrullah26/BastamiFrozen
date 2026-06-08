FROM php:8.2-fpm-alpine

RUN apk add --no-cache nginx supervisor curl libpng-dev libxml2-dev zip unzip git mysql-client
RUN docker-php-ext-install pdo pdo_mysql bcmath gd

WORKDIR /var/www

COPY . .

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]