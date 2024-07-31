# Використовуємо офіційний образ Node.js 18 в якості базового образу
FROM node:18

# Встановлюємо папку роботи всередині контейнера
WORKDIR /app

# Копіюємо package.json та yarn.lock в робочу директорію
COPY package.json yarn.lock ./

# Встановлюємо залежності
RUN yarn install

# Копіюємо решту коду додатку в робочу директорію
COPY . .

# Генеруємо Prisma Client
RUN yarn prisma generate

# Копіюємо wait-for-it.sh в контейнер
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Будуємо додаток Next.js
RUN yarn build

# Викладаємо порт, на якому працює додаток
EXPOSE 3000

# Команда для запуску додатку з очікуванням доступності бази даних
CMD /wait-for-it.sh db:5432 -- yarn start
