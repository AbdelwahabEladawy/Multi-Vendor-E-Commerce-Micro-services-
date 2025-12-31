# Multi-Vendor E-Commerce Microservices

مشروع E-Commerce متعدد البائعين مبني على Microservices Architecture باستخدام Nx Monorepo.

## 📋 نظرة عامة

المشروع يتكون من:
- **API Gateway** (Port 8080): نقطة الدخول الرئيسية لجميع الطلبات
- **Auth Service** (Port 6001): خدمة المصادقة وإدارة المستخدمين

## 🔧 المشاكل التي تم حلها والإصلاحات

### 1. مشاكل الإعدادات الأساسية (Configuration Issues)

#### المشكلة:
- خطأ في `nx.json`: استخدام plugin غير موجود `@nx/js/next`
- تكرار في `workspaces` في `package.json`
- ملف `prisma.config.ts` غير صحيح

#### الإصلاح:
- ✅ إزالة `@nx/js/next` plugin من `nx.json`
- ✅ تنظيف `workspaces` في `package.json` ليشمل فقط `apps/*`
- ✅ حذف `prisma.config.ts` غير المطلوب
- ✅ إضافة `@prisma/client` و `prisma` packages
- ✅ إضافة `swagger-autogen` package

### 2. مشاكل المسارات والـ Imports (Path Issues)

#### المشكلة:
- مسار خاطئ في `sendEmail/index.ts`: `auths-service` بدلاً من `auth-service`
- عدم وجود `dotenv/config` في الملفات الرئيسية
- `tsconfig.app.json` لا يشمل مجلد `packages`

#### الإصلاح:
- ✅ تصحيح مسار template: `apps/auth-service/src/utils/EmailTemplates`
- ✅ إضافة `import 'dotenv/config'` في جميع الملفات الرئيسية
- ✅ تحديث `tsconfig.app.json` ليشمل `../../packages/**/*.ts`
- ✅ إزالة import غير مستخدم `localsName` من ejs

### 3. مشاكل Redis Configuration

#### المشكلة:
- استخدام متغيرات خاطئة: `UPSTASH_REDIS_REST_URL` بدلاً من `REDIS_HOST`
- عدم دعم Upstash Redis مع TLS

#### الإصلاح:
- ✅ تحديث `packages/libs/redis/index.ts` لدعم Upstash Redis
- ✅ إضافة TLS configuration للـ Upstash
- ✅ إضافة error handling و connection logging
- ✅ استخراج host من `UPSTASH_REDIS_REST_URL` تلقائياً

### 4. مشاكل TypeScript و Build Configuration

#### المشكلة:
- خطأ في `rootDir` في `tsconfig.app.json` لـ api-gateway
- استخدام executor خاطئ: `@nx/node:build` غير موجود
- عدم وجود `project.json` لـ api-gateway

#### الإصلاح:
- ✅ تغيير `rootDir` من `"src"` إلى `"../../"` في api-gateway
- ✅ تغيير build executor إلى `@nx/webpack:webpack`
- ✅ إنشاء `project.json` لـ api-gateway
- ✅ إضافة `@types/nodemailer` و `@types/ejs`

### 5. مشاكل Webpack Output Path

#### المشكلة:
- webpack يبني الملفات في `apps/auth-service/dist/` بدلاً من `dist/apps/auth-service/`
- serve executor لا يجد الملفات المبنية

#### الإصلاح:
- ✅ تحديث `webpack.config.js` لبناء في `dist/apps/[project-name]/`
- ✅ إضافة `filename: 'main.js'` بشكل صريح في webpack output

### 6. مشاكل Prisma Schema

#### المشكلة:
- `datasource db` لا يحتوي على `url` field

#### الإصلاح:
- ✅ إضافة `url = env("DATABASE_URL")` في `prisma/schema.prisma`
- ✅ تشغيل `npx prisma generate` بنجاح

### 7. مشاكل Email Configuration

#### المشكلة:
- خطأ إملائي: `stmp.gmail.com` بدلاً من `smtp.gmail.com`
- عدم وجود `secure` option للمنفذ 465

#### الإصلاح:
- ✅ إضافة `secure: true` للمنفذ 465 (SSL)
- ✅ إضافة TLS options في nodemailer config

### 8. مشاكل Express HTTP Proxy (WebSocket Error)

#### المشكلة:
- رسالة خطأ: "WebSockets request was expected" عند الوصول للـ routes
- proxy يحاول التعامل مع طلبات HTTP كـ WebSocket

#### الإصلاح:
- ✅ إضافة `proxyReqOptDecorator` لإزالة WebSocket headers
- ✅ إضافة `filter` function للتحقق من نوع الطلب
- ✅ إضافة `proxyErrorHandler` لمعالجة الأخطاء
- ✅ تحديث CORS settings للسماح بجميع الـ origins في development

### 9. مشاكل Error Handling

#### المشكلة:
- TypeScript error: `Property 'details' does not exist on type 'Error'`
- import path خاطئ في `error.middleware.ts`

#### الإصلاح:
- ✅ استخدام type assertion `as AppError` في error middleware
- ✅ تصحيح import path من `"../"` إلى `"./index"`

### 10. مشاكل Middleware Order

#### المشكلة:
- ترتيب خاطئ للـ middlewares يسبب 400 Bad Request
- عدم وجود 404 handler

#### الإصلاح:
- ✅ إعادة ترتيب middlewares: CORS أولاً، ثم body parsers، ثم routes
- ✅ إضافة 404 handler قبل error middleware
- ✅ تحسين error logging

### 11. مشاكل Serve Configuration

#### المشكلة:
- serve executor لا يكمل التشغيل
- routes لا تعمل

#### الإصلاح:
- ✅ تبسيط serve configuration
- ✅ إزالة `host` و `port` من serve options (يتم التعامل معها في الكود)
- ✅ إضافة `inspect: false` لتجنب مشاكل debugging

## 📁 هيكل المشروع

```
Multi-Vendor-E-Commerce-Micro-services/
├── apps/
│   ├── api-gateway/          # API Gateway Service (Port 8080)
│   │   ├── src/
│   │   │   └── main.ts
│   │   ├── project.json
│   │   └── webpack.config.js
│   └── auth-service/         # Authentication Service (Port 6001)
│       ├── src/
│       │   ├── controller/
│       │   ├── routes/
│       │   ├── utils/
│       │   └── main.ts
│       ├── project.json
│       └── webpack.config.js
├── packages/
│   ├── error-handler/        # Error handling utilities
│   ├── libs/
│   │   ├── prisma/          # Prisma client
│   │   └── redis/           # Redis client
├── prisma/
│   └── schema.prisma        # Database schema
├── .env                     # Environment variables
├── package.json
└── nx.json
```

## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js (v20+)
- npm أو yarn
- MongoDB (Cloud أو Local)
- Redis (Upstash أو Local)

### التثبيت

```bash
# تثبيت dependencies
npm install

# إنشاء Prisma Client
npx prisma generate
```

### إعداد Environment Variables

أنشئ ملف `.env` في root المشروع:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
REDIS_PASSWORD="your-password"

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Server Ports
PORT=8080
AUTH_SERVICE_PORT=6001

# Environment
NODE_ENV=development
```

### التشغيل

```bash
# تشغيل جميع الخدمات
npm run dev

# أو تشغيل كل خدمة بشكل منفصل
npx nx serve auth-service    # Port 6001
npx nx serve api-gateway      # Port 8080
```

## 📡 API Endpoints

### API Gateway (Port 8080)

- `GET /` - رسالة ترحيبية
- `GET /gateway-health` - Health check
- `GET /api/*` - يتم توجيهه إلى auth-service

### Auth Service (Port 6001)

- `GET /` - رسالة ترحيبية
- `GET /api-docs` - Swagger documentation
- `POST /api/user-registration` - تسجيل مستخدم جديد

## 🛠️ الأوامر المتاحة

```bash
# Build
npx nx build auth-service
npx nx build api-gateway

# Serve
npx nx serve auth-service
npx nx serve api-gateway

# Run all services
npm run dev

# Type checking
npx nx typecheck auth-service
npx nx typecheck api-gateway
```

## 📝 ملاحظات مهمة

1. **Redis Connection**: المشروع يدعم Upstash Redis مع TLS تلقائياً
2. **Email Service**: يستخدم Gmail SMTP مع App Password
3. **Database**: يستخدم MongoDB Atlas أو Local MongoDB
4. **CORS**: في development mode، يسمح بجميع الـ origins

## 🔍 Troubleshooting

### المشكلة: "Could not find main.js"
**الحل**: تأكد من تشغيل `npx nx build [project-name]` أولاً

### المشكلة: "Redis connection error"
**الحل**: تحقق من `UPSTASH_REDIS_REST_URL` و `REDIS_PASSWORD` في `.env`

### المشكلة: "WebSockets request was expected"
**الحل**: تم إصلاحها في proxy configuration - تأكد من استخدام آخر version

### المشكلة: "Port already in use"
**الحل**: تأكد من إغلاق أي processes تستخدم المنافذ 6001 أو 8080

## 📚 التقنيات المستخدمة

- **Nx**: Monorepo tooling
- **Express**: Web framework
- **TypeScript**: Programming language
- **Prisma**: ORM for MongoDB
- **Redis (ioredis)**: Caching and session management
- **Nodemailer**: Email service
- **Swagger**: API documentation
- **Webpack**: Module bundler

## 👥 المساهمون

تم تطوير هذا المشروع كجزء من نظام E-Commerce متعدد البائعين.

## 📄 الرخصة

MIT License

---

**آخر تحديث**: تم إصلاح جميع المشاكل والتأكد من عمل جميع الخدمات بشكل صحيح ✅
